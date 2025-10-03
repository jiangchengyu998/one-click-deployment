// src/app/api/admin/apis/route.js
import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { prisma } from '@/lib/db';

// 获取所有API（管理员）
export async function GET(request) {
    try {
        const session = await getAdminSession(request);

        if (!session) {
            return NextResponse.json({ error: '未授权' }, { status: 401 });
        }

        const apis = await prisma.api.findMany({
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        code: true
                    }
                },
                api_infor: true
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(apis);
    } catch (error) {
        console.error('获取API列表错误:', error);
        return NextResponse.json(
            { error: '服务器错误' },
            { status: 500 }
        );
    }
}