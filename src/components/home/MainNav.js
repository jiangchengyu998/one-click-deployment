// src/components/home/MainNav.js
"use client";

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Logo from '@/components/Logo';

export default function MainNav() {
    const pathname = usePathname();

    // 在这些路径下不显示主导航
    const hideNavPaths = ['/admin', '/dashboard', '/auth'];
    const shouldHideNav = hideNavPaths.some(path => pathname.startsWith(path));

    if (shouldHideNav) {
        return null;
    }

    return (
        <header className="sticky top-0 z-[100] bg-white shadow-[0_4px_12px_rgba(0,0,0,0.1)]">
            <div className="mx-auto w-full max-w-[1400px] px-5 max-md:px-4">
                <nav className="flex items-center justify-between py-4 max-md:flex-col">
                    <div className="flex items-center text-2xl font-bold text-[#4a6ee0]">
                        <Link href="/" className="flex items-center text-inherit no-underline">
                            <Logo showWordmark className="h-9 w-9" />
                        </Link>
                    </div>
                    <ul className="flex list-none gap-8 max-md:my-5 max-md:flex-wrap max-md:justify-center max-md:gap-x-8 max-md:gap-y-2.5">
                        <li><Link href="/#features" className="font-medium text-[#333] no-underline transition hover:text-[#4a6ee0]">功能</Link></li>
                        <li><Link href="/#workflow" className="font-medium text-[#333] no-underline transition hover:text-[#4a6ee0]">使用流程</Link></li>
                        <li><Link href="/pricing" className="font-medium text-[#333] no-underline transition hover:text-[#4a6ee0]">定价</Link></li> {/* 更新为实际页面 */}
                        <li><Link href="/docs" className="font-medium text-[#333] no-underline transition hover:text-[#4a6ee0]">文档</Link></li> {/* 更新为实际页面 */}
                    </ul>
                    <div className="flex flex-wrap justify-center gap-3">
                        <a
                            href="https://github.com/jiangchengyu998/one-click-deployment"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-gray-300 px-5 py-2.5 text-base font-medium text-[#333] transition duration-300 hover:-translate-y-0.5 hover:border-[#4a6ee0] hover:text-[#4a6ee0] hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] max-md:px-4 max-md:py-2 max-md:text-sm"
                        >
                            <i className="fab fa-github mr-2"></i>GitHub
                        </a>
                        <Link href="/auth/login" className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-[#4a6ee0] px-5 py-2.5 text-base font-medium text-[#4a6ee0] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] max-md:px-4 max-md:py-2 max-md:text-sm">登录</Link>
                        <Link href="/auth/register" className="inline-flex cursor-pointer items-center justify-center rounded-lg bg-[#4a6ee0] px-5 py-2.5 text-base font-medium text-white transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] max-md:px-4 max-md:py-2 max-md:text-sm">免费注册</Link>
                    </div>
                </nav>
            </div>
        </header>
    );
}
