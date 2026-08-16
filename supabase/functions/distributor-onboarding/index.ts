import { createClient, type User } from 'npm:@supabase/supabase-js@2.110.1'

const SUPPORT = 'support@encorebiolabs.com'
const corsHeaders = (origin: string) => ({
  'access-control-allow-origin': origin,
  'access-control-allow-headers': 'authorization, x-client-info, apikey, content-type',
  'access-control-allow-methods': 'POST, OPTIONS',
  'access-control-max-age': '86400',
  vary: 'Origin',
})
const json = (body: unknown, status = 200, origin = '*') => new Response(
  status === 204 ? null : JSON.stringify(body),
  { status, headers: status === 204 ? corsHeaders(origin) : { 'content-type': 'application/json; charset=utf-8', ...corsHeaders(origin) } },
)
const clean = (value: unknown, max: number) => typeof value === 'string'
  ? value.replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, max)
  : ''
const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (character) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[character]!))

type ServiceClient = ReturnType<typeof createClient>
type OutboxRow = {
  id: string
  distributor_id: string
  invitation_id: string | null
  event_type: 'auth_invite' | 'lifecycle_email' | 'revoke_sessions'
  payload: Record<string, unknown>
}

type InvitationRow = {
  id: string
  distributor_id: string
  email: string
  auth_user_id: string | null
  status: string
  resend_count: number
  metadata: Record<string, unknown>
  distributor_accounts: {
    display_name: string
    preferred_language: 'English' | 'Spanish'
    referral_code: string
  }
}

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
  const payload = await response.json().catch(() => null) as { access_token?: string; expires_in?: number } | null
  if (!payload?.access_token) return null
  const lifetimeMs = Math.max((payload.expires_in ?? 3600) * 1000, TOKEN_EXPIRY_MARGIN_MS * 2)
  zohoToken = { accessToken: payload.access_token, expiresAt: Date.now() + lifetimeMs - TOKEN_EXPIRY_MARGIN_MS }
  return payload.access_token
}

async function getZohoAccessToken() {
  if (zohoToken && zohoToken.expiresAt > Date.now()) return zohoToken.accessToken
  zohoTokenInFlight ??= requestZohoAccessToken().finally(() => { zohoTokenInFlight = null })
  return zohoTokenInFlight
}

async function sendZoho(to: string, subject: string, html: string) {
  const accountId = Deno.env.get('ZOHO_MAIL_ACCOUNT_ID')
  if (!accountId) throw new Error('Zoho Mail API credentials are not configured.')
  let token = await getZohoAccessToken()
  if (!token) throw new Error('Zoho Mail OAuth credentials are not configured.')
  const post = (accessToken: string) => fetch(`https://mail.zoho.com/api/accounts/${accountId}/messages`, {
    method: 'POST',
    headers: { authorization: `Zoho-oauthtoken ${accessToken}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      fromAddress: Deno.env.get('ZOHO_FROM_EMAIL') || SUPPORT,
      toAddress: to,
      subject,
      content: html,
      mailFormat: 'html',
    }),
  })
  let response = await post(token)
  if (response.status === 401) {
    zohoToken = null
    token = await getZohoAccessToken()
    if (!token) throw new Error('Zoho Mail rejected the refreshed access token.')
    response = await post(token)
  }
  if (!response.ok) throw new Error(`Zoho Mail delivery failed with status ${response.status}.`)
}

function brandedEmail(input: { name: string; language: 'English' | 'Spanish'; heading: string; copy: string; actionLabel?: string; actionUrl?: string }) {
  const disclaimer = input.language === 'Spanish' ? 'Solo para uso de investigación' : 'Research Use Only'
  const action = input.actionLabel && input.actionUrl
    ? `<p style="margin:28px 0"><a href="${escapeHtml(input.actionUrl)}" style="display:inline-block;background:#071724;color:#fff;text-decoration:none;padding:14px 22px;border-radius:999px;font-weight:700">${escapeHtml(input.actionLabel)}</a></p>`
    : ''
  return `<div style="font-family:Arial,sans-serif;color:#071724;max-width:640px;margin:auto"><div style="padding:24px;background:#071724;color:#d5fff9;font-weight:700;font-size:22px">encore bio labs</div><main style="padding:28px"><p style="font-size:14px;color:#52606d">${escapeHtml(input.name)},</p><h1>${escapeHtml(input.heading)}</h1><p style="line-height:1.7;color:#334155">${escapeHtml(input.copy)}</p>${action}</main><footer style="padding:20px;color:#52606d;font-size:13px;border-top:1px solid #e5e7eb">Encore Bio Labs · <a href="mailto:${SUPPORT}">${SUPPORT}</a> · ${disclaimer}</footer></div>`
}

function invitationCopy(language: 'English' | 'Spanish', resend: boolean) {
  if (language === 'Spanish') return {
    subject: resend ? 'Nuevo enlace de activación — Encore' : 'Activa tu cuenta de distribuidor — Encore',
    heading: resend ? 'Tu nuevo enlace de activación está listo' : 'Te damos la bienvenida a la red de distribuidores',
    copy: 'Usa este enlace seguro para confirmar tu correo y crear la contraseña de tu portal. El enlace vence en 72 horas. Después completarás documentos y configuración de pago antes de la aprobación y activación.',
    action: 'Continuar alta segura',
  }
  return {
    subject: resend ? 'New activation link — Encore' : 'Activate your Encore distributor account',
    heading: resend ? 'Your new activation link is ready' : 'Welcome to the Encore distributor network',
    copy: 'Use this secure link to confirm your email and create your portal password. The link expires in 72 hours. You will then complete documents and payout setup before approval and activation.',
    action: 'Continue secure onboarding',
  }
}

function lifecycleCopy(template: string, language: 'English' | 'Spanish', reason: string) {
  const spanish = language === 'Spanish'
  const reasonSuffix = reason ? (spanish ? ` Motivo: ${reason}` : ` Reason: ${reason}`) : ''
  const copies: Record<string, { subject: string; heading: string; copy: string }> = spanish ? {
    approve: { subject: 'Alta aprobada — Encore', heading: 'Tu alta fue aprobada', copy: 'Encore aprobó tu perfil. La activación final del portal es el siguiente paso.' },
    activate: { subject: 'Portal de distribuidor activo — Encore', heading: 'Tu portal ya está activo', copy: 'Ya puedes acceder a tus enlaces, ventas atribuidas, comisiones y pagos.' },
    reactivate: { subject: 'Acceso de distribuidor reactivado — Encore', heading: 'Tu acceso fue reactivado', copy: 'Tu portal y herramientas de distribuidor están nuevamente disponibles.' },
    reject: { subject: 'Resultado de alta de distribuidor — Encore', heading: 'No pudimos aprobar tu alta', copy: `Tu solicitud de distribuidor fue rechazada.${reasonSuffix}` },
    revoke: { subject: 'Acceso de distribuidor revocado — Encore', heading: 'Tu acceso fue revocado', copy: `Tu acceso y herramientas de distribuidor ya no están disponibles.${reasonSuffix}` },
    suspend: { subject: 'Acceso de distribuidor suspendido — Encore', heading: 'Tu acceso fue suspendido', copy: `El acceso al portal está pausado. Comunícate con Encore para conocer los siguientes pasos.${reasonSuffix}` },
    expiring: { subject: 'Tu invitación vence pronto — Encore', heading: 'Completa tu activación', copy: 'Tu enlace de invitación vencerá pronto. Solicita un reenvío si ya no funciona.' },
    recovery: { subject: 'Recuperación de acceso — Encore', heading: 'Recupera tu acceso', copy: 'Usa el enlace seguro solicitado para recuperar el acceso a tu portal.' },
  } : {
    approve: { subject: 'Onboarding approved — Encore', heading: 'Your onboarding was approved', copy: 'Encore approved your profile. Final portal activation is the next step.' },
    activate: { subject: 'Distributor portal active — Encore', heading: 'Your portal is now active', copy: 'You can now access your links, attributed sales, commissions, and payouts.' },
    reactivate: { subject: 'Distributor access restored — Encore', heading: 'Your access was restored', copy: 'Your distributor portal and tools are available again.' },
    reject: { subject: 'Distributor onboarding decision — Encore', heading: 'We could not approve your onboarding', copy: `Your distributor application was rejected.${reasonSuffix}` },
    revoke: { subject: 'Distributor access revoked — Encore', heading: 'Your access was revoked', copy: `Your distributor access and tools are no longer available.${reasonSuffix}` },
    suspend: { subject: 'Distributor access suspended — Encore', heading: 'Your access was suspended', copy: `Portal access is paused. Contact Encore for next steps.${reasonSuffix}` },
    expiring: { subject: 'Your invitation expires soon — Encore', heading: 'Complete your activation', copy: 'Your invitation link will expire soon. Request a resend if it no longer works.' },
    recovery: { subject: 'Access recovery — Encore', heading: 'Recover your access', copy: 'Use the secure link you requested to recover access to your portal.' },
  }
  return copies[template] ?? { subject: spanish ? 'Actualización de tu alta — Encore' : 'Onboarding update — Encore', heading: spanish ? 'Actualizamos tu alta' : 'Your onboarding was updated', copy: spanish ? 'Entra a tu portal para revisar el estado actual.' : 'Sign in to review your current status.' }
}

async function sha256(value: string) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

async function findAuthUserByEmail(service: ServiceClient, email: string): Promise<User | null> {
  for (let page = 1; page <= 50; page += 1) {
    const { data, error } = await service.auth.admin.listUsers({ page, perPage: 200 })
    if (error) throw error
    const match = data.users.find((user) => user.email?.toLowerCase() === email)
    if (match) return match
    if (data.users.length < 200) return null
  }
  throw new Error('Auth user lookup exceeded the safe pagination limit.')
}

async function loadInvitation(service: ServiceClient, invitationId: string) {
  const { data, error } = await service
    .from('distributor_onboarding_invitations')
    .select('id,distributor_id,email,auth_user_id,status,resend_count,metadata,distributor_accounts!inner(display_name,preferred_language,referral_code)')
    .eq('id', invitationId)
    .single()
  if (error || !data) throw error ?? new Error('Invitation not found.')
  return data as unknown as InvitationRow
}

async function processAuthInvite(service: ServiceClient, row: OutboxRow) {
  if (!row.invitation_id) throw new Error('Invitation reference is missing.')
  const invitation = await loadInvitation(service, row.invitation_id)
  const siteUrl = clean(Deno.env.get('PORTAL_SITE_URL') || 'https://encorebiolabs.com', 500).replace(/\/$/, '')
  if (!/^https:\/\//.test(siteUrl) && !/^http:\/\/localhost(?::\d+)?$/.test(siteUrl)) throw new Error('Portal site URL is invalid.')
  const language = invitation.distributor_accounts.preferred_language
  const localizedPath = language === 'Spanish' ? '/es/distributor/reset-password?invited=1' : '/distributor/reset-password?invited=1'
  const redirectTo = `${siteUrl}${localizedPath}`
  let existingUser: User | null = null
  if (invitation.auth_user_id) {
    const { data, error } = await service.auth.admin.getUserById(invitation.auth_user_id)
    if (error || !data.user) throw error ?? new Error('Linked Auth user is unavailable.')
    existingUser = data.user
  } else {
    existingUser = await findAuthUserByEmail(service, invitation.email)
  }
  const linkRequest = existingUser
    ? { type: 'recovery' as const, email: invitation.email, options: { redirectTo } }
    : {
        type: 'invite' as const,
        email: invitation.email,
        options: {
          redirectTo,
          data: {
            legal_name: invitation.distributor_accounts.display_name,
            preferred_name: invitation.distributor_accounts.display_name.split(/\s+/)[0] ?? '',
            preferred_language: language,
          },
        },
      }
  const { data: linkData, error: linkError } = await service.auth.admin.generateLink(linkRequest)
  if (linkError || !linkData?.user || !linkData.properties?.action_link) throw linkError ?? new Error('Supabase Auth did not return an invitation link.')
  const referenceSource = linkData.properties.hashed_token || `${linkData.user.id}:${row.id}`
  const { data: linkResult, error: databaseLinkError } = await service.rpc('service_link_distributor_auth_user', {
    target_invitation_id: invitation.id,
    target_auth_user_id: linkData.user.id,
    reference_hash: await sha256(referenceSource),
  })
  if (databaseLinkError) throw databaseLinkError
  if (linkResult?.outcome === 'blocked') throw new Error(`Auth link blocked: ${linkResult.reason}`)
  const copy = invitationCopy(language, row.payload.delivery_kind === 'resend')
  await sendZoho(invitation.email, copy.subject, brandedEmail({
    name: invitation.distributor_accounts.display_name,
    language,
    heading: copy.heading,
    copy: copy.copy,
    actionLabel: copy.action,
    actionUrl: linkData.properties.action_link,
  }))
  const { data: deliveryResult, error: deliveryError } = await service.rpc('service_mark_distributor_invitation_delivery', {
    target_invitation_id: invitation.id,
    succeeded: true,
    failure_message: null,
  })
  if (deliveryError) throw deliveryError
  if (deliveryResult?.outcome === 'blocked') throw new Error(`Invitation delivery state blocked: ${deliveryResult.reason}`)
}

async function processLifecycleEmail(service: ServiceClient, row: OutboxRow) {
  if (!row.invitation_id) throw new Error('Invitation reference is missing.')
  const invitation = await loadInvitation(service, row.invitation_id)
  const language = invitation.distributor_accounts.preferred_language
  const template = clean(row.payload.template, 40)
  const reason = clean(row.payload.reason, 500)
  const copy = lifecycleCopy(template, language, reason)
  await sendZoho(invitation.email, copy.subject, brandedEmail({
    name: invitation.distributor_accounts.display_name,
    language,
    heading: copy.heading,
    copy: copy.copy,
  }))
}

async function processOutbox(service: ServiceClient) {
  const workerId = crypto.randomUUID()
  const { data, error } = await service.rpc('service_claim_distributor_onboarding_outbox', { worker_id: workerId, batch_size: 10 })
  if (error) throw error
  const rows = (data ?? []) as OutboxRow[]
  let completed = 0
  let pending = 0
  let blocked = 0
  for (const row of rows) {
    try {
      if (row.event_type === 'auth_invite') await processAuthInvite(service, row)
      else if (row.event_type === 'lifecycle_email') await processLifecycleEmail(service, row)
      else {
        const { data: revokeResult, error: revokeError } = await service.rpc('service_revoke_distributor_sessions', { target_distributor_id: row.distributor_id })
        if (revokeError) throw revokeError
        if (revokeResult?.outcome === 'blocked') throw new Error(`Session revocation blocked: ${revokeResult.reason}`)
      }
      const { data: result, error: completionError } = await service.rpc('service_complete_distributor_onboarding_outbox', {
        target_outbox_id: row.id,
        worker_id: workerId,
        succeeded: true,
        failure_message: null,
      })
      if (completionError) throw completionError
      if (result?.outcome === 'completed') completed += 1
    } catch (cause) {
      const failure = cause instanceof Error ? cause.message : 'Unknown onboarding processor failure.'
      if (row.event_type === 'auth_invite' && row.invitation_id) {
        await service.rpc('service_mark_distributor_invitation_delivery', {
          target_invitation_id: row.invitation_id,
          succeeded: false,
          failure_message: failure,
        })
      }
      const { data: result } = await service.rpc('service_complete_distributor_onboarding_outbox', {
        target_outbox_id: row.id,
        worker_id: workerId,
        succeeded: false,
        failure_message: failure,
      })
      if (result?.outcome === 'blocked') blocked += 1
      else pending += 1
    }
  }
  return { claimed: rows.length, completed, pending, blocked }
}

async function requireAdministrator(request: Request, service: ServiceClient) {
  const authorization = request.headers.get('authorization') ?? ''
  const accessToken = authorization.startsWith('Bearer ') ? authorization.slice(7).trim() : ''
  if (!accessToken) return null
  const { data, error } = await service.auth.getUser(accessToken)
  if (error || !data.user) return null
  const { data: roles, error: roleError } = await service.from('user_roles').select('role').eq('user_id', data.user.id).in('role', ['admin', 'super_admin']).limit(1)
  if (roleError || !roles?.length) return null
  return { user: data.user, authorization }
}

Deno.serve(async (request) => {
  const origin = request.headers.get('origin') || '*'
  if (request.method === 'OPTIONS') return json({}, 204, origin)
  if (request.method !== 'POST') return json({ error: 'Method not allowed.' }, 405, origin)
  try {
    const payload = await request.json() as Record<string, unknown>
    const service = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
    const administrator = await requireAdministrator(request, service)
    if (!administrator) return json({ error: 'Administrator authorization required.' }, 403, origin)
    const userClient = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { headers: { authorization: administrator.authorization } },
    })
    const action = clean(payload.action, 40)
    const idempotencyKey = clean(payload.idempotencyKey, 200) || `${action}:${crypto.randomUUID()}`
    let operation: unknown = { outcome: 'pending' }
    if (action === 'invite') {
      const { data, error } = await userClient.rpc('admin_begin_distributor_invitation', {
        distributor_name: clean(payload.name, 120),
        distributor_email: clean(payload.email, 254),
        distributor_code: clean(payload.code, 32),
        preferred_language: payload.preferredLanguage === 'Spanish' ? 'Spanish' : 'English',
        operation_idempotency_key: idempotencyKey,
      })
      if (error) throw error
      operation = data
    } else if (action === 'resend') {
      const { data, error } = await userClient.rpc('admin_queue_distributor_invitation_resend', {
        target_distributor_id: clean(payload.distributorId, 60),
        operation_idempotency_key: idempotencyKey,
      })
      if (error) throw error
      operation = data
    } else if (action === 'transition') {
      const { data, error } = await userClient.rpc('admin_transition_distributor_onboarding', {
        target_distributor_id: clean(payload.distributorId, 60),
        requested_action: clean(payload.transition, 40),
        action_reason: clean(payload.reason, 500) || null,
        operation_idempotency_key: idempotencyKey,
      })
      if (error) throw error
      operation = data
    } else if (action === 'expire') {
      const { data, error } = await service.rpc('service_expire_distributor_invitations')
      if (error) throw error
      operation = { outcome: 'completed', expired: data }
    } else if (action !== 'process') {
      return json({ error: 'Unsupported action.' }, 400, origin)
    }
    if ((operation as { outcome?: string })?.outcome === 'blocked') return json({ outcome: 'blocked', operation, worker: { claimed: 0, completed: 0, pending: 0, blocked: 0 } }, 200, origin)
    const worker = await processOutbox(service)
    const outcome = worker.pending > 0 || worker.blocked > 0 ? 'pending' : 'completed'
    return json({ outcome, operation, worker }, outcome === 'pending' ? 202 : 200, origin)
  } catch (cause) {
    return json({ error: cause instanceof Error ? cause.message : 'Unable to process distributor onboarding.' }, 500, origin)
  }
})
