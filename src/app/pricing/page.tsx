// src/app/pricing/page.tsx
"use client";
export default function Pricing() {
    const primaryButton = 'inline-flex w-full cursor-pointer items-center justify-center rounded-lg bg-[#4a6ee0] px-5 py-2.5 text-base font-medium text-white transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)]'
    const outlineButton = 'inline-flex w-full cursor-pointer items-center justify-center rounded-lg border border-[#4a6ee0] px-5 py-2.5 text-base font-medium text-[#4a6ee0] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)]'
    const plans = [
        {
            name: '免费版',
            price: '¥0',
            period: '永久免费',
            description: '适合个人开发者和小型项目',
            features: [
                '1个数据库实例',
                '1个API服务',
                '500m CPU + 512MB 内存',
                '基础技术支持',
                '三级域名访问'
            ],
            buttonText: '开始使用',
            popular: true
        },
        {
            name: '专业版(Coming soon)',
            price: '¥9.99',
            period: '每月/API',
            description: '适合中小型企业和团队',
            features: [
                '多个数据库实例',
                '多个API服务',
                '1G CPU + 1G 内存',
                '优先技术支持',
                '三级域名访问',
                // '自动备份',
                // '性能监控'
            ],
            buttonText: '免费试用',
            popular: false
        },
        // {
        //     name: '企业版',
        //     price: '定制',
        //     period: '按需定制',
        //     description: '适合大型企业和关键业务',
        //     features: [
        //         '无限数据库实例',
        //         '无限API服务',
        //         '无限存储空间',
        //         '专属技术支持',
        //         'SLA保障',
        //         '私有化部署',
        //         '专属客户经理'
        //     ],
        //     buttonText: '联系销售',
        //     popular: false
        // }
    ];

    return (
        <div className="bg-[#f8f9fa] py-20 max-md:py-16">
            <div className="mx-auto w-full max-w-[1400px] px-5 max-md:px-4">
                <div className="mb-[60px] text-center">
                    <h1 className="mb-5 text-5xl font-bold text-[#333] max-md:text-4xl">简单透明的定价</h1>
                    <p className="mx-auto max-w-2xl text-xl text-[#666]">选择最适合您业务的方案，所有计划都包含核心功能</p>
                </div>

                <div className="mb-20 grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-8 max-md:grid-cols-1">
                    {plans.map((plan, index) => (
                        <div
                            key={index}
                            className={`relative rounded-xl bg-white px-8 py-10 text-center shadow-[0_4px_12px_rgba(0,0,0,0.1)] transition duration-300 hover:-translate-y-1 ${plan.popular ? 'border-2 border-[#4a6ee0]' : 'border border-transparent'}`}
                        >
                            {plan.popular && <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-[#4a6ee0] px-4 py-1 text-sm font-semibold text-white">最受欢迎</div>}

                            <div>
                                <h3 className="mb-4 text-2xl font-semibold">{plan.name}</h3>
                                <div className="mb-4">
                                    <span className="text-5xl font-bold text-[#333]">{plan.price}</span>
                                    {plan.period && <span className="text-base text-[#666]">/{plan.period}</span>}
                                </div>
                                <p className="mb-8 text-[#666]">{plan.description}</p>
                            </div>

                            <ul className="my-8 list-none text-left">
                                {plan.features.map((feature, featureIndex) => (
                                    <li key={featureIndex} className="flex items-center border-b border-gray-100 py-2.5 last:border-b-0">
                                        <i className="fas fa-check mr-2.5 text-emerald-500"></i>
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <button onClick={() => window.location.href = '/auth/register'} className={plan.popular ? primaryButton : outlineButton}>
                                {plan.buttonText}
                            </button>
                        </div>
                    ))}
                </div>

                {/*<div className="pricing-faq">*/}
                {/*    <h2>常见问题</h2>*/}
                {/*    <div className="faq-grid">*/}
                {/*        <div className="faq-item">*/}
                {/*            <h4>可以随时升级或降级套餐吗？</h4>*/}
                {/*            <p>是的，您可以随时在账户设置中更改套餐，费用会按比例计算。</p>*/}
                {/*        </div>*/}
                {/*        <div className="faq-item">*/}
                {/*            <h4>支持哪些支付方式？</h4>*/}
                {/*            <p>我们支持支付宝、微信支付、银行卡等多种支付方式。</p>*/}
                {/*        </div>*/}
                {/*        <div className="faq-item">*/}
                {/*            <h4>是否有免费试用？</h4>*/}
                {/*            <p>专业版提供14天免费试用，无需信用卡。</p>*/}
                {/*        </div>*/}
                {/*        <div className="faq-item">*/}
                {/*            <h4>如何获取发票？</h4>*/}
                {/*            <p>支付成功后可以在账户中申请电子发票或纸质发票。</p>*/}
                {/*        </div>*/}
                {/*    </div>*/}
                {/*</div>*/}
            </div>

        </div>
    );
}
