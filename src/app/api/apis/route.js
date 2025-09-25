// src/app/api/apis/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET() {
    try {
        const session = await getServerSession();

        if (!session || !session.userId) {
            return NextResponse.json({ error: '未授权' }, { status: 401 });
        }

        const apis = await prisma.api.findMany({
            where: { userId: session.userId },
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

export async function POST(request) {
    try {
        const session = await getServerSession();

        if (!session || !session.userId) {
            return NextResponse.json({ error: '未授权' }, { status: 401 });
        }

        const { name, gitUrl, gitToken } = await request.json();

        // 检查用户配额
        const user = await prisma.user.findUnique({
            where: { id: session.userId },
            include: { _count: { select: { apis: true } } }
        });

        if (user._count.apis >= user.apiQuota) {
            return NextResponse.json(
                { error: '已达到API配额限制' },
                { status: 400 }
            );
        }

        // 生成域名
        const domain = `${name}-${user.code}.yunduo.app`;

        // 创建API记录
        const api = await prisma.api.create({
            data: {
                name,
                gitUrl,
                gitToken,
                domain,
                userId: session.userId,
            },
        });

        // 这里可以添加触发部署逻辑
        // await triggerDeployment(api);

        return NextResponse.json(api, { status: 201 });
    } catch (error) {
        console.error('创建API错误:', error);
        return NextResponse.json(
            { error: '服务器错误' },
            { status: 500 }
        );
    }
}