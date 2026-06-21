'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function Hero() {
    const [activeTab, setActiveTab] = useState('database')
    const primaryButton = 'inline-flex cursor-pointer items-center justify-center rounded-lg bg-[#4a6ee0] px-5 py-2.5 text-base font-medium text-white transition duration-300 hover:-translate-y-0.5 hover:bg-[#3f5fd0] hover:shadow-[0_8px_18px_rgba(74,110,224,0.22)] max-md:px-4 max-md:py-2 max-md:text-sm'
    const secondaryButton = 'inline-flex cursor-pointer items-center justify-center rounded-lg border border-[#4a6ee0] bg-white px-5 py-2.5 text-base font-medium text-[#4a6ee0] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] max-md:px-4 max-md:py-2 max-md:text-sm'
    const smallButton = 'cursor-pointer rounded bg-white px-3 py-1.5 text-sm text-[#4a6ee0] shadow-sm ring-1 ring-gray-200 transition hover:bg-gray-50'
    const highlights = ['数据库一键创建', 'Git 仓库自动部署', '独立三级域名']

    return (
        <section className="bg-[linear-gradient(180deg,#ffffff_0%,#f8f9fa_100%)] py-20 max-lg:py-16">
            <div className="mx-auto flex w-full max-w-[1400px] items-center gap-[60px] px-5 max-lg:flex-col max-lg:text-center max-md:px-4">
                <div className="flex-1">
                    <div className="mb-5 inline-flex items-center rounded-full border border-[#dfe5ff] bg-white px-4 py-2 text-sm font-medium text-[#4a6ee0] shadow-sm">
                        <i className="fab fa-github mr-2"></i>
                        开源的一键部署平台
                    </div>
                    <h1 className="mb-5 text-5xl font-bold leading-tight text-[#222] max-lg:text-4xl">
                        把数据库和 API 部署，压缩到一个清爽的控制台里
                    </h1>
                    <p className="mb-8 max-w-2xl text-xl leading-relaxed text-[#666] max-lg:mx-auto max-lg:text-lg">
                        云朵平台帮你自动创建数据库、部署 Git 项目、分配访问域名。少折腾服务器配置，多把时间留给业务本身。
                    </p>
                    <div className="mb-10 flex flex-wrap gap-3 max-lg:justify-center">
                        {highlights.map((item) => (
                            <span key={item} className="rounded-full bg-white px-4 py-2 text-sm font-medium text-[#555] shadow-sm ring-1 ring-gray-200">
                                <i className="fas fa-check mr-2 text-emerald-500"></i>{item}
                            </span>
                        ))}
                    </div>
                    <div className="flex gap-5 max-lg:justify-center max-sm:flex-col">
                        <Link href="/auth/register" className={primaryButton}>立即开始</Link>
                        <Link href="/docs" className={secondaryButton}>查看文档</Link>
                    </div>
                    <div className="mt-10 grid max-w-xl grid-cols-3 gap-4 text-left max-lg:mx-auto max-sm:grid-cols-1 max-sm:text-center">
                        <div>
                            <div className="text-2xl font-bold text-[#333]">3 分钟</div>
                            <div className="text-sm text-[#666]">完成首次部署</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-[#333]">0 配置</div>
                            <div className="text-sm text-[#666]">自动生成数据库凭据</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-[#333]">HTTPS</div>
                            <div className="text-sm text-[#666]">域名访问更省心</div>
                        </div>
                    </div>
                </div>
                <div className="flex flex-1 justify-center">
                    <div className="w-full max-w-[540px] overflow-hidden rounded-xl bg-white shadow-[0_18px_45px_rgba(36,45,84,0.16)] ring-1 ring-gray-200">
                        <div className="flex items-center justify-between border-b border-gray-200 bg-gray-100 p-4">
                            <div className="flex gap-2">
                                <span className="h-3 w-3 rounded-full bg-[#ff5f57]"></span>
                                <span className="h-3 w-3 rounded-full bg-[#ffbd2e]"></span>
                                <span className="h-3 w-3 rounded-full bg-[#28ca42]"></span>
                            </div>
                            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">运行正常</span>
                        </div>
                        <div className="p-5">
                            <div className="mb-5 flex border-b border-gray-200">
                                <button
                                    className={`cursor-pointer border-b-2 px-5 py-2.5 font-medium transition ${activeTab === 'database' ? 'border-[#4a6ee0] text-[#4a6ee0]' : 'border-transparent text-[#666] hover:text-[#4a6ee0]'}`}
                                    onClick={() => setActiveTab('database')}
                                >
                                    数据库管理
                                </button>
                                <button
                                    className={`cursor-pointer border-b-2 px-5 py-2.5 font-medium transition ${activeTab === 'api' ? 'border-[#4a6ee0] text-[#4a6ee0]' : 'border-transparent text-[#666] hover:text-[#4a6ee0]'}`}
                                    onClick={() => setActiveTab('api')}
                                >
                                    API部署
                                </button>
                            </div>
                            <div>
                                {activeTab === 'database' ? (
                                    <div>
                                        <div className="mb-4 flex items-center justify-between">
                                            <h3 className="font-semibold text-[#333]">数据库实例</h3>
                                            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">配额 1/1</span>
                                        </div>
                                        <div className="mb-4 flex items-center justify-between rounded-lg bg-gray-50 p-4 ring-1 ring-gray-100">
                                            <div className="flex items-center gap-2.5">
                                                <i className="fas fa-database text-2xl text-[#4a6ee0]"></i>
                                                <div className="flex flex-col">
                                                    <strong>myapp_db</strong>
                                                    <span className="text-sm text-[#666]">运行中</span>
                                                </div>
                                            </div>
                                            <button className={smallButton}>管理</button>
                                        </div>
                                        <div className="rounded-lg bg-[#101828] p-4 text-left font-mono text-sm text-gray-100">
                                            <div><span className="text-emerald-400">$</span> mysql -h db.ydphoto.com -u myapp_user -p</div>
                                            <div className="mt-2 text-gray-400">凭据自动生成，可在控制台复制使用</div>
                                        </div>
                                        <div className="mt-5 flex justify-center">
                                            <Link href="/auth/register" className={primaryButton}>新建数据库</Link>
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <div className="mb-4 flex items-center justify-between">
                                            <h3 className="font-semibold text-[#333]">API服务</h3>
                                            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">部署成功</span>
                                        </div>
                                        <div className="mb-4 flex items-center justify-between gap-3 rounded-lg bg-gray-50 p-4 ring-1 ring-gray-100">
                                            <div className="flex min-w-0 items-center gap-2.5">
                                                <i className="fas fa-code text-2xl text-[#4a6ee0]"></i>
                                                <div className="flex min-w-0 flex-col">
                                                    <strong>用户管理API</strong>
                                                    <span className="truncate text-sm text-[#666]">https://user-api.{process.env.NEXT_PUBLIC_MAIN_DOMAIN}</span>
                                                </div>
                                            </div>
                                            <button className={smallButton}>查看</button>
                                        </div>
                                        <div className="space-y-3 rounded-lg border border-gray-200 p-4 text-left">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-[#666]">构建镜像</span>
                                                <span className="font-medium text-emerald-600">完成</span>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-[#666]">发布服务</span>
                                                <span className="font-medium text-emerald-600">完成</span>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-[#666]">绑定域名</span>
                                                <span className="font-medium text-emerald-600">完成</span>
                                            </div>
                                        </div>
                                        <div className="mt-5 flex justify-center">
                                            <Link href="/auth/register" className={primaryButton}>部署新API</Link>
                                        </div>
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
