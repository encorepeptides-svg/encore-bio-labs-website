import { createClient } from 'npm:@supabase/supabase-js@2.110.1'

const SUPPORT = 'support@encorebiolabs.com'
// 204/205/304 carry no body: passing one to the Response constructor throws a
// TypeError, which the platform turns into a bodiless 500 with no
// access-control headers — so the browser blocks the real request and reports
// only an opaque fetch failure. The preflight below hit exactly that.
const NULL_BODY_STATUSES = new Set([101, 204, 205, 304])
const corsHeaders = (origin: string) => ({ 'access-control-allow-origin': origin, 'access-control-allow-headers': 'authorization, x-client-info, apikey, content-type', 'access-control-allow-methods': 'POST, OPTIONS', 'access-control-max-age': '86400', vary: 'Origin' })
const json = (body: unknown, status = 200, origin = '*') => NULL_BODY_STATUSES.has(status)
  ? new Response(null, { status, headers: corsHeaders(origin) })
  : new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json; charset=utf-8', ...corsHeaders(origin) } })
const clean = (value: unknown, max: number) => typeof value === 'string' ? value.replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, max) : ''
const email = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && !/[\r\n]/.test(value)
const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]!))

function confirmation(name: string, locale: string) {
  const spanish = locale === 'es'
  const heading = spanish ? 'Recibimos tu mensaje' : 'We received your message'
  const copy = spanish ? 'Gracias por comunicarte con Encore Bio Labs. Nuestro equipo responderá por correo electrónico.' : 'Thank you for contacting Encore Bio Labs. Our team will reply by email.'
  return `<div style="font-family:Arial,sans-serif;color:#071724;max-width:640px;margin:auto"><div style="padding:24px;background:#071724;color:#d5fff9;font-weight:700;font-size:22px">encore bio labs</div><main style="padding:28px"><h1>${heading}</h1><p>${escapeHtml(name)}, ${copy}</p></main><footer style="padding:20px;color:#52606d;font-size:13px;border-top:1px solid #e5e7eb">Encore Bio Labs · <a href="mailto:${SUPPORT}">${SUPPORT}</a> · ${spanish ? 'Solo para uso de investigación' : 'Research Use Only'}</footer></div>`
}

// Zoho OAuth access tokens expire after ~1 hour, so a static
// ZOHO_OAUTH_ACCESS_TOKEN could only ever work for an hour after someone pasted
// it by hand. Exchange the long-lived refresh token for an access token at call
// time instead, and cache it in module scope for the life of the isolate so a
// burst of sends does not hammer Zoho's token endpoint.
const ZOHO_ACCOUNTS_HOST = Deno.env.get('ZOHO_ACCOUNTS_HOST') || 'https://accounts.zoho.com'
const TOKEN_EXPIRY_MARGIN_MS = 120_000
let zohoToken: { accessToken: string; expiresAt: number } | null = null
let zohoTokenInFlight: Promise<string | null> | null = null

async function requestZohoAccessToken(): Promise<string | null> {
  const refreshToken = Deno.env.get('ZOHO_OAUTH_REFRESH_TOKEN')
  const clientId = Deno.env.get('ZOHO_OAUTH_CLIENT_ID')
  const clientSecret = Deno.env.get('ZOHO_OAUTH_CLIENT_SECRET')
  if (!refreshToken || !clientId || !clientSecret) return null

  const response = await fetch(`${ZOHO_ACCOUNTS_HOST}/oauth/v2/token`, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ refresh_token: refreshToken, client_id: clientId, client_secret: clientSecret, grant_type: 'refresh_token' }),
  })
  if (!response.ok) return null

  const payload = await response.json().catch(() => null) as { access_token?: string; expires_in?: number; error?: string } | null
  if (!payload?.access_token) return null

  const lifetimeMs = Math.max((payload.expires_in ?? 3600) * 1000, TOKEN_EXPIRY_MARGIN_MS * 2)
  zohoToken = { accessToken: payload.access_token, expiresAt: Date.now() + lifetimeMs - TOKEN_EXPIRY_MARGIN_MS }
  return payload.access_token
}

async function getZohoAccessToken(): Promise<string | null> {
  if (zohoToken && zohoToken.expiresAt > Date.now()) return zohoToken.accessToken
  // Collapse concurrent refreshes onto a single token request.
  zohoTokenInFlight ??= requestZohoAccessToken().finally(() => { zohoTokenInFlight = null })
  return zohoTokenInFlight
}

async function sendZoho(to: string, subject: string, html: string) {
  const accountId = Deno.env.get('ZOHO_MAIL_ACCOUNT_ID')
  if (!accountId) return { sent: false, error: 'Zoho Mail API credentials are not configured; message retained for retry.' }

  let token = await getZohoAccessToken()
  if (!token) return { sent: false, error: 'Zoho Mail API credentials are not configured; message retained for retry.' }

  const post = (accessToken: string) => fetch(`https://mail.zoho.com/api/accounts/${accountId}/messages`, {
    method: 'POST',
    headers: { authorization: `Zoho-oauthtoken ${accessToken}`, 'content-type': 'application/json' },
    body: JSON.stringify({ fromAddress: Deno.env.get('ZOHO_FROM_EMAIL') || SUPPORT, toAddress: to, subject, content: html, mailFormat: 'html' }),
  })

  let response = await post(token)
  // A cached token can still be revoked early; refresh once and retry.
  if (response.status === 401) {
    zohoToken = null
    token = await getZohoAccessToken()
    if (!token) return { sent: false, error: 'Zoho Mail API rejected the refreshed access token.' }
    response = await post(token)
  }
  if (!response.ok) return { sent: false, error: `Zoho Mail API returned ${response.status}.` }
  return { sent: true, error: null }
}

async function invitePortalClient(request: Request, payload: Record<string, unknown>, service: ReturnType<typeof createClient>, origin: string) {
  const authorization = request.headers.get('authorization') ?? ''
  const accessToken = authorization.startsWith('Bearer ') ? authorization.slice(7).trim() : ''
  if (!accessToken) return json({ error: 'Authentication required.' }, 401, origin)

  const { data: authData, error: authError } = await service.auth.getUser(accessToken)
  if (authError || !authData.user) return json({ error: 'Authentication required.' }, 401, origin)

  const { data: roles, error: roleError } = await service
    .from('user_roles')
    .select('role')
    .eq('user_id', authData.user.id)
    .in('role', ['admin', 'super_admin'])
    .limit(1)
  if (roleError || !roles?.length) return json({ error: 'Administrator authorization required.' }, 403, origin)

  const invitedEmail = clean(payload.email, 254).toLowerCase()
  const legalName = clean(payload.legalName, 120)
  const preferredLanguage = payload.preferredLanguage === 'Spanish' ? 'Spanish' : 'English'
  const approvalMode = payload.approvalMode === 'manual' ? 'manual' : 'automatic'
  const configuredSiteUrl = clean(Deno.env.get('PORTAL_SITE_URL') || 'https://encorebiolabs.com', 500).replace(/\/$/, '')
  if (!email(invitedEmail)) return json({ error: 'A valid client email is required.' }, 422, origin)
  if (!configuredSiteUrl || !/^https?:\/\//.test(configuredSiteUrl)) return json({ error: 'Portal invitation delivery is not configured.' }, 503, origin)

  const { data: invitation, error: invitationError } = await service
    .from('portal_invitations')
    .insert({
      email: invitedEmail,
      preferred_language: preferredLanguage,
      approval_mode: approvalMode,
      created_by: authData.user.id,
      metadata: { source: 'admin_portal' },
    })
    .select('id')
    .single()
  if (invitationError || !invitation) {
    return json({ error: 'An active invitation already exists for this email.' }, 409, origin)
  }

  const localizedPath = preferredLanguage === 'Spanish' ? '/es/client-reset-password?invited=1' : '/client-reset-password?invited=1'
  const { data: invited, error: inviteError } = await service.auth.admin.inviteUserByEmail(invitedEmail, {
    redirectTo: `${configuredSiteUrl}${localizedPath}`,
    data: {
      legal_name: legalName,
      preferred_name: legalName.split(/\s+/)[0] ?? '',
      preferred_language: preferredLanguage,
      portal_invited: true,
    },
  })

  if (inviteError || !invited.user) {
    await service.from('portal_invitations').update({
      status: 'revoked',
      metadata: { source: 'admin_portal', auth_invite_sent: false },
    }).eq('id', invitation.id)
    return json({ error: 'The invitation could not be sent. The address may already be registered.' }, 409, origin)
  }

  const { error: linkError } = await service.from('portal_invitations').update({
    auth_user_id: invited.user.id,
    metadata: { source: 'admin_portal', auth_invite_sent: true },
  }).eq('id', invitation.id)
  if (linkError) return json({ error: 'The invitation was sent, but its portal approval record needs administrator review.' }, 500, origin)

  return json({ ok: true, invitation: 'sent', approval: approvalMode }, 200, origin)
}

Deno.serve(async (request) => {
  const origin = request.headers.get('origin') || '*'
  if (request.method === 'OPTIONS') return json({}, 204, origin)
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405, origin)
  try {
    const payload = await request.json() as Record<string, unknown>
    const service = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
    if (payload.action === 'portal_invite') return invitePortalClient(request, payload, service, origin)
    if (payload.action === 'distributor_invite') return json({ error: 'Use the recoverable distributor-onboarding endpoint.' }, 409, origin)
    if (payload.action !== 'contact') return json({ error: 'Unsupported action' }, 400, origin)
    if (clean(payload.website, 200)) return json({ ok: true }, 200, origin) // honeypot: no delivery or disclosure
    const name = clean(payload.name, 120), senderEmail = clean(payload.email, 254).toLowerCase(), phone = clean(payload.phone, 40), subject = clean(payload.subject, 180), body = clean(payload.message, 4000)
    if (!name || !email(senderEmail) || !subject || body.length < 20) return json({ error: 'Invalid contact form submission.' }, 422, origin)
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
