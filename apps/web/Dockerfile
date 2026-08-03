# syntax=docker/dockerfile:1

FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.7.0 --activate
WORKDIR /repo

FROM base AS build
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml* ./
COPY tsconfig.base.json ./
COPY packages ./packages
COPY apps/web ./apps/web
ARG NEXT_PUBLIC_API_URL=http://localhost:4000
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @template/contracts run build
RUN pnpm --filter @template/web run build

FROM node:22-alpine AS runtime
ENV NODE_ENV=production
RUN addgroup -S webapp && adduser -S webapp -G webapp
WORKDIR /app
COPY --from=build /repo/apps/web/public ./apps/web/public
COPY --from=build /repo/apps/web/.next/standalone ./
COPY --from=build /repo/apps/web/.next/static ./apps/web/.next/static
USER webapp
EXPOSE 3000
CMD ["node", "apps/web/server.js"]
