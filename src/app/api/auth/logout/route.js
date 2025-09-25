// src/app/api/auth/logout/route.js
import { NextResponse } from 'next/server';

export async function POST() {
    try {
        const response = NextResponse.json({ message: '退出登录成功' });

        // 清除用户token
        response.cookies.set('user-token', '', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 0, // 立即过期
            path: '/',
        });

        return response;
    } catch (error) {
        console.error('退出登录错误:', error);
        return NextResponse.json(
            { error: '服务器错误' },
            { status: 500 }
        );
    }
}