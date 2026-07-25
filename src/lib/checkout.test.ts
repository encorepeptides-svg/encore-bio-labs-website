import { describe, expect, it, vi } from 'vitest'
import { completeOrderRequest, isCheckoutFormValid, isValidEmail, isValidPhone, normalizeCheckoutTextFields } from './checkout'

const validForm = {
  email: 'researcher@example.test',
  phone: '5551234567',
  fullName: 'Test Researcher',
  address: '100 Test Way',
  city: 'El Paso',
  state: 'TX',
  zip: '79901',
  researchUseAcknowledged: true,
}

describe('checkout validation and persistence', () => {
  it('requires valid contact, shipping, and research-use fields', () => {
    expect(isCheckoutFormValid(validForm)).toBe(true)
    expect(isCheckoutFormValid({ ...validForm, email: 'invalid' })).toBe(false)
    expect(isCheckoutFormValid({ ...validForm, address: '' })).toBe(false)
    expect(isCheckoutFormValid({ ...validForm, researchUseAcknowledged: false })).toBe(false)
  })

  it('trims whitespace before validation and persistence', () => {
    const padded = Object.fromEntries(Object.entries(validForm).map(([key, value]) => [key, typeof value === 'string' ? `  ${value}  ` : value])) as typeof validForm
    expect(isCheckoutFormValid(padded)).toBe(true)
    expect(normalizeCheckoutTextFields({ ...padded, notes: '  Please confirm  ' })).toMatchObject({
      email: validForm.email,
      phone: validForm.phone,
      fullName: validForm.fullName,
      notes: 'Please confirm',
    })
  })

  it('rejects implausible email and phone values without excluding international formats', () => {
    expect(isValidEmail('a@b.c')).toBe(false)
    expect(isValidPhone('0000000')).toBe(false)
    expect(isValidEmail('investigación@ejemplo.mx')).toBe(true)
    expect(isValidPhone('+52 656 123 4567')).toBe(true)
  })

  it('allows unicode and emoji in names but rejects excessive field lengths', () => {
    expect(isCheckoutFormValid({ ...validForm, fullName: 'María 🧪 研究' })).toBe(true)
    expect(isCheckoutFormValid({ ...validForm, fullName: '🧪'.repeat(121) })).toBe(false)
    expect(isCheckoutFormValid({ ...validForm, email: `${'a'.repeat(245)}@example.com` })).toBe(false)
    expect(isCheckoutFormValid({ ...validForm, address: 'A'.repeat(251) })).toBe(false)
  })

  it('clears the cart only after persistence succeeds', async () => {
    const clearCart = vi.fn()
    await completeOrderRequest(() => Promise.resolve(), clearCart)
    expect(clearCart).toHaveBeenCalledOnce()
  })

  it('preserves the cart when remote persistence fails', async () => {
    const clearCart = vi.fn()
    await expect(completeOrderRequest(() => Promise.reject(new Error('offline')), clearCart)).rejects.toThrow('offline')
    expect(clearCart).not.toHaveBeenCalled()
  })
})
