"use client";
import Link from 'next/link';

export default function Features() {
    const features = [
        {
            icon: 'fas fa-database',
            title: '数据库管理',
            description: '一键创建数据库实例，自动生成数据库名称和账号密码。支持在线创建表、管理数据，无需复杂的数据库配置。'
        },
        {
            icon: 'fas fa-code',
            title: 'API部署',
            description: '只需提供GitHub仓库地址，自动部署您的API应用。平台将为您分配专属三级域名，立即访问您的API服务。'
        },
        {
            icon: 'fas fa-cogs',
            title: '灵活配置',
            description: '为多种主流语言提供预置Dockerfile，同时也支持自定义Dockerfile，满足您的特殊部署需求。'
        }
    ]

    return (
        <section id="features" className="features">
            <div className="container">
                <div className="section-title">
                    <h2>核心功能</h2>
                    <p>云朵平台提供全面的应用部署解决方案，满足您的各种需求</p>
                </div>
                <div className="features-grid">
                    {features.map((feature, index) => (
                        <div key={index} className="feature-card">
                            <div className="feature-icon">
                                <i className={feature.icon}></i>
                            </div>
                            <h3>{feature.title}</h3>
                            <p>{feature.description}</p>
                            <Link href="/#features" className="btn btn-outline">了解更多</Link>
                        </div>
                    ))}
                </div>
            </div>
            <style jsx>{`
                .features {
                    padding: 80px 0;
                    background: var(--light-bg);
                }

                .features-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: 30px;
                }

                .feature-card {
                    background: var(--white);
                    border-radius: var(--radius);
                    padding: 30px;
                    box-shadow: var(--shadow);
                    transition: transform 0.3s;
                    text-align: center;
                }

                .feature-card:hover {
                    transform: translateY(-5px);
                }

                .feature-icon {
                    width: 70px;
                    height: 70px;
                    background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 20px;
                }

                .feature-icon i {
                    font-size: 30px;
                    color: var(--white);
                }

                .feature-card h3 {
                    font-size: 22px;
                    margin-bottom: 15px;
                }

                .feature-card p {
                    color: var(--light-text);
                    margin-bottom: 20px;
                    line-height: 1.6;
                }

                @media (max-width: 768px) {
                    .features {
                        padding: 60px 0;
                    }

                    .features-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </section>
    )
}