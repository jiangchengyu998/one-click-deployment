import DocLayout from "@/components/docs/DocLayout";
import Alert from "@/components/docs/Alert";
import Image from "next/image";
import { ReactNode } from "react";

const steps = [
    { id: "choose-database", title: "选择数据库来源", number: 1 },
    { id: "overview", title: "确认连接信息", number: 2 },
    { id: "client", title: "使用客户端连接", number: 3 },
    { id: "application", title: "接入应用配置", number: 4 },
    { id: "troubleshooting", title: "排查连接问题", number: 5 },
];

export default function DatabaseConnectionDocs() {
    return (
        <DocLayout
            title="数据库连接"
            subtitle="您可以使用平台自动创建的默认 MySQL 数据库，也可以接入自己的数据库，例如阿里云 RDS、腾讯云数据库或自建 MySQL。"
            steps={steps}
            prev={{ href: "/docs/first-deployment", label: "部署应用" }}
        >
            <Step id="choose-database" number={1} title="选择数据库来源">
                <p>
                    平台提供默认数据库是为了让新项目能快速跑通，但不是强制项。如果您已经有阿里云 RDS、腾讯云数据库、云服务器自建 MySQL 等数据库，可以直接使用自己的连接信息。
                </p>

                <div className="my-6 grid grid-cols-2 gap-4 max-md:grid-cols-1">
                    <InfoItem label="使用平台默认数据库" value="适合快速验证、演示项目和小型服务" />
                    <InfoItem label="使用自有数据库" value="适合已有生产数据、团队统一数据库或云厂商 RDS" />
                </div>

                <Alert
                    type="info"
                    text="使用自有数据库时，平台不会创建、修改或删除您的数据库，只负责把您填写的连接参数注入到应用服务环境变量中。"
                />
            </Step>

            <Step id="overview" number={2} title="确认连接信息">
                <p>
                    如果使用平台默认数据库，进入控制台的「我的数据库」页面，等待数据库状态变为「运行中」。默认数据库名称按 <code>用户代码_用户名</code> 生成，数据库密码与注册登录密码一致。
                </p>

                <Alert
                    type="info"
                    text="用户名会先转换为数据库安全格式：只保留小写字母、数字和下划线；中文、空格和特殊符号会被处理掉。如果用户名无法转换，会使用 user 作为名称片段，例如 ab_user。"
                />

                <div className="my-6 grid grid-cols-2 gap-4 max-md:grid-cols-1">
                    <InfoItem label="主机地址" value="数据库卡片中的主机字段" />
                    <InfoItem label="数据库名称" value="数据库卡片标题或详情页名称" />
                    <InfoItem label="用户名" value="数据库卡片中的用户名字段" />
                    <InfoItem label="密码" value="注册登录密码" />
                </div>

                <Image
                    src="/images/first-deploy/create-db.png"
                    alt="数据库连接信息页面"
                    width={900}
                    height={500}
                    className="mb-6 rounded-lg border border-gray-200 shadow-sm"
                    loading="lazy"
                />

                <Alert
                    type="info"
                    text="如果使用阿里云 RDS 等自有数据库，请在云厂商控制台复制内网或公网连接地址、端口、数据库名、用户名和密码，并确认安全组或白名单允许平台服务访问。"
                />
            </Step>

            <Step id="client" number={3} title="使用客户端连接">
                <p>
                    您可以使用 DBeaver、HeidiSQL、Navicat 或命令行连接数据库。平台默认数据库执行后输入注册登录密码；自有数据库则输入您在云厂商或自建 MySQL 中设置的密码。
                </p>

                <CodeBlock>
{`mysql -h <主机地址> -u <数据库用户名> -p <数据库名称>`}
                </CodeBlock>

                <p>
                    如果使用 DBeaver，创建 MySQL 连接后填入主机、数据库名、用户名和密码。部分 MySQL 版本需要在驱动属性中启用 <code>allowPublicKeyRetrieval=true</code>。
                </p>

                <Image
                    src="/images/first-deploy/dbserver.png"
                    alt="DBeaver 驱动属性设置"
                    width={900}
                    height={500}
                    className="mb-6 rounded-lg border border-gray-200 shadow-sm"
                    loading="lazy"
                />

                <Image
                    src="/images/first-deploy/connect-success.png"
                    alt="数据库连接成功"
                    width={900}
                    height={500}
                    className="rounded-lg border border-gray-200 shadow-sm"
                    loading="lazy"
                />
            </Step>

            <Step id="application" number={4} title="接入应用配置">
                <p>
                    推荐把数据库参数放到应用服务的环境变量里，不要写死在代码中。下面的变量既适用于平台默认数据库，也适用于阿里云 RDS 等自有数据库：
                </p>

                <CodeBlock>
{`DB_HOST=<主机地址>
DB_PORT=3306
DB_NAME=<数据库名称>
DB_USER=<数据库用户名>
DB_PASSWORD=<数据库密码>`}
                </CodeBlock>

                <p>Spring Boot 项目可以使用以下环境变量名称：</p>

                <CodeBlock>
{`SPRING_DATASOURCE_URL=jdbc:mysql://<主机地址>:<端口>/<数据库名称>?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=Asia/Shanghai
SPRING_DATASOURCE_USERNAME=<数据库用户名>
SPRING_DATASOURCE_PASSWORD=<数据库密码>`}
                </CodeBlock>

                <Alert
                    type="warning"
                    text="平台默认数据库的初始密码与注册登录密码一致；自有数据库的密码以您在数据库服务中设置的密码为准。更新平台登录密码不会自动修改数据库密码。"
                />
            </Step>

            <Step id="troubleshooting" number={5} title="排查连接问题">
                <ul className="space-y-3">
                    <li><strong>连接超时：</strong>确认主机地址是否正确，数据库状态是否为运行中。</li>
                    <li><strong>认证失败：</strong>确认用户名是否复制完整，密码是否为注册时的登录密码。</li>
                    <li><strong>RDS 无法访问：</strong>检查安全组、白名单、公网访问开关，以及数据库账号是否允许远程连接。</li>
                    <li><strong>Public Key 错误：</strong>在客户端或 JDBC URL 中添加 <code>allowPublicKeyRetrieval=true</code>。</li>
                    <li><strong>应用启动失败：</strong>检查环境变量是否已保存，并重新部署应用服务。</li>
                </ul>
            </Step>
        </DocLayout>
    );
}

function Step({ id, number, title, children }: { id: string; number: number; title: string; children: ReactNode }) {
    return (
        <section id={id} className="mb-8 scroll-mt-24 rounded-lg border border-gray-200 bg-white p-7 shadow-sm max-md:mb-5 max-md:scroll-mt-6 max-md:p-5 max-sm:p-4">
            <div className="mb-5 flex items-center gap-3 max-md:mb-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 font-semibold text-white max-sm:h-7 max-sm:w-7 max-sm:text-sm">
                    {number}
                </span>
                <h2 className="text-2xl font-bold text-gray-950 max-md:text-xl">{title}</h2>
            </div>
            <div className="space-y-5 leading-8 text-gray-700 max-md:space-y-4 max-md:text-[15px] max-md:leading-7">{children}</div>
        </section>
    );
}

function InfoItem({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-lg bg-gray-50 p-4 max-sm:p-3">
            <div className="mb-1 text-sm font-medium text-gray-500">{label}</div>
            <div className="font-medium text-gray-900">{value}</div>
        </div>
    );
}

function CodeBlock({ children }: { children: ReactNode }) {
    return (
        <pre className="-mx-1 overflow-x-auto rounded-lg bg-gray-950 p-4 text-sm leading-7 text-gray-100 max-sm:p-3 max-sm:text-xs max-sm:leading-6">
            <code>{children}</code>
        </pre>
    );
}
