// src/components/admin/Sidebar.js
"use client";

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navigation = [
    { name: '仪表板', href: '/admin', icon: 'fas fa-tachometer-alt' },
    { name: '用户管理', href: '/admin/users', icon: 'fas fa-users' },
    { name: 'API管理', href: '/admin/apis', icon: 'fas fa-code' },
    { name: '数据库管理', href: '/admin/databases', icon: 'fas fa-database' },
]

export default function AdminSidebar({ open, setOpen }) {
    const pathname = usePathname()

    return (
        <>
            {/* 移动端遮罩 */}
            {open && (
                <div
                    className="fixed inset-0 flex z-40 lg:hidden"
                    onClick={() => setOpen(false)}
                >
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-75" />
                </div>
            )}

            {/* 侧边栏 */}
            <div className={`
        fixed inset-y-0 left-0 flex flex-col z-50 w-64 bg-gray-800 transform transition duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${open ? 'translate-x-0' : '-translate-x-full'}
      `}>
                <div className="flex items-center justify-center h-16 px-4 bg-gray-900">
                    <div className="flex items-center">
                        <i className="fas fa-cloud text-white text-2xl mr-2"></i>
                        <span className="text-white text-xl font-semibold">管理后台</span>
                    </div>
                </div>

                <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                                    isActive
                                        ? 'bg-gray-900 text-white'
                                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                }`}
                                onClick={() => setOpen(false)}
                            >
                                <i className={`${item.icon} mr-3 flex-shrink-0 h-6 w-6`}></i>
                                {item.name}
                            </Link>
                        )
                    })}
                </nav>
            </div>
        </>
    )
}