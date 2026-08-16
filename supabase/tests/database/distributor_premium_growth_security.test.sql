begin;

create extension if not exists pgtap with schema extensions;
select extensions.plan(30);

set local session_replication_role = replica;

insert into auth.users(
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values (
  '82000000-0000-4000-8000-000000000099',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated', 'premium-admin@example.test', '', now(),
  '{"provider":"email","providers":["email"]}', '{}', now(), now()
);

update public.distributor_portal_settings
set analytics_started_at = '2026-01-01T00:00:00Z',
    admin_mfa_enforcement_enabled = false,
    minimum_winner_orders = 2;

insert into public.distributor_accounts (
  id, user_id, email, display_name, referral_code, status, onboarding_status,
  commission_rate_bps, payout_minimum_cents
) values
  ('81000000-0000-4000-8000-000000000001', '82000000-0000-4000-8000-000000000001', 'premium-alpha@example.test', 'Premium Alpha', 'PREMIUMA', 'active', 'active', 2500, 10000),
  ('81000000-0000-4000-8000-000000000002', '82000000-0000-4000-8000-000000000002', 'premium-beta@example.test', 'Premium Beta', 'PREMIUMB', 'active', 'active', 2500, 10000),
  ('81000000-0000-4000-8000-000000000003', '82000000-0000-4000-8000-000000000003', 'premium-suspended@example.test', 'Premium Suspended', 'PREMIUMS', 'suspended', 'suspended', 2500, 10000);

insert into public.user_roles(user_id, role) values ('82000000-0000-4000-8000-000000000099', 'admin');

insert into public.distributor_campaigns(id, distributor_id, name, channel, language, status, starts_at)
values
  ('83000000-0000-4000-8000-000000000001', '81000000-0000-4000-8000-000000000001', 'WhatsApp June', 'whatsapp', 'es', 'active', '2026-06-01'),
  ('83000000-0000-4000-8000-000000000002', '81000000-0000-4000-8000-000000000002', 'Private Beta', 'email', 'en', 'active', '2026-06-01');

insert into public.distributor_partner_links(
  id, distributor_id, campaign_id, slug, destination_type, destination_path, channel, sub_id, language, active
) values
  ('84000000-0000-4000-8000-000000000001', '81000000-0000-4000-8000-000000000001', '83000000-0000-4000-8000-000000000001', 'premiumlinka', 'product', '/products/retatrutide', 'whatsapp', 'june-a', 'es', true),
  ('84000000-0000-4000-8000-000000000002', '81000000-0000-4000-8000-000000000002', '83000000-0000-4000-8000-000000000002', 'premiumlinkb', 'catalog', '/catalog', 'email', null, 'en', true);

insert into public.storefront_orders(
  id, order_reference, status, channel, payment_method, items, subtotal_cents,
  discount_cents, refunded_cents, paid_at, distributor_id, referral_code,
  distributor_campaign_id, distributor_partner_link_id, distributor_visitor_id,
  distributor_session_id
) values
  ('85000000-0000-4000-8000-000000000001', 'PREMIUM-ORDER-1', 'paid', 'checkout', 'zelle', '[]', 10000, 500, 0, '2026-06-10T12:00:00Z', '81000000-0000-4000-8000-000000000001', 'PREMIUMA', '83000000-0000-4000-8000-000000000001', '84000000-0000-4000-8000-000000000001', '86000000-0000-4000-8000-000000000001', '87000000-0000-4000-8000-000000000001'),
  ('85000000-0000-4000-8000-000000000002', 'PREMIUM-ORDER-2', 'paid', 'checkout', 'zelle', '[]', 20000, 0, 2000, '2026-06-15T12:00:00Z', '81000000-0000-4000-8000-000000000001', 'PREMIUMA', '83000000-0000-4000-8000-000000000001', '84000000-0000-4000-8000-000000000001', '86000000-0000-4000-8000-000000000002', '87000000-0000-4000-8000-000000000002');

insert into public.distributor_attribution_events(
  id, event_type, distributor_id, campaign_id, partner_link_id,
  anonymous_visitor_id, session_id, product_id, order_id, occurred_at,
  channel, consent_state, idempotency_key
) values
  ('88000000-0000-4000-8000-000000000001', 'referral_link_clicked', '81000000-0000-4000-8000-000000000001', '83000000-0000-4000-8000-000000000001', '84000000-0000-4000-8000-000000000001', null, '87000000-0000-4000-8000-000000000001', null, null, '2026-06-01T10:00:00Z', 'whatsapp', 'essential', 'premium-click-1'),
  ('88000000-0000-4000-8000-000000000002', 'referral_link_clicked', '81000000-0000-4000-8000-000000000001', '83000000-0000-4000-8000-000000000001', '84000000-0000-4000-8000-000000000001', null, '87000000-0000-4000-8000-000000000002', null, null, '2026-06-01T11:00:00Z', 'whatsapp', 'essential', 'premium-click-2'),
  ('88000000-0000-4000-8000-000000000003', 'referral_link_clicked', '81000000-0000-4000-8000-000000000001', '83000000-0000-4000-8000-000000000001', '84000000-0000-4000-8000-000000000001', null, '87000000-0000-4000-8000-000000000002', null, null, '2026-06-01T12:00:00Z', 'whatsapp', 'essential', 'premium-click-3'),
  ('88000000-0000-4000-8000-000000000004', 'unique_visitor_recorded', '81000000-0000-4000-8000-000000000001', '83000000-0000-4000-8000-000000000001', '84000000-0000-4000-8000-000000000001', '86000000-0000-4000-8000-000000000001', '87000000-0000-4000-8000-000000000001', null, null, '2026-06-01T10:00:01Z', 'whatsapp', 'accepted', 'premium-visitor-1'),
  ('88000000-0000-4000-8000-000000000005', 'unique_visitor_recorded', '81000000-0000-4000-8000-000000000001', '83000000-0000-4000-8000-000000000001', '84000000-0000-4000-8000-000000000001', '86000000-0000-4000-8000-000000000002', '87000000-0000-4000-8000-000000000002', null, null, '2026-06-01T11:00:01Z', 'whatsapp', 'accepted', 'premium-visitor-2'),
  ('88000000-0000-4000-8000-000000000006', 'product_viewed', '81000000-0000-4000-8000-000000000001', '83000000-0000-4000-8000-000000000001', '84000000-0000-4000-8000-000000000001', '86000000-0000-4000-8000-000000000001', '87000000-0000-4000-8000-000000000001', 'retatrutide', null, '2026-06-01T10:01:00Z', 'whatsapp', 'accepted', 'premium-view-1'),
  ('88000000-0000-4000-8000-000000000007', 'checkout_started', '81000000-0000-4000-8000-000000000001', '83000000-0000-4000-8000-000000000001', '84000000-0000-4000-8000-000000000001', '86000000-0000-4000-8000-000000000001', '87000000-0000-4000-8000-000000000001', null, null, '2026-06-01T10:02:00Z', 'whatsapp', 'accepted', 'premium-checkout-1'),
  ('88000000-0000-4000-8000-000000000008', 'checkout_completed', '81000000-0000-4000-8000-000000000001', '83000000-0000-4000-8000-000000000001', '84000000-0000-4000-8000-000000000001', '86000000-0000-4000-8000-000000000001', '87000000-0000-4000-8000-000000000001', null, '85000000-0000-4000-8000-000000000001', '2026-06-10T11:59:00Z', 'whatsapp', 'essential', 'premium-completed-1'),
  ('88000000-0000-4000-8000-000000000009', 'order_paid', '81000000-0000-4000-8000-000000000001', '83000000-0000-4000-8000-000000000001', '84000000-0000-4000-8000-000000000001', '86000000-0000-4000-8000-000000000001', '87000000-0000-4000-8000-000000000001', null, '85000000-0000-4000-8000-000000000001', '2026-06-10T12:00:00Z', 'whatsapp', 'essential', 'premium-paid-1'),
  ('88000000-0000-4000-8000-000000000010', 'order_paid', '81000000-0000-4000-8000-000000000001', '83000000-0000-4000-8000-000000000001', '84000000-0000-4000-8000-000000000001', '86000000-0000-4000-8000-000000000002', '87000000-0000-4000-8000-000000000002', null, '85000000-0000-4000-8000-000000000002', '2026-06-15T12:00:00Z', 'whatsapp', 'essential', 'premium-paid-2');

insert into public.distributor_commission_rules(
  id, distributor_id, scope_type, scope_key, commission_rate_bps, excluded,
  public_reason, effective_from, priority, created_by
) values
  ('89000000-0000-4000-8000-000000000001', null, 'product', 'retatrutide', 2000, false, 'Global product rate', '2026-01-01', 100, '82000000-0000-4000-8000-000000000099'),
  ('89000000-0000-4000-8000-000000000002', '81000000-0000-4000-8000-000000000001', 'product', 'retatrutide', 3000, false, 'Partner product rate', '2026-05-01', 100, '82000000-0000-4000-8000-000000000099'),
  ('89000000-0000-4000-8000-000000000003', null, 'product', 'excluded-product', null, true, 'Product excluded', '2026-01-01', 100, '82000000-0000-4000-8000-000000000099');

insert into public.distributor_notifications(id, distributor_id, notification_type, title_en, title_es, body_en, body_es, idempotency_key)
values
  ('8a000000-0000-4000-8000-000000000001', '81000000-0000-4000-8000-000000000001', 'new_resource', 'A', 'A', 'A', 'A', 'premium-note-a'),
  ('8a000000-0000-4000-8000-000000000002', '81000000-0000-4000-8000-000000000002', 'new_resource', 'B', 'B', 'B', 'B', 'premium-note-b');

insert into public.distributor_payouts(id, distributor_id, period_start, period_end, amount_cents, status, provider, external_reference, paid_at, created_by)
values ('8b000000-0000-4000-8000-000000000001', '81000000-0000-4000-8000-000000000001', '2026-06-01', '2026-06-30', 5000, 'paid', 'test', 'PREMIUM-PAYOUT', '2026-07-01', '82000000-0000-4000-8000-000000000099');

insert into public.distributor_payout_receipts(id, payout_id, distributor_id, receipt_number, snapshot)
values ('8c000000-0000-4000-8000-000000000001', '8b000000-0000-4000-8000-000000000001', '81000000-0000-4000-8000-000000000001', 'EBL-PREMIUM-TEST', '{"amountCents":5000}');

set local session_replication_role = origin;
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"82000000-0000-4000-8000-000000000001","role":"authenticated","aal":"aal1"}', true);

select extensions.is(((public.get_distributor_premium_dashboard(null, '2026-06-01', '2026-07-01') -> 'traffic' ->> 'clicks')::integer), 3, 'dashboard counts all accepted clicks');
select extensions.is(((public.get_distributor_premium_dashboard(null, '2026-06-01', '2026-07-01') -> 'traffic' ->> 'uniqueClicks')::integer), 2, 'unique click sessions are deduplicated');
select extensions.is(((public.get_distributor_premium_dashboard(null, '2026-06-01', '2026-07-01') -> 'traffic' ->> 'uniqueVisitors')::integer), 2, 'consented unique visitors are deduplicated');
select extensions.is(((public.get_distributor_premium_dashboard(null, '2026-06-01', '2026-07-01') -> 'traffic' ->> 'checkouts')::integer), 1, 'checkout starts use distinct sessions');
select extensions.is(((public.get_distributor_premium_dashboard(null, '2026-06-01', '2026-07-01') -> 'traffic' ->> 'paidOrders')::integer), 2, 'paid orders use distinct server order ids');
select extensions.is(((public.get_distributor_premium_dashboard(null, '2026-06-01', '2026-07-01') -> 'traffic' ->> 'visitorToCheckoutBps')::integer), 5000, 'visitor to checkout conversion is exact basis points');
select extensions.is(((public.get_distributor_premium_dashboard(null, '2026-06-01', '2026-07-01') -> 'traffic' ->> 'checkoutToPaidBps')::integer), 20000, 'checkout to paid exposes observed cohort ratio without clamping');
select extensions.is(((public.get_distributor_premium_dashboard(null, '2026-06-01', '2026-07-01') -> 'traffic' ->> 'visitorToPaidBps')::integer), 10000, 'visitor to paid conversion is exact');
select extensions.is(((public.get_distributor_premium_dashboard(null, '2026-06-01', '2026-07-01') -> 'traffic' ->> 'clickToPaidBps')::integer), 6667, 'click to paid conversion rounds basis points deterministically');
select extensions.is(((public.get_distributor_premium_dashboard(null, '2026-06-01', '2026-07-01') -> 'commerce' ->> 'netAttributedRevenueCents')::integer), 0, 'commerce never infers sales from traffic events');
select extensions.is((select count(*) from public.get_distributor_growth_report(null, '2026-06-01', '2026-07-01')), 1::bigint, 'growth report returns the owned link only');
select extensions.is((select clicks from public.get_distributor_growth_report(null, '2026-06-01', '2026-07-01') limit 1), 3::bigint, 'growth report click total reconciles with dashboard');
select extensions.is((select paid_orders from public.get_distributor_growth_report(null, '2026-06-01', '2026-07-01') limit 1), 2::bigint, 'growth report paid order total reconciles with dashboard');
select extensions.is((select count(*) from public.distributor_partner_links), 1::bigint, 'RLS hides another distributor links');
select extensions.is((select count(*) from public.distributor_notifications), 1::bigint, 'RLS hides another distributor notifications');
select extensions.is((select count(*) from public.distributor_payout_receipts), 1::bigint, 'distributor can read own immutable payout receipt');
select extensions.throws_ok($$select public.get_distributor_premium_dashboard('81000000-0000-4000-8000-000000000002', '2026-06-01', '2026-07-01')$$, '42501', 'distributor access denied', 'distributor cannot query another premium dashboard');
select extensions.throws_ok($$insert into public.distributor_partner_links(distributor_id, slug, destination_type, destination_path, channel, language) values ('81000000-0000-4000-8000-000000000002', 'forbiddenlink', 'catalog', '/catalog', 'email', 'en')$$, '42501', null, 'distributor cannot create a link for another account');

reset role;
select extensions.is((select commission_rate_bps from private.resolve_distributor_commission_rule('81000000-0000-4000-8000-000000000001'::uuid, 'retatrutide', null::text, '2026-06-01'::timestamptz, 2500) limit 1), 3000, 'partner product rule overrides the global product rule');
select extensions.is((select commission_rate_bps from private.resolve_distributor_commission_rule('81000000-0000-4000-8000-000000000002'::uuid, 'retatrutide', null::text, '2026-06-01'::timestamptz, 2500) limit 1), 2000, 'global product rule applies to other partners');
select extensions.ok((select excluded from private.resolve_distributor_commission_rule('81000000-0000-4000-8000-000000000001'::uuid, 'excluded-product', null::text, '2026-06-01'::timestamptz, 2500) limit 1), 'explicit excluded product resolves to no commission');
select extensions.is((select commission_rate_bps from private.resolve_distributor_commission_rule('81000000-0000-4000-8000-000000000001'::uuid, 'unruled-product', null::text, '2026-06-01'::timestamptz, 2500) limit 1), 2500, 'unruled product preserves the account default of 25 percent');
select extensions.throws_ok($$update public.distributor_commission_rules set public_reason = 'rewrite' where id = '89000000-0000-4000-8000-000000000001'$$, '55000', 'immutable distributor history cannot be changed', 'commission rule history is immutable');
select extensions.throws_ok($$update public.distributor_payout_receipts set snapshot = '{}' where id = '8c000000-0000-4000-8000-000000000001'$$, '55000', 'immutable distributor history cannot be changed', 'payout receipt snapshot is immutable');

set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"82000000-0000-4000-8000-000000000002","role":"authenticated","aal":"aal1"}', true);
select extensions.ok((public.get_distributor_premium_dashboard(null, '2026-06-01', '2026-07-01') -> 'traffic' -> 'visitorToPaidBps') = 'null'::jsonb, 'zero visitor denominator returns null conversion');

reset role;
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"82000000-0000-4000-8000-000000000099","role":"authenticated","aal":"aal1"}', true);
select extensions.throws_ok($$insert into public.distributor_commission_rules(distributor_id, scope_type, scope_key, commission_rate_bps, public_reason, effective_from, created_by) values (null, 'product', 'aal1-blocked', 2500, 'AAL1 blocked', now(), '82000000-0000-4000-8000-000000000099')$$, '42501', null, 'AAL1 admin cannot create a high-risk commission rule');

select set_config('request.jwt.claims', '{"sub":"82000000-0000-4000-8000-000000000099","role":"authenticated","aal":"aal2"}', true);
select extensions.lives_ok($$insert into public.distributor_commission_rules(distributor_id, scope_type, scope_key, commission_rate_bps, public_reason, effective_from, created_by) values (null, 'product', 'aal2-allowed', 2500, 'AAL2 allowed', now(), '82000000-0000-4000-8000-000000000099')$$, 'AAL2 admin can create a high-risk commission rule');
select extensions.ok(public.portal_is_admin(), 'AAL2 administrator is recognized by the admin guard');

reset role;
select extensions.ok(not (select prosecdef from pg_proc where oid = 'public.get_distributor_premium_dashboard(uuid,timestamptz,timestamptz,text)'::regprocedure), 'premium dashboard RPC is SECURITY INVOKER');
select extensions.ok(not has_function_privilege('anon', 'public.get_distributor_premium_dashboard(uuid,timestamptz,timestamptz,text)', 'EXECUTE'), 'anonymous cannot execute premium dashboard RPC');

select * from extensions.finish();
rollback;
