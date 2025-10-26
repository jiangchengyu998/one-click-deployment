/* 单步内容组件 */
import DocLayout from "@/components/docs/DocLayout";
import {JSX} from "react";
import Image from "next/image";
import Alert from "@/components/docs/Alert";


const steps = [
    { id: "step1", title: "创建数据库实例", number: 1 },
    { id: "step2", title: "链接数据库实例", number: 2 },
];

export default function RegisterLoginDocs() {
    return (
        <DocLayout
            title="创建数据库实例"
            subtitle="了解如何一键创建和管理数据库实例"
            steps={steps}
            prev={{ href: "/docs", label: "返回文档中心" }}
            next={{ href: "/docs/first-deployment", label: "下一篇：部署项目" }}
        >
            {steps.map((s) => (
                <StepSection key={s.id} id={s.id} number={s.number} title={s.title} />
            ))}
        </DocLayout>
    );
}

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
        step1: "/images/first-deploy/create-db.png",
        step2: "/images/first-deploy/connect-success.png",
        step3: "/images/first-deploy/dbserver.png",
    };

    const contentMap: Record<string, JSX.Element> = {
        step1: (
            <>
                <p className="mb-6">
                    创建数据库实例
                </p>

                <h3 className="text-xl font-semibold mt-6 mb-3">创建步骤：</h3>
                <ol className="list-decimal list-inside space-y-2 mb-6">
                    <li>在控制台中点击「<strong>创建 API</strong>」。</li>
                    <li>填写必要的参数：
                        <ul className="list-disc list-inside ml-6 mt-2">
                            <li>API 名称（例如：<code>my-first-api</code>）</li>
                            <li>仓库地址（GitHub/Gitee 等）</li>
                            <li>分支名称（默认为 <code>main</code>）</li>
                        </ul>
                    </li>
                </ol>

                <Image
                    src={images["step1"]}
                    alt="数据库创建页面示意图"
                    width={900}
                    height={500}
                    className="rounded-lg shadow-md mb-6"
                    loading="lazy"
                />

                <Alert
                    type="success"
                    text="✅ 创建成功后，你可以用数据库连接工具（如 DBeaver、HeidiSQL）连接并管理数据库实例。"
                />
            </>
        ),

        step2: (
            <>
                <p className="mb-6">
                    接下来，您可以用数据库连接工具（如 DBeaver、HeidiSQL）连接并管理数据库实例。
                </p>

                <h3 className="text-xl font-semibold mt-6 mb-3">示例：DBeaver 连接数据库实例</h3>

                <Alert
                    type="success"
                    text="💡 请先将数据库的驱动属性 allowPublicKeyRetrieval 设置为 true，以确保连接成功。"
                />

                <Image
                    src={images["step3"]}
                    alt="数据库驱动配置示意图"
                    width={900}
                    height={500}
                    className="rounded-lg shadow-md mb-6"
                    loading="lazy"
                />

                <pre className="bg-gray-900 text-gray-100 text-sm p-4 rounded-lg mb-6 overflow-x-auto">
                </pre>

                <Image
                    src={images[id]}
                    alt="数据库连接成功示意图"
                    width={900}
                    height={500}
                    className="rounded-lg shadow-md mb-6"
                    loading="lazy"
                />


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
