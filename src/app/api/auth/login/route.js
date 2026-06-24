import { NextResponse } from 'next/server';
import { verifyPassword, generateToken } from '@/lib/auth';
import { prisma } from '@/lib/db';

const INVALID_LOGIN_ERROR = '邮箱或密码错误';
const DUMMY_PASSWORD_HASH = '$2b$12$91bp9.BpwP5nfXB7yTjx2em4fCQYTRxuCKsy31l.cp5nGvXFVWrl2';

export async function POST(request) {
    try {
        const { email, password, rememberMe } = await request.json();

        if (!email || !password) {
            return NextResponse.json(
                { error: '邮箱和密码不能为空' },
                { status: 400 }
            );
        }

        // 查找用户
        const user = await prisma.user.findUnique({
            where: { email },
        });

        // 验证密码
        const passwordHash = user?.password || DUMMY_PASSWORD_HASH;
        const isValidPassword = await verifyPassword(password, passwordHash);
        if (!user || !isValidPassword) {
            return NextResponse.json(
                { error: INVALID_LOGIN_ERROR },
                { status: 401 }
            );
        }

        // 检查用户是否已验证邮箱
        if (!user.isVerified) {
            return NextResponse.json(
                { error: '请先验证您的邮箱地址' },
                { status: 401 }
            );
        }

        // 生成JWT
        const token = generateToken({
            id: user.id,
            email: user.email,
            name: user.name,
            code: user.code,
            role: 'user',
        });

        // 设置 cookie
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/',
        };

        if (rememberMe) {
            cookieOptions.maxAge = 30 * 24 * 60 * 60; // 30 天
        }

        const response = NextResponse.json(
            {
                message: '登录成功',
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    code: user.code,
                    apiQuota: user.apiQuota,
                    dbQuota: user.dbQuota,
                },
            },
            { status: 200 }
        );

        response.cookies.set('user-token', token, cookieOptions);

        return response;
    } catch (error) {
        console.error('用户登录错误:', error);
        return NextResponse.json(
            { error: '服务器错误' },
            { status: 500 }
        );
    }
}
