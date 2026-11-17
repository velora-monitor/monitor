---
name: observability-domain-review
description: Reviews Velora Monitor uptime, incident transitions, timestamps, and the display-state mapping for measurement integrity. Use when changing checks, incidents, charts, health, or any status shown to users.
icon: beaker
color: cyan
---

# Observability domain review

## When to use

The change affects `incident.Apply`, `planCheck`, the HTTP checker, check or incident contracts, a status label, or a chart of measurements.

## Workflow

1. Read `docs/product/observability-domain.md` and `docs/product/monitoring-integrity.md`.
2. Compare persisted enums in the migration, `packages/contracts`, and `apps/worker/internal/incident/incident.go`. They stay `up`/`down` and `open`/`resolved`.
3. Trace a `down` result below the threshold, a `down` that opens, a `down` that attaches, and an `up` that resolves. The decision stays inside `incident.Apply`.
4. Confirm a transport error and a non-success status store `down`, and a cancelled context stores nothing.
5. Confirm timestamps written by the change are `timestamptz` or `time.Time` sourced from the worker or the database. The browser does not overwrite `checked_at`.
6. If the UI names a status, it uses Operational, Degraded, Unavailable, Unknown, or Pending through the mapping in the domain doc. Unknown data is not labeled Operational. Recovering is not shown.
7. If the change computes uptime or an average, the formula states the window and excludes missing samples from the success count. Null latency is not zero.
8. Fixture mode and `PROBE_MODE=off` are labeled as not measuring.

## Report

```markdown
# Observability review
## Persisted states
## Display mapping
## Transitions covered
## Integrity findings
## Formula
```

Leave Formula as "not introduced" when the diff does not add one.

## Verification

`go test ./...` from `apps/worker` for transition changes. Contract tests or `pnpm --filter @velora/api test` when schemas change. A UI label change cites the mapping branch that handles a missing sample.

## References

- `docs/product/observability-domain.md`
- `docs/product/monitoring-integrity.md`
- `apps/worker/internal/incident/incident.go`
- `apps/worker/internal/store/apply.go`
- `apps/worker/internal/checker/http.go`
