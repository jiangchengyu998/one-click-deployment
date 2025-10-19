// src/app/docs/register-login/page.tsx
"use client";
export default function RegisterLoginDocs() {
    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4 max-w-4xl">
                {/* 页面头部 */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        注册与登录指南
                    </h1>
                    <p className="text-xl text-gray-600">
                        了解如何在云朵平台创建账户并开始使用我们的服务
                    </p>
                </div>

                {/* 内容导航 */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">内容导航</h2>
                    <div className="flex flex-wrap gap-4">
                        <a href="#step1" className="text-blue-600 hover:text-blue-800 font-medium">
                            步骤一：填写注册信息
                        </a>
                        <a href="#step2" className="text-blue-600 hover:text-blue-800 font-medium">
                            步骤二：邮箱认证
                        </a>
                        <a href="#step3" className="text-blue-600 hover:text-blue-800 font-medium">
                            步骤三：登录使用
                        </a>
                    </div>
                </div>

                {/* 步骤一：填写注册信息 */}
                <section id="step1" className="bg-white rounded-lg shadow-sm p-8 mb-8">
                    <div className="flex items-center mb-6">
                        <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mr-4">
                            1
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">填写注册信息</h2>
                    </div>

                    <div className="prose max-w-none">
                        <p className="text-gray-700 mb-6">
                            首先，点击首页右上角的<strong>"免费注册"</strong>按钮，进入注册页面。
                        </p>

                        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
                            <p className="text-blue-800">
                                💡 <strong>提示：</strong> 请确保使用真实有效的邮箱地址，以便接收认证邮件。
                            </p>
                        </div>

                        <h3 className="text-xl font-semibold text-gray-900 mb-4">需要填写的字段：</h3>
                        <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                            <li><strong>邮箱地址</strong> - 用于登录和接收重要通知</li>
                            <li><strong>用户名</strong> - 在平台中显示的名称</li>
                            <li><strong>密码</strong> - 至少8位，包含字母和数字</li>
                            <li><strong>确认密码</strong> - 再次输入密码进行确认</li>
                        </ul>

                        <img
                            src="/images/register-form.png"
                            alt="注册表单页面"
                            className="rounded-lg shadow-md mb-6"
                        />

                        <div className="bg-green-50 border-l-4 border-green-500 p-4">
                            <p className="text-green-800">
                                ✅ <strong>完成此步骤后：</strong> 系统会向您填写的邮箱发送一封认证邮件。
                            </p>
                        </div>
                    </div>
                </section>

                {/* 步骤二：邮箱认证 */}
                <section id="step2" className="bg-white rounded-lg shadow-sm p-8 mb-8">
                    <div className="flex items-center mb-6">
                        <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mr-4">
                            2
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">邮箱认证</h2>
                    </div>

                    <div className="prose max-w-none">
                        <p className="text-gray-700 mb-6">
                            提交注册申请后，请登录您填写的邮箱查收认证邮件。
                        </p>

                        <h3 className="text-xl font-semibold text-gray-900 mb-4">操作步骤：</h3>
                        <ol className="list-decimal list-inside text-gray-700 mb-6 space-y-3">
                            <li>打开您的邮箱客户端（如Gmail、QQ邮箱、163邮箱等）</li>
                            <li>在收件箱中查找来自 <strong>noreply@yunduo.com</strong> 的邮件</li>
                            <li>邮件主题通常为 <strong>"请验证您的云朵平台账户"</strong></li>
                            <li>点击邮件中的 <strong>"验证邮箱"</strong> 或类似按钮/链接</li>
                        </ol>

                        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6">
                            <p className="text-yellow-800">
                                ⚠️ <strong>注意：</strong> 如果未收到邮件，请检查垃圾邮件文件夹，或等待几分钟后重试。
                            </p>
                        </div>

                        <img
                            src="/images/register-email.png"
                            alt="注册邮箱认证页面"
                            className="rounded-lg shadow-md mb-6"
                        />


                        <div className="bg-green-50 border-l-4 border-green-500 p-4">
                            <p className="text-green-800">
                                ✅ <strong>完成此步骤后：</strong> 您的账户已成功激活，可以登录使用平台服务。
                            </p>
                        </div>
                    </div>
                </section>

                {/* 步骤三：登录使用 */}
                <section id="step3" className="bg-white rounded-lg shadow-sm p-8 mb-8">
                    <div className="flex items-center mb-6">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mr-4">
                            3
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">登录使用</h2>
                    </div>

                    <div className="prose max-w-none">
                        <p className="text-gray-700 mb-6">
                            邮箱认证完成后，返回云朵平台首页，点击"登录"按钮进入登录页面。
                        </p>

                        <h3 className="text-xl font-semibold text-gray-900 mb-4">登录方式：</h3>
                        <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                            <li><strong>邮箱登录</strong> - 使用注册时填写的邮箱地址</li>
                            <li><strong>密码登录</strong> - 输入您设置的密码</li>
                        </ul>

                        {/* 登录页面截图占位符 */}
                        <img
                            src="/images/login-form.png"
                            alt="登录页面"
                            className="rounded-lg shadow-md mb-6"
                        />

                        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
                            <p className="text-blue-800">
                                🔐 <strong>安全提示：</strong> 请勿在公共设备上勾选"记住我"选项，以保护您的账户安全。
                            </p>
                        </div>

                        <h3 className="text-xl font-semibold text-gray-900 mb-4">登录后：</h3>
                        <p className="text-gray-700 mb-4">
                            成功登录后，您将进入云朵平台的控制台页面，可以开始：
                        </p>
                        <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                            <li>创建和管理数据库实例</li>
                            <li>部署API应用</li>
                            {/*<li>查看资源使用情况</li>*/}
                            <li>管理项目设置</li>
                        </ul>

                        {/* 控制台页面截图占位符 */}
                        {/*<div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-6">*/}
                            <img
                                src="/images/user-dashboad.png"
                                alt="登录页面"
                                className="rounded-lg shadow-md mb-6"
                            />
                        {/*    <p className="text-gray-500">用户控制台截图</p>*/}
                        {/*    <p className="text-sm text-gray-400 mt-1">展示登录成功后的控制台界面</p>*/}
                        {/*</div>*/}

                        <div className="bg-green-50 border-l-4 border-green-500 p-4">
                            <p className="text-green-800">
                                🎉 <strong>恭喜！</strong> 您已成功完成注册和登录流程，现在可以开始使用云朵平台的所有功能了。
                            </p>
                        </div>
                    </div>
                </section>

                {/* 常见问题 */}
                <section className="bg-white rounded-lg shadow-sm p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">常见问题</h2>

                    <div className="space-y-6">
                        <div className="border-b border-gray-200 pb-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                收不到认证邮件怎么办？
                            </h3>
                            <p className="text-gray-700">
                                请检查垃圾邮件文件夹，或将 noreply@yunduo.com 添加到您的联系人列表。如果仍然收不到，可以尝试重新发送认证邮件或联系客服。
                            </p>
                        </div>

                        <div className="border-b border-gray-200 pb-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                忘记密码怎么办？
                            </h3>
                            <p className="text-gray-700">
                                在登录页面点击"忘记密码"链接，输入您的邮箱地址，系统会发送密码重置邮件到您的邮箱。
                            </p>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                一个邮箱可以注册多个账户吗？
                            </h3>
                            <p className="text-gray-700">
                                每个邮箱地址只能注册一个云朵平台账户。如果您需要多个账户，请使用不同的邮箱地址注册。
                            </p>
                        </div>
                    </div>
                </section>

                {/* 导航链接 */}
                <div className="mt-12 flex justify-between">
                    <a
                        href="/docs"
                        className="flex items-center text-blue-600 hover:text-blue-800 font-medium"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        返回文档中心
                    </a>
                    <a
                        href="/docs/first-deployment"
                        className="flex items-center text-blue-600 hover:text-blue-800 font-medium"
                    >
                        下一篇：首次部署指南
                        <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </a>
                </div>
            </div>
        </div>
    );
}