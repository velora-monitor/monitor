---
name: tenant-isolation-audit
description: Verifies Velora Monitor owner boundaries across RLS policies, API queries, worker writes, and caches. Use when changing monitors, check results, incidents, store methods, or any future shared cache.
icon: shield
color: orange
---

# Tenant isolation audit

## When to use

The change reads or writes monitors, check results, incidents, or a cache of those rows. Also use it when introducing an organization or team concept.

## Workflow

1. Read `docs/security/tenant-isolation.md` and [references/cases.md](references/cases.md).
2. Confirm the schema still forces RLS and still keys policies off `auth.uid()` through `monitors.owner_id`.
3. Confirm API methods take `userId` from `requireUser` and apply it in the query. Search the diff for a client-supplied `ownerId`.
4. Confirm worker SQL uses the monitor id from `ListDue` or the equivalent loaded row. The pgx connection bypasses RLS.
5. Confirm a new cache key contains the owner id.
6. Add or run the denial test for a second user. A guessed UUID returns an empty list or `404`, not the row and not a 403 that admits the row exists.
7. If the change introduces organizations, stop and describe the membership model before writing policies. Do not add an `org_id` column from the client as the tenant key.

## Report

```markdown
# Tenant isolation
## Boundary
## Cases
- Case:
- Result: pass | fail | not run
- Evidence:
## Findings
```

## Verification

Cite the test command for every case marked pass. A case that was only inspected in code is `not run`, not `pass`.

## References

- [Isolation cases](references/cases.md)
- `docs/security/tenant-isolation.md`
- `apps/api/src/db/schema.ts`
- `apps/api/src/db/client.ts`
