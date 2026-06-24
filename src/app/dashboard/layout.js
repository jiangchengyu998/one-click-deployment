// src/app/dashboard/layout.js (更新版)
"use client";

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import Logo from '@/components/Logo';
import { useI18n } from '@/components/i18n/LanguageProvider';

export default function DashboardLayout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const pathname = usePathname();
    const router = useRouter();
    const { t } = useI18n();

    const navigation = [
        { name: t('dashboard.overview'), href: '/dashboard', icon: 'fas fa-tachometer-alt' },
        { name: t('dashboard.apiServices'), href: '/dashboard/apis', icon: 'fas fa-code' },
        { name: t('dashboard.databases'), href: '/dashboard/databases', icon: 'fas fa-database' },
        { name: t('dashboard.profile'), href: '/dashboard/profile', icon: 'fas fa-user' },
    ];

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            router.push('/auth/login');
        } catch (error) {
            console.error(t('dashboard.logoutFailed'), error);
        }
    };

    return (
        <div className="h-screen flex overflow-hidden bg-gray-100">
            {/* 移动端侧边栏遮罩 */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 flex z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                >
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-75" />
                </div>
            )}

            {/* 侧边栏 */}
            <div className={`
        fixed inset-y-0 left-0 flex flex-col z-50 w-64 bg-gray-800 transform transition duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
                <div className="flex items-center justify-center h-16 px-4 bg-gray-900">
                    <Logo showWordmark wordmark={t('common.dashboard')} className="h-9 w-9" markClassName="text-white text-xl" />
                </div>

                <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href || (
                            item.href !== '/dashboard' && pathname.startsWith(`${item.href}/`)
                        );
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                prefetch
                                aria-current={isActive ? 'page' : undefined}
                                className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                                    isActive
                                        ? 'bg-gray-900 text-white'
                                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                }`}
                                onMouseEnter={() => router.prefetch(item.href)}
                                onClick={(event) => {
                                    if (pathname === item.href) {
                                        event.preventDefault();
                                    }
                                    setSidebarOpen(false);
                                }}
                            >
                                <i className={`${item.icon} mr-3 flex-shrink-0 h-6 w-6`}></i>
                                {item.name}
                            </Link>
                        )
                    })}
                </nav>
            </div>

            <div className="flex-1 overflow-auto focus:outline-none">
                {/* 顶部导航栏 */}
                <div className="relative z-10 flex items-center justify-between flex-shrink-0 h-16 bg-white border-b border-gray-200 lg:border-none">
                    <button
                        type="button"
                        className="px-4 text-gray-400 border-r border-gray-200 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 lg:hidden"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <span className="sr-only">{t('dashboard.openSidebar')}</span>
                        <i className="fas fa-bars w-6 h-6"></i>
                    </button>

                    <div className="flex justify-end flex-1 px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center ml-4 md:ml-6">
                            <div className="relative ml-3">
                                <div className="flex items-center space-x-4">
                                    <Link
                                        href="/dashboard/profile"
                                        prefetch
                                        className="text-sm text-gray-700 hover:text-gray-900"
                                        onMouseEnter={() => router.prefetch('/dashboard/profile')}
                                    >
                                        <i className="fas fa-user-circle mr-1"></i>{t('dashboard.profile')}
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="text-sm text-gray-700 hover:text-gray-900"
                                    >
                                        <i className="fas fa-sign-out-alt mr-1"></i>{t('dashboard.logout')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 主内容区域 */}
                <main className="flex-1 relative pb-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
