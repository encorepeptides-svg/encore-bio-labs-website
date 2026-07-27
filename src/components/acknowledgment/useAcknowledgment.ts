import { useContext } from 'react'
import { AcknowledgmentContext } from './acknowledgmentContext'

export function useAcknowledgment() {
  const context = useContext(AcknowledgmentContext)
  if (!context) throw new Error('useAcknowledgment must be used within AcknowledgmentProvider')
  return context
}
