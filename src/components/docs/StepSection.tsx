
/* 单步内容组件 */
import {JSX} from "react";
import Image from "next/image";
import Alert from "@/components/docs/Alert";

export default function StepSection({
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
