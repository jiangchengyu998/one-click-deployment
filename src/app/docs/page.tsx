// src/app/docs/page.tsx
import Link from 'next/link';

const docs = [
    {
        title: '部署应用',
        href: '/docs/first-deployment',
        icon: 'fas fa-code-branch',
        description: '从准备仓库、配置 Dockerfile 到创建应用服务，完整走通一次自动部署。',
        highlights: ['仓库准备', '构建配置', '环境变量', '部署日志']
    },
    {
        title: '数据库连接',
        href: '/docs/create-db-instance',
        icon: 'fas fa-database',
        description: '使用平台默认数据库，或接入自己的 RDS、自建 MySQL，并把连接参数交给应用。',
        highlights: ['默认数据库', '自有 RDS', 'DBeaver 设置', '应用环境变量']
    }
];

export default function Docs() {
    return (
        <div className="min-h-screen bg-[#f8f9fa] py-20 max-md:py-14">
            <div className="mx-auto w-full max-w-[1120px] px-5 max-md:px-4">
                <header className="mb-12">
                    <span className="mb-4 inline-flex rounded-full bg-white px-4 py-2 text-sm font-medium text-[#4a6ee0] shadow-sm ring-1 ring-gray-200">
                        文档中心
                    </span>
                    <h1 className="mb-4 text-5xl font-bold text-[#222] max-md:text-4xl">两篇文档，跑通核心流程</h1>
                    <p className="max-w-3xl text-lg leading-8 text-[#666]">
                        先选数据库，再部署应用。默认数据库适合快速起步，已有 RDS 或自建 MySQL 也可以直接接入。
                    </p>
                </header>

                <div className="grid grid-cols-2 gap-6 max-md:grid-cols-1">
                    {docs.map((doc) => (
                        <Link
                            key={doc.href}
                            href={doc.href}
                            className="group rounded-lg border border-gray-200 bg-white p-7 text-inherit shadow-sm transition hover:-translate-y-0.5 hover:border-[#4a6ee0] hover:shadow-[0_12px_30px_rgba(36,45,84,0.12)]"
                        >
                            <div className="mb-6 flex items-center justify-between">
                                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#eef2ff] text-[#4a6ee0]">
                                    <i className={`${doc.icon} text-xl`}></i>
                                </div>
                                <i className="fas fa-arrow-right text-[#9aa3b2] transition group-hover:translate-x-1 group-hover:text-[#4a6ee0]"></i>
                            </div>
                            <h2 className="mb-3 text-2xl font-semibold text-[#222]">{doc.title}</h2>
                            <p className="mb-6 min-h-[72px] leading-7 text-[#666] max-md:min-h-0">{doc.description}</p>
                            <div className="flex flex-wrap gap-2">
                                {doc.highlights.map((item) => (
                                    <span key={item} className="rounded-md bg-gray-100 px-3 py-1 text-sm text-gray-700">
                                        {item}
                                    </span>
                                ))}
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
