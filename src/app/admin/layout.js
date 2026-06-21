// src/app/admin/layout.js
"use client";

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import AdminSidebar from '@/components/admin/Sidebar';
import AdminHeader from '@/components/admin/Header';

export default function AdminLayout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [checkingLogin, setCheckingLogin] = useState(true);
    const pathname = usePathname();
    const isLoginPage = pathname === '/admin/login';

    useEffect(() => {
        if (isLoginPage) {
            setCheckingLogin(false);
            return;
        }

        const checkLogin = async () => {
            try {
                const response = await fetch('/api/admin/check-login', {
                    cache: 'no-store',
                    credentials: 'include',
                });
                const data = await response.json();

                if (!response.ok || !data.isLoggedIn) {
                    window.location.replace('/admin/login');
                    return;
                }
            } catch (error) {
                window.location.replace('/admin/login');
                return;
            }

            setCheckingLogin(false);
        };

        checkLogin();
    }, [isLoginPage]);

    if (isLoginPage) {
        return children;
    }

    if (checkingLogin) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100 text-gray-500">
                正在进入管理后台...
            </div>
        );
    }

    return (
        <div className="h-screen flex overflow-hidden bg-gray-100">
            <AdminSidebar open={sidebarOpen} setOpen={setSidebarOpen} />

            <div className="flex-1 overflow-auto focus:outline-none">
                <AdminHeader setSidebarOpen={setSidebarOpen} />
                <main className="flex-1 relative pb-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
