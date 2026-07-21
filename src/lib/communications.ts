import { supabase } from './supabaseClient'

export type ContactMessageInput = { name: string; email: string; phone?: string; subject: string; message: string; locale: 'en' | 'es'; preferredContact?: string; website?: string }

/** Sends through the server-only communications function; it always stores the message before attempting delivery. */
export async function submitContactMessage(input: ContactMessageInput) {
  if (!supabase) throw new Error('Communications are not configured.')
  const { error } = await supabase.functions.invoke('communications', { body: { action: 'contact', ...input } })
  if (error) throw error
}
