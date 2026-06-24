// src/app/api/admin/apis/[id]/redeploy/route.js
import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { getJenkinsDeployNode } from '@/lib/deployConfig';
import { createLogger, getJenkinsConfigState, getRequestContext } from '@/lib/logger';
import { getRequiredWebhookSecret, getWebhookSecretConfigState } from '@/lib/webhookAuth';

const logger = createLogger('admin.api.redeploy');

// 重新部署API（管理员）
export async function POST(request, { params }) {
    const requestLogger = logger.child(getRequestContext(request));
    try {
        const session = await getAdminSession(request);

        if (!session) {
            return NextResponse.json({ error: '未授权' }, { status: 401 });
        }

        const { id } = await params;
        const deployLogger = requestLogger.child({
            apiId: id,
            adminId: session.id,
        });

        // 检查API是否存在
        const api = await prisma.api.findUnique({
            where: { id: id }
        });

        if (!api) {
            deployLogger.warn('admin.api.redeploy.not_found');
            return NextResponse.json({ error: 'API不存在' }, { status: 404 });
        }

        // 读取环境变量
        const pipelineUrl = process.env.JENKINS_URL;
        const jenkinsUser = process.env.JENKINS_USER;
        const jenkinsToken = process.env.JENKINS_TOKEN;
        if (!pipelineUrl || !jenkinsUser || !jenkinsToken) {
            deployLogger.error('admin.api.redeploy.jenkins_config_missing', getJenkinsConfigState());
            throw new Error('Jenkins配置不完整');
        }
        const webhookSecret = getRequiredWebhookSecret();

        // 在实际应用中，这里应该调用部署服务来重新部署API
        // 这里我们只是模拟重新部署过程，更新状态
        await prisma.api.update({
            where: { id: id },
            data: {
                status: 'BUILDING',
                // lastJobId: `job-${Date.now()}`,
                updatedAt: new Date()
            }
        });
        deployLogger.info('admin.api.redeploy.status_updated', {
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
                    deployLogger.warn('admin.api.redeploy.timeout_check.missing_api');
                    return;
                }

                if (currentApi.status === 'BUILDING') {
                    deployLogger.warn('admin.api.redeploy.timeout', {
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
                deployLogger.error('admin.api.redeploy.timeout_check.failed', { error });
            }
        }, 30*60*1000);

        // 检查用户配额
        const user = await prisma.user.findUnique({
            where: { id: api.userId }
        });

        const basicAuth = Buffer.from(`${jenkinsUser}:${jenkinsToken}`).toString('base64');


        const deployNode = getJenkinsDeployNode();
        deployLogger.info('admin.api.redeploy.node_selected', {
            ownerUserId: api.userId,
            deployNode,
        });
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
            deployLogger.info('admin.api.redeploy.jenkins_triggered', {
                jobName: 'deploy_api_by_k3s',
                jenkinsStatus: response.status,
                jenkinsStatusText: response.statusText,
            });
        } else {
            deployLogger.error('admin.api.redeploy.jenkins_trigger_failed', {
                jobName: 'deploy_api_by_k3s',
                jenkinsStatus: response.status,
                jenkinsStatusText: response.statusText,
            });
            throw new Error('触发Jenkins任务失败');
        }

        return NextResponse.json({ message: 'API重新部署命令已发送' });
    } catch (error) {
        requestLogger.error('admin.api.redeploy.failed', {
            error,
            ...getWebhookSecretConfigState(),
        });
        return NextResponse.json(
            { error: '服务器错误' },
            { status: 500 }
        );
    }
}
