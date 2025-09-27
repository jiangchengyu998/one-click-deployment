// src/app/api/databases/[id]/route.js
import { NextResponse } from 'next/server';
import { getUserSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import {decryptPassword} from "@/lib/db_password_utils";

// 获取数据库详情
export async function GET(request, { params }) {
    try {
        const session = await getUserSession(request);

        if (!session) {
            return NextResponse.json({ error: '未授权' }, { status: 401 });
        }

        const { id } = await params;

        const database = await prisma.database.findUnique({
            where: { id: id },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        code: true
                    }
                }
            }
        });

        if (!database) {
            return NextResponse.json({ error: '数据库不存在' }, { status: 404 });
        }

        // 检查权限
        if (database.userId !== session.id) {
            return NextResponse.json({ error: '无权访问此数据库' }, { status: 403 });
        }

        // database.password = decryptPassword(database.password); // 不返回密码字段
        return NextResponse.json(database);
    } catch (error) {
        console.error('获取数据库详情错误:', error);
        return NextResponse.json(
            { error: '服务器错误' },
            { status: 500 }
        );
    }
}

// 删除数据库
export async function DELETE(request, { params }) {
    try {
        const session = await getUserSession(request);

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

        // 检查权限
        if (database.userId !== session.id) {
            return NextResponse.json({ error: '无权删除此数据库' }, { status: 403 });
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