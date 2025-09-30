// src/app/dashboard/apis/[id]/page.js
"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

export default function ApiDetail() {
    const [api, setApi] = useState(null);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');
    const router = useRouter();
    const params = useParams();

    const [newEnvKey, setNewEnvKey] = useState('');
    const [newEnvValue, setNewEnvValue] = useState('');
    const [editingBranch, setEditingBranch] = useState('');
    const [isEditingBranch, setIsEditingBranch] = useState(false);
    const [editingToken, setEditingToken] = useState('');
    const [isEditingToken, setIsEditingToken] = useState(false);

    useEffect(() => {
        fetchApiDetail();
        if (activeTab === 'logs') {
            fetchApiLogs();
        }
    }, [params.id, activeTab]);

    const fetchApiDetail = async () => {
        try {
            const response = await fetch(`/api/apis/${params.id}`);

            if (response.status === 401) {
                router.push('/auth/login');
                return;
            }

            if (response.status === 404) {
                router.push('/dashboard/apis');
                return;
            }

            if (response.ok) {
                const data = await response.json();
                setApi(data);
                setEditingBranch(data.branch || '');
                setEditingToken(data.token || '');
            }
        } catch (error) {
            console.error('获取API详情失败:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchApiLogs = async () => {
        try {
            const response = await fetch(`/api/apis/${params.id}/logs`);
            if (response.ok) {
                const data = await response.json();
                setLogs(data);
            }
        } catch (error) {
            console.error('获取API日志失败:', error);
        }
    };

    const deleteApi = async () => {
        if (!confirm('确定要删除这个API吗？此操作不可恢复！')) return;

        setActionLoading(true);

        try {
            const response = await fetch(`/api/apis/${params.id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                router.push('/dashboard/apis');
            } else {
                alert('删除失败');
            }
        } catch (error) {
            alert('网络错误，请重试');
        } finally {
            setActionLoading(false);
        }
    };

    const redeployApi = async () => {
        setActionLoading(true);
        try {
            const response = await fetch(`/api/apis/${params.id}/redeploy`, {
                method: 'POST',
            });

            if (response.ok) {
                alert('API重新部署命令已发送');
                fetchApiDetail(); // 刷新状态
            } else {
                const data = await response.json();
                alert(data.error || '重新部署失败');
            }
        } catch (error) {
            alert('网络错误，请重试');
        } finally {
            setActionLoading(false);
        }
    };

    const updateBranch = async () => {
        if (!editingBranch.trim()) {
            alert('分支名称不能为空');
            return;
        }

        setActionLoading(true);
        try {
            const response = await fetch(`/api/apis/${params.id}`, {
                method: 'PATCH',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ branch: editingBranch }),
            });

            if (response.ok) {
                const updatedApi = await response.json();
                setApi(updatedApi);
                setIsEditingBranch(false);
                alert('分支已更新');
            } else {
                const data = await response.json();
                alert(data.error || '更新失败');
            }
        } catch (error) {
            alert('网络错误，请重试');
        } finally {
            setActionLoading(false);
        }
    };

    const updateToken = async () => {
        if (!editingToken.trim()) {
            alert('Token不能为空');
            return;
        }

        setActionLoading(true);
        try {
            const response = await fetch(`/api/apis/${params.id}`, {
                method: 'PATCH',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ token: editingToken }),
            });

            if (response.ok) {
                const updatedApi = await response.json();
                setApi(updatedApi);
                setIsEditingToken(false);
                alert('Token已更新');
            } else {
                const data = await response.json();
                alert(data.error || '更新失败');
            }
        } catch (error) {
            alert('网络错误，请重试');
        } finally {
            setActionLoading(false);
        }
    };

    const generateNewToken = () => {
        // 生成一个随机的token
        const newToken = 'sk-' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        setEditingToken(newToken);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'RUNNING': return 'bg-green-100 text-green-800';
            case 'BUILDING': return 'bg-yellow-100 text-yellow-800';
            case 'PENDING': return 'bg-blue-100 text-blue-800';
            case 'ERROR': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'RUNNING': return '运行中';
            case 'BUILDING': return '构建中';
            case 'PENDING': return '等待中';
            case 'ERROR': return '错误';
            default: return '未知';
        }
    };

    if (loading) {
        return (
            <div className="p-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
                    <div className="h-64 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    if (!api) {
        return (
            <div className="p-6">
                <div className="text-center py-12">
                    <i className="fas fa-exclamation-triangle text-yellow-500 text-4xl mb-3"></i>
                    <p className="text-gray-500">API不存在</p>
                    <Link href="/dashboard/apis" className="text-blue-600 hover:text-blue-800">
                        返回API列表
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="mb-6">
                <Link
                    href="/dashboard/apis"
                    className="text-blue-600 hover:text-blue-800 mb-4 inline-block"
                >
                    <i className="fas fa-arrow-left mr-2"></i>返回API列表
                </Link>
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{api.name}</h1>
                        <p className="text-gray-600">API服务详情信息</p>
                    </div>
                    <div className="space-x-2">
                        <button
                            onClick={redeployApi}
                            disabled={actionLoading || api.status !== 'RUNNING'}
                            className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 disabled:opacity-50"
                        >
                            {actionLoading ? '部署中...' : '重新部署'}
                        </button>
                        <button
                            onClick={deleteApi}
                            disabled={actionLoading}
                            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50"
                        >
                            {actionLoading ? '删除中...' : '删除API'}
                        </button>
                    </div>
                </div>
            </div>

            {/* 标签页导航 */}
            <div className="mb-6 border-b border-gray-200">
                <nav className="flex -mb-px">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                            activeTab === 'overview'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        <i className="fas fa-info-circle mr-2"></i>概览
                    </button>
                    <button
                        onClick={() => setActiveTab('logs')}
                        className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                            activeTab === 'logs'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        <i className="fas fa-file-alt mr-2"></i>部署日志
                    </button>
                    <button
                        onClick={() => setActiveTab('settings')}
                        className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                            activeTab === 'settings'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        <i className="fas fa-cog mr-2"></i>设置
                    </button>
                </nav>
            </div>

            {/* 概览标签页 */}
            {activeTab === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* 基本信息卡片 */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">基本信息</h2>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-600">API名称</span>
                                <span className="font-medium">{api.name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">状态</span>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(api.status)}`}>
                  {getStatusText(api.status)}
                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">创建时间</span>
                                <span className="font-medium">
                  {new Date(api.createdAt).toLocaleString('zh-CN')}
                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">更新时间</span>
                                <span className="font-medium">
                  {new Date(api.updatedAt).toLocaleString('zh-CN')}
                </span>
                            </div>
                        </div>
                    </div>

                    {/* 部署信息卡片 */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">部署信息</h2>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">访问域名</span>
                                <a
                                    href={`https://${api.domain}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-medium text-blue-600 hover:text-blue-800"
                                >
                                    {api.domain}
                                </a>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Git仓库</span>
                                <a
                                    href={api.gitUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-medium text-blue-600 hover:text-blue-800 truncate max-w-xs"
                                >
                                    {api.gitUrl}
                                </a>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">分支</span>
                                <div className="flex items-center space-x-2">
                                    {isEditingBranch ? (
                                        <>
                                            <input
                                                type="text"
                                                value={editingBranch}
                                                onChange={(e) => setEditingBranch(e.target.value)}
                                                className="border border-gray-300 rounded px-2 py-1 text-sm w-32"
                                            />
                                            <button
                                                onClick={updateBranch}
                                                disabled={actionLoading}
                                                className="text-green-600 hover:text-green-800 text-sm"
                                            >
                                                ✓
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setIsEditingBranch(false);
                                                    setEditingBranch(api.branch);
                                                }}
                                                className="text-red-600 hover:text-red-800 text-sm"
                                            >
                                                ✗
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <span className="font-medium">{api.branch}</span>
                                            <button
                                                onClick={() => setIsEditingBranch(true)}
                                                className="text-blue-600 hover:text-blue-800 text-sm"
                                            >
                                                <i className="fas fa-edit"></i>
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Token</span>
                                <div className="flex items-center space-x-2">
                                    {isEditingToken ? (
                                        <>
                                            <input
                                                type="text"
                                                value={editingToken}
                                                onChange={(e) => setEditingToken(e.target.value)}
                                                className="border border-gray-300 rounded px-2 py-1 text-sm w-48"
                                                placeholder="输入Token"
                                            />
                                            <button
                                                onClick={generateNewToken}
                                                className="text-blue-600 hover:text-blue-800 text-sm"
                                                title="生成新Token"
                                            >
                                                <i className="fas fa-sync-alt"></i>
                                            </button>
                                            <button
                                                onClick={updateToken}
                                                disabled={actionLoading}
                                                className="text-green-600 hover:text-green-800 text-sm"
                                            >
                                                ✓
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setIsEditingToken(false);
                                                    setEditingToken(api.token);
                                                }}
                                                className="text-red-600 hover:text-red-800 text-sm"
                                            >
                                                ✗
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <span className="font-medium text-sm">
                                                {api.token ? `${api.token.substring(0, 10)}...` : '未设置'}
                                            </span>
                                            <button
                                                onClick={() => setIsEditingToken(true)}
                                                className="text-blue-600 hover:text-blue-800 text-sm"
                                            >
                                                <i className="fas fa-edit"></i>
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* API测试卡片 */}
                    <div className="bg-white shadow rounded-lg p-6 lg:col-span-2">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">API测试</h2>
                        <div className="bg-gray-900 text-gray-100 p-4 rounded font-mono text-sm">
                            <div className="mb-2">
                                <span className="text-green-400"># 测试您的API端点</span>
                            </div>
                            <div className="mb-1">
                                <span className="text-blue-400">curl</span> -X GET <span className="text-yellow-400">https://{api.domain}/</span>
                            </div>
                            {api.token && (
                                <div className="mb-1">
                                    <span className="text-blue-400">curl</span> -H <span className="text-purple-400">"Authorization: Bearer {api.token}"</span> <span className="text-yellow-400">https://{api.domain}/</span>
                                </div>
                            )}
                            <div className="mb-2">
                                <span className="text-green-400"># 或者直接在浏览器中访问</span>
                            </div>
                            <div>
                                <a
                                    href={`https://${api.domain}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-yellow-400 hover:underline"
                                >
                                    https://{api.domain}
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 日志标签页 */}
            {activeTab === 'logs' && (
                <div className="bg-white shadow rounded-lg p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">部署日志</h2>
                    <div className="bg-gray-900 text-gray-100 p-4 rounded font-mono text-sm h-96 overflow-y-auto">
                        {logs.length > 0 ? (
                            logs.map((log, index) => (
                                <div key={index} className="mb-1">
                                    <span className="text-gray-400">[{new Date(log.timestamp).toLocaleString()}]</span>{' '}
                                    <span className={log.level === 'ERROR' ? 'text-red-400' : 'text-green-400'}>
                    {log.message}
                  </span>
                                </div>
                            ))
                        ) : (
                            <div className="text-gray-400">暂无日志记录</div>
                        )}
                    </div>
                    <div className="mt-4 flex justify-between">
                        <button
                            onClick={fetchApiLogs}
                            className="text-blue-600 hover:text-blue-800"
                        >
                            <i className="fas fa-sync-alt mr-1"></i>刷新日志
                        </button>
                        <button
                            onClick={() => setLogs([])}
                            className="text-gray-600 hover:text-gray-800"
                        >
                            <i className="fas fa-trash mr-1"></i>清空日志
                        </button>
                    </div>
                </div>
            )}

            {/* 设置标签页 */}
            {activeTab === 'settings' && (
                <div className="bg-white shadow rounded-lg p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">API设置</h2>
                    <div className="space-y-6">

                        {/* 环境变量设置 */}
                        <div>
                            <h3 className="text-md font-medium text-gray-700 mb-2">环境变量</h3>
                            <div className="bg-gray-50 p-4 rounded space-y-2">
                                {api.envs && Object.keys(api.envs).length > 0 ? (
                                    Object.entries(api.envs).map(([key, value]) => (
                                        <div key={key} className="flex items-center space-x-2">
                                            <input
                                                type="text"
                                                value={key}
                                                readOnly
                                                className="w-1/3 border border-gray-300 rounded px-2 py-1 bg-gray-100 text-sm font-mono"
                                            />
                                            <input
                                                type="text"
                                                value={value}
                                                onChange={(e) => {
                                                    const newEnvs = {...api.envs, [key]: e.target.value};
                                                    setApi({...api, envs: newEnvs});
                                                }}
                                                className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm font-mono"
                                            />
                                            <button
                                                onClick={() => {
                                                    const newEnvs = {...api.envs};
                                                    delete newEnvs[key];
                                                    setApi({...api, envs: newEnvs});
                                                }}
                                                className="text-red-500 hover:text-red-700 text-sm px-2"
                                            >
                                                删除
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-gray-600">暂无环境变量</p>
                                )}

                                {/* 新增环境变量 */}
                                <div className="flex items-center space-x-2 mt-2">
                                    <input
                                        type="text"
                                        placeholder="KEY"
                                        value={newEnvKey || ''}
                                        onChange={(e) => setNewEnvKey(e.target.value)}
                                        className="w-1/3 border border-gray-300 rounded px-2 py-1 text-sm font-mono"
                                    />
                                    <input
                                        type="text"
                                        placeholder="VALUE"
                                        value={newEnvValue || ''}
                                        onChange={(e) => setNewEnvValue(e.target.value)}
                                        className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm font-mono"
                                    />
                                    <button
                                        onClick={() => {
                                            if (!newEnvKey) return;
                                            const newEnvs = {...api.envs, [newEnvKey]: newEnvValue};
                                            setApi({...api, envs: newEnvs});
                                            setNewEnvKey('');
                                            setNewEnvValue('');
                                        }}
                                        className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-sm"
                                    >
                                        添加
                                    </button>
                                </div>

                                {/* 保存环境变量按钮 */}
                                <div className="mt-4">
                                    <button
                                        onClick={async () => {
                                            setActionLoading(true);
                                            try {
                                                const response = await fetch(`/api/apis/${params.id}`, {
                                                    method: 'PATCH',
                                                    headers: {'Content-Type': 'application/json'},
                                                    body: JSON.stringify({envs: api.envs}),
                                                });
                                                if (response.ok) {
                                                    alert('环境变量已更新');
                                                } else {
                                                    const data = await response.json();
                                                    alert(data.error || '更新失败');
                                                }
                                            } catch (err) {
                                                alert('网络错误，请重试');
                                            } finally {
                                                setActionLoading(false);
                                            }
                                        }}
                                        disabled={actionLoading}
                                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
                                    >
                                        {actionLoading ? '保存中...' : '保存环境变量'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* 危险操作 */}
                        <div>
                            <h3 className="text-md font-medium text-gray-700 mb-2">危险操作</h3>
                            <div className="bg-red-50 p-4 rounded border border-red-200">
                                <p className="text-sm text-red-700 mb-3">
                                    删除API将永久移除所有相关数据和部署，此操作不可恢复。
                                </p>
                                <button
                                    onClick={deleteApi}
                                    disabled={actionLoading}
                                    className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50"
                                >
                                    {actionLoading ? '删除中...' : '删除API'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}