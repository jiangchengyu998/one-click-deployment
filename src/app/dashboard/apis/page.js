// src/app/dashboard/apis/page.js
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ApiCard from '@/components/user/ApiCard';
import Modal from '@/components/ui/Modal';

export default function UserApis() {
    const [apis, setApis] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [userQuota, setUserQuota] = useState({ apiQuota: 0, currentApis: 0 });
    const router = useRouter();

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
                    currentApis: data._count?.apis || 0
                });
            }
        } catch (error) {
            console.error('获取用户配额失败:', error);
        }
    };

    const handleCreateApi = async (formData) => {
        try {
            const response = await fetch('/api/apis', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                setShowCreateModal(false);
                fetchApis();
                fetchUserQuota();
            } else {
                const data = await response.json();
                alert(data.error || '创建API失败');
            }
        } catch (error) {
            alert('网络错误，请重试');
        }
    };

    const handleDeleteApi = async (apiId) => {
        if (!confirm('确定要删除这个API吗？')) return;

        try {
            const response = await fetch(`/api/apis/${apiId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                fetchApis();
                fetchUserQuota();
            }
        } catch (error) {
            console.error('删除API失败:', error);
        }
    };

    if (loading) {
        return <div className="p-6">加载中...</div>;
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
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                >
                    部署新API
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {apis.map((api) => (
                    <ApiCard
                        key={api.id}
                        api={api}
                        onDelete={() => handleDeleteApi(api.id)}
                        onView={() => router.push(`/dashboard/apis/${api.id}`)}
                    />
                ))}
            </div>

            {apis.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-gray-500">您还没有部署任何API</p>
                </div>
            )}

            <CreateApiModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSubmit={handleCreateApi}
            />
        </div>
    );
}

function CreateApiModal({ isOpen, onClose, onSubmit }) {
    const [formData, setFormData] = useState({
        name: '',
        gitUrl: '',
        gitToken: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="部署新API">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">API名称</label>
                    <input
                        type="text"
                        name="name"
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                        placeholder="my-api"
                        value={formData.name}
                        onChange={handleChange}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">GitHub仓库地址</label>
                    <input
                        type="url"
                        name="gitUrl"
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                        placeholder="https://github.com/username/repo"
                        value={formData.gitUrl}
                        onChange={handleChange}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">GitHub Token (可选)</label>
                    <input
                        type="password"
                        name="gitToken"
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                        placeholder="ghp_..."
                        value={formData.gitToken}
                        onChange={handleChange}
                    />
                    <p className="text-xs text-gray-500 mt-1">私有仓库需要提供token</p>
                </div>

                <div className="flex justify-end space-x-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                        取消
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        部署
                    </button>
                </div>
            </form>
        </Modal>
    );
}