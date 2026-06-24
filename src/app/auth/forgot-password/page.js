"use client";

import { useState } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";
import { useI18n } from "@/components/i18n/LanguageProvider";

export default function ForgotPasswordPage() {
    const { t } = useI18n();
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setMessage("");

        try {
            const response = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            const data = await response.json();

            if (response.ok) {
                setMessage(data.message || t('auth.resetEmailSent'));
                setEmail("");
            } else {
                setError(data.error || t('auth.resetEmailFailed'));
            }
        } catch (error) {
            setError(t('auth.networkRetry'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <Logo className="mx-auto mb-4 h-16 w-16" />
                    <h2 className="text-3xl font-extrabold text-gray-900">{t('auth.forgotPasswordTitle')}</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        {t('auth.forgotPasswordSubtitle')}
                    </p>
                </div>

                {message && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-md">
                        {message}
                    </div>
                )}

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md">
                            {error}
                        </div>
                    )}

                    <div>
                        <label htmlFor="email" className="sr-only">
                            {t('auth.email')}
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder={t('auth.email')}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                        {loading ? t('auth.sendingResetEmail') : t('auth.sendResetEmail')}
                    </button>

                    <div className="text-center">
                        <Link href="/auth/login" className="font-medium text-blue-600 hover:text-blue-500">
                            {t('auth.backToLogin')}
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
