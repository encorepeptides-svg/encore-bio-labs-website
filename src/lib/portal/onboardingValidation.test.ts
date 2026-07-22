import { describe, expect, it } from 'vitest'
import {
  firstIncompleteOnboardingStep,
  isPortalOnboardingComplete,
  isPortalOnboardingStepComplete,
  type PortalOnboardingForm,
} from './onboardingValidation'

function completeForm(overrides: Partial<PortalOnboardingForm> = {}): PortalOnboardingForm {
  return {
    legalName: 'Research Client', preferredName: '', mobile: '9155550100', language: 'English', timeZone: 'America/Denver',
    dateOfBirth: '1985-01-01', height: '70', startingWeight: '190', currentWeight: '185', waist: '34', units: 'imperial',
    goals: ['wellness'], researchInterests: ['longevity-cellular-health'], interestedProducts: ['nad-plus'],
    activity: 'Moderate', exercise: '3', sleep: '7.5', water: '3', appetite: '3', energy: '3', stress: '3', wellness: '3',
    emailNotifications: true, portalNotifications: true, orderUpdates: true, checkinReminders: true, documentNotifications: true, supportNotifications: true,
    signature: 'Research Client', terms: true, privacy: true, ruo: true, noMedical: true, electronic: true, progressData: true, photos: false,
    ...overrides,
  }
}

describe('portal onboarding completion', () => {
  it('requires every client intake step before review', () => {
    const form = completeForm()
    for (let step = 0; step <= 7; step += 1) expect(isPortalOnboardingStepComplete(step, form)).toBe(true)
    expect(isPortalOnboardingComplete(form)).toBe(true)
    expect(firstIncompleteOnboardingStep(form)).toBe(-1)
  })

  it.each([
    [0, { mobile: '' }],
    [1, { currentWeight: '' }],
    [2, { goals: [] }],
    [3, { interestedProducts: [] }],
    [4, { exercise: '' }],
    [5, { emailNotifications: false, portalNotifications: false, orderUpdates: false, checkinReminders: false, documentNotifications: false, supportNotifications: false }],
    [6, { progressData: false }],
  ] as Array<[number, Partial<PortalOnboardingForm>]>)('blocks an incomplete step %s', (step, overrides) => {
    const form = completeForm(overrides)
    expect(isPortalOnboardingStepComplete(step, form)).toBe(false)
    expect(firstIncompleteOnboardingStep(form)).toBe(step)
    expect(isPortalOnboardingComplete(form)).toBe(false)
  })

  it('rejects invalid numeric values and permits the optional preferred name and photo consent', () => {
    expect(isPortalOnboardingComplete(completeForm({ preferredName: '', photos: false }))).toBe(true)
    expect(isPortalOnboardingStepComplete(1, completeForm({ height: '0' }))).toBe(false)
    expect(isPortalOnboardingStepComplete(4, completeForm({ exercise: '-1' }))).toBe(false)
    expect(isPortalOnboardingStepComplete(4, completeForm({ sleep: 'Infinity' }))).toBe(false)
    expect(isPortalOnboardingStepComplete(4, completeForm({ water: '6' }))).toBe(false)
  })
})
