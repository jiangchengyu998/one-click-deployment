// src/app/api/users/dashboard/route.js
import { NextResponse } from 'next/server';
import { getUserSession } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(request) {
    try {
        // 验证用户权限
        const session = await getUserSession(request);

        if (!session) {
            return NextResponse.json({ error: '未授权' }, { status: 401 });
        }

        // 获取用户信息和统计数据
        const [user, apiCount, dbCount, runningApis] = await Promise.all([
            prisma.user.findUnique({
                where: { id: session.id },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    code: true,
                    apiQuota: true,
                    dbQuota: true,
                    createdAt: true
                }
            }),
            prisma.api.count({ where: { userId: session.id } }),
            prisma.database.count({ where: { userId: session.id } }),
            prisma.api.count({
                where: {
                    userId: session.id,
                    status: 'RUNNING'
                }
            })
        ]);

        if (!user) {
            return NextResponse.json({ error: '用户不存在' }, { status: 404 });
        }

        return NextResponse.json({
            user,
            stats: {
                apiCount,
                dbCount,
                runningApis
            }
        });
    } catch (error) {
        console.error('获取用户仪表板数据错误:', error);
        return NextResponse.json(
            { error: '服务器错误' },
            { status: 500 }
        );
    }
}