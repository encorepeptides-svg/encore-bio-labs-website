import { isSupabaseConfigured, supabase } from './supabaseClient'
import type { ReferralAttribution } from './referralAttribution'

export const ANALYTICS_CONSENT_KEY = 'encore_analytics_consent_v1'
const VISITOR_COOKIE = 'encore_visitor_v1'
const SESSION_KEY = 'encore_attribution_session_v1'

export type AnalyticsConsent = 'accepted' | 'declined' | 'unknown'
export type DistributorBrowserEvent = 'referral_link_clicked' | 'unique_visitor_recorded' | 'product_viewed' | 'checkout_started'

export function getAnalyticsConsent(): AnalyticsConsent {
  if (typeof localStorage === 'undefined') return 'unknown'
  const value = localStorage.getItem(ANALYTICS_CONSENT_KEY)
  return value === 'accepted' || value === 'declined' ? value : 'unknown'
}

export function setAnalyticsConsent(value: Exclude<AnalyticsConsent, 'unknown'>) {
  localStorage.setItem(ANALYTICS_CONSENT_KEY, value)
  window.dispatchEvent(new CustomEvent('encore:analytics-consent', { detail: value }))
}

function readCookie(name: string) {
  const prefix = `${name}=`
  return document.cookie.split(';').map((value) => value.trim()).find((value) => value.startsWith(prefix))?.slice(prefix.length) ?? null
}

function visitorId(consent: AnalyticsConsent) {
  if (consent !== 'accepted') return null
  const existing = readCookie(VISITOR_COOKIE)
  if (existing) return existing
  const value = crypto.randomUUID()
  const secure = window.location.protocol === 'https:' ? '; Secure' : ''
  document.cookie = `${VISITOR_COOKIE}=${value}; Max-Age=31536000; Path=/; SameSite=Lax${secure}`
  return value
}

export function attributionSessionId() {
  const existing = sessionStorage.getItem(SESSION_KEY)
  if (existing) return existing
  const value = crypto.randomUUID()
  sessionStorage.setItem(SESSION_KEY, value)
  return value
}

function deviceCategory() {
  const width = window.innerWidth
  if (width < 768) return 'mobile'
  if (width < 1100) return 'tablet'
  return 'desktop'
}

export function distributorEventIdempotencyKey(eventType: DistributorBrowserEvent, attribution: ReferralAttribution, productId?: string) {
  return [eventType, attributionSessionId(), attribution.code, attribution.partnerLinkSlug || 'code', productId || 'none'].join(':')
}

export async function trackDistributorEvent(
  eventType: DistributorBrowserEvent,
  attribution: ReferralAttribution,
  input: { productId?: string; metadata?: Record<string, unknown> } = {},
) {
  if (!isSupabaseConfigured || !supabase || typeof window === 'undefined') return { accepted: false, reason: 'not_configured' }
  const consent = getAnalyticsConsent()
  if (eventType !== 'referral_link_clicked' && consent !== 'accepted') return { accepted: false, reason: 'analytics_consent_required' }
  const { data, error } = await supabase.functions.invoke<{ accepted: boolean; duplicate?: boolean; reason?: string }>('distributor-attribution', {
    body: {
      eventType,
      referralCode: attribution.code,
      linkSlug: attribution.partnerLinkSlug,
      subId: attribution.subId,
      visitorId: visitorId(consent),
      sessionId: attributionSessionId(),
      productId: input.productId,
      occurredAt: new Date().toISOString(),
      landingUrl: `${window.location.pathname}${window.location.search}`.slice(0, 1000),
      referrer: document.referrer,
      channel: attribution.utmSource || (attribution.source === 'manual_code' ? 'direct' : undefined),
      utmSource: attribution.utmSource,
      utmMedium: attribution.utmMedium,
      utmCampaign: attribution.utmCampaign,
      utmTerm: attribution.utmTerm,
      utmContent: attribution.utmContent,
      deviceCategory: deviceCategory(),
      consentState: eventType === 'referral_link_clicked' ? 'essential' : consent,
      metadata: input.metadata || {},
      idempotencyKey: distributorEventIdempotencyKey(eventType, attribution, input.productId),
    },
  })
  if (error) return { accepted: false, reason: 'service_unavailable' }
  return data ?? { accepted: false, reason: 'empty_response' }
}
