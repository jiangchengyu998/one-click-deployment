"use client";

import { useEffect } from 'react';

const styles = {
    success: {
        icon: 'fa-check',
        iconClass: 'bg-green-100 text-green-700',
        borderClass: 'border-green-200',
    },
    error: {
        icon: 'fa-exclamation',
        iconClass: 'bg-red-100 text-red-700',
        borderClass: 'border-red-200',
    },
    info: {
        icon: 'fa-info',
        iconClass: 'bg-blue-100 text-blue-700',
        borderClass: 'border-blue-200',
    },
};

export default function Toast({ type = 'info', title, message, duration = 3500, onClose }) {
    const toastStyle = styles[type] || styles.info;

    useEffect(() => {
        const timer = window.setTimeout(onClose, duration);
        return () => window.clearTimeout(timer);
    }, [duration, message, onClose, title, type]);

    return (
        <div className="pointer-events-none fixed left-0 right-0 top-0 z-[60] flex justify-center px-4 pt-[calc(env(safe-area-inset-top)+1rem)]">
            <div
                className={`pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-lg border ${toastStyle.borderClass} bg-white px-4 py-3 text-left shadow-lg`}
                role="status"
                aria-live="polite"
            >
                <div className={`mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full ${toastStyle.iconClass}`}>
                    <i className={`fas ${toastStyle.icon} text-sm`}></i>
                </div>
                <div className="min-w-0 flex-1">
                    {title && (
                        <div className="text-sm font-semibold text-gray-900">
                            {title}
                        </div>
                    )}
                    <div className="mt-0.5 text-sm leading-5 text-gray-600">
                        {message}
                    </div>
                </div>
                <button
                    type="button"
                    onClick={onClose}
                    className="ml-1 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label="关闭提示"
                >
                    <i className="fas fa-times text-xs"></i>
                </button>
            </div>
        </div>
    );
}
