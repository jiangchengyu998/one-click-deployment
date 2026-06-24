// src/app/admin/apis/page.js
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import StatusBadge from '@/components/ui/StatusBadge';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import Toast from '@/components/ui/Toast';
import { fetchAdminJson, getAdminCachedData } from '@/lib/adminDataCache';

export default function AdminApis() {
    const cachedApis = getAdminCachedData('admin:apis');
    const [apis, setApis] = useState(cachedApis || []);
    const [loading, setLoading] = useState(!cachedApis);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [showDetailModal, setShowDetailModal] = useState(null);
    const [actionLoading, setActionLoading] = useState(null);
    const [toast, setToast] = useState(null);
    const router = useRouter();

    useEffect(() => {
        fetchApis({ quiet: !!cachedApis });
    }, []);

    const fetchApis = async ({ quiet = false } = {}) => {
        if (!quiet) {
            setLoading(true);
        }

        try {
            const data = await fetchAdminJson('admin:apis', '/api/admin/apis', { force: quiet });
            setApis(data);
        } catch (error) {
            if (error.status === 401) {
                router.push('/admin/login');
                return;
            }
            console.error('获取应用列表失败:', error);
        } finally {
            if (!quiet) {
                setLoading(false);
            }
        }
    };

    const deleteApi = async (apiId) => {
        if (!confirm('确定要删除这个应用吗？此操作将删除所有相关部署，不可恢复！')) return;

        setActionLoading(`delete:${apiId}`);
        try {
            const response = await fetch(`/api/admin/apis/${apiId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                fetchApis({ quiet: true });
            } else {
                alert('删除失败');
            }
        } catch (error) {
            alert('网络错误，请重试');
        } finally {
            setActionLoading(null);
        }
    };

    const redeployApi = async (apiId) => {
        setActionLoading(`redeploy:${apiId}`);

        try {
            const response = await fetch(`/api/admin/apis/${apiId}/redeploy`, {
                method: 'POST',
            });

            if (response.ok) {
                setToast({
                    type: 'success',
                    title: '已开始重新部署',
                    message: '稍后可在状态和日志中查看进度',
                });
                fetchApis({ quiet: true }); // 刷新状态
            } else {
                const data = await response.json();
                setToast({
                    type: 'error',
                    title: '重新部署失败',
                    message: data.error || '重新部署失败',
                });
            }
        } catch (error) {
            setToast({
                type: 'error',
                title: '重新部署失败',
                message: '网络错误，请重试',
            });
        } finally {
            setActionLoading(null);
        }
    };

    const viewLogs = async (apiId) => {
        try {
            const response = await fetch(`/api/admin/apis/${apiId}/logs`);
            if (response.ok) {
                const logs = await response.json();
                // 在实际应用中，这里可以显示日志模态框
                alert(`最近日志: ${logs.slice(0, 3).join('\n')}`);
            } else {
                alert('获取日志失败');
            }
        } catch (error) {
            alert('网络错误，请重试');
        }
    };

    const filteredApis = apis.filter(api => {
        const matchesSearch = api.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            api.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            api.domain.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || api.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const statusCounts = {
        all: apis.length,
        RUNNING: apis.filter(api => api.status === 'RUNNING').length,
        BUILDING: apis.filter(api => api.status === 'BUILDING').length,
        PENDING: apis.filter(api => api.status === 'PENDING').length,
        ERROR: apis.filter(api => api.status === 'ERROR').length,
    };

    if (loading) {
        return <LoadingSkeleton rows={5} itemClassName="h-16" />;
    }

    return (
        <div className="p-6">
            {toast && (
                <Toast
                    type={toast.type}
                    title={toast.title}
                    message={toast.message}
                    onClose={() => setToast(null)}
                />
            )}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">应用服务管理</h1>
                <p className="text-gray-600">管理平台所有应用服务实例</p>
            </div>

            {/* 统计信息和搜索栏 */}
            <div className="mb-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3">
                    <div className="flex space-x-4">
                        <div className="relative flex-1">
                            <input
                                type="text"
                                placeholder="搜索应用（名称、域名、用户名）"
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
                            <option value="BUILDING">构建中 ({statusCounts.BUILDING})</option>
                            <option value="PENDING">等待中 ({statusCounts.PENDING})</option>
                            <option value="ERROR">错误 ({statusCounts.ERROR})</option>
                        </select>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow text-center">
                    <div className="text-sm text-gray-500">总应用数</div>
                    <div className="text-2xl font-bold text-gray-900">{apis.length}</div>
                </div>
            </div>

            {/* 应用列表 */}
            <div className="bg-white shadow overflow-hidden rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            应用信息
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            所属用户
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            域名/仓库
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
                    {filteredApis.map((api) => (
                        <tr
                            key={api.id}
                            className="hover:bg-gray-50 cursor-pointer transition-colors"
                            onClick={() => setShowDetailModal(api)}
                        >
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0 h-10 w-10 bg-blue-500 rounded-full flex items-center justify-center">
                                        <i className="fas fa-code text-white"></i>
                                    </div>
                                    <div className="ml-4">
                                        <div className="text-sm font-medium text-gray-900">{api.name}</div>
                                        <div className="text-sm text-gray-500">ID: {api.id.substring(0, 8)}...</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{api.user.name}</div>
                                <div className="text-sm text-gray-500">{api.user.email}</div>
                                <div className="text-xs text-gray-400">代码: {api.user.code}</div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="text-sm text-gray-900">{api.domain}</div>
                                <div className="text-sm text-gray-500 truncate max-w-xs">{api.gitUrl}</div>
                                <div className="text-xs text-gray-400">分支: {api.branch || 'main'}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <StatusBadge status={api.status} />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(api.createdAt).toLocaleDateString('zh-CN')}
                            </td>
                            <td
                                className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2"
                                onClick={(event) => event.stopPropagation()}
                            >
                                <button
                                    onClick={() => setShowDetailModal(api)}
                                    className="text-blue-600 hover:text-blue-900"
                                    title="查看详情"
                                >
                                    <i className="fas fa-eye"></i>
                                </button>
                                <button
                                    onClick={() => viewLogs(api.id)}
                                    className="text-gray-600 hover:text-gray-900"
                                    title="查看日志"
                                >
                                    <i className="fas fa-file-alt"></i>
                                </button>
                                { (
                                    <button
                                        onClick={() => redeployApi(api.id)}
                                        disabled={!!actionLoading}
                                        className="text-yellow-600 hover:text-yellow-900 disabled:opacity-50"
                                        title="重新部署"
                                    >
                                        <i className={`fas ${actionLoading === `redeploy:${api.id}` ? 'fa-spinner fa-spin' : 'fa-redo'}`}></i>
                                    </button>
                                )}
                                <button
                                    onClick={() => deleteApi(api.id)}
                                    disabled={!!actionLoading}
                                    className="text-red-600 hover:text-red-900 disabled:opacity-50"
                                    title="删除应用"
                                >
                                    <i className={`fas ${actionLoading === `delete:${api.id}` ? 'fa-spinner fa-spin' : 'fa-trash'}`}></i>
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>

                {filteredApis.length === 0 && (
                    <div className="text-center py-12">
                        <i className="fas fa-code text-gray-300 text-4xl mb-3"></i>
                        <p className="text-gray-500">
                            {searchTerm || filterStatus !== 'all' ? '没有找到匹配的应用' : '还没有应用服务'}
                        </p>
                    </div>
                )}
            </div>

            {/* 应用详情模态框 */}
            {showDetailModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
                    <div className="relative bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-medium text-gray-900">应用服务详情</h3>
                                <button
                                    onClick={() => setShowDetailModal(null)}
                                    className="text-gray-400 hover:text-gray-500"
                                >
                                    <i className="fas fa-times"></i>
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="font-medium text-gray-700 mb-2">基本信息</h4>
                                    <div className="space-y-2">
                                        <div>
                                            <span className="text-sm text-gray-500">应用名称:</span>
                                            <div className="font-medium">{showDetailModal.name}</div>
                                        </div>
                                        <div>
                                            <span className="text-sm text-gray-500">应用 ID:</span>
                                            <div className="font-medium text-sm">{showDetailModal.id}</div>
                                        </div>
                                        <div>
                                            <span className="text-sm text-gray-500">状态:</span>
                                            <StatusBadge status={showDetailModal.status} />
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
                                    <h4 className="font-medium text-gray-700 mb-2">部署信息</h4>
                                    <div className="space-y-2">
                                        <div>
                                            <span className="text-sm text-gray-500">访问域名:</span>
                                            <div className="font-medium">
                                                <a
                                                    href={`https://${showDetailModal.domain}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:text-blue-800"
                                                >
                                                    {showDetailModal.domain}
                                                </a>
                                            </div>
                                        </div>
                                        <div>
                                            <span className="text-sm text-gray-500">Git仓库:</span>
                                            <div className="font-medium">
                                                <a
                                                    href={showDetailModal.gitUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:text-blue-800"
                                                >
                                                    {showDetailModal.gitUrl}
                                                </a>
                                            </div>
                                        </div>
                                        <div>
                                            <span className="text-sm text-gray-500">分支:</span>
                                            <div className="font-medium">{showDetailModal.branch || 'main'}</div>
                                        </div>
                                        <div>
                                            <span className="text-sm text-gray-500">最近部署ID:</span>
                                            <div className="font-medium text-sm">
                                                {showDetailModal.lastJobId || '无记录'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 所属用户信息 */}
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

                            {/* 环境变量 */}
                            {showDetailModal.envs && Object.keys(showDetailModal.envs).length > 0 && (
                                <div className="mt-6">
                                    <h4 className="font-medium text-gray-700 mb-2">环境变量</h4>
                                    <div className="bg-gray-50 p-3 rounded max-h-48 overflow-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead>
                                            <tr>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    变量名
                                                </th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    变量值
                                                </th>
                                            </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                            {Object.entries(showDetailModal.envs).map(([key, value]) => (
                                                <tr key={key}>
                                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{key}</td>
                                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{value}</td>
                                                </tr>
                                            ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

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
