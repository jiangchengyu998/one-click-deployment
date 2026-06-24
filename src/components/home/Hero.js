'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/auth/AuthProvider'
import { useI18n } from '@/components/i18n/LanguageProvider'

export default function Hero() {
    const [activeTab, setActiveTab] = useState('database')
    const { user, isLoggedIn } = useAuth()
    const { t } = useI18n()
    const primaryButton = 'inline-flex cursor-pointer items-center justify-center rounded-lg bg-[#4a6ee0] px-5 py-2.5 text-base font-medium text-white transition duration-300 hover:-translate-y-0.5 hover:bg-[#3f5fd0] hover:shadow-[0_8px_18px_rgba(74,110,224,0.22)] max-md:px-4 max-md:py-2 max-md:text-sm'
    const secondaryButton = 'inline-flex cursor-pointer items-center justify-center rounded-lg border border-[#4a6ee0] bg-white px-5 py-2.5 text-base font-medium text-[#4a6ee0] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] max-md:px-4 max-md:py-2 max-md:text-sm'
    const smallButton = 'inline-flex cursor-pointer items-center justify-center rounded-md bg-white px-3 py-1.5 text-sm font-medium text-[#4a6ee0] shadow-sm ring-1 ring-gray-200 transition hover:bg-gray-50'
    const previewPrimaryButton = 'inline-flex w-full cursor-pointer items-center justify-center rounded-lg bg-[#4a6ee0] px-4 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#3f5fd0] hover:shadow-[0_8px_18px_rgba(74,110,224,0.22)]'
    const highlights = t('home.hero.highlights')
    const metrics = t('home.hero.metrics')
    const apiSteps = t('home.hero.api.steps')
    const heroPrimaryHref = isLoggedIn ? '/dashboard' : '/auth/register'
    const heroPrimaryText = isLoggedIn ? t('nav.enterConsole') : t('home.hero.start')
    const databasePreviewHref = isLoggedIn ? '/dashboard/databases' : '/docs/create-db-instance'
    const databasePreviewText = isLoggedIn ? t('common.manage') : t('common.learn')
    const databaseActionHref = isLoggedIn ? '/dashboard/databases' : '/docs/create-db-instance'
    const databaseActionText = isLoggedIn ? t('home.hero.database.manageDb') : t('home.hero.database.connectionGuide')
    const apiPreviewHref = isLoggedIn ? '/dashboard/apis' : '/docs/first-deployment'
    const apiPreviewText = isLoggedIn ? t('common.view') : t('common.docs')
    const apiActionHref = isLoggedIn ? '/dashboard/apis' : '/docs/first-deployment'
    const apiActionText = isLoggedIn ? t('home.hero.api.deployNew') : t('home.hero.api.deployDocs')

    return (
        <section className="bg-[linear-gradient(180deg,#ffffff_0%,#f8f9fa_100%)] pt-16 pb-12 max-lg:pt-12 max-lg:pb-10">
            <div className="mx-auto flex w-full max-w-[1400px] items-center gap-10 px-5 max-lg:flex-col max-lg:text-center max-md:px-4">
                <div className="flex-1">
                    <div className="mb-5 inline-flex items-center rounded-full border border-[#dfe5ff] bg-white px-4 py-2 text-sm font-medium text-[#4a6ee0] shadow-sm">
                        <i className="fab fa-github mr-2"></i>
                        {t('home.hero.badge')}
                    </div>
                    <h1 className="mb-5 text-5xl font-bold leading-tight text-[#222] max-lg:text-4xl">
                        {t('home.hero.title')}
                    </h1>
                    <p className="mb-8 max-w-2xl text-xl leading-relaxed text-[#666] max-lg:mx-auto max-lg:text-lg">
                        {t('home.hero.description')}
                    </p>
                    <div className="mb-7 flex flex-wrap gap-3 max-lg:justify-center">
                        {highlights.map((item) => (
                            <span key={item} className="rounded-full bg-white px-4 py-2 text-sm font-medium text-[#555] shadow-sm ring-1 ring-gray-200">
                                <i className="fas fa-check mr-2 text-emerald-500"></i>{item}
                            </span>
                        ))}
                    </div>
                    <div className="flex gap-5 max-lg:justify-center max-sm:flex-col">
                        <Link href={heroPrimaryHref} className={primaryButton}>{heroPrimaryText}</Link>
                        <Link href="/docs" className={secondaryButton}>{t('home.hero.docs')}</Link>
                    </div>
                    {isLoggedIn && (
                        <p className="mt-4 text-sm text-[#667085]">
                            {t('home.hero.loggedInAs', { name: user?.name || user?.email || t('home.hero.currentUser') })}
                        </p>
                    )}
                    <div className="mt-8 grid max-w-xl grid-cols-3 gap-4 text-left max-lg:mx-auto max-sm:grid-cols-1 max-sm:text-center">
                        {metrics.map((metric) => (
                            <div key={metric.label}>
                                <div className="text-2xl font-bold text-[#333]">{metric.value}</div>
                                <div className="text-sm text-[#666]">{metric.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="flex flex-1 justify-center">
                    <div className="w-full max-w-[560px] overflow-hidden rounded-lg bg-white shadow-[0_18px_45px_rgba(36,45,84,0.16)] ring-1 ring-gray-200">
                        <div className="flex items-center justify-between border-b border-gray-200 bg-[#f6f8fb] px-5 py-4">
                            <div className="flex gap-2">
                                <span className="h-3 w-3 rounded-full bg-[#ff5f57]"></span>
                                <span className="h-3 w-3 rounded-full bg-[#ffbd2e]"></span>
                                <span className="h-3 w-3 rounded-full bg-[#28ca42]"></span>
                            </div>
                            <div className="flex items-center gap-2 text-sm font-medium text-[#475467]">
                                <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                                {t('home.hero.previewTitle')}
                            </div>
                        </div>
                        <div className="p-5">
                            <div className="mb-5 grid grid-cols-2 gap-1 rounded-lg bg-gray-100 p-1">
                                <button
                                    type="button"
                                    className={`cursor-pointer rounded-md px-4 py-2.5 text-sm font-semibold transition ${activeTab === 'database' ? 'bg-white text-[#4a6ee0] shadow-sm' : 'text-[#667085] hover:text-[#4a6ee0]'}`}
                                    onClick={() => setActiveTab('database')}
                                >
                                    <i className="fas fa-database mr-2"></i>{t('home.hero.databaseTab')}
                                </button>
                                <button
                                    type="button"
                                    className={`cursor-pointer rounded-md px-4 py-2.5 text-sm font-semibold transition ${activeTab === 'api' ? 'bg-white text-[#4a6ee0] shadow-sm' : 'text-[#667085] hover:text-[#4a6ee0]'}`}
                                    onClick={() => setActiveTab('api')}
                                >
                                    <i className="fas fa-code mr-2"></i>{t('home.hero.apiTab')}
                                </button>
                            </div>
                            <div>
                                {activeTab === 'database' ? (
                                    <div className="space-y-4 text-left">
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <div className="mb-1 flex items-center gap-2">
                                                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#eef3ff] text-[#4a6ee0]">
                                                        <i className="fas fa-database"></i>
                                                    </span>
                                                    <h3 className="font-semibold text-[#1d2939]">{t('home.hero.database.title')}</h3>
                                                </div>
                                                <p className="text-sm leading-6 text-[#667085]">{t('home.hero.database.description')}</p>
                                            </div>
                                            <span className="shrink-0 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">{t('home.hero.database.status')}</span>
                                        </div>
                                        <div className="grid gap-3 sm:grid-cols-2">
                                            <Link href={databasePreviewHref} className="group rounded-lg border border-gray-200 bg-[#fbfcff] p-4 transition hover:-translate-y-0.5 hover:border-[#4a6ee0] hover:shadow-[0_10px_22px_rgba(36,45,84,0.1)]">
                                                <div className="mb-3 flex items-center justify-between">
                                                    <span className="text-sm font-semibold text-[#344054]">{t('home.hero.database.defaultDb')}</span>
                                                    <span className="text-xs font-medium text-emerald-600">{t('home.hero.database.available')}</span>
                                                </div>
                                                <div className="truncate font-mono text-sm font-semibold text-[#101828]">u8x2_myapp</div>
                                                <div className="mt-2 flex items-center justify-between text-xs text-[#667085]">
                                                    <span>{t('home.hero.database.created')}</span>
                                                    <span className="text-[#4a6ee0] group-hover:underline">{databasePreviewText}</span>
                                                </div>
                                            </Link>
                                            <Link href="/docs/create-db-instance" className="group rounded-lg border border-gray-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-[#4a6ee0] hover:shadow-[0_10px_22px_rgba(36,45,84,0.1)]">
                                                <div className="mb-3 flex items-center justify-between">
                                                    <span className="text-sm font-semibold text-[#344054]">{t('home.hero.database.ownDb')}</span>
                                                    <span className="text-xs font-medium text-blue-600">{t('home.hero.database.connectable')}</span>
                                                </div>
                                                <div className="truncate text-sm font-semibold text-[#101828]">{t('home.hero.database.ownDbExample')}</div>
                                                <div className="mt-2 flex items-center justify-between text-xs text-[#667085]">
                                                    <span>{t('home.hero.database.keepData')}</span>
                                                    <span className="text-[#4a6ee0] group-hover:underline">{t('home.hero.database.config')}</span>
                                                </div>
                                            </Link>
                                        </div>
                                        <div className="rounded-lg bg-[#101828] p-4 font-mono text-sm text-gray-100">
                                            <div className="mb-3 flex items-center justify-between border-b border-white/10 pb-2 font-sans text-xs text-gray-400">
                                                <span>{t('home.hero.database.sample')}</span>
                                                <span>MySQL</span>
                                            </div>
                                            <div className="overflow-hidden text-ellipsis whitespace-nowrap"><span className="text-emerald-400">$</span> mysql -h db.ydphoto.com -u u8x2_myapp -p</div>
                                            <div className="mt-2 text-gray-400">{t('home.hero.database.replaceHint')}</div>
                                        </div>
                                        <div className="grid grid-cols-3 gap-3 rounded-lg border border-gray-200 bg-white p-4 text-center">
                                            <div>
                                                <div className="text-lg font-bold text-[#101828]">1</div>
                                                <div className="text-xs text-[#667085]">{t('home.hero.database.statDefault')}</div>
                                            </div>
                                            <div>
                                                <div className="text-lg font-bold text-[#101828]">RDS</div>
                                                <div className="text-xs text-[#667085]">{t('home.hero.database.statRds')}</div>
                                            </div>
                                            <div>
                                                <div className="text-lg font-bold text-[#101828]">Auto</div>
                                                <div className="text-xs text-[#667085]">{t('home.hero.database.statInit')}</div>
                                            </div>
                                        </div>
                                        <Link href={databaseActionHref} className={previewPrimaryButton}>{databaseActionText}</Link>
                                    </div>
                                ) : (
                                    <div className="space-y-4 text-left">
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <div className="mb-1 flex items-center gap-2">
                                                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#eef3ff] text-[#4a6ee0]">
                                                        <i className="fas fa-code"></i>
                                                    </span>
                                                    <h3 className="font-semibold text-[#1d2939]">{t('home.hero.api.title')}</h3>
                                                </div>
                                                <p className="text-sm leading-6 text-[#667085]">{t('home.hero.api.description')}</p>
                                            </div>
                                            <span className="shrink-0 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">{t('home.hero.api.status')}</span>
                                        </div>
                                        <div className="rounded-lg border border-gray-200 bg-[#fbfcff] p-4">
                                            <div className="mb-3 flex items-center justify-between gap-3">
                                                <div className="min-w-0">
                                                    <div className="font-semibold text-[#101828]">{t('home.hero.api.sampleName')}</div>
                                                    <div className="truncate text-sm text-[#667085]">https://user-api.{process.env.NEXT_PUBLIC_MAIN_DOMAIN}</div>
                                                </div>
                                                <Link href={apiPreviewHref} className={smallButton}>{apiPreviewText}</Link>
                                            </div>
                                            <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                                                <div className="h-full w-full rounded-full bg-emerald-500"></div>
                                            </div>
                                        </div>
                                        <div className="space-y-3 rounded-lg border border-gray-200 bg-white p-4">
                                            {apiSteps.map((step, index) => (
                                                <div key={step} className="flex items-center justify-between gap-4 text-sm">
                                                    <div className="flex items-center gap-3">
                                                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-50 text-xs font-bold text-emerald-700">{index + 1}</span>
                                                        <span className="font-medium text-[#344054]">{step}</span>
                                                    </div>
                                                    <span className="font-semibold text-emerald-600">{t('home.hero.api.done')}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="grid grid-cols-3 gap-3 rounded-lg border border-gray-200 bg-white p-4 text-center">
                                            <div>
                                                <div className="text-lg font-bold text-[#101828]">42s</div>
                                                <div className="text-xs text-[#667085]">{t('home.hero.api.recentBuild')}</div>
                                            </div>
                                            <div>
                                                <div className="text-lg font-bold text-[#101828]">1</div>
                                                <div className="text-xs text-[#667085]">{t('home.hero.api.replicas')}</div>
                                            </div>
                                            <div>
                                                <div className="text-lg font-bold text-[#101828]">HTTPS</div>
                                                <div className="text-xs text-[#667085]">{t('home.hero.api.autoHttps')}</div>
                                            </div>
                                        </div>
                                        <Link href={apiActionHref} className={previewPrimaryButton}>{apiActionText}</Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
