// src/app/api/apis/[id]/route.js
import { NextResponse } from 'next/server';
import { getUserSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { createLogger, getJenkinsConfigState, getRequestContext } from '@/lib/logger';

const logger = createLogger('api.detail');

// 获取API详情
export async function GET(request, { params }) {
    const requestLogger = logger.child(getRequestContext(request));
    try {
        const session = await getUserSession(request);

        if (!session) {
            return NextResponse.json({ error: '未授权' }, { status: 401 });
        }

        const { id } = await params;
        const apiLogger = requestLogger.child({
            apiId: id,
            userId: session.id,
        });

        const api = await prisma.api.findFirst({
            where: {
                id: id,
                userId: session.id,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        code: true
                    }
                }
            }
        });

        if (!api) {
            apiLogger.warn('api.detail.not_found_or_forbidden');
            return NextResponse.json({ error: 'API不存在' }, { status: 404 });
        }

        return NextResponse.json(api);
    } catch (error) {
        requestLogger.error('api.detail.failed', { error });
        return NextResponse.json(
            { error: '服务器错误' },
            { status: 500 }
        );
    }
}

// 删除API
export async function DELETE(request, { params }) {
    const requestLogger = logger.child(getRequestContext(request));
    try {
        const session = await getUserSession(request);

        if (!session) {
            return NextResponse.json({ error: '未授权' }, { status: 401 });
        }

        const { id } = await params;
        const apiLogger = requestLogger.child({
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
            apiLogger.warn('api.delete.not_found_or_forbidden');
            return NextResponse.json({ error: 'API不存在' }, { status: 404 });
        }

        const user = await prisma.user.findUnique({
            where: { id: api.userId }
        });


        // 删除API
        await prisma.api.delete({
            where: { id: id }
        });
        apiLogger.info('api.delete.record_deleted', {
            apiName: api.name,
        });

        const pipelineUrl = process.env.JENKINS_URL;
        const jenkinsUser = process.env.JENKINS_USER;
        const jenkinsToken = process.env.JENKINS_TOKEN;
        if (!pipelineUrl || !jenkinsUser || !jenkinsToken) {
            apiLogger.error('api.delete.jenkins_config_missing', getJenkinsConfigState());
            throw new Error('Jenkins配置不完整');
        }
        const basicAuth = Buffer.from(`${jenkinsUser}:${jenkinsToken}`).toString('base64');

        // 1. 调用http://192.168.101.51:8080/job/delete_api/ pipeline 删除API相关资源
        // 构建参数字符串
        const query = new URLSearchParams({
            api_name: api.name + '-' + user.code,
            RR: api.name + '-' + user.code,
        }).toString();

        const response = await fetch(
            `${pipelineUrl}/job/delete_api/buildWithParameters?${query}`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${basicAuth}`
                }
            }
        );

        if (response.status === 201 || response.status === 200) {
            apiLogger.info('api.delete.jenkins_triggered', {
                jobName: 'delete_api',
                jenkinsStatus: response.status,
                jenkinsStatusText: response.statusText,
            });
        } else {
            apiLogger.error('api.delete.jenkins_trigger_failed', {
                jobName: 'delete_api',
                jenkinsStatus: response.status,
                jenkinsStatusText: response.statusText,
            });
        }


        return NextResponse.json({ message: 'API删除成功' });
    } catch (error) {
        requestLogger.error('api.delete.failed', { error });
        return NextResponse.json(
            { error: '服务器错误' },
            { status: 500 }
        );
    }
}

// 更新API（包括环境变量）
export async function PATCH(request, { params }) {
    const requestLogger = logger.child(getRequestContext(request));
    try {
        const session = await getUserSession(request);

        if (!session) {
            return NextResponse.json({ error: '未授权' }, { status: 401 });
        }

        const { id } = await params;
        const { envs,gitToken,branch } = await request.json();
        const apiLogger = requestLogger.child({
            apiId: id,
            userId: session.id,
        });

        // console.log('Received envs update for API:', id, envs);

        // 检查API是否存在且用户有权限
        const api = await prisma.api.findFirst({
            where: {
                id: id,
                userId: session.id,
            }
        });

        if (!api) {
            apiLogger.warn('api.update.not_found_or_forbidden');
            return NextResponse.json({ error: 'API不存在' }, { status: 404 });
        }

        // 更新环境变量
        const updatedApi = await prisma.api.update({
            where: { id: id },
            data: {
                envs: envs !== undefined ? envs : api.envs,
                gitToken: gitToken !== undefined ? gitToken : api.gitToken,
                branch: branch !== undefined ? branch : api.branch,
                updatedAt: new Date()
            }
        });
        apiLogger.info('api.update.succeeded', {
            updatedFields: [
                envs !== undefined ? 'envs' : null,
                gitToken !== undefined ? 'gitToken' : null,
                branch !== undefined ? 'branch' : null,
            ].filter(Boolean),
            hasGitToken: !!updatedApi.gitToken,
        });

        // console.log('API环境变量更新成功:', updatedApi.id);

        return NextResponse.json(updatedApi);
    } catch (error) {
        requestLogger.error('api.update.failed', { error });
        return NextResponse.json(
            { error: '服务器错误' },
            { status: 500 }
        );
    }
}
