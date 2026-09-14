export type PortalOnboardingForm = {
  legalName: string
  preferredName: string
  mobile: string
  language: string
  timeZone: string
  dateOfBirth: string
  goals: string[]
  researchInterests: string[]
  interestedProducts: string[]
  activity: string
  exercise: string
  sleep: string
  water: string
  energy: string
  stress: string
  wellness: string
  emailNotifications: boolean
  portalNotifications: boolean
  orderUpdates: boolean
  checkinReminders: boolean
  documentNotifications: boolean
  supportNotifications: boolean
  signature: string
  terms: boolean
  privacy: boolean
  ruo: boolean
  noMedical: boolean
  electronic: boolean
  progressData: boolean
  photos: boolean
}

const requiredConsentKeys = ['terms', 'privacy', 'ruo', 'noMedical', 'electronic', 'progressData'] as const
const notificationKeys = ['emailNotifications', 'portalNotifications', 'orderUpdates', 'checkinReminders', 'documentNotifications', 'supportNotifications'] as const
const ratingKeys = ['water', 'energy', 'stress', 'wellness'] as const

function isPositiveNumber(value: string, max = Number.POSITIVE_INFINITY) {
  const number = Number(value)
  return value.trim() !== '' && Number.isFinite(number) && number > 0 && number <= max
}

function isIntegerInRange(value: string, minimum: number, maximum: number) {
  const number = Number(value)
  return value.trim() !== '' && Number.isInteger(number) && number >= minimum && number <= maximum
}

export function isPortalOnboardingStepComplete(step: number, form: PortalOnboardingForm) {
  if (step === 0) {
    return [form.legalName, form.mobile, form.language, form.timeZone].every((value) => value.trim().length > 0)
  }

  // Step 1 is date of birth alone. Height, weight, waist, and the appetite
  // rating were removed: the portal does not record body composition.
  if (step === 1) return Boolean(form.dateOfBirth.trim())

  if (step === 2) return form.goals.length > 0
  if (step === 3) return form.researchInterests.length > 0 && form.interestedProducts.length > 0

  if (step === 4) {
    return Boolean(
      form.activity.trim() &&
      isIntegerInRange(form.exercise, 0, 14) &&
      isPositiveNumber(form.sleep, 24) &&
      ratingKeys.every((key) => isIntegerInRange(form[key], 1, 5)),
    )
  }

  if (step === 5) return notificationKeys.some((key) => form[key])

  if (step === 6) {
    return form.signature.trim().length > 0 && requiredConsentKeys.every((key) => form[key])
  }

  if (step === 7) return firstIncompleteOnboardingStep(form) === -1
  return false
}

export function firstIncompleteOnboardingStep(form: PortalOnboardingForm) {
  for (let step = 0; step <= 6; step += 1) {
    if (!isPortalOnboardingStepComplete(step, form)) return step
  }
  return -1
}

export function isPortalOnboardingComplete(form: PortalOnboardingForm) {
  return firstIncompleteOnboardingStep(form) === -1
}
