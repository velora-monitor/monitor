FROM node:26.13.1-bookworm-slim AS build

WORKDIR /repo
ENV CI=true

RUN npm install -g pnpm@12.18.0

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY apps/web/package.json apps/web/package.json
COPY apps/api/package.json apps/api/package.json
COPY apps/worker/package.json apps/worker/package.json
COPY packages/contracts/package.json packages/contracts/package.json
COPY packages/config/package.json packages/config/package.json

RUN pnpm install --frozen-lockfile --filter @velora/web...

COPY apps/web apps/web
COPY apps/api apps/api
COPY packages/contracts packages/contracts
COPY packages/config packages/config

RUN pnpm --filter @velora/contracts build \
  && pnpm --filter @velora/api build \
  && pnpm --filter @velora/web build \
  && test -f apps/web/dist/index.html

FROM nginx:1.30.6-alpine AS runtime

ENV PROBE_MODE=off

COPY --from=build /repo/apps/web/dist /usr/share/nginx/html
COPY <<'EOF' /etc/nginx/conf.d/default.conf
server {
  listen 80;
  server_name _;
  root /usr/share/nginx/html;

  location / {
    try_files $uri $uri/ /index.html;
  }
}
EOF

EXPOSE 80
