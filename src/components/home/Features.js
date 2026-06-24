"use client";
import Link from 'next/link';
import { useI18n } from '@/components/i18n/LanguageProvider';

export default function Features() {
    const { t } = useI18n();
    const outlineButton = 'inline-flex cursor-pointer items-center justify-center rounded-md text-sm font-semibold text-[#4a6ee0] transition hover:text-[#3f5fd0]'
    const features = t('home.features.items')

    return (
        <section id="features" className="bg-[#f8f9fa] py-12 max-md:py-10">
            <div className="mx-auto w-full max-w-[1400px] px-5 max-md:px-4">
                <div className="mb-8 flex items-end justify-between gap-8 max-lg:flex-col max-lg:items-start">
                    <div className="max-w-2xl">
                        <span className="mb-3 inline-flex items-center rounded-full border border-[#dfe5ff] bg-white px-4 py-2 text-sm font-medium text-[#4a6ee0] shadow-sm">
                            <i className="fas fa-layer-group mr-2"></i>{t('home.features.badge')}
                        </span>
                        <h2 className="mb-4 text-4xl font-bold text-[#1d2939] max-md:text-3xl">{t('home.features.title')}</h2>
                        <p className="text-lg leading-8 text-[#667085] max-md:text-base">{t('home.features.description')}</p>
                    </div>
                    <Link href="/docs" className="inline-flex shrink-0 items-center justify-center rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-[#344054] transition hover:-translate-y-0.5 hover:border-[#4a6ee0] hover:text-[#4a6ee0] hover:shadow-[0_8px_18px_rgba(36,45,84,0.1)]">
                        {t('home.features.docs')} <i className="fas fa-arrow-right ml-2 text-xs"></i>
                    </Link>
                </div>
                <div className="grid grid-cols-3 gap-5 max-lg:grid-cols-2 max-md:grid-cols-1">
                    {features.map((feature, index) => (
                        <div key={index} className="group flex min-h-[220px] flex-col rounded-lg border border-gray-200 bg-white p-6 text-left shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-[#dfe5ff] hover:shadow-[0_12px_28px_rgba(36,45,84,0.12)]">
                            <div className="mb-5 flex items-start justify-between gap-4">
                                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#eef3ff] text-[#4a6ee0] ring-1 ring-[#dfe5ff]">
                                    <i className={`${feature.icon} text-lg`}></i>
                                </span>
                                <span className="rounded-full bg-[#f6f8fb] px-3 py-1 text-xs font-semibold text-[#667085] ring-1 ring-gray-200">
                                    {feature.label}
                                </span>
                            </div>
                            <h3 className="mb-3 text-xl font-semibold text-[#1d2939]">{feature.title}</h3>
                            <p className="mb-5 flex-1 leading-7 text-[#667085]">{feature.description}</p>
                            <Link href={feature.href} className={outlineButton}>
                                {t('home.features.learnMore')} <i className="fas fa-arrow-right ml-2 text-xs transition group-hover:translate-x-0.5"></i>
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
