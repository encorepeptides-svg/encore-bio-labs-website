import { createClient } from 'jsr:@supabase/supabase-js@2'

const JSON_HEADERS = { 'content-type': 'application/json; charset=utf-8' }
const SUPPORTED_EVENTS = new Set([
  'refund.created',
  'refund.updated',
  'payment.refunded',
  'chargeback.opened',
  'chargeback.lost',
  'chargeback.won',
  'chargeback.reversed',
])
const MAX_CLOCK_SKEW_SECONDS = 300

type AccountingEvent = {
  id: string
  type: string
  provider: string
  order_reference: string
  payment_transaction_id?: string | null
  object_id?: string | null
  amount_cents?: number | null
  cumulative_amount_cents?: number | null
  currency?: string | null
  occurred_at: string
  reason?: string | null
  data?: Record<string, unknown>
}

function response(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: JSON_HEADERS })
}

function text(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

function integer(value: unknown) {
  if (value === null || value === undefined || value === '') return null
  const parsed = Number(value)
  return Number.isSafeInteger(parsed) ? parsed : null
}

function hex(bytes: ArrayBuffer) {
  return [...new Uint8Array(bytes)].map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

function constantTimeEqual(left: string, right: string) {
  const encoder = new TextEncoder()
  const a = encoder.encode(left)
  const b = encoder.encode(right)
  if (a.length !== b.length) return false
  let mismatch = 0
  for (let index = 0; index < a.length; index += 1) mismatch |= a[index] ^ b[index]
  return mismatch === 0
}

async function verifySignature(rawBody: string, timestamp: string, signatureHeader: string, secret: string) {
  const timestampSeconds = Number(timestamp)
  if (!Number.isInteger(timestampSeconds)) return false
  if (Math.abs(Math.floor(Date.now() / 1000) - timestampSeconds) > MAX_CLOCK_SKEW_SECONDS) return false
  const received = signatureHeader.startsWith('v1=') ? signatureHeader.slice(3) : signatureHeader
  if (!/^[a-f0-9]{64}$/i.test(received)) return false
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const expected = hex(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${timestamp}.${rawBody}`)))
  return constantTimeEqual(expected.toLowerCase(), received.toLowerCase())
}

function parseEvent(payload: unknown): AccountingEvent | null {
  if (!payload || typeof payload !== 'object') return null
  const value = payload as Record<string, unknown>
  const amountCents = integer(value.amount_cents)
  const cumulativeAmountCents = integer(value.cumulative_amount_cents)
  const occurredAt = text(value.occurred_at)
  const event: AccountingEvent = {
    id: text(value.id),
    type: text(value.type),
    provider: text(value.provider),
    order_reference: text(value.order_reference),
    payment_transaction_id: text(value.payment_transaction_id) || null,
    object_id: text(value.object_id) || null,
    amount_cents: amountCents,
    cumulative_amount_cents: cumulativeAmountCents,
    currency: text(value.currency).toUpperCase() || 'USD',
    occurred_at: occurredAt,
    reason: text(value.reason) || null,
    data: value.data && typeof value.data === 'object' ? value.data as Record<string, unknown> : {},
  }
  if (!event.id || !event.provider || !event.order_reference || !SUPPORTED_EVENTS.has(event.type)) return null
  if (!occurredAt || Number.isNaN(Date.parse(occurredAt))) return null
  if (amountCents !== null && amountCents <= 0) return null
  if (cumulativeAmountCents !== null && cumulativeAmountCents < 0) return null
  if (!/^[A-Z]{3}$/.test(event.currency || '')) return null
  if (event.type.startsWith('chargeback.') && amountCents === null) return null
  if (event.type === 'refund.created' && amountCents === null) return null
  if (['refund.updated', 'payment.refunded'].includes(event.type) && amountCents === null && cumulativeAmountCents === null) return null
  return event
}

Deno.serve(async (request) => {
  if (request.method !== 'POST') return response({ error: 'method_not_allowed' }, 405)

  const secret = Deno.env.get('PAYMENT_ACCOUNTING_WEBHOOK_SECRET') || ''
  const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
  if (!secret || !supabaseUrl || !serviceKey) return response({ error: 'webhook_not_configured' }, 503)

  const rawBody = await request.text()
  const timestamp = request.headers.get('x-encore-timestamp') || ''
  const signature = request.headers.get('x-encore-signature') || ''
  if (!await verifySignature(rawBody, timestamp, signature, secret)) {
    return response({ error: 'invalid_signature' }, 401)
  }

  let payload: unknown
  try {
    payload = JSON.parse(rawBody)
  } catch {
    return response({ error: 'invalid_json' }, 400)
  }
  const event = parseEvent(payload)
  if (!event) return response({ error: 'invalid_event' }, 422)

  const client = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const { data, error } = await client.rpc('record_distributor_payment_event', {
    target_provider: event.provider,
    target_event_id: event.id,
    target_event_type: event.type,
    target_order_reference: event.order_reference,
    target_provider_transaction_id: event.payment_transaction_id,
    target_external_object_id: event.object_id,
    target_amount_cents: event.amount_cents,
    target_cumulative_amount_cents: event.cumulative_amount_cents,
    target_currency: event.currency,
    target_occurred_at: event.occurred_at,
    target_reason: event.reason,
    target_payload: { ...event.data, normalized_event: payload },
  })
  if (error) {
    console.error('[payment-accounting-webhook] rpc failed', { eventId: event.id, code: error.code })
    return response({ error: 'processing_unavailable' }, 503)
  }
  if (!data?.ok) {
    console.error('[payment-accounting-webhook] event failed', { eventId: event.id, code: data?.code })
    return response({ error: 'event_processing_failed', event_id: event.id }, 500)
  }
  return response({ received: true, duplicate: data.duplicate === true, ignored: data.ignored === true })
})
