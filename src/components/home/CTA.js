// src/components/home/CTA.js
"use client";
import Link from 'next/link';

export default function CTA() {
    return (
        <section id="cta" className="bg-gradient-to-br from-[#4a6ee0] to-[#7b68ee] py-20 text-center text-white max-md:py-16">
            <div className="mx-auto w-full max-w-[1400px] px-5 max-md:px-4">
                <div>
                    <h2 className="mb-5 text-4xl font-bold max-md:text-3xl">准备好把下一个项目部署出去了吗？</h2>
                    <p className="mx-auto mb-8 max-w-2xl text-lg opacity-90 max-md:text-base">从创建数据库到访问 API，先用免费版跑通完整流程。</p>
                    <div className="flex justify-center gap-4 max-sm:flex-col">
                        <Link href="/auth/register" className="inline-flex cursor-pointer items-center justify-center rounded-lg bg-white px-5 py-2.5 text-base font-medium text-[#4a6ee0] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] max-md:px-4 max-md:py-2 max-md:text-sm">免费注册</Link>
                        <Link href="/docs/first-deployment" className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-white/70 px-5 py-2.5 text-base font-medium text-white transition duration-300 hover:-translate-y-0.5 hover:bg-white/10 max-md:px-4 max-md:py-2 max-md:text-sm">首次部署指南</Link>
                    </div>
                </div>
            </div>
        </section>
    )
}
