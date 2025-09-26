// src/app/api/auth/register/route.js
import { NextResponse } from 'next/server';
import { hashPassword } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { generateUserCode } from '@/lib/utils';

export async function POST(request) {
    try {
        const { name, email, password } = await request.json();

        // 验证必填字段
        if (!name || !email || !password) {
            return NextResponse.json(
                { error: '所有字段都是必填的' },
                { status: 400 }
            );
        }

        // 检查邮箱格式
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: '邮箱格式不正确' },
                { status: 400 }
            );
        }

        // 检查密码长度
        if (password.length < 6) {
            return NextResponse.json(
                { error: '密码至少需要6位字符' },
                { status: 400 }
            );
        }

        // 检查用户是否已存在
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return NextResponse.json(
                { error: '该邮箱已被注册' },
                { status: 400 }
            );
        }

        // 生成用户代码
        let code;
        let isUnique = false;
        let attempts = 0;

        // 尝试生成唯一代码（最多尝试10次）
        while (!isUnique && attempts < 10) {
            code = generateUserCode();
            const existingCode = await prisma.user.findUnique({
                where: { code }
            });
            isUnique = !existingCode;
            attempts++;
        }

        if (!isUnique) {
            return NextResponse.json(
                { error: '生成用户代码失败，请重试' },
                { status: 500 }
            );
        }

        // 加密密码
        const hashedPassword = await hashPassword(password);

        // 创建用户
        const user = await prisma.user.create({
            data: {
                code,
                name,
                email,
                password: hashedPassword,
                apiQuota: 2, // 默认API配额
                dbQuota: 2,  // 默认数据库配额
            },
        });

        return NextResponse.json(
            { message: '用户注册成功' },
            { status: 201 }
        );
    } catch (error) {
        console.error('注册错误:', error);
        return NextResponse.json(
            { error: '服务器错误' },
            { status: 500 }
        );
    }
}