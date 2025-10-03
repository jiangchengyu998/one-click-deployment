// src/app/admin/users/page.js
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingUser, setEditingUser] = useState(null);
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
            } else {
                alert('删除失败');
            }
        } catch (error) {
            alert('网络错误，请重试');
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
                                    <div className="flex-shrink-0 h-10 w-10 bg-blue-500 rounded-full flex items-center justify-center">
                                      <span className="text-white font-medium">
                                        {user.name.charAt(0).toUpperCase()}
                                      </span>
                                    </div>
                                    <div className="ml-4">
                                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
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
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
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
        </div>
    );
}