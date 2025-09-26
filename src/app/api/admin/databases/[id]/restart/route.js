// src/app/api/admin/databases/[id]/restart/route.js
import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { prisma } from '@/lib/db';

// 重启数据库（管理员）
export async function POST(request, { params }) {
    try {
        const session = await getAdminSession(request);

        if (!session) {
            return NextResponse.json({ error: '未授权' }, { status: 401 });
        }

        // 检查数据库是否存在
        const database = await prisma.database.findUnique({
            where: { id: params.id }
        });

        if (!database) {
            return NextResponse.json({ error: '数据库不存在' }, { status: 404 });
        }

        // 在实际应用中，这里应该调用数据库管理服务来重启数据库
        // 这里我们只是模拟重启过程，更新状态
        await prisma.database.update({
            where: { id: params.id },
            data: {
                status: 'RUNNING',
                updatedAt: new Date()
            }
        });

        return NextResponse.json({ message: '数据库重启命令已发送' });
    } catch (error) {
        console.error('重启数据库错误:', error);
        return NextResponse.json(
            { error: '服务器错误' },
            { status: 500 }
        );
    }
}