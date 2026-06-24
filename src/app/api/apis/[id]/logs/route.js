// src/app/api/apis/[id]/logs/route.js
import { NextResponse } from 'next/server';
import { getUserSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { createLogger, getJenkinsConfigState, getRequestContext } from '@/lib/logger';

const logger = createLogger('api.build_logs');
const JOB_NAME = 'deploy_api_by_k3s';
const SENSITIVE_KEYWORDS = ['oauth2', '环境变量', 'ydphoto', 'deploy.sh', 'export ', 'SECRET', 'KEY', 'TOKEN', 'PASSWORD', 'PWD', 'AWS_', 'GCP_', 'AZURE_'];

function parseNonNegativeInteger(value, fallback = 0) {
    const parsed = Number.parseInt(value, 10);
    if (!Number.isFinite(parsed) || parsed < 0) {
        return fallback;
    }
    return parsed;
}

function sanitizeLogLine(line) {
    if (SENSITIVE_KEYWORDS.some(keyword => line.includes(keyword))) {
        return '****';
    }
    return line;
}

function parseLogLines(logs, buildNumber, idPrefix = '') {
    return logs
        .split('\n')
        .map(sanitizeLogLine)
        .map((line, index) => {
            // 尝试多种日志格式的解析
            let timestamp = new Date();
            let level = 'INFO';
            let message = line;

            // 格式1: 2024-01-01 10:00:00 INFO Some message
            const format1 = line.match(/(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}) (\w+) (.*)/);
            if (format1) {
                timestamp = new Date(`${format1[1]}`);
                level = format1[2];
                message = format1[3];
            }
            // 格式2: [2024-01-01T10:00:00.000Z] INFO: Some message
            else if (line.match(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)) {
                const format2 = line.match(/\[([^\]]+)\] (\w+): (.*)/);
                if (format2) {
                    timestamp = new Date(format2[1]);
                    level = format2[2];
                    message = format2[3];
                }
            }
            // 格式3: 包含常见日志级别关键词
            else {
                const levelMatch = line.match(/\b(ERROR|WARN|INFO|DEBUG|TRACE)\b/);
                if (levelMatch) {
                    level = levelMatch[1];
                }
            }

            // 如果时间解析失败，使用当前时间
            if (isNaN(timestamp.getTime())) {
                timestamp = new Date();
            }

            return {
                id: `${buildNumber}-${idPrefix}${index}`,
                timestamp: timestamp.toISOString(),
                level: level,
                message: message
            };
        })
        .filter(log => log.message && log.message.trim() !== '');
}

function createJenkinsErrorResponse(response, errorDetail = '') {
    // 根据不同的状态码返回不同的错误信息
    if (response.status === 404) {
        return NextResponse.json({ error: '构建记录不存在或已被删除' }, { status: 404 });
    }

    if (response.status === 401) {
        return NextResponse.json({ error: 'Jenkins认证失败' }, { status: 500 });
    }

    return NextResponse.json({
        error: `获取日志失败: ${response.status} ${response.statusText}`,
    }, { status: response.status });
}

// 获取API日志
export async function GET(request, { params }) {
    const requestLogger = logger.child(getRequestContext(request));
    try {
        const session = await getUserSession(request);

        if (!session) {
            return NextResponse.json({ error: '未授权' }, { status: 401 });
        }

        const { id } = await params;
        const logLogger = requestLogger.child({
            apiId: id,
            userId: session.id,
        });

        // 检查API是否存在
        const api = await prisma.api.findFirst({
            where: {
                id: id,
                userId: session.id,
            }
        });

        if (!api) {
            logLogger.warn('api.logs.not_found_or_forbidden');
            return NextResponse.json({ error: 'API不存在' }, { status: 404 });
        }

        // 从pipeline中获取日志
        const jenkinsUrl = process.env.JENKINS_URL;
        const jenkinsUser = process.env.JENKINS_USER;
        const jenkinsToken = process.env.JENKINS_TOKEN;

        const buildNumber = api.lastJobId;
        if (!buildNumber) {
            logLogger.warn('api.logs.build_missing');
            return NextResponse.json({ error: 'API未部署过，没有构建记录' }, { status: 404 });
        }

        // 检查必要的环境变量
        if (!jenkinsUrl || !jenkinsUser || !jenkinsToken) {
            logLogger.error('api.logs.jenkins_config_missing', getJenkinsConfigState());
            return NextResponse.json({ error: '系统配置不完整' }, { status: 500 });
        }

        const { searchParams } = new URL(request.url);
        const progressive = searchParams.get('mode') === 'progressive' || searchParams.has('start');
        const start = parseNonNegativeInteger(searchParams.get('start'), 0);
        const normalizedJenkinsUrl = jenkinsUrl.replace(/\/+$/g, '');
        const basicAuth = Buffer.from(`${jenkinsUser}:${jenkinsToken}`).toString('base64');
        const jenkinsUrlForLog = progressive
            ? `${normalizedJenkinsUrl}/job/${JOB_NAME}/${buildNumber}/logText/progressiveText?start=${start}`
            : `${normalizedJenkinsUrl}/job/${JOB_NAME}/${buildNumber}/consoleText`;
        logLogger.info('api.logs.jenkins_request_started', {
            jobName: JOB_NAME,
            buildNumber,
            progressive,
            start,
        });

        const response = await fetch(jenkinsUrlForLog, {
            method: 'GET',
            headers: {
                'Authorization': `Basic ${basicAuth}`,
                'Accept': 'text/plain; charset=utf-8'
            }
        });

        logLogger.info('api.logs.jenkins_response_received', {
            jobName: JOB_NAME,
            buildNumber,
            jenkinsStatus: response.status,
            jenkinsStatusText: response.statusText,
            progressive,
        });

        if (!response.ok) {
            let errorDetail = '';
            try {
                const errorText = await response.text();
                errorDetail = errorText.substring(0, 200); // 只取前200字符避免日志过长
            } catch (e) {
                errorDetail = '无法读取错误详情';
            }

            logLogger.error('api.logs.jenkins_fetch_failed', {
                jobName: JOB_NAME,
                buildNumber,
                status: response.status,
                statusText: response.statusText,
                errorDetail: errorDetail,
                progressive,
            });

            return createJenkinsErrorResponse(response, errorDetail);
        }

        const logs = await response.text();
        const nextStart = progressive
            ? parseNonNegativeInteger(response.headers.get('x-text-size'), start + logs.length)
            : logs.length;
        const hasMore = progressive && response.headers.get('x-more-data') === 'true';

        logLogger.info('api.logs.jenkins_fetch_succeeded', {
            jobName: JOB_NAME,
            buildNumber,
            logLength: logs.length,
            progressive,
            start,
            nextStart,
            hasMore,
        });

        if (!logs || logs.trim() === '') {
            logLogger.info('api.logs.empty', {
                buildNumber,
            });
            if (progressive) {
                return NextResponse.json({
                    logs: [],
                    buildNumber,
                    nextStart,
                    hasMore,
                    fetchedAt: new Date().toISOString(),
                });
            }

            return NextResponse.json([]);
        }

        const parsedLogs = parseLogLines(logs, buildNumber, progressive ? `${start}-` : '');

        if (progressive) {
            return NextResponse.json({
                logs: parsedLogs,
                buildNumber,
                nextStart,
                hasMore,
                fetchedAt: new Date().toISOString(),
            });
        }

        return NextResponse.json(parsedLogs);

    } catch (error) {
        requestLogger.error('api.logs.failed', { error });
        return NextResponse.json(
            { error: `服务器错误: ${error.message}` },
            { status: 500 }
        );
    }
}
