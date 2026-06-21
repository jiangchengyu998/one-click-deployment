"use client";

import { getApiStatusInfo, getDatabaseStatusInfo } from '@/lib/status';

export default function StatusBadge({ status, type = 'api', className = '' }) {
    const info = type === 'database'
        ? getDatabaseStatusInfo(status)
        : getApiStatusInfo(status);

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${info.color} ${className}`}>
            {info.text}
        </span>
    );
}
