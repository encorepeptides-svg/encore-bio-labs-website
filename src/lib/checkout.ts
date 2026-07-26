export type CheckoutValidationData = {
  email: string
  phone: string
  fullName: string
  address: string
  streetNumber?: string
  neighborhood?: string
  neighborhoodRequired?: boolean
  city: string
  state: string
  zip: string
  researchUseAcknowledged: boolean
}

const fieldLimits: Partial<Record<keyof CheckoutValidationData, number>> = {
  email: 254,
  phone: 50,
  fullName: 120,
  address: 250,
  streetNumber: 32,
  neighborhood: 120,
  city: 120,
  state: 120,
  zip: 12,
}

export function normalizeCheckoutTextFields<T extends Record<string, unknown>>(data: T): T {
  return Object.fromEntries(
    Object.entries(data).map(([key, value]) => [key, typeof value === 'string' ? value.trim() : value]),
  ) as T
}

export function isValidEmail(value: string) {
  const email = value.trim()
  if (!email || email.length > fieldLimits.email!) return false
  const at = email.lastIndexOf('@')
  if (at <= 0 || at !== email.indexOf('@')) return false
  const local = email.slice(0, at)
  const labels = email.slice(at + 1).split('.')
  return local.length <= 64 &&
    !local.startsWith('.') &&
    !local.endsWith('.') &&
    !local.includes('..') &&
    labels.length >= 2 &&
    labels.every((label) => label.length > 0 && label.length <= 63 && !/\s/u.test(label)) &&
    Array.from(labels.at(-1) ?? '').length >= 2
}

export function isValidPhone(value: string) {
  const digits = value.trim().replace(/\D/g, '')
  return digits.length >= 7 && digits.length <= 15 && !/^(\d)\1+$/.test(digits)
}

export function isCheckoutFormValid(data: CheckoutValidationData) {
  const normalized = normalizeCheckoutTextFields(data)
  return isValidEmail(normalized.email) &&
    isValidPhone(normalized.phone) &&
    [normalized.fullName, normalized.address, normalized.city, normalized.state, normalized.zip].every((value) => value.length > 0) &&
    (normalized.streetNumber === undefined || normalized.streetNumber.length > 0) &&
    (!normalized.neighborhoodRequired || Boolean(normalized.neighborhood)) &&
    Object.entries(fieldLimits).every(([key, limit]) => {
      const value = normalized[key as keyof CheckoutValidationData]
      return typeof value !== 'string' || value.length <= limit
    }) &&
    normalized.researchUseAcknowledged
}

export async function completeOrderRequest(save: () => Promise<void>, clearCart: () => void) {
  await save()
  clearCart()
}
