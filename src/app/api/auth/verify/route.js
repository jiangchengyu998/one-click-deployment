import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const token = searchParams.get('token');

        if (!token) {
            return NextResponse.redirect(new URL('/auth/login?error=无效的验证令牌', request.url));
        }

        // 查找未验证的用户
        const user = await prisma.user.findFirst({
            where: {
                verificationToken: token,
                isVerified: false,
            },
        });

        if (!user) {
            return NextResponse.redirect(new URL('/auth/login?error=验证链接无效或已过期', request.url));
        }

        // 更新用户验证状态
        await prisma.user.update({
            where: { id: user.id },
            data: {
                isVerified: true,
                verificationToken: null, // 清除验证令牌
            },
        });

        return NextResponse.redirect(new URL('/auth/login?message=邮箱验证成功，请登录', request.url));
    } catch (error) {
        console.error('邮箱验证错误:', error);
        return NextResponse.redirect(new URL('/auth/login?error=验证失败，请重试', request.url));
    }
}