/* 单步内容组件 */
import DocLayout from "@/components/docs/DocLayout";
import {JSX} from "react";
import Image from "next/image";
import Alert from "@/components/docs/Alert";


const steps = [
    { id: "step1", title: "将代码上传到GitHub", number: 1 },
    { id: "step2", title: "自定义Dockerfile(可选)", number: 2 },
    { id: "step3", title: "创建API-平台会自动部署", number: 3 },
];

export default function RegisterLoginDocs() {
    return (
        <DocLayout
            title="部署指南"
            subtitle="了解如何快速将您的应用部署到我们的平台"
            steps={steps}
            prev={{ href: "/docs", label: "返回文档中心" }}
            next={{ href: "/docs/create-db-instance", label: "下一篇：创建数据库实例" }}
        >
            {steps.map((s) => (
                <StepSection key={s.id} id={s.id} number={s.number} title={s.title} />
            ))}
        </DocLayout>
    );
}

function StepSection({
                         id,
                         number,
                         title,
                     }: {
    id: string;
    number: number;
    title: string;
}) {
    const images: Record<string, string> = {
        step1: "/images/first-deploy/demo-repo.png",
        // step2: "/images/dockerfile-example.png",
        step3: "/images/first-deploy/first_deploy_api.png",
    };

    const contentMap: Record<string, JSX.Element> = {
        step1: (
            <>
                <p className="mb-6">
                    将项目代码上传到 <strong>GitHub</strong> 或其他代码托管平台（如 Gitee、GitLab）。
                </p>

                <h3 className="text-xl font-semibold mt-6 mb-3">上传步骤：</h3>
                <ol className="list-decimal list-inside space-y-2 mb-6">
                    <li>在 GitHub 创建一个新的仓库。</li>
                    <li>将本地项目代码提交并推送至该仓库。</li>
                    <li>确保主分支（通常为 <code>main</code> 或 <code>master</code>）包含完整可运行的代码。</li>
                </ol>

                <Alert
                    type="info"
                    text="如果您的仓库是私有的，请前往 GitHub 个人设置中创建一个访问 Token（Personal Access Token）。"
                />

                <p className="mb-6">
                    在后续 <strong>创建 API</strong> 时，平台会需要您提供该 Token 以便访问代码。
                </p>

                <Image
                    src={images["step1"]}
                    alt="上传代码至 GitHub 示例"
                    width={900}
                    height={500}
                    className="rounded-lg shadow-md mb-6"
                    loading="lazy"
                />

                <Alert
                    type="success"
                    text="✅ 成功上传后，您可以在浏览器中访问自己的仓库地址，确认代码可见。"
                />
            </>
        ),

        step2: (
            <>
                <p className="mb-6">
                    接下来，您可以在项目根目录中编写一个 <strong>Dockerfile</strong> 文件，用于定义项目的构建与运行方式。
                </p>

                <Alert
                    type="info"
                    text="如果不熟悉 Docker，也可以跳过此步骤。平台会自动为常见框架（如 Node.js、Java、Python 等）生成 Dockerfile。"
                />

                <h3 className="text-xl font-semibold mt-6 mb-3">示例：springboot 项目</h3>

                <pre className="bg-gray-900 text-gray-100 text-sm p-4 rounded-lg mb-6 overflow-x-auto">
{`# ————————————————————————————————
# 第一阶段：编译 (Maven + JDK 8)
# ————————————————————————————————
FROM maven:3.8.7-eclipse-temurin-8 AS builder

# 声明构建参数
ARG SERVER_PORT

# 设置工作目录
WORKDIR /build

# 先复制 pom.xml 下载依赖，加快构建
COPY pom.xml .
RUN mvn dependency:go-offline -B

# 再复制源码
COPY src ./src

# 构建 jar 包（跳过测试可提高速度）
RUN mvn clean package -DskipTests

# ————————————————————————————————
# 第二阶段：运行 (JRE 8)
# ————————————————————————————————
FROM eclipse-temurin:8-jre AS runtime

# 构建参数，设置默认端口
ARG SERVER_PORT=8080

# 设置时区、工作目录和环境变量
ENV TZ=Asia/Shanghai \\
    JAVA_OPTS="" \\
    SERVER_PORT=\\$\\{SERVER_PORT\\}

WORKDIR /app

# 从构建阶段复制 jar
COPY --from=builder /build/target/*.jar app.jar

# 暴露端口
EXPOSE \\$\{SERVER_PORT\\}

# 启动命令使用环境变量
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar /app/app.jar --server.port=\\$\{SERVER_PORT\\}"]`}
                </pre>

                {/*<Image*/}
                {/*    src={images[id]}*/}
                {/*    alt="Dockerfile 示例图"*/}
                {/*    width={900}*/}
                {/*    height={500}*/}
                {/*    className="rounded-lg shadow-md mb-6"*/}
                {/*    loading="lazy"*/}
                {/*/>*/}

                <Alert
                    type="success"
                    text="💡 如果项目能在本地通过 Docker 构建并运行，那么部署时也一定能顺利执行。"
                />
            </>
        ),

        step3: (
            <>
                <p className="mb-6">
                    当代码上传完成后，就可以在平台中 <strong>创建 API 服务</strong> 了。平台会自动拉取您的代码并完成构建与部署。
                </p>

                <h3 className="text-xl font-semibold mt-6 mb-3">创建步骤：</h3>
                <ol className="list-decimal list-inside space-y-2 mb-6">
                    <li>在控制台中点击「<strong>创建 API</strong>」。</li>
                    <li>填写必要的参数：
                        <ul className="list-disc list-inside ml-6 mt-2">
                            <li>API 名称（例如：<code>my-first-api</code>）</li>
                            <li>仓库地址（GitHub/Gitee 等）</li>
                            <li>分支名称（默认为 <code>main</code>）</li>
                        </ul>
                    </li>
                    <li>根据需要添加环境变量，例如数据库连接、API Key 等。</li>
                    <li>点击「立即创建」，系统将自动开始部署。</li>
                </ol>

                <Alert
                    type="warning"
                    text="首次部署可能需要数分钟，请耐心等待。部署完成后可在日志中查看状态。"
                />

                <Image
                    src={images[id]}
                    alt="API 创建页面示意图"
                    width={900}
                    height={500}
                    className="rounded-lg shadow-md mb-6"
                    loading="lazy"
                />

                <Alert
                    type="success"
                    text="🎉 部署成功后，平台会显示访问地址，您即可通过浏览器访问自己的应用！"
                />
            </>
        ),
    };

    return (
        <section id={id} className="bg-white rounded-lg shadow p-8 mb-10 scroll-mt-24">
            <div className="flex items-center mb-6">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mr-4">
                    {number}
                </div>
                <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            </div>
            <div className="text-gray-700 leading-relaxed">{contentMap[id]}</div>
        </section>
    );
}
