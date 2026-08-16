begin;

create extension if not exists pgtap with schema extensions;
select extensions.plan(32);

-- Deterministic high-volume fixture. Triggers/FKs are disabled only while the
-- isolated test transaction seeds rows; constraints and the tested RLS/RPCs
-- remain active when assertions execute.
set local session_replication_role = replica;

insert into public.distributor_accounts (
  id, user_id, email, display_name, referral_code, status, onboarding_status
) values
  ('10000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000001', 'alpha@example.test', 'Alpha', 'ALPHA', 'active', 'active'),
  ('10000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000002', 'beta@example.test', 'Beta', 'BETA', 'active', 'active');

insert into public.user_roles (user_id, role) values
  ('20000000-0000-4000-8000-000000000099', 'admin');

insert into public.distributor_referrals (
  id, distributor_id, storefront_order_id, created_at, updated_at, source, estimated_order_value_cents
)
select
  format('30000000-0000-4000-8000-%s', lpad(series::text, 12, '0'))::uuid,
  '10000000-0000-4000-8000-000000000001'::uuid,
  format('40000000-0000-4000-8000-%s', lpad(series::text, 12, '0'))::uuid,
  '2026-01-01T00:00:00Z'::timestamptz + make_interval(secs => series),
  '2026-01-01T00:00:00Z'::timestamptz + make_interval(secs => series),
  'referral_link',
  10000
from generate_series(1, 600) series;

-- Two identical timestamps prove that the UUID tie-breaker is required.
update public.distributor_referrals
set created_at = '2026-01-01T00:00:01Z'
where id in (
  '30000000-0000-4000-8000-000000000001',
  '30000000-0000-4000-8000-000000000002'
);

insert into public.distributor_sales (
  id, distributor_id, referral_id, storefront_order_id, created_at, paid_at,
  hold_until, order_reference, currency, gross_revenue_cents, discount_cents,
  discount_source, distributor_discount_cents, other_promotion_won, refund_cents,
  tax_cents, shipping_cents, commission_rate_bps, status,
  original_commissionable_revenue_cents, original_commission_amount_cents,
  refunded_commissionable_revenue_cents, commission_reversed_cents
)
select
  format('50000000-0000-4000-8000-%s', lpad(series::text, 12, '0'))::uuid,
  '10000000-0000-4000-8000-000000000001'::uuid,
  format('30000000-0000-4000-8000-%s', lpad(series::text, 12, '0'))::uuid,
  format('40000000-0000-4000-8000-%s', lpad(series::text, 12, '0'))::uuid,
  '2026-01-01T00:00:00Z'::timestamptz + make_interval(secs => series),
  '2026-01-01T00:00:00Z'::timestamptz + make_interval(secs => series),
  '2026-02-01T00:00:00Z'::timestamptz,
  'TEST-' || series,
  'USD', 10000, 0, 'none', 0, false, 0, 0, 0, 2500, 'pending',
  10000, 2500, 0, 0
from generate_series(1, 600) series;

insert into public.distributor_commission_ledger (
  id, distributor_id, commission_id, entry_type, amount_cents, currency,
  reason_code, reason, source_type, created_at, recovery_status,
  recovered_cents, remaining_cents, idempotency_key
)
select
  format('60000000-0000-4000-8000-%s', lpad(series::text, 12, '0'))::uuid,
  '10000000-0000-4000-8000-000000000001'::uuid,
  format('50000000-0000-4000-8000-%s', lpad(series::text, 12, '0'))::uuid,
  'commission_earned', 2500, 'USD', 'test_sale', 'Test earned commission',
  'system', '2026-01-01T00:00:00Z'::timestamptz + make_interval(secs => series),
  'not_applicable', 0, 0, 'test-earned-' || series
from generate_series(1, 600) series;

update public.distributor_sales
set refunded_commissionable_revenue_cents = 5000, commission_reversed_cents = 1250
where id = '50000000-0000-4000-8000-000000000001';
update public.distributor_sales
set refunded_commissionable_revenue_cents = 10000, commission_reversed_cents = 2500, status = 'reversed'
where id = '50000000-0000-4000-8000-000000000002';

insert into public.distributor_commission_ledger (
  distributor_id, commission_id, entry_type, amount_cents, currency, reason_code,
  reason, source_type, created_at, recovery_status, recovered_cents,
  remaining_cents, idempotency_key
) values
  ('10000000-0000-4000-8000-000000000001', '50000000-0000-4000-8000-000000000001', 'partial_refund_reversal', -1250, 'USD', 'partial', 'Partial refund', 'system', '2026-01-02T00:00:00Z', 'pending', 0, 1250, 'test-partial'),
  ('10000000-0000-4000-8000-000000000001', '50000000-0000-4000-8000-000000000002', 'full_refund_reversal', -2500, 'USD', 'full', 'Full refund', 'system', '2026-01-02T00:00:01Z', 'pending', 0, 2500, 'test-full'),
  ('10000000-0000-4000-8000-000000000001', null, 'manual_positive_adjustment', 500, 'USD', 'positive', 'Positive adjustment', 'administrator', '2026-01-02T00:00:02Z', 'not_applicable', 0, 0, 'test-positive'),
  ('10000000-0000-4000-8000-000000000001', null, 'manual_negative_adjustment', -200, 'USD', 'negative', 'Negative adjustment', 'administrator', '2026-01-02T00:00:03Z', 'pending', 0, 200, 'test-negative');

insert into public.distributor_payouts (
  id, distributor_id, created_at, period_start, period_end, currency,
  amount_cents, status, provider, external_reference, paid_at, created_by
)
select
  format('70000000-0000-4000-8000-%s', lpad(series::text, 12, '0'))::uuid,
  '10000000-0000-4000-8000-000000000001'::uuid,
  '2026-03-01T00:00:00Z'::timestamptz + make_interval(secs => series),
  '2026-01-01', '2026-01-31', 'USD', 100, 'paid', 'test',
  'PAYOUT-' || series,
  '2026-03-01T00:00:00Z'::timestamptz + make_interval(secs => series),
  '20000000-0000-4000-8000-000000000099'::uuid
from generate_series(1, 101) series;

set local session_replication_role = origin;
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"20000000-0000-4000-8000-000000000001","role":"authenticated"}', true);

select extensions.is((select total_orders_attributed from public.get_distributor_dashboard_metrics(null, null, null, 'USD')), 600::bigint, 'all 600 attributed orders are counted');
select extensions.is((select total_orders_paid from public.get_distributor_dashboard_metrics(null, null, null, 'USD')), 600::bigint, 'all 600 paid attributed orders are counted');
select extensions.is((select total_orders_refunded from public.get_distributor_dashboard_metrics(null, null, null, 'USD')), 2::bigint, 'partial and full refunds count as refunded orders');
select extensions.is((select total_sales from public.get_distributor_dashboard_metrics(null, null, null, 'USD')), 600::bigint, 'historical sales exceed the former 250/500 limits');
select extensions.is((select total_sales from public.get_distributor_dashboard_metrics(null, null, '2026-01-01T00:01:41Z', 'USD')), 100::bigint, 'a history below 250 sales remains exact');
select extensions.is((select total_sales from public.get_distributor_dashboard_metrics(null, null, '2026-01-01T00:04:11Z', 'USD')), 250::bigint, 'exactly 250 sales remains exact');
select extensions.is((select total_sales from public.get_distributor_dashboard_metrics(null, null, '2026-01-01T00:04:12Z', 'USD')), 251::bigint, '251 sales is not truncated to 250');
select extensions.is((select gross_attributed_revenue_cents from public.get_distributor_dashboard_metrics(null, null, null, 'USD')), 6000000::bigint, 'gross commissionable revenue uses all sales');
select extensions.is((select refunds_total_cents from public.get_distributor_dashboard_metrics(null, null, null, 'USD')), 15000::bigint, 'partial and full refund revenue is exact');
select extensions.is((select net_attributed_revenue_cents from public.get_distributor_dashboard_metrics(null, null, null, 'USD')), 5985000::bigint, 'net revenue subtracts refunds');
select extensions.is((select original_commission_cents from public.get_distributor_dashboard_metrics(null, null, null, 'USD')), 1500000::bigint, 'original commission comes from the full ledger');
select extensions.is((select positive_adjustments_cents from public.get_distributor_dashboard_metrics(null, null, null, 'USD')), 500::bigint, 'positive adjustments are signed ledger credits');
select extensions.is((select negative_adjustments_cents from public.get_distributor_dashboard_metrics(null, null, null, 'USD')), 200::bigint, 'negative adjustments are reported as an absolute debit');
select extensions.is((select refund_reversals_cents from public.get_distributor_dashboard_metrics(null, null, null, 'USD')), 3750::bigint, 'refund reversals do not double count revenue refunds');
select extensions.is((select net_commission_cents from public.get_distributor_dashboard_metrics(null, null, null, 'USD')), 1496550::bigint, 'net commission includes refunds and adjustments once');
select extensions.is((select pending_commission_cents from public.get_distributor_dashboard_metrics(null, null, null, 'USD')), 1496250::bigint, 'pending commission is net of sale-linked refund reversals');
select extensions.is((select pending_recovery_cents from public.get_distributor_dashboard_metrics(null, null, null, 'USD')), 3950::bigint, 'pending recoveries include partial refund, full refund, and negative adjustment debits');
select extensions.is((select paid_commission_cents from public.get_distributor_dashboard_metrics(null, null, null, 'USD')), 10100::bigint, '101 paid payouts exceed the former 100-row limit');
select extensions.is((select paid_commission_cents from public.get_distributor_dashboard_metrics(null, null, '2026-03-01T00:01:41Z', 'USD')), 10000::bigint, 'exactly 100 paid payouts remains exact');
select extensions.is((select payout_count from public.get_distributor_dashboard_metrics(null, null, null, 'USD')), 101::bigint, 'payout count is exact');
select extensions.is((select order_payment_rate_bps from public.get_distributor_dashboard_metrics(null, null, null, 'USD')), 10000, 'order payment rate is basis points without floating point');
select extensions.is((select count(*) from public.get_distributor_sales_page(null, 25, null, null, null, null, null)), 26::bigint, 'sales RPC returns one look-ahead row');
select extensions.is((select ledger_net_commission_cents from public.get_distributor_sales_page(null, 25, null, null, '2026-01-01T00:00:01Z', '2026-01-01T00:00:02Z', 'TEST-1') where order_reference = 'TEST-1'), 1250::bigint, 'sale net commission is ledger-derived, not page-derived');
select extensions.is((select count(*) from public.get_distributor_referrals_page(null, 1, null, null, '2026-01-01T00:00:01Z', '2026-01-01T00:00:02Z')), 2::bigint, 'equal timestamps still receive a deterministic UUID look-ahead row');
select extensions.is((select count(*) from public.get_distributor_referrals_page(null, 25, '2026-01-01T00:09:36Z', '30000000-0000-4000-8000-000000000576', null, null)), 26::bigint, 'keyset continuation returns the next bounded page');
select extensions.throws_ok($$select * from public.get_distributor_sales_page(null, 101, null, null, null, null, null)$$, '22023', 'page_size must be between 1 and 100', 'backend rejects page sizes over 100');
select extensions.throws_ok($$select * from public.get_distributor_dashboard_metrics('10000000-0000-4000-8000-000000000002', null, null, 'USD')$$, '42501', 'distributor access denied', 'a distributor cannot query another distributor');
select extensions.is((select total_orders_attributed from public.get_distributor_dashboard_metrics(null, '2026-01-01T00:01:40Z', '2026-01-01T00:03:20Z', 'USD')), 100::bigint, 'semi-open custom range includes the lower and excludes the upper boundary');

reset role;
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"20000000-0000-4000-8000-000000000099","role":"authenticated"}', true);
select extensions.is((select total_sales from public.get_distributor_dashboard_metrics(null, null, null, 'USD')), 600::bigint, 'authorized admin receives global metrics');
select extensions.is((select total_sales from public.get_distributor_dashboard_metrics('10000000-0000-4000-8000-000000000002', null, null, 'USD')), 0::bigint, 'zero-record distributor returns a defined zero snapshot');

reset role;
select extensions.ok(not (select prosecdef from pg_proc where oid = 'public.get_distributor_dashboard_metrics(uuid,timestamptz,timestamptz,text)'::regprocedure), 'metrics RPC is SECURITY INVOKER');
select extensions.ok(not has_function_privilege('anon', 'public.get_distributor_dashboard_metrics(uuid,timestamptz,timestamptz,text)', 'EXECUTE'), 'anonymous role cannot execute metrics RPC');

select * from extensions.finish();
rollback;
