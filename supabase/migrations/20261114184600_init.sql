create table public.monitors (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  url text not null,
  interval_seconds integer not null,
  failure_threshold integer not null,
  enabled boolean not null default true,
  consecutive_failures integer not null default 0,
  open_incident_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint monitors_name_check check (char_length(name) > 0),
  constraint monitors_url_check check (char_length(url) > 0),
  constraint monitors_interval_seconds_check check (interval_seconds > 0),
  constraint monitors_failure_threshold_check check (failure_threshold >= 1),
  constraint monitors_consecutive_failures_check check (consecutive_failures >= 0)
);

create table public.check_results (
  id uuid primary key default gen_random_uuid(),
  monitor_id uuid not null references public.monitors (id) on delete cascade,
  status text not null,
  status_code integer,
  latency_ms integer,
  error text,
  checked_at timestamptz not null default now(),
  constraint check_results_status_check check (status in ('up', 'down')),
  constraint check_results_status_code_check check (
    status_code is null or status_code between 100 and 599
  ),
  constraint check_results_latency_ms_check check (
    latency_ms is null or latency_ms >= 0
  )
);

create table public.incidents (
  id uuid primary key default gen_random_uuid(),
  monitor_id uuid not null references public.monitors (id) on delete cascade,
  state text not null,
  opened_at timestamptz not null default now(),
  resolved_at timestamptz,
  failure_count integer not null default 0,
  constraint incidents_state_check check (state in ('open', 'resolved')),
  constraint incidents_failure_count_check check (failure_count >= 0),
  constraint incidents_resolved_at_check check (
    (state = 'open' and resolved_at is null)
    or (state = 'resolved' and resolved_at is not null)
  )
);

alter table public.monitors
  add constraint monitors_open_incident_id_fkey
  foreign key (open_incident_id)
  references public.incidents (id)
  on delete set null
  deferrable initially deferred;

create index monitors_owner_id_idx on public.monitors (owner_id);

create index check_results_monitor_id_checked_at_idx
  on public.check_results (monitor_id, checked_at desc);

create index incidents_monitor_id_state_idx on public.incidents (monitor_id, state);

create unique index incidents_one_open_per_monitor_idx
  on public.incidents (monitor_id)
  where state = 'open';

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger monitors_set_updated_at
before update on public.monitors
for each row
execute function public.set_updated_at();

revoke all on function public.set_updated_at() from public;
revoke all on function public.set_updated_at() from anon, authenticated;

alter table public.monitors enable row level security;
alter table public.monitors force row level security;
alter table public.check_results enable row level security;
alter table public.check_results force row level security;
alter table public.incidents enable row level security;
alter table public.incidents force row level security;

grant select, insert, update, delete on table public.monitors to authenticated;
grant select, insert, update, delete on table public.check_results to authenticated;
grant select, insert, update, delete on table public.incidents to authenticated;

grant all on table public.monitors to service_role;
grant all on table public.check_results to service_role;
grant all on table public.incidents to service_role;

create policy monitors_select_own
on public.monitors
for select
to authenticated
using (owner_id = auth.uid());

create policy monitors_insert_own
on public.monitors
for insert
to authenticated
with check (owner_id = auth.uid());

create policy monitors_update_own
on public.monitors
for update
to authenticated
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

create policy monitors_delete_own
on public.monitors
for delete
to authenticated
using (owner_id = auth.uid());

create policy check_results_select_own
on public.check_results
for select
to authenticated
using (
  exists (
    select 1
    from public.monitors
    where monitors.id = check_results.monitor_id
      and monitors.owner_id = auth.uid()
  )
);

create policy check_results_insert_own
on public.check_results
for insert
to authenticated
with check (
  exists (
    select 1
    from public.monitors
    where monitors.id = check_results.monitor_id
      and monitors.owner_id = auth.uid()
  )
);

create policy check_results_update_own
on public.check_results
for update
to authenticated
using (
  exists (
    select 1
    from public.monitors
    where monitors.id = check_results.monitor_id
      and monitors.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.monitors
    where monitors.id = check_results.monitor_id
      and monitors.owner_id = auth.uid()
  )
);

create policy check_results_delete_own
on public.check_results
for delete
to authenticated
using (
  exists (
    select 1
    from public.monitors
    where monitors.id = check_results.monitor_id
      and monitors.owner_id = auth.uid()
  )
);

create policy incidents_select_own
on public.incidents
for select
to authenticated
using (
  exists (
    select 1
    from public.monitors
    where monitors.id = incidents.monitor_id
      and monitors.owner_id = auth.uid()
  )
);

create policy incidents_insert_own
on public.incidents
for insert
to authenticated
with check (
  exists (
    select 1
    from public.monitors
    where monitors.id = incidents.monitor_id
      and monitors.owner_id = auth.uid()
  )
);

create policy incidents_update_own
on public.incidents
for update
to authenticated
using (
  exists (
    select 1
    from public.monitors
    where monitors.id = incidents.monitor_id
      and monitors.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.monitors
    where monitors.id = incidents.monitor_id
      and monitors.owner_id = auth.uid()
  )
);

create policy incidents_delete_own
on public.incidents
for delete
to authenticated
using (
  exists (
    select 1
    from public.monitors
    where monitors.id = incidents.monitor_id
      and monitors.owner_id = auth.uid()
  )
);
