// src/app/dashboard/databases/page.js
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function UserDatabases() {
    const [databases, setDatabases] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [userQuota, setUserQuota] = useState({ dbQuota: 0, currentDbs: 0 });
    const [actionLoading, setActionLoading] = useState(false);
    const router = useRouter();

    // 新数据库表单状态
    const [newDatabase, setNewDatabase] = useState({
        name: '',
        username: '',
        password: '',
        apiPassword: ''
    });

    useEffect(() => {
        fetchDatabases();
        fetchUserQuota();
    }, []);

    const fetchDatabases = async () => {
        try {
            const response = await fetch('/api/databases');
            if (response.ok) {
                const data = await response.json();
                setDatabases(data);
            } else if (response.status === 401) {
                router.push('/auth/login');
            }
        } catch (error) {
            console.error('获取数据库列表失败:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUserQuota = async () => {
        try {
            const response = await fetch('/api/users/me');
            if (response.ok) {
                const data = await response.json();
                setUserQuota({
                    dbQuota: data.dbQuota,
                    currentDbs: data._count?.databases || 0
                });
            }
        } catch (error) {
            console.error('获取用户配额失败:', error);
        }
    };

    const createDatabase = async (e) => {
        e.preventDefault();
        setActionLoading(true);

        try {
            const response = await fetch('/api/databases', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newDatabase),
            });

            if (response.ok) {
                setShowCreateModal(false);
                setNewDatabase({
                    name: '',
                    username: '',
                    password: '',
                    apiPassword: ''
                });
                fetchDatabases();
                fetchUserQuota();
            } else {
                const data = await response.json();
                alert(data.error || '创建数据库失败');
            }
        } catch (error) {
            alert('网络错误，请重试');
        } finally {
            setActionLoading(false);
        }
    };

    const deleteDatabase = async (databaseId) => {
        if (!confirm('确定要删除这个数据库吗？此操作不可恢复！')) return;

        try {
            const response = await fetch(`/api/databases/${databaseId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                fetchDatabases();
                fetchUserQuota();
            } else {
                alert('删除失败');
            }
        } catch (error) {
            alert('网络错误，请重试');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'RUNNING': return 'bg-green-100 text-green-800';
            case 'CREATING': return 'bg-yellow-100 text-yellow-800';
            case 'ERROR': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'RUNNING': return '运行中';
            case 'CREATING': return '创建中';
            case 'ERROR': return '错误';
            default: return '未知';
        }
    };

    if (loading) {
        return (
            <div className="p-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
                    <div className="h-12 bg-gray-200 rounded mb-4"></div>
                    <div className="space-y-3">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="h-24 bg-gray-200 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">我的数据库</h1>
                    <p className="text-gray-600">
                        配额: {userQuota.currentDbs}/{userQuota.dbQuota}
                    </p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    disabled={userQuota.currentDbs >= userQuota.dbQuota}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:bg-gray-400 flex items-center"
                >
                    <i className="fas fa-plus mr-2"></i> 创建数据库
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {databases.map((db) => (
                    <div key={db.id} className="bg-white shadow rounded-lg overflow-hidden">
                        <div className="px-4 py-5 sm:p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <i className="fas fa-database text-green-500 text-xl"></i>
                                    </div>
                                    <div className="ml-3">
                                        <h3 className="text-lg leading-6 font-medium text-gray-900">{db.name}</h3>
                                    </div>
                                </div>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(db.status)}`}>
                  {getStatusText(db.status)}
                </span>
                            </div>

                            <div className="mt-4 space-y-2">
                                <div className="text-sm text-gray-600">
                                    <span className="font-medium">主机:</span> {db.host}
                                </div>
                                <div className="text-sm text-gray-600">
                                    <span className="font-medium">用户名:</span> {db.username}
                                </div>
                                <div className="text-sm text-gray-500">
                                    创建时间: {new Date(db.createdAt).toLocaleDateString('zh-CN')}
                                </div>
                            </div>

                            <div className="mt-4 flex space-x-3">
                                <Link
                                    href={`/dashboard/databases/${db.id}`}
                                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                >
                                    <i className="fas fa-eye mr-1"></i> 查看详情
                                </Link>
                                <button
                                    onClick={() => deleteDatabase(db.id)}
                                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                                >
                                    <i className="fas fa-trash mr-1"></i> 删除
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {databases.length === 0 && (
                <div className="text-center py-12">
                    <i className="fas fa-database text-gray-300 text-4xl mb-3"></i>
                    <p className="text-gray-500">您还没有创建任何数据库</p>
                    {userQuota.dbQuota > 0 && (
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="mt-2 text-green-600 hover:text-green-800"
                        >
                            创建第一个数据库
                        </button>
                    )}
                </div>
            )}

            {/* 创建数据库模态框 */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">创建新数据库</h3>
                            <form onSubmit={createDatabase}>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">数据库名称</label>
                                        <input
                                            type="text"
                                            required
                                            value={newDatabase.name}
                                            onChange={(e) => setNewDatabase({...newDatabase, name: e.target.value})}
                                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                                            placeholder="my_database"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">用户名</label>
                                        <input
                                            type="text"
                                            required
                                            value={newDatabase.username}
                                            onChange={(e) => setNewDatabase({...newDatabase, username: e.target.value})}
                                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                                            placeholder="db_user"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">普通密码</label>
                                        <input
                                            type="password"
                                            required
                                            value={newDatabase.password}
                                            onChange={(e) => setNewDatabase({...newDatabase, password: e.target.value})}
                                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">API访问密码</label>
                                        <input
                                            type="password"
                                            required
                                            value={newDatabase.apiPassword}
                                            onChange={(e) => setNewDatabase({...newDatabase, apiPassword: e.target.value})}
                                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                                            placeholder="••••••••"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">用于API访问数据库的专用密码</p>
                                    </div>
                                </div>
                                <div className="flex justify-end space-x-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateModal(false)}
                                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                    >
                                        取消
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={actionLoading}
                                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                                    >
                                        {actionLoading ? '创建中...' : '创建数据库'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}