// src/app/dashboard/page.js
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import { useI18n } from '@/components/i18n/LanguageProvider';

export default function UserDashboard() {
    const { t } = useI18n();
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
            console.error(t('dashboard.fetchFailed'), error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <LoadingSkeleton
                rows={3}
                itemClassName="h-32"
                showToolbar={false}
                gridClassName="grid grid-cols-1 md:grid-cols-3 gap-6"
            />
        );
    }

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">{t('dashboard.welcome', { name: user?.name || '' })}</h1>
                <p className="text-gray-600">{t('dashboard.personalConsole')}</p>
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
                                    <dt className="text-sm font-medium text-gray-500 truncate">{t('dashboard.apiServices')}</dt>
                                    <dd className="text-lg font-medium text-gray-900">{stats.apiCount}/{user?.apiQuota}</dd>
                                </dl>
                            </div>
                        </div>
                        <div className="mt-4">
                            <Link
                                href="/dashboard/apis"
                                className="text-sm font-medium text-blue-600 hover:text-blue-500"
                            >
                                {t('dashboard.manageApiServices')}
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
                                    <dt className="text-sm font-medium text-gray-500 truncate">{t('dashboard.databases')}</dt>
                                    <dd className="text-lg font-medium text-gray-900">{stats.dbCount}/{user?.dbQuota}</dd>
                                </dl>
                            </div>
                        </div>
                        <div className="mt-4">
                            <Link
                                href="/dashboard/databases"
                                className="text-sm font-medium text-green-600 hover:text-green-500"
                            >
                                {t('dashboard.manageDatabases')}
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
                                    <dt className="text-sm font-medium text-gray-500 truncate">{t('dashboard.runningServices')}</dt>
                                    <dd className="text-lg font-medium text-gray-900">{stats.runningApis}</dd>
                                </dl>
                            </div>
                        </div>
                        <div className="mt-4">
              <span className="text-sm font-medium text-gray-500">
                {t('dashboard.healthy')}
              </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">{t('dashboard.quickStart')}</h3>
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Link
                            href="/dashboard/apis"
                            className="flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                        >
                            <i className="fas fa-code mr-2"></i> {t('dashboard.deployNewApi')}
                        </Link>
                        <Link
                            href="/dashboard/databases"
                            className="flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                        >
                            <i className="fas fa-database mr-2"></i> {t('dashboard.viewDatabases')}
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
