// src/app/api/admin/apis/[id]/route.js
import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { prisma } from '@/lib/db';

// 删除API（管理员）
export async function DELETE(request, { params }) {
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

        // 删除API
        await prisma.api.delete({
            where: { id: params.id }
        });

        return NextResponse.json({ message: 'API删除成功' });
    } catch (error) {
        console.error('删除API错误:', error);
        return NextResponse.json(
            { error: '服务器错误' },
            { status: 500 }
        );
    }
}