import { supabase } from '../supabaseClient'

export type FollowUpChannel = 'whatsapp' | 'email'

export type FollowUpDraft = {
  draft: string
  locale: 'en' | 'es'
  channel: FollowUpChannel
}

type ErrorBody = { error?: unknown; message?: unknown; msg?: unknown; detail?: unknown; code?: unknown }

const GENERIC = 'The follow-up draft could not be generated.'

function firstString(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim()
  }
  return ''
}

/**
 * Pulls the most specific message out of an Edge Function error response.
 *
 * The body can come from three different writers with three different shapes:
 * this function (`error`), the Supabase gateway when it rejects a request
 * before the function runs (`message` + `code`), and PostgREST (`msg`). Reading
 * as text first means a non-JSON body — an HTML error page, a plain-text
 * platform 500 — still produces something the operator can read instead of a
 * parse exception.
 */
async function readErrorResponse(response: Response) {
  const status = response.status
  const text = await response.text().catch(() => '')

  let body: ErrorBody | null = null
  try {
    const parsed: unknown = JSON.parse(text)
    if (parsed && typeof parsed === 'object') body = parsed as ErrorBody
  } catch {
    body = null
  }

  const message = firstString(body?.error, body?.message, body?.msg)
  const detail = firstString(body?.detail)
  if (message) return { status, message: detail ? `${message} (${detail})` : message }

  // Not JSON, or JSON with no recognizable message field. The raw body is still
  // the best evidence available, so pass a trimmed version through.
  const raw = text.trim().slice(0, 300)
  return { status, message: raw || '' }
}

/**
 * Turns any invoke failure into a sentence an operator can act on.
 *
 * `error.context` is only a `Response` for FunctionsHttpError. For
 * FunctionsFetchError it is the raw fetch exception — that is the shape that
 * produced the "e.json is not a function" crash, and it is also the shape a
 * failed CORS preflight produces, so it gets its own explanation rather than a
 * shrug.
 */
async function describeInvokeError(error: unknown): Promise<string> {
  const context = (error as { context?: unknown } | null)?.context
  const name = (error as { name?: unknown } | null)?.name

  if (context && typeof (context as Response).text === 'function' && typeof (context as Response).status === 'number') {
    const { status, message } = await readErrorResponse(context as Response)

    if (status === 401) {
      return message
        ? `Not signed in or the session expired (401): ${message} Sign out of the CRM and sign in again.`
        : 'Not signed in or the session expired (401). Sign out of the CRM and sign in again.'
    }
    if (status === 403) {
      return message
        ? `Access denied (403): ${message}`
        : 'Access denied (403). This account is not a CRM administrator.'
    }
    if (status === 404 && !message) {
      return 'The drafting service is not deployed (404). The draft-followup function is missing from the Supabase project.'
    }
    if (status === 546 || status === 504) {
      return `The drafting service timed out or ran out of resources (${status}). Try again.`
    }
    if (message) return `${message} (HTTP ${status})`
    return `The drafting service failed with HTTP ${status} and gave no reason.`
  }

  // No Response at all: the request never completed. Network down, the browser
  // blocked it on CSP, or the CORS preflight failed.
  const cause = firstString((context as { message?: unknown } | null)?.message, (error as { message?: unknown } | null)?.message)
  if (name === 'FunctionsFetchError' || !context) {
    return `The drafting service could not be reached${cause ? ` (${cause})` : ''}. This is usually a network drop or a rejected cross-origin request — check the browser console for a CORS or blocked-request warning, and confirm the draft-followup function is deployed.`
  }
  if (name === 'FunctionsRelayError') {
    return `Supabase could not route the request to the drafting service${cause ? ` (${cause})` : ''}. Try again in a moment.`
  }

  return cause || GENERIC
}

/**
 * Asks the `draft-followup` Edge Function for a research-use-only follow-up.
 *
 * Drafting runs server-side so the OpenAI key never reaches the browser bundle.
 * The function refuses to return anything that names a dose, schedule, or
 * promised outcome, so a rejection here is a guardrail firing, not a bug.
 */
export async function draftFollowUp(leadId: string, channel: FollowUpChannel): Promise<FollowUpDraft> {
  if (!supabase) throw new Error('Follow-up drafting requires a configured Supabase project.')

  // Checked here so a signed-out operator gets told that, rather than a 401
  // from the gateway that reads like the feature is broken.
  const { data: sessionData } = await supabase.auth.getSession()
  if (!sessionData?.session) {
    throw new Error('You are not signed in. Reload the CRM and sign in again, then retry.')
  }

  const { data, error } = await supabase.functions.invoke<FollowUpDraft & { error?: string; blocked?: boolean }>(
    'draft-followup',
    { body: { leadId, channel } },
  )

  if (error) throw new Error(await describeInvokeError(error))

  // A 200 can still carry a refusal, and an empty body is its own failure.
  if (!data) throw new Error('The drafting service replied with an empty response. Try again.')
  if (data.error) throw new Error(data.error)
  if (!data.draft) throw new Error('The drafting service returned no message text. Try again.')

  return { draft: data.draft, locale: data.locale, channel: data.channel }
}
