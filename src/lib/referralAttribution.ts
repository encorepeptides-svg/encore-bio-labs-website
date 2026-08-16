export const REFERRAL_COOKIE_NAME = 'encore_referral_v1'
export const REFERRAL_ATTRIBUTION_DAYS = 30

export type ReferralAttribution = {
  code: string
  capturedAt: string
  landingPath: string
  source: 'referral_link' | 'manual_code'
  customerDiscountRateBps: number
  customerDiscountMaxCents: number
  partnerLinkSlug?: string
  subId?: string
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  utmTerm?: string
  utmContent?: string
}

export const REFERRAL_CHANGE_EVENT = 'encore:referral-change'

const referralCodePattern = /^[A-Z0-9][A-Z0-9_-]{2,31}$/

export function normalizeReferralCode(value: string | null | undefined) {
  const normalized = value?.trim().toUpperCase() ?? ''
  return referralCodePattern.test(normalized) ? normalized : null
}

function readCookie(name: string) {
  if (typeof document === 'undefined') return null
  const prefix = `${name}=`
  const value = document.cookie.split(';').map((part) => part.trim()).find((part) => part.startsWith(prefix))
  return value ? value.slice(prefix.length) : null
}

export function readReferralAttribution(now = Date.now()): ReferralAttribution | null {
  const encoded = readCookie(REFERRAL_COOKIE_NAME)
  if (!encoded) return null

  try {
    const parsed = JSON.parse(decodeURIComponent(encoded)) as Partial<ReferralAttribution>
    const code = normalizeReferralCode(parsed.code)
    const capturedAt = typeof parsed.capturedAt === 'string' ? Date.parse(parsed.capturedAt) : Number.NaN
    const maxAgeMs = REFERRAL_ATTRIBUTION_DAYS * 24 * 60 * 60 * 1000
    if (!code || !Number.isFinite(capturedAt) || now - capturedAt > maxAgeMs || capturedAt > now + 60_000) return null
    return {
      code,
      capturedAt: new Date(capturedAt).toISOString(),
      landingPath: typeof parsed.landingPath === 'string' ? parsed.landingPath.slice(0, 300) : '/',
      source: parsed.source === 'manual_code' ? 'manual_code' : 'referral_link',
      customerDiscountRateBps: Math.max(0, Math.round(Number(parsed.customerDiscountRateBps) || 500)),
      customerDiscountMaxCents: Math.max(0, Math.round(Number(parsed.customerDiscountMaxCents) || 2_500)),
      partnerLinkSlug: typeof parsed.partnerLinkSlug === 'string' ? parsed.partnerLinkSlug.slice(0, 40) : undefined,
      subId: typeof parsed.subId === 'string' ? parsed.subId.slice(0, 64) : undefined,
      utmSource: typeof parsed.utmSource === 'string' ? parsed.utmSource.slice(0, 100) : undefined,
      utmMedium: typeof parsed.utmMedium === 'string' ? parsed.utmMedium.slice(0, 100) : undefined,
      utmCampaign: typeof parsed.utmCampaign === 'string' ? parsed.utmCampaign.slice(0, 100) : undefined,
      utmTerm: typeof parsed.utmTerm === 'string' ? parsed.utmTerm.slice(0, 100) : undefined,
      utmContent: typeof parsed.utmContent === 'string' ? parsed.utmContent.slice(0, 100) : undefined,
    }
  } catch {
    return null
  }
}

export function storeReferralAttribution(input: ReferralAttribution) {
  if (typeof document === 'undefined') return input
  const record: ReferralAttribution = {
    ...input,
    code: normalizeReferralCode(input.code) || '',
  }
  if (!record.code) return readReferralAttribution()
  const maxAge = REFERRAL_ATTRIBUTION_DAYS * 24 * 60 * 60
  const secure = window.location.protocol === 'https:' ? '; Secure' : ''
  document.cookie = `${REFERRAL_COOKIE_NAME}=${encodeURIComponent(JSON.stringify(record))}; Max-Age=${maxAge}; Path=/; SameSite=Lax${secure}`
  window.dispatchEvent(new CustomEvent(REFERRAL_CHANGE_EVENT, { detail: record }))
  return record
}

export function clearReferralAttribution() {
  if (typeof document === 'undefined') return
  const secure = window.location.protocol === 'https:' ? '; Secure' : ''
  document.cookie = `${REFERRAL_COOKIE_NAME}=; Max-Age=0; Path=/; SameSite=Lax${secure}`
  window.dispatchEvent(new CustomEvent(REFERRAL_CHANGE_EVENT, { detail: null }))
}

export function referralCandidate(location: Pick<Location, 'search' | 'pathname'> = window.location) {
  const params = new URLSearchParams(location.search)
  const code = normalizeReferralCode(params.get('ref'))
  if (!code) return null
  return {
    code,
    landingPath: location.pathname.slice(0, 300),
    partnerLinkSlug: params.get('pl')?.slice(0, 40) || undefined,
    subId: params.get('sub_id')?.slice(0, 64) || undefined,
    utmSource: params.get('utm_source')?.slice(0, 100) || undefined,
    utmMedium: params.get('utm_medium')?.slice(0, 100) || undefined,
    utmCampaign: params.get('utm_campaign')?.slice(0, 100) || undefined,
    utmTerm: params.get('utm_term')?.slice(0, 100) || undefined,
    utmContent: params.get('utm_content')?.slice(0, 100) || undefined,
  }
}

/**
 * Replaces attribution only after a trusted validator confirms an active code.
 * A malformed, invalid, or suspended replacement never erases a valid cookie.
 */
export async function validateAndStoreReferralCode(
  rawCode: string,
  validate: (code: string) => Promise<{ valid: boolean; code: string | null; rateBps: number; maxCents: number }>,
  context: {
    source: ReferralAttribution['source']
    landingPath?: string
    partnerLinkSlug?: string
    subId?: string
    utmSource?: string
    utmMedium?: string
    utmCampaign?: string
    utmTerm?: string
    utmContent?: string
  },
) {
  const code = normalizeReferralCode(rawCode)
  if (!code) return { valid: false as const, attribution: readReferralAttribution() }
  const result = await validate(code)
  const validatedCode = result.valid ? normalizeReferralCode(result.code) : null
  if (!result.valid || !validatedCode) return { valid: false as const, attribution: readReferralAttribution() }
  const attribution = storeReferralAttribution({
    code: validatedCode,
    capturedAt: new Date().toISOString(),
    landingPath: (context.landingPath || window.location.pathname).slice(0, 300),
    source: context.source,
    customerDiscountRateBps: result.rateBps,
    customerDiscountMaxCents: result.maxCents,
    partnerLinkSlug: context.partnerLinkSlug,
    subId: context.subId,
    utmSource: context.utmSource,
    utmMedium: context.utmMedium,
    utmCampaign: context.utmCampaign,
    utmTerm: context.utmTerm,
    utmContent: context.utmContent,
  })
  return { valid: true as const, attribution }
}
