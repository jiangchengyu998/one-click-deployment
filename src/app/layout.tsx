import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
    title: '云朵一键部署平台 - 简化您的应用部署流程',
    description: '云朵一键部署平台 - 简化数据库管理和API部署流程',
}

export default function RootLayout({ children }) {
    return (
        <html lang="zh-CN">
        <head>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" />
        </head>
        <body className={inter.className}>{children}</body>
        </html>
    )
}