import { createContext } from 'react'

export type AcknowledgmentContextValue = {
  isEntryBlocked: boolean
  acceptSiteEntry: () => void
}

export const AcknowledgmentContext = createContext<AcknowledgmentContextValue | null>(null)
