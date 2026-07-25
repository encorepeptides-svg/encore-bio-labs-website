import { describe, expect, it } from 'vitest'
import migration from '../../../supabase/migrations/20260725155720_direct_portal_auto_approval.sql?raw'

describe('direct portal auto-approval migration', () => {
  it('automatically approves verified, complete clients with product interest', () => {
    expect(migration).toContain('users.email_confirmed_at is not null')
    expect(migration).toContain('portal_client_intake_is_complete')
    expect(migration).toContain('cardinality(coalesce(intake.interested_products')
    expect(migration).toContain("matched_source text := 'direct_signup'")
    expect(migration).toContain('auto_approve := cardinality(review_flags) = 0')
    expect(migration).toContain("set status = 'active'")
    expect(migration).toContain("set decision = 'approved'")
  })

  it('keeps only genuine security and account exceptions in review', () => {
    for (const flag of ['email_unverified', 'identity_mismatch', 'intake_incomplete', 'account_hold', 'prior_staff_review']) {
      expect(migration).toContain(flag)
    }
    for (const routineFlag of ['manual_invitation', 'shipping_review_required', 'unmatched_signup']) {
      expect(migration).not.toContain(`array_append(review_flags, '${routineFlag}')`)
    }
  })

  it('keeps the evaluator private while preserving the client submission RPC', () => {
    expect(migration).toContain('revoke all on function public.evaluate_portal_onboarding(uuid) from public, anon, authenticated, service_role')
    expect(migration).toContain('grant execute on function public.submit_portal_onboarding() to authenticated')
  })
})
