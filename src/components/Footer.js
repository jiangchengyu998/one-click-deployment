"use client";
import {usePathname} from "next/navigation";

export default function Footer() {
    const pathname = usePathname();

    // 在这些路径下不显示页脚
    const hideNavPaths = ['/admin', '/dashboard', '/auth'];
    const shouldHideNav = hideNavPaths.some(path => pathname.startsWith(path));

    if (shouldHideNav) {
        return null;
    }

    const footerLinks = {
        platform: [
            { name: '关于我', href: '/aboutMe' },
            // { name: '博客', href: '#' },
            // { name: '职业机会', href: '#' },
            // { name: '联系我们', href: '#' }
        ],
        product: [
            { name: '功能', href: '/#features' },
            // { name: '定价', href: '#' },
            // { name: '文档', href: '#' },
            // { name: '状态', href: '#' }
        ],
        support: [
            { name: 'API文档', href: '/docs' },
            // { name: '社区论坛', href: '#' },
            // { name: 'API文档', href: '#' },
            // { name: '服务条款', href: '#' }
        ],
        social: [
            { name: 'GitHub', href: 'https://github.com/jiangchengyu998/one-click-deployment', icon: 'fab fa-github' },
            // { name: 'Twitter', href: '#', icon: 'fab fa-twitter' },
            // { name: '微博', href: '#', icon: 'fab fa-weibo' },
            // { name: '知乎', href: '#', icon: 'fab fa-zhihu' }
        ]
    }

    return (
        <footer className="bg-[#2c3e50] py-[60px] pb-8 text-white max-md:py-10 max-md:pb-5">
            <div className="mx-auto w-full max-w-[1400px] px-5 max-md:px-4">
                <div className="mb-10 grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-10 max-md:grid-cols-2 max-md:gap-8">
                    <div>
                        <h3 className="mb-5 text-lg font-semibold">云朵平台</h3>
                        <ul className="list-none space-y-2.5">
                            {footerLinks.platform.map((link, index) => (
                                <li key={index}><a href={link.href} className="text-[#bdc3c7] no-underline transition hover:text-white">{link.name}</a></li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h3 className="mb-5 text-lg font-semibold">产品</h3>
                        <ul className="list-none space-y-2.5">
                            {footerLinks.product.map((link, index) => (
                                <li key={index}><a href={link.href} className="text-[#bdc3c7] no-underline transition hover:text-white">{link.name}</a></li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h3 className="mb-5 text-lg font-semibold">支持</h3>
                        <ul className="list-none space-y-2.5">
                            {footerLinks.support.map((link, index) => (
                                <li key={index}><a href={link.href} className="text-[#bdc3c7] no-underline transition hover:text-white">{link.name}</a></li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h3 className="mb-5 text-lg font-semibold">关注我们</h3>
                        <ul className="list-none space-y-2.5">
                        {footerLinks.social.map((link, index) => (
                                <li key={index}><a href={link.href} target="_blank" className="text-[#bdc3c7] no-underline transition hover:text-white"><i className={`${link.icon} mr-1`}></i> {link.name}</a></li>
                            ))}
                        </ul>
                    </div>
                </div>
                <div className="border-t border-[#34495e] pt-8 text-center text-sm text-[#bdc3c7]">
                    <p>&copy; 2025 云朵一键部署平台. 保留所有权利.</p>
                </div>
            </div>
        </footer>
    )
}
