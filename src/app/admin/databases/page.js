// src/app/admin/databases/page.js
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminDatabases() {
    const [databases, setDatabases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [showDetailModal, setShowDetailModal] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        fetchDatabases();
    }, []);

    const fetchDatabases = async () => {
        try {
            const response = await fetch('/api/admin/databases');
            if (response.ok) {
                const data = await response.json();
                setDatabases(data);
            } else if (response.status === 401) {
                router.push('/admin/login');
            }
        } catch (error) {
            console.error('获取数据库列表失败:', error);
        } finally {
            setLoading(false);
        }
    };

    const deleteDatabase = async (databaseId) => {
        if (!confirm('确定要删除这个数据库吗？此操作不可恢复！')) return;

        try {
            const response = await fetch(`/api/admin/databases/${databaseId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                fetchDatabases();
            } else {
                alert('删除失败');
            }
        } catch (error) {
            alert('网络错误，请重试');
        }
    };

    const restartDatabase = async (databaseId) => {
        setActionLoading(true);

        try {
            const response = await fetch(`/api/admin/databases/${databaseId}/restart`, {
                method: 'POST',
            });

            if (response.ok) {
                alert('数据库重启命令已发送');
                fetchDatabases(); // 刷新状态
            } else {
                const data = await response.json();
                alert(data.error || '重启失败');
            }
        } catch (error) {
            alert('网络错误，请重试');
        } finally {
            setActionLoading(false);
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

    const filteredDatabases = databases.filter(db => {
        const matchesSearch = db.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            db.user.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || db.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const statusCounts = {
        all: databases.length,
        RUNNING: databases.filter(db => db.status === 'RUNNING').length,
        CREATING: databases.filter(db => db.status === 'CREATING').length,
        ERROR: databases.filter(db => db.status === 'ERROR').length,
    };

    if (loading) {
        return (
            <div className="p-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
                    <div className="h-12 bg-gray-200 rounded mb-4"></div>
                    <div className="space-y-3">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="h-16 bg-gray-200 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">数据库管理</h1>
                <p className="text-gray-600">管理平台所有数据库实例</p>
            </div>

            {/* 统计信息和搜索栏 */}
            <div className="mb-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3">
                    <div className="flex space-x-4">
                        <div className="relative flex-1">
                            <input
                                type="text"
                                placeholder="搜索数据库（名称、用户名）"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <i className="fas fa-search absolute right-3 top-3 text-gray-400"></i>
                        </div>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">全部状态 ({statusCounts.all})</option>
                            <option value="RUNNING">运行中 ({statusCounts.RUNNING})</option>
                            <option value="CREATING">创建中 ({statusCounts.CREATING})</option>
                            <option value="ERROR">错误 ({statusCounts.ERROR})</option>
                        </select>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow text-center">
                    <div className="text-sm text-gray-500">总数据库数</div>
                    <div className="text-2xl font-bold text-gray-900">{databases.length}</div>
                </div>
            </div>

            {/* 数据库列表 */}
            <div className="bg-white shadow overflow-hidden rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            数据库信息
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            所属用户
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            连接信息
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            状态
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            创建时间
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            操作
                        </th>
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                    {filteredDatabases.map((db) => (
                        <tr key={db.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0 h-10 w-10 bg-green-500 rounded-full flex items-center justify-center">
                                        <i className="fas fa-database text-white"></i>
                                    </div>
                                    <div className="ml-4">
                                        <div className="text-sm font-medium text-gray-900">{db.name}</div>
                                        <div className="text-sm text-gray-500">ID: {db.id.substring(0, 8)}...</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{db.user.name}</div>
                                <div className="text-sm text-gray-500">{db.user.email}</div>
                                <div className="text-xs text-gray-400">代码: {db.user.code}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{db.host}</div>
                                <div className="text-sm text-gray-500">用户: {db.username}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(db.status)}`}>
                    {getStatusText(db.status)}
                  </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(db.createdAt).toLocaleDateString('zh-CN')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                <button
                                    onClick={() => setShowDetailModal(db)}
                                    className="text-blue-600 hover:text-blue-900"
                                    title="查看详情"
                                >
                                    <i className="fas fa-eye"></i>
                                </button>
                                {db.status === 'RUNNING' && (
                                    <button
                                        onClick={() => restartDatabase(db.id)}
                                        disabled={actionLoading}
                                        className="text-yellow-600 hover:text-yellow-900"
                                        title="重启数据库"
                                    >
                                        <i className="fas fa-redo"></i>
                                    </button>
                                )}
                                <button
                                    onClick={() => deleteDatabase(db.id)}
                                    className="text-red-600 hover:text-red-900"
                                    title="删除数据库"
                                >
                                    <i className="fas fa-trash"></i>
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>

                {filteredDatabases.length === 0 && (
                    <div className="text-center py-12">
                        <i className="fas fa-database text-gray-300 text-4xl mb-3"></i>
                        <p className="text-gray-500">
                            {searchTerm || filterStatus !== 'all' ? '没有找到匹配的数据库' : '还没有数据库实例'}
                        </p>
                    </div>
                )}
            </div>

            {/* 数据库详情模态框 */}
            {showDetailModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50  flex items-center justify-center">
                    <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-medium text-gray-900">数据库详情</h3>
                                <button
                                    onClick={() => setShowDetailModal(null)}
                                    className="text-gray-400 hover:text-gray-500"
                                >
                                    <i className="fas fa-times"></i>
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <h4 className="font-medium text-gray-700 mb-2">基本信息</h4>
                                    <div className="space-y-2">
                                        <div>
                                            <span className="text-sm text-gray-500">数据库名称:</span>
                                            <div className="font-medium">{showDetailModal.name}</div>
                                        </div>
                                        <div>
                                            <span className="text-sm text-gray-500">数据库ID:</span>
                                            <div className="font-medium text-sm">{showDetailModal.id}</div>
                                        </div>
                                        <div>
                                            <span className="text-sm text-gray-500">状态:</span>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(showDetailModal.status)}`}>
                        {getStatusText(showDetailModal.status)}
                      </span>
                                        </div>
                                        <div>
                                            <span className="text-sm text-gray-500">创建时间:</span>
                                            <div className="font-medium">
                                                {new Date(showDetailModal.createdAt).toLocaleString('zh-CN')}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-medium text-gray-700 mb-2">连接信息</h4>
                                    <div className="space-y-2">
                                        <div>
                                            <span className="text-sm text-gray-500">主机地址:</span>
                                            <div className="font-medium">{showDetailModal.host}</div>
                                        </div>
                                        <div>
                                            <span className="text-sm text-gray-500">用户名:</span>
                                            <div className="font-medium">{showDetailModal.username}</div>
                                        </div>
                                        <div>
                                            <span className="text-sm text-gray-500">普通密码:</span>
                                            <div className="font-medium text-sm">••••••••</div>
                                        </div>
                                        <div>
                                            <span className="text-sm text-gray-500">API密码:</span>
                                            <div className="font-medium text-sm">••••••••</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6">
                                <h4 className="font-medium text-gray-700 mb-2">所属用户信息</h4>
                                <div className="bg-gray-50 p-3 rounded">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {showDetailModal.user.name.charAt(0).toUpperCase()}
                      </span>
                                        </div>
                                        <div className="ml-3">
                                            <div className="text-sm font-medium text-gray-900">{showDetailModal.user.name}</div>
                                            <div className="text-sm text-gray-500">{showDetailModal.user.email}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end mt-6">
                                <button
                                    onClick={() => setShowDetailModal(null)}
                                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                                >
                                    关闭
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}