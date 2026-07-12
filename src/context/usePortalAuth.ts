import { useContext } from 'react'
import { PortalAuthContext } from './portalAuthStore'

export function usePortalAuth() {
  const value = useContext(PortalAuthContext)
  if (!value) throw new Error('usePortalAuth must be used within PortalAuthProvider')
  return value
}
