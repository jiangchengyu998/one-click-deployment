// src/components/admin/Header.js
"use client";

import { useState } from 'react';

export default function AdminHeader({ setSidebarOpen }) {
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const resetPasswordForm = () => {
        setFormData({
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
        });
        setMessage('');
        setError('');
        setLoading(false);
    };

    const closePasswordModal = () => {
        setShowPasswordModal(false);
        resetPasswordForm();
    };

    const handlePasswordSubmit = async (event) => {
        event.preventDefault();
        setMessage('');
        setError('');

        if (formData.newPassword !== formData.confirmPassword) {
            setError('两次输入的新密码不一致');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('/api/admin/me/password', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    currentPassword: formData.currentPassword,
                    newPassword: formData.newPassword,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || '密码更新失败');
                return;
            }

            setMessage('密码更新成功');
            setTimeout(() => {
                closePasswordModal();
            }, 800);
        } catch (error) {
            setError('网络错误，请重试');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="relative z-10 flex items-center justify-between flex-shrink-0 h-16 bg-white border-b border-gray-200 lg:border-none">
                <button
                    type="button"
                    className="px-4 text-gray-400 border-r border-gray-200 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 lg:hidden"
                    onClick={() => setSidebarOpen(true)}
                >
                    <span className="sr-only">打开侧边栏</span>
                    <i className="fas fa-bars w-6 h-6"></i>
                </button>

                <div className="flex justify-end flex-1 px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center ml-4 md:ml-6">
                        <button className="p-1 text-gray-400 bg-white rounded-full hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                            <span className="sr-only">查看通知</span>
                            <i className="fas fa-bell w-6 h-6"></i>
                        </button>

                        <div className="relative ml-3">
                            <button
                                type="button"
                                onClick={() => setShowPasswordModal(true)}
                                className="flex items-center max-w-xs text-sm bg-white rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 hover:text-blue-600"
                                title="修改管理员密码"
                            >
                                <span className="sr-only">修改管理员密码</span>
                                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                                    <i className="fas fa-user text-gray-600"></i>
                                </div>
                                <span className="ml-2 text-sm font-medium text-gray-700">管理员</span>
                                <span className="ml-3 inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                                    <i className="fas fa-key mr-1"></i>
                                    修改密码
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {showPasswordModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                    <div className="w-full max-w-md rounded-lg bg-white shadow-xl">
                        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">修改管理员密码</h2>
                                <p className="mt-1 text-sm text-gray-500">更新后下次登录请使用新密码。</p>
                            </div>
                            <button
                                type="button"
                                onClick={closePasswordModal}
                                className="text-gray-400 hover:text-gray-600"
                                disabled={loading}
                            >
                                <span className="sr-only">关闭</span>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>

                        <form onSubmit={handlePasswordSubmit} className="space-y-4 px-6 py-5">
                            {error && (
                                <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                                    {error}
                                </div>
                            )}
                            {message && (
                                <div className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
                                    {message}
                                </div>
                            )}

                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    当前密码
                                </label>
                                <input
                                    type="password"
                                    required
                                    value={formData.currentPassword}
                                    onChange={(event) => setFormData({
                                        ...formData,
                                        currentPassword: event.target.value,
                                    })}
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    新密码
                                </label>
                                <input
                                    type="password"
                                    required
                                    minLength={6}
                                    value={formData.newPassword}
                                    onChange={(event) => setFormData({
                                        ...formData,
                                        newPassword: event.target.value,
                                    })}
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    确认新密码
                                </label>
                                <input
                                    type="password"
                                    required
                                    minLength={6}
                                    value={formData.confirmPassword}
                                    onChange={(event) => setFormData({
                                        ...formData,
                                        confirmPassword: event.target.value,
                                    })}
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="flex justify-end space-x-3 pt-2">
                                <button
                                    type="button"
                                    onClick={closePasswordModal}
                                    disabled={loading}
                                    className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-50"
                                >
                                    取消
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {loading ? '保存中...' : '保存新密码'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    )
}
