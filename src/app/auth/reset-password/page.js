"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Logo from "@/components/Logo";
import { useI18n } from "@/components/i18n/LanguageProvider";

function ResetPasswordForm() {
    const { t } = useI18n();
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token") || "";
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        if (!token) {
            setError(t('auth.resetTokenMissing'));
            setLoading(false);
            return;
        }

        if (password !== confirmPassword) {
            setError(t('auth.passwordMismatch'));
            setLoading(false);
            return;
        }

        if (password.length < 6) {
            setError(t('auth.passwordTooShort'));
            setLoading(false);
            return;
        }

        try {
            const response = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, password }),
            });
            const data = await response.json();

            if (response.ok) {
                router.push(`/auth/login?message=${encodeURIComponent(data.message || t('auth.resetPasswordSuccess'))}`);
            } else {
                setError(data.error || t('auth.resetPasswordFailed'));
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
                    <h2 className="text-3xl font-extrabold text-gray-900">{t('auth.resetPasswordTitle')}</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        {t('auth.resetPasswordSubtitle')}
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md">
                            {error}
                        </div>
                    )}

                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <label htmlFor="password" className="sr-only">
                                {t('auth.passwordWithHint')}
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="new-password"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                                placeholder={t('auth.passwordWithHint')}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="confirmPassword" className="sr-only">
                                {t('auth.confirmPassword')}
                            </label>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                autoComplete="new-password"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                                placeholder={t('auth.confirmPassword')}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !token}
                        className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                        {loading ? t('auth.resettingPassword') : t('auth.resetPassword')}
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

export default function ResetPasswordPage() {
    const { t } = useI18n();

    return (
        <Suspense fallback={<div>{t('common.loading')}</div>}>
            <ResetPasswordForm />
        </Suspense>
    );
}
