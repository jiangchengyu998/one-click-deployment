// src/app/api/admin/auth/route.js
import { NextResponse } from 'next/server';
import { verifyPassword } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { generateToken } from '@/lib/auth';

const INVALID_LOGIN_ERROR = '用户名或密码错误';
const DUMMY_PASSWORD_HASH = '$2b$12$91bp9.BpwP5nfXB7yTjx2em4fCQYTRxuCKsy31l.cp5nGvXFVWrl2';

export async function POST(request) {
    try {
        const { username, password } = await request.json();

        if (!username || !password) {
            return NextResponse.json(
                { error: '用户名和密码不能为空' },
                { status: 400 }
            );
        }

        // 查找管理员
        const admin = await prisma.admin.findUnique({
            where: { username }
        });

        // 验证密码
        const passwordHash = admin?.password || DUMMY_PASSWORD_HASH;
        const isValidPassword = await verifyPassword(password, passwordHash);

        if (!admin || !isValidPassword) {
            return NextResponse.json(
                { error: INVALID_LOGIN_ERROR },
                { status: 401 }
            );
        }

        // 生成JWT令牌
        const token = generateToken({
            id: admin.id,
            username: admin.username,
            role: 'admin'
        });

        // 设置HTTP-only cookie
        const response = NextResponse.json(
            { message: '登录成功', user: { id: admin.id, username: admin.username } },
            { status: 200 }
        );

        const isHttps = request.headers.get('x-forwarded-proto') === 'https' ||
            request.nextUrl.protocol === 'https:';

        response.cookies.set('admin-token', token, {
            httpOnly: true,
            secure: isHttps,
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60, // 7天
            path: '/',
        });

        return response;
    } catch (error) {
        console.error('管理员登录错误:', error);
        return NextResponse.json(
            { error: '服务器错误' },
            { status: 500 }
        );
    }
}
