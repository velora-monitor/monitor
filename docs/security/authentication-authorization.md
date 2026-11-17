# Authentication and authorization

Authentication answers who is calling. Authorization answers which monitors they may touch. The two stay separate.

## Current behavior

- The web app signs in with Supabase email and password through `createSupabaseGateway`. The client is created with the anon key.
- The session store keeps the access token in memory via the gateway. Supabase is configured to persist its own session and to ignore session data in the URL.
- The router sends an unauthenticated visitor to `sign-in` only when Supabase is configured. With an unconfigured project, the shell still renders so local boot works.
- The API reads `Authorization: Bearer <jwt>`, calls `auth.getUser`, and sets `userId`. A missing or rejected token returns `401` with `unauthorized`.
- List methods take that `userId` and filter `monitors.owner_id`. Incidents join back to the same owner.
- There is no role column, no admin API, and no signup route in the Vue router.

## Requirements for new work

- A new authenticated route uses `requireUser`. It passes `c.get("userId")` into the store.
- The body cannot override `ownerId`. Inserts set the owner from the token.
- `getUser` stays on the server. The client-decoded JWT is not the authorization decision.
- An admin capability, if the product adds one, is stored server-side and checked server-side. Public signup parameters cannot grant it.
- Password reset, email change, and OTP, if added, are Supabase flows with rate limits. Tokens from those flows are single-use and expire.
- Redirects after authentication are named routes. A `next` query value is accepted only when it is a relative path on the known route list.
- Brute-force protection on sign-in is required before a public deployment. The global API limiter is not a substitute for an authentication limiter.

## Service credentials

`SUPABASE_SERVICE_ROLE_KEY` is in `.env.example` and is not read by `readConfig` today. If a server path starts using it, that client is constructed on the server, never imported by `apps/web`, and never prefixed with `VITE_`. The service role bypasses row-level security, so every call still includes the owner constraint or is limited to a worker job that already loaded the monitor.
