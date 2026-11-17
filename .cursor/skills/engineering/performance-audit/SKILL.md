---
name: performance-audit
description: Investigates Velora Monitor rendering, bundle size, query shape, caching, and worker throughput before changing architecture. Use when a page, chart, API list, or check loop is slow or at risk of becoming slow.
icon: rocket
color: yellow
---

# Performance audit

## When to use

The user reports slowness, or a change adds a chart, a history query, polling, a cache, or a worker loop.

## Workflow

1. Read `docs/engineering/performance.md`.
2. Name the operation and how it will be measured (query count, response size, bundle chunk, tick duration). Record a baseline before editing.
3. Check the usual causes in this repo:
   - A history query without a limit or without `check_results_monitor_id_checked_at_idx`
   - A QueryClient default change that refetches the whole shell
   - Chart.js imported from the sign-in path
   - A tick that scans every historical check
   - An image or a font with no reserved space
4. Change the smallest layer that moves the measurement. Add an index, a limit, or a lazy import before adding a cache.
5. Re-measure with the same command. Write both numbers in the summary.

## Commands

```sh
pnpm --filter @velora/web build
pnpm --filter @velora/api test
```

Read the Vite build's chunk list for a route that should not contain Chart.js. For SQL, explain the filter and the index. Do not invent a timing you did not run.

## Constraints

- The in-memory rate limiter is process-local. Do not describe it as a global quota.
- Realtime updates invalidate one query key.
- Leave `refetchOnWindowFocus: false` and `retry: false` unless the task is that policy.

## Verification

The summary includes the baseline, the change, the after measurement, and what was not measured.

## References

- `docs/engineering/performance.md`
- `apps/web/src/lib/query-client.ts`
- `apps/api/src/db/client.ts`
