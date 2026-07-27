import type { ReactNode } from 'react'
import { useAcknowledgment } from './useAcknowledgment'
import { SiteEntryAcknowledgment } from './SiteEntryAcknowledgment'

export function AcknowledgmentGate({ children }: { children: ReactNode }) {
  const { isEntryBlocked } = useAcknowledgment()

  return (
    <>
      <div
        inert={isEntryBlocked ? true : undefined}
        aria-hidden={isEntryBlocked ? true : undefined}
        data-acknowledgment-protected-content=""
      >
        {children}
      </div>
      {isEntryBlocked ? <SiteEntryAcknowledgment /> : null}
    </>
  )
}
