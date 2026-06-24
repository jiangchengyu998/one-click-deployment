// src/app/api/apis/route.js
import { NextResponse } from 'next/server';
import { getUserSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { getJenkinsDeployNode } from '@/lib/deployConfig';
import { createLogger, getJenkinsConfigState, getRequestContext } from '@/lib/logger';
import { getRequiredWebhookSecret, getWebhookSecretConfigState } from '@/lib/webhookAuth';

const logger = createLogger('api.apis');
const API_NAME_PATTERN = /^[a-z]+$/;

export async function GET(request) {
    const requestLogger = logger.child(getRequestContext(request));
    try {
        const session = await getUserSession(request);

        if (!session || !session.id) {
            return NextResponse.json({ error: '未授权' }, { status: 401 });
        }

        const apis = await prisma.api.findMany({
            where: { userId: session.id },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(apis);
    } catch (error) {
        requestLogger.error('api.list.failed', { error });
        return NextResponse.json(
            { error: '服务器错误' },
            { status: 500 }
        );
    }
}

export async function POST(request) {
    const requestLogger = logger.child(getRequestContext(request));
    try {
        const session = await getUserSession(request);

        if (!session || !session.id) {
            return NextResponse.json({ error: '未授权' }, { status: 401 });
        }

        // 解析请求体, 添加envs
        const { name, gitUrl, gitToken, envs } = await request.json();
        const deployLogger = requestLogger.child({
            userId: session.id,
            apiName: name,
        });

        if (!API_NAME_PATTERN.test(name || '')) {
            deployLogger.warn('api.create.invalid_name', {
                rule: 'lowercase_letters_only',
            });
            return NextResponse.json(
                { error: '应用名称只能包含小写英文字母' },
                { status: 400 }
            );
        }

        // 检查用户配额
        const user = await prisma.user.findUnique({
            where: { id: session.id },
            include: { _count: { select: { apis: true } } }
        });

        if (user._count.apis >= user.apiQuota) {
            deployLogger.warn('api.create.quota_exceeded', {
                currentApiCount: user._count.apis,
                apiQuota: user.apiQuota,
            });
            return NextResponse.json(
                { error: '已达到API配额限制' },
                { status: 400 }
            );
        }

        // 生成域名
        const domain = `${name}-${user.code}.${process.env.NEXT_PUBLIC_MAIN_DOMAIN}`;

        // 根据name 和userId 查看api,如果有了，就不可以创建
        const existingApi = await prisma.api.findFirst({
            where: {
                name,
                userId: session.id,
            }
        });

        if (existingApi) {
            deployLogger.warn('api.create.duplicate_name', {
                existingApiId: existingApi.id,
            });
            return NextResponse.json(
                { error: '已存在相同名称的API' },
                { status: 400 }
            );
        }

        // 创建API记录
        const api = await prisma.api.create({
            data: {
                name,
                gitUrl,
                gitToken,
                domain,
                envs,
                userId: session.id,
            },
        });
        const apiLogger = deployLogger.child({
            apiId: api.id,
            domain,
        });
        apiLogger.info('api.create.record_created', {
            hasGitToken: !!gitToken,
            envCount: Array.isArray(envs) ? envs.length : Object.keys(envs || {}).length,
        });

        // 30分钟后如果状态还在BUILDING，自动改为ERROR，防止卡死
        setTimeout(async () => {
            try {
                // 重新获取api状态，防止覆盖掉已经变更的状态
                const currentApi = await prisma.api.findUnique({
                    where: { id: api.id }
                });

                // 如果currentApi不存在，则直接返回
                if (!currentApi) {
                    apiLogger.warn('api.deploy.timeout_check.missing_api');
                    return;
                }

                if (currentApi.status === 'BUILDING') {
                    apiLogger.warn('api.deploy.timeout', {
                        previousStatus: currentApi.status,
                        nextStatus: 'ERROR',
                        timeoutMinutes: 30,
                    });
                    await prisma.api.update({
                        where: { id: currentApi.id },
                        data: { status: 'ERROR' }
                    });
                }
            } catch (error) {
                apiLogger.error('api.deploy.timeout_check.failed', { error });
            }
        }, 30*60*1000);

        const deployNode = getJenkinsDeployNode();
        apiLogger.info('api.deploy.node_selected', { deployNode });

        const pipelineUrl = process.env.JENKINS_URL;
        const jenkinsUser = process.env.JENKINS_USER;
        const jenkinsToken = process.env.JENKINS_TOKEN;
        if (!pipelineUrl || !jenkinsUser || !jenkinsToken) {
            apiLogger.error('api.deploy.jenkins_config_missing', getJenkinsConfigState());
            throw new Error('Jenkins配置不完整');
        }
        const webhookSecret = getRequiredWebhookSecret();
        const basicAuth = Buffer.from(`${jenkinsUser}:${jenkinsToken}`).toString('base64');

        // 构建参数
        const deployParams = new URLSearchParams({
            GIT_URL: api.gitUrl,
            exe_node: deployNode,
            branch: api.branch,
            api_id: api.id,
            gitToken: api.gitToken || '',
            // Switch to stringify for envs
            envs: JSON.stringify(api.envs),
            api_name: api.name + '-' +  user.code,
            CALL_BACK_HOST: process.env.NEXTAUTH_URL || '',
            WEBHOOK_SECRET: webhookSecret,
        });

        const responseDeployApi = await fetch(
            `${pipelineUrl}/job/deploy_api_by_k3s/buildWithParameters`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${basicAuth}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: deployParams,
            }
        );


        if (responseDeployApi.status === 201) {
            apiLogger.info('api.deploy.jenkins_triggered', {
                jobName: 'deploy_api_by_k3s',
                jenkinsStatus: responseDeployApi.status,
                jenkinsStatusText: responseDeployApi.statusText,
            });
        } else {
            apiLogger.error('api.deploy.jenkins_trigger_failed', {
                jobName: 'deploy_api_by_k3s',
                jenkinsStatus: responseDeployApi.status,
                jenkinsStatusText: responseDeployApi.statusText,
            });
            throw new Error('调用Jenkins部署服务失败');
        }

        // 更新api状态为BUILDING
        await prisma.api.update({
            where: { id: api.id },
            data: { status: 'BUILDING' }
        });
        apiLogger.info('api.deploy.status_updated', {
            status: 'BUILDING',
        });

        return NextResponse.json(api, { status: 201 });
    } catch (error) {
        requestLogger.error('api.create.failed', {
            error,
            ...getWebhookSecretConfigState(),
        });
        return NextResponse.json(
            { error: '服务器错误' },
            { status: 500 }
        );
    }
}
