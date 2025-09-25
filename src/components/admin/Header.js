// src/components/admin/Header.js
"use client";

export default function AdminHeader({ setSidebarOpen }) {
    return (
        <div className="relative z-10 flex items-center justify-between flex-shrink-0 h-16 bg-white border-b border-gray-200 lg:border-none">
            <button
                type="button"
                className="px-4 text-gray-400 border-r border-gray-200 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 lg:hidden"
                onClick={() => setSidebarOpen(true)}
            >
                <span className="sr-only">打开侧边栏</span>
                <i className="fas fa-bars w-6 h-6"></i>
            </button>

            <div className="flex justify-end flex-1 px-4 sm:px-6 lg:px-8">
                <div className="flex items-center ml-4 md:ml-6">
                    <button className="p-1 text-gray-400 bg-white rounded-full hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        <span className="sr-only">查看通知</span>
                        <i className="fas fa-bell w-6 h-6"></i>
                    </button>

                    <div className="relative ml-3">
                        <div className="flex items-center max-w-xs text-sm bg-white rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                            <span className="sr-only">打开用户菜单</span>
                            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                                <i className="fas fa-user text-gray-600"></i>
                            </div>
                            <span className="ml-2 text-sm font-medium text-gray-700">管理员</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}