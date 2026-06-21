"use client";
import Link from 'next/link';

export default function Features() {
    const outlineButton = 'inline-flex cursor-pointer items-center justify-center rounded-lg border border-[#4a6ee0] px-4 py-2 text-sm font-medium text-[#4a6ee0] transition duration-300 hover:-translate-y-0.5 hover:bg-[#f5f7ff] hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)]'
    const features = [
        {
            icon: 'fas fa-database',
            title: '数据库管理',
            description: '创建实例、生成账号、查看连接信息都在一个页面完成。',
            href: '/docs/create-db-instance',
        },
        {
            icon: 'fas fa-code',
            title: 'Git 自动部署',
            description: '填写仓库地址和分支，平台负责构建、发布和状态更新。',
            href: '/docs/first-deployment',
        },
        {
            icon: 'fas fa-link',
            title: '域名访问',
            description: '部署完成后自动分配三级域名，方便演示和调用。',
            href: '/docs/first-deployment',
        },
        {
            icon: 'fas fa-terminal',
            title: '日志排查',
            description: '部署日志和运行日志集中查看，问题定位更直接。',
            href: '/docs/first-deployment',
        },
        {
            icon: 'fas fa-key',
            title: '凭据管理',
            description: '数据库主机、账号和密码清晰展示，复制即可使用。',
            href: '/docs/create-db-instance',
        },
        {
            icon: 'fas fa-book-open',
            title: '上手文档',
            description: '从注册、创建数据库到首次部署都有步骤说明。',
            href: '/docs',
        },
    ]

    return (
        <section id="features" className="bg-[#f8f9fa] py-20 max-md:py-16">
            <div className="mx-auto w-full max-w-[1400px] px-5 max-md:px-4">
                <div className="mb-[60px] text-center">
                    <span className="mb-3 inline-block rounded-full bg-white px-4 py-2 text-sm font-medium text-[#4a6ee0] shadow-sm ring-1 ring-gray-200">功能覆盖</span>
                    <h2 className="mb-4 text-4xl font-bold text-[#333] max-md:text-3xl">从创建资源到上线访问，都少一步</h2>
                    <p className="mx-auto max-w-2xl text-lg text-[#666] max-md:text-base">围绕个人开发者和小团队的常见部署流程设计，保留必要控制，去掉重复配置。</p>
                </div>
                <div className="grid grid-cols-3 gap-8 max-lg:grid-cols-2 max-md:grid-cols-1">
                    {features.map((feature, index) => (
                        <div key={index} className="rounded-lg bg-white p-7 text-left shadow-[0_4px_12px_rgba(0,0,0,0.08)] ring-1 ring-gray-100 transition duration-300 hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(36,45,84,0.12)]">
                            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-[#4a6ee0] to-[#7b68ee]">
                                <i className={`${feature.icon} text-xl text-white`}></i>
                            </div>
                            <h3 className="mb-4 text-[22px] font-semibold">{feature.title}</h3>
                            <p className="mb-5 min-h-[52px] leading-relaxed text-[#666]">{feature.description}</p>
                            <Link href={feature.href} className={outlineButton}>了解更多</Link>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
