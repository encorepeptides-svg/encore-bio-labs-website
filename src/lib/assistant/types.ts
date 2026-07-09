export type QuickReply = { id: string; label: string }

export type MessageCTA = { label: string; href: string; external?: boolean }

export type ConversationTurn = { role: 'user' | 'assistant'; text: string }

export type AssistantAnswer = {
  text: string
  quickReplies?: QuickReply[]
  cta?: MessageCTA
  /** Signals the UI to move into the human-escalation / order-collection flow. */
  action?: 'start-escalation'
}

export type ChatMessage = {
  id: string
  role: 'user' | 'assistant'
  text: string
  quickReplies?: QuickReply[]
  cta?: MessageCTA
}

/**
 * Provider-agnostic contract for the assistant's "brain". The UI only ever
 * talks to this interface, so swapping the local knowledge-base provider for
 * OpenAI, Botpress, Jotform AI Agent, or anything else is a one-file change
 * in aiProvider.ts — no component changes required.
 */
export interface AssistantAIProvider {
  respond(userText: string, history: ConversationTurn[]): Promise<AssistantAnswer>
}
