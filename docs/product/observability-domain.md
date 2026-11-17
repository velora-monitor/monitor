# Observability domain

Velora Monitor records HTTP availability for URLs a user owns, opens an incident after a configured failure streak, and resolves that incident on the next success.

## Persisted vocabulary

These strings are the contract across SQL, Zod, and Go.

| Layer | Field | Values |
| --- | --- | --- |
| Check result | `status` | `up`, `down` |
| Incident | `state` | `open`, `resolved` |
| Health | `database` | `unconfigured`, `up`, `down` |
| Worker | `PROBE_MODE` | `off`, `fixture`, `http` |

An open incident has `resolved_at = null`. A resolved incident has a timestamp. `failure_count` is non-negative. `consecutive_failures` is non-negative. One monitor has at most one open incident.

## Display vocabulary

Screens use these words:

| Display | Meaning |
| --- | --- |
| Operational | Latest stored check is `up`, and no incident is open |
| Degraded | Latest stored check is `down`, and no incident is open (the streak is still under `failure_threshold`) |
| Unavailable | An incident is open |
| Pending | The monitor is enabled, storage is configured, and no check has been stored |
| Unknown | The system is not measuring, or the data cannot be interpreted. Includes `PROBE_MODE=off`, a missing database, and a status outside the enums |
| Recovering | Reserved. No column or enum value exists. Do not display it |

This mapping is the interface rule. It is not a database migration. Schema names stay on the persisted vocabulary until the owner approves a change. Recovering is listed so the product language stays stable, and it is unused until a real condition is defined.

Fail closed: a gap, a timeout, a fixture presented as live data, or an unexpected string becomes Unknown. It never becomes Operational.

## Time

`checked_at`, `opened_at`, `resolved_at`, `created_at`, and `updated_at` are `timestamptz`. Persist UTC. Format in the viewer's time zone at the edge, and include the zone when the audience is not obvious. Incident duration is `resolved_at - opened_at`. An open incident has a duration that ends at the current time and is labeled as ongoing.

## Transitions

`incident.Apply` is the decision.

- `down` increments the streak.
- The streak reaching `failure_threshold` opens an incident and sets `failure_count` to that streak.
- A further `down` while open attaches and increments `failure_count`.
- `up` while open resolves and clears the open pointer.
- `up` while closed is `none`.
- A threshold below 1 is an error.
- A status other than `up` or `down` is an error.

`planCheck` turns that outcome into a check row plus the incident write. The worker does not open an incident by setting columns ad hoc.

## Measurements

- The HTTP checker treats status codes 200–399 as `up` and other completed responses as `down`. An unfollowed 3xx is therefore stored as `up` even though the target was not measured. Leave that classification in place unless the task is probe semantics, and revisit it before live probes are a product feature.
- Transport errors are `down` and keep the error string. Context cancellation writes nothing.
- Redirects are not followed. The body is discarded after at most 1 MiB.

Fixture mode and an empty database are not uptime. The UI says so.

## What is not implemented

Uptime percentage, percentile latency, and regional checks are not in the schema. When uptime is added, the formula states the window, the sample interval, and the treatment of gaps. Missing samples are excluded or shown as unknown. They are not counted as `up`.
