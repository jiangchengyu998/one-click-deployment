// src/app/dashboard/databases/[id]/page.js
"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import StatusBadge from '@/components/ui/StatusBadge';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';


export default function DatabaseDetail() {
    const [database, setDatabase] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const router = useRouter();
    const params = useParams();

    useEffect(() => {
        fetchDatabaseDetail();
    }, [params.id]);

    const fetchDatabaseDetail = async () => {
        try {
            const response = await fetch(`/api/databases/${params.id}`);

            if (response.status === 401) {
                router.push('/auth/login');
                return;
            }

            if (response.status === 404) {
                router.push('/dashboard/databases');
                return;
            }

            if (response.ok) {
                const data = await response.json();
                setDatabase(data);
            }
        } catch (error) {
            console.error('获取数据库详情失败:', error);
        } finally {
            setLoading(false);
        }
    };

    const deleteDatabase = async () => {
        if (!confirm('确定要删除这个数据库吗？此操作不可恢复！')) return;

        setActionLoading(true);

        try {
            const response = await fetch(`/api/databases/${params.id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                router.push('/dashboard/databases');
            } else {
                alert('删除失败');
            }
        } catch (error) {
            alert('网络错误，请重试');
        } finally {
            setActionLoading(false);
        }
    };

    const copyToClipboard = async (text) => {
        try {
            await navigator.clipboard.writeText(text);
            alert('已复制到剪贴板');
        } catch (error) {
            alert('复制失败，请手动复制');
        }
    };

    if (loading) {
        return <LoadingSkeleton rows={1} itemClassName="h-64" showToolbar={false} />;
    }

    if (!database) {
        return (
            <div className="p-6">
                <div className="text-center py-12">
                    <i className="fas fa-exclamation-triangle text-yellow-500 text-4xl mb-3"></i>
                    <p className="text-gray-500">数据库不存在</p>
                    <Link href="/dashboard/databases" className="text-blue-600 hover:text-blue-800">
                        返回数据库列表
                    </Link>
                </div>
            </div>
        );
    }

    const maskedConnectionUrl = `mysql://${database.username}:<登录密码>@${database.host}/${database.name}`;

    return (
        <div className="p-6">
            <div className="mb-6">
                <Link
                    href="/dashboard/databases"
                    className="text-blue-600 hover:text-blue-800 mb-4 inline-block"
                >
                    <i className="fas fa-arrow-left mr-2"></i>返回数据库列表
                </Link>
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{database.name}</h1>
                        <p className="text-gray-600">注册后自动创建的 MySQL 数据库</p>
                    </div>
                    <button
                        onClick={deleteDatabase}
                        disabled={actionLoading}
                        className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50"
                    >
                        {actionLoading ? '删除中...' : '删除数据库'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 基本信息卡片 */}
                <div className="bg-white shadow rounded-lg p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">基本信息</h2>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-gray-600">数据库名称</span>
                            <span className="font-medium">{database.name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">状态</span>
                            <StatusBadge status={database.status} type="database" />
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">创建时间</span>
                            <span className="font-medium">
                {new Date(database.createdAt).toLocaleString('zh-CN')}
              </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">更新时间</span>
                            <span className="font-medium">
                {new Date(database.updatedAt).toLocaleString('zh-CN')}
              </span>
                        </div>
                    </div>
                </div>

                {/* 连接信息卡片 */}
                <div className="bg-white shadow rounded-lg p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">连接信息</h2>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">主机地址</span>
                            <span className="font-medium font-mono">{database.host}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">用户名</span>
                            <span className="font-medium font-mono">{database.username}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">数据库密码</span>
                            <span className="font-medium text-gray-900">同注册登录密码</span>
                        </div>
                        <div className="flex justify-between items-start gap-4">
                            <span className="text-gray-600">连接地址</span>
                            <div className="text-right">
                                <div className="font-medium font-mono text-sm break-all">{maskedConnectionUrl}</div>
                                <button
                                    onClick={() => copyToClipboard(maskedConnectionUrl)}
                                    className="mt-1 text-sm text-blue-600 hover:text-blue-800"
                                >
                                    <i className="fas fa-copy mr-1"></i>复制
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 连接示例卡片 */}
                <div className="bg-white shadow rounded-lg p-6 lg:col-span-2">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">连接示例</h2>
                    <div className="bg-gray-900 text-gray-100 p-4 rounded font-mono text-sm">
                        <div className="mb-2">
                            <span className="text-green-400"># MySQL 连接示例</span>
                        </div>
                        <div className="mb-1">
                            <span className="text-blue-400">mysql</span> -h <span className="text-yellow-400">{database.host}</span> -u <span className="text-yellow-400">{database.username}</span> -p <span className="text-yellow-400">{database.name}</span>
                        </div>
                        <div className="mb-2">
                            <span className="text-green-400"># Node.js 连接示例</span>
                        </div>
                        <div className="space-y-1">
                            <div>const mysql = require('mysql2');</div>
                            <div>const connection = mysql.createConnection(&#123;</div>
                            <div>  host: '<span className="text-yellow-400">{database.host}</span>',</div>
                            <div>  user: '<span className="text-yellow-400">{database.username}</span>',</div>
                            <div>  password: process.env.DB_PASSWORD,</div>
                            <div>  database: '<span className="text-yellow-400">{database.name}</span>'</div>
                            <div>&#125;);</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
