"use client";
import Link from 'next/link';
import { useI18n } from '@/components/i18n/LanguageProvider';

export default function Workflow() {
    const { t } = useI18n();
    const steps = t('home.workflow.steps')

    return (
        <section id="workflow" className="bg-[#f8f9fa] pb-12 max-lg:pb-10">
            <div className="mx-auto w-full max-w-[1400px] px-5 max-md:px-4">
                <div className="mb-8 flex items-end justify-between gap-8 max-lg:flex-col max-lg:items-start">
                    <div className="max-w-2xl">
                        <span className="mb-3 inline-flex items-center rounded-full border border-[#dfe5ff] bg-white px-4 py-2 text-sm font-medium text-[#4a6ee0] shadow-sm">
                            <i className="fas fa-route mr-2"></i>{t('home.workflow.badge')}
                        </span>
                        <h2 className="mb-4 text-4xl font-bold text-[#1d2939] max-md:text-3xl">{t('home.workflow.title')}</h2>
                        <p className="text-lg leading-8 text-[#667085] max-md:text-base">{t('home.workflow.description')}</p>
                    </div>
                    <Link href="/docs/first-deployment" className="inline-flex shrink-0 items-center justify-center rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-[#344054] transition hover:-translate-y-0.5 hover:border-[#4a6ee0] hover:text-[#4a6ee0] hover:shadow-[0_8px_18px_rgba(36,45,84,0.1)]">
                        {t('home.workflow.docs')} <i className="fas fa-arrow-right ml-2 text-xs"></i>
                    </Link>
                </div>

                <div className="grid grid-cols-[1.15fr_0.85fr] gap-5 max-lg:grid-cols-1">
                    <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
                        <div className="mb-4 flex items-center justify-between border-b border-gray-200 pb-4">
                            <div className="flex items-center gap-2 text-sm font-semibold text-[#475467]">
                                <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                                {t('home.workflow.process')}
                            </div>
                            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">{t('home.workflow.status')}</span>
                        </div>
                        <div className="space-y-3">
                            {steps.map((step) => (
                                <div key={step.number} className="grid grid-cols-[auto_1fr_auto] items-start gap-4 rounded-lg border border-gray-200 bg-[#fbfcff] p-4 transition hover:border-[#dfe5ff] hover:bg-white hover:shadow-[0_10px_22px_rgba(36,45,84,0.08)] max-sm:grid-cols-[auto_1fr]">
                                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#eef3ff] text-sm font-bold text-[#4a6ee0] ring-1 ring-[#dfe5ff]">{step.number}</span>
                                    <div>
                                        <div className="mb-1 flex items-center gap-2">
                                            <i className={`${step.icon} text-sm text-[#4a6ee0]`}></i>
                                            <h4 className="font-semibold text-[#1d2939]">{step.title}</h4>
                                        </div>
                                        <p className="text-sm leading-6 text-[#667085]">{step.description}</p>
                                    </div>
                                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#667085] ring-1 ring-gray-200 max-sm:col-start-2 max-sm:w-fit">{step.status}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
                        <div className="mb-5 flex items-start justify-between gap-4">
                            <div>
                                <h3 className="mb-2 text-lg font-semibold text-[#1d2939]">{t('home.workflow.recommendation')}</h3>
                                <p className="text-sm leading-6 text-[#667085]">{t('home.workflow.recommendationText')}</p>
                            </div>
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#eef3ff] text-[#4a6ee0] ring-1 ring-[#dfe5ff]">
                                <i className="fas fa-sliders-h"></i>
                            </span>
                        </div>
                        <div className="space-y-3">
                            <div className="rounded-lg border border-gray-200 bg-[#fbfcff] p-4">
                                <div className="mb-2 flex items-center justify-between gap-3">
                                    <span className="font-semibold text-[#344054]">{t('home.workflow.newProject')}</span>
                                    <span className="text-xs font-semibold text-emerald-600">{t('home.workflow.defaultDb')}</span>
                                </div>
                                <p className="text-sm leading-6 text-[#667085]">{t('home.workflow.newProjectText')}</p>
                            </div>
                            <div className="rounded-lg border border-gray-200 bg-[#fbfcff] p-4">
                                <div className="mb-2 flex items-center justify-between gap-3">
                                    <span className="font-semibold text-[#344054]">{t('home.workflow.existingData')}</span>
                                    <span className="text-xs font-semibold text-blue-600">{t('home.workflow.ownRds')}</span>
                                </div>
                                <p className="text-sm leading-6 text-[#667085]">{t('home.workflow.existingDataText')}</p>
                            </div>
                        </div>
                        <Link href="/docs/create-db-instance" className="mt-5 inline-flex w-full items-center justify-center rounded-lg bg-[#4a6ee0] px-4 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#3f5fd0] hover:shadow-[0_8px_18px_rgba(74,110,224,0.22)]">
                            {t('home.workflow.dbGuide')}
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    )
}
