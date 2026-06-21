ARG NODE_IMAGE=node:20-alpine

FROM ${NODE_IMAGE} AS base

ARG PNPM_VERSION=10.18.3

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV NEXT_TELEMETRY_DISABLED=1

RUN --mount=type=cache,id=apk-cache,target=/var/cache/apk \
    apk add --update-cache libc6-compat openssl
RUN corepack enable && corepack prepare pnpm@${PNPM_VERSION} --activate

WORKDIR /app

# 阶段 1: 安装依赖
FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm config set store-dir /pnpm/store && \
    pnpm install --frozen-lockfile --prefer-offline

# 阶段 2: 构建应用
FROM base AS builder

ARG NEXT_PUBLIC_MAIN_DOMAIN="ydphoto.com"
ARG NEXT_PUBLIC_MODE="opensource"

ENV NEXT_PUBLIC_MAIN_DOMAIN=${NEXT_PUBLIC_MAIN_DOMAIN}
ENV NEXT_PUBLIC_MODE=${NEXT_PUBLIC_MODE}

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN pnpm exec prisma generate
RUN --mount=type=cache,id=next-cache,target=/app/.next/cache \
    pnpm run build

# 阶段 3: 运行环境
FROM ${NODE_IMAGE} AS runner

RUN --mount=type=cache,id=apk-cache,target=/var/cache/apk \
    apk add --update-cache libc6-compat openssl

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
