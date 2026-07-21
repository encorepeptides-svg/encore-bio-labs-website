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

export type InterimPaymentMethodId = 'bank_transfer' | 'paypal' | 'venmo' | 'cashapp' | 'zelle' | 'apple_pay' | 'cash_on_delivery' | 'manual_review'

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
// it has details to show (cash_on_delivery needs none). The requested methods
// below are enabled but still need their real destination pasted into `details`
// — until then each stays hidden so an order can never point money nowhere.
// Replace every <...> placeholder with the real Encore handle/details.
export const INTERIM_PAYMENT_METHODS: InterimPaymentMethod[] = [
  {
    id: 'bank_transfer',
    enabled: true,
    details: [
      // 'Bank: <bank name>',
      // 'Account: <account number>',
      // 'Routing: <routing number>',
      // 'Account name: Encore Bio Labs',
    ],
  },
  {
    id: 'paypal',
    enabled: true,
    details: [
      // 'paypal.me/<encore-handle>'  — or the PayPal email that receives requests
    ],
  },
  {
    id: 'cashapp',
    enabled: true,
    details: [
      // '$<encore-cashtag>'
    ],
  },
  {
    id: 'zelle',
    enabled: true,
    details: [
      // '<zelle email or US phone number>'  (Zelle has a memo field for the reference)
    ],
  },
  {
    id: 'apple_pay',
    enabled: true,
    // Person-to-person Apple Pay is Apple Cash, sent through Messages to a phone
    // number (not a public handle). Put the receiving iPhone number here.
    details: [
      // '<Apple Cash iPhone number>'
    ],
  },
  {
    id: 'venmo',
    enabled: false,
    // e.g. ['@encorebiolabs']
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
