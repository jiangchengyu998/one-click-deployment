# 使用一个已包含 corepack 的 Node.js 官方镜像
FROM node:18-alpine AS base

# 声明构建参数
ARG SERVER_PORT=3000

# 阶段 1: 安装依赖
FROM base AS deps
RUN apk add --no-cache libc6-compat

WORKDIR /app

RUN corepack enable
COPY package.json pnpm-lock.yaml ./
RUN pnpm fetch --prod

# 阶段 2: 构建应用
FROM base AS builder
WORKDIR /app
RUN corepack enable

ENV NEXT_PUBLIC_MAIN_DOMAIN="xxxxx.xxx"
ENV NEXT_PUBLIC_MODE="opensource"

COPY package.json pnpm-lock.yaml ./
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN pnpm install --frozen-lockfile
RUN pnpx prisma generate
RUN pnpm run build

# 阶段 3: 准备运行环境
FROM node:18-alpine AS runner
WORKDIR /app
RUN corepack enable

# 再次声明 ARG，才能在此阶段使用
ARG SERVER_PORT=3000
ENV PORT=${SERVER_PORT}
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE ${PORT}

CMD ["node", "server.js"]
