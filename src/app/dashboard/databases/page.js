// src/app/dashboard/databases/page.js
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function UserDatabases() {
    const [databases, setDatabases] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [userQuota, setUserQuota] = useState({
        dbQuota: 0,
        currentDbs: 0,
        userCode: ''
    });
    const [actionLoading, setActionLoading] = useState(false);
    const router = useRouter();

    // 新数据库表单状态
    const [newDatabase, setNewDatabase] = useState({
        name: '',
        username: '',
        password: ''
    });

    // 计算带前缀的完整名称
    const getFullName = useCallback((field) => {
        if (!userQuota.userCode || !newDatabase[field]) return '';
        return `${userQuota.userCode}_${newDatabase[field]}`;
    }, [userQuota.userCode, newDatabase.name, newDatabase.username]);

    // 获取数据
    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [dbsResponse, userResponse] = await Promise.all([
                fetch('/api/databases'),
                fetch('/api/users/me')
            ]);

            if (dbsResponse.ok) {
                const dbsData = await dbsResponse.json();
                setDatabases(dbsData);
            } else if (dbsResponse.status === 401) {
                router.push('/auth/login');
                return;
            }

            if (userResponse.ok) {
                const userData = await userResponse.json();
                setUserQuota({
                    dbQuota: userData.dbQuota,
                    currentDbs: userData._count?.databases || 0,
                    userCode: userData.code || ''
                });
            }
        } catch (error) {
            console.error('获取数据失败:', error);
        } finally {
            setLoading(false);
        }
    }, [router]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const createDatabase = async (e) => {
        e.preventDefault();

        if (!userQuota.userCode) {
            alert('无法获取用户信息，请刷新页面重试');
            return;
        }

        setActionLoading(true);

        try {
            const databaseData = {
                ...newDatabase,
                name: getFullName('name'),
                username: getFullName('username')
            };

            const response = await fetch('/api/databases', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(databaseData),
            });

            if (response.ok) {
                setShowCreateModal(false);
                setNewDatabase({ name: '', username: '', password: '' });
                fetchData();
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

    const deleteDatabase = async (databaseId, databaseName) => {
        if (!confirm(`确定要删除数据库 "${databaseName}" 吗？此操作不可恢复！`)) return;

        try {
            const response = await fetch(`/api/databases/${databaseId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                fetchData();
            } else {
                alert('删除失败');
            }
        } catch (error) {
            alert('网络错误，请重试');
        }
    };

    // 处理输入变化
    const handleInputChange = (field, value) => {
        // 移除用户可能输入的前缀
        const cleanValue = userQuota.userCode
            ? value.replace(new RegExp(`^${userQuota.userCode}_`), '')
            : value;

        setNewDatabase(prev => ({
            ...prev,
            [field]: cleanValue
        }));
    };

    // 状态配置
    const statusConfig = {
        RUNNING: { color: 'bg-green-100 text-green-800', text: '运行中' },
        CREATING: { color: 'bg-yellow-100 text-yellow-800', text: '创建中' },
        ERROR: { color: 'bg-red-100 text-red-800', text: '错误' },
        default: { color: 'bg-gray-100 text-gray-800', text: '未知' }
    };

    const getStatusInfo = (status) => {
        return statusConfig[status] || statusConfig.default;
    };

    // 加载状态
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

    const hasQuota = userQuota.currentDbs < userQuota.dbQuota;
    const fullDbName = getFullName('name');
    const fullUsername = getFullName('username');

    return (
        <div className="p-6">
            {/* 头部信息 */}
            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">我的数据库</h1>
                    <div className="flex items-center gap-4 mt-2">
                        <p className="text-gray-600">
                            配额: {userQuota.currentDbs}/{userQuota.dbQuota}
                        </p>
                        {userQuota.userCode && (
                            <p className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                用户代码: {userQuota.userCode}
                            </p>
                        )}
                    </div>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    disabled={!hasQuota}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center transition-colors"
                >
                    <i className="fas fa-plus mr-2"></i> 创建数据库
                </button>
            </div>

            {/* 数据库列表 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {databases.map((db) => {
                    const statusInfo = getStatusInfo(db.status);
                    return (
                        <div key={db.id} className="bg-white shadow rounded-lg overflow-hidden border border-gray-200">
                            <div className="px-4 py-5 sm:p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center min-w-0">
                                        <div className="flex-shrink-0">
                                            <i className="fas fa-database text-green-500 text-xl"></i>
                                        </div>
                                        <div className="ml-3 min-w-0 flex-1">
                                            <h3 className="text-lg leading-6 font-medium text-gray-900 truncate" title={db.name}>
                                                {db.name}
                                            </h3>
                                        </div>
                                    </div>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color} flex-shrink-0 ml-2`}>
                                        {statusInfo.text}
                                    </span>
                                </div>

                                <div className="mt-4 space-y-2">
                                    <div className="text-sm">
                                        <span className="font-medium text-gray-700">主机:</span>
                                        <span className="text-gray-600 ml-1 font-mono">{db.host}</span>
                                    </div>
                                    <div className="text-sm">
                                        <span className="font-medium text-gray-700">用户名:</span>
                                        <span className="text-gray-600 ml-1 font-mono">{db.username}</span>
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        创建时间: {new Date(db.createdAt).toLocaleDateString('zh-CN')}
                                    </div>
                                </div>

                                <div className="mt-4 flex space-x-3">
                                    <Link
                                        href={`/dashboard/databases/${db.id}`}
                                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors flex-1 justify-center"
                                    >
                                        <i className="fas fa-eye mr-1"></i> 查看详情
                                    </Link>
                                    <button
                                        onClick={() => deleteDatabase(db.id, db.name)}
                                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 transition-colors flex-1 justify-center"
                                    >
                                        <i className="fas fa-trash mr-1"></i> 删除
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* 空状态 */}
            {databases.length === 0 && (
                <div className="text-center py-12">
                    <i className="fas fa-database text-gray-300 text-4xl mb-3"></i>
                    <p className="text-gray-500">您还没有创建任何数据库</p>
                    {hasQuota && (
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="mt-2 text-green-600 hover:text-green-800 font-medium"
                        >
                            创建第一个数据库
                        </button>
                    )}
                </div>
            )}

            {/* 创建数据库模态框 */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-start justify-center p-4">
                    <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mt-20">
                        <div className="p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">创建新数据库</h3>
                            <form onSubmit={createDatabase}>
                                <div className="space-y-4">
                                    {/* 数据库名称 */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            数据库名称
                                        </label>
                                        <div className="flex rounded-md shadow-sm">
                                            {userQuota.userCode && (
                                                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                                                    {userQuota.userCode}_
                                                </span>
                                            )}
                                            <input
                                                type="text"
                                                required
                                                value={newDatabase.name}
                                                onChange={(e) => handleInputChange('name', e.target.value)}
                                                className="flex-1 min-w-0 block w-full px-3 py-2 border border-gray-300 rounded-r-md focus:ring-green-500 focus:border-green-500"
                                                placeholder="my_database"
                                                pattern="[a-zA-Z0-9_]+"
                                                title="只能包含字母、数字和下划线"
                                            />
                                        </div>
                                        {fullDbName && (
                                            <p className="mt-1 text-sm text-gray-500">
                                                完整名称: <span className="font-mono text-gray-700">{fullDbName}</span>
                                            </p>
                                        )}
                                    </div>

                                    {/* 用户名 */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            用户名
                                        </label>
                                        <div className="flex rounded-md shadow-sm">
                                            {userQuota.userCode && (
                                                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                                                    {userQuota.userCode}_
                                                </span>
                                            )}
                                            <input
                                                type="text"
                                                required
                                                value={newDatabase.username}
                                                onChange={(e) => handleInputChange('username', e.target.value)}
                                                className="flex-1 min-w-0 block w-full px-3 py-2 border border-gray-300 rounded-r-md focus:ring-green-500 focus:border-green-500"
                                                placeholder="db_user"
                                                pattern="[a-zA-Z0-9_]+"
                                                title="只能包含字母、数字和下划线"
                                            />
                                        </div>
                                        {fullUsername && (
                                            <p className="mt-1 text-sm text-gray-500">
                                                完整用户名: <span className="font-mono text-gray-700">{fullUsername}</span>
                                            </p>
                                        )}
                                    </div>

                                    {/* 密码 */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            密码
                                        </label>
                                        <input
                                            type="password"
                                            required
                                            value={newDatabase.password}
                                            onChange={(e) => setNewDatabase(prev => ({...prev, password: e.target.value}))}
                                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                                            placeholder="••••••••"
                                            minLength={8}
                                        />
                                    </div>
                                </div>

                                {/* 操作按钮 */}
                                <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateModal(false)}
                                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                                        disabled={actionLoading}
                                    >
                                        取消
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={actionLoading || !userQuota.userCode}
                                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        {actionLoading ? (
                                            <>
                                                <i className="fas fa-spinner fa-spin mr-2"></i>
                                                创建中...
                                            </>
                                        ) : (
                                            '创建数据库'
                                        )}
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