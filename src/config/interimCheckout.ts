import { WHATSAPP_PHONE } from '../lib/whatsapp'

/**
 * Interim checkout configuration — the WhatsApp/Instagram handoff that stands
 * in until a card processor is integrated. Everything an operator may need to
 * change without a code change lives here or in env variables.
 */

// Digits only, country code included (e.g. 19153595448).
export const BUSINESS_WHATSAPP_PHONE = (import.meta.env.VITE_WHATSAPP_PHONE as string | undefined)?.replaceAll(/\D/g, '') || WHATSAPP_PHONE

// Instagram business username, no @ (used in https://ig.me/m/<username>).
export const BUSINESS_INSTAGRAM_USERNAME = (import.meta.env.VITE_INSTAGRAM_USERNAME as string | undefined)?.replace(/^@/, '') || 'encorebiolabs'

export type InterimPaymentMethodId = 'bank_transfer' | 'paypal' | 'venmo' | 'cashapp' | 'cash_on_delivery'

export type InterimPaymentMethod = {
  id: InterimPaymentMethodId
  enabled: boolean
  /**
   * Operator-facing payment destination shown to the customer (account details,
   * handle, or link). Leave empty to hide the method even when enabled —
   * a method with no destination cannot receive money.
   */
  details: string[]
}

// Toggle methods on/off here. A method renders only when `enabled` is true AND
// it has details to show (cash_on_delivery needs none).
export const INTERIM_PAYMENT_METHODS: InterimPaymentMethod[] = [
  {
    id: 'bank_transfer',
    enabled: false,
    // e.g. ['Bank: <bank name>', 'Account: <number>', 'Routing: <number>', 'Name: Encore Bio Labs']
    details: [],
  },
  {
    id: 'paypal',
    enabled: false,
    // e.g. ['paypal.me/encorebiolabs']
    details: [],
  },
  {
    id: 'venmo',
    enabled: false,
    // e.g. ['@encorebiolabs']
    details: [],
  },
  {
    id: 'cashapp',
    enabled: false,
    // e.g. ['$encorebiolabs']
    details: [],
  },
  {
    id: 'cash_on_delivery',
    enabled: true,
    details: [],
  },
]

export function getEnabledPaymentMethods(methods: InterimPaymentMethod[] = INTERIM_PAYMENT_METHODS) {
  return methods.filter((method) => method.enabled && (method.id === 'cash_on_delivery' || method.details.length > 0))
}
