// src/app/api/admin/users/route.js
import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { prisma } from '@/lib/db';

// 获取所有用户
export async function GET(request) {
    try {
        const session = await getAdminSession(request);

        if (!session) {
            return NextResponse.json({ error: '未授权' }, { status: 401 });
        }

        const users = await prisma.user.findMany({
            select: {
                id: true,
                code: true,
                name: true,
                email: true,
                avatar: true,
                apiQuota: true,
                dbQuota: true,
                createdAt: true,
                updatedAt: true,
                _count: {
                    select: {
                        apis: true,
                        databases: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(users);
    } catch (error) {
        console.error('获取用户列表错误:', error);
        return NextResponse.json(
            { error: '服务器错误' },
            { status: 500 }
        );
    }
}