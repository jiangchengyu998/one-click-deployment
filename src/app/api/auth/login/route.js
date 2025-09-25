// src/app/api/auth/login/route.js
import { NextResponse } from 'next/server';
import { verifyPassword, generateToken } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(request) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json(
                { error: '邮箱和密码不能为空' },
                { status: 400 }
            );
        }

        // 查找用户
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            return NextResponse.json(
                { error: '用户不存在' },
                { status: 401 }
            );
        }

        // 验证密码
        const isValidPassword = await verifyPassword(password, user.password);

        if (!isValidPassword) {
            return NextResponse.json(
                { error: '密码错误' },
                { status: 401 }
            );
        }

        // 生成JWT令牌
        const token = generateToken({
            id: user.id,
            email: user.email,
            name: user.name,
            role: 'user'
        });

        // 设置HTTP-only cookie
        const response = NextResponse.json(
            {
                message: '登录成功',
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    code: user.code,
                    apiQuota: user.apiQuota,
                    dbQuota: user.dbQuota
                }
            },
            { status: 200 }
        );

        response.cookies.set('user-token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60, // 7天
            path: '/',
        });

        return response;
    } catch (error) {
        console.error('用户登录错误:', error);
        return NextResponse.json(
            { error: '服务器错误' },
            { status: 500 }
        );
    }
}