# Architecture

Velora Monitor is an uptime and incident product split across a web app, an API, and a worker. v0.1 boots without a live database and without probing URLs.

## Applications

`apps/web` (`@velora/web`) is a Vite and Vue 3 single-page app. Routing uses Vue Router. Session state uses Pinia. Server data uses TanStack Query. The HTTP client is Hono's typed `hc` client bound to the API's `AppType`. Authentication in the browser uses the Supabase anon key through `src/lib/supabase.ts`. UI primitives are shadcn-vue (New York) on Reka UI, styled with Tailwind CSS 4. Icons come from Lucide. Charts use Chart.js.

`apps/api` (`@velora/api`) is a Hono server on `@hono/node-server`. `createRuntime` wires config, Sentry, Pino, a Drizzle store, and Supabase Auth. Missing `DATABASE_URL` yields a null store. Missing Supabase configuration yields an auth client that rejects every token. Authenticated routes live under `/v1` and currently list monitors and incidents. `/health` reports process and database reachability.

`apps/worker` (`@velora/worker`) is a Go 1.27 module. A scheduler ticks, a pool runs checks, and `incident.Apply` decides whether a result opens, attaches to, or resolves an incident. `PROBE_MODE` accepts `off`, `fixture`, and `http`.

`packages/contracts` publishes Zod schemas for monitors, incidents, check results, health, and API errors. Consumers import the built `dist` entry. Build contracts before typechecking dependents.

`packages/config` publishes shared TypeScript, Oxlint, and Oxfmt configuration.

## Data

Postgres is defined by `supabase/migrations`. The initial migration creates `monitors`, `check_results`, and `incidents`, forces row-level security, and policies every authenticated operation on `owner_id` or a join to it. Drizzle's `apps/api/src/db/schema.ts` mirrors that migration. The worker uses pgx and `DATABASE_URL`, which bypasses row-level security.

There is no organization, team, billing, or role table. The authenticated Supabase user is the owner.

## Delivery

Turborepo runs `dev`, `build`, `lint`, `format`, `typecheck`, `test`, and `test:e2e`. GitHub Actions runs that JavaScript gate, Playwright, gofmt, vet, staticcheck, and `go test`. CodeQL analyzes JavaScript/TypeScript and Go. Dependabot updates npm, Go modules, and Actions. Lefthook formats and lints staged TypeScript and Vue files. Docker Compose builds the three apps with probes off.

## Boundaries

- The browser receives the anon key and the API base URL. It does not receive the service role key or the database URL.
- The router guard redirects unauthenticated users to sign-in only when Supabase is configured. The API still checks the bearer token.
- Empty lists are a valid unconfigured state. They are not a successful measurement of a URL.
