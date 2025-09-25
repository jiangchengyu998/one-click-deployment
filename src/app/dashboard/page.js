// src/app/dashboard/page.js
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function UserDashboard() {
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState({
        apiCount: 0,
        dbCount: 0,
        runningApis: 0
    });
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const response = await fetch('/api/users/dashboard');

            if (response.status === 401) {
                // 未授权，跳转到登录页
                router.push('/auth/login');
                return;
            }

            if (response.ok) {
                const data = await response.json();
                setUser(data.user);
                setStats(data.stats);
            }
        } catch (error) {
            console.error('获取仪表板数据失败:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="p-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="h-32 bg-gray-200 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">欢迎回来, {user?.name}!</h1>
                <p className="text-gray-600">您的个人控制台</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <i className="fas fa-code text-blue-500 text-2xl"></i>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">API服务</dt>
                                    <dd className="text-lg font-medium text-gray-900">{stats.apiCount}/{user?.apiQuota}</dd>
                                </dl>
                            </div>
                        </div>
                        <div className="mt-4">
                            <Link
                                href="/dashboard/apis"
                                className="text-sm font-medium text-blue-600 hover:text-blue-500"
                            >
                                管理API服务
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <i className="fas fa-database text-green-500 text-2xl"></i>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">数据库</dt>
                                    <dd className="text-lg font-medium text-gray-900">{stats.dbCount}/{user?.dbQuota}</dd>
                                </dl>
                            </div>
                        </div>
                        <div className="mt-4">
                            <Link
                                href="/dashboard/databases"
                                className="text-sm font-medium text-green-600 hover:text-green-500"
                            >
                                管理数据库
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <i className="fas fa-play-circle text-yellow-500 text-2xl"></i>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">运行中服务</dt>
                                    <dd className="text-lg font-medium text-gray-900">{stats.runningApis}</dd>
                                </dl>
                            </div>
                        </div>
                        <div className="mt-4">
              <span className="text-sm font-medium text-gray-500">
                正常运行
              </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">快速开始</h3>
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Link
                            href="/dashboard/apis"
                            className="flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                        >
                            <i className="fas fa-code mr-2"></i> 部署新API
                        </Link>
                        <Link
                            href="/dashboard/databases"
                            className="flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                        >
                            <i className="fas fa-database mr-2"></i> 创建数据库
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}