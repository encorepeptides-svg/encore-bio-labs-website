begin;

create extension if not exists pgtap with schema extensions;
select extensions.plan(21);

select extensions.ok(to_regclass('public.distributor_reconciliation_runs') is not null, 'reconciliation run history exists');
select extensions.ok(to_regclass('public.distributor_reconciliation_findings') is not null, 'reconciliation findings exist');
select extensions.ok(to_regprocedure('private.run_distributor_daily_reconciliation(text)') is not null, 'private reconciliation runner exists');
select extensions.ok((select relrowsecurity from pg_class where oid = 'public.distributor_reconciliation_runs'::regclass), 'run history has RLS enabled');
select extensions.ok((select relrowsecurity from pg_class where oid = 'public.distributor_reconciliation_findings'::regclass), 'findings have RLS enabled');
select extensions.ok(not has_function_privilege('anon', 'private.run_distributor_daily_reconciliation(text)', 'EXECUTE'), 'anonymous cannot run reconciliation');
select extensions.ok(not has_function_privilege('authenticated', 'private.run_distributor_daily_reconciliation(text)', 'EXECUTE'), 'authenticated users cannot run reconciliation directly');
select extensions.ok(has_function_privilege('service_role', 'private.run_distributor_daily_reconciliation(text)', 'EXECUTE'), 'service role can run reconciliation');
select extensions.is((select count(*) from cron.job where jobname = 'distributor-daily-reconciliation-v1'), 1::bigint, 'daily reconciliation has exactly one cron schedule');
select extensions.is((select schedule from cron.job where jobname = 'distributor-daily-reconciliation-v1'), '15 10 * * *', 'daily reconciliation runs at 10:15 UTC');
select extensions.ok(to_regclass('public.distributor_events_order_paid_monitor_idx') is not null, 'paid attribution reconciliation index exists');
select extensions.ok(to_regclass('public.distributor_payment_events_monitor_idx') is not null, 'payment event reconciliation index exists');
select extensions.ok(to_regclass('public.distributor_ledger_recovery_monitor_idx') is not null, 'recovery reconciliation index exists');

set local session_replication_role = replica;

insert into auth.users(
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values
  ('92000000-0000-4000-8000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'reconciliation-admin@example.test', '', now(), '{"provider":"email","providers":["email"]}', '{}', now(), now()),
  ('92000000-0000-4000-8000-000000000002', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'reconciliation-user@example.test', '', now(), '{"provider":"email","providers":["email"]}', '{}', now(), now());

insert into public.user_roles(user_id, role)
values ('92000000-0000-4000-8000-000000000001', 'admin');

insert into public.distributor_accounts(
  id, user_id, email, display_name, referral_code, status, onboarding_status,
  commission_rate_bps, payout_minimum_cents
) values (
  '91000000-0000-4000-8000-000000000001', null, 'reconciliation-partner@example.test',
  'Reconciliation Partner', 'RECON25', 'active', 'active', 2500, 10000
);

insert into public.storefront_orders(
  id, order_reference, status, channel, payment_method, items, subtotal_cents,
  paid_at, distributor_id, referral_code
) values (
  '93000000-0000-4000-8000-000000000001', 'RECONCILIATION-ORDER-1', 'paid',
  'checkout', 'test', '[]', 10000, now(), '91000000-0000-4000-8000-000000000001', 'RECON25'
);

set local session_replication_role = origin;

select private.run_distributor_daily_reconciliation('pgtap');

select extensions.is(
  (select status from public.distributor_reconciliation_runs where source = 'pgtap' order by started_at desc limit 1),
  'completed',
  'reconciliation completes successfully'
);
select extensions.ok(
  (select total_findings > 0 from public.distributor_reconciliation_runs where source = 'pgtap' order by started_at desc limit 1),
  'run summary records detected findings'
);
select extensions.is(
  (select count(*) from public.distributor_reconciliation_findings where run_id = (select id from public.distributor_reconciliation_runs where source = 'pgtap' order by started_at desc limit 1) and check_key = 'paid_order_without_sale' and entity_id = '93000000-0000-4000-8000-000000000001'),
  1::bigint,
  'paid attributed order without sale is detected exactly once'
);
select extensions.is(
  (select count(*) from public.distributor_reconciliation_findings where run_id = (select id from public.distributor_reconciliation_runs where source = 'pgtap' order by started_at desc limit 1) and check_key = 'paid_order_without_paid_attribution_event' and entity_id = '93000000-0000-4000-8000-000000000001'),
  1::bigint,
  'missing server-side paid attribution event is detected'
);
select extensions.is(
  (select status from public.storefront_orders where id = '93000000-0000-4000-8000-000000000001'),
  'paid',
  'reconciliation never mutates the source order'
);

set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"92000000-0000-4000-8000-000000000002","role":"authenticated","aal":"aal1"}', true);
select extensions.is((select count(*) from public.distributor_reconciliation_runs), 0::bigint, 'ordinary authenticated users cannot read reconciliation history');
select extensions.throws_ok(
  $$select private.run_distributor_daily_reconciliation('forbidden')$$,
  '42501',
  null,
  'ordinary authenticated users cannot invoke the private runner'
);

reset role;
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"92000000-0000-4000-8000-000000000001","role":"authenticated","aal":"aal2"}', true);
select extensions.ok((select count(*) > 0 from public.distributor_reconciliation_runs), 'administrator can read reconciliation history');

reset role;
select * from extensions.finish();
rollback;
