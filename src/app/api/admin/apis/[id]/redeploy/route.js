// src/app/api/admin/apis/[id]/redeploy/route.js
import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { prisma } from '@/lib/db';

// 重新部署API（管理员）
export async function POST(request, { params }) {
    try {
        const session = await getAdminSession(request);

        if (!session) {
            return NextResponse.json({ error: '未授权' }, { status: 401 });
        }

        // 检查API是否存在
        const api = await prisma.api.findUnique({
            where: { id: params.id }
        });

        if (!api) {
            return NextResponse.json({ error: 'API不存在' }, { status: 404 });
        }

        // 在实际应用中，这里应该调用部署服务来重新部署API
        // 这里我们只是模拟重新部署过程，更新状态
        await prisma.api.update({
            where: { id: params.id },
            data: {
                status: 'BUILDING',
                lastJobId: `job-${Date.now()}`,
                updatedAt: new Date()
            }
        });

        // 模拟构建过程
        setTimeout(async () => {
            await prisma.api.update({
                where: { id: params.id },
                data: { status: 'RUNNING' }
            });
        }, 10000);

        return NextResponse.json({ message: 'API重新部署命令已发送' });
    } catch (error) {
        console.error('重新部署API错误:', error);
        return NextResponse.json(
            { error: '服务器错误' },
            { status: 500 }
        );
    }
}