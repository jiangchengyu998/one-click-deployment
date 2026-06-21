# 云朵一键部署平台

云朵一键部署平台是一套基于 Next.js、Prisma、MySQL、Docker 和 Jenkins 的轻量级应用部署控制台。平台面向个人开发者和小团队，提供用户注册、API 应用部署、数据库实例创建、部署日志查看、管理员后台等能力，目标是把“准备服务器、配置域名、触发构建、查看运行状态”这些重复工作收敛到一个可视化流程里。

在线托管版：[https://www.ydphoto.com](https://www.ydphoto.com)

![项目控制台示意图](docs/dashboard.png)

## 功能特性

- 一键部署 API 应用：用户提交 Git 仓库、分支、环境变量后，由 Jenkins 触发 Docker 化部署。
- 自动生成访问域名：默认格式为 `应用名-用户标识.主域名`，例如 `demo-hk.ydphoto.com`。
- 数据库实例管理：支持为用户创建、查看和删除 MySQL 数据库实例。
- 日志与状态查看：支持查看 Jenkins 构建日志、运行日志、部署节点和端口信息。
- 邮箱验证与通知：注册后发送验证邮件，部署状态变化后可发送邮件提醒。
- 用户控制台与管理员后台：用户管理自己的 API/数据库，管理员查看和维护全局资源。
- SaaS/开源模式切换：通过 `NEXT_PUBLIC_MODE` 控制是否启用 SaaS 相关 DNS/Nginx 流程。

## 项目主要流程

平台的核心思路是：Next.js 负责页面、接口、认证和资源记录；MySQL 保存用户、API、数据库和部署信息；Jenkins 负责真正的服务器侧创建、部署、删除动作；日志服务负责暴露运行日志。

```mermaid
flowchart LR
    User["用户"] --> Web["Next.js 控制台"]
    Admin["管理员"] --> Web
    Web --> Auth["JWT/Cookie 认证"]
    Web --> DB["MySQL + Prisma"]
    Web --> Jenkins["Jenkins Pipeline"]
    Jenkins --> Server["部署服务器 / Docker / K8s"]
    Web --> LogService["日志服务"]
    Server --> LogService
    Web --> Mail["SMTP 邮件通知"]
```

### 1. 用户注册与登录流程

1. 用户在 `/auth/register` 提交姓名、邮箱和密码。
2. 后端检查邮箱是否已注册，为用户生成唯一 `code` 和邮箱验证 Token。
3. 密码使用 `bcryptjs` 哈希后写入 MySQL。
4. 系统通过 SMTP 发送验证邮件，用户点击邮件链接后完成邮箱验证。
5. 用户登录成功后，后端签发 JWT，并写入 `user-token` Cookie。
6. `middleware.js` 会拦截 `/dashboard` 页面，未登录用户会被重定向到登录页。

### 2. API 一键部署流程

1. 用户进入 `/dashboard/apis` 创建 API，填写应用名称、Git 仓库地址、Git Token 和环境变量；分支字段当前模型默认值为 `main`，可在 API 详情页继续维护。
2. 后端根据用户配额判断是否允许创建，并生成访问域名：`应用名-用户code.NEXT_PUBLIC_MAIN_DOMAIN`。
3. 平台在 `apis` 表创建 API 记录，并在 `api_infor` 表分配执行节点、服务器 IP 和端口。
4. 如果 `NEXT_PUBLIC_MODE=saas`，平台会先调用 Jenkins 的 `add_rr` 和 `add_nginx_file`，创建 DNS 解析和 Nginx 配置。
5. 平台调用 Jenkins Job `deploy_api_by_k3s`，把 Git 地址、分支、端口、环境变量、API ID、回调地址等参数传给部署流水线。
6. API 状态更新为 `BUILDING`；如果 30 分钟后仍未完成，会自动标记为 `ERROR`。
7. Jenkins 完成部署后，平台通过回调或管理接口更新 API 状态、服务端口和运行信息。
8. 用户可以在 API 详情页查看部署状态、Jenkins 构建日志和运行日志。

```mermaid
sequenceDiagram
    participant U as 用户
    participant A as Next.js API
    participant D as MySQL
    participant J as Jenkins
    participant S as 部署服务器

    U->>A: 创建 API
    A->>D: 检查配额并创建 API 记录
    A->>D: 创建 api_infor，分配端口和节点
    A->>J: 触发 deploy_api_by_k3s
    J->>S: 拉取代码、构建镜像、启动服务
    A->>D: 标记状态为 BUILDING
    J-->>A: 回写部署结果
    A->>D: 更新状态和部署信息
    U->>A: 查看状态和日志
```

### 3. 数据库实例创建流程

1. 用户进入 `/dashboard/databases` 创建数据库，填写数据库名、用户名和密码。
2. 后端检查用户数据库配额，并在 `databases` 表创建状态为 `CREATING` 的记录。
3. 平台调用 Jenkins Job `create_mysql_user` 创建 MySQL 用户。
4. 平台延迟触发 Jenkins Job `create_mysql_database`，为该用户创建数据库。
5. 创建流程完成后，数据库状态更新为 `RUNNING`，用户可以在控制台查看连接信息。
6. 用户删除数据库时，平台调用 Jenkins Job `delete_mysql_database_and_user` 删除数据库和对应用户。

### 4. 日志查看流程

1. 构建日志来自 Jenkins，接口会读取 `deploy_api_by_k3s` 对应构建号的 `consoleText`。
2. 运行日志来自 `RSYSLOG_URL` 指向的日志服务，接口会读取 `${RSYSLOG_URL}/logs/{apiName}.log`。
3. 前端在 API 详情页聚合展示构建日志、运行日志、部署节点、服务端口和当前状态。

### 5. 管理员维护流程

1. 管理员通过 `/admin/login` 登录，成功后写入 `admin-token` Cookie。
2. `middleware.js` 会拦截 `/admin` 页面，未登录管理员会被重定向到管理员登录页。
3. 管理后台可以查看用户、API、数据库和平台概览。
4. 管理员可以维护 API 部署信息，触发重新部署，或查看特定 API 的日志。

## 技术栈

| 模块 | 技术 |
| --- | --- |
| 应用框架 | Next.js 15 App Router、React 19 |
| 样式 | Tailwind CSS 4 |
| 数据库 | MySQL、Prisma 6 |
| 认证 | JWT、Cookie、bcryptjs |
| 部署引擎 | Docker、Jenkins Pipeline |
| 邮件 | Nodemailer、163 SMTP |
| 日志 | Jenkins 日志、Rsyslog/自定义日志服务 |

## 目录结构

```text
.
├── Dockerfile                 # Next.js standalone 多阶段构建镜像
├── architecture.md            # 项目架构与代码现状分析
├── prisma/
│   └── schema.prisma          # Prisma 数据模型
├── scripts/
│   └── seed.ts                # 初始化默认管理员
├── src/
│   ├── app/
│   │   ├── admin/             # 管理后台页面
│   │   ├── api/               # Next.js Route Handlers
│   │   ├── auth/              # 用户登录、注册页面
│   │   ├── dashboard/         # 用户控制台
│   │   ├── docs/              # 平台使用文档
│   │   └── page.tsx           # 官网首页
│   ├── components/            # 页面和通用 UI 组件
│   ├── lib/                   # 认证、数据库、邮件、加密等工具
│   ├── middleware.js          # 用户端/管理端路由保护
│   └── saas/                  # SaaS 模式下的 DNS/Nginx Jenkins 调用
└── public/                    # 静态资源
```

## 环境要求

- Node.js 20+
- pnpm
- MySQL 8+
- Docker
- Jenkins
- 一个已备案并解析到服务器的主域名
- 可用的 SMTP 邮箱账号

> 仓库包含 `pnpm-lock.yaml`，推荐使用 pnpm。若使用 npm，需要自行保持锁文件和脚本一致。

## 快速开始

### 1. 克隆项目

```bash
git clone <your-repo-url>
cd one-click-deploy
```

### 2. 安装依赖

```bash
pnpm install
```

### 3. 配置环境变量

在项目根目录创建 `.env`：

```env
# MySQL
DATABASE_URL="mysql://root:password@localhost:3306/yunduo_db"

# 登录态与数据库密码加密
JWT_SECRET="replace-with-a-random-secret"
SECRET_KEY="12345678901234567890123456789012"

# 当前平台访问地址
NEXTAUTH_URL="http://localhost:3000"

# Jenkins
JENKINS_URL="http://localhost:8080"
JENKINS_USER="admin"
JENKINS_TOKEN="replace-with-your-jenkins-token"

# 邮件服务，目前代码中默认使用 smtp.163.com:465
SMTP_USER="your-email@163.com"
SMTP_PASSWORD="your-email-smtp-auth-code"
SMTP_FROM="your-email@163.com"

# 日志服务
RSYSLOG_URL="http://localhost:8081"

# 域名与部署模式
NEXT_PUBLIC_MAIN_DOMAIN="example.com"
NEXT_PUBLIC_MODE="opensource"
SERVER_IP="127.0.0.1"
```

关键变量说明：

| 变量 | 说明 |
| --- | --- |
| `DATABASE_URL` | Prisma 连接 MySQL 的地址。 |
| `JWT_SECRET` | 用户和管理员登录态 JWT 签名密钥。 |
| `SECRET_KEY` | 数据库密码 AES-256-CBC 加密密钥，需要 32 字节长度。 |
| `NEXTAUTH_URL` | 平台自身访问地址，用于邮件链接和 Jenkins 回调参数。 |
| `JENKINS_URL` | Jenkins 服务地址。 |
| `JENKINS_USER` / `JENKINS_TOKEN` | Jenkins Basic Auth 凭据。 |
| `SMTP_USER` / `SMTP_PASSWORD` / `SMTP_FROM` | 注册验证邮件和部署通知邮件配置。 |
| `RSYSLOG_URL` | 运行日志服务地址，接口会读取 `${RSYSLOG_URL}/logs/{apiName}.log`。 |
| `NEXT_PUBLIC_MAIN_DOMAIN` | 用户 API 和数据库访问时展示/生成的主域名。 |
| `NEXT_PUBLIC_MODE` | `opensource` 或 `saas`。`saas` 会额外触发 DNS、Nginx 等 Jenkins 任务。 |
| `SERVER_IP` | 创建 API 部署信息时写入的默认服务器 IP。 |

### 4. 初始化数据库

```bash
pnpm exec prisma generate
pnpm exec prisma db push
pnpm exec prisma db seed
```

种子脚本会创建默认管理员：

```text
用户名：admin
密码：admin
```

### 5. 启动开发服务

```bash
pnpm dev
```

访问：

- 首页：`http://localhost:3000`
- 用户登录：`http://localhost:3000/auth/login`
- 用户注册：`http://localhost:3000/auth/register`
- 用户控制台：`http://localhost:3000/dashboard`
- 管理后台：`http://localhost:3000/admin/login`

## Jenkins 任务约定

平台通过 Jenkins 执行实际部署和资源管理。开源自部署时，需要提前准备对应的 Pipeline Job，并确保 Job 名称与代码中的调用一致。

当前代码会调用以下 Jenkins Job：

| Job 名称 | 用途 |
| --- | --- |
| `deploy_api_by_k3s` | 拉取用户 Git 仓库并部署 API 应用。 |
| `delete_api` | 删除已部署的 API 应用。 |
| `create_mysql_user` | 创建 MySQL 用户。 |
| `create_mysql_database` | 创建 MySQL 数据库。 |
| `delete_mysql_database_and_user` | 删除数据库和用户。 |
| `add_rr` | SaaS 模式下添加域名解析记录。 |
| `add_nginx_file` | SaaS 模式下生成或更新 Nginx 配置。 |

Jenkins 安装与 Pipeline 示例可参考：[Jenkins 安装配置指南](https://github.com/jiangchengyu998/jenkins-pipeline-shared/blob/master/README.md)

## Docker 构建

项目已配置 Next.js standalone 输出，可直接构建运行镜像：

```bash
docker build \
  --build-arg NEXT_PUBLIC_MAIN_DOMAIN=example.com \
  --build-arg NEXT_PUBLIC_MODE=opensource \
  --build-arg SERVER_PORT=3000 \
  -t one-click-deploy .
```

运行容器时需要传入运行期环境变量：

```bash
docker run --rm -p 3000:3000 \
  --env-file .env \
  one-click-deploy
```

> 生产环境请确保 MySQL、Jenkins、日志服务和 SMTP 都可以从容器内访问。

## 常用命令

```bash
# 开发
pnpm dev

# 构建
pnpm build

# 生产启动
pnpm start

# 生成 Prisma Client
pnpm exec prisma generate

# 同步数据库结构
pnpm exec prisma db push

# 执行种子数据
pnpm exec prisma db seed
```

## 注意事项

- `SECRET_KEY` 必须是 32 字节字符串，否则数据库密码加解密会失败。
- 注册流程依赖 SMTP，邮件配置不可用时用户创建会回滚。
- 真实 API 部署、删除、数据库创建等操作依赖 Jenkins Job，只有前端页面启动并不代表部署链路已完整可用。
- `NEXT_PUBLIC_MODE=saas` 会触发额外的域名解析和 Nginx 配置流程，开源自部署场景建议先使用 `opensource`。
- `next.config.ts` 会把 `JENKINS_URL` 和 `JENKINS_TOKEN` 注入构建环境，生产环境请谨慎管理镜像和构建日志权限。

## 更多文档

- 架构说明：[architecture.md](architecture.md)
- 平台使用文档：启动项目后访问 `/docs`
- Jenkins Pipeline：[jenkins-pipeline-shared](https://github.com/jiangchengyu998/jenkins-pipeline-shared)

## 联系方式

欢迎反馈问题、建议和使用体验。

- 邮箱：jchengyu0829@163.com
- 微信：JChengYu0829

如果这个项目对你有帮助，欢迎给个 Star 支持一下。
