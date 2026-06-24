// src/components/user/ApiCard.js
"use client";

import StatusBadge from '@/components/ui/StatusBadge';
import { useI18n } from '@/components/i18n/LanguageProvider';

export default function ApiCard({ api, onDelete, onView }) {
    const { t, locale } = useI18n();
    return (
        <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <i className="fas fa-code text-blue-500 text-xl"></i>
                        </div>
                        <div className="ml-4">
                            <h3 className="text-lg leading-6 font-medium text-gray-900">{api.name}</h3>
                            <p className="text-sm text-gray-500 mt-1">{api.domain}</p>
                        </div>
                    </div>
                    <StatusBadge status={api.status} />
                </div>

                <div className="mt-4">
                    <p className="text-sm text-gray-600 truncate">
                        <i className="fas fa-link mr-1"></i>
                        {api.gitUrl}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                        {t('cards.createdAt')}: {new Date(api.createdAt).toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US')}
                    </p>
                </div>

                <div className="mt-4 flex space-x-3">
                    <button
                        onClick={onView}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        <i className="fas fa-eye mr-1"></i> {t('cards.view')}
                    </button>
                    <button
                        onClick={onDelete}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                        <i className="fas fa-trash mr-1"></i> {t('cards.delete')}
                    </button>
                </div>
            </div>
        </div>
    )
}
