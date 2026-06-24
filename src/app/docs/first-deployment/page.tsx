import DocLayout from "@/components/docs/DocLayout";
import Alert from "@/components/docs/Alert";
import Image from "next/image";
import { ReactNode } from "react";

const steps = [
    { id: "repository", title: "准备代码仓库", number: 1 },
    { id: "runtime", title: "确认构建方式", number: 2 },
    { id: "create-api", title: "创建应用服务", number: 3 },
    { id: "verify", title: "验证部署结果", number: 4 },
];

export default function ApiDeploymentDocs() {
    return (
        <DocLayout
            title="部署应用"
            subtitle="从代码仓库到线上访问地址，按这四步完成一次应用自动部署。"
            steps={steps}
            prev={{ href: "/docs", label: "文档中心" }}
            next={{ href: "/docs/create-db-instance", label: "数据库连接" }}
        >
            <Step id="repository" number={1} title="准备代码仓库">
                <p>
                    将项目推送到 GitHub、Gitee 或 GitLab。平台部署时会按您填写的仓库地址和分支拉取代码，所以仓库里的主分支需要保持可构建状态。
                </p>

                <Checklist
                    items={[
                        "仓库地址可以在浏览器中正常打开",
                        "分支名称准确，例如 main、master 或 release",
                        "项目根目录包含启动所需文件，例如 package.json、pom.xml 或 Dockerfile",
                        "私有仓库已准备访问 Token"
                    ]}
                />

                <Image
                    src="/images/first-deploy/demo-repo.png"
                    alt="代码仓库示例"
                    width={900}
                    height={500}
                    className="rounded-lg border border-gray-200 shadow-sm"
                    loading="lazy"
                />
            </Step>

            <Step id="runtime" number={2} title="确认构建方式">
                <p>
                    如果项目已有 Dockerfile，平台会优先使用它构建镜像。没有 Dockerfile 时，平台会尝试按常见项目结构生成构建配置。
                </p>

                <Alert
                    type="info"
                    text="建议生产项目显式提交 Dockerfile，这样端口、启动命令和依赖版本都更可控。"
                />

                <p>Spring Boot 项目可以参考下面的 Dockerfile：</p>

                <CodeBlock>
{`FROM maven:3.8.7-eclipse-temurin-8 AS builder
WORKDIR /build
COPY pom.xml .
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn clean package -DskipTests

FROM eclipse-temurin:8-jre AS runtime
ARG SERVER_PORT=8080
ENV TZ=Asia/Shanghai \\
    JAVA_OPTS="" \\
    SERVER_PORT=\${SERVER_PORT}
WORKDIR /app
COPY --from=builder /build/target/*.jar app.jar
EXPOSE \${SERVER_PORT}
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar /app/app.jar --server.port=\${SERVER_PORT}"]`}
                </CodeBlock>
            </Step>

            <Step id="create-api" number={3} title="创建应用服务">
                <p>
                    打开控制台的「部署新应用」页面，填写应用名称、仓库地址、分支和必要的环境变量。创建后平台会触发 Jenkins 拉取代码、构建镜像并发布服务。
                </p>

                <div className="my-6 grid grid-cols-2 gap-4 max-md:grid-cols-1">
                    <InfoItem label="应用名称" value="用于生成访问域名，建议使用小写字母和短横线" />
                    <InfoItem label="仓库地址" value="GitHub、Gitee 或 GitLab 的 HTTPS 地址" />
                    <InfoItem label="分支" value="默认 main，按项目实际分支填写" />
                    <InfoItem label="访问 Token" value="私有仓库必填，公开仓库可留空" />
                </div>

                <Alert
                    type="warning"
                    text="Spring Boot 环境变量通常使用大写和下划线，例如 spring.datasource.url 对应 SPRING_DATASOURCE_URL。"
                />

                <p>
                    数据库不是必须使用平台默认数据库。如果您已有阿里云 RDS、腾讯云数据库或自建 MySQL，直接把自己的数据库连接参数填到环境变量中即可。
                </p>

                <CodeBlock>
{`DB_HOST=<RDS 或自建数据库地址>
DB_PORT=3306
DB_NAME=<数据库名称>
DB_USER=<数据库用户名>
DB_PASSWORD=<数据库密码>`}
                </CodeBlock>

                <Alert
                    type="info"
                    text="使用云厂商 RDS 时，请确认安全组、白名单或公网访问配置允许平台部署后的服务访问该数据库。"
                />

                <Image
                    src="/images/first-deploy/first_deploy_api.png"
                    alt="创建应用服务页面"
                    width={900}
                    height={500}
                    className="rounded-lg border border-gray-200 shadow-sm"
                    loading="lazy"
                />
            </Step>

            <Step id="verify" number={4} title="验证部署结果">
                <p>
                    创建后应用会进入构建或部署状态。等待状态变为运行中后，打开系统生成的访问地址进行验证。如果页面或接口没有按预期响应，先查看构建日志和运行日志。
                </p>

                <Checklist
                    items={[
                        "状态为运行中",
                        "访问域名可以打开",
                        "日志中没有构建失败、端口占用或依赖缺失错误",
                        "需要数据库时，环境变量已填写并重新部署"
                    ]}
                />

                <Alert
                    type="success"
                    text="部署成功后，后续代码变更可以通过重新部署功能触发新的构建发布。"
                />
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

function Checklist({ items }: { items: string[] }) {
    return (
        <ul className="grid gap-3">
            {items.map((item) => (
                <li key={item} className="flex items-start gap-3 rounded-md bg-gray-50 px-4 py-3 max-sm:px-3">
                    <i className="fas fa-check mt-1 text-emerald-600"></i>
                    <span>{item}</span>
                </li>
            ))}
        </ul>
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
