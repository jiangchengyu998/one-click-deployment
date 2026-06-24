import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { sendPasswordResetEmail } from '@/lib/email';
import { isValidEmail } from '@/lib/utils';

const RESET_REQUEST_RECEIVED_MESSAGE = '如果该邮箱已注册，我们会发送密码重置邮件';
const RESET_TOKEN_EXPIRES_IN_MS = 60 * 60 * 1000;

function hashResetToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
}

export async function POST(request) {
    try {
        const { email } = await request.json();
        const normalizedEmail = email?.trim().toLowerCase();

        if (!normalizedEmail || !isValidEmail(normalizedEmail)) {
            return NextResponse.json(
                { error: '请输入有效的邮箱地址' },
                { status: 400 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { email: normalizedEmail },
            select: { id: true, email: true, name: true }
        });

        if (user) {
            const resetToken = crypto.randomBytes(32).toString('hex');
            const resetPasswordToken = hashResetToken(resetToken);
            const resetPasswordExpires = new Date(Date.now() + RESET_TOKEN_EXPIRES_IN_MS);

            await prisma.user.update({
                where: { id: user.id },
                data: {
                    resetPasswordToken,
                    resetPasswordExpires
                }
            });

            await sendPasswordResetEmail(user.email, resetToken, user.name);
        }

        return NextResponse.json(
            { message: RESET_REQUEST_RECEIVED_MESSAGE },
            { status: 200 }
        );
    } catch (error) {
        console.error('申请重置密码错误:', error);
        return NextResponse.json(
            { error: '服务器错误' },
            { status: 500 }
        );
    }
}
