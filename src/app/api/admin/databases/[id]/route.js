// src/app/api/admin/databases/[id]/route.js
import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { prisma } from '@/lib/db';

// 删除数据库（管理员）
export async function DELETE(request, { params }) {
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

        // 删除数据库
        await prisma.database.delete({
            where: { id: params.id }
        });

        return NextResponse.json({ message: '数据库删除成功' });
    } catch (error) {
        console.error('删除数据库错误:', error);
        return NextResponse.json(
            { error: '服务器错误' },
            { status: 500 }
        );
    }
}