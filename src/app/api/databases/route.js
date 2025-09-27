// src/app/api/databases/route.js
import { NextResponse } from 'next/server';
import { getUserSession, hashPassword } from '@/lib/auth';
import { prisma } from '@/lib/db';
import {encryptPassword} from "@/lib/db_password_utils";

// 获取当前用户的数据库列表
export async function GET(request) {
    try {
        const session = await getUserSession(request);

        if (!session) {
            return NextResponse.json({ error: '未授权' }, { status: 401 });
        }

        const databases = await prisma.database.findMany({
            where: { userId: session.id },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(databases);
    } catch (error) {
        console.error('获取数据库列表错误:', error);
        return NextResponse.json(
            { error: '服务器错误' },
            { status: 500 }
        );
    }
}

// 创建新数据库
export async function POST(request) {
    try {
        const session = await getUserSession(request);

        if (!session) {
            return NextResponse.json({ error: '未授权' }, { status: 401 });
        }

        // const { name, username, password, apiPassword } = await request.json();
        const { name, username, password } = await request.json();

        // 验证必填字段
        if (!name || !username || !password) {
            return NextResponse.json(
                { error: '所有字段都是必填的' },
                { status: 400 }
            );
        }

        // 检查用户配额
        const user = await prisma.user.findUnique({
            where: { id: session.id },
            include: { _count: { select: { databases: true } } }
        });

        if (user._count.databases >= user.dbQuota) {
            return NextResponse.json(
                { error: '已达到数据库配额限制' },
                { status: 400 }
            );
        }

        // 加密密码
        // const hashedPassword = await hashPassword(password);
        const hashedPassword = await encryptPassword(password);
        // const hashedApiPassword = await hashPassword(apiPassword);

        // 生成数据库主机地址（在实际应用中，这里应该调用数据库创建服务）
        const host = `db-${Math.random().toString(36).substring(2, 8)}.yunduo.app`;

        // 创建数据库记录
        const database = await prisma.database.create({
            data: {
                name,
                username,
                password: hashedPassword,
                apiPassword: "",
                host,
                userId: session.id,
                status: 'CREATING'
            },
        });

        // 在实际应用中，这里应该调用数据库创建服务
        // 模拟数据库创建过程
        setTimeout(async () => {
            await prisma.database.update({
                where: { id: database.id },
                data: { status: 'RUNNING' }
            });
        }, 5000);

        return NextResponse.json(database, { status: 201 });
    } catch (error) {
        console.error('创建数据库错误:', error);
        return NextResponse.json(
            { error: '服务器错误' },
            { status: 500 }
        );
    }
}