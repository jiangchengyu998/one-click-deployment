import { NextResponse } from 'next/server';
import { hashPassword } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { sendVerificationEmail } from '@/lib/email';
import { v4 as uuidv4 } from 'uuid';
import {generateUserCode} from "@/lib/utils";
import {
    buildDefaultDatabaseCredentials,
    createDatabaseRecord,
    startDatabaseProvisioning
} from '@/lib/databaseProvisioning';

const REGISTRATION_RECEIVED_MESSAGE = '注册请求已收到。如果该邮箱可以注册，请检查邮箱完成验证';

export async function POST(request) {
    try {
        const { name, email, password } = await request.json();
        const trimmedName = name?.trim();
        const normalizedEmail = email?.trim().toLowerCase();

        if (!trimmedName || !normalizedEmail || !password) {
            return NextResponse.json(
                { error: '姓名、邮箱和密码不能为空' },
                { status: 400 }
            );
        }

        // 检查邮箱是否已存在
        const existingUser = await prisma.user.findUnique({
            where: { email: normalizedEmail },
        });

        if (existingUser) {
            return NextResponse.json(
                { message: REGISTRATION_RECEIVED_MESSAGE },
                { status: 200 }
            );
        }

        // 生成验证令牌
        const verificationToken = uuidv4();

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
                { error: '用户代码生成失败，请稍后重试' },
                { status: 500 }
            );
        }

        // 创建用户（未验证状态）
        const user = await prisma.user.create({
            data: {
                name: trimmedName,
                email: normalizedEmail,
                password: await hashPassword(password),
                code: code,
                verificationToken,
                isVerified: false,
            },
        });

        const defaultDatabase = buildDefaultDatabaseCredentials(user, password);
        let database;

        try {
            database = await createDatabaseRecord({
                userId: user.id,
                ...defaultDatabase
            });
        } catch (databaseError) {
            console.error('初始化默认数据库失败:', databaseError);
            await prisma.user.delete({ where: { id: user.id } });
            return NextResponse.json(
                { error: '默认数据库初始化失败，请稍后重试' },
                { status: 500 }
            );
        }

        // 发送验证邮件
        try {
            await sendVerificationEmail(normalizedEmail, verificationToken, trimmedName);
        } catch (emailError) {
            console.error('发送验证邮件失败:', emailError);
            // 如果邮件发送失败，删除用户记录
            await prisma.user.delete({ where: { id: user.id } });
            return NextResponse.json(
                { error: '邮件发送失败，请稍后重试' },
                { status: 500 }
            );
        }

        startDatabaseProvisioning({
            databaseId: database.id,
            name: database.name,
            username: database.username,
            password
        });

        return NextResponse.json(
            {
                message: REGISTRATION_RECEIVED_MESSAGE
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('注册错误:', error);
        return NextResponse.json(
            { error: '服务器错误' },
            { status: 500 }
        );
    }
}
