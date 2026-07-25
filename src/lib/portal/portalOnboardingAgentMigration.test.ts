import { describe, expect, it } from 'vitest'
import migration from '../../../supabase/migrations/20260725025008_portal_onboarding_agent.sql?raw'

describe('portal onboarding agent migration', () => {
  it('auto-approves only verified, complete, trusted matches', () => {
    expect(migration).toContain('evaluate_portal_onboarding')
    expect(migration).toContain('users.email_confirmed_at is not null')
    expect(migration).toContain('portal_client_intake_is_complete')
    expect(migration).toContain("matched_source := 'invitation'")
    expect(migration).toContain("matched_source := 'public_intake'")
    expect(migration).toContain("matched_source := 'paid_order'")
    expect(migration).toContain("status = 'active'")
    expect(migration).toContain("decision = 'approved'")
  })

  it('routes explainable exceptions to manual review', () => {
    for (const flag of [
      'email_unverified',
      'identity_mismatch',
      'intake_incomplete',
      'account_hold',
      'prior_staff_review',
      'manual_invitation',
      'shipping_review_required',
      'unmatched_signup',
    ]) expect(migration).toContain(flag)
    expect(migration).toContain("outcome in ('auto_approved', 'manual_review')")
    expect(migration).toContain('portal_onboarding_manual_review_queued')
  })

  it('keeps invitation and evaluation data private and auditable', () => {
    expect(migration).toContain('alter table public.portal_invitations enable row level security')
    expect(migration).toContain('alter table public.portal_onboarding_evaluations enable row level security')
    expect(migration).toContain('admins read portal invitations')
    expect(migration).toContain('clients read own onboarding evaluations')
    expect(migration).toContain("security definer\nset search_path = ''")
    expect(migration).toContain('revoke all on function public.evaluate_portal_onboarding(uuid) from public, anon, authenticated')
    expect(migration).toContain('perform public.evaluate_portal_onboarding(auth.uid())')
  })
})
