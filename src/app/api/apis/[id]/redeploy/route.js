// src/app/api/apis/[id]/redeploy/route.js
import { NextResponse } from 'next/server';
import { getUserSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { getJenkinsDeployNode } from '@/lib/deployConfig';
import { createLogger, getJenkinsConfigState, getRequestContext } from '@/lib/logger';
import { getRequiredWebhookSecret, getWebhookSecretConfigState } from '@/lib/webhookAuth';

const logger = createLogger('api.redeploy');

// 重新部署API
export async function POST(request, { params }) {
    const requestLogger = logger.child(getRequestContext(request));
    try {
        const session = await getUserSession(request);

        if (!session) {
            return NextResponse.json({ error: '未授权' }, { status: 401 });
        }

        const { id } = await params;
        const deployLogger = requestLogger.child({
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
            deployLogger.warn('api.redeploy.not_found_or_forbidden');
            return NextResponse.json({ error: 'API不存在' }, { status: 404 });
        }

        // 读取环境变量
        const pipelineUrl = process.env.JENKINS_URL;
        const jenkinsUser = process.env.JENKINS_USER;
        const jenkinsToken = process.env.JENKINS_TOKEN;
        if (!pipelineUrl || !jenkinsUser || !jenkinsToken) {
            deployLogger.error('api.redeploy.jenkins_config_missing', getJenkinsConfigState());
            throw new Error('Jenkins配置不完整');
        }
        const webhookSecret = getRequiredWebhookSecret();

        // 更新API状态
        await prisma.api.update({
            where: { id: id },
            data: {
                status: 'BUILDING',
                // lastJobId: `job-${Date.now()}`,
                updatedAt: new Date()
            }
        });
        deployLogger.info('api.redeploy.status_updated', {
            status: 'BUILDING',
        });

        // 30分钟后如果状态还在BUILDING，自动改为ERROR，防止卡死
        setTimeout(async () => {
            try {
                // 重新获取api状态，防止覆盖掉已经变更的状态
                const currentApi = await prisma.api.findUnique({
                    where: { id: api.id }
                });

                if (!currentApi) {
                    deployLogger.warn('api.redeploy.timeout_check.missing_api');
                    return;
                }

                if (currentApi.status === 'BUILDING') {
                    deployLogger.warn('api.redeploy.timeout', {
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
                deployLogger.error('api.redeploy.timeout_check.failed', { error });
            }
        }, 30*60*1000);

        // 检查用户配额
        const user = await prisma.user.findUnique({
            where: { id: session.id },
            include: { _count: { select: { apis: true } } }
        });

        const basicAuth = Buffer.from(`${jenkinsUser}:${jenkinsToken}`).toString('base64');


        const deployNode = getJenkinsDeployNode();
        deployLogger.info('api.redeploy.node_selected', { deployNode });
        // 构建参数
        const deployParams = new URLSearchParams({
            GIT_URL: api.gitUrl,
            exe_node: deployNode,
            branch: api.branch || 'main',
            api_id: api.id,
            gitToken: api.gitToken || '',
            // Switch to stringify for envs
            envs: JSON.stringify(api.envs),
            api_name: api.name + '-' +  user.code,
            CALL_BACK_HOST: process.env.NEXTAUTH_URL || '',
            WEBHOOK_SECRET: webhookSecret,
        });

        const response = await fetch(
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


        if (response.status === 201) {
            deployLogger.info('api.redeploy.jenkins_triggered', {
                jobName: 'deploy_api_by_k3s',
                jenkinsStatus: response.status,
                jenkinsStatusText: response.statusText,
            });
        } else {
            deployLogger.error('api.redeploy.jenkins_trigger_failed', {
                jobName: 'deploy_api_by_k3s',
                jenkinsStatus: response.status,
                jenkinsStatusText: response.statusText,
            });
            throw new Error('触发Jenkins任务失败');
        }

        return NextResponse.json({ message: 'API重新部署命令已发送' });
    } catch (error) {
        requestLogger.error('api.redeploy.failed', {
            error,
            ...getWebhookSecretConfigState(),
        });
        return NextResponse.json(
            { error: '服务器错误' },
            { status: 500 }
        );
    }
}
