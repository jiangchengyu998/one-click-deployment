// src/app/layout.js
import './globals.css'
import MainNav from "@/components/home/MainNav";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { LanguageProvider } from "@/components/i18n/LanguageProvider";
import { detectLocale, getDictionary } from "@/lib/i18n";
import { headers } from "next/headers";

export async function generateMetadata() {
    const headerList = await headers();
    const locale = detectLocale(headerList.get('accept-language') || '');
    const dictionary = getDictionary(locale);

    return {
        title: dictionary.metadata.title,
        description: dictionary.metadata.description,
    };
}

export const dynamic = 'force-dynamic';

export default async function RootLayout({ children } : { children: React.ReactNode }) {
    const headerList = await headers();
    const locale = detectLocale(headerList.get('accept-language') || '');

    return (
        <html lang={locale === 'zh' ? 'zh-CN' : 'en'} className="scroll-smooth">
        <head>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" />
        </head>
        <body className="bg-[#f8f9fa] text-[#333] [font-family:Segoe_UI,Tahoma,Geneva,Verdana,sans-serif]">
        <LanguageProvider locale={locale}>
            <AuthProvider>
                {/* Main navigation is hidden on admin, dashboard, and auth pages */}
                <MainNav />
                <PageTransition>{children}</PageTransition>
                <Footer />
            </AuthProvider>
        </LanguageProvider>
        </body>
        </html>
    )
}
