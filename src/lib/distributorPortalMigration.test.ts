import { describe, expect, it } from 'vitest'
import migration from '../../supabase/migrations/20260812203548_distributor_portal_phase1.sql?raw'
import edgeFunction from '../../supabase/functions/shipping-checkout/index.ts?raw'

describe('distributor incentive database and server contract', () => {
  it('ships the approved 25% commission and 5% / USD 25 customer defaults', () => {
    expect(migration).toContain('commission_rate_bps integer not null default 2500')
    expect(migration).toContain('customer_discount_rate_bps integer not null default 500')
    expect(migration).toContain('customer_discount_max_cents integer not null default 2500')
    expect(migration).toContain('customer_discount_first_order_only boolean not null default true')
  })

  it('keeps the database authoritative for promotion resolution and the final payable total', () => {
    expect(migration).toContain('new.volume_discount_cents := calculated_volume_discount')
    expect(migration).toContain("new.discount_source := 'distributor_incentive'")
    expect(migration).toContain('new.processing_fee_cents := case')
    expect(migration).toContain('new.total_cents := case')
    expect(migration).toContain('volume_promotion_was_greater_or_equal')
  })

  it('consumes only paid first-purchase orders and reverses a cancelled paid order', () => {
    expect(migration).toContain("new.status = 'paid'")
    expect(migration).toContain("new.discount_source = 'distributor_incentive'")
    expect(migration).toContain("old.status = 'paid' and new.status <> 'paid'")
    expect(migration).toContain("set status = 'reversed'")
    expect(migration).not.toContain("new.status = 'pending_payment'\n    and new.discount_source")
  })

  it('prevents concurrent double redemption with a partial unique index and conflict check', () => {
    expect(migration).toContain('create unique index distributor_redemptions_one_consumed_idx')
    expect(migration).toContain("where status = 'consumed'")
    expect(migration).toContain('on conflict (customer_fingerprint) where status = \'consumed\' do nothing')
    expect(migration).toContain('distributor first-purchase incentive was already redeemed')
  })

  it('snapshots the winning discount before calculating the 25% commission', () => {
    expect(migration).toContain('net_commissionable_revenue_cents integer generated always as')
    expect(migration).toContain('* commission_rate_bps::numeric / 10000')
    expect(migration).toContain('discount_source, distributor_discount_cents, other_promotion_won')
  })

  it('isolates distributor rows and keeps the private redemption ledger out of distributor access', () => {
    expect(migration).toContain('alter table public.distributor_customer_redemptions enable row level security')
    expect(migration).toContain('distributors read own sales')
    expect(migration).toContain('distributor_id = (select public.portal_distributor_id())')
    expect(migration).toContain('create policy "admins read distributor redemptions"')
    expect(migration).not.toContain('distributors read own redemptions')
  })

  it('treats first purchase as site-wide and checks historical paid orders using normalized private contact data', () => {
    expect(migration).toContain('create unique index distributor_redemptions_one_consumed_idx on public.distributor_customer_redemptions(customer_fingerprint)')
    expect(migration).toContain('storefront_customer_has_paid_order')
    expect(migration).toContain("lower(trim(contact ->> 'email')) = normalized_email")
    expect(migration).toContain("regexp_replace(coalesce(contact ->> 'phone', ''), '\\D', '', 'g') = normalized_phone")
    expect(migration).toContain('revoke all on function public.storefront_customer_has_paid_order(text, text, text) from public, anon, authenticated')
  })

  it('exposes only limited public validation and rejects inactive accounts', () => {
    expect(edgeFunction).toContain("body.action === 'validate_distributor_code'")
    expect(edgeFunction).toContain(".eq('status', 'active')")
    expect(edgeFunction).toContain(".select('referral_code,customer_discount_rate_bps,customer_discount_max_cents,customer_discount_enabled')")
    expect(edgeFunction).not.toContain(".select('referral_code,display_name")
  })

  it('derives a private identity and never includes it in the public response', () => {
    expect(edgeFunction).toContain("sha256(`auth:${data.user.id}`)")
    expect(edgeFunction).toContain('DISTRIBUTOR_FINGERPRINT_PEPPER')
    const successResponse = edgeFunction.slice(edgeFunction.indexOf('return response({\n        reference'))
    expect(successResponse).not.toContain('customerFingerprint')
  })
})
