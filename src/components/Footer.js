"use client";
export default function Footer() {
    const footerLinks = {
        platform: [
            { name: '关于我', href: '#' },
            // { name: '博客', href: '#' },
            // { name: '职业机会', href: '#' },
            // { name: '联系我们', href: '#' }
        ],
        product: [
            { name: '功能', href: '#' },
            // { name: '定价', href: '#' },
            // { name: '文档', href: '#' },
            // { name: '状态', href: '#' }
        ],
        support: [
            { name: '帮助中心', href: '#' },
            // { name: '社区论坛', href: '#' },
            // { name: 'API文档', href: '#' },
            // { name: '服务条款', href: '#' }
        ],
        social: [
            { name: 'GitHub', href: 'https://github.com/jiangchengyu998/one-click-deployment', icon: 'fab fa-github' },
            // { name: 'Twitter', href: '#', icon: 'fab fa-twitter' },
            // { name: '微博', href: '#', icon: 'fab fa-weibo' },
            // { name: '知乎', href: '#', icon: 'fab fa-zhihu' }
        ]
    }

    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-content">
                    <div className="footer-column">
                        <h3>云朵平台</h3>
                        <ul className="footer-links">
                            {footerLinks.platform.map((link, index) => (
                                <li key={index}><a href={link.href}>{link.name}</a></li>
                            ))}
                        </ul>
                    </div>
                    <div className="footer-column">
                        <h3>产品</h3>
                        <ul className="footer-links">
                            {footerLinks.product.map((link, index) => (
                                <li key={index}><a href={link.href}>{link.name}</a></li>
                            ))}
                        </ul>
                    </div>
                    <div className="footer-column">
                        <h3>支持</h3>
                        <ul className="footer-links">
                            {footerLinks.support.map((link, index) => (
                                <li key={index}><a href={link.href}>{link.name}</a></li>
                            ))}
                        </ul>
                    </div>
                    <div className="footer-column">
                        <h3>关注我们</h3>
                        <ul className="footer-links">
                            {footerLinks.social.map((link, index) => (
                                <li key={index}><a href={link.href} target="_blank"><i className={link.icon}></i> {link.name}</a></li>
                            ))}
                        </ul>
                    </div>
                </div>
                <div className="copyright">
                    <p>&copy; 2025 云朵一键部署平台. 保留所有权利.</p>
                </div>
            </div>
            <style jsx>{`
        .footer {
          background: #2c3e50;
          color: var(--white);
          padding: 60px 0 30px;
        }
        
        .footer-content {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 40px;
          margin-bottom: 40px;
        }
        
        .footer-column h3 {
          margin-bottom: 20px;
          font-size: 18px;
        }
        
        .footer-links {
          list-style: none;
        }
        
        .footer-links li {
          margin-bottom: 10px;
        }
        
        .footer-links a {
          color: #bdc3c7;
          text-decoration: none;
          transition: color 0.3s;
        }
        
        .footer-links a:hover {
          color: var(--white);
        }
        
        .footer-links i {
          margin-right: 5px;
        }
        
        .copyright {
          text-align: center;
          padding-top: 30px;
          border-top: 1px solid #34495e;
          color: #bdc3c7;
          font-size: 14px;
        }
        
        @media (max-width: 768px) {
          .footer {
            padding: 40px 0 20px;
          }
          
          .footer-content {
            grid-template-columns: repeat(2, 1fr);
            gap: 30px;
          }
        }
      `}</style>
        </footer>
    )
}