FROM node:22-alpine AS build
WORKDIR /workspace
RUN corepack enable
COPY package.json pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
RUN pnpm install --frozen-lockfile=false
COPY apps/web apps/web
RUN pnpm --filter @colocare/web build

FROM caddy:2-alpine
COPY apps/web/Caddyfile /etc/caddy/Caddyfile
COPY --from=build /workspace/apps/web/dist /usr/share/caddy
EXPOSE 80
