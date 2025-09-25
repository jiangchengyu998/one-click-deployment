// middleware.js
import { NextResponse } from 'next/server'

export function middleware(request) {
    // 管理员路由保护
    // if (request.nextUrl.pathname.startsWith('/admin')) {
    //     const token = request.cookies.get('admin-token')
    //
    //     if (!token) {
    //         return NextResponse.redirect(new URL('/admin/login', request.url))
    //     }
    // }

    // 用户路由保护
    // if (request.nextUrl.pathname.startsWith('/dashboard')) {
    //     const token = request.cookies.get('user-token')
    //
    //     if (!token) {
    //         return NextResponse.redirect(new URL('/auth/login', request.url))
    //     }
    // }

    // return NextResponse.next()
}

export const config = {
    matcher: ['/admin/:path*', '/dashboard/:path*']
}