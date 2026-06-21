// src/app/layout.js
import './globals.css'
import MainNav from "@/components/home/MainNav";
import Footer from "@/components/Footer";

export const metadata = {
    title: '云朵一键部署平台 - 简化您的应用部署流程',
    description: '云朵一键部署平台 - 简化数据库管理和API部署流程',
}

export default function RootLayout({ children } : { children: React.ReactNode }) {
    return (
        <html lang="zh-CN" className="scroll-smooth">
        <head>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" />
        </head>
        <body className="bg-[#f8f9fa] text-[#333] [font-family:Segoe_UI,Tahoma,Geneva,Verdana,sans-serif]">
        {/* 只在非管理员/非控制台页面显示主导航 */}
        <MainNav />
        {children}
        <Footer />
        </body>
        </html>
    )
}
