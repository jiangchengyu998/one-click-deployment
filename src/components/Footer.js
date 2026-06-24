"use client";
import {usePathname} from "next/navigation";
import { useI18n } from '@/components/i18n/LanguageProvider';

export default function Footer() {
    const pathname = usePathname();
    const { t } = useI18n();

    // 在这些路径下不显示页脚
    const hideNavPaths = ['/admin', '/dashboard', '/auth'];
    const shouldHideNav = hideNavPaths.some(path => pathname.startsWith(path));

    if (shouldHideNav) {
        return null;
    }

    const footerLinks = {
        product: [
            { name: t('footer.links.product.0'), href: '/#features' },
            { name: t('footer.links.product.1'), href: '/#workflow' },
            { name: t('footer.links.product.2'), href: '/about' },
            // { name: '文档', href: '#' },
            // { name: '状态', href: '#' }
        ],
        support: [
            { name: t('footer.links.support.0'), href: '/docs/first-deployment' },
            { name: t('footer.links.support.1'), href: '/docs/create-db-instance' },
            // { name: '社区论坛', href: '#' },
            // { name: '应用文档', href: '#' },
            // { name: '服务条款', href: '#' }
        ],
        social: [
            { name: 'GitHub', href: 'https://github.com/jiangchengyu998/one-click-deployment', icon: 'fab fa-github' },
            // { name: 'Twitter', href: '#', icon: 'fab fa-twitter' },
            // { name: '微博', href: '#', icon: 'fab fa-weibo' },
            // { name: '知乎', href: '#', icon: 'fab fa-zhihu' }
        ]
    }

    const contactItems = [
        { label: t('footer.contact.wechat'), value: 'JChengYu0829', icon: 'fab fa-weixin', type: 'wechat' },
        { label: t('footer.contact.email'), value: 'jiangchengyu998@gmail.com', icon: 'fas fa-envelope', href: 'mailto:jiangchengyu998@gmail.com' },
        { label: t('footer.contact.discussion'), value: t('footer.contact.discussionValue'), icon: 'fas fa-comments' }
    ]

    return (
        <footer className="bg-[#233143] pt-10 pb-6 text-white max-md:pt-8 max-md:pb-5">
            <div className="mx-auto w-full max-w-[1400px] px-5 max-md:px-4">
                <div className="mb-8 grid grid-cols-[1.6fr_0.8fr_0.8fr_0.8fr] gap-8 max-lg:grid-cols-2 max-md:grid-cols-1 max-md:gap-7">
                    <div className="max-w-xl">
                        <h3 className="mb-4 text-lg font-semibold">{t('footer.contactTitle')}</h3>
                        <p className="mb-5 leading-7 text-[#d0d7de]">
                            {t('footer.contactText')}
                        </p>
                        <div className="space-y-2.5">
                            {contactItems.map((item) => {
                                const content = (
                                    <>
                                        <i className={`${item.icon} mt-1 w-4 text-[#9fb5d1]`}></i>
                                        <div>
                                            <span className="font-medium text-white">{item.label}：</span>
                                            <span>{item.value}</span>
                                        </div>
                                    </>
                                );

                                if (item.type === 'wechat') {
                                    return (
                                        <div key={item.label} className="group relative flex w-fit items-start gap-3 text-sm text-[#dbe4ee]">
                                            {content}
                                            <div className="pointer-events-none absolute bottom-full left-0 z-20 mb-3 w-48 translate-y-1 rounded-lg bg-white p-2 opacity-0 shadow-[0_16px_36px_rgba(0,0,0,0.24)] ring-1 ring-black/10 transition duration-200 group-hover:translate-y-0 group-hover:opacity-100">
                                                <img
                                                    src="/images/contact/wechat-qr.jpg"
                                                    alt="JChengYu0829 WeChat QR code"
                                                    className="h-auto w-full rounded-md"
                                                />
                                                <div className="pt-2 text-center text-xs font-medium text-[#344054]">{t('footer.scanWechat')}</div>
                                            </div>
                                        </div>
                                    );
                                }

                                if (item.href) {
                                    return (
                                        <a key={item.label} href={item.href} className="flex w-fit items-start gap-3 text-sm text-[#dbe4ee] transition hover:text-white">
                                            {content}
                                        </a>
                                    );
                                }

                                return (
                                    <div key={item.label} className="flex items-start gap-3 text-sm text-[#dbe4ee]">
                                        {content}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <div>
                        <h3 className="mb-5 text-lg font-semibold">{t('footer.product')}</h3>
                        <ul className="list-none space-y-2.5">
                            {footerLinks.product.map((link, index) => (
                                <li key={index}><a href={link.href} className="text-[#bdc3c7] no-underline transition hover:text-white">{link.name}</a></li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h3 className="mb-5 text-lg font-semibold">{t('footer.support')}</h3>
                        <ul className="list-none space-y-2.5">
                            {footerLinks.support.map((link, index) => (
                                <li key={index}><a href={link.href} className="text-[#bdc3c7] no-underline transition hover:text-white">{link.name}</a></li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h3 className="mb-5 text-lg font-semibold">{t('footer.project')}</h3>
                        <ul className="list-none space-y-2.5">
                        {footerLinks.social.map((link, index) => (
                                <li key={index}><a href={link.href} target="_blank" rel="noopener noreferrer" className="text-[#bdc3c7] no-underline transition hover:text-white"><i className={`${link.icon} mr-1`}></i> {link.name}</a></li>
                            ))}
                        </ul>
                    </div>
                </div>
                <div className="border-t border-white/10 pt-6 text-center text-sm text-[#bdc3c7]">
                    <p>{t('footer.copyright')}</p>
                </div>
            </div>
        </footer>
    )
}
