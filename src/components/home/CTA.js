// src/components/home/CTA.js
"use client";
import Link from 'next/link';
import { useAuth } from '@/components/auth/AuthProvider';
import { useI18n } from '@/components/i18n/LanguageProvider';

export default function CTA() {
    const { isLoggedIn } = useAuth();
    const { t } = useI18n();

    return (
        <section id="cta" className="bg-[#f8f9fa] py-10 max-md:py-8">
            <div className="mx-auto w-full max-w-[1400px] px-5 max-md:px-4">
                <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm max-md:p-6">
                    {isLoggedIn ? (
                        <div className="flex items-center justify-between gap-8 max-lg:flex-col max-lg:items-start">
                            <div className="max-w-2xl">
                                <span className="mb-3 inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700 ring-1 ring-emerald-100">
                                    <span className="mr-2 h-2 w-2 rounded-full bg-emerald-500"></span>{t('home.cta.loggedIn')}
                                </span>
                                <h2 className="mb-3 text-3xl font-bold text-[#1d2939] max-md:text-2xl">{t('home.cta.loggedInTitle')}</h2>
                                <p className="text-base leading-7 text-[#667085]">
                                    {t('home.cta.loggedInDescription')}
                                </p>
                            </div>
                            <div className="flex shrink-0 gap-3 max-sm:w-full max-sm:flex-col">
                                <Link href="/dashboard" className="inline-flex cursor-pointer items-center justify-center rounded-lg bg-[#4a6ee0] px-5 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#3f5fd0] hover:shadow-[0_8px_18px_rgba(74,110,224,0.22)]">{t('home.cta.enterConsole')}</Link>
                                <Link href="/dashboard/databases" className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-[#344054] transition hover:-translate-y-0.5 hover:border-[#4a6ee0] hover:text-[#4a6ee0] hover:shadow-[0_8px_18px_rgba(36,45,84,0.1)]">{t('home.cta.manageDb')}</Link>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-between gap-8 max-lg:flex-col max-lg:items-start">
                            <div className="max-w-2xl">
                                <span className="mb-3 inline-flex items-center rounded-full border border-[#dfe5ff] bg-[#f7f9ff] px-3 py-1 text-sm font-semibold text-[#4a6ee0]">
                                    {t('home.cta.next')}
                                </span>
                                <h2 className="mb-3 text-3xl font-bold text-[#1d2939] max-md:text-2xl">{t('home.cta.guestTitle')}</h2>
                                <p className="text-base leading-7 text-[#667085]">
                                    {t('home.cta.guestDescription')}
                                </p>
                            </div>
                            <div className="flex shrink-0 gap-3 max-sm:w-full max-sm:flex-col">
                                <Link href="/auth/register" className="inline-flex cursor-pointer items-center justify-center rounded-lg bg-[#4a6ee0] px-5 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#3f5fd0] hover:shadow-[0_8px_18px_rgba(74,110,224,0.22)]">{t('home.cta.start')}</Link>
                                <Link href="/docs/first-deployment" className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-[#344054] transition hover:-translate-y-0.5 hover:border-[#4a6ee0] hover:text-[#4a6ee0] hover:shadow-[0_8px_18px_rgba(36,45,84,0.1)]">{t('home.cta.apiDocs')}</Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    )
}
