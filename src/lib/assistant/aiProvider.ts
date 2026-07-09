import { localKnowledgeBaseProvider } from './localKnowledgeBaseProvider'
import type { AssistantAIProvider } from './types'

/**
 * Single swap point for the assistant's backend.
 *
 * Today this returns the local knowledge-base provider. To move to a hosted
 * AI backend (OpenAI, Botpress, Jotform AI Agent, etc.), implement
 * AssistantAIProvider in a new file (e.g. openAiProvider.ts) and return it
 * here instead — no UI or ConversationManager changes required.
 */
export function getAssistantProvider(): AssistantAIProvider {
  return localKnowledgeBaseProvider
}
