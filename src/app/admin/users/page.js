// src/app/admin/users/page.js
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingUser, setEditingUser] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showUserDetail, setShowUserDetail] = useState(false);
    const router = useRouter();

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await fetch('/api/admin/users');
            if (response.ok) {
                const data = await response.json();
                setUsers(data);
            } else if (response.status === 401) {
                router.push('/admin/login');
            }
        } catch (error) {
            console.error('获取用户列表失败:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateUserQuota = async (userId, updates) => {
        try {
            const response = await fetch(`/api/admin/users/${userId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updates),
            });

            if (response.ok) {
                fetchUsers(); // 刷新列表
                setEditingUser(null);
                // 如果正在查看该用户的详情，也更新详情数据
                if (selectedUser && selectedUser.id === userId) {
                    setSelectedUser(prev => ({ ...prev, ...updates }));
                }
            } else {
                alert('更新失败');
            }
        } catch (error) {
            alert('网络错误，请重试');
        }
    };

    const deleteUser = async (userId) => {
        if (!confirm('确定要删除这个用户吗？此操作不可逆！')) return;

        try {
            const response = await fetch(`/api/admin/users/${userId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                fetchUsers();
                // 如果正在查看被删除的用户，关闭详情弹窗
                if (selectedUser && selectedUser.id === userId) {
                    setShowUserDetail(false);
                    setSelectedUser(null);
                }
            } else {
                alert('删除失败');
            }
        } catch (error) {
            alert('网络错误，请重试');
        }
    };

    const viewUserDetail = async (user) => {
        try {
            // 可以在这里获取更详细的用户信息
            const response = await fetch(`/api/admin/users/${user.id}`);
            if (response.ok) {
                const userDetail = await response.json();
                setSelectedUser(userDetail);
            } else {
                setSelectedUser(user); // 降级使用基础信息
            }

            // setSelectedUser(user);
            setShowUserDetail(true);
        } catch (error) {
            console.error('获取用户详情失败:', error);
            setSelectedUser(user); // 降级使用基础信息
            setShowUserDetail(true);
        }
    };

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                <h1 className="text-2xl font-bold text-gray-900">用户管理</h1>
                <p className="text-gray-600">管理平台用户及其配额</p>
            </div>

            {/* 搜索栏 */}
            <div className="mb-6">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="搜索用户（姓名、邮箱、代码）"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <i className="fas fa-search absolute right-3 top-3 text-gray-400"></i>
                </div>
            </div>

            {/* 用户列表 */}
            <div className="bg-white shadow overflow-hidden rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            用户信息
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            API配额
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            数据库配额
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            注册时间
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            操作
                        </th>
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0 h-10 w-10 bg-blue-500 rounded-full flex items-center justify-center cursor-pointer"
                                         onClick={() => viewUserDetail(user)}>
                                      <span className="text-white font-medium">
                                        {user.name.charAt(0).toUpperCase()}
                                      </span>
                                    </div>
                                    <div className="ml-4">
                                        <div
                                            className="text-sm font-medium text-gray-900 cursor-pointer hover:text-blue-600"
                                            onClick={() => viewUserDetail(user)}
                                        >
                                            {user.name}
                                        </div>
                                        <div className="text-sm text-gray-500">{user.email}</div>
                                        <div className="text-xs text-gray-400">代码: {user.code}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                {editingUser === user.id ? (
                                    <input
                                        type="number"
                                        min="0"
                                        defaultValue={user.apiQuota}
                                        onBlur={(e) => updateUserQuota(user.id, { apiQuota: parseInt(e.target.value) })}
                                        className="w-20 border rounded px-2 py-1"
                                    />
                                ) : (
                                    <span
                                        className="cursor-pointer hover:text-blue-600"
                                        onClick={() => setEditingUser(user.id)}
                                    >
                                      {user.apiQuota}
                                    </span>
                                )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                {editingUser === user.id ? (
                                    <input
                                        type="number"
                                        min="0"
                                        defaultValue={user.dbQuota}
                                        onBlur={(e) => updateUserQuota(user.id, { dbQuota: parseInt(e.target.value) })}
                                        className="w-20 border rounded px-2 py-1"
                                    />
                                ) : (
                                    <span
                                        className="cursor-pointer hover:text-blue-600"
                                        onClick={() => setEditingUser(user.id)}
                                    >
                                      {user.dbQuota}
                                    </span>
                                )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(user.createdAt).toLocaleDateString('zh-CN')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                <button
                                    onClick={() => viewUserDetail(user)}
                                    className="text-blue-600 hover:text-blue-900"
                                >
                                    <i className="fas fa-eye mr-1"></i>查看
                                </button>
                                <button
                                    onClick={() => deleteUser(user.id)}
                                    className="text-red-600 hover:text-red-900"
                                >
                                    <i className="fas fa-trash mr-1"></i>删除
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>

                {filteredUsers.length === 0 && (
                    <div className="text-center py-12">
                        <i className="fas fa-users text-gray-300 text-4xl mb-3"></i>
                        <p className="text-gray-500">没有找到匹配的用户</p>
                    </div>
                )}
            </div>

            {/* 统计信息 */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg shadow">
                    <div className="text-sm text-gray-500">总用户数</div>
                    <div className="text-2xl font-bold text-gray-900">{users.length}</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <div className="text-sm text-gray-500">总API配额</div>
                    <div className="text-2xl font-bold text-gray-900">
                        {users.reduce((sum, user) => sum + user.apiQuota, 0)}
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <div className="text-sm text-gray-500">总数据库配额</div>
                    <div className="text-2xl font-bold text-gray-900">
                        {users.reduce((sum, user) => sum + user.dbQuota, 0)}
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <div className="text-sm text-gray-500">今日注册</div>
                    <div className="text-2xl font-bold text-gray-900">
                        {users.filter(user => {
                            const today = new Date();
                            const userDate = new Date(user.createdAt);
                            return userDate.toDateString() === today.toDateString();
                        }).length}
                    </div>
                </div>
            </div>

            {/* 用户详情弹窗 */}
            {showUserDetail && selectedUser && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-gray-900">用户详情</h2>
                                <button
                                    onClick={() => setShowUserDetail(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <i className="fas fa-times text-xl"></i>
                                </button>
                            </div>

                            <div className="space-y-6">
                                {/* 基本信息 */}
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">基本信息</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">姓名</label>
                                            <p className="mt-1 text-sm text-gray-900">{selectedUser.name}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">邮箱</label>
                                            <p className="mt-1 text-sm text-gray-900">{selectedUser.email}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">用户代码</label>
                                            <p className="mt-1 text-sm text-gray-900">{selectedUser.code}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">注册时间</label>
                                            <p className="mt-1 text-sm text-gray-900">
                                                {new Date(selectedUser.createdAt).toLocaleString('zh-CN')}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* 配额信息 */}
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">配额信息</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">API调用配额</label>
                                            <div className="mt-1 flex items-center space-x-2">
                                                {editingUser === selectedUser.id ? (
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        defaultValue={selectedUser.apiQuota}
                                                        onBlur={(e) => updateUserQuota(selectedUser.id, { apiQuota: parseInt(e.target.value) })}
                                                        className="w-24 border rounded px-2 py-1"
                                                        autoFocus
                                                    />
                                                ) : (
                                                    <>
                                                        <span className="text-sm text-gray-900">{selectedUser.apiQuota}</span>
                                                        <button
                                                            onClick={() => setEditingUser(selectedUser.id)}
                                                            className="text-blue-600 hover:text-blue-900 text-sm"
                                                        >
                                                            <i className="fas fa-edit mr-1"></i>编辑
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">数据库配额</label>
                                            <div className="mt-1 flex items-center space-x-2">
                                                {editingUser === selectedUser.id ? (
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        defaultValue={selectedUser.dbQuota}
                                                        onBlur={(e) => updateUserQuota(selectedUser.id, { dbQuota: parseInt(e.target.value) })}
                                                        className="w-24 border rounded px-2 py-1"
                                                    />
                                                ) : (
                                                    <>
                                                        <span className="text-sm text-gray-900">{selectedUser.dbQuota}</span>
                                                        <button
                                                            onClick={() => setEditingUser(selectedUser.id)}
                                                            className="text-blue-600 hover:text-blue-900 text-sm"
                                                        >
                                                            <i className="fas fa-edit mr-1"></i>编辑
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* 使用统计（可根据需要扩展） */}
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">使用统计</h3>
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <p className="text-sm text-gray-500 text-center">
                                            使用统计功能开发中...
                                        </p>
                                        {/* 这里可以添加API调用次数、数据库使用量等统计信息 */}
                                    </div>
                                </div>

                                {/* 操作按钮 */}
                                <div className="flex justify-end space-x-3 pt-4 border-t">
                                    <button
                                        onClick={() => setShowUserDetail(false)}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                                    >
                                        关闭
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowUserDetail(false);
                                            deleteUser(selectedUser.id);
                                        }}
                                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                                    >
                                        <i className="fas fa-trash mr-1"></i>删除用户
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}