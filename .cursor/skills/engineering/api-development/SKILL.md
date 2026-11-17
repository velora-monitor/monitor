---
name: api-development
description: Designs and implements Velora Monitor Hono endpoints with Zod contracts, bearer auth, and owner-scoped queries. Use when adding or changing an API route, contract, or the typed web client.
icon: code
color: blue
---

# API development

## When to use

The task adds or changes an HTTP endpoint, a contract in `@velora/contracts`, or `apps/web/src/lib/api.ts`.

## Workflow

1. Read `docs/security/api-security.md` and the closest existing route in `apps/api/src/routes/v1.ts`.
2. Change the Zod schema in `packages/contracts` first. Keep error bodies on `apiErrorSchema`.
3. Build contracts before typechecking dependents:

```sh
pnpm --filter @velora/contracts build
```

4. Add the Hono route. Authenticated behavior goes through `v1Routes`, which already applies `requireUser`. Read the caller with `c.get("userId")`.
5. Validate input with `zValidator` and `validationHook`. Parse output with the contract before `c.json`.
6. Extend the store method so the owner id is a parameter. When `deps.store` is null, return the same empty or not-configured behavior the neighboring route uses.
7. Update `apps/web/src/lib/api.ts` if the web app calls the route. The client is `hc<AppType>`.
8. Add Vitest coverage for 401, invalid input, and a second owner. Follow `docs/engineering/testing-standards.md`.

## Constraints

- Do not accept `ownerId` from the client.
- Do not return another owner's existence. Use an empty list or `404`.
- Do not put `DATABASE_URL` or the service role key in a `VITE_` variable.
- Keep the unconfigured boot path. Missing Supabase config rejects tokens. Missing database config does not crash the process.

## Verification

```sh
pnpm --filter @velora/contracts build
pnpm --filter @velora/api test
pnpm --filter @velora/api typecheck
pnpm --filter @velora/api lint
```

Run the web typecheck too when `api.ts` changed.

## References

- `docs/security/api-security.md`
- `docs/security/authentication-authorization.md`
- `docs/engineering/coding-standards.md`
- `apps/api/src/app.ts`
- `apps/api/src/runtime.ts`
