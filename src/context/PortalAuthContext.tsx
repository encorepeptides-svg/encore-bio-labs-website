import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient'
import { loadPortalIdentity, signOutPortal, type PortalIdentity } from '../lib/portal/portalAuth'
import { PortalAuthContext } from './portalAuthStore'

export function PortalAuthProvider({ children }: { children: ReactNode }) {
  const [identity, setIdentity] = useState<PortalIdentity | null>(null)
  const [loading, setLoading] = useState(true)
  const refresh = useCallback(async () => {
    if (!isSupabaseConfigured) { setIdentity(null); setLoading(false); return }
    setLoading(true)
    try { setIdentity(await loadPortalIdentity()) } catch { setIdentity(null) } finally { setLoading(false) }
  }, [])

  useEffect(() => {
    void refresh()
    const subscription = supabase?.auth.onAuthStateChange(() => { void refresh() }).data.subscription
    return () => subscription?.unsubscribe()
  }, [refresh])

  const logout = useCallback(async () => { await signOutPortal(); setIdentity(null) }, [])
  const value = useMemo(() => ({ identity, loading, configured: isSupabaseConfigured, refresh, logout }), [identity, loading, logout, refresh])
  return <PortalAuthContext.Provider value={value}>{children}</PortalAuthContext.Provider>
}
