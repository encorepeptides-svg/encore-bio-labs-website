// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest'
import { CHECKOUT_SESSION_KEY, readStoredForm } from './CheckoutPage'

// Language switching is a full page reload to the same route (see i18n/LocaleContext.tsx),
// so an in-progress checkout form only survives that reload because its draft values are
// persisted to sessionStorage rather than kept solely in React state. This test proves that
// persistence contract holds, independent of language.
describe('checkout draft persistence across a reload (language switch)', () => {
  beforeEach(() => {
    window.sessionStorage.clear()
  })

  it('rehydrates a saved draft instead of resetting it', () => {
    window.sessionStorage.setItem(
      CHECKOUT_SESSION_KEY,
      JSON.stringify({ email: 'researcher@example.com', phone: '+1 915 555 0100', fullName: 'Jordan Rivera', country: 'MX', preferredContact: 'email', notes: 'Ship to lab entrance' }),
    )

    const restored = readStoredForm()
    expect(restored.email).toBe('researcher@example.com')
    expect(restored.phone).toBe('+1 915 555 0100')
    expect(restored.fullName).toBe('Jordan Rivera')
    expect(restored.country).toBe('MX')
    expect(restored.notes).toBe('Ship to lab entrance')
  })

  it('starts from a clean default when no draft was saved, without throwing', () => {
    const restored = readStoredForm()
    expect(restored.email).toBe('')
    expect(restored.researchUseAcknowledged).toBe(false)
  })
})
