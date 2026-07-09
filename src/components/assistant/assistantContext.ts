import { createContext, useContext } from 'react'
import { useConversationManager } from './useConversationManager'

type ConversationManager = ReturnType<typeof useConversationManager>

export type AssistantContextValue = ConversationManager & {
  isOpen: boolean
  open: () => void
  close: () => void
  toggle: () => void
}

export const AssistantContext = createContext<AssistantContextValue | null>(null)

export function useAssistant() {
  const context = useContext(AssistantContext)
  if (!context) {
    throw new Error('useAssistant must be used within an AssistantProvider')
  }
  return context
}
