// src/app/docs/page.tsx
"use client";
export default function Docs() {
    const docCategories = [
        {
            title: '快速开始',
            icon: 'fas fa-rocket',
            items: [
                { name: '注册与登录', href: '/docs/register-login', description: '创建您的第一个账户' },
                { name: '首次部署指南', href: '/docs/first-deployment', description: '完成您的第一次部署' }
            ]
        },
        {
            title: '数据库管理',
            icon: 'fas fa-database',
            items: [
                { name: '创建数据库实例', href: '/docs/create-db-instance', description: '一键创建和管理数据库' },
                { name: '数据库连接', href: '/docs/db-connection', description: '获取连接信息和凭据' },
            ]
        },
        {
            title: 'API部署',
            icon: 'fas fa-code',
            items: [
                { name: '部署项目', href: '/docs/deploy-project', description: '将您的项目部署到云朵平台' },
                { name: 'Dockerfile配置', href: '/docs/dockerfile-configuration', description: '自定义构建配置' },
            ]
        }
    ];

    return (
        <div className="docs-page">
            <div className="container">
                <div className="docs-header">
                    <h1>文档中心</h1>
                    <p>全面的使用指南和最佳实践，帮助您充分利用云朵平台</p>
                    {/*<div className="search-box">*/}
                    {/*    <input*/}
                    {/*        type="text"*/}
                    {/*        placeholder="搜索文档..."*/}
                    {/*        className="search-input"*/}
                    {/*    />*/}
                    {/*    <i className="fas fa-search"></i>*/}
                    {/*</div>*/}
                </div>

                <div className="docs-grid">
                    {docCategories.map((category, index) => (
                        <div key={index} className="docs-category">
                            <div className="category-header">
                                <i className={category.icon}></i>
                                <h2>{category.title}</h2>
                            </div>
                            <div className="docs-list">
                                {category.items.map((item, itemIndex) => (
                                    <a key={itemIndex} href={item.href} className="doc-item">
                                        <div className="doc-content">
                                            <h3>{item.name}</h3>
                                            <p>{item.description}</p>
                                        </div>
                                        <i className="fas fa-chevron-right"></i>
                                    </a>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/*<div className="docs-support">*/}
                {/*    <div className="support-card">*/}
                {/*        <i className="fas fa-question-circle"></i>*/}
                {/*        <h3>需要帮助？</h3>*/}
                {/*        <p>我们的技术支持团队随时为您服务</p>*/}
                {/*        <div className="support-buttons">*/}
                {/*            <button className="btn btn-primary">*/}
                {/*                <i className="fas fa-envelope"></i>*/}
                {/*                联系支持*/}
                {/*            </button>*/}
                {/*            <button className="btn btn-outline">*/}
                {/*                <i className="fab fa-github"></i>*/}
                {/*                GitHub Issues*/}
                {/*            </button>*/}
                {/*        </div>*/}
                {/*    </div>*/}
                {/*</div>*/}
            </div>

            <style jsx>{`
        .docs-page {
          padding: 80px 0;
          background: var(--light-bg);
          min-height: 100vh;
        }

        .docs-header {
          text-align: center;
          margin-bottom: 60px;
        }

        .docs-header h1 {
          font-size: 48px;
          margin-bottom: 20px;
          color: var(--dark-text);
        }

        .docs-header p {
          font-size: 20px;
          color: var(--light-text);
          max-width: 600px;
          margin: 0 auto 30px;
        }

        .search-box {
          position: relative;
          max-width: 500px;
          margin: 0 auto;
        }

        .search-input {
          width: 100%;
          padding: 15px 50px 15px 20px;
          border: 2px solid #e0e0e0;
          border-radius: 50px;
          font-size: 16px;
          transition: border-color 0.3s;
        }

        .search-input:focus {
          outline: none;
          border-color: var(--primary-color);
        }

        .search-box i {
          position: absolute;
          right: 20px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--light-text);
        }

        .docs-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 30px;
          margin-bottom: 60px;
        }

        .docs-category {
          background: var(--white);
          border-radius: 12px;
          padding: 30px;
          box-shadow: var(--shadow);
        }

        .category-header {
          display: flex;
          align-items: center;
          margin-bottom: 25px;
          padding-bottom: 15px;
          border-bottom: 2px solid #f5f5f5;
        }

        .category-header i {
          font-size: 24px;
          color: var(--primary-color);
          margin-right: 15px;
        }

        .category-header h2 {
          font-size: 24px;
          color: var(--dark-text);
        }

        .docs-list {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .doc-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 15px;
          border-radius: var(--radius);
          text-decoration: none;
          color: inherit;
          transition: background-color 0.3s;
        }

        .doc-item:hover {
          background: #f8f9fa;
        }

        .doc-content h3 {
          font-size: 16px;
          margin-bottom: 5px;
          color: var(--dark-text);
        }

        .doc-content p {
          font-size: 14px;
          color: var(--light-text);
          margin: 0;
        }

        .doc-item i {
          color: var(--light-text);
          transition: transform 0.3s;
        }

        .doc-item:hover i {
          transform: translateX(5px);
          color: var(--primary-color);
        }

        .docs-support {
          text-align: center;
          max-width: 500px;
          margin: 0 auto;
        }

        .support-card {
          background: var(--white);
          padding: 40px;
          border-radius: 12px;
          box-shadow: var(--shadow);
        }

        .support-card i {
          font-size: 48px;
          color: var(--primary-color);
          margin-bottom: 20px;
        }

        .support-card h3 {
          margin-bottom: 10px;
          color: var(--dark-text);
        }

        .support-card p {
          color: var(--light-text);
          margin-bottom: 25px;
        }

        .support-buttons {
          display: flex;
          gap: 15px;
          justify-content: center;
        }

        .support-buttons .btn {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        @media (max-width: 768px) {
          .docs-page {
            padding: 60px 0;
          }

          .docs-header h1 {
            font-size: 36px;
          }

          .docs-grid {
            grid-template-columns: 1fr;
          }

          .support-buttons {
            flex-direction: column;
          }
        }
      `}</style>
        </div>
    );
}