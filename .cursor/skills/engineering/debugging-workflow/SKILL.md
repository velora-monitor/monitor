---
name: debugging-workflow
description: Reproduces, isolates, and fixes Velora Monitor defects across the web app, API, worker, and database. Use when investigating a bug, a failing test, or an unexpected monitor state.
icon: bug
color: orange
---

# Debugging workflow

## When to use

A test fails, a screen shows the wrong state, or a check or incident transition looks wrong.

## Workflow

1. Restate the expected behavior from `docs/product/observability-domain.md` or the route's contract. Write down the actual behavior.
2. Reproduce with the smallest command: a Go test, a Vitest, or one HTTP call. Prefer a failing test over a manual-only repro.
3. Isolate the layer:
   - Browser: session store, router guard, and `src/lib/api.ts` parse
   - API: `requireUser`, validation hook, store filter
   - Worker: `checker`, `incident.Apply`, `planCheck`, scheduler tick
   - Database: migration checks and policies versus `schema.ts`
4. Inspect inputs at the boundary. A `down` result that becomes `up` is a domain bug. A second user's row appearing is an ownership bug.
5. Fix the cause. Do not special-case the symptom in the UI when the store is wrong.
6. Keep the failing test, and run the narrow suite plus the neighboring suite that shares the data.

## Local boot

`pnpm dev` starts Vite on port 5173, the API on port 3001, and the worker. Health and empty lists work without Supabase. `PROBE_MODE` stays `off` while debugging unrelated issues. Docker Compose publishes the web UI on port 8080.

## Verification

The new test fails before the fix and passes after. Record the command. If the defect cannot be reproduced, say what was tried and what evidence is missing. Do not claim it is fixed.

## References

- `docs/engineering/architecture.md`
- `docs/product/monitoring-integrity.md`
- `docs/engineering/testing-standards.md`
