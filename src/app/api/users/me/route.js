// src/app/api/users/me/route.js
import { NextResponse } from 'next/server';
import { getUserSession, hashPassword, verifyPassword } from '@/lib/auth';
import { prisma } from '@/lib/db';

// 获取当前用户信息
export async function GET(request) {
    try {
        const session = await getUserSession(request);

        if (!session) {
            return NextResponse.json({ error: '未授权' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: session.id },
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
            }
        });

        if (!user) {
            return NextResponse.json({ error: '用户不存在' }, { status: 404 });
        }

        return NextResponse.json(user);
    } catch (error) {
        console.error('获取用户信息错误:', error);
        return NextResponse.json(
            { error: '服务器错误' },
            { status: 500 }
        );
    }
}

// 更新当前用户信息
export async function PATCH(request) {
    try {
        const session = await getUserSession(request);

        if (!session) {
            return NextResponse.json({ error: '未授权' }, { status: 401 });
        }

        const updates = await request.json();

        // 只允许更新特定字段
        const allowedUpdates = ['name', 'avatar'];
        const filteredUpdates = Object.keys(updates)
            .filter(key => allowedUpdates.includes(key))
            .reduce((obj, key) => {
                obj[key] = updates[key];
                return obj;
            }, {});

        const user = await prisma.user.update({
            where: { id: session.id },
            data: filteredUpdates,
            select: {
                id: true,
                code: true,
                name: true,
                email: true,
                avatar: true,
                apiQuota: true,
                dbQuota: true,
                createdAt: true,
                updatedAt: true
            }
        });

        return NextResponse.json(user);
    } catch (error) {
        console.error('更新用户信息错误:', error);
        return NextResponse.json(
            { error: '服务器错误' },
            { status: 500 }
        );
    }
}