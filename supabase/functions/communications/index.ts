import { createClient } from 'npm:@supabase/supabase-js@2.110.1'

const SUPPORT = 'support@encorebiolabs.com'
const json = (body: unknown, status = 200, origin = '*') => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'access-control-allow-origin': origin, 'access-control-allow-headers': 'authorization, x-client-info, apikey, content-type', 'access-control-allow-methods': 'POST, OPTIONS', vary: 'Origin' } })
const clean = (value: unknown, max: number) => typeof value === 'string' ? value.replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, max) : ''
const email = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && !/[\r\n]/.test(value)
const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]!))

function confirmation(name: string, locale: string) {
  const spanish = locale === 'es'
  const heading = spanish ? 'Recibimos tu mensaje' : 'We received your message'
  const copy = spanish ? 'Gracias por comunicarte con Encore Bio Labs. Nuestro equipo responderá por correo electrónico.' : 'Thank you for contacting Encore Bio Labs. Our team will reply by email.'
  return `<div style="font-family:Arial,sans-serif;color:#071724;max-width:640px;margin:auto"><div style="padding:24px;background:#071724;color:#d5fff9;font-weight:700;font-size:22px">encore bio labs</div><main style="padding:28px"><h1>${heading}</h1><p>${escapeHtml(name)}, ${copy}</p></main><footer style="padding:20px;color:#52606d;font-size:13px;border-top:1px solid #e5e7eb">Encore Bio Labs · <a href="mailto:${SUPPORT}">${SUPPORT}</a> · ${spanish ? 'Solo para uso de investigación' : 'Research Use Only'}</footer></div>`
}

async function sendZoho(to: string, subject: string, html: string) {
  const token = Deno.env.get('ZOHO_OAUTH_ACCESS_TOKEN')
  const accountId = Deno.env.get('ZOHO_MAIL_ACCOUNT_ID')
  if (!token || !accountId) return { sent: false, error: 'Zoho Mail API credentials are not configured; message retained for retry.' }
  const response = await fetch(`https://mail.zoho.com/api/accounts/${accountId}/messages`, { method: 'POST', headers: { authorization: `Zoho-oauthtoken ${token}`, 'content-type': 'application/json' }, body: JSON.stringify({ fromAddress: Deno.env.get('ZOHO_FROM_EMAIL') || SUPPORT, toAddress: to, subject, content: html, mailFormat: 'html' }) })
  if (!response.ok) return { sent: false, error: `Zoho Mail API returned ${response.status}.` }
  return { sent: true, error: null }
}

Deno.serve(async (request) => {
  const origin = request.headers.get('origin') || '*'
  if (request.method === 'OPTIONS') return json({}, 204, origin)
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405, origin)
  try {
    const payload = await request.json()
    if (payload.action !== 'contact') return json({ error: 'Unsupported action' }, 400, origin)
    if (clean(payload.website, 200)) return json({ ok: true }, 200, origin) // honeypot: no delivery or disclosure
    const name = clean(payload.name, 120), senderEmail = clean(payload.email, 254).toLowerCase(), phone = clean(payload.phone, 40), subject = clean(payload.subject, 180), body = clean(payload.message, 4000)
    if (!name || !email(senderEmail) || !subject || body.length < 20) return json({ error: 'Invalid contact form submission.' }, 422, origin)
    const service = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
    const ip = clean(request.headers.get('x-forwarded-for')?.split(',')[0], 64)
    const since = new Date(Date.now() - 10 * 60_000).toISOString()
    const { count } = await service.from('communication_messages').select('id', { count: 'exact', head: true }).eq('source', 'contact_form').gte('created_at', since).contains('metadata', { ip })
    if ((count ?? 0) >= 5) return json({ error: 'Please wait before sending another message.' }, 429, origin)
    const locale = payload.locale === 'es' ? 'es' : 'en'
    const { data: incoming, error: insertError } = await service.from('communication_messages').insert({ direction: 'inbound', source: 'contact_form', mailbox: 'contact', sender_name: name, sender_email: senderEmail, sender_phone: phone || null, recipient_email: SUPPORT, subject, body_text: body, locale, metadata: { ip, user_agent: clean(request.headers.get('user-agent'), 500), preferred_contact: clean(payload.preferredContact, 40), submitted_at: new Date().toISOString() } }).select('id').single()
    if (insertError) throw insertError
    const sent = await sendZoho(senderEmail, locale === 'es' ? 'Confirmación de contacto — Encore Bio Labs' : 'Contact confirmation — Encore Bio Labs', confirmation(name, locale))
    await service.from('communication_messages').insert({ direction: 'outbound', source: 'contact_confirmation', mailbox: 'sent', status: 'completed', is_read: true, sender_name: 'Encore Bio Labs', sender_email: SUPPORT, recipient_email: senderEmail, subject: locale === 'es' ? 'Confirmación de contacto — Encore Bio Labs' : 'Contact confirmation — Encore Bio Labs', body_text: locale === 'es' ? 'Confirmación de contacto enviada.' : 'Contact confirmation sent.', locale, parent_message_id: incoming.id, delivery_status: sent.sent ? 'sent' : 'failed', delivery_error: sent.error, attempts: 1, last_attempt_at: new Date().toISOString() })
    return json({ ok: true, stored: true, delivery: sent.sent ? 'sent' : 'queued' }, 200, origin)
  } catch (error) { return json({ error: error instanceof Error ? error.message : 'Unable to process message.' }, 500, origin) }
})
