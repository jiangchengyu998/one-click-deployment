'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function Hero() {
    const [activeTab, setActiveTab] = useState('database')

    return (
        <section className="hero">
            <div className="container">
                <div className="hero-content">
                    <h1>简化应用部署，专注业务创新</h1>
                    <p>云朵一键部署平台让数据库管理和API部署变得前所未有的简单。无需复杂配置，几分钟内即可上线您的应用。</p>
                    <div className="hero-buttons">
                        <Link href="/auth/register" className="btn btn-primary">立即开始</Link>
                        <Link href="/#features" className="btn btn-outline">了解更多</Link>
                    </div>
                </div>
                <div className="hero-image">
                    <div className="dashboard-preview">
                        <div className="preview-header">
                            <div className="preview-dots">
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                        </div>
                        <div className="preview-content">
                            <div className="preview-tabs">
                                <button
                                    className={activeTab === 'database' ? 'active' : ''}
                                    onClick={() => setActiveTab('database')}
                                >
                                    数据库管理
                                </button>
                                <button
                                    className={activeTab === 'api' ? 'active' : ''}
                                    onClick={() => setActiveTab('api')}
                                >
                                    API部署
                                </button>
                            </div>
                            <div className="preview-body">
                                {activeTab === 'database' ? (
                                    <div className="database-preview">
                                        <h3>数据库实例</h3>
                                        <div className="db-instance">
                                            <div className="db-info">
                                                <i className="fas fa-database"></i>
                                                <div>
                                                    <strong>myapp_db</strong>
                                                    <span>运行中</span>
                                                </div>
                                            </div>
                                            <button className="btn-small">管理</button>
                                        </div>
                                        <div className="db-actions">
                                            <Link href="/auth/register" className="btn btn-primary">新建数据库</Link>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="api-preview">
                                        <h3>API服务</h3>
                                        <div className="api-instance">
                                            <div className="api-info">
                                                <i className="fas fa-code"></i>
                                                <div>
                                                    <strong>用户管理API</strong>
                                                    <span>https://user-api.${process.env.NEXT_PUBLIC_MAIN_DOMAIN}</span>
                                                </div>
                                            </div>
                                            <button className="btn-small">查看</button>
                                        </div>
                                        <div className="api-actions">
                                            <Link href="/auth/register" className="btn btn-primary">部署新API</Link>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <style jsx>{`
                .hero {
                    display: flex;
                    align-items: center;
                    padding: 80px 0;
                    gap: 60px;
                }

                .hero-content {
                    flex: 1;
                }

                .hero-content h1 {
                    font-size: 48px;
                    margin-bottom: 20px;
                    color: var(--dark-text);
                }

                .hero-content p {
                    font-size: 20px;
                    color: var(--light-text);
                    margin-bottom: 40px;
                    line-height: 1.6;
                }

                .hero-buttons {
                    display: flex;
                    gap: 20px;
                }

                .hero-image {
                    flex: 1;
                    display: flex;
                    justify-content: center;
                }

                .dashboard-preview {
                    width: 100%;
                    max-width: 500px;
                    background: var(--white);
                    border-radius: 12px;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
                    overflow: hidden;
                }

                .preview-header {
                    background: #f5f5f5;
                    padding: 15px;
                    border-bottom: 1px solid #eee;
                }

                .preview-dots {
                    display: flex;
                    gap: 8px;
                }

                .preview-dots span {
                    width: 12px;
                    height: 12px;
                    border-radius: 50%;
                    background: #ddd;
                }

                .preview-dots span:first-child {
                    background: #ff5f57;
                }

                .preview-dots span:nth-child(2) {
                    background: #ffbd2e;
                }

                .preview-dots span:last-child {
                    background: #28ca42;
                }

                .preview-content {
                    padding: 20px;
                }

                .preview-tabs {
                    display: flex;
                    border-bottom: 1px solid #eee;
                    margin-bottom: 20px;
                }

                .preview-tabs button {
                    padding: 10px 20px;
                    background: none;
                    border: none;
                    cursor: pointer;
                    font-weight: 500;
                    color: var(--light-text);
                    border-bottom: 2px solid transparent;
                }

                .preview-tabs button.active {
                    color: var(--primary-color);
                    border-bottom-color: var(--primary-color);
                }

                .preview-body h3 {
                    margin-bottom: 15px;
                    color: var(--dark-text);
                }

                .db-instance, .api-instance {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 15px;
                    background: #f9f9f9;
                    border-radius: var(--radius);
                    margin-bottom: 15px;
                }

                .db-info, .api-info {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .db-info i, .api-info i {
                    font-size: 24px;
                    color: var(--primary-color);
                }

                .db-info div, .api-info div {
                    display: flex;
                    flex-direction: column;
                }

                .db-info span, .api-info span {
                    font-size: 14px;
                    color: var(--light-text);
                }

                .db-actions, .api-actions {
                    display: flex;
                    justify-content: center;
                    margin-top: 20px;
                }

                @media (max-width: 968px) {
                    .hero {
                        flex-direction: column;
                        text-align: center;
                        padding: 60px 0;
                    }

                    .hero-buttons {
                        justify-content: center;
                    }

                    .hero-content h1 {
                        font-size: 36px;
                    }

                    .hero-content p {
                        font-size: 18px;
                    }
                }
            `}</style>
        </section>
    )
}