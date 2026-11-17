begin;

create extension if not exists pgtap with schema extensions;

select plan(3);

insert into auth.users (id, email)
values
  ('11111111-1111-1111-1111-111111111111', 'owner@example.com'),
  ('22222222-2222-2222-2222-222222222222', 'other@example.com');

set local role authenticated;
set local request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';

insert into public.monitors (owner_id, name, url, interval_seconds, failure_threshold)
values (
  '11111111-1111-1111-1111-111111111111',
  'Example',
  'https://example.com',
  60,
  2
);

select results_eq(
  'select count(*) from public.monitors',
  array[1::bigint],
  'the owner sees their monitor'
);

set local request.jwt.claim.sub = '22222222-2222-2222-2222-222222222222';

select results_eq(
  'select count(*) from public.monitors',
  array[0::bigint],
  'another owner sees nothing'
);

set local role anon;

select results_eq(
  'select count(*) from public.monitors',
  array[0::bigint],
  'anonymous requests see no monitors'
);

select * from finish();

rollback;
