import { describe, expect, it } from 'vitest'
import {
  ACKNOWLEDGMENT_POLICY_VERSIONS,
  acknowledgmentContent,
  acknowledgmentPolicies,
  CHECKOUT_ACKNOWLEDGMENT_IDS,
  createCheckoutAcknowledgmentAudit,
  createEmptyCheckoutAcknowledgmentState,
  getCheckoutAcknowledgmentLanguage,
  isCheckoutAcknowledgmentComplete,
} from './acknowledgmentContent'

describe('bilingual acknowledgment content', () => {
  it('keeps five equivalent, independent checkout acknowledgments in each locale', () => {
    expect(CHECKOUT_ACKNOWLEDGMENT_IDS).toEqual([
      'age',
      'researchOnly',
      'noConsumption',
      'noAdvice',
      'policies',
    ])
    expect(getCheckoutAcknowledgmentLanguage('en')).toEqual([
      'I confirm that I am at least 18 years old.',
      'I understand that these products are sold exclusively for laboratory research.',
      'I confirm that these products will not be used for human or animal consumption.',
      'I understand that Encore Bio Labs does not provide medical advice, treatment recommendations, dosing instructions, or administration guidance.',
      'I agree to the Terms, Privacy Policy, Research Use Only Policy, and Shipping and Returns Policy.',
    ])
    expect(getCheckoutAcknowledgmentLanguage('es')).toEqual([
      'Confirmo que tengo al menos 18 años.',
      'Entiendo que estos productos se venden exclusivamente para investigación de laboratorio.',
      'Confirmo que estos productos no se utilizarán para consumo humano o animal.',
      'Entiendo que Encore Bio Labs no proporciona consejos médicos, recomendaciones de tratamiento, dosis ni instrucciones de administración.',
      'Acepto los Términos, la Política de Privacidad, la Política de Uso Exclusivo para Investigación y la Política de Envíos y Devoluciones.',
    ])
    expect(acknowledgmentContent.en.entry.confirmations).toHaveLength(3)
    expect(acknowledgmentContent.es.entry.confirmations).toHaveLength(3)
  })

  it('uses one canonical set of policy links and version identifiers', () => {
    expect(acknowledgmentPolicies.map(({ id, href }) => ({ id, href }))).toEqual([
      { id: 'terms', href: '/legal/terms' },
      { id: 'privacy', href: '/legal/privacy' },
      { id: 'researchUseOnly', href: '/legal/research-use-only' },
      { id: 'shippingReturns', href: '/legal/shipping-returns' },
    ])
    expect(ACKNOWLEDGMENT_POLICY_VERSIONS).toEqual({
      terms: 'terms-2026-07-07',
      privacy: 'privacy-2026-07-07',
      researchUseOnly: 'research-use-only-2026-07-26',
      shippingReturns: 'shipping-returns-2026-07-20',
    })
  })

  it('starts unchecked and creates a complete per-order audit payload only on submission', () => {
    const state = createEmptyCheckoutAcknowledgmentState()
    expect(Object.values(state)).toEqual([false, false, false, false, false])
    expect(isCheckoutAcknowledgmentComplete(state)).toBe(false)
    expect(isCheckoutAcknowledgmentComplete({
      age: true,
      researchOnly: true,
      noConsumption: true,
      noAdvice: true,
      policies: true,
    })).toBe(true)

    const audit = createCheckoutAcknowledgmentAudit('es', '2026-07-26T12:00:00.000Z')
    expect(audit).toMatchObject({
      version: 'checkout-ruo-v1',
      acceptedAt: '2026-07-26T12:00:00.000Z',
      locale: 'es',
      confirmedStatementIds: CHECKOUT_ACKNOWLEDGMENT_IDS,
      policyVersions: ACKNOWLEDGMENT_POLICY_VERSIONS,
    })
    expect(audit.exactLanguage).toEqual(getCheckoutAcknowledgmentLanguage('es'))
  })
})
