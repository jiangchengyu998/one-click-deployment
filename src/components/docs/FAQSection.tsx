
/* FAQ */
export default function FAQSection() {
    const faqs = [
        {
            q: "收不到认证邮件怎么办？",
            a: "请检查垃圾邮件文件夹，或将 jchengyu0829@163.com 添加到联系人列表。如果仍未收到，请尝试重新发送认证邮件或联系客服。",
        },
        {
            q: "忘记密码怎么办？",
            a: "在登录页面点击「忘记密码」链接，输入邮箱地址后，系统会发送重置邮件。",
        },
        {
            q: "一个邮箱可以注册多个账户吗？",
            a: "每个邮箱仅可注册一个账户。如需多个，请使用不同邮箱注册。",
        },
    ];

    return (
        <section className="bg-white rounded-lg shadow p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">常见问题</h2>
            <div className="divide-y divide-gray-200">
                {faqs.map((f, i) => (
                    <div key={i} className="py-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{f.q}</h3>
                        <p className="text-gray-700">{f.a}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}
