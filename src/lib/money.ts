import type { Locale } from '../i18n/config'

/**
 * Single source of truth for rendering a price.
 *
 * All catalog prices are USD. On Spanish pages the currency must be explicit:
 * Mexico writes pesos with the same "$" sign, so a bare "$119" reads as roughly
 * seven US dollars to a Mexican customer instead of one hundred nineteen.
 *
 * The active locale is published here by LocaleProvider so that price helpers
 * called outside React (cart totals, checkout summaries, WhatsApp handoff text)
 * format correctly without threading `locale` through every call site.
 */
let currentLocale: Locale = 'en'

export function setMoneyLocale(locale: Locale) {
  currentLocale = locale
}

export function formatMoney(value: number, locale?: Locale): string {
  const active = locale ?? currentLocale
  const rounded = Math.round((value + Number.EPSILON) * 100) / 100
  const amount = rounded.toLocaleString('en-US', {
    minimumFractionDigits: Number.isInteger(rounded) ? 0 : 2,
    maximumFractionDigits: 2,
  })
  return active === 'es' ? `USD $${amount}` : `$${amount}`
}

/** Per-unit prices (e.g. price per mg) keep more precision but the same currency rule. */
export function formatUnitMoney(value: number, locale?: Locale): string {
  const active = locale ?? currentLocale
  const amount = value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 })
  return active === 'es' ? `USD $${amount}` : `$${amount}`
}
