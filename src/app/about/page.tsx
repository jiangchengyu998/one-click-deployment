import Link from "next/link";

export const metadata = {
    title: "关于我 - 云朵一键部署平台",
    description: "云朵一键部署平台作者介绍，包含 Java 后端、云平台、CI/CD、Terraform、Linux 与 AI 辅助开发经验。",
};

const skills = [
    { title: "Java 后端", detail: "7 年 Java 后端开发经验，关注接口设计、业务建模、数据库访问、服务稳定性和可维护性。" },
    { title: "云平台工程", detail: "3 年云平台开发经验，参与 GCP、Kubernetes、容器化部署、服务编排和平台化能力建设。" },
    { title: "CI/CD 与交付", detail: "熟悉 Jenkins、流水线编排、镜像构建、自动发布、环境变量注入和部署状态回传。" },
    { title: "Infra 工具链", detail: "日常使用 Terraform、Linux、Docker、Kubernetes、Nginx、MySQL 等工具处理基础设施和部署问题。" },
    { title: "AI 辅助开发", detail: "把 AI 用在需求拆解、代码生成、日志分析、Debug 定位、测试验证和文档整理中，提高迭代速度。" },
    { title: "问题排查", detail: "擅长从日志、环境变量、网络连通性、数据库权限、构建产物和运行状态中定位问题。" },
];

const stackGroups = [
    {
        title: "后端与数据",
        items: ["Java", "Spring Boot", "REST 服务", "MySQL", "Prisma", "Node.js"],
    },
    {
        title: "云平台与部署",
        items: ["GCP", "Kubernetes", "Docker", "Jenkins", "CI/CD", "Nginx"],
    },
    {
        title: "基础设施与系统",
        items: ["Terraform", "Linux", "Shell", "环境变量", "日志排查", "服务监控"],
    },
    {
        title: "AI 工作流",
        items: ["需求拆解", "代码生成", "Debug 辅助", "日志分析", "重构验证", "文档优化"],
    },
];

export default function AboutPage() {
    return (
        <main className="bg-[#f8f9fa]">
            <section className="border-b border-gray-200 bg-white">
                <div className="mx-auto grid w-full max-w-[1400px] grid-cols-[1.05fr_0.95fr] items-center gap-10 px-5 py-14 max-lg:grid-cols-1 max-md:px-4 max-md:py-10">
                    <div>
                        <span className="mb-4 inline-flex items-center rounded-full border border-[#dfe5ff] bg-[#f7f9ff] px-4 py-2 text-sm font-medium text-[#4a6ee0]">
                            <i className="fas fa-user-gear mr-2"></i>关于我
                        </span>
                        <h1 className="mb-5 text-5xl font-bold leading-tight text-[#1d2939] max-md:text-4xl">
                            后端、云平台和 AI 辅助开发的实践者
                        </h1>
                        <p className="max-w-3xl text-lg leading-8 text-[#667085]">
                            我是一名偏后端和云平台方向的开发者，有 7 年 Java 后端开发经验和 3 年云平台开发经验。做云朵平台，是想把个人项目和小团队常见的数据库准备、应用部署、CI/CD、日志排查这些重复工作，收进一个更顺手的控制台里。
                        </p>
                        <div className="mt-7 flex flex-wrap gap-3">
                            <Link href="/docs" className="inline-flex items-center justify-center rounded-lg bg-[#4a6ee0] px-5 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#3f5fd0] hover:shadow-[0_8px_18px_rgba(74,110,224,0.22)]">
                                查看平台文档
                            </Link>
                            <a
                                href="https://github.com/jiangchengyu998/one-click-deployment"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-[#344054] transition hover:-translate-y-0.5 hover:border-[#4a6ee0] hover:text-[#4a6ee0] hover:shadow-[0_8px_18px_rgba(36,45,84,0.1)]"
                            >
                                <i className="fab fa-github mr-2"></i>GitHub
                            </a>
                        </div>
                    </div>

                    <div className="rounded-lg border border-gray-200 bg-[#fbfcff] p-5 shadow-sm">
                        <div className="mb-4 flex items-center justify-between border-b border-gray-200 pb-4">
                            <div className="flex items-center gap-2 text-sm font-semibold text-[#475467]">
                                <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                                经验概览
                            </div>
                            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">
                                持续实践中
                            </span>
                        </div>
                        <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
                            <Metric value="7 年" label="Java 后端开发" />
                            <Metric value="3 年" label="云平台开发" />
                            <Metric value="CI/CD" label="Jenkins 流水线" />
                            <Metric value="AI" label="辅助开发与 Debug" />
                        </div>
                    </div>
                </div>
            </section>

            <section className="mx-auto w-full max-w-[1400px] px-5 py-12 max-md:px-4 max-md:py-10">
                <div className="mb-8 max-w-3xl">
                    <span className="mb-3 inline-flex items-center rounded-full border border-[#dfe5ff] bg-white px-4 py-2 text-sm font-medium text-[#4a6ee0] shadow-sm">
                        <i className="fas fa-layer-group mr-2"></i>能力方向
                    </span>
                    <h2 className="mb-4 text-4xl font-bold text-[#1d2939] max-md:text-3xl">我关注的不是单点功能，而是完整交付链路</h2>
                    <p className="text-lg leading-8 text-[#667085]">
                        从业务接口、数据库连接，到 Jenkins 构建、容器部署、Linux 环境、Terraform 基础设施，再到线上日志和 Debug，尽量把每一步变得清晰、可复用、可验证。
                    </p>
                </div>

                <div className="grid grid-cols-3 gap-5 max-lg:grid-cols-2 max-md:grid-cols-1">
                    {skills.map((skill) => (
                        <div key={skill.title} className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                            <h3 className="mb-3 text-xl font-semibold text-[#1d2939]">{skill.title}</h3>
                            <p className="leading-7 text-[#667085]">{skill.detail}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="mx-auto w-full max-w-[1400px] px-5 pb-14 max-md:px-4 max-md:pb-10">
                <div className="rounded-lg border border-gray-200 bg-white p-7 shadow-sm">
                    <div className="mb-6 flex items-end justify-between gap-8 max-lg:flex-col max-lg:items-start">
                        <div>
                            <span className="mb-3 inline-flex items-center rounded-full border border-[#dfe5ff] bg-[#f7f9ff] px-4 py-2 text-sm font-medium text-[#4a6ee0]">
                                <i className="fas fa-toolbox mr-2"></i>常用工具
                            </span>
                            <h2 className="text-3xl font-bold text-[#1d2939] max-md:text-2xl">技术栈和工作方式</h2>
                        </div>
                        <p className="max-w-xl text-sm leading-6 text-[#667085]">
                            这些不是摆在简历里的关键词，而是构建这个平台、排查部署问题、优化开发流程时经常用到的工具和方法。
                        </p>
                    </div>

                    <div className="grid grid-cols-4 gap-4 max-lg:grid-cols-2 max-md:grid-cols-1">
                        {stackGroups.map((group) => (
                            <div key={group.title} className="rounded-lg border border-gray-200 bg-[#fbfcff] p-4">
                                <h3 className="mb-3 font-semibold text-[#344054]">{group.title}</h3>
                                <div className="flex flex-wrap gap-2">
                                    {group.items.map((item) => (
                                        <span key={item} className="rounded-full bg-white px-3 py-1 text-sm text-[#667085] ring-1 ring-gray-200">
                                            {item}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </main>
    );
}

function Metric({ value, label }: { value: string; label: string }) {
    return (
        <div className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="text-2xl font-bold text-[#1d2939]">{value}</div>
            <div className="mt-1 text-sm text-[#667085]">{label}</div>
        </div>
    );
}
