# Velora

Monorepo shell for Velora v0.1. The web app, API, and worker boot without live URL probes and without a running Supabase project.

## Requirements

- Node.js 26.13.1 or newer. `.nvmrc` is `26`.
- pnpm 12.18.0, from the `packageManager` field.
- Go 1.27.4 for the worker.

## Setup

```sh
pnpm install
```

Copy `.env.example` to `.env` when a database or Supabase project is available. Health checks and empty lists run without those values. `PROBE_MODE` defaults to `off`.

## Scripts

`pnpm dev` runs Turborepo `dev`: Vite for `@velora/web` (port 5173), `tsx watch src/index.ts` for `@velora/api` (port 3001), and `go run ./cmd/worker` for `@velora/worker`.

`pnpm start` runs Turborepo `start`, which builds first. The web app then runs `vite preview` (port 4173), the API runs `tsx src/index.ts` (port 3001), and the worker runs `dist/worker` when that binary exists.

`pnpm build`, `pnpm lint`, `pnpm format`, `pnpm format:check`, `pnpm typecheck`, `pnpm test`, and `pnpm test:e2e` also go through Turborepo. Lint is Oxlint with warnings denied. Format is Oxfmt. Typecheck is `tsc --noEmit` for the API and contracts, and `vue-tsc --noEmit` for the web app.

## Docker

`docker compose up` builds and starts the web static server, the API, and the worker. Probe mode is off and no database is required. The API listens with `node dist` and its health check stays ok while the database is unconfigured.

The web UI is published on port 8080. The API is published on port 3001.

## Layout

- `apps/web` is the Vue shell.
- `apps/api` is the Hono API.
- `apps/worker` is the Go worker.
- `packages/config` publishes the TypeScript, Oxlint, and Oxfmt config.
- `packages/contracts` publishes the Zod DTOs.
- `supabase` is the local Supabase CLI project. SQL migrations are the schema source.

## Engineering standards

Cursor rules live in `.cursor/rules/`. Agent skills live in `.cursor/skills/`. The reference set lives in `docs/`. The map and the known gaps are in `docs/engineering/instruction-system.md`.
