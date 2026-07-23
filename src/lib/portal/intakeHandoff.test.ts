// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest'
import migration from '../../../supabase/migrations/202607230001_secure_public_intake_handoff.sql?raw'
import { defaultIntakeFormData } from '../../data/intake'
import authPageSource from '../../components/portal/PortalAuthPages.tsx?raw'
import { INTAKE_SESSION_KEY, normalizeHelpNeeded, readStoredIntakeHandoff } from './intakeHandoff'

describe('secure public-intake portal handoff', () => {
  beforeEach(() => window.sessionStorage.clear())

  it('safely normalizes both legacy single support answers and new multi-select answers', () => {
    expect(normalizeHelpNeeded('Recommend a starting point')).toEqual(['Recommend a starting point'])
    expect(normalizeHelpNeeded(['Recommend a starting point', '', 12])).toEqual(['Recommend a starting point'])
    expect(normalizeHelpNeeded(null)).toEqual([])
  })

  it('restores captured contact details and intake answers from session storage without a URL payload', () => {
    window.history.replaceState({}, '', '/client-register')
    window.sessionStorage.setItem(INTAKE_SESSION_KEY, JSON.stringify({
      phase: 'results',
      handoffToken: '00000000-0000-4000-8000-000000000022',
      locale: 'es',
      formData: {
        ...defaultIntakeFormData,
        firstName: 'Ana', lastName: 'Cliente', email: 'ana@example.com', phone: '9155550199',
        helpNeeded: 'Compare a few options', topPriorities: ['Clear pricing'],
      },
    }))

    const handoff = readStoredIntakeHandoff()
    expect(handoff?.formData).toMatchObject({ firstName: 'Ana', lastName: 'Cliente', email: 'ana@example.com', phone: '9155550199' })
    expect(handoff?.formData.helpNeeded).toEqual(['Compare a few options'])
    expect(window.location.search).toBe('')
    expect(authPageSource).not.toMatch(/[?&](email|phone|firstName|lastName)=/)
  })

  it('submits atomically, idempotently claims by secret token plus verified email, and strips sensitive portal answers', () => {
    expect(migration).toContain('create or replace function public.submit_public_intake')
    expect(migration).toContain('portal_handoff_token = submitted_handoff_token')
    expect(migration).toContain('return submitted_lead_id')
    expect(migration).toContain('lower(lead.email) = lower(btrim(verified_email))')
    expect(migration).toContain("auth.jwt() ->> 'email'")
    expect(migration).toContain("array['firstName','lastName','email','phone','city','medicationsOrCompounds','sensitivities']")
    expect(migration).toContain('cardinality(public.onboarding_profiles.goals) = 0')
    expect(migration).toContain('intake_handoff_token')
    expect(migration).toContain("'client'::public.portal_role")
  })

  it('keeps the internal hydration function private and only permits authenticated claims', () => {
    expect(migration).toContain('revoke all on function public.hydrate_public_intake(uuid, uuid, text) from public')
    expect(migration).not.toContain('grant execute on function public.hydrate_public_intake')
    expect(migration).toContain('grant execute on function public.claim_public_intake(uuid) to authenticated')
    expect(migration).toContain("if auth.uid() is null then raise exception 'authentication required'")
  })
})
