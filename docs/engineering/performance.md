# Performance

Measure the slow path, then change it. A cache, a virtualizer, or a new index needs a number or a clear bound it enforces.

## Web

- TanStack Query keys identify the resource and the viewer. The shared client does not refetch on window focus and does not retry. Change those defaults only in a caching task.
- A polling or realtime update invalidates the query it affects. It does not remount the shell.
- Route-level code can lazy-load Chart.js with the view that draws it. The sign-in screen does not need the chart bundle.
- Lists of historical checks are limited. The chart receives the points it plots.
- Images declare a size or a reserved box so the layout does not jump. Decorative motion follows `docs/design/motion-guidelines.md` and stays on `transform` and `opacity`.

## API

- List queries filter by `owner_id` and, for history, by monitor and time.
- A history endpoint has a limit. The existing indexes are `monitors_owner_id_idx`, `check_results_monitor_id_checked_at_idx`, and `incidents_monitor_id_state_idx`.
- The rate limiter is in memory, 60 requests per 60 seconds per client IP, and `TRUST_PROXY` controls whether forwarding headers are honored. A multi-instance deployment needs a shared limiter before those numbers can be treated as global.

## Worker

- Pool size and tick interval come from configuration. Defaults are 4 workers and 15 seconds.
- HTTP timeout defaults to 10 seconds. A check that exceeds it is a failure, not an unbounded wait.
- One tick loads due monitors and checks those. It does not scan unbounded history on the hot path.

## Builds

Production source maps stay off unless a release task explicitly publishes them to the error tracker. The Vite config currently leaves `build.sourcemap` unset. The API TypeScript build sets `sourceMap` false in the shared compiler options.

Record the command and the before/after figure in the change summary when a performance task claims an improvement.
