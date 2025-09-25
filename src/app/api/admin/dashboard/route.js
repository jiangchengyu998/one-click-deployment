// src/app/api/admin/dashboard/route.js
import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(request) {
    try {
        // 验证管理员权限
        const token = request.cookies.get('admin-token')?.value;

        if (!token) {
            return NextResponse.json({ error: '未授权' }, { status: 401 });
        }

        const decoded = verifyToken(token);
        if (!decoded || decoded.role !== 'admin') {
            return NextResponse.json({ error: '未授权' }, { status: 401 });
        }

        // 获取统计数据
        const [totalUsers, totalApis, totalDatabases, activeApis] = await Promise.all([
            prisma.user.count(),
            prisma.api.count(),
            prisma.database.count(),
            prisma.api.count({ where: { status: 'RUNNING' } })
        ]);

        return NextResponse.json({
            totalUsers,
            totalApis,
            totalDatabases,
            activeApis
        });
    } catch (error) {
        console.error('获取仪表板数据错误:', error);
        return NextResponse.json(
            { error: '服务器错误' },
            { status: 500 }
        );
    }
}