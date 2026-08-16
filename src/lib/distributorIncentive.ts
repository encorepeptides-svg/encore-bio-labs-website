import type { Locale } from '../i18n/config'
import { isSupabaseConfigured, supabase } from './supabaseClient'
import { normalizeReferralCode } from './referralAttribution'

export const DEFAULT_DISTRIBUTOR_DISCOUNT_RATE_BPS = 500
export const DEFAULT_DISTRIBUTOR_DISCOUNT_MAX_CENTS = 2_500

export type DistributorOfferValidation = {
  valid: boolean
  code: string | null
  rateBps: number
  maxCents: number
  message: { en: string; es: string }
}

export type DiscountSource = 'none' | 'volume_promotion' | 'distributor_incentive'

export type PromotionResolution = {
  discountSource: DiscountSource
  discountCents: number
  volumeDiscountCents: number
  distributorDiscountCents: number
  otherPromotionWon: boolean
}

export function calculateDistributorDiscountCents(
  subtotalCents: number,
  rateBps = DEFAULT_DISTRIBUTOR_DISCOUNT_RATE_BPS,
  maxCents = DEFAULT_DISTRIBUTOR_DISCOUNT_MAX_CENTS,
) {
  const safeSubtotal = Math.max(0, Math.round(subtotalCents))
  const safeRate = Math.max(0, Math.min(10_000, Math.round(rateBps)))
  const safeMaximum = Math.max(0, Math.round(maxCents))
  return Math.min(Math.round(safeSubtotal * safeRate / 10_000), safeMaximum)
}

/** Promotions never stack. A tie goes to the volume promotion so the one-time benefit is preserved. */
export function resolveDistributorPromotion({
  subtotalCents,
  volumeDiscountCents,
  eligible,
  rateBps = DEFAULT_DISTRIBUTOR_DISCOUNT_RATE_BPS,
  maxCents = DEFAULT_DISTRIBUTOR_DISCOUNT_MAX_CENTS,
}: {
  subtotalCents: number
  volumeDiscountCents: number
  eligible: boolean
  rateBps?: number
  maxCents?: number
}): PromotionResolution {
  const volume = Math.max(0, Math.round(volumeDiscountCents))
  const distributor = eligible ? calculateDistributorDiscountCents(subtotalCents, rateBps, maxCents) : 0
  if (volume > 0 && volume >= distributor) {
    return { discountSource: 'volume_promotion', discountCents: volume, volumeDiscountCents: volume, distributorDiscountCents: distributor, otherPromotionWon: distributor > 0 }
  }
  if (distributor > 0) {
    return { discountSource: 'distributor_incentive', discountCents: distributor, volumeDiscountCents: volume, distributorDiscountCents: distributor, otherPromotionWon: false }
  }
  return { discountSource: 'none', discountCents: 0, volumeDiscountCents: volume, distributorDiscountCents: 0, otherPromotionWon: false }
}

function invalidValidation(): DistributorOfferValidation {
  return {
    valid: false,
    code: null,
    rateBps: 0,
    maxCents: 0,
    message: {
      en: 'This distributor code is invalid or unavailable.',
      es: 'Este código de distribuidor no es válido o no está disponible.',
    },
  }
}

export async function validateDistributorCode(rawCode: string, locale: Locale): Promise<DistributorOfferValidation> {
  const code = normalizeReferralCode(rawCode)
  if (!code || !isSupabaseConfigured || !supabase) return invalidValidation()
  const { data, error } = await supabase.functions.invoke<DistributorOfferValidation>('shipping-checkout', {
    body: { action: 'validate_distributor_code', code, locale },
  })
  if (error || !data || typeof data.valid !== 'boolean') throw new Error('distributor_code_validation_unavailable')
  return {
    valid: data.valid,
    code: data.valid ? normalizeReferralCode(data.code) : null,
    rateBps: data.valid ? Math.max(0, Math.round(Number(data.rateBps) || 0)) : 0,
    maxCents: data.valid ? Math.max(0, Math.round(Number(data.maxCents) || 0)) : 0,
    message: {
      en: String(data.message?.en || invalidValidation().message.en),
      es: String(data.message?.es || invalidValidation().message.es),
    },
  }
}
