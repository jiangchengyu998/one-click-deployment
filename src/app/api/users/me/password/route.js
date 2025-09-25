// src/app/api/users/me/password/route.js
import { NextResponse } from 'next/server';
import { getUserSession, hashPassword, verifyPassword } from '@/lib/auth';
import { prisma } from '@/lib/db';

// 更新用户密码
export async function PATCH(request) {
    try {
        const session = await getUserSession(request);

        if (!session) {
            return NextResponse.json({ error: '未授权' }, { status: 401 });
        }

        const { currentPassword, newPassword } = await request.json();

        if (!currentPassword || !newPassword) {
            return NextResponse.json(
                { error: '当前密码和新密码不能为空' },
                { status: 400 }
            );
        }

        if (newPassword.length < 6) {
            return NextResponse.json(
                { error: '新密码至少需要6位字符' },
                { status: 400 }
            );
        }

        // 获取用户当前密码
        const user = await prisma.user.findUnique({
            where: { id: session.id },
            select: { password: true }
        });

        if (!user) {
            return NextResponse.json({ error: '用户不存在' }, { status: 404 });
        }

        // 验证当前密码
        const isCurrentPasswordValid = await verifyPassword(currentPassword, user.password);

        if (!isCurrentPasswordValid) {
            return NextResponse.json(
                { error: '当前密码错误' },
                { status: 401 }
            );
        }

        // 加密新密码
        const hashedNewPassword = await hashPassword(newPassword);

        // 更新密码
        await prisma.user.update({
            where: { id: session.id },
            data: { password: hashedNewPassword }
        });

        return NextResponse.json({ message: '密码更新成功' });
    } catch (error) {
        console.error('更新密码错误:', error);
        return NextResponse.json(
            { error: '服务器错误' },
            { status: 500 }
        );
    }
}