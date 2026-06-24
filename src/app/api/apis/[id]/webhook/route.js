import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import {sendDeployInfoEmail} from "@/lib/email";
import { createLogger, getRequestContext } from '@/lib/logger';
import { isValidWebhookSecret, WEBHOOK_SECRET_HEADER } from '@/lib/webhookAuth';

const logger = createLogger('api.webhook');
const ALLOWED_API_STATUSES = new Set(['RUNNING', 'ERROR']);

// 重新部署API
export async function POST(request, { params }) {
    const requestLogger = logger.child(getRequestContext(request));
    try {

        const { id } = await params;
        const webhookLogger = requestLogger.child({
            apiId: id,
        });
        webhookLogger.info('api.webhook.received');

        if (!isValidWebhookSecret(request.headers.get(WEBHOOK_SECRET_HEADER))) {
            webhookLogger.warn('api.webhook.invalid_secret');
            return NextResponse.json({ error: '未授权' }, { status: 401 });
        }

        // 获取参数
        const { apiStatus, jobId } = await request.json();
        const callbackLogger = webhookLogger.child({
            jobId,
            nextStatus: apiStatus,
        });

        if (!ALLOWED_API_STATUSES.has(apiStatus)) {
            callbackLogger.warn('api.webhook.invalid_status');
            return NextResponse.json({ error: '无效的API状态' }, { status: 400 });
        }

        // 检查API是否存在
        const api = await prisma.api.findUnique({
            where: { id: id }
        });

        if (!api) {
            callbackLogger.warn('api.webhook.api_not_found');
            return NextResponse.json({ error: 'API不存在' }, { status: 404 });
        }

        // 更新API状态
        await prisma.api.update({
            where: { id: id },
            data: {
                status: apiStatus,
                lastJobId: jobId,
                updatedAt: new Date()
            }
        });
        callbackLogger.info('api.webhook.status_updated', {
            previousStatus: api.status,
            nextStatus: apiStatus,
        });

        const user = await prisma.user.findUnique({
            where: { id: api.userId }
        });

        // 用户不存在，直接返回
        if (!user) {
            callbackLogger.warn('api.webhook.user_not_found', {
                userId: api.userId,
            });
            return NextResponse.json({ error: 'API不存在' }, { status: 404 });
        }



        // 发送邮件给用户，通知api 状态 email, status, apiName,apiId
        await sendDeployInfoEmail(user.email, apiStatus, api.name, api.id);
        callbackLogger.info('api.webhook.notification_sent', {
            userId: user.id,
            hasRecipient: !!user.email,
        });

        return NextResponse.json({ message: 'API状态更新成功' });
    } catch (error) {
        requestLogger.error('api.webhook.failed', { error });
        return NextResponse.json(
            { error: '服务器错误' },
            { status: 500 }
        );
    }
}
