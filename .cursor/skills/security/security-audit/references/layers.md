# Layers

Check the layers the diff touches.

## Input

- Zod or an equivalent parser runs before the handler uses the value.
- SQL and pgx calls pass parameters.
- HTML output is text. `v-html` and `innerHTML` with monitor data are findings.
- A user-controlled path is not joined onto a filesystem root.

## Authentication

- `requireUser` wraps the route, or the route is intentionally public and listed as such.
- The token is checked with `getUser`, not with an unsigned decode.
- Signup or profile updates cannot set a role.

## Authorization

- The store predicate uses the authenticated user id.
- A by-id read returns the same not-found shape for a missing row and another owner's row.
- The worker updates the monitor it loaded.

## Secrets

- New `VITE_` names are only the URL, anon key, or API URL.
- Logs and Sentry context omit the bearer token.
- `.env` is not staged.

## Outbound requests

- Redirects stay disabled unless the new code re-validates the destination.
- Private, loopback, and link-local targets are denied before a user-supplied URL can be probed.
- The response body remains capped.

## Limits

- History responses are limited.
- Authentication flows have their own rate limit when they are exposed.
- Webhook handlers verify a signature and an event id before writing.

## Payments and AI

If the diff adds either, the server recomputes the decision. The client does not assert success. Model output is parsed and treated as untrusted. If the diff adds neither, say so.
