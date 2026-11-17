# Isolation cases

The current tenant is `monitors.owner_id`. Run these when the data path exists. Mark a case `not run` when the route or table is not in the product yet.

## API

- Owner A lists monitors and sees only A's rows.
- Owner B calls the same list and sees none of A's rows.
- Owner B requests A's monitor id and receives the same response as for a random unknown id.
- Owner B lists incidents filtered by A's monitor id and receives an empty list.
- A request with no bearer token receives `401`.
- A body field named `ownerId` does not change the stored owner.

## Database

- As `authenticated` user B, `select` on A's monitor returns no row while RLS is forced.
- Inserting a monitor with `owner_id` set to A, while the session is B, fails the insert policy.
- A check result or incident whose monitor belongs to A is invisible to B.
- Two open incidents for one monitor fail `incidents_one_open_per_monitor_idx`.

## Worker

- A privileged connection writing a check uses the monitor id it loaded.
- A test or fixture cannot pass an arbitrary owner id that redirects the write onto another monitor.
- Job logs for A's check do not include B's rows.

## Cache

- A cache entry for A's monitor list is not served to B.
- Invalidating A's incident query does not clear B's cache entry unless the key is intentionally global and holds no row data.
