import { NextResponse } from 'next/server';
import { getAdminSession, hashPassword, verifyPassword } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function PATCH(request) {
    try {
        const session = await getAdminSession(request);

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

        const admin = await prisma.admin.findUnique({
            where: { id: session.id },
            select: { password: true }
        });

        if (!admin) {
            return NextResponse.json({ error: '未授权' }, { status: 401 });
        }

        const isCurrentPasswordValid = await verifyPassword(currentPassword, admin.password);

        if (!isCurrentPasswordValid) {
            return NextResponse.json(
                { error: '当前密码错误' },
                { status: 401 }
            );
        }

        await prisma.admin.update({
            where: { id: session.id },
            data: { password: await hashPassword(newPassword) }
        });

        return NextResponse.json({ message: '密码更新成功' });
    } catch (error) {
        console.error('更新管理员密码错误:', error);
        return NextResponse.json(
            { error: '服务器错误' },
            { status: 500 }
        );
    }
}
