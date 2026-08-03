# syntax=docker/dockerfile:1

FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.7.0 --activate
WORKDIR /repo

FROM base AS build
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml* ./
COPY tsconfig.base.json ./
COPY packages ./packages
COPY apps/api ./apps/api
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @template/contracts run build
RUN pnpm --filter @template/api run build
RUN pnpm --filter @template/api deploy --prod /prod/api

FROM node:22-alpine AS runtime
ENV NODE_ENV=production
RUN addgroup -S apiapp && adduser -S apiapp -G apiapp
WORKDIR /app
COPY --from=build /prod/api ./
COPY --from=build /repo/apps/api/dist ./dist
RUN mkdir -p /app/uploads && chown -R apiapp:apiapp /app
USER apiapp
EXPOSE 4000
CMD ["node", "dist/server.js"]
