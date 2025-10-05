// src/app/dashboard/apis/page.js
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function UserApis() {
    const [apis, setApis] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [userQuota, setUserQuota] = useState({ apiQuota: 0, currentApis: 0 , code: ''});
    const [actionLoading, setActionLoading] = useState(false);
    const router = useRouter();

    // 新API表单状态
    const [newApi, setNewApi] = useState({
        name: '',
        gitUrl: '',
        gitToken: '',
        branch: 'main', // 添加默认分支
        envs: [], // 新增环境变量字段
        dockerfile: 'default' // default 或 custom
    });

    useEffect(() => {
        fetchApis();
        fetchUserQuota();
    }, []);

    const fetchApis = async () => {
        try {
            const response = await fetch('/api/apis');
            if (response.ok) {
                const data = await response.json();
                setApis(data);
            } else if (response.status === 401) {
                router.push('/auth/login');
            }
        } catch (error) {
            console.error('获取API列表失败:', error);
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
                    apiQuota: data.apiQuota,
                    currentApis: data._count?.apis || 0,
                    code: data.code
                });
            }
        } catch (error) {
            console.error('获取用户配额失败:', error);
        }
    };

    const createApi = async (e) => {
        e.preventDefault();
        setActionLoading(true);

        try {

            // 将 envs 数组转换为对象
            const envsObject = {};
            newApi.envs.forEach(env => {
                if (env.key && env.key.trim() !== '') {
                    envsObject[env.key.trim()] = env.value;
                }
            });

            const payload = {
                ...newApi,
                envs: envsObject
            };

            const response = await fetch('/api/apis', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                setShowCreateModal(false);
                setNewApi({
                    name: '',
                    gitUrl: '',
                    gitToken: '',
                    dockerfile: 'default'
                });
                fetchApis();
                fetchUserQuota();
            } else {
                const data = await response.json();
                alert(data.error || '创建API失败');
            }
        } catch (error) {
            alert('网络错误，请重试');
        } finally {
            setActionLoading(false);
        }
    };

    const deleteApi = async (apiId) => {
        if (!confirm('确定要删除这个API吗？此操作不可恢复！')) return;

        try {
            const response = await fetch(`/api/apis/${apiId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                fetchApis();
                fetchUserQuota();
            } else {
                alert('删除失败');
            }
        } catch (error) {
            alert('网络错误，请重试');
        }
    };

    const redeployApi = async (apiId) => {
        setActionLoading(true);

        try {
            const response = await fetch(`/api/apis/${apiId}/redeploy`, {
                method: 'POST',
            });

            if (response.ok) {
                alert('API重新部署命令已发送');
                fetchApis(); // 刷新状态
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

    // --- 修改环境变量操作 ---
    const handleAddEnv = () => {
        const newEnv = {
            id: Date.now().toString(), // 使用时间戳作为唯一ID
            key: '',
            value: ''
        };
        setNewApi({
            ...newApi,
            envs: [...newApi.envs, newEnv]
        });
    };

    const handleEnvChange = (id, field, value) => {
        setNewApi({
            ...newApi,
            envs: newApi.envs.map(env =>
                env.id === id ? { ...env, [field]: value } : env
            )
        });
    };

    const handleRemoveEnv = (id) => {
        setNewApi({
            ...newApi,
            envs: newApi.envs.filter(env => env.id !== id)
        });
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
                    <h1 className="text-2xl font-bold text-gray-900">我的API服务</h1>
                    <p className="text-gray-600">
                        配额: {userQuota.currentApis}/{userQuota.apiQuota}
                    </p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    disabled={userQuota.currentApis >= userQuota.apiQuota}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 flex items-center"
                >
                    <i className="fas fa-plus mr-2"></i> 部署新API
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {apis.map((api) => (
                    <div key={api.id} className="bg-white shadow rounded-lg overflow-hidden">
                        <div className="px-4 py-5 sm:p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <i className="fas fa-code text-blue-500 text-xl"></i>
                                    </div>
                                    <div className="ml-3">
                                        <h3 className="text-lg leading-6 font-medium text-gray-900">{api.name}</h3>
                                    </div>
                                </div>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(api.status)}`}>
                  {getStatusText(api.status)}
                </span>
                            </div>

                            <div className="mt-4 space-y-2">
                                <div className="text-sm text-gray-600 truncate">
                                    <span className="font-medium">域名:</span> {api.domain}
                                </div>
                                <div className="text-sm text-gray-600 truncate">
                                    <span className="font-medium">仓库:</span> {api.gitUrl}
                                </div>
                                <div className="text-sm text-gray-500">
                                    创建时间: {new Date(api.createdAt).toLocaleDateString('zh-CN')}
                                </div>
                            </div>

                            <div className="mt-4 flex space-x-3">
                                <Link
                                    href={`/dashboard/apis/${api.id}`}
                                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                >
                                    <i className="fas fa-eye mr-1"></i> 查看详情
                                </Link>
                                {api.status === 'RUNNING' && (
                                    <button
                                        onClick={() => redeployApi(api.id)}
                                        disabled={actionLoading}
                                        className="inline-flex items-center px-3 py-2 border border-yellow-300 shadow-sm text-sm leading-4 font-medium rounded-md text-yellow-700 bg-white hover:bg-yellow-50"
                                    >
                                        <i className="fas fa-redo mr-1"></i> 重新部署
                                    </button>
                                )}
                                <button
                                    onClick={() => deleteApi(api.id)}
                                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                                >
                                    <i className="fas fa-trash mr-1"></i> 删除
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {apis.length === 0 && (
                <div className="text-center py-12">
                    <i className="fas fa-code text-gray-300 text-4xl mb-3"></i>
                    <p className="text-gray-500">您还没有部署任何API</p>
                    {userQuota.apiQuota > 0 && (
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="mt-2 text-blue-600 hover:text-blue-800"
                        >
                            部署第一个API
                        </button>
                    )}
                </div>
            )}

            {/* 创建API模态框 */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
                    <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">部署新API</h3>
                            <form onSubmit={createApi}>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">API名称</label>
                                        <input
                                            type="text"
                                            required
                                            value={newApi.name}
                                            onChange={(e) => setNewApi({...newApi, name: e.target.value})}
                                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                                            placeholder="my-api"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">将用于生成域名: {newApi.name || 'my-api'}-{userQuota.code}.{process.env.NEXT_PUBLIC_MAIN_DOMAIN}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Git仓库地址</label>
                                        <input
                                            type="url"
                                            required
                                            value={newApi.gitUrl}
                                            onChange={(e) => setNewApi({...newApi, gitUrl: e.target.value})}
                                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                                            placeholder="https://github.com/username/repository"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Git Token (可选)</label>
                                        <input
                                            type="password"
                                            value={newApi.gitToken}
                                            onChange={(e) => setNewApi({...newApi, gitToken: e.target.value})}
                                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                                            placeholder="ghp_..."
                                        />
                                        <p className="text-xs text-gray-500 mt-1">私有仓库需要提供token</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Git分支 (可选)</label>
                                        <input
                                            type="text"
                                            value={newApi.branch}
                                            onChange={(e) => setNewApi({...newApi, branch: e.target.value})}
                                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                                            placeholder="main"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">默认分支为main</p>
                                    </div>
                                    {/*<div>*/}
                                    {/*    <label className="block text-sm font-medium text-gray-700">Dockerfile配置</label>*/}
                                    {/*    <select*/}
                                    {/*        value={newApi.dockerfile}*/}
                                    {/*        onChange={(e) => setNewApi({...newApi, dockerfile: e.target.value})}*/}
                                    {/*        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"*/}
                                    {/*    >*/}
                                    {/*        <option value="default">使用默认Dockerfile</option>*/}
                                    {/*        <option value="custom">使用仓库中的Dockerfile</option>*/}
                                    {/*    </select>*/}
                                    {/*</div>*/}
                                </div>
                                {/* 环境变量配置 */}
                                {/* 环境变量配置 */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">环境变量</label>
                                    <div className="space-y-2 mt-2">
                                        {newApi.envs.length === 0 && (
                                            <p className="text-xs text-gray-500">尚未添加环境变量</p>
                                        )}
                                        {newApi.envs.map((env) => (
                                            <div key={env.id} className="flex space-x-2"> {/* 使用 env.id 作为 key */}
                                                {/* Key 输入框 */}
                                                <input
                                                    type="text"
                                                    value={env.key}
                                                    onChange={(e) => handleEnvChange(env.id, 'key', e.target.value)}
                                                    className="w-1/3 border border-gray-300 rounded-md px-2 py-1"
                                                    placeholder="变量名 (如 DB_USER)"
                                                />

                                                {/* Value 输入框 */}
                                                <input
                                                    type="text"
                                                    value={env.value}
                                                    onChange={(e) => handleEnvChange(env.id, 'value', e.target.value)}
                                                    className="w-2/3 border border-gray-300 rounded-md px-2 py-1"
                                                    placeholder="值"
                                                />

                                                {/* 删除按钮 */}
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveEnv(env.id)}
                                                    className="text-red-500 hover:text-red-700"
                                                >
                                                    删除
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleAddEnv}
                                        className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                                    >
                                        + 添加环境变量
                                    </button>
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
                                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        {actionLoading ? '部署中...' : '开始部署'}
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