// src/app/pricing/page.tsx
"use client";
export default function Pricing() {
    const plans = [
        {
            name: '免费版',
            price: '¥0',
            period: '永久免费',
            description: '适合个人开发者和小型项目',
            features: [
                '1个数据库实例',
                '1个API服务',
                // '10GB 存储空间',
                '基础技术支持',
                '三级域名访问'
            ],
            buttonText: '开始使用',
            popular: true
        },
        {
            name: '专业版(Coming soon)',
            price: '¥29',
            period: '每月',
            description: '适合中小型企业和团队',
            features: [
                '多个数据库实例',
                '多个API服务',
                // '100GB 存储空间',
                '优先技术支持',
                '自定义域名',
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
        <div className="pricing-page">
            <div className="container">
                <div className="page-header">
                    <h1>简单透明的定价</h1>
                    <p>选择最适合您业务的方案，所有计划都包含核心功能</p>
                </div>

                <div className="pricing-grid">
                    {plans.map((plan, index) => (
                        <div
                            key={index}
                            className={`pricing-card ${plan.popular ? 'popular' : ''}`}
                        >
                            {plan.popular && <div className="popular-badge">最受欢迎</div>}

                            <div className="plan-header">
                                <h3>{plan.name}</h3>
                                <div className="price">
                                    <span className="amount">{plan.price}</span>
                                    {plan.period && <span className="period">/{plan.period}</span>}
                                </div>
                                <p className="plan-description">{plan.description}</p>
                            </div>

                            <ul className="features-list">
                                {plan.features.map((feature, featureIndex) => (
                                    <li key={featureIndex}>
                                        <i className="fas fa-check"></i>
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <button className={`btn ${plan.popular ? 'btn-primary' : 'btn-outline'} full-width`}>
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

            <style jsx>{`
        .pricing-page {
          padding: 80px 0;
          background: var(--light-bg);
        }

        .page-header {
          text-align: center;
          margin-bottom: 60px;
        }

        .page-header h1 {
          font-size: 48px;
          margin-bottom: 20px;
          color: var(--dark-text);
        }

        .page-header p {
          font-size: 20px;
          color: var(--light-text);
          max-width: 600px;
          margin: 0 auto;
        }

        .pricing-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 30px;
          margin-bottom: 80px;
        }

        .pricing-card {
          background: var(--white);
          border-radius: 12px;
          padding: 40px 30px;
          box-shadow: var(--shadow);
          position: relative;
          text-align: center;
          transition: transform 0.3s;
        }

        .pricing-card:hover {
          transform: translateY(-5px);
        }

        .pricing-card.popular {
          border: 2px solid var(--primary-color);
        }

        .popular-badge {
          position: absolute;
          top: -10px;
          left: 50%;
          transform: translateX(-50%);
          background: var(--primary-color);
          color: white;
          padding: 5px 15px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 600;
        }

        .plan-header h3 {
          font-size: 24px;
          margin-bottom: 15px;
        }

        .price {
          margin-bottom: 15px;
        }

        .amount {
          font-size: 48px;
          font-weight: bold;
          color: var(--dark-text);
        }

        .period {
          font-size: 16px;
          color: var(--light-text);
        }

        .plan-description {
          color: var(--light-text);
          margin-bottom: 30px;
        }

        .features-list {
          list-style: none;
          margin: 30px 0;
          text-align: left;
        }

        .features-list li {
          padding: 10px 0;
          border-bottom: 1px solid #f0f0f0;
          display: flex;
          align-items: center;
        }

        .features-list li:last-child {
          border-bottom: none;
        }

        .features-list i {
          color: var(--success-color);
          margin-right: 10px;
        }

        .full-width {
          width: 100%;
        }

        .pricing-faq {
          max-width: 800px;
          margin: 0 auto;
        }

        .pricing-faq h2 {
          text-align: center;
          margin-bottom: 40px;
          font-size: 36px;
        }

        .faq-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 30px;
        }

        .faq-item {
          background: var(--white);
          padding: 25px;
          border-radius: var(--radius);
          box-shadow: var(--shadow);
        }

        .faq-item h4 {
          margin-bottom: 10px;
          color: var(--dark-text);
        }

        .faq-item p {
          color: var(--light-text);
          line-height: 1.6;
        }

        @media (max-width: 768px) {
          .pricing-page {
            padding: 60px 0;
          }

          .page-header h1 {
            font-size: 36px;
          }

          .pricing-grid {
            grid-template-columns: 1fr;
          }

          .faq-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
        </div>
    );
}