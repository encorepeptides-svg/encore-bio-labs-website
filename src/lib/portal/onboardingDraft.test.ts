import { describe, expect, it } from 'vitest'
import migration from '../../../supabase/migrations/202607230002_onboarding_draft_autosave.sql?raw'
import { translate } from '../../i18n/translate'
import type { PortalOnboardingForm } from './onboardingValidation'
import { restorePortalOnboardingForm, type PortalOnboardingRow } from './onboardingDraft'

function baseForm(): PortalOnboardingForm {
  return {
    legalName: 'Research Client', preferredName: '', mobile: '', language: 'English', timeZone: 'America/Denver',
    dateOfBirth: '', height: '', startingWeight: '', currentWeight: '', waist: '', units: 'imperial',
    goals: [], researchInterests: [], interestedProducts: [], activity: '', exercise: '', sleep: '',
    water: '3', appetite: '3', energy: '3', stress: '3', wellness: '3',
    emailNotifications: true, portalNotifications: true, orderUpdates: true, checkinReminders: true,
    documentNotifications: true, supportNotifications: true, signature: '', terms: false, privacy: false,
    ruo: false, noMedical: false, electronic: false, progressData: false, photos: false,
  }
}

function serverRow(overrides: Partial<PortalOnboardingRow> = {}): PortalOnboardingRow {
  return {
    date_of_birth: null, height_cm: 180, starting_weight_kg: 80, current_weight_kg: 78, waist_cm: 90,
    preferred_units: 'metric', goals: ['wellness'], research_interests: ['longevity-cellular-health'],
    interested_products: ['nad-plus'], activity_level: 'Moderate', exercise_frequency: '3', average_sleep_hours: 7,
    water_consistency: 4, appetite_rating: 3, energy_rating: 4, stress_rating: 2, wellness_rating: 4,
    communication_preferences: { email: false, portal: true }, submitted_at: null,
    draft_data: null, draft_current_step: null, draft_saved_at: null, draft_completed_at: null,
    ...overrides,
  }
}

describe('portal onboarding draft persistence', () => {
  it('restores newer server draft arrays, units, ratings and consent choices over canonical values', () => {
    const restored = restorePortalOnboardingForm(baseForm(), serverRow({
      draft_data: {
        units: 'imperial', goals: ['recovery', 'energy'], interestedProducts: ['retatrutide', 'nad-plus'],
        startingWeight: '176', water: '5', terms: true, privacy: true, photos: true,
      },
      draft_current_step: 6,
      draft_saved_at: '2026-07-23T12:00:00Z',
    }))

    expect(restored.units).toBe('imperial')
    expect(restored.goals).toEqual(['recovery', 'energy'])
    expect(restored.interestedProducts).toEqual(['retatrutide', 'nad-plus'])
    expect(restored.startingWeight).toBe('176')
    expect(restored.water).toBe('5')
    expect(restored.photos).toBe(true)
  })

  it('does not restore a draft after it is marked completed', () => {
    const restored = restorePortalOnboardingForm(baseForm(), serverRow({
      draft_data: { startingWeight: '999', goals: ['recovery'] },
      draft_completed_at: '2026-07-23T13:00:00Z',
    }))
    expect(restored.startingWeight).toBe('80')
    expect(restored.goals).toEqual(['wellness'])
  })

  it('enforces per-user server writes and optimistic stale-draft protection', () => {
    expect(migration).toContain('auth.uid()')
    expect(migration).toContain('where user_id = auth.uid()')
    expect(migration).toContain("jsonb_build_object('status', 'stale'")
    expect(migration).toContain("revoke all on function public.save_portal_onboarding_draft")
    expect(migration).toContain("grant execute on function public.save_portal_onboarding_draft")
    expect(migration).not.toContain('localStorage')
  })

  it.each(['en', 'es'] as const)('provides clear baseline-weight and individual rating descriptions in %s', (locale) => {
    const expected = locale === 'en'
      ? ['Starting tracking weight', '1 = rarely, 5 = consistently', '1 = very low, 5 = very high', '1 = very poor, 5 = excellent']
      : ['Peso al inicio del seguimiento', '1 = rara vez, 5 = de forma constante', '1 = muy bajo, 5 = muy alto', '1 = muy baja, 5 = muy alta', '1 = muy malo, 5 = excelente']
    const copy = [
      translate(locale, 'portal', 'startingWeightLabel', { unit: 'lb' }),
      translate(locale, 'portal', 'waterRatingHelp'),
      translate(locale, 'portal', 'appetiteRatingHelp'),
      translate(locale, 'portal', 'energyRatingHelp'),
      translate(locale, 'portal', 'stressRatingHelp'),
      translate(locale, 'portal', 'wellnessRatingHelp'),
    ].join(' ')
    for (const phrase of expected) expect(copy).toContain(phrase)
  })
})
