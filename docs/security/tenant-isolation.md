# Tenant isolation

Velora Monitor isolates customers by authenticated user. `monitors.owner_id` references `auth.users`. Child tables (`check_results`, `incidents`) belong to a monitor. There is no organization, workspace, or tenant id. In these documents, "tenant" means that owner until an organization model is explicitly designed.

## Database

Row-level security is enabled and forced on all three tables. `authenticated` policies:

- Monitors: `owner_id = auth.uid()` for select, insert, update, and delete.
- Check results and incidents: an `exists` subquery to a monitor with the same owner.

`service_role` has full grants and bypasses policies. The worker's `DATABASE_URL` connection is in that privileged class. It must update the monitor id returned by `ListDue` and must not accept an owner id from a request.

The partial unique index `incidents_one_open_per_monitor_idx` prevents two open incidents for one monitor. It is also an integrity control. Keep it.

## API

`listMonitors` and `listIncidents` take the authenticated id. The incident list joins `monitors` and requires both the owner match and, when present, the monitor id. A future read or write follows the same shape: owner predicate in the query, then the contract parse.

A route that loads by id returns `404` when the id exists for another owner and when it does not exist. The two cases look the same to the client so owners cannot be enumerated.

## Cache and jobs

Any future cache key includes the owner id. A shared "latest status" cache without an owner is a cross-tenant leak.

Background jobs carry the monitor id they loaded from the database. They do not carry a client-supplied owner. Logs that include a monitor id are acceptable. Logs that dump another owner's rows are not.

## Tests

Every new read and write has a case for a second user. That case expects an empty list or a not-found response, including when the caller guesses a real UUID. The `tenant-isolation-audit` skill lists the cases.

## Future organizations

An organization model is a schema design, not a column added in passing. It needs its own membership table, policies that key off membership rather than a client-sent org id, and a migration plan for existing `owner_id` rows. Until that design lands, new tables use `owner_id`.
