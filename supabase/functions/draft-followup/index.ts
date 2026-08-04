import { createClient } from 'npm:@supabase/supabase-js@2.110.1'

// Drafts a research-use-only follow-up for a CRM lead. Admin-only: the OpenAI
// key lives here because an API key in the browser bundle is an API key the
// public owns. The draft is never sent from this function — an operator reads
// it, edits it, and sends it by hand. That review step is the compliance
// control, not a convenience.

// 204/205/304 are "null body" statuses: constructing a Response for one of them
// WITH a body throws a TypeError. That is what broke this function in
// production — the OPTIONS branch built a 204 carrying "{}", the constructor
// threw before any header was set, the platform returned a bodiless 500 with no
// access-control headers, the browser blocked the real POST, and the UI saw an
// opaque fetch failure. Every response now goes through a helper that cannot
// repeat it.
const NULL_BODY_STATUSES = new Set([101, 204, 205, 304])
const DEFAULT_ALLOWED_HEADERS = 'authorization, x-client-info, apikey, content-type'

function corsHeaders(request: Request): Record<string, string> {
  // Echo the headers the browser actually asked for. supabase-js can attach
  // headers a hardcoded list would miss (region hints, trace propagation), and
  // a preflight that omits even one of them fails the whole request.
  const requested = request.headers.get('access-control-request-headers')
  return {
    'access-control-allow-origin': request.headers.get('origin') || '*',
    'access-control-allow-headers': requested || DEFAULT_ALLOWED_HEADERS,
    'access-control-allow-methods': 'POST, OPTIONS',
    'access-control-max-age': '86400',
    vary: 'Origin, Access-Control-Request-Headers',
  }
}

const json = (body: unknown, status: number, headers: Record<string, string>) =>
  NULL_BODY_STATUSES.has(status)
    ? new Response(null, { status, headers })
    : new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json; charset=utf-8', ...headers } })

const clean = (value: unknown, max: number) => typeof value === 'string' ? value.replaceAll(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, max) : ''
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const MODEL = Deno.env.get('OPENAI_MODEL') || 'gpt-4o-mini'
const OPENAI_TIMEOUT_MS = 30_000

// Anything here means the draft crossed the research-use-only boundary the
// intake page promises in writing. Refuse rather than hand an operator a
// message that is one careless click from being sent.
const PROHIBITED = [
  /\b\d+\s*(mg|mcg|µg|ug|iu|ui|ml|cc)\b.{0,40}\b(daily|weekly|day|week|dia|día|semana|dose|dosis|inject|inyect)/i,
  /\b(dose|dosage|dosing|dosis|dosificaci[oó]n|posolog[ií]a)\b/i,
  /\b(protocol|protocolo|regimen|r[eé]gimen|titrat|titulaci[oó]n|stack|ciclo|cycle)\b/i,
  /\b(inject|injection|inyect|inyecci[oó]n|subcutaneous|subcut[aá]nea|intramuscular)\b/i,
  /\b(veces al d[ií]a|times (a|per) day|twice daily|once weekly|una vez por semana)\b/i,
  /\b(will (help|cure|treat|reduce|lose)|te ayudar[aá] a|va a (curar|bajar|eliminar)|guaranteed|garantizado)\b/i,
]

function systemPrompt(locale: 'en' | 'es', channel: 'whatsapp' | 'email') {
  const language = locale === 'es' ? 'Spanish (neutral Latin American / Mexican register)' : 'English'
  const shape = channel === 'whatsapp'
    ? 'A WhatsApp message. Keep it under about 70 words. No subject line, no "Hi X," on its own line, no sign-off, no signature — nobody signs a WhatsApp. Break it into 2 or 3 short paragraphs with blank lines between them, the way people actually text, rather than one dense block.'
    : 'An email. First line is "Subject: " followed by a specific subject — not "Following up" or "Your inquiry". Then a blank line, then the message. Slightly more composed than a text but still a person writing, not a template. Sign off with just a first name placeholder on its own line.'

  return `You are a real person on the small team at Encore Bio Labs, a research-use-only (RUO) supplier of research compounds. You are personally following up with someone who reached out and has been waiting. You are not a bot, a marketing department, or a support queue — write the way you would actually text a person you feel a little bad about leaving hanging.

Write in ${language}. ${shape}

HOW TO SOUND HUMAN — this is the part that matters most:
- Use contractions. Short sentences. One idea per sentence.
- Vary sentence length. A very short one lands well after a longer one.
- Write like you are typing to one specific person, because you are. Use their name once, naturally, near the start — not again after that.
- Show you actually read what they wrote. Reference the specific thing they asked for, in your own words, not theirs verbatim.
- It is fine to be a little informal. A sentence fragment is fine. Starting with "Ok," or "Mira," or "So," is fine.
${locale === 'es' ? '- Spanish: use "tú", never "usted" — warm and current, the way a Mexican business actually writes on WhatsApp. Natural Mexican/border phrasing, never translated-from-English stiffness.\n' : ''}
NEVER WRITE THESE — they are what makes a message read as automated:
- "We received your research inquiry" / "Recibimos tu solicitud"
- "Thank you for submitting" / "Gracias por enviar tu formulario"
- "We are reaching out regarding" / "Nos ponemos en contacto"
- "Please do not hesitate to" / "No dudes en"
- "Let us know if you have any questions" / "Cualquier duda, quedamos a tus órdenes"
- "We value your interest" / "Valoramos tu interés"
- Any sentence that could be sent unchanged to a hundred different people.

IF THEY HAVE BEEN WAITING (the user message tells you how many days):
- 2 days or more: open by owning it. One sentence, direct, no excuses, no grovelling. "Te debo una disculpa por la demora" is the right weight. NOT "we apologize for any inconvenience this may have caused."
- 4 days or more: name the number of days out loud. Being specific reads as honest; being vague reads as evasive.
- Under 2 days: no apology at all. Apologizing for nothing is its own kind of robotic.

STRUCTURE — follow the arc, do not label the parts:
1. Their name + own the delay if there was one.
2. One line proving you read their intake — the specific thing they want help with.
3. The single most useful next thing you can offer them (a category that fits, or the product they already named, plus pricing or availability if they asked about it).
4. ONE question. Specific and easy to answer — something they can reply to in a few words. Never "let me know if you have questions", which asks them to do the work.

CONVERT SOFTLY: your goal is a reply, not a sale. Be genuinely useful first. Make responding feel easy and low-pressure. Never push, never create urgency, never mention limited stock or time.

ABSOLUTE RULES — these are legal boundaries the company publishes on its intake page, not style preferences. They override every instruction above:
- NEVER state or imply a dose, amount, strength, frequency, schedule, duration, cycle, protocol, or route of administration.
- NEVER give use instructions, preparation instructions, or personal health direction.
- NEVER promise, predict, or imply an outcome, result, or benefit.
- NEVER diagnose, or comment on the person's health, body, weight, symptoms, sleep, or energy — even though the intake contains that data. It is context for choosing a CATEGORY only, never something to reflect back at them. "You mentioned wanting help with body composition" is FORBIDDEN. "You're looking at the metabolic category" is fine.
- NEVER present the products as being for human or animal consumption.
- Name specific products ONLY if the lead named those products themselves. Never suggest one they did not mention.
- Include the research-use-only point ONCE, worked into a sentence like a normal aside — not as a disclaimer paragraph, not in capitals, not at the end like fine print. If it cannot be said naturally, a short clause is enough.

Do not invent facts about products, pricing, shipping, timelines, or stock. No emoji. No exclamation marks. No hype words ("amazing", "excited", "perfect").

Output ONLY the message text. No preamble, no commentary, no quotation marks around it.`
}

function leadFacts(lead: Record<string, unknown>, intake: Record<string, unknown> | null) {
  // Deliberately omits medical_conditions and medications. Health data must not
  // steer message wording — it is exactly what would turn a category match into
  // something that reads like personal health advice.
  const products = Array.isArray(lead.interested_products) ? (lead.interested_products as string[]) : []
  const lines = [
    `First name: ${lead.first_name}`,
    `Stated research area: ${lead.primary_goal || 'not specified'}`,
    products.length ? `Products THEY named: ${products.join(', ')}` : 'Products they named: none — they did not pick any',
    intake?.current_routine ? `What they told us: ${intake.current_routine}` : '',
    intake?.previous_products_used ? `Experience level: ${intake.previous_products_used}` : '',
    intake?.preferred_contact_method ? `They asked to be contacted via: ${intake.preferred_contact_method}` : '',
    delayDirective(lead.created_at),
  ].filter(Boolean)
  return lines.join('\n')
}

/**
 * Turns the wait into an explicit instruction rather than a number the model has
 * to interpret. A bare "days: 6" gets ignored or, worse, gets apologized for
 * when it is zero — the apology is the single thing most likely to sound
 * canned, so the threshold is stated rather than inferred.
 */
function delayDirective(createdAt: unknown) {
  const days = Math.max(0, Math.floor((Date.now() - new Date(String(createdAt)).getTime()) / 86_400_000))
  if (days >= 4) return `They submitted ${days} days ago and have heard NOTHING since. Open by owning the delay and say "${days} days" out loud. This is genuinely too long — sound like you mean it, in one sentence, then move on.`
  if (days >= 2) return `They submitted ${days} days ago and have heard nothing since. Open with a short, direct apology for the delay. One sentence, no excuses.`
  return 'They submitted less than 2 days ago. Do NOT apologize for a delay — there has not been one, and apologizing for nothing sounds automated.'
}

type AuthOutcome =
  | { ok: true; userId: string }
  | { ok: false; status: number; code: string; error: string }

// Separates "your session is bad" from "your session is fine but you are not an
// admin" from "the role lookup itself failed". Collapsing those into one 403 is
// what makes an auth problem unfixable from a screenshot.
async function authorize(service: ReturnType<typeof createClient>, accessToken: string): Promise<AuthOutcome> {
  const { data, error } = await service.auth.getUser(accessToken)
  if (error || !data.user) {
    return {
      ok: false,
      status: 401,
      code: 'invalid_session',
      error: 'Your admin sign-in is not valid or has expired. Sign out of the CRM and sign in again, then retry.',
    }
  }

  // Accept either signal: the user_roles table (canonical) or the legacy
  // app_metadata claim, so this keeps working across the role-gate migration.
  if ((data.user.app_metadata as Record<string, unknown> | null)?.role === 'crm_admin') {
    return { ok: true, userId: data.user.id }
  }

  const { data: roles, error: roleError } = await service
    .from('user_roles')
    .select('role')
    .eq('user_id', data.user.id)
    .in('role', ['admin', 'super_admin'])
    .limit(1)

  if (roleError) {
    return {
      ok: false,
      status: 500,
      code: 'role_lookup_failed',
      error: `Your administrator role could not be checked (${roleError.message}). This is a server problem, not a sign-in problem.`,
    }
  }
  if (roles?.length) return { ok: true, userId: data.user.id }

  return {
    ok: false,
    status: 403,
    code: 'not_admin',
    error: `You are signed in, but this account is not a CRM administrator. It needs an admin or super_admin row in user_roles (account id ${data.user.id}).`,
  }
}

type CompletionOutcome =
  | { ok: true; draft: string; truncated: boolean }
  | { ok: false; status: number; code: string; error: string; detail?: string }

function requestBody(model: string, messages: unknown[], minimal: boolean) {
  // Reasoning-family models reject `temperature` and `max_tokens` outright. The
  // model id comes from an env var the owner can change, so adapt at call time
  // instead of assuming today's default is forever.
  return minimal
    ? { model, messages }
    // 0.85 because the failure mode here is blandness, not inaccuracy — the
    // model invents no facts (it is given them) and the guardrail regex catches
    // anything that crosses the RUO line, so the sampling can afford to breathe.
    : { model, temperature: 0.85, max_tokens: 600, messages }
}

async function callOpenAI(apiKey: string, messages: unknown[]): Promise<CompletionOutcome> {
  const post = (minimal: boolean) => fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { authorization: `Bearer ${apiKey}`, 'content-type': 'application/json' },
    body: JSON.stringify(requestBody(MODEL, messages, minimal)),
    signal: AbortSignal.timeout(OPENAI_TIMEOUT_MS),
  })

  let response: Response
  try {
    response = await post(false)
    // 400 on a parameter the model does not accept: retry once without the
    // sampling parameters rather than failing a whole feature on a model swap.
    if (response.status === 400) {
      const text = await response.text()
      if (/unsupported_parameter|unsupported_value|max_tokens|temperature/i.test(text)) {
        response = await post(true)
      } else {
        return { ok: false, status: 502, code: 'openai_bad_request', error: 'The drafting service rejected the request (400).', detail: text.slice(0, 300) }
      }
    }
  } catch (error) {
    // AbortSignal.timeout rejects with a DOMException, which is not guaranteed
    // to satisfy `instanceof Error` across runtimes — read the name directly.
    const name = (error as { name?: unknown } | null)?.name
    const timedOut = name === 'TimeoutError' || name === 'AbortError'
    return {
      ok: false,
      status: timedOut ? 504 : 502,
      code: timedOut ? 'openai_timeout' : 'openai_unreachable',
      error: timedOut
        ? `The drafting service did not answer within ${Math.round(OPENAI_TIMEOUT_MS / 1000)} seconds. Try again.`
        : 'The drafting service could not be reached from the server. Try again in a moment.',
      detail: String((error as { message?: unknown } | null)?.message ?? '').slice(0, 300) || undefined,
    }
  }

  if (!response.ok) {
    const detail = await response.text().catch(() => '')
    const hint = response.status === 401 || response.status === 403
      ? 'The OpenAI API key on this Supabase project is missing, revoked, or lacks access to the configured model.'
      : response.status === 429
        ? 'The OpenAI account is rate limited or out of credit.'
        : response.status === 404
          ? `The configured model "${MODEL}" does not exist or is not available to this OpenAI account.`
          : 'This is an upstream problem, not a problem with the lead.'
    return { ok: false, status: 502, code: `openai_http_${response.status}`, error: `The drafting service returned ${response.status}. ${hint}`, detail: detail.slice(0, 300) }
  }

  const completion = await response.json().catch(() => null) as {
    choices?: Array<{ message?: { content?: string; refusal?: string }; finish_reason?: string }>
  } | null

  if (!completion?.choices?.length) {
    return { ok: false, status: 502, code: 'openai_malformed', error: 'The drafting service returned a response this function could not read. Try again.' }
  }

  const choice = completion.choices[0]
  if (choice.message?.refusal) {
    return { ok: false, status: 422, code: 'model_refused', error: `The model declined to write this message: ${String(choice.message.refusal).slice(0, 200)}` }
  }

  const draft = (choice.message?.content ?? '').trim()
  if (!draft) {
    return { ok: false, status: 502, code: 'empty_completion', error: 'The drafting service returned an empty message. Try again.' }
  }

  return { ok: true, draft, truncated: choice.finish_reason === 'length' }
}

async function handle(request: Request, headers: Record<string, string>): Promise<Response> {
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers })
  if (request.method !== 'POST') return json({ error: 'Method not allowed.', code: 'method_not_allowed' }, 405, headers)

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!supabaseUrl || !serviceRoleKey) {
    return json({ error: 'This function is missing its Supabase service credentials. Redeploy it.', code: 'missing_service_credentials' }, 503, headers)
  }

  const authorization = request.headers.get('authorization') ?? ''
  const accessToken = authorization.startsWith('Bearer ') ? authorization.slice(7).trim() : ''
  if (!accessToken) return json({ error: 'You are not signed in. Sign in to the CRM and retry.', code: 'no_token' }, 401, headers)

  const service = createClient(supabaseUrl, serviceRoleKey)
  const auth = await authorize(service, accessToken)
  if (!auth.ok) return json({ error: auth.error, code: auth.code }, auth.status, headers)

  // Checked after authorization so an unauthenticated caller cannot probe which
  // secrets this project has configured.
  const apiKey = Deno.env.get('OPENAI_API_KEY')
  if (!apiKey) return json({ error: 'Follow-up drafting is not configured. Set OPENAI_API_KEY on the Supabase project.', code: 'missing_openai_key' }, 503, headers)

  const payload = await request.json().catch(() => null) as Record<string, unknown> | null
  if (!payload) return json({ error: 'The request body was not readable JSON.', code: 'bad_request_body' }, 400, headers)

  const leadId = clean(payload.leadId, 64)
  const channel = payload.channel === 'email' ? 'email' : 'whatsapp'
  if (!leadId) return json({ error: 'A lead id is required.', code: 'missing_lead_id' }, 422, headers)
  if (!UUID.test(leadId)) return json({ error: 'That lead id is not a valid identifier, so no lead could be looked up.', code: 'invalid_lead_id' }, 422, headers)

  const { data: lead, error: leadError } = await service
    .from('crm_leads')
    .select('id,created_at,first_name,preferred_language,primary_goal,interested_products')
    .eq('id', leadId)
    .maybeSingle()

  // A failed query and a missing row are different problems with different
  // fixes; reporting both as "Lead not found" hides schema and permission bugs.
  if (leadError) return json({ error: `The lead could not be read from the database (${leadError.message}).`, code: 'lead_query_failed' }, 500, headers)
  if (!lead) return json({ error: 'That lead no longer exists. Refresh the lead list.', code: 'lead_not_found' }, 404, headers)

  const { data: intake } = await service
    .from('crm_intake_submissions')
    .select('current_routine,previous_products_used,preferred_contact_method')
    .eq('lead_id', leadId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const locale = String(lead.preferred_language).toLowerCase().startsWith('span') ? 'es' : 'en'

  const completion = await callOpenAI(apiKey, [
    { role: 'system', content: systemPrompt(locale, channel) },
    { role: 'user', content: leadFacts(lead, intake) },
  ])
  if (!completion.ok) {
    return json({ error: completion.error, code: completion.code, detail: completion.detail }, completion.status, headers)
  }
  if (completion.truncated) {
    return json({ error: 'The draft was cut off before it finished. Try again.', code: 'truncated_completion' }, 502, headers)
  }

  const violation = PROHIBITED.find((pattern) => pattern.test(completion.draft))
  if (violation) {
    return json({
      error: 'The generated draft crossed the research-use-only boundary and was discarded. Try again, or write this one by hand.',
      code: 'guardrail_blocked',
      blocked: true,
    }, 422, headers)
  }

  return json({ draft: completion.draft, locale, channel, model: MODEL }, 200, headers)
}

Deno.serve(async (request) => {
  // Headers are computed before anything else can throw, and every path —
  // including OPTIONS — is inside the catch. A response without access-control
  // headers is invisible to the browser, so it must not be reachable.
  const headers = corsHeaders(request)
  try {
    return await handle(request, headers)
  } catch (error) {
    return json({
      error: `The drafting function hit an unexpected error: ${String((error as { message?: unknown } | null)?.message ?? error ?? 'unknown error').slice(0, 300)}`,
      code: 'unexpected_error',
    }, 500, headers)
  }
})
