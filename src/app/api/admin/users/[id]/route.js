// src/app/api/admin/users/[id]/route.js
import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { prisma } from '@/lib/db';

// 获取单个用户详情
export async function GET(request, { params }) {
    try {
        const session = await getAdminSession(request);

        if (!session) {
            return NextResponse.json({ error: '未授权' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: params.id },
            include: {
                apis: true,
                databases: true
            }
        });

        if (!user) {
            return NextResponse.json({ error: '用户不存在' }, { status: 404 });
        }

        return NextResponse.json(user);
    } catch (error) {
        console.error('获取用户详情错误:', error);
        return NextResponse.json(
            { error: '服务器错误' },
            { status: 500 }
        );
    }
}

// 更新用户信息
export async function PATCH(request, { params }) {
    try {
        const session = await getAdminSession(request);

        if (!session) {
            return NextResponse.json({ error: '未授权' }, { status: 401 });
        }

        const updates = await request.json();

        // 只允许更新特定字段
        const allowedUpdates = ['apiQuota', 'dbQuota', 'name'];
        const filteredUpdates = Object.keys(updates)
            .filter(key => allowedUpdates.includes(key))
            .reduce((obj, key) => {
                obj[key] = updates[key];
                return obj;
            }, {});

        const { id } = await params

        const user = await prisma.user.update({
            where: { id: id },
            data: filteredUpdates
        });

        return NextResponse.json(user);
    } catch (error) {
        console.error('更新用户错误:', error);
        return NextResponse.json(
            { error: '服务器错误' },
            { status: 500 }
        );
    }
}

// 删除用户
export async function DELETE(request, { params }) {
    try {
        const session = await getAdminSession(request);

        if (!session) {
            return NextResponse.json({ error: '未授权' }, { status: 401 });
        }

        // 检查用户是否存在
        const user = await prisma.user.findUnique({
            where: { id: params.id }
        });

        if (!user) {
            return NextResponse.json({ error: '用户不存在' }, { status: 404 });
        }

        // 删除用户及其关联数据（由于设置了级联删除）
        await prisma.user.delete({
            where: { id: params.id }
        });

        return NextResponse.json({ message: '用户删除成功' });
    } catch (error) {
        console.error('删除用户错误:', error);
        return NextResponse.json(
            { error: '服务器错误' },
            { status: 500 }
        );
    }
}