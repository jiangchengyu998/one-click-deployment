// src/app/admin/apis/page.js
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminApis() {
    const [apis, setApis] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [showDetailModal, setShowDetailModal] = useState(null);
    const [showDeployModal, setShowDeployModal] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [editingApiInfor, setEditingApiInfor] = useState(null);
    const [newApiInfor, setNewApiInfor] = useState({
        serverIp: '',
        serverPort: '',
        execNode: ''
    });
    const router = useRouter();

    useEffect(() => {
        fetchApis();
    }, []);

    const fetchApis = async () => {
        try {
            const response = await fetch('/api/admin/apis');
            if (response.ok) {
                const data = await response.json();
                setApis(data);
            } else if (response.status === 401) {
                router.push('/admin/login');
            }
        } catch (error) {
            console.error('获取API列表失败:', error);
        } finally {
            setLoading(false);
        }
    };

    const deleteApi = async (apiId) => {
        if (!confirm('确定要删除这个API吗？此操作将删除所有相关部署，不可恢复！')) return;

        try {
            const response = await fetch(`/api/admin/apis/${apiId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                fetchApis();
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
            const response = await fetch(`/api/admin/apis/${apiId}/redeploy`, {
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

    // ApiInfor 管理功能
    const addApiInfor = async (apiId, apiInforData) => {
        try {
            const response = await fetch(`/api/admin/apis/${apiId}/api-infors`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(apiInforData),
            });

            if (response.ok) {
                alert('部署信息添加成功');
                fetchApis(); // 刷新数据
                setNewApiInfor({ serverIp: '', serverPort: '', execNode: '' });
            } else {
                const data = await response.json();
                alert(data.error || '添加失败');
            }
        } catch (error) {
            alert('网络错误，请重试');
        }
    };

    const updateApiInfor = async (apiInforId, apiInforData) => {
        try {
            const response = await fetch(`/api/admin/api-infors/${apiInforId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(apiInforData),
            });

            if (response.ok) {
                alert('部署信息更新成功');
                fetchApis(); // 刷新数据
                setEditingApiInfor(null);
            } else {
                const data = await response.json();
                alert(data.error || '更新失败');
            }
        } catch (error) {
            alert('网络错误，请重试');
        }
    };

    const deleteApiInfor = async (apiInforId) => {
        if (!confirm('确定要删除这个部署信息吗？')) return;

        try {
            const response = await fetch(`/api/admin/api-infors/${apiInforId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                alert('部署信息删除成功');
                fetchApis();
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
                <h1 className="text-2xl font-bold text-gray-900">API服务管理</h1>
                <p className="text-gray-600">管理平台所有API服务实例</p>
            </div>

            {/* 统计信息和搜索栏 */}
            <div className="mb-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3">
                    <div className="flex space-x-4">
                        <div className="relative flex-1">
                            <input
                                type="text"
                                placeholder="搜索API（名称、域名、用户名）"
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
                    <div className="text-sm text-gray-500">总API数</div>
                    <div className="text-2xl font-bold text-gray-900">{apis.length}</div>
                </div>
            </div>

            {/* API列表 */}
            <div className="bg-white shadow overflow-hidden rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            API信息
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            所属用户
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            域名/仓库
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            部署实例
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
                        <tr key={api.id} className="hover:bg-gray-50">
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
                            <td className="px-6 py-4">
                                <div className="text-sm">
                                    {api.api_infor && api.api_infor.length > 0 ? (
                                        <div className="space-y-1">
                                            {api.api_infor.map((info, index) => (
                                                <div key={info.id} className="text-xs bg-gray-100 px-2 py-1 rounded">
                                                    <div>{info.serverIp}:{info.serverPort}</div>
                                                    <div className="text-gray-500">节点: {info.execNode}</div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <span className="text-gray-400">无部署实例</span>
                                    )}
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(api.status)}`}>
                                {getStatusText(api.status)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(api.createdAt).toLocaleDateString('zh-CN')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
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
                                        disabled={actionLoading}
                                        className="text-yellow-600 hover:text-yellow-900"
                                        title="重新部署"
                                    >
                                        <i className="fas fa-redo"></i>
                                    </button>
                                )}
                                <button
                                    onClick={() => deleteApi(api.id)}
                                    className="text-red-600 hover:text-red-900"
                                    title="删除API"
                                >
                                    <i className="fas fa-trash"></i>
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
                            {searchTerm || filterStatus !== 'all' ? '没有找到匹配的API' : '还没有API服务'}
                        </p>
                    </div>
                )}
            </div>

            {/* API详情模态框 */}
            {showDetailModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
                    <div className="relative bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-medium text-gray-900">API服务详情</h3>
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
                                            <span className="text-sm text-gray-500">API名称:</span>
                                            <div className="font-medium">{showDetailModal.name}</div>
                                        </div>
                                        <div>
                                            <span className="text-sm text-gray-500">API ID:</span>
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

                            {/* 部署实例管理 */}
                            <div className="mt-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="font-medium text-gray-700">部署实例管理</h4>
                                    {/*<button*/}
                                    {/*    onClick={() => setShowDeployModal(showDetailModal)}*/}
                                    {/*    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"*/}
                                    {/*>*/}
                                    {/*    <i className="fas fa-plus mr-1"></i>添加实例*/}
                                    {/*</button>*/}
                                </div>

                                {showDetailModal.api_infor && showDetailModal.api_infor.length > 0 ? (
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <div className="space-y-3">
                                            {showDetailModal.api_infor.map((info) => (
                                                <div key={info.id} className="bg-white rounded-lg p-3 border">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div>
                                                            <h5 className="font-medium text-gray-900">
                                                                {info.serverIp}:{info.serverPort}
                                                            </h5>
                                                            <p className="text-sm text-gray-500">执行节点: {info.execNode}</p>
                                                        </div>
                                                        <div className="flex space-x-2">
                                                            <button
                                                                onClick={() => setEditingApiInfor(info)}
                                                                className="text-blue-600 hover:text-blue-900 text-sm"
                                                                title="编辑"
                                                            >
                                                                <i className="fas fa-edit"></i>
                                                            </button>
                                                            {/*<button*/}
                                                            {/*    onClick={() => deleteApiInfor(info.id)}*/}
                                                            {/*    className="text-red-600 hover:text-red-900 text-sm"*/}
                                                            {/*    title="删除"*/}
                                                            {/*>*/}
                                                            {/*    <i className="fas fa-trash"></i>*/}
                                                            {/*</button>*/}
                                                        </div>
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        创建时间: {new Date(info.createdAt).toLocaleString('zh-CN')}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-gray-50 rounded-lg p-8 text-center">
                                        <i className="fas fa-server text-gray-300 text-3xl mb-2"></i>
                                        <p className="text-gray-500">暂无部署实例</p>
                                    </div>
                                )}
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

            {/* 添加部署实例模态框 */}
            {showDeployModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
                    <div className="relative bg-white rounded-lg max-w-md w-full">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-medium text-gray-900">添加部署实例</h3>
                                <button
                                    onClick={() => setShowDeployModal(null)}
                                    className="text-gray-400 hover:text-gray-500"
                                >
                                    <i className="fas fa-times"></i>
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        服务器IP
                                    </label>
                                    <input
                                        type="text"
                                        value={newApiInfor.serverIp}
                                        onChange={(e) => setNewApiInfor({...newApiInfor, serverIp: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="例如: 192.168.1.100"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        服务器端口
                                    </label>
                                    <input
                                        type="number"
                                        value={newApiInfor.serverPort}
                                        onChange={(e) => setNewApiInfor({...newApiInfor, serverPort: parseInt(e.target.value) || ''})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="例如: 3000"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        执行节点
                                    </label>
                                    <input
                                        type="text"
                                        value={newApiInfor.execNode}
                                        onChange={(e) => setNewApiInfor({...newApiInfor, execNode: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="例如: node-1"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3 mt-6">
                                <button
                                    onClick={() => setShowDeployModal(null)}
                                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                                >
                                    取消
                                </button>
                                <button
                                    onClick={() => {
                                        addApiInfor(showDeployModal.id, newApiInfor);
                                        setShowDeployModal(null);
                                    }}
                                    className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
                                    disabled={!newApiInfor.serverIp || !newApiInfor.serverPort || !newApiInfor.execNode}
                                >
                                    添加
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 编辑部署实例模态框 */}
            {editingApiInfor && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
                    <div className="relative bg-white rounded-lg max-w-md w-full">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-medium text-gray-900">编辑部署实例</h3>
                                <button
                                    onClick={() => setEditingApiInfor(null)}
                                    className="text-gray-400 hover:text-gray-500"
                                >
                                    <i className="fas fa-times"></i>
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        服务器IP
                                    </label>
                                    <input
                                        type="text"
                                        value={editingApiInfor.serverIp}
                                        onChange={(e) => setEditingApiInfor({...editingApiInfor, serverIp: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        服务器端口
                                    </label>
                                    <input
                                        type="number"
                                        value={editingApiInfor.serverPort}
                                        onChange={(e) => setEditingApiInfor({...editingApiInfor, serverPort: parseInt(e.target.value) || ''})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        执行节点
                                    </label>
                                    <input
                                        type="text"
                                        value={editingApiInfor.execNode}
                                        onChange={(e) => setEditingApiInfor({...editingApiInfor, execNode: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3 mt-6">
                                <button
                                    onClick={() => setEditingApiInfor(null)}
                                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                                >
                                    取消
                                </button>
                                <button
                                    onClick={() => {
                                        const { id, ...updateData } = editingApiInfor;
                                        updateApiInfor(id, updateData);
                                    }}
                                    className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
                                    disabled={!editingApiInfor.serverIp || !editingApiInfor.serverPort || !editingApiInfor.execNode}
                                >
                                    更新
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}