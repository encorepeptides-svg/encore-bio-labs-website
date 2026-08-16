import { createClient } from 'npm:@supabase/supabase-js@2.110.1'

type TrackableEvent = 'referral_link_clicked' | 'unique_visitor_recorded' | 'product_viewed' | 'checkout_started'

const TRACKABLE_EVENTS = new Set<TrackableEvent>([
  'referral_link_clicked',
  'unique_visitor_recorded',
  'product_viewed',
  'checkout_started',
])
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const CODE = /^[A-Z0-9][A-Z0-9_-]{2,31}$/
const SAFE_SLUG = /^[a-z0-9][a-z0-9_-]{7,39}$/
const BOT = /bot|crawler|spider|headless|preview|facebookexternalhit|slurp|wget|curl/i

function text(value: unknown, max = 200) {
  return typeof value === 'string' ? value.trim().slice(0, max) : ''
}

function getSecretKey() {
  const legacy = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (legacy) return legacy
  try {
    return (JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS') || '{}') as Record<string, string>).default || ''
  } catch {
    return ''
  }
}

function cors(origin: string | null) {
  const configured = (Deno.env.get('STOREFRONT_ALLOWED_ORIGINS') || '').split(',').map((item) => item.trim()).filter(Boolean)
  const allowed = !origin || !configured.length || configured.includes(origin)
  return {
    'access-control-allow-origin': allowed && origin ? origin : configured[0] || '*',
    'access-control-allow-headers': 'authorization, x-client-info, apikey, content-type',
    'access-control-allow-methods': 'POST, OPTIONS',
    vary: 'Origin',
  }
}

function json(body: unknown, status: number, origin: string | null) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors(origin), 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  })
}

Deno.serve(async (request) => {
  const origin = request.headers.get('origin')
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors(origin) })
  if (request.method !== 'POST') return json({ code: 'method_not_allowed' }, 405, origin)
  const allowedOrigins = (Deno.env.get('STOREFRONT_ALLOWED_ORIGINS') || '').split(',').map((item) => item.trim()).filter(Boolean)
  if (origin && allowedOrigins.length && !allowedOrigins.includes(origin)) return json({ code: 'origin_not_allowed' }, 403, origin)
  if (BOT.test(request.headers.get('user-agent') || '') || request.headers.get('x-encore-internal-traffic') === '1') {
    return json({ accepted: false, reason: 'filtered_traffic' }, 202, origin)
  }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return json({ code: 'invalid_json' }, 400, origin)
  }

  const eventType = text(body.eventType, 40) as TrackableEvent
  const referralCode = text(body.referralCode, 32).toUpperCase()
  const linkSlug = text(body.linkSlug, 40).toLowerCase()
  const consentState = text(body.consentState, 20)
  const visitorId = text(body.visitorId, 36)
  const sessionId = text(body.sessionId, 36)
  const idempotencyKey = text(body.idempotencyKey, 180)
  if (!TRACKABLE_EVENTS.has(eventType) || !CODE.test(referralCode) || !idempotencyKey || !UUID.test(sessionId)) {
    return json({ code: 'invalid_event' }, 400, origin)
  }
  if (eventType !== 'referral_link_clicked' && consentState !== 'accepted') {
    return json({ accepted: false, reason: 'analytics_consent_required' }, 202, origin)
  }
  if (consentState === 'accepted' && !UUID.test(visitorId)) return json({ code: 'invalid_visitor' }, 400, origin)

  const occurredAt = new Date(text(body.occurredAt, 40))
  const now = Date.now()
  if (!Number.isFinite(occurredAt.getTime()) || occurredAt.getTime() > now + 5 * 60_000 || occurredAt.getTime() < now - 24 * 60 * 60_000) {
    return json({ code: 'invalid_timestamp' }, 400, origin)
  }

  const url = Deno.env.get('SUPABASE_URL') || ''
  const key = getSecretKey()
  if (!url || !key) return json({ code: 'service_unavailable' }, 503, origin)
  const client = createClient(url, key, { auth: { persistSession: false } })
  const { data: account, error: accountError } = await client.from('distributor_accounts')
    .select('id,attribution_window_days')
    .eq('referral_code', referralCode)
    .eq('status', 'active')
    .maybeSingle()
  if (accountError) return json({ code: 'service_unavailable' }, 503, origin)
  if (!account) return json({ accepted: false, reason: 'invalid_referral' }, 202, origin)

  let link: { id: string; campaign_id: string | null; sub_id: string | null; channel: string } | null = null
  if (linkSlug) {
    if (!SAFE_SLUG.test(linkSlug)) return json({ code: 'invalid_link' }, 400, origin)
    const result = await client.from('distributor_partner_links')
      .select('id,campaign_id,sub_id,channel')
      .eq('slug', linkSlug)
      .eq('distributor_id', account.id)
      .eq('active', true)
      .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
      .maybeSingle()
    if (result.error) return json({ code: 'service_unavailable' }, 503, origin)
    link = result.data
  }

  const metadataInput = body.metadata && typeof body.metadata === 'object' && !Array.isArray(body.metadata)
    ? body.metadata as Record<string, unknown>
    : {}
  const metadata = Object.fromEntries(Object.entries(metadataInput).slice(0, 20).map(([name, value]) => [text(name, 60), typeof value === 'string' ? text(value, 240) : value]))
  const record = {
    id: crypto.randomUUID(),
    event_type: eventType,
    distributor_id: account.id,
    campaign_id: link?.campaign_id ?? null,
    partner_link_id: link?.id ?? null,
    sub_id: link?.sub_id ?? (text(body.subId, 64) || null),
    anonymous_visitor_id: consentState === 'accepted' ? visitorId : null,
    session_id: sessionId,
    product_id: eventType === 'product_viewed' ? text(body.productId, 160) || null : null,
    occurred_at: occurredAt.toISOString(),
    landing_url: text(body.landingUrl, 1000) || null,
    referrer: consentState === 'accepted' ? text(body.referrer, 1000) || null : null,
    channel: link?.channel ?? (text(body.channel, 30) || null),
    utm_source: text(body.utmSource, 100) || null,
    utm_medium: text(body.utmMedium, 100) || null,
    utm_campaign: text(body.utmCampaign, 100) || null,
    utm_term: text(body.utmTerm, 100) || null,
    utm_content: text(body.utmContent, 100) || null,
    device_category: ['mobile', 'tablet', 'desktop', 'other'].includes(text(body.deviceCategory, 20)) ? text(body.deviceCategory, 20) : 'other',
    consent_state: eventType === 'referral_link_clicked' ? 'essential' : 'accepted',
    attribution_window_days: account.attribution_window_days,
    metadata,
    idempotency_key: idempotencyKey,
  }
  const { error } = await client.from('distributor_attribution_events').insert(record)
  if (error?.code === '23505') return json({ accepted: true, duplicate: true }, 200, origin)
  if (error) {
    console.error('[distributor-attribution] insert failed', { code: error.code, eventType })
    return json({ code: 'service_unavailable' }, 503, origin)
  }
  return json({ accepted: true, duplicate: false }, 201, origin)
})
