// src/app/docs/page.tsx
"use client";
export default function Docs() {
    const docCategories = [
        {
            title: '快速开始',
            icon: 'fas fa-rocket',
            items: [
                { name: '注册与登录', href: '/docs/register-login', description: '创建您的第一个账户' },
                { name: '首次部署指南', href: '/docs/first-deployment', description: '完成您的第一次部署' }
            ]
        },
        // {
        //     title: '数据库管理',
        //     icon: 'fas fa-database',
        //     items: [
        //         { name: '创建数据库实例', href: '/docs/create-db-instance', description: '一键创建和管理数据库' },
        //         { name: '数据库连接', href: '/docs/db-connection', description: '获取连接信息和凭据' },
        //     ]
        // },
        {
            title: 'API部署',
            icon: 'fas fa-code',
            items: [
                { name: '创建数据库实例', href: '/docs/create-db-instance', description: '一键创建和管理数据库' },
                { name: '部署项目', href: '/docs/first-deployment', description: '将您的项目部署到云朵平台' },
                // { name: 'Dockerfile配置', href: '/docs/dockerfile-configuration', description: '自定义构建配置' },
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-[#f8f9fa] py-20 max-md:py-16">
            <div className="mx-auto w-full max-w-[1400px] px-5 max-md:px-4">
                <div className="mb-[60px] text-center">
                    <h1 className="mb-5 text-5xl font-bold text-[#333] max-md:text-4xl">文档中心</h1>
                    <p className="mx-auto max-w-2xl text-xl text-[#666]">全面的使用指南和最佳实践，帮助您充分利用云朵平台</p>
                    {/*<div className="search-box">*/}
                    {/*    <input*/}
                    {/*        type="text"*/}
                    {/*        placeholder="搜索文档..."*/}
                    {/*        className="search-input"*/}
                    {/*    />*/}
                    {/*    <i className="fas fa-search"></i>*/}
                    {/*</div>*/}
                </div>

                <div className="mb-[60px] grid grid-cols-[repeat(auto-fit,minmax(350px,1fr))] gap-8 max-md:grid-cols-1">
                    {docCategories.map((category, index) => (
                        <div key={index} className="rounded-xl bg-white p-8 shadow-[0_4px_12px_rgba(0,0,0,0.1)]">
                            <div className="mb-6 flex items-center border-b-2 border-gray-100 pb-4">
                                <i className={`${category.icon} mr-4 text-2xl text-[#4a6ee0]`}></i>
                                <h2 className="text-2xl font-semibold text-[#333]">{category.title}</h2>
                            </div>
                            <div className="flex flex-col gap-4">
                                {category.items.map((item, itemIndex) => (
                                    <a key={itemIndex} href={item.href} className="group flex items-center justify-between rounded-lg p-4 text-inherit no-underline transition hover:bg-gray-50">
                                        <div>
                                            <h3 className="mb-1 text-base font-semibold text-[#333]">{item.name}</h3>
                                            <p className="m-0 text-sm text-[#666]">{item.description}</p>
                                        </div>
                                        <i className="fas fa-chevron-right text-[#666] transition group-hover:translate-x-1 group-hover:text-[#4a6ee0]"></i>
                                    </a>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
}
