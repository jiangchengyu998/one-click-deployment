FROM node:20-alpine AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV NEXT_TELEMETRY_DISABLED=1

RUN apk add --no-cache libc6-compat openssl
RUN corepack enable

WORKDIR /app

# 阶段 1: 安装依赖
FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# 阶段 2: 构建应用
FROM base AS builder

ARG NEXT_PUBLIC_MAIN_DOMAIN="xxxxx.xxx"
ARG NEXT_PUBLIC_MODE="opensource"

ENV NEXT_PUBLIC_MAIN_DOMAIN=${NEXT_PUBLIC_MAIN_DOMAIN}
ENV NEXT_PUBLIC_MODE=${NEXT_PUBLIC_MODE}

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN pnpm exec prisma generate
RUN pnpm run build

# 阶段 3: 运行环境
FROM node:20-alpine AS runner

RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

ARG SERVER_PORT=3000
ENV PORT=${SERVER_PORT}
ENV HOSTNAME="0.0.0.0"
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE ${PORT}

CMD ["node", "server.js"]
