"use client";
export default function Workflow() {
    const steps = [
        { number: '1', title: '注册并验证邮箱', description: '创建账户后完成邮箱验证，进入个人控制台。', icon: 'fas fa-user-check' },
        { number: '2', title: '准备数据库', description: '按需创建数据库，复制连接信息给应用使用。', icon: 'fas fa-database' },
        { number: '3', title: '填写仓库信息', description: '提供 Git 地址、分支和必要环境变量。', icon: 'fas fa-code-branch' },
        { number: '4', title: '上线并查看日志', description: '等待部署完成，通过域名访问并查看运行日志。', icon: 'fas fa-rocket' },
    ]

    return (
        <section id="workflow" className="bg-white py-20 max-lg:py-16">
            <div className="mx-auto w-full max-w-[1400px] px-5 max-md:px-4">
                <div className="mb-[60px] text-center">
                    <span className="mb-3 inline-block rounded-full bg-[#f5f7ff] px-4 py-2 text-sm font-medium text-[#4a6ee0]">部署路径</span>
                    <h2 className="mb-4 text-4xl font-bold text-[#333] max-md:text-3xl">按控制台提示走完四步</h2>
                    <p className="mx-auto max-w-2xl text-lg text-[#666] max-md:text-base">不需要记命令，也不用在多个系统之间来回切换。</p>
                </div>
                <div className="grid grid-cols-4 gap-6 max-lg:grid-cols-2 max-md:grid-cols-1">
                    {steps.map((step, index) => (
                        <div key={index} className="rounded-lg border border-gray-200 bg-[#fbfcff] p-6 shadow-sm">
                            <div className="mb-5 flex items-center justify-between">
                                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#4a6ee0] text-lg font-bold text-white">{step.number}</span>
                                <i className={`${step.icon} text-2xl text-[#7b68ee]`}></i>
                            </div>
                            <h4 className="mb-3 text-lg font-semibold text-[#333]">{step.title}</h4>
                            <p className="leading-relaxed text-[#666]">{step.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
