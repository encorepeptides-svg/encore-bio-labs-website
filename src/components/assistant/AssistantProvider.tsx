import { createContext, useContext, useState, type ReactNode } from 'react'
import { useConversationManager } from './useConversationManager'

type ConversationManager = ReturnType<typeof useConversationManager>

type AssistantContextValue = ConversationManager & {
  isOpen: boolean
  open: () => void
  close: () => void
  toggle: () => void
}

const AssistantContext = createContext<AssistantContextValue | null>(null)

export function AssistantProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const conversation = useConversationManager()

  const value: AssistantContextValue = {
    ...conversation,
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen((previous) => !previous),
  }

  return <AssistantContext.Provider value={value}>{children}</AssistantContext.Provider>
}

export function useAssistant() {
  const context = useContext(AssistantContext)
  if (!context) {
    throw new Error('useAssistant must be used within an AssistantProvider')
  }
  return context
}
