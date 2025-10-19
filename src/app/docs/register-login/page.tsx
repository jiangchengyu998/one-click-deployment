"use client";
import {JSX, useEffect, useState} from "react";
import Image from "next/image";
import Link from "next/link";

const steps = [
    { id: "step1", title: "填写注册信息", number: 1 },
    { id: "step2", title: "邮箱认证", number: 2 },
    { id: "step3", title: "登录使用", number: 3 },
];

export default function RegisterLoginDocs() {
    const [activeId, setActiveId] = useState<string>("step1");

    useEffect(() => {
        // 平滑滚动
        document.documentElement.style.scrollBehavior = "smooth";

        // Intersection Observer 监听滚动位置
        const observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting) {
                        setActiveId(entry.target.id);
                    }
                }
            },
            { rootMargin: "-50% 0px -50% 0px", threshold: 0.1 }
        );

        steps.forEach((s) => {
            const el = document.getElementById(s.id);
            if (el) observer.observe(el);
        });

        return () => observer.disconnect();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 py-10">
            <div className="container mx-auto px-4 max-w-5xl flex flex-col md:flex-row gap-10">
                {/* 侧边导航栏 */}
                <aside className="md:w-64 bg-white rounded-lg shadow p-6 h-fit sticky top-20">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">内容导航</h2>
                    <ul className="space-y-3">
                        {steps.map((s) => (
                            <li key={s.id}>
                                <a
                                    href={`#${s.id}`}
                                    className={`block px-3 py-2 rounded-md font-medium transition-colors duration-150 ${
                                        activeId === s.id
                                            ? "bg-blue-100 text-blue-700"
                                            : "text-blue-600 hover:bg-blue-50 hover:text-blue-800"
                                    }`}
                                >
                                    步骤{s.number}：{s.title}
                                </a>
                            </li>
                        ))}
                    </ul>
                </aside>

                {/* 主体内容 */}
                <main className="flex-1">
                    {/* 页面头部 */}
                    <header className="text-center mb-12">
                        <h1 className="text-4xl font-bold text-gray-900 mb-3">注册与登录指南</h1>
                        <p className="text-lg text-gray-600">
                            了解如何在云朵平台创建账户并开始使用我们的服务
                        </p>
                    </header>

                    {/* 步骤内容 */}
                    {steps.map((s) => (
                        <StepSection key={s.id} id={s.id} number={s.number} title={s.title} />
                    ))}

                    {/* 常见问题 */}
                    <FAQSection />

                    {/* 导航链接 */}
                    <footer className="mt-12 flex justify-between">
                        <Link
                            href="/docs"
                            className="flex items-center text-blue-600 hover:text-blue-800 font-medium"
                        >
                            <ArrowLeftIcon />
                            返回文档中心
                        </Link>

                        <Link
                            href="/docs/first-deployment"
                            className="flex items-center text-blue-600 hover:text-blue-800 font-medium"
                        >
                            下一篇：首次部署指南
                            <ArrowRightIcon />
                        </Link>
                    </footer>
                </main>
            </div>
        </div>
    );
}

/* 单步内容组件 */
function StepSection({
                         id,
                         number,
                         title,
                     }: {
    id: string;
    number: number;
    title: string;
}) {
    const images: Record<string, string> = {
        step1: "/images/register-form.png",
        step2: "/images/register-email.png",
        step3: "/images/login-form.png",
    };

    const contentMap: Record<string, JSX.Element> = {
        step1: (
            <>
                <p className="mb-6">
                    点击首页右上角的<strong>「免费注册」</strong>按钮进入注册页面。
                </p>
                <Alert type="info" text="请使用真实有效的邮箱地址，以便接收认证邮件。" />
                <h3 className="text-xl font-semibold mt-6 mb-3">填写字段：</h3>
                <ul className="list-disc list-inside space-y-2 mb-6">
                    <li>邮箱地址 - 用于登录与通知</li>
                    <li>用户名 - 显示在平台内的昵称</li>
                    <li>密码 - 至少6位</li>
                    <li>确认密码 - 再次输入以确认</li>
                </ul>
                <Image
                    src={images[id]}
                    alt="注册表单页面"
                    width={900}
                    height={500}
                    className="rounded-lg shadow-md mb-6"
                    loading="lazy"
                />
                <Alert type="success" text="系统会向您填写的邮箱发送认证邮件。" />
            </>
        ),
        step2: (
            <>
                <p className="mb-6">提交注册后，请前往邮箱查收认证邮件。</p>
                <ol className="list-decimal list-inside space-y-2 mb-6">
                    <li>打开邮箱客户端（Gmail、QQ邮箱等）</li>
                    <li>查找来自 <strong>jchengyu0829@163.com</strong> 的邮件</li>
                    <li>点击邮件中的「验证邮箱地址」</li>
                </ol>
                <Alert
                    type="warning"
                    text="若未收到邮件，请检查垃圾邮件文件夹或稍后重试。"
                />
                <Image
                    src={images[id]}
                    alt="邮箱认证示例"
                    width={900}
                    height={500}
                    className="rounded-lg shadow-md mb-6"
                    loading="lazy"
                />
                <Alert type="success" text="邮箱验证成功后，账户即被激活。" />
            </>
        ),
        step3: (
            <>
                <p className="mb-6">
                    认证完成后，返回首页点击「登录」进入登录页面。
                </p>
                <ul className="list-disc list-inside space-y-2 mb-6">
                    <li>邮箱登录 - 使用注册邮箱</li>
                    <li>密码登录 - 输入密码</li>
                </ul>
                <Image
                    src={images[id]}
                    alt="登录页面"
                    width={900}
                    height={500}
                    className="rounded-lg shadow-md mb-6"
                    loading="lazy"
                />
                <Alert
                    type="info"
                    text="⚠️ 请勿在公共设备上勾选『记住我』，以保护账户安全。"
                />
                <ul className="list-disc list-inside space-y-2 mb-6">
                    <li>创建与管理数据库实例</li>
                    <li>部署 API 应用</li>
                    <li>管理项目设置</li>
                </ul>
                <Image
                    src="/images/user-dashboard.png"
                    alt="控制台页面"
                    width={900}
                    height={500}
                    className="rounded-lg shadow-md mb-6"
                    loading="lazy"
                />
                <Alert type="success" text="🎉 恭喜，您已完成注册与登录流程！" />
            </>
        ),
    };

    return (
        <section id={id} className="bg-white rounded-lg shadow p-8 mb-10 scroll-mt-24">
            <div className="flex items-center mb-6">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mr-4">
                    {number}
                </div>
                <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            </div>
            <div className="text-gray-700 leading-relaxed">{contentMap[id]}</div>
        </section>
    );
}

/* FAQ */
function FAQSection() {
    const faqs = [
        {
            q: "收不到认证邮件怎么办？",
            a: "请检查垃圾邮件文件夹，或将 jchengyu0829@163.com 添加到联系人列表。如果仍未收到，请尝试重新发送认证邮件或联系客服。",
        },
        {
            q: "忘记密码怎么办？",
            a: "在登录页面点击「忘记密码」链接，输入邮箱地址后，系统会发送重置邮件。",
        },
        {
            q: "一个邮箱可以注册多个账户吗？",
            a: "每个邮箱仅可注册一个账户。如需多个，请使用不同邮箱注册。",
        },
    ];

    return (
        <section className="bg-white rounded-lg shadow p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">常见问题</h2>
            <div className="divide-y divide-gray-200">
                {faqs.map((f, i) => (
                    <div key={i} className="py-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{f.q}</h3>
                        <p className="text-gray-700">{f.a}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}

/* 通用提示框 */
function Alert({ type, text }: { type: "info" | "success" | "warning"; text: string }) {
    const styles = {
        info: "bg-blue-50 border-blue-500 text-blue-800",
        success: "bg-green-50 border-green-500 text-green-800",
        warning: "bg-yellow-50 border-yellow-500 text-yellow-800",
    };
    return (
        <div className={`border-l-4 p-4 mb-6 ${styles[type]}`}>
            <p>{text}</p>
        </div>
    );
}

/* 图标组件 */
function ArrowLeftIcon() {
    return (
        <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
        >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
    );
}
function ArrowRightIcon() {
    return (
        <svg
            className="w-5 h-5 ml-2"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
        >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
    );
}
