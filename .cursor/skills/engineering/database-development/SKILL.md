---
name: database-development
description: Changes Velora Monitor Postgres migrations, the Drizzle mirror, indexes, and row-level security without breaking owner isolation. Use when editing SQL migrations, schema.ts, or worker persistence.
icon: code
color: blue
---

# Database development

## When to use

The task changes `supabase/migrations`, `apps/api/src/db/schema.ts`, or the worker store's SQL.

## Workflow

1. Read `docs/security/tenant-isolation.md` and the latest migration.
2. Add a new migration file. Do not edit a migration that has already been applied.
3. Mirror the table, checks, indexes, and policies in `apps/api/src/db/schema.ts` in the same change. The SQL file remains the schema source.
4. Enable and force row-level security. Policies for `authenticated` key off `auth.uid()` through `monitors.owner_id`.
5. Grant `authenticated` only the operations the policies allow. Leave `service_role` as the privileged grant.
6. Store instants as `timestamptz`. Keep non-empty and non-negative checks consistent with the Zod contract.
7. Preserve `incidents_one_open_per_monitor_idx`.
8. If the worker writes the new table, remember pgx bypasses RLS. Filter by the loaded monitor id.
9. Add or update a test that a second owner cannot see the rows. Use the cases in the tenant-isolation skill.

## Verification

- Diff the SQL and `schema.ts` side by side.
- `pnpm --filter @velora/api test`
- `pnpm --filter @velora/api typecheck`
- From `apps/worker`, `go test ./...` when store code changed.

There is no drizzle-kit migration workflow in this repo. Do not introduce one as a side effect.

## References

- `docs/security/tenant-isolation.md`
- `docs/engineering/architecture.md`
- `supabase/migrations/20261114184600_init.sql`
- `apps/api/src/db/schema.ts`
