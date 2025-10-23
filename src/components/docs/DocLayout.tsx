"use client";
import { ReactNode, useEffect, useState } from "react";
import DocSidebar from "./DocSidebar";
import DocHeader from "./DocHeader";
import DocFooterNav from "./DocFooterNav";

export default function DocLayout({
                                      title,
                                      subtitle,
                                      steps,
                                      children,
                                      prev,
                                      next,
                                  }: {
    title: string;
    subtitle: string;
    steps: { id: string; title: string; number: number }[];
    children: ReactNode;
    prev?: { href: string; label: string };
    next?: { href: string; label: string };
}) {
    const [activeId, setActiveId] = useState(steps[0]?.id || "");

    // 滚动与点击高亮逻辑
    useEffect(() => {
        document.documentElement.style.scrollBehavior = "smooth";
        let ticking = false;
        const observer = new IntersectionObserver(
            (entries) => {
                if (!ticking) {
                    window.requestAnimationFrame(() => {
                        const visible = entries
                            .filter((e) => e.isIntersecting)
                            .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
                        if (visible.length > 0) {
                            setActiveId(visible[0].target.id);
                        }
                        ticking = false;
                    });
                    ticking = true;
                }
            },
            { threshold: 0.3 }
        );
        steps.forEach((s) => {
            const el = document.getElementById(s.id);
            if (el) observer.observe(el);
        });

        return () => observer.disconnect();
    }, [steps]);

    return (
        <div className="min-h-screen bg-gray-50 py-10">
            <div className="container mx-auto px-4 max-w-5xl">
                <DocHeader title={title} subtitle={subtitle} />
                <div className="flex flex-col md:flex-row gap-10">
                    <DocSidebar steps={steps} activeId={activeId} />
                    <main className="flex-1">
                        {children}
                        <DocFooterNav prev={prev} next={next} />
                    </main>
                </div>
            </div>
        </div>
    );
}
