import { describe, expect, it, vi } from 'vitest'
import { completeOrderRequest, isCheckoutFormValid } from './checkout'

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
