# API security

The API is a Hono app created in `apps/api/src/app.ts`. Authenticated routes are mounted at `/v1`.

## Request handling

- Global middleware logs the request and applies the IP rate limit before the route.
- `TRUST_PROXY` must be true only behind a proxy that overwrites, rather than appends, the forwarding header. Otherwise the client chooses the rate-limit key.
- JSON bodies and queries pass Zod. `validationHook` returns `400` `invalid_request` and the first issue message.
- Unknown routes return `404` `not_found`. Unhandled errors return `500` `internal_error` after Sentry and the log line. The client does not receive the exception text.
- CORS is not wide open today because the server does not install a permissive CORS middleware. A future browser origin allowlist names the real web origin. `*` with credentials is rejected.

## Credentials

Public environment names:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_API_URL`

Server environment names include `DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SENTRY_DSN`, and `RESEND_API_KEY`. The service role key and the database URL are privileged. The anon key is public by Supabase's model and is still not a substitute for row-level security.

## Resource limits

- Rate limit: 60 requests per 60 seconds per IP, in process.
- Postgres client: `max: 1`, `connect_timeout: 5` in `createDatabase`.
- Responses for lists are the caller's rows only.
- A new endpoint that can return check history pages that result. It sets a statement timeout when the query can scan a large range.

## Webhooks and integrations

Resend is a dependency and is not wired as an inbound webhook in the current routes. An inbound provider route:

- Reads the raw body when the signature covers the raw bytes.
- Verifies the signature with the provider secret.
- Deduplicates the event id.
- Then writes.

## Browser client

`apps/web/src/lib/api.ts` attaches the bearer token and parses the response with the contract. A non-OK response throws. The client does not send the service role key. The Hono RPC types come from `@velora/api`, whose package export points at `dist`. Build the API before relying on those types.

## Headers

A production deployment sets HTTPS, a restrictive cookie policy if cookies are introduced, and a content security policy on the web origin. Those headers are a deployment task. The application code still avoids inline event handlers and unsanitized HTML so the policy can be strict.
