// src/app/auth/login/page.js
"use client";

import {Suspense, useEffect, useState} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function UserLogin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const message = searchParams.get("message");

    // 如果已登录，自动跳转
    useEffect(() => {
        const checkLogin = async () => {
            const response = await fetch("/api/auth/check-login");
            const data = await response.json();
            if (response.ok && data.isLoggedIn) {
                router.push("/dashboard");
            }
        };
        checkLogin();
    }, [router]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password, rememberMe }),
            });

            const data = await response.json();

            if (response.ok) {
                router.push("/dashboard");
            } else {
                setError(data.error || "登录失败，请检查邮箱和密码");
            }
        } catch (error) {
            setError("网络错误，请重试");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Suspense fallback={<div>加载中...</div>}>
            <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">
                    <div className="text-center">
                        <i className="fas fa-cloud text-blue-500 text-5xl mb-4"></i>
                        <h2 className="text-3xl font-extrabold text-gray-900">用户登录</h2>
                        <p className="mt-2 text-sm text-gray-600">
                            登录您的云朵平台账户
                        </p>
                    </div>

                    {message && (
                        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-md">
                            {message}
                        </div>
                    )}

                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        {error && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md">
                                {error}
                            </div>
                        )}

                        <div className="rounded-md shadow-sm -space-y-px">
                            <div>
                                <label htmlFor="email" className="sr-only">
                                    邮箱地址
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="username" // 关键点：让浏览器保存账号
                                    required
                                    className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                                    placeholder="邮箱地址"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            <div>
                                <label htmlFor="password" className="sr-only">
                                    密码
                                </label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password" // 关键点：让浏览器保存密码
                                    required
                                    className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                                    placeholder="密码"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label
                                    htmlFor="remember-me"
                                    className="ml-2 block text-sm text-gray-900"
                                >
                                    记住我
                                </label>
                            </div>

                            <div className="text-sm">
                                <a
                                    href="#"
                                    className="font-medium text-blue-600 hover:text-blue-500"
                                >
                                    忘记密码?
                                </a>
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                            >
                                {loading ? "登录中..." : "登录"}
                            </button>
                        </div>

                        <div className="text-center">
            <span className="text-sm text-gray-600">
              还没有账户?{" "}
                <Link
                    href="/auth/register"
                    className="font-medium text-blue-600 hover:text-blue-500"
                >
                立即注册
              </Link>
            </span>
                        </div>
                    </form>
                </div>
            </div>
        </Suspense>

    );
}
