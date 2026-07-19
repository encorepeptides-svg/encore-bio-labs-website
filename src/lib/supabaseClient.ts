import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

const portalSessionStorage = typeof window === 'undefined' ? undefined : window.sessionStorage

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl as string, supabaseAnonKey as string, {
      auth: {
        // Keep the portal session across same-tab navigations without leaving a
        // long-lived administrator token in localStorage. A server/Edge cookie
        // exchange can replace this session-scoped browser storage later.
        persistSession: true,
        storage: portalSessionStorage,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null
