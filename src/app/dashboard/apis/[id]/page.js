// src/app/dashboard/apis/[id]/page.js
"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import StatusBadge from '@/components/ui/StatusBadge';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import Toast from '@/components/ui/Toast';

const buildLogLevelOptions = [
    { value: 'all', label: '全部' },
    { value: 'ERROR', label: '错误' },
    { value: 'WARN', label: '警告' },
    { value: 'INFO', label: '信息' },
];
const detailTabs = new Set(['overview', 'logs', 'runlogs', 'settings']);

function getLogLevel(message = '', level = 'INFO') {
    const text = `${level} ${message}`.toUpperCase();

    if (text.includes('ERROR') || text.includes('FAIL') || text.includes('FAILED')) return 'ERROR';
    if (text.includes('WARN') || text.includes('WARNING')) return 'WARN';
    if (text.includes('SUCCESS') || text.includes('FINISHED: SUCCESS')) return 'SUCCESS';
    return level || 'INFO';
}

function getBuildLogClass(level) {
    if (level === 'ERROR') return 'border-l-red-500 bg-red-950/30 text-red-100';
    if (level === 'WARN') return 'border-l-yellow-500 bg-yellow-950/20 text-yellow-100';
    if (level === 'SUCCESS') return 'border-l-green-500 bg-green-950/20 text-green-100';
    return 'border-l-transparent text-gray-200';
}

export default function ApiDetail() {
    const [api, setApi] = useState(null);
    const [logs, setLogs] = useState([]);
    const [logsLoading, setLogsLoading] = useState(false);
    const [logsError, setLogsError] = useState('');
    const [buildLogSearch, setBuildLogSearch] = useState('');
    const [buildLogLevel, setBuildLogLevel] = useState('all');
    const [autoRefreshBuildLogs, setAutoRefreshBuildLogs] = useState(false);
    const [buildLogCursor, setBuildLogCursor] = useState(0);
    const [buildLogHasMore, setBuildLogHasMore] = useState(false);
    const [buildLogMeta, setBuildLogMeta] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [toast, setToast] = useState(null);
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();
    const requestedTab = searchParams.get('tab');

    const [newEnvKey, setNewEnvKey] = useState('');
    const [newEnvValue, setNewEnvValue] = useState('');
    const [editingBranch, setEditingBranch] = useState('');
    const [isEditingBranch, setIsEditingBranch] = useState(false);
    const [editingToken, setEditingToken] = useState('');
    const [isEditingToken, setIsEditingToken] = useState(false);
    const [runLogs, setRunLogs] = useState([]);
    const [runLogsLoading, setRunLogsLoading] = useState(false);
    const [runLogsError, setRunLogsError] = useState('');
    const [runLogsMeta, setRunLogsMeta] = useState(null);
    const [runLogTailLines, setRunLogTailLines] = useState(200);
    const [autoRefreshRunLogs, setAutoRefreshRunLogs] = useState(false);


    useEffect(() => {
        fetchApiDetail();
    }, [params.id]);

    useEffect(() => {
        if (requestedTab && detailTabs.has(requestedTab)) {
            setActiveTab(requestedTab);
        }
    }, [requestedTab]);

    useEffect(() => {
        if (activeTab === 'logs') fetchApiLogs({ reset: true });
        if (activeTab === 'runlogs') fetchRunLogs();
    }, [params.id, activeTab, runLogTailLines]);

    useEffect(() => {
        if (activeTab !== 'logs' || !autoRefreshBuildLogs) return;

        const timer = setInterval(() => {
            fetchApiLogs({ silent: true });
        }, 5000);

        return () => clearInterval(timer);
    }, [params.id, activeTab, autoRefreshBuildLogs, buildLogCursor]);

    useEffect(() => {
        if (activeTab !== 'runlogs' || !autoRefreshRunLogs) return;

        const timer = setInterval(() => {
            fetchRunLogs({ silent: true });
        }, 5000);

        return () => clearInterval(timer);
    }, [params.id, activeTab, autoRefreshRunLogs, runLogTailLines]);

    const fetchRunLogs = async ({ silent = false } = {}) => {
        if (!silent) {
            setRunLogsLoading(true);
        }
        setRunLogsError('');

        try {
            const query = new URLSearchParams({
                tailLines: String(runLogTailLines),
            });
            const response = await fetch(`/api/apis/${params.id}/runlogs?${query.toString()}`);
            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(data.error || '获取运行日志失败');
            }

            setRunLogs(data.logs || []);
            setRunLogsMeta({
                namespace: data.namespace,
                podName: data.podName,
                podPhase: data.podPhase,
                containerName: data.containerName,
                fetchedAt: data.fetchedAt,
            });
        } catch (error) {
            console.error('获取运行日志失败:', error);
            setRunLogsError(error.message || '获取运行日志失败');
        } finally {
            if (!silent) {
                setRunLogsLoading(false);
            }
        }
    };


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
                setEditingToken(data.gitToken || '');
            }
        } catch (error) {
            console.error('获取应用详情失败:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchApiLogs = async ({ silent = false, reset = false } = {}) => {
        if (!silent) {
            setLogsLoading(true);
        }
        setLogsError('');

        try {
            const start = reset ? 0 : buildLogCursor;
            const query = new URLSearchParams({
                mode: 'progressive',
                start: String(start),
            });
            const response = await fetch(`/api/apis/${params.id}/logs?${query.toString()}`);
            const data = await response.json().catch(() => ({}));

            if (response.ok) {
                if (Array.isArray(data)) {
                    setLogs(data);
                    setBuildLogCursor(0);
                    setBuildLogHasMore(false);
                    setBuildLogMeta(null);
                    return;
                }

                const incomingLogs = Array.isArray(data.logs) ? data.logs : [];
                const nextStart = Number.parseInt(data.nextStart, 10);

                setLogs((currentLogs) => reset ? incomingLogs : [...currentLogs, ...incomingLogs]);
                setBuildLogCursor(Number.isFinite(nextStart) ? nextStart : start);
                setBuildLogHasMore(!!data.hasMore);
                setBuildLogMeta({
                    buildNumber: data.buildNumber,
                    fetchedAt: data.fetchedAt,
                });
            } else {
                throw new Error(data.error || '获取部署日志失败');
            }
        } catch (error) {
            console.error('获取应用日志失败:', error);
            setLogsError(error.message || '获取部署日志失败');
        } finally {
            if (!silent) {
                setLogsLoading(false);
            }
        }
    };

    const deleteApi = async () => {
        if (!confirm('确定要删除这个应用吗？此操作不可恢复！')) return;

        setActionLoading('delete');

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
            setActionLoading(null);
        }
    };

    const redeployApi = async () => {
        setActionLoading('redeploy');
        try {
            const response = await fetch(`/api/apis/${params.id}/redeploy`, {
                method: 'POST',
            });

            if (response.ok) {
                setToast({
                    type: 'success',
                    title: '已开始重新部署',
                    message: '稍后可在状态和日志中查看进度',
                });
                fetchApiDetail(); // 刷新状态
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

    const updateBranch = async () => {
        if (!editingBranch.trim()) {
            alert('分支名称不能为空');
            return;
        }

        setActionLoading('branch');
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
            setActionLoading(null);
        }
    };

    const updateToken = async () => {
        if (!editingToken.trim()) {
            alert('Token不能为空');
            return;
        }

        setActionLoading('token');
        try {
            const response = await fetch(`/api/apis/${params.id}`, {
                method: 'PATCH',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ gitToken: editingToken }),
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
            setActionLoading(null);
        }
    };

    const generateNewToken = () => {
        // 生成一个随机的token
        const newToken = 'sk-' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        setEditingToken(newToken);
    };

    const normalizedBuildLogSearch = buildLogSearch.trim().toLowerCase();
    const decoratedBuildLogs = logs.map((log, index) => ({
        ...log,
        displayLevel: getLogLevel(log.message, log.level),
        lineNumber: index + 1,
    }));
    const buildLogStats = decoratedBuildLogs.reduce((stats, log) => {
        if (log.displayLevel === 'ERROR') stats.errors += 1;
        if (log.displayLevel === 'WARN') stats.warnings += 1;
        return stats;
    }, { errors: 0, warnings: 0 });
    const filteredBuildLogs = decoratedBuildLogs.filter((log) => {
        const matchesLevel = buildLogLevel === 'all'
            || log.displayLevel === buildLogLevel
            || (buildLogLevel === 'INFO' && !['ERROR', 'WARN'].includes(log.displayLevel));
        const matchesSearch = !normalizedBuildLogSearch
            || log.message.toLowerCase().includes(normalizedBuildLogSearch);

        return matchesLevel && matchesSearch;
    });

    if (loading) {
        return <LoadingSkeleton rows={1} itemClassName="h-64" showToolbar={false} />;
    }

    if (!api) {
        return (
            <div className="p-6">
                <div className="text-center py-12">
                    <i className="fas fa-exclamation-triangle text-yellow-500 text-4xl mb-3"></i>
                    <p className="text-gray-500">应用不存在</p>
                    <Link href="/dashboard/apis" className="text-blue-600 hover:text-blue-800">
                        返回应用列表
                    </Link>
                </div>
            </div>
        );
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
                <Link
                    href="/dashboard/apis"
                    className="text-blue-600 hover:text-blue-800 mb-4 inline-block"
                >
                    <i className="fas fa-arrow-left mr-2"></i>返回应用列表
                </Link>
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{api.name}</h1>
                        <p className="text-gray-600">应用服务详情信息</p>
                    </div>
                    <div className="space-x-2">
                        <button
                            onClick={redeployApi}
                            disabled={!!actionLoading}
                            className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 disabled:opacity-50"
                        >
                            {actionLoading === 'redeploy' ? '部署中...' : '重新部署'}
                        </button>
                        <button
                            onClick={deleteApi}
                            disabled={!!actionLoading}
                            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50"
                        >
                            {actionLoading === 'delete' ? '删除中...' : '删除应用'}
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
                        onClick={() => setActiveTab('runlogs')}
                        className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                            activeTab === 'runlogs'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        <i className="fas fa-terminal mr-2"></i>运行日志
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
                                <span className="text-gray-600">应用名称</span>
                                <span className="font-medium">{api.name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">状态</span>
                                <StatusBadge status={api.status} />
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
                                                disabled={!!actionLoading}
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
                                                disabled={!!actionLoading}
                                                className="text-green-600 hover:text-green-800 text-sm"
                                            >
                                                ✓
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setIsEditingToken(false);
                                                    setEditingToken(api.gitToken);
                                                }}
                                                className="text-red-600 hover:text-red-800 text-sm"
                                            >
                                                ✗
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <span className="font-medium text-sm">
                                                {api.gitToken ? `${api.gitToken.substring(0, 10)}...` : '未设置'}
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

                    {/* 应用测试卡片 */}
                    <div className="bg-white shadow rounded-lg p-6 lg:col-span-2">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">应用测试</h2>
                        <div className="bg-gray-900 text-gray-100 p-4 rounded font-mono text-sm">
                            <div className="mb-2">
                                <span className="text-green-400"># 测试您的应用地址</span>
                            </div>
                            <div className="mb-1">
                                <span className="text-blue-400">curl</span> -X GET <span
                                className="text-yellow-400">https://{api.domain}/</span>
                            </div>
                            {api.gitToken && (
                                <div className="mb-1">
                                    <span className="text-blue-400">curl</span> -H <span className="text-purple-400">"Authorization: Bearer {api.gitToken}"</span>
                                    <span className="text-yellow-400">https://{api.domain}/</span>
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
                <div className="bg-white shadow rounded-lg p-6 flex flex-col h-full">
                    <div className="mb-4 flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                        <div>
                            <h2 className="text-lg font-medium text-gray-900">部署日志</h2>
                            <p className="mt-1 text-sm text-gray-500">
                                共 {logs.length} 行
                                {filteredBuildLogs.length !== logs.length ? ` · 当前显示 ${filteredBuildLogs.length} 行` : ''}
                                {buildLogStats.errors > 0 ? ` · ${buildLogStats.errors} 个错误` : ''}
                                {buildLogStats.warnings > 0 ? ` · ${buildLogStats.warnings} 个警告` : ''}
                                {buildLogHasMore ? ' · Jenkins 仍在输出' : ''}
                                {buildLogMeta?.fetchedAt ? ` · ${new Date(buildLogMeta.fetchedAt).toLocaleTimeString('zh-CN')}` : ''}
                            </p>
                        </div>
                        <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center lg:justify-end text-sm">
                            <div className="relative min-w-0 lg:w-64">
                                <input
                                    type="search"
                                    value={buildLogSearch}
                                    onChange={(e) => setBuildLogSearch(e.target.value)}
                                    placeholder="搜索日志关键字"
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 pr-9 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <i className="fas fa-search absolute right-3 top-2.5 text-gray-400"></i>
                            </div>
                            <label className="flex items-center gap-2 text-gray-700">
                                级别
                                <select
                                    value={buildLogLevel}
                                    onChange={(e) => setBuildLogLevel(e.target.value)}
                                    className="rounded-md border border-gray-300 px-2 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    {buildLogLevelOptions.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <label className="flex items-center gap-2 text-gray-700">
                                <input
                                    type="checkbox"
                                    checked={autoRefreshBuildLogs}
                                    onChange={(e) => setAutoRefreshBuildLogs(e.target.checked)}
                                    className="h-4 w-4 rounded border-gray-300 text-blue-600"
                                />
                                自动刷新
                            </label>
                            <button
                                onClick={() => fetchApiLogs()}
                                disabled={logsLoading}
                                className="text-blue-600 hover:text-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <i className={`fas fa-sync-alt mr-1 ${logsLoading ? 'animate-spin' : ''}`}></i>
                                {logsLoading ? '拉取中' : '拉取新增'}
                            </button>
                            <button
                                onClick={() => fetchApiLogs({ reset: true })}
                                disabled={logsLoading}
                                className="text-gray-600 hover:text-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <i className="fas fa-redo mr-1"></i>
                                重新加载
                            </button>
                        </div>
                    </div>
                    {logsError && (
                        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            {logsError}
                        </div>
                    )}
                    <div className="bg-gray-950 text-gray-100 p-0 rounded font-mono text-sm h-[calc(100vh-280px)] min-h-96 overflow-y-auto">
                        {logsLoading && logs.length === 0 ? (
                            <div className="p-4 text-gray-400">正在加载部署日志...</div>
                        ) : filteredBuildLogs.length > 0 ? (
                            filteredBuildLogs.map((log) => (
                                <div
                                    key={log.id || log.lineNumber}
                                    className={`grid grid-cols-[3.5rem_4.5rem_minmax(0,1fr)] gap-3 border-l-2 px-4 py-1.5 ${getBuildLogClass(log.displayLevel)}`}
                                >
                                    <span className="select-none text-right text-gray-500">{log.lineNumber}</span>
                                    <span className="select-none text-xs font-semibold text-gray-400">{log.displayLevel}</span>
                                    <span className="whitespace-pre-wrap break-words">{log.message}</span>
                                </div>
                            ))
                        ) : logs.length > 0 ? (
                            <div className="p-4 text-gray-400">没有匹配当前筛选条件的日志</div>
                        ) : (
                            <div className="p-4 text-gray-400">暂无部署日志记录</div>
                        )}
                    </div>
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                        <div className="text-xs text-gray-500">
                            敏感字段会在服务端脱敏后展示。
                        </div>
                        <button
                            onClick={() => {
                                setLogs([]);
                                setLogsError('');
                                setBuildLogSearch('');
                                setBuildLogLevel('all');
                                setBuildLogCursor(0);
                                setBuildLogHasMore(false);
                                setBuildLogMeta(null);
                            }}
                            className="text-gray-600 hover:text-gray-800"
                        >
                            <i className="fas fa-trash mr-1"></i>清空当前视图
                        </button>
                    </div>
                </div>
            )}

            {activeTab === 'runlogs' && (
                <div className="bg-white shadow rounded-lg p-6 flex flex-col h-full">
                    <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div>
                            <h2 className="text-lg font-medium text-gray-900">运行日志</h2>
                            {runLogsMeta && (
                                <p className="mt-1 text-sm text-gray-500">
                                    {runLogsMeta.namespace} / {runLogsMeta.podName} / {runLogsMeta.containerName}
                                    {runLogsMeta.podPhase ? ` · ${runLogsMeta.podPhase}` : ''}
                                    {runLogsMeta.fetchedAt ? ` · ${new Date(runLogsMeta.fetchedAt).toLocaleTimeString('zh-CN')}` : ''}
                                </p>
                            )}
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-sm">
                            <label className="flex items-center gap-2 text-gray-700">
                                最近行数
                                <select
                                    value={runLogTailLines}
                                    onChange={(e) => setRunLogTailLines(Number(e.target.value))}
                                    className="rounded border border-gray-300 px-2 py-1 text-sm"
                                >
                                    <option value={100}>100</option>
                                    <option value={200}>200</option>
                                    <option value={500}>500</option>
                                    <option value={1000}>1000</option>
                                </select>
                            </label>
                            <label className="flex items-center gap-2 text-gray-700">
                                <input
                                    type="checkbox"
                                    checked={autoRefreshRunLogs}
                                    onChange={(e) => setAutoRefreshRunLogs(e.target.checked)}
                                    className="h-4 w-4 rounded border-gray-300 text-blue-600"
                                />
                                自动刷新
                            </label>
                            <button
                                onClick={() => fetchRunLogs()}
                                disabled={runLogsLoading}
                                className="text-blue-600 hover:text-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <i className={`fas fa-sync-alt mr-1 ${runLogsLoading ? 'animate-spin' : ''}`}></i>
                                {runLogsLoading ? '刷新中' : '刷新日志'}
                            </button>
                        </div>
                    </div>
                    {runLogsError && (
                        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            {runLogsError}
                        </div>
                    )}
                    <div className="bg-gray-900 text-gray-100 p-4 rounded font-mono text-sm h-[calc(100vh-255px)] overflow-y-auto">
                        {runLogsLoading && runLogs.length === 0 ? (
                            <div className="text-gray-400">正在加载运行日志...</div>
                        ) : runLogs.length > 0 ? (
                            runLogs.map((log, index) => (
                                <div key={index} className="mb-1">
                                    <span className="whitespace-pre-wrap break-words text-gray-200">{log}</span>
                                </div>
                            ))
                        ) : (
                            <div className="text-gray-400">暂无运行日志</div>
                        )}
                    </div>
                    <div className="mt-4 flex justify-between">
                        <button
                            onClick={() => {
                                setRunLogs([]);
                                setRunLogsError('');
                            }}
                            className="text-gray-600 hover:text-gray-800"
                        >
                            <i className="fas fa-trash mr-1"></i>清空当前视图
                        </button>
                    </div>
                </div>
            )}


            {/* 设置标签页 */}
            {activeTab === 'settings' && (
                <div className="bg-white shadow rounded-lg p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">应用设置</h2>
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
                                            setActionLoading('envs');
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
                                                setActionLoading(null);
                                            }
                                        }}
                                        disabled={!!actionLoading}
                                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
                                    >
                                        {actionLoading === 'envs' ? '保存中...' : '保存环境变量'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* 危险操作 */}
                        <div>
                            <h3 className="text-md font-medium text-gray-700 mb-2">危险操作</h3>
                            <div className="bg-red-50 p-4 rounded border border-red-200">
                                <p className="text-sm text-red-700 mb-3">
                                    删除应用将永久移除所有相关数据和部署，此操作不可恢复。
                                </p>
                                <button
                                    onClick={deleteApi}
                                    disabled={!!actionLoading}
                                    className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50"
                                >
                                    {actionLoading === 'delete' ? '删除中...' : '删除应用'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
