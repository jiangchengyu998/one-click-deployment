// src/app/api/apis/route.js
import { NextResponse } from 'next/server';
import { getUserSession } from '@/lib/auth';
import { prisma } from '@/lib/db';

// 获取当前用户的API列表
export async function GET(request) {
    try {
        const session = await getUserSession(request);

        if (!session) {
            return NextResponse.json({ error: '未授权' }, { status: 401 });
        }

        const apis = await prisma.api.findMany({
            where: { userId: session.id },
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

// 创建新API
export async function POST(request) {
    try {
        const session = await getUserSession(request);

        if (!session) {
            return NextResponse.json({ error: '未授权' }, { status: 401 });
        }

        const { name, gitUrl, gitToken, dockerfile } = await request.json();

        // 验证必填字段
        if (!name || !gitUrl) {
            return NextResponse.json(
                { error: 'API名称和Git仓库地址是必填的' },
                { status: 400 }
            );
        }

        // 检查用户配额
        const user = await prisma.user.findUnique({
            where: { id: session.id },
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
                userId: session.id,
                status: 'PENDING'
            },
        });

        // 在实际应用中，这里应该调用部署服务
        // 模拟部署过程
        setTimeout(async () => {
            await prisma.api.update({
                where: { id: api.id },
                data: {
                    status: 'BUILDING',
                    lastJobId: `job-${Date.now()}`
                }
            });

            // 模拟构建完成
            setTimeout(async () => {
                await prisma.api.update({
                    where: { id: api.id },
                    data: { status: 'RUNNING' }
                });
            }, 10000);
        }, 2000);

        return NextResponse.json(api, { status: 201 });
    } catch (error) {
        console.error('创建API错误:', error);
        return NextResponse.json(
            { error: '服务器错误' },
            { status: 500 }
        );
    }
}