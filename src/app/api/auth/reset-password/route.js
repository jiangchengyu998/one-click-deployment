import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { hashPassword } from '@/lib/auth';
import { prisma } from '@/lib/db';

function hashResetToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
}

export async function POST(request) {
    try {
        const { token, password } = await request.json();

        if (!token || !password) {
            return NextResponse.json(
                { error: '重置链接和新密码不能为空' },
                { status: 400 }
            );
        }

        if (password.length < 6) {
            return NextResponse.json(
                { error: '密码至少需要6位字符' },
                { status: 400 }
            );
        }

        const user = await prisma.user.findFirst({
            where: {
                resetPasswordToken: hashResetToken(token),
                resetPasswordExpires: {
                    gt: new Date()
                }
            },
            select: { id: true }
        });

        if (!user) {
            return NextResponse.json(
                { error: '重置链接无效或已过期，请重新申请' },
                { status: 400 }
            );
        }

        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: await hashPassword(password),
                resetPasswordToken: null,
                resetPasswordExpires: null
            }
        });

        const response = NextResponse.json(
            { message: '密码已重置，请使用新密码登录' },
            { status: 200 }
        );

        response.cookies.set('user-token', '', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 0,
            path: '/'
        });

        return response;
    } catch (error) {
        console.error('重置密码错误:', error);
        return NextResponse.json(
            { error: '服务器错误' },
            { status: 500 }
        );
    }
}
