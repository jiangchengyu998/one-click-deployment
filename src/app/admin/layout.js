// src/app/admin/layout.js
"use client";

import { useState } from 'react';
import AdminSidebar from '@/components/admin/Sidebar';
import AdminHeader from '@/components/admin/Header';

export default function AdminLayout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

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