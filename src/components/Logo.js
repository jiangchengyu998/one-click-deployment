"use client";

import { useId } from 'react';
import { useI18n } from '@/components/i18n/LanguageProvider';

export default function Logo({ className = "h-8 w-8", markClassName = "", showWordmark = false, wordmark }) {
    const gradientId = useId();
    const { t } = useI18n();
    const resolvedWordmark = wordmark || t('common.brand');

    return (
        <span className={`inline-flex items-center gap-2 ${markClassName}`}>
            <svg
                className={className}
                viewBox="0 0 64 64"
                role="img"
                aria-label={t('common.shortBrand')}
                xmlns="http://www.w3.org/2000/svg"
            >
                <defs>
                    <linearGradient id={gradientId} x1="10" y1="10" x2="54" y2="54">
                        <stop offset="0%" stopColor="#4a6ee0" />
                        <stop offset="100%" stopColor="#7b68ee" />
                    </linearGradient>
                </defs>
                <rect width="64" height="64" rx="14" fill={`url(#${gradientId})`} />
                <path
                    d="M20.5 42.5h25.2c5.7 0 10.3-4.2 10.3-9.4 0-4.9-4.1-9-9.3-9.4C44.9 16.9 38.7 12 31.4 12c-7 0-13 4.4-15 10.7C10.9 23.8 7 28.3 7 33.5c0 5 4.6 9 10.3 9h3.2Z"
                    fill="white"
                    opacity="0.96"
                />
                <path
                    d="M24 34h16M32 26v16M25 28l7-7 7 7"
                    fill="none"
                    stroke="#4a6ee0"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="4"
                />
            </svg>
            {showWordmark && (
                <span className="font-semibold leading-none">
                    {resolvedWordmark}
                </span>
            )}
        </span>
    );
}
