import https from 'https';
import { readFile } from 'fs/promises';

const SERVICE_ACCOUNT_PATH = '/var/run/secrets/kubernetes.io/serviceaccount';
const DEFAULT_TIMEOUT_MS = 10000;
const DEFAULT_TAIL_LINES = 200;
const MAX_TAIL_LINES = 2000;

export class K8sConfigError extends Error {
    constructor(message) {
        super(message);
        this.name = 'K8sConfigError';
    }
}

export class K8sApiError extends Error {
    constructor(message, statusCode, responseBody) {
        super(message);
        this.name = 'K8sApiError';
        this.statusCode = statusCode;
        this.responseBody = responseBody;
    }
}

export class K8sNotFoundError extends Error {
    constructor(message) {
        super(message);
        this.name = 'K8sNotFoundError';
    }
}

async function readOptionalFile(path) {
    try {
        return await readFile(path, 'utf8');
    } catch {
        return '';
    }
}

function clampInteger(value, fallback, min, max) {
    const parsed = Number.parseInt(value, 10);
    if (!Number.isFinite(parsed)) {
        return fallback;
    }
    return Math.min(Math.max(parsed, min), max);
}

async function getK8sConfig(namespaceOverride) {
    const host = process.env.KUBERNETES_SERVICE_HOST || process.env.K8S_API_HOST;
    const port = process.env.KUBERNETES_SERVICE_PORT_HTTPS || process.env.KUBERNETES_SERVICE_PORT || process.env.K8S_API_PORT || '443';
    const token = process.env.K8S_BEARER_TOKEN || (await readOptionalFile(`${SERVICE_ACCOUNT_PATH}/token`)).trim();
    const serviceAccountNamespace = (await readOptionalFile(`${SERVICE_ACCOUNT_PATH}/namespace`)).trim();
    const namespace = namespaceOverride
        || process.env.K8S_LOG_NAMESPACE
        || process.env.K8S_NAMESPACE
        || serviceAccountNamespace
        || 'default';
    const ca = process.env.K8S_CA_CERT || (await readOptionalFile(`${SERVICE_ACCOUNT_PATH}/ca.crt`));

    if (!host || !token) {
        throw new K8sConfigError('当前环境缺少 Kubernetes 集群内访问配置');
    }

    return {
        host,
        port,
        token,
        namespace,
        ca: ca || undefined,
        rejectUnauthorized: process.env.K8S_SKIP_TLS_VERIFY !== 'true',
    };
}

function encodePathSegment(value) {
    return encodeURIComponent(value);
}

function toHelmFullname(value) {
    return String(value).slice(0, 63).replace(/-+$/g, '');
}

async function requestK8s(path, { namespace, responseType = 'json' } = {}) {
    const config = await getK8sConfig(namespace);

    return new Promise((resolve, reject) => {
        const req = https.request({
            hostname: config.host,
            port: config.port,
            path,
            method: 'GET',
            ca: config.ca,
            rejectUnauthorized: config.rejectUnauthorized,
            timeout: DEFAULT_TIMEOUT_MS,
            headers: {
                Authorization: `Bearer ${config.token}`,
                Accept: responseType === 'json' ? 'application/json' : '*/*',
            },
        }, (res) => {
            let body = '';

            res.setEncoding('utf8');
            res.on('data', (chunk) => {
                body += chunk;
            });
            res.on('end', () => {
                if (!res.statusCode || res.statusCode < 200 || res.statusCode >= 300) {
                    reject(new K8sApiError('Kubernetes API 请求失败', res.statusCode || 500, body));
                    return;
                }

                if (responseType === 'text') {
                    resolve(body);
                    return;
                }

                try {
                    resolve(JSON.parse(body));
                } catch (error) {
                    reject(new K8sApiError(`Kubernetes API 返回了无效 JSON: ${error.message}`, res.statusCode, body));
                }
            });
        });

        req.on('timeout', () => {
            req.destroy(new K8sApiError('Kubernetes API 请求超时', 504, ''));
        });
        req.on('error', reject);
        req.end();
    });
}

function getPodCreatedAt(pod) {
    return new Date(pod?.metadata?.creationTimestamp || 0).getTime();
}

function isPodReady(pod) {
    return pod?.status?.conditions?.some((condition) => condition.type === 'Ready' && condition.status === 'True');
}

function scorePod(pod) {
    const phase = pod?.status?.phase;
    let score = 0;

    if (phase === 'Running') score += 100;
    if (phase === 'Pending') score += 40;
    if (phase === 'Succeeded') score += 20;
    if (phase === 'Failed') score += 10;
    if (isPodReady(pod)) score += 30;
    if (pod?.metadata?.deletionTimestamp) score -= 100;

    return score;
}

function selectPod(pods) {
    if (!pods.length) {
        return null;
    }

    return [...pods].sort((a, b) => {
        const scoreDiff = scorePod(b) - scorePod(a);
        if (scoreDiff !== 0) {
            return scoreDiff;
        }
        return getPodCreatedAt(b) - getPodCreatedAt(a);
    })[0];
}

async function listPodsByExactAppName(namespace, appName) {
    const listParams = new URLSearchParams({
        labelSelector: `app.kubernetes.io/name=${appName}`,
    });
    const response = await requestK8s(
        `/api/v1/namespaces/${encodePathSegment(namespace)}/pods?${listParams.toString()}`,
        { namespace }
    );

    return response.items || [];
}

function filterPodsByNameOrLabel(pods, appName, exact = false) {
    const prefix = `${appName}-`;

    return pods.filter((pod) => {
        const podName = pod?.metadata?.name || '';
        const labelName = pod?.metadata?.labels?.['app.kubernetes.io/name'] || '';

        if (exact) {
            return podName === appName || labelName === appName;
        }

        return podName.startsWith(prefix) || labelName.startsWith(prefix);
    });
}

async function listPodsByNameOrLabel(namespace, appName, exact = false) {
    const response = await requestK8s(
        `/api/v1/namespaces/${encodePathSegment(namespace)}/pods`,
        { namespace }
    );

    return filterPodsByNameOrLabel(response.items || [], appName, exact);
}

async function findPodsByAppNames(namespace, appNames) {
    for (const appName of appNames) {
        let pods = await listPodsByExactAppName(namespace, appName);

        if (!pods.length) {
            pods = await listPodsByNameOrLabel(namespace, appName, true);
        }

        if (!pods.length) {
            pods = await listPodsByNameOrLabel(namespace, appName);
        }

        if (pods.length) {
            return { pods, matchedAppName: appName };
        }
    }

    return { pods: [], matchedAppName: appNames[0] };
}

function selectContainer(pod, appName, requestedContainer) {
    const containers = pod?.spec?.containers?.map((container) => container.name) || [];

    if (!containers.length) {
        throw new K8sNotFoundError('未找到可读取日志的容器');
    }

    if (requestedContainer) {
        if (!containers.includes(requestedContainer)) {
            throw new K8sNotFoundError(`Pod 中不存在容器 ${requestedContainer}`);
        }
        return requestedContainer;
    }

    return containers.find((name) => name === appName) || containers[0];
}

function parseLogLines(text) {
    return text.split('\n').filter((line) => line.trim() !== '');
}

export async function getAppPodLogs({
    appName,
    fallbackAppNames = [],
    namespace,
    container,
    tailLines = DEFAULT_TAIL_LINES,
    previous = false,
    sinceSeconds,
} = {}) {
    if (!appName) {
        throw new K8sNotFoundError('缺少应用名称');
    }

    const finalTailLines = clampInteger(tailLines, DEFAULT_TAIL_LINES, 1, MAX_TAIL_LINES);
    const k8sAppName = toHelmFullname(appName);
    const appNameCandidates = [
        k8sAppName,
        ...fallbackAppNames.map(toHelmFullname),
    ].filter((value, index, values) => value && values.indexOf(value) === index);
    const targetNamespace = namespace || process.env.K8S_LOG_NAMESPACE || process.env.K8S_NAMESPACE;
    const config = await getK8sConfig(targetNamespace);
    const { pods, matchedAppName } = await findPodsByAppNames(config.namespace, appNameCandidates);
    const pod = selectPod(pods);

    if (!pod) {
        const names = appNameCandidates.map((name) => `${name} 或 ${name}-*`).join('、');
        throw new K8sNotFoundError(`未找到 ${names} 对应的 Pod`);
    }

    const podName = pod.metadata.name;
    const resolvedAppName = pod?.metadata?.labels?.['app.kubernetes.io/name'] || matchedAppName;
    const containerName = selectContainer(pod, resolvedAppName, container);
    const logParams = new URLSearchParams({
        container: containerName,
        tailLines: String(finalTailLines),
        timestamps: 'true',
    });

    if (previous) {
        logParams.set('previous', 'true');
    }

    if (sinceSeconds) {
        logParams.set('sinceSeconds', String(clampInteger(sinceSeconds, 3600, 1, 604800)));
    }

    const text = await requestK8s(
        `/api/v1/namespaces/${encodePathSegment(config.namespace)}/pods/${encodePathSegment(podName)}/log?${logParams.toString()}`,
        { namespace: config.namespace, responseType: 'text' }
    );

    return {
        logs: parseLogLines(text),
        appName: resolvedAppName,
        requestedAppName: k8sAppName,
        matchedAppName,
        namespace: config.namespace,
        podName,
        podPhase: pod.status?.phase || 'Unknown',
        containerName,
        containers: pod.spec?.containers?.map((item) => item.name) || [],
        tailLines: finalTailLines,
        previous,
        fetchedAt: new Date().toISOString(),
    };
}
