import { NextResponse } from 'next/server';
import { hashPassword } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { sendVerificationEmail } from '@/lib/email';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request) {
    try {
        const { name, email, password } = await request.json();

        if (!name || !email || !password) {
            return NextResponse.json(
                { error: '姓名、邮箱和密码不能为空' },
                { status: 400 }
            );
        }

        // 检查邮箱是否已存在
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: '该邮箱已被注册' },
                { status: 400 }
            );
        }

        // 生成验证令牌
        const verificationToken = uuidv4();

        // 创建用户（未验证状态）
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: await hashPassword(password),
                code: Math.random().toString(36).substring(2, 10).toUpperCase(),
                verificationToken,
                isVerified: false,
            },
        });

        // 发送验证邮件
        try {
            await sendVerificationEmail(email, verificationToken, name);
        } catch (emailError) {
            console.error('发送验证邮件失败:', emailError);
            // 如果邮件发送失败，删除用户记录
            await prisma.user.delete({ where: { id: user.id } });
            return NextResponse.json(
                { error: '邮件发送失败，请稍后重试' },
                { status: 500 }
            );
        }

        return NextResponse.json(
            {
                message: '注册成功，请检查您的邮箱以完成验证',
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                }
            },
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