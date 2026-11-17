FROM node:26.13.1-bookworm-slim AS build

WORKDIR /repo
ENV CI=true

RUN npm install -g pnpm@12.18.0

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY apps/worker/package.json apps/worker/package.json
COPY packages/contracts/package.json packages/contracts/package.json
COPY packages/config/package.json packages/config/package.json

RUN pnpm install --frozen-lockfile --filter @velora/api...

COPY apps/api apps/api
COPY packages/contracts packages/contracts
COPY packages/config packages/config

RUN pnpm --filter @velora/contracts build \
  && pnpm --filter @velora/api build \
  && pnpm --filter @velora/api deploy --prod /out \
  && test -f /out/dist/index.js \
  && test -f /out/node_modules/@velora/contracts/dist/index.js

FROM node:26.13.1-bookworm-slim AS runtime

WORKDIR /app
ENV NODE_ENV=production
ENV PROBE_MODE=off
ENV PORT=3001

COPY --from=build /out/ ./

USER node
EXPOSE 3001
CMD ["node", "dist"]
