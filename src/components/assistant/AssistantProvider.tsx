import { useState, type ReactNode } from 'react'
import { AssistantContext, type AssistantContextValue } from './assistantContext'
import { useConversationManager } from './useConversationManager'

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
