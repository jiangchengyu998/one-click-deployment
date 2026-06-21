// src/app/api/auth/check-login/route.js
// 检查用户是否登录
import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
    try {
        const session = await getAdminSession(request);

        if (session) {
            return NextResponse.json(
                { isLoggedIn: true, user: session },
                { headers: { 'Cache-Control': 'no-store' } }
            );
        } else {
            return NextResponse.json(
                { isLoggedIn: false },
                { headers: { 'Cache-Control': 'no-store' } }
            );
        }
    } catch (error) {
        console.error('检查登录状态错误:', error);
        return NextResponse.json(
            { error: '服务器错误' },
            { status: 500 }
        );
    }
}
