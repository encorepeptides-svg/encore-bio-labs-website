import { createClient } from 'npm:@supabase/supabase-js@2.110.1'

// Drafts a research-use-only follow-up for a CRM lead. Admin-only: the OpenAI
// key lives here because an API key in the browser bundle is an API key the
// public owns. The draft is never sent from this function — an operator reads
// it, edits it, and sends it by hand. That review step is the compliance
// control, not a convenience.

const json = (body: unknown, status = 200, origin = '*') => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'access-control-allow-origin': origin, 'access-control-allow-headers': 'authorization, x-client-info, apikey, content-type', 'access-control-allow-methods': 'POST, OPTIONS', vary: 'Origin' } })
const clean = (value: unknown, max: number) => typeof value === 'string' ? value.replaceAll(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, max) : ''

const MODEL = Deno.env.get('OPENAI_MODEL') || 'gpt-4o-mini'

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
    ? 'A WhatsApp message. Short — 3 to 5 sentences, no subject line, no formal sign-off. Warm and direct, like a real person typing.'
    : 'An email. Include a subject line on the first line prefixed "Subject: ". Slightly more formal, still brief.'

  return `You write follow-up messages for Encore Bio Labs, a research-use-only (RUO) supplier of research compounds.

Write in ${language}. ${shape}

ABSOLUTE RULES — these are legal boundaries the company publishes on its intake page, not style preferences:
- NEVER state or imply a dose, amount, strength, frequency, schedule, duration, cycle, protocol, or route of administration.
- NEVER give use instructions, preparation instructions, or personal health direction.
- NEVER promise, predict, or imply an outcome, result, or benefit.
- NEVER diagnose, or comment on the person's health, body, weight, symptoms, sleep, or energy — even though the intake contains that data. It is context for choosing a CATEGORY only, never something to reflect back at them.
- NEVER present the products as being for human or animal consumption.

WHAT YOU MAY DO:
- Greet them by first name and reference that they submitted a research inquiry.
- Name the catalog CATEGORY that matches their stated interest.
- Name specific products ONLY if the lead named those products themselves.
- Offer to answer questions, share pricing, or share availability.
- Include one brief, natural research-use-only note. Do not stack disclaimers — one clause is enough.
- Ask one clear closing question.

TONE: a knowledgeable person following up, not marketing copy. No hype, no emoji, no exclamation marks. Do not invent facts about products, pricing, shipping, or timelines.

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
    `Days since they submitted and heard nothing: ${Math.max(0, Math.round((Date.now() - new Date(String(lead.created_at)).getTime()) / 86_400_000))}`,
  ].filter(Boolean)
  return lines.join('\n')
}

async function isAdmin(service: ReturnType<typeof createClient>, accessToken: string) {
  const { data, error } = await service.auth.getUser(accessToken)
  if (error || !data.user) return null
  // Accept either signal: the user_roles table (canonical) or the legacy
  // app_metadata claim, so this keeps working across the role-gate migration.
  if ((data.user.app_metadata as Record<string, unknown> | null)?.role === 'crm_admin') return data.user
  const { data: roles } = await service.from('user_roles').select('role').eq('user_id', data.user.id).in('role', ['admin', 'super_admin']).limit(1)
  return roles?.length ? data.user : null
}

Deno.serve(async (request) => {
  const origin = request.headers.get('origin') || '*'
  if (request.method === 'OPTIONS') return json({}, 204, origin)
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405, origin)

  try {
    const apiKey = Deno.env.get('OPENAI_API_KEY')
    if (!apiKey) return json({ error: 'Follow-up drafting is not configured. Set OPENAI_API_KEY on the project.' }, 503, origin)

    const authorization = request.headers.get('authorization') ?? ''
    const accessToken = authorization.startsWith('Bearer ') ? authorization.slice(7).trim() : ''
    if (!accessToken) return json({ error: 'Authentication required.' }, 401, origin)

    const service = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
    const user = await isAdmin(service, accessToken)
    if (!user) return json({ error: 'Administrator authorization required.' }, 403, origin)

    const payload = await request.json() as Record<string, unknown>
    const leadId = clean(payload.leadId, 64)
    const channel = payload.channel === 'email' ? 'email' : 'whatsapp'
    if (!leadId) return json({ error: 'A lead id is required.' }, 422, origin)

    const { data: lead, error: leadError } = await service
      .from('crm_leads')
      .select('id,created_at,first_name,preferred_language,primary_goal,interested_products')
      .eq('id', leadId)
      .single()
    if (leadError || !lead) return json({ error: 'Lead not found.' }, 404, origin)

    const { data: intake } = await service
      .from('crm_intake_submissions')
      .select('current_routine,previous_products_used,preferred_contact_method')
      .eq('lead_id', leadId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    const locale = String(lead.preferred_language).toLowerCase().startsWith('span') ? 'es' : 'en'

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { authorization: `Bearer ${apiKey}`, 'content-type': 'application/json' },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.6,
        max_tokens: 400,
        messages: [
          { role: 'system', content: systemPrompt(locale, channel) },
          { role: 'user', content: leadFacts(lead, intake) },
        ],
      }),
    })

    if (!response.ok) {
      const detail = await response.text()
      return json({ error: `Drafting service returned ${response.status}.`, detail: detail.slice(0, 300) }, 502, origin)
    }

    const completion = await response.json() as { choices?: Array<{ message?: { content?: string } }> }
    const draft = (completion.choices?.[0]?.message?.content ?? '').trim()
    if (!draft) return json({ error: 'The drafting service returned an empty message.' }, 502, origin)

    const violation = PROHIBITED.find((pattern) => pattern.test(draft))
    if (violation) {
      return json({
        error: 'The generated draft crossed the research-use-only boundary and was discarded. Try again, or write this one by hand.',
        blocked: true,
      }, 422, origin)
    }

    return json({ draft, locale, channel, model: MODEL }, 200, origin)
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : 'Unable to draft a follow-up.' }, 500, origin)
  }
})
