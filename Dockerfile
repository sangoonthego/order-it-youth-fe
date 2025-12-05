# Base image dùng Node 20 + Alpine
FROM node:20-alpine AS base

WORKDIR /app

# Bật corepack để dùng pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# ----------------------
# Stage 1: Install deps (có devDeps để chạy orval)
# ----------------------
FROM base AS deps

COPY package.json pnpm-lock.yaml* ./

RUN pnpm install --frozen-lockfile

# ----------------------
# Stage 2: Generate orval + build Next.js
# ----------------------
FROM base AS builder

ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Env build-time
COPY .env.production .env.production

# orval + build
RUN pnpm orval && pnpm run build

# ----------------------
# Stage 3: Runtime
# ----------------------
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable
RUN apk add --no-cache curl

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/package.json ./package.json
COPY --from=deps    /app/node_modules ./node_modules

EXPOSE 3000

# Giả sử script "start": "next start"
CMD ["pnpm", "start"]
