import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import {
  createSiteEntryAcknowledgmentRecord,
  readSiteEntryAcknowledgment,
  storeSiteEntryAcknowledgment,
} from '../../lib/acknowledgmentStorage'
import {
  AcknowledgmentContext,
  type AcknowledgmentContextValue,
} from './acknowledgmentContext'

type AcknowledgmentProviderProps = {
  bypassEntryGate?: boolean
  children: ReactNode
}

export function AcknowledgmentProvider({
  bypassEntryGate = false,
  children,
}: AcknowledgmentProviderProps) {
  const { locale } = useLocale()
  const [accepted, setAccepted] = useState(() => Boolean(readSiteEntryAcknowledgment()))

  const acceptSiteEntry = useCallback(() => {
    const record = createSiteEntryAcknowledgmentRecord(locale)
    storeSiteEntryAcknowledgment(record)
    setAccepted(true)
  }, [locale])

  const value = useMemo<AcknowledgmentContextValue>(() => ({
    isEntryBlocked: !bypassEntryGate && !accepted,
    acceptSiteEntry,
  }), [acceptSiteEntry, accepted, bypassEntryGate])

  return (
    <AcknowledgmentContext.Provider value={value}>
      {children}
    </AcknowledgmentContext.Provider>
  )
}
