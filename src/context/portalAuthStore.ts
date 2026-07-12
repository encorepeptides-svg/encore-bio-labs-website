import { createContext } from 'react'
import type { PortalIdentity } from '../lib/portal/portalAuth'

export type PortalAuthValue = {
  identity: PortalIdentity | null
  loading: boolean
  configured: boolean
  refresh: () => Promise<void>
  logout: () => Promise<void>
}

export const PortalAuthContext = createContext<PortalAuthValue | null>(null)
