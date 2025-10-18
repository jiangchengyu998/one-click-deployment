// src/components/home/MainNav.js
"use client";

import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function MainNav() {
    const pathname = usePathname();

    // 在这些路径下不显示主导航
    const hideNavPaths = ['/admin', '/dashboard', '/auth'];
    const shouldHideNav = hideNavPaths.some(path => pathname.startsWith(path));

    if (shouldHideNav) {
        return null;
    }

    return (
        <header className="header">
            <div className="container">
                <nav className="navbar">
                    <div className="logo">
                        <Link href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}>
                            <i className="fas fa-cloud"></i>
                            <span>云朵一键部署平台</span>
                        </Link>
                    </div>
                    <ul className="nav-links">
                        <li><Link href="/#features">功能</Link></li>
                        <li><Link href="/#workflow">使用流程</Link></li>
                        {/*<li><Link href="/#pricing">定价</Link></li>*/}
                        <li><Link href="/#docs">文档</Link></li>
                    </ul>
                    <div className="auth-buttons">
                        <Link href="/auth/login" className="btn btn-outline">登录</Link>
                        <Link href="/auth/register" className="btn btn-primary">免费注册</Link>
                    </div>
                </nav>
            </div>
            <style jsx>{`
                .header {
                    background-color: var(--white);
                    box-shadow: var(--shadow);
                    position: sticky;
                    top: 0;
                    z-index: 100;
                }

                .navbar {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 15px 0;
                }

                .logo {
                    display: flex;
                    align-items: center;
                    font-size: 24px;
                    font-weight: 700;
                    color: var(--primary-color);
                }

                .logo i {
                    margin-right: 10px;
                    font-size: 28px;
                }

                .nav-links {
                    display: flex;
                    list-style: none;
                }

                .nav-links li {
                    margin-left: 30px;
                }

                .nav-links a {
                    text-decoration: none;
                    color: var(--dark-text);
                    font-weight: 500;
                    transition: color 0.3s;
                }

                .nav-links a:hover {
                    color: var(--primary-color);
                }

                .auth-buttons {
                    display: flex;
                    gap: 15px;
                }

                @media (max-width: 768px) {
                    .navbar {
                        flex-direction: column;
                        padding: 15px 0;
                    }

                    .nav-links {
                        margin: 20px 0;
                        flex-wrap: wrap;
                        justify-content: center;
                    }

                    .nav-links li {
                        margin: 0 15px 10px;
                    }
                }
            `}</style>
        </header>
    );
}