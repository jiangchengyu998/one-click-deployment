// src/app/dashboard/apis/page.js
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import StatusBadge from '@/components/ui/StatusBadge';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import Toast from '@/components/ui/Toast';
import { useI18n } from '@/components/i18n/LanguageProvider';

const initialNewApi = {
    name: '',
    gitUrl: '',
    gitToken: '',
    branch: 'main',
    envs: [],
    dockerfile: 'default',
};
const API_NAME_PATTERN = /^[a-z]+$/;

function envListToObject(envs) {
    const result = {};

    envs.forEach((env) => {
        const key = env.key.trim();
        if (key) {
            result[key] = env.value;
        }
    });

    return result;
}

export default function UserApis() {
    const { t, locale } = useI18n();
    const [apis, setApis] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [userQuota, setUserQuota] = useState({ apiQuota: 0, currentApis: 0 , code: ''});
    const [actionLoading, setActionLoading] = useState(null);
    const [toast, setToast] = useState(null);
    const router = useRouter();

    const [newApi, setNewApi] = useState(initialNewApi);
    const isApiNameValid = newApi.name === '' || API_NAME_PATTERN.test(newApi.name);

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
            console.error(t('dashboard.fetchApiListFailed'), error);
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
            console.error(t('dashboard.fetchQuotaFailed'), error);
        }
    };

    const createApi = async (e) => {
        e.preventDefault();
        if (!API_NAME_PATTERN.test(newApi.name)) {
            alert(t('dashboard.apiNameInvalid'));
            return;
        }
        setActionLoading('create');

        try {

            const payload = {
                ...newApi,
                envs: envListToObject(newApi.envs),
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
                setNewApi(initialNewApi);
                fetchApis();
                fetchUserQuota();
            } else {
                const data = await response.json();
                alert(data.error || t('dashboard.createApiFailed'));
            }
        } catch (error) {
            alert(t('dashboard.networkRetry'));
        } finally {
            setActionLoading(null);
        }
    };

    const deleteApi = async (apiId) => {
        if (!confirm(t('dashboard.confirmDeleteApi'))) return;

        setActionLoading(`delete:${apiId}`);
        try {
            const response = await fetch(`/api/apis/${apiId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                fetchApis();
                fetchUserQuota();
            } else {
                alert(t('dashboard.deleteFailed'));
            }
        } catch (error) {
            alert(t('dashboard.networkRetry'));
        } finally {
            setActionLoading(null);
        }
    };

    const redeployApi = async (apiId) => {
        setActionLoading(`redeploy:${apiId}`);

        try {
            const response = await fetch(`/api/apis/${apiId}/redeploy`, {
                method: 'POST',
            });

            if (response.ok) {
                setToast({
                    type: 'success',
                    title: t('dashboard.redeployStarted'),
                    message: t('dashboard.redeploySent'),
                });
                fetchApis(); // 刷新状态
            } else {
                const data = await response.json();
                setToast({
                    type: 'error',
                    title: t('dashboard.redeployFailed'),
                    message: data.error || t('dashboard.redeployFailed'),
                });
            }
        } catch (error) {
            setToast({
                type: 'error',
                title: t('dashboard.redeployFailed'),
                message: t('dashboard.networkRetry'),
            });
        } finally {
            setActionLoading(null);
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
        return <LoadingSkeleton rows={3} itemClassName="h-24" />;
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
            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{t('dashboard.myApis')}</h1>
                    <p className="text-gray-600">
                        {t('dashboard.quota')}: {userQuota.currentApis}/{userQuota.apiQuota}
                    </p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    disabled={userQuota.currentApis >= userQuota.apiQuota}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 flex items-center"
                >
                    <i className="fas fa-plus mr-2"></i> {t('dashboard.deployNewApi')}
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
                                <StatusBadge status={api.status} />
                            </div>

                            <div className="mt-4 space-y-2">
                                <div className="text-sm text-gray-600 truncate">
                                    <span className="font-medium">{t('dashboard.domain')}:</span> {api.domain}
                                </div>
                                <div className="text-sm text-gray-600 truncate">
                                    <span className="font-medium">{t('dashboard.repository')}:</span> {api.gitUrl}
                                </div>
                                <div className="text-sm text-gray-500">
                                    {t('cards.createdAt')}: {new Date(api.createdAt).toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US')}
                                </div>
                            </div>

                            <div className="mt-4 flex flex-wrap gap-3">
                                <Link
                                    href={`/dashboard/apis/${api.id}`}
                                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                >
                                    <i className="fas fa-eye mr-1"></i> {t('dashboard.details')}
                                </Link>
                                {api.status === 'RUNNING' && (
                                    <button
                                        onClick={() => redeployApi(api.id)}
                                        disabled={!!actionLoading}
                                        className="inline-flex items-center px-3 py-2 border border-yellow-300 shadow-sm text-sm leading-4 font-medium rounded-md text-yellow-700 bg-white hover:bg-yellow-50 disabled:opacity-50"
                                    >
                                        <i className={`fas ${actionLoading === `redeploy:${api.id}` ? 'fa-spinner fa-spin' : 'fa-redo'} mr-1`}></i> {t('dashboard.redeploy')}
                                    </button>
                                )}
                                <button
                                    onClick={() => deleteApi(api.id)}
                                    disabled={!!actionLoading}
                                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
                                >
                                    <i className={`fas ${actionLoading === `delete:${api.id}` ? 'fa-spinner fa-spin' : 'fa-trash'} mr-1`}></i> {t('cards.delete')}
                                </button>
                                <Link
                                    href={`/dashboard/apis/${api.id}?tab=logs`}
                                    className="inline-flex items-center px-3 py-2 border border-blue-200 shadow-sm text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100"
                                >
                                    <i className="fas fa-file-alt mr-1"></i> 部署日志
                                </Link>
                                <Link
                                    href={`/dashboard/apis/${api.id}?tab=runlogs`}
                                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                >
                                    <i className="fas fa-terminal mr-1"></i> 运行日志
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {apis.length === 0 && (
                <div className="text-center py-12">
                    <i className="fas fa-code text-gray-300 text-4xl mb-3"></i>
                    <p className="text-gray-500">{t('dashboard.noApis')}</p>
                    {userQuota.apiQuota > 0 && (
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="mt-2 text-blue-600 hover:text-blue-800"
                        >
                            {t('dashboard.deployFirstApi')}
                        </button>
                    )}
                </div>
            )}

            {/* 创建App模态框 */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
                    <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">{t('dashboard.deployNewApi')}</h3>
                            <form onSubmit={createApi}>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">{t('dashboard.apiName')}</label>
                                        <input
                                            type="text"
                                            required
                                            pattern="[a-z]+"
                                            title={t('dashboard.apiNameInvalid')}
                                            value={newApi.name}
                                            onChange={(e) => setNewApi({...newApi, name: e.target.value})}
                                            className={`mt-1 block w-full border rounded-md px-3 py-2 ${isApiNameValid ? 'border-gray-300' : 'border-red-400 focus:border-red-500 focus:ring-red-500'}`}
                                            placeholder="myapp"
                                        />
                                        <p className={`text-xs mt-1 ${isApiNameValid ? 'text-gray-500' : 'text-red-600'}`}>
                                            {isApiNameValid
                                                ? t('dashboard.apiNameHint')
                                                : t('dashboard.apiNameInvalid')}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">{t('dashboard.generatedDomain', { domain: `${newApi.name || 'myapp'}-${userQuota.code}.${process.env.NEXT_PUBLIC_MAIN_DOMAIN}` })}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">{t('dashboard.gitRepositoryUrl')}</label>
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
                                        <label className="block text-sm font-medium text-gray-700">{t('dashboard.gitToken')}</label>
                                        <input
                                            type="password"
                                            value={newApi.gitToken}
                                            onChange={(e) => setNewApi({...newApi, gitToken: e.target.value})}
                                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                                            placeholder="ghp_..."
                                        />
                                        <p className="text-xs text-gray-500 mt-1">{t('dashboard.privateRepoToken')}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">{t('dashboard.gitBranch')}</label>
                                        <input
                                            type="text"
                                            value={newApi.branch}
                                            onChange={(e) => setNewApi({...newApi, branch: e.target.value})}
                                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                                            placeholder="main"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">{t('dashboard.defaultBranch')}</p>
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
                                    <label className="block text-sm font-medium text-gray-700">{t('dashboard.envVars')}</label>
                                    <div className="space-y-2 mt-2">
                                        {newApi.envs.length === 0 && (
                                            <p className="text-xs text-gray-500">{t('dashboard.noEnvVars')}</p>
                                        )}
                                        {newApi.envs.map((env) => (
                                            <div key={env.id} className="flex space-x-2"> {/* 使用 env.id 作为 key */}
                                                {/* Key 输入框 */}
                                                <input
                                                    type="text"
                                                    value={env.key}
                                                    onChange={(e) => handleEnvChange(env.id, 'key', e.target.value)}
                                                    className="w-1/3 border border-gray-300 rounded-md px-2 py-1"
                                                    placeholder={t('dashboard.envKeyPlaceholder')}
                                                />

                                                {/* Value 输入框 */}
                                                <input
                                                    type="text"
                                                    value={env.value}
                                                    onChange={(e) => handleEnvChange(env.id, 'value', e.target.value)}
                                                    className="w-2/3 border border-gray-300 rounded-md px-2 py-1"
                                                    placeholder={t('dashboard.envValuePlaceholder')}
                                                />

                                                {/* 删除按钮 */}
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveEnv(env.id)}
                                                    className="text-red-500 hover:text-red-700"
                                                >
                                                    {t('cards.delete')}
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleAddEnv}
                                        className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                                    >
                                        {t('dashboard.addEnvVar')}
                                    </button>
                                </div>
                                <div className="flex justify-end space-x-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateModal(false)}
                                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                    >
                                        {t('dashboard.cancel')}
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={!!actionLoading || !newApi.name || !isApiNameValid}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        {actionLoading === 'create' ? t('dashboard.deploying') : t('dashboard.startDeploy')}
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
