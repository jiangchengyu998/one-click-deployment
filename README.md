# ☁️ 云朵一键部署平台

> 一款轻量、灵活的云端应用自动化部署平台，让开发者一键完成应用部署无需复杂的证书配置。  
> 为用户的每一个应用（api）生成一个专有的三级域名，比如 [https://demo-hk.ydphoto.com](https://demo-hk.ydphoto.com)

---

## 🧭 项目简介

**云朵一键部署平台（[https://www.ydphoto.com](https://www.ydphoto.com)）** 致力于简化云端部署流程。  
它基于阿里云，集成容器化自动部署、自动配置三级域名、日志查看和状态监控等核心功能，让部署像点一下按钮一样简单。

![dashboard.png](docs/dashboard.png)
*项目控制台示意图*

---

## ✨ 功能特性

- 🚀 **一键部署**：支持 Docker 一键部署
- 🔑 **为每个应用生成专有三级域名**：如 [https://demo-hk.ydphoto.com](https://demo-hk.ydphoto.com)，自动配置 DNS
- 🧩 **可扩展模板系统**：自定义Dockerfile与环境变量
- 🔧 **持续集成支持**：与 Jenkins 无缝集成
- 📊 **实时日志与部署日志**
- 🪶 **轻量运行**：仅需 Docker 即可运行，无需复杂依赖

---

##  🛠️ 技术栈
| 模块   | 技术                 |
|------|--------------------|
| 前端/后端 | Nextjs + TailwindCSS |
| 数据库  | MySQL              |
| 部署引擎 | Docker             |
| 自动化  | Jenkins            |
| 云服务  | 阿里云                |

---

## 🚀 快速开始

### 先决条件

- 已注册阿里云账号，购买ECS实例，购买域名并备案
- 已安装 Docker
- 已安装 Jenkins ==> [Jenkins 安装配置指南](https://github.com/jiangchengyu998/jenkins-pipeline-shared/blob/master/README.md)
- 已安装 Node.js 和 npm
- 已安装 MySQL 数据库

### 安装步骤
1. 克隆代码库：
   ```bash
   git clone https://github.com/yourusername/yunduo-deploy-platform.git
   cd yunduo-deploy-platform
    ```
2. 安装依赖：
   ```bash
   npm install
   ```
3. 配置环境变量：
   创建 `.env` 文件，添加以下内容：
   ```env
    DATABASE_URL="mysql://root:root@localhost:3306/yunduo_db"
    # 用于 JWT 加密, 请替换为你的密钥,可自定义
    JWT_SECRET="your-jwt-secret"
    NEXTAUTH_URL="http://localhost:3000"
    NEXTAUTH_SECRET="your-nextauth-secret"
    SECRET_KEY="your-secret-key"
    # 你的Jenkins 配置信息, 请替换为你的实际值
    JENKINS_TOKEN="xxxxxxxxxxxxxxxx"
    JENKINS_URL="http://localhost:8080"
    JENKINS_USER="jcy"
    SMTP_HOST=smtp.163.com
    SMTP_PORT=465
    SMTP_USER="你的163邮箱账号"
    SMTP_PASSWORD="你的163邮箱密码"
    SMTP_FROM="你的163邮箱账号"
    RSYSLOG_URL=http://localhost:8081
    # 你备案好的主域名, 请替换为你的实际值
    NEXT_PUBLIC_MAIN_DOMAIN="yourdomain.com"
    NEXT_PUBLIC_MODE=opensource
    SERVER_IP=localhost
   ```
4. 初始化数据库：
   ```bash
   npm run db:init
   ```
5. 启动应用：
   ```bash
   npm run dev
   ```
6. 访问应用：
   打开浏览器，访问 `http://localhost:3000`

---

## 不想买服务器？传送门 ^.^ [云端托管服务](https://www.ydphoto.com)！

---

## 如果你觉得不错，欢迎给个⭐️支持我！

---

## 联系我们欢迎任何形式的反馈和建议！
- 邮箱: jchengyu0829@163.com
- 微信: JChengYu0829
