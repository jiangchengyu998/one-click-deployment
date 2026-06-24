// src/app/admin/page.js
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import { fetchAdminJson, getAdminCachedData } from '@/lib/adminDataCache';

export default function AdminDashboard() {
    const cachedStats = getAdminCachedData('admin:dashboard');
    const [stats, setStats] = useState(cachedStats || {
        totalUsers: 0,
        totalApis: 0,
        totalDatabases: 0,
        activeApis: 0
    });
    const [loading, setLoading] = useState(!cachedStats);
    const router = useRouter();

    useEffect(() => {
        fetchDashboardData({ quiet: !!cachedStats });
    }, []);

    const fetchDashboardData = async ({ quiet = false } = {}) => {
        if (!quiet) {
            setLoading(true);
        }

        try {
            const data = await fetchAdminJson('admin:dashboard', '/api/admin/dashboard', { force: quiet });
            setStats(data);
        } catch (error) {
            if (error.status === 401) {
                router.push('/admin/login');
                return;
            }
            console.error('获取仪表板数据失败:', error);
        } finally {
            if (!quiet) {
                setLoading(false);
            }
        }
    };

    if (loading) {
        return (
            <LoadingSkeleton
                rows={4}
                itemClassName="h-32"
                showToolbar={false}
                gridClassName="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            />
        );
    }

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">管理仪表板</h1>
                <p className="text-gray-600">平台概览和统计数据</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <i className="fas fa-users text-blue-500 text-2xl"></i>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">总用户数</dt>
                                    <dd className="text-lg font-medium text-gray-900">{stats.totalUsers}</dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <i className="fas fa-code text-green-500 text-2xl"></i>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">应用总数</dt>
                                    <dd className="text-lg font-medium text-gray-900">{stats.totalApis}</dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <i className="fas fa-database text-purple-500 text-2xl"></i>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">数据库总数</dt>
                                    <dd className="text-lg font-medium text-gray-900">{stats.totalDatabases}</dd>
                                </dl>
                            </div>
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
                                    <dt className="text-sm font-medium text-gray-500 truncate">运行中应用</dt>
                                    <dd className="text-lg font-medium text-gray-900">{stats.activeApis}</dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">快速操作</h3>
                        <div className="mt-4 grid grid-cols-2 gap-4">
                            <Link
                                href="/admin/users"
                                prefetch
                                className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                            >
                                <i className="fas fa-users mr-2"></i> 用户管理
                            </Link>
                            <Link
                                href="/admin/apis"
                                prefetch
                                className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                            >
                                <i className="fas fa-code mr-2"></i> 应用管理
                            </Link>
                            <Link
                                href="/admin/databases"
                                prefetch
                                className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
                            >
                                <i className="fas fa-database mr-2"></i> 数据库管理
                            </Link>
                            <button className="flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                                <i className="fas fa-cog mr-2"></i> 系统设置
                            </button>
                        </div>
                    </div>
                </div>

                <div className="bg-white shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">最近活动</h3>
                        <div className="mt-4">
                            <p className="text-sm text-gray-500">暂无最近活动</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
