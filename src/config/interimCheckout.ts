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
  /**
   * Optional one-tap payment link rendered as a button under the details.
   * Only some rails have one: PayPal and Apple Cash (via Messages) do, Zelle
   * has none at all, and Cash App needs a $cashtag rather than a phone number.
   * Where there is no link the details above are what the customer copies.
   */
  link?: { url: string; labelEn: string; labelEs: string }
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
    details: ['encorebiolabs@gmail.com'],
    // Legacy Website Payments Standard link. It prefills the recipient and the
    // note, and the customer types the amount. Confirm it once against the live
    // account: PayPal has been retiring _xclick, and a PayPal.Me handle is the
    // durable replacement if this ever stops resolving.
    link: {
      url: 'https://www.paypal.com/cgi-bin/webscr?cmd=_xclick&business=encorebiolabs%40gmail.com&item_name=Encore%20Bio%20Labs%20order&currency_code=USD',
      labelEn: 'Pay with PayPal',
      labelEs: 'Pagar con PayPal',
    },
  },
  {
    id: 'cashapp',
    enabled: true,
    // A cash.app/$cashtag/<amount> link needs the $cashtag, which is not the
    // same as the phone number on the account. Until that is filled in the
    // customer sends to the number by hand.
    details: ['9154128874'],
  },
  {
    id: 'zelle',
    enabled: true,
    // Zelle has no web link by design — it lives inside each bank's own app,
    // so this is copied, not clicked. The memo field carries the reference.
    details: ['9153595448'],
  },
  {
    id: 'apple_pay',
    enabled: true,
    // Person-to-person Apple Pay is Apple Cash, sent through Messages to a phone
    // number (not a public handle).
    details: ['9154128874'],
    // Opens Messages with the recipient prefilled; the sender attaches Apple
    // Cash there. Works on iPhone/iPad/Mac, and is inert elsewhere.
    link: {
      url: 'sms:+19154128874',
      labelEn: 'Open Messages to send Apple Cash',
      labelEs: 'Abrir Mensajes para enviar Apple Cash',
    },
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
