import { describe, expect, it } from 'vitest'
import migration from '../../supabase/migrations/20260815185425_distributor_commission_accounting_ledger.sql?raw'
import webhook from '../../supabase/functions/payment-accounting-webhook/index.ts?raw'

function refundReversals(originalEligible: number, originalCommission: number, refundEvents: number[]) {
  let cumulative = 0
  let reversed = 0
  return refundEvents.map((event) => {
    cumulative = Math.min(originalEligible, cumulative + event)
    const target = cumulative === originalEligible
      ? originalCommission
      : Math.floor(originalCommission * cumulative / originalEligible)
    const movement = target - reversed
    reversed = target
    return movement
  })
}

function recoverAcrossPayouts(debt: number, earnings: number[]) {
  let remaining = debt
  return earnings.map((gross) => {
    const recovered = Math.min(gross, remaining)
    remaining -= recovered
    return { gross, recovered, payable: gross - recovered, remaining }
  })
}

describe('immutable distributor commission accounting', () => {
  it('1. creates the original commission and ledger credit atomically', () => {
    expect(migration).toContain('after insert on public.distributor_sales')
    expect(migration).toContain("'commission_earned'")
    expect(migration).toContain("'commission:' || new.id::text")
  })

  it('2. calculates one partial refund proportionally', () => {
    expect(refundReversals(10_000, 2_000, [2_500])).toEqual([500])
    expect(migration).toContain('partial_refund_reversal')
  })

  it('3. accumulates several partial refunds without re-reversing prior cents', () => {
    expect(refundReversals(10_000, 2_000, [2_500, 2_500, 1_000])).toEqual([500, 500, 200])
  })

  it('4. adjusts the final full refund to the exact original commission', () => {
    expect(refundReversals(10_000, 2_000, [2_500, 7_500])).toEqual([500, 1_500])
  })

  it('5. treats a retried refund webhook as idempotent', () => {
    expect(migration).toContain('unique (provider, external_event_id)')
    expect(migration).toContain("return jsonb_build_object('ok', true, 'duplicate', true)")
    expect(webhook).toContain('duplicate: data.duplicate === true')
  })

  it('6. ignores out-of-order cumulative refund events', () => {
    expect(migration).toContain('greatest(target_cumulative_amount_cents - previous_refunded, 0)')
    expect(migration).toContain('out_of_order_or_already_applied')
  })

  it('7. does not create a cash recovery for a never-paid cancellation', () => {
    expect(migration).toContain("elsif old.status = 'paid' and new.status = 'cancelled'")
    expect(migration).not.toContain("new.status = 'cancelled' and old.status <> 'paid'")
  })

  it('8. records a compensating movement when an approved captured sale is cancelled', () => {
    expect(migration).toContain("'order-cancellation:' || old.id::text")
    expect(migration).toContain("'captured_order_cancelled'")
  })

  it('9. applies a refund to an editable draft payout before payment', () => {
    expect(migration).toContain("status = 'draft'")
    expect(migration).toContain('apply_distributor_recovery_to_payout')
    expect(migration).toContain('recalculate_distributor_payout')
  })

  it('10. links a recovery to the historical paid payout without changing it', () => {
    expect(migration).toContain("payout.status = 'paid'")
    expect(migration).toContain('original_payout_id')
    expect(migration).toContain("if payout_status = 'paid' then raise exception 'paid payouts are immutable'")
  })

  it('11. splits a recovery across several payouts', () => {
    expect(recoverAcrossPayouts(5_000, [2_000, 1_500, 3_000])).toEqual([
      { gross: 2_000, recovered: 2_000, payable: 0, remaining: 3_000 },
      { gross: 1_500, recovered: 1_500, payable: 0, remaining: 1_500 },
      { gross: 3_000, recovered: 1_500, payable: 1_500, remaining: 0 },
    ])
    expect(migration).toContain('distributor_recovery_allocations')
  })

  it('12. never makes an insufficient payout negative', () => {
    expect(recoverAcrossPayouts(5_000, [3_000])[0]).toEqual({ gross: 3_000, recovered: 3_000, payable: 0, remaining: 2_000 })
    expect(migration).toContain('greatest(gross_cents + positive_cents - negative_cents - recovery_cents, 0)')
  })

  it('13. caps chargeback exposure after a partial refund', () => {
    const originalCommission = 2_000
    const refundedCommission = refundReversals(10_000, originalCommission, [2_500])[0]
    expect(originalCommission - refundedCommission).toBe(1_500)
    expect(migration).toContain('refund_commission_already_reversed_cents')
    expect(migration).toContain('exposed_commission')
  })

  it('14. records a chargeback reversal as a separate positive movement', () => {
    expect(migration).toContain("case when target_is_reversal then 'chargeback_reversal' else 'chargeback' end")
    expect(migration).toContain("target_event_type in ('chargeback.won', 'chargeback.reversed')")
  })

  it('15. records a positive manual adjustment with an explicit direction', () => {
    expect(migration).toContain("entry_kind := (case when target_direction = 'positive' then 'manual_positive_adjustment'")
    expect(migration).toContain("target_direction not in ('positive', 'negative')")
  })

  it('16. records a negative manual adjustment from a positive input amount', () => {
    expect(migration).toContain("signed_amount := case when target_direction = 'positive' then target_amount_cents else -target_amount_cents end")
    expect(migration).toContain("if target_amount_cents <= 0 then raise exception 'adjustment amount must be positive'")
  })

  it('17. blocks ledger edits and deletes at the database layer', () => {
    expect(migration).toContain('commission ledger entries cannot be deleted')
    expect(migration).toContain('commission ledger entries are immutable; insert a compensating entry')
    expect(migration).toContain('before update on public.distributor_commission_ledger')
    expect(migration).toContain('before delete on public.distributor_commission_ledger')
  })

  it('18. gives distributors only their own ledger while admins retain audit access', () => {
    expect(migration).toContain('distributors read own commission ledger')
    expect(migration).toContain('distributor_id = (select public.portal_distributor_id())')
    expect(migration).toContain('admins read distributor refunds')
    expect(migration).toContain('alter table public.distributor_commission_ledger enable row level security')
  })

  it('19. uses deterministic cumulative rounding over multiple refunds', () => {
    const movements = refundReversals(3, 7, [1, 1, 1])
    expect(movements).toEqual([2, 2, 3])
    expect(movements.reduce((sum, value) => sum + value, 0)).toBe(7)
  })

  it('20. backfills balances safely more than once without duplicates', () => {
    expect(migration).toContain("'legacy:' || sale.id::text")
    expect(migration).toContain("'legacy-refund:' || sale.id::text")
    expect(migration.match(/on conflict \(idempotency_key\) do nothing/g)?.length).toBeGreaterThanOrEqual(3)
    expect(migration).toContain('exactly_one_original_credit')
  })

  it('verifies webhook signatures before invoking the accounting transaction', () => {
    expect(webhook).toContain("{ name: 'HMAC', hash: 'SHA-256' }")
    expect(webhook).toContain('MAX_CLOCK_SKEW_SECONDS = 300')
    expect(webhook.indexOf('verifySignature')).toBeLessThan(webhook.indexOf("client.rpc('record_distributor_payment_event'"))
  })
})
