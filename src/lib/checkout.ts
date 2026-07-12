export type CheckoutValidationData = {
  email: string
  phone: string
  fullName: string
  address: string
  city: string
  state: string
  zip: string
  researchUseAcknowledged: boolean
}

export function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export function isCheckoutFormValid(data: CheckoutValidationData) {
  return isValidEmail(data.email) &&
    data.phone.trim().length >= 7 &&
    [data.fullName, data.address, data.city, data.state, data.zip].every((value) => value.trim().length > 0) &&
    data.researchUseAcknowledged
}

export async function completeOrderRequest(save: () => Promise<void>, clearCart: () => void) {
  await save()
  clearCart()
}
