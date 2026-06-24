// src/app/api/apis/[id]/runlogs/route.js
import { NextResponse } from 'next/server';
import { getUserSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { getAppPodLogs, K8sApiError, K8sConfigError, K8sNotFoundError } from '@/lib/k8sLogs';
import { createLogger, getRequestContext } from '@/lib/logger';

export const runtime = 'nodejs';

const logger = createLogger('api.runtime_logs');

export async function GET(request, { params }) {
    const requestLogger = logger.child(getRequestContext(request));
    try {
        const session = await getUserSession(request);

        if (!session || !session.id) {
            return NextResponse.json({ error: '未授权' }, { status: 401 });
        }

        const { id } = await params;
        const logLogger = requestLogger.child({
            apiId: id,
            userId: session.id,
        });
        const api = await prisma.api.findFirst({
            where: {
                id,
                userId: session.id,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        code: true,
                    }
                }
            }
        });

        if (!api) {
            logLogger.warn('api.runlogs.not_found_or_forbidden');
            return NextResponse.json({ error: 'API不存在' }, { status: 404 });
        }

        const { searchParams } = new URL(request.url);
        const appName = `${api.name}-${api.user.code}`;
        const query = {
            appName,
            fallbackAppNames: [api.name],
            container: searchParams.get('container') || undefined,
            tailLines: searchParams.get('tailLines') || undefined,
            sinceSeconds: searchParams.get('sinceSeconds') || undefined,
            previous: searchParams.get('previous') === 'true',
        };
        logLogger.info('api.runlogs.k8s_request_started', query);
        const result = await getAppPodLogs({
            appName: query.appName,
            fallbackAppNames: query.fallbackAppNames,
            container: query.container,
            tailLines: query.tailLines,
            sinceSeconds: query.sinceSeconds,
            previous: query.previous,
        });
        logLogger.info('api.runlogs.k8s_request_succeeded', {
            podName: result.podName,
            containerName: result.containerName,
            logLength: result.logs?.length || 0,
        });

        return NextResponse.json(result);
    } catch (error) {
        requestLogger.error('api.runlogs.failed', {
            error,
            errorType: error?.constructor?.name,
        });

        if (error instanceof K8sNotFoundError) {
            return NextResponse.json({ error: error.message }, { status: 404 });
        }

        if (error instanceof K8sConfigError) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        if (error instanceof K8sApiError) {
            if (error.statusCode === 403) {
                return NextResponse.json({ error: 'Kubernetes 不允许当前服务读取 Pod 日志' }, { status: 500 });
            }

            if (error.statusCode === 404) {
                return NextResponse.json({ error: 'Kubernetes 中未找到对应日志资源' }, { status: 404 });
            }

            return NextResponse.json({
                error: `获取 Kubernetes 日志失败: ${error.statusCode}`,
            }, { status: 502 });
        }

        return NextResponse.json({ error: '内部错误' }, { status: 500 });
    }
}
