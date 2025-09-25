// src/app/admin/users/page.js
"use client";

import { useState, useEffect } from 'react';
import Table from '@/components/ui/Table';

export default function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await fetch('/api/admin/users');
            if (response.ok) {
                const data = await response.json();
                setUsers(data);
            }
        } catch (error) {
            console.error('获取用户列表失败:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateUserQuota = async (userId, type, value) => {
        try {
            const response = await fetch(`/api/admin/users/${userId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ [type]: value }),
            });

            if (response.ok) {
                fetchUsers(); // 刷新列表
            }
        } catch (error) {
            console.error('更新配额失败:', error);
        }
    };

    const columns = [
        { key: 'code', title: '用户代码' },
        { key: 'name', title: '用户名' },
        { key: 'email', title: '邮箱' },
        {
            key: 'apiQuota',
            title: 'API配额',
            render: (value, record) => (
                <input
                    type="number"
                    value={value}
                    onChange={(e) => updateUserQuota(record.id, 'apiQuota', parseInt(e.target.value))}
                    className="w-20 border rounded px-2 py-1"
                />
            )
        },
        {
            key: 'dbQuota',
            title: '数据库配额',
            render: (value, record) => (
                <input
                    type="number"
                    value={value}
                    onChange={(e) => updateUserQuota(record.id, 'dbQuota', parseInt(e.target.value))}
                    className="w-20 border rounded px-2 py-1"
                />
            )
        },
        { key: 'createdAt', title: '注册时间', render: (value) => new Date(value).toLocaleDateString() },
    ];

    if (loading) {
        return <div className="p-6">加载中...</div>;
    }

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">用户管理</h1>
                <p className="text-gray-600">管理平台用户及其配额</p>
            </div>

            <div className="bg-white shadow rounded-lg">
                <Table data={users} columns={columns} />
            </div>
        </div>
    );
}