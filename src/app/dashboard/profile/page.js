// src/app/dashboard/profile/page.js
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function UserProfile() {
    const [user, setUser] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [activeTab, setActiveTab] = useState('profile');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const router = useRouter();

    useEffect(() => {
        fetchUserProfile();
    }, []);

    const fetchUserProfile = async () => {
        try {
            const response = await fetch('/api/users/me');

            if (response.status === 401) {
                router.push('/auth/login');
                return;
            }

            if (response.ok) {
                const data = await response.json();
                setUser(data);
                setFormData(prev => ({
                    ...prev,
                    name: data.name,
                    email: data.email
                }));
            }
        } catch (error) {
            console.error('获取用户信息失败:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setUpdating(true);
        setError('');
        setMessage('');

        try {
            const response = await fetch('/api/users/me', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: formData.name
                }),
            });

            if (response.ok) {
                setMessage('个人信息更新成功');
                fetchUserProfile(); // 刷新数据
            } else {
                const data = await response.json();
                setError(data.error || '更新失败');
            }
        } catch (error) {
            setError('网络错误，请重试');
        } finally {
            setUpdating(false);
        }
    };

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        setUpdating(true);
        setError('');
        setMessage('');

        if (formData.newPassword !== formData.confirmPassword) {
            setError('新密码不匹配');
            setUpdating(false);
            return;
        }

        if (formData.newPassword.length < 6) {
            setError('新密码至少需要6位字符');
            setUpdating(false);
            return;
        }

        try {
            const response = await fetch('/api/users/me/password', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    currentPassword: formData.currentPassword,
                    newPassword: formData.newPassword
                }),
            });

            if (response.ok) {
                setMessage('密码更新成功');
                setFormData(prev => ({
                    ...prev,
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                }));
            } else {
                const data = await response.json();
                setError(data.error || '密码更新失败');
            }
        } catch (error) {
            setError('网络错误，请重试');
        } finally {
            setUpdating(false);
        }
    };

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    if (loading) {
        return (
            <div className="p-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
                    <div className="h-64 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">个人资料</h1>
                <p className="text-gray-600">管理您的账户信息和密码</p>
            </div>

            <div className="bg-white shadow rounded-lg overflow-hidden">
                {/* 标签页导航 */}
                <div className="border-b border-gray-200">
                    <nav className="flex -mb-px">
                        <button
                            onClick={() => setActiveTab('profile')}
                            className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                                activeTab === 'profile'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            <i className="fas fa-user mr-2"></i>个人信息
                        </button>
                        <button
                            onClick={() => setActiveTab('password')}
                            className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                                activeTab === 'password'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            <i className="fas fa-lock mr-2"></i>修改密码
                        </button>
                        <button
                            onClick={() => setActiveTab('quota')}
                            className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                                activeTab === 'quota'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            <i className="fas fa-chart-bar mr-2"></i>配额信息
                        </button>
                    </nav>
                </div>

                {/* 标签页内容 */}
                <div className="p-6">
                    {message && (
                        <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                            {message}
                        </div>
                    )}

                    {error && (
                        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                            {error}
                        </div>
                    )}

                    {/* 个人信息标签页 */}
                    {activeTab === 'profile' && (
                        <form onSubmit={handleProfileUpdate}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        用户名
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        邮箱地址
                                    </label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        disabled
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">邮箱地址不可修改</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        用户代码
                                    </label>
                                    <input
                                        type="text"
                                        value={user?.code}
                                        disabled
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">用于生成专属域名</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        注册时间
                                    </label>
                                    <input
                                        type="text"
                                        value={user ? new Date(user.createdAt).toLocaleDateString('zh-CN') : ''}
                                        disabled
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500"
                                    />
                                </div>
                            </div>
                            <div className="mt-6">
                                <button
                                    type="submit"
                                    disabled={updating}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {updating ? '更新中...' : '更新个人信息'}
                                </button>
                            </div>
                        </form>
                    )}

                    {/* 修改密码标签页 */}
                    {activeTab === 'password' && (
                        <form onSubmit={handlePasswordUpdate}>
                            <div className="space-y-4 max-w-md">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        当前密码
                                    </label>
                                    <input
                                        type="password"
                                        name="currentPassword"
                                        value={formData.currentPassword}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        新密码
                                    </label>
                                    <input
                                        type="password"
                                        name="newPassword"
                                        value={formData.newPassword}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                        minLength="6"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        确认新密码
                                    </label>
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="mt-6">
                                <button
                                    type="submit"
                                    disabled={updating}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {updating ? '更新中...' : '更新密码'}
                                </button>
                            </div>
                        </form>
                    )}

                    {/* 配额信息标签页 */}
                    {activeTab === 'quota' && (
                        <div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">API配额</h3>
                                    <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-blue-600">
                      {user?.apiQuota || 0}
                    </span>
                                        <span className="text-sm text-gray-500">
                      已使用: {user?._count?.apis || 0}
                    </span>
                                    </div>
                                    <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-blue-600 h-2 rounded-full"
                                            style={{ width: `${((user?._count?.apis || 0) / (user?.apiQuota || 1)) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">数据库配额</h3>
                                    <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-green-600">
                      {user?.dbQuota || 0}
                    </span>
                                        <span className="text-sm text-gray-500">
                      已使用: {user?._count?.databases || 0}
                    </span>
                                    </div>
                                    <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-green-600 h-2 rounded-full"
                                            style={{ width: `${((user?._count?.databases || 0) / (user?.dbQuota || 1)) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-6 text-sm text-gray-500">
                                <p>如需增加配额，请联系平台管理员。</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}