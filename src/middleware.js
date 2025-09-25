// middleware.js
import { NextResponse } from 'next/server'

export function middleware(request) {
    const { pathname } = request.nextUrl

    // 需要排除的公开页面（不需要 token）
    const publicPaths = ['/admin/login', '/admin/register', '/auth/login', '/auth/register']

    // 如果当前访问的路径在公开页面列表里，就直接放行
    if (publicPaths.some(path => pathname.startsWith(path))) {
        return NextResponse.next()
    }

    // 管理员路由保护
    if (pathname.startsWith('/admin')) {
        const token = request.cookies.get('admin-token')
        if (!token) {
            return NextResponse.redirect(new URL('/admin/login', request.url))
        }
    }

    // 用户路由保护
    if (pathname.startsWith('/dashboard')) {
        const token = request.cookies.get('user-token')
        if (!token) {
            return NextResponse.redirect(new URL('/auth/login', request.url))
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/admin/:path*', '/dashboard/:path*']
}
