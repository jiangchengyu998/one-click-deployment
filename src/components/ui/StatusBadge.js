"use client";

import { getApiStatusInfo, getDatabaseStatusInfo } from '@/lib/status';
import { useI18n } from '@/components/i18n/LanguageProvider';

export default function StatusBadge({ status, type = 'api', className = '' }) {
    const { t } = useI18n();
    const info = type === 'database'
        ? getDatabaseStatusInfo(status)
        : getApiStatusInfo(status);
    const statusText = t(`statuses.${status || 'UNKNOWN'}`);

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${info.color} ${className}`}>
            {statusText.startsWith('statuses.') ? t('statuses.UNKNOWN') : statusText}
        </span>
    );
}
