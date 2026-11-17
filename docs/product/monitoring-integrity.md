# Monitoring integrity

A monitoring product is wrong when it reports success it did not observe. These rules keep the record honest.

## Calculations

- Uptime, once implemented, publishes the numerator, the denominator, and the window. Example shape: successful stored checks divided by stored checks in the window, with gaps listed separately. Copy that shape only after the owner accepts the formula.
- Averages of latency ignore null latency. They do not treat null as zero.
- Incident length uses the stored timestamps. Rounding is disclosed (for example, to the second) and applied the same way in the list and the chart.
- Two checks with the same monitor and the same `checked_at` are a defect. The writer uses the check time it was given and does not silently drop a failure to hide a duplicate.
- Clock source for stored times is the database `timestamptz` or the worker clock passed into `planCheck`. The browser clock does not rewrite history.

## State changes

- The threshold comparison uses `failure_threshold` on the monitor row, not a constant in the UI.
- Resolving an incident sets `resolved_at` and clears `monitors.open_incident_id` in the same plan.
- A `down` result after resolve starts a new streak. It does not reopen the old incident id.
- Disabled monitors are not shown as Operational merely because they are quiet. If checks stop, the display moves toward Unknown or Pending according to `docs/product/observability-domain.md`.

## Presentation

- The screen distinguishes a stored measurement, a fixture, and the absence of data.
- Stale data shows the last `checked_at`. A live-updating panel does not move surrounding layout.
- Response time is labeled with its unit. Milliseconds are the stored unit (`latency_ms`).
- Empty charts say that no checks have been stored. They do not draw a zero line that implies downtime or perfect uptime.
- Historical reports use the timestamps in the database. Changing a monitor's interval does not rewrite older rows.

## Failure handling

- A probe error stores `down` when the check ran and failed.
- A cancelled context stores nothing.
- A database error while saving a failure retries or surfaces the error. It does not convert the sample to `up`.
- Partial writes that could leave an open incident without a check, or a check without its incident update, are a bug. `planCheck` exists so those writes stay one plan.

## Consistency

SQL checks, Zod enums, and Go constants are the same set. A new status is added to all three and to this document in one change. The display mapping is updated in the same change if the user-facing word changes.
