// src/components/home/MainNav.js
"use client";

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Logo from '@/components/Logo';
import { useAuth } from '@/components/auth/AuthProvider';
import { useI18n } from '@/components/i18n/LanguageProvider';

function GitHubIcon({ className = '' }) {
    return (
        <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            focusable="false"
            className={className}
        >
            <path
                fill="currentColor"
                d="M12 .3A12 12 0 0 0 8.2 23.7c.6.1.8-.3.8-.6v-2.1c-3.3.7-4-1.6-4-1.6-.5-1.4-1.3-1.8-1.3-1.8-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2A11.3 11.3 0 0 1 12 5.5c1 0 2 .1 3 .4 2.3-1.6 3.3-1.2 3.3-1.2.6 1.7.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .3Z"
            />
        </svg>
    );
}

export default function MainNav() {
    const pathname = usePathname();
    const [pendingHref, setPendingHref] = useState('');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { user, isLoading, isLoggedIn, logout } = useAuth();
    const { t } = useI18n();

    // 在这些路径下不显示主导航
    const hideNavPaths = ['/admin', '/dashboard', '/auth'];
    const shouldHideNav = hideNavPaths.some(path => pathname.startsWith(path));

    useEffect(() => {
        setPendingHref('');
        setMobileMenuOpen(false);
    }, [pathname]);

    if (shouldHideNav) {
        return null;
    }

    const displayName = user?.name || user?.email || t('nav.loggedInUser');
    const displayMeta = user?.code ? t('nav.userCode', { code: user.code }) : t('nav.enterConsole');
    const initial = displayName.slice(0, 1).toUpperCase();
    const navLinkBase = 'inline-flex h-9 items-center rounded-full px-4 text-sm font-semibold text-slate-600 no-underline transition hover:bg-white hover:text-[#4a6ee0] hover:shadow-sm';
    const mobileNavLinkBase = 'flex items-center justify-between rounded-xl px-3.5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-[#f4f6ff] hover:text-[#4a6ee0]';
    const getNavLinkClass = (href) => {
        const active = href === '/docs'
            ? pathname.startsWith('/docs')
            : href === '/about'
                ? pathname === '/about'
                : false;

        return `${navLinkBase} ${active ? 'bg-white text-[#4a6ee0] shadow-sm ring-1 ring-slate-200/80' : ''}`;
    };
    const getMobileNavLinkClass = (href) => {
        const active = href === '/docs'
            ? pathname.startsWith('/docs')
            : href === '/about'
                ? pathname === '/about'
                : false;

        return `${mobileNavLinkBase} ${active ? 'bg-[#eef3ff] text-[#4a6ee0]' : ''}`;
    };
    const handleNavClick = (href) => {
        if (href !== pathname) {
            setPendingHref(href);
        }
        setMobileMenuOpen(false);
    };
    const handleLogout = () => {
        setMobileMenuOpen(false);
        logout('/');
    };

    return (
        <header className="sticky top-0 z-[100] border-b border-slate-200/70 bg-white/85 backdrop-blur-xl">
            <div className={`h-px bg-[#4a6ee0] transition-all duration-500 ease-out ${pendingHref ? 'w-full opacity-100' : 'w-0 opacity-0'}`} />
            <div className="mx-auto w-full max-w-[1180px] px-5 max-md:px-4">
                <nav className="grid h-16 grid-cols-[auto_1fr_auto] items-center gap-4">
                    <div className="flex items-center text-2xl font-bold text-[#4a6ee0]">
                        <Link href="/" className="inline-flex items-center rounded-2xl text-inherit no-underline transition hover:opacity-90">
                            <Logo showWordmark className="h-9 w-9" />
                        </Link>
                    </div>
                    <ul className="mx-auto hidden list-none items-center gap-1 rounded-full border border-slate-200/80 bg-slate-50/90 p-1 shadow-[0_10px_28px_rgba(15,23,42,0.06)] md:flex">
                        <li><Link href="/#features" className={navLinkBase}>{t('nav.features')}</Link></li>
                        <li><Link href="/#workflow" className={navLinkBase}>{t('nav.workflow')}</Link></li>
                        <li>
                            <Link
                                href="/docs"
                                onClick={() => handleNavClick('/docs')}
                                aria-current={pathname.startsWith('/docs') ? 'page' : undefined}
                                className={getNavLinkClass('/docs')}
                            >
                                {pendingHref === '/docs' && <i className="fas fa-spinner fa-spin mr-2 text-xs"></i>}
                                {t('nav.docs')}
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/about"
                                onClick={() => handleNavClick('/about')}
                                aria-current={pathname === '/about' ? 'page' : undefined}
                                className={getNavLinkClass('/about')}
                            >
                                {pendingHref === '/about' && <i className="fas fa-spinner fa-spin mr-2 text-xs"></i>}
                                {t('nav.about')}
                            </Link>
                        </li>
                    </ul>
                    <div className="hidden items-center justify-end gap-2 md:flex">
                        <a
                            href="https://github.com/jiangchengyu998/one-click-deployment"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Star on GitHub"
                            title="Star on GitHub"
                            className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-[#4a6ee0] hover:text-[#4a6ee0] hover:shadow-[0_8px_20px_rgba(74,110,224,0.14)]"
                        >
                            <span className="grid h-6 w-6 place-items-center">
                                <GitHubIcon className="block h-5 w-5" />
                            </span>
                            <span>GitHub</span>
                        </a>
                        {isLoading ? (
                            <span className="h-10 w-32 rounded-full bg-slate-100 ring-1 ring-slate-200" aria-label={t('nav.checkingAuth')} />
                        ) : isLoggedIn ? (
                            <>
                                <Link
                                    href="/dashboard"
                                    className="inline-flex h-10 max-w-[220px] cursor-pointer items-center gap-2.5 rounded-full border border-[#dfe5ff] bg-[#f7f9ff] px-3 text-left text-slate-800 shadow-sm transition hover:border-[#4a6ee0] hover:shadow-[0_8px_20px_rgba(74,110,224,0.16)] max-md:max-w-full"
                                >
                                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#4a6ee0] text-sm font-semibold text-white">
                                        {initial}
                                    </span>
                                    <span className="min-w-0">
                                        <span className="block truncate text-sm font-semibold">{displayName}</span>
                                        <span className="block truncate text-[11px] leading-3 text-[#667085]">{displayMeta}</span>
                                    </span>
                                </Link>
                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    className="inline-flex h-10 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white px-3.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-[#4a6ee0] hover:text-[#4a6ee0] hover:shadow-[0_8px_20px_rgba(74,110,224,0.14)]"
                                >
                                    <i className="fas fa-sign-out-alt mr-2"></i>{t('nav.logout')}
                                </button>
                            </>
                        ) : (
                            <>
                                <Link href="/auth/login" className="inline-flex h-10 cursor-pointer items-center justify-center rounded-full border border-[#dfe5ff] bg-white px-4 text-sm font-semibold text-[#4a6ee0] shadow-sm transition hover:border-[#4a6ee0] hover:shadow-[0_8px_20px_rgba(74,110,224,0.14)]">{t('nav.login')}</Link>
                                <Link href="/auth/register" className="inline-flex h-10 cursor-pointer items-center justify-center rounded-full bg-[#4a6ee0] px-4 text-sm font-semibold text-white shadow-[0_10px_22px_rgba(74,110,224,0.22)] transition hover:bg-[#3f5fd0]">{t('nav.register')}</Link>
                            </>
                        )}
                    </div>
                    <button
                        type="button"
                        className="inline-flex h-10 w-10 items-center justify-center justify-self-end rounded-full border border-slate-200 bg-white text-[#344054] shadow-sm transition hover:border-[#4a6ee0] hover:text-[#4a6ee0] md:hidden"
                        aria-label={mobileMenuOpen ? t('nav.closeMenu') : t('nav.openMenu')}
                        aria-expanded={mobileMenuOpen}
                        onClick={() => setMobileMenuOpen((open) => !open)}
                    >
                        <i className={`fas ${mobileMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
                    </button>
                </nav>
                {mobileMenuOpen && (
                    <div className="pb-4 md:hidden">
                        <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_18px_36px_rgba(15,23,42,0.10)]">
                        <ul className="mb-3 grid list-none gap-1">
                            <li>
                                <Link href="/#features" className={mobileNavLinkBase} onClick={() => setMobileMenuOpen(false)}>
                                    {t('nav.features')}
                                </Link>
                            </li>
                            <li>
                                <Link href="/#workflow" className={mobileNavLinkBase} onClick={() => setMobileMenuOpen(false)}>
                                    {t('nav.workflow')}
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/docs"
                                    onClick={() => handleNavClick('/docs')}
                                    aria-current={pathname.startsWith('/docs') ? 'page' : undefined}
                                    className={getMobileNavLinkClass('/docs')}
                                >
                                    <span>{t('nav.docs')}</span>
                                    {pendingHref === '/docs' && <i className="fas fa-spinner fa-spin text-xs"></i>}
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/about"
                                    onClick={() => handleNavClick('/about')}
                                    aria-current={pathname === '/about' ? 'page' : undefined}
                                    className={getMobileNavLinkClass('/about')}
                                >
                                    <span>{t('nav.about')}</span>
                                    {pendingHref === '/about' && <i className="fas fa-spinner fa-spin text-xs"></i>}
                                </Link>
                            </li>
                        </ul>
                        <div className="grid gap-2 border-t border-slate-100 pt-3">
                            <a
                                href="https://github.com/jiangchengyu998/one-click-deployment"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Star on GitHub"
                                title="Star on GitHub"
                                className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:border-[#4a6ee0] hover:text-[#4a6ee0]"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <span className="grid h-6 w-6 place-items-center">
                                    <GitHubIcon className="block h-5 w-5" />
                                </span>
                                <span>GitHub</span>
                            </a>
                            {isLoading ? (
                                <span className="h-10 rounded-xl bg-slate-100 ring-1 ring-slate-200" aria-label={t('nav.checkingAuth')} />
                            ) : isLoggedIn ? (
                                <>
                                    <Link
                                        href="/dashboard"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#4a6ee0] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#3f5fd0]"
                                    >
                                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/20 text-xs font-semibold text-white">
                                            {initial}
                                        </span>
                                        {t('nav.enterConsole')}
                                    </Link>
                                    <button
                                        type="button"
                                        onClick={handleLogout}
                                        className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-[#4a6ee0] hover:text-[#4a6ee0]"
                                    >
                                        <i className="fas fa-sign-out-alt mr-2"></i>{t('nav.logout')}
                                    </button>
                                </>
                            ) : (
                                <div className="grid grid-cols-2 gap-2">
                                    <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)} className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-[#4a6ee0] px-4 py-2.5 text-sm font-semibold text-[#4a6ee0] transition hover:bg-[#f4f6ff]">{t('nav.login')}</Link>
                                    <Link href="/auth/register" onClick={() => setMobileMenuOpen(false)} className="inline-flex cursor-pointer items-center justify-center rounded-xl bg-[#4a6ee0] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#3f5fd0]">{t('nav.register')}</Link>
                                </div>
                            )}
                        </div>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
}
