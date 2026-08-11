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
}

describe('checkout validation and persistence', () => {
  it('requires a phone and valid shipping fields while keeping email optional', () => {
    expect(isCheckoutFormValid(validForm)).toBe(true)
    expect(isCheckoutFormValid({ ...validForm, email: '' })).toBe(true)
    expect(isCheckoutFormValid({ ...validForm, email: 'invalid' })).toBe(false)
    expect(isCheckoutFormValid({ ...validForm, phone: '' })).toBe(false)
    expect(isCheckoutFormValid({ ...validForm, address: '' })).toBe(false)
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
