import { supabase } from '../supabaseClient'

export type FollowUpChannel = 'whatsapp' | 'email'

export type FollowUpDraft = {
  draft: string
  locale: 'en' | 'es'
  channel: FollowUpChannel
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

  const { data, error } = await supabase.functions.invoke<FollowUpDraft & { error?: string; blocked?: boolean }>(
    'draft-followup',
    { body: { leadId, channel } },
  )

  // A non-2xx from an Edge Function surfaces as `error` with the JSON body
  // hidden inside the response, so read the body when it is available.
  if (error) {
    const context = (error as { context?: Response }).context
    if (context) {
      const body = await context.json().catch(() => null) as { error?: string } | null
      if (body?.error) throw new Error(body.error)
    }
    throw new Error(error.message || 'The follow-up draft could not be generated.')
  }
  if (!data || data.error) throw new Error(data?.error || 'The follow-up draft could not be generated.')
  if (!data.draft) throw new Error('The drafting service returned an empty message.')

  return { draft: data.draft, locale: data.locale, channel: data.channel }
}
