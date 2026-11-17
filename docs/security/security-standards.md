# Security standards

This is the canonical security reference. The always-on rule in `.cursor/rules/security-baseline.mdc` is the short form. Layer documents cover authentication, tenant isolation, the API, and privacy.

## Input

Validate every boundary: HTTP body, query, path, webhook JSON, uploaded file, and the URL a monitor will fetch.

- Zod contracts parse API input. Database checks backstop the invariants (non-empty name, positive interval, status enum).
- Queries use Drizzle or pgx parameters. A status filter is a bound value, not concatenated SQL.
- Render monitor names and error strings as text. A name that contains HTML or script is data.
- File uploads do not exist. When they do, they need an allowlist, a size limit, a stored name that the client did not choose, and no path that joins a user string onto a directory.
- Deserialization of monitor config stays in Zod or `encoding/json` into a struct. There is no dynamic code load.
- Prompt injection matters only after an AI feature exists. Monitored page bodies are hostile data even then. They do not become instructions.

## Authentication and authorization

Supabase Auth identifies the user. `requireUser` calls `getUser` with the bearer token and stores `userId`. Authorization is a separate check: the store filters by that id, and row-level security repeats the check for the `authenticated` role.

- Signup, when it is added, cannot accept a role, an owner id, or an admin flag from the client.
- Redirect targets after sign-in are internal routes. An open redirect parameter is rejected.
- The in-memory rate limit is 60 requests per minute per IP. Login attempts need their own limit when a public signup or recovery flow is added. The current limit is process-local.
- OTP and recovery flows are not implemented. Adding them includes attempt limits, expiry, and a single use.
- Session tokens are not written to Pino or Sentry payloads.

## Tenant isolation

The tenant is the owning user. See `docs/security/tenant-isolation.md`.

## Payments

No payment code exists. A future billing change:

- Prices and entitlements are read on the server.
- Provider webhooks are signature-checked and idempotent.
- A client "payment succeeded" flag does not unlock a plan.
- Quantities are positive integers. A replay of the same provider event does not apply twice.

## API and infrastructure

See `docs/security/api-security.md`.

- `.env` is gitignored. `.env.example` contains empty values.
- `VITE_` variables are public. The allowlist is the Supabase URL, the anon key, and the API URL.
- Webhooks, when added, reject a missing or invalid signature before any write.
- Sentry is initialized only when `SENTRY_DSN` is set. The DSN stays on the server.
- Dependabot and CodeQL already run. A new service gets the same treatment.
- History queries have a limit. The rate limiter and database timeouts bound resource use.
- AI endpoints, if added, have a quota, a cost ceiling, a tool allowlist, and a schema for structured model output. Model text is untrusted.

## Outbound checks

The worker's HTTP checker does not follow redirects and caps the body at 1 MiB. It does not block private, loopback, or link-local addresses. That is a known gap. `PROBE_MODE=http` stays off for user-supplied URLs until the checker denies those destinations and re-validates any future redirect.

## Logging

Request logs include method, path, status, and duration. They omit the bearer token, cookies, and the full target URL when that URL embeds credentials. Monitor URLs may be logged when required to debug a check, without user secrets.

## Supply chain

pnpm is pinned. CI uses a frozen lockfile. Go modules are checked in `apps/worker/go.sum`. A new binary tool is added as a Go tool or a catalogued npm package, not a curl-to-shell step.
