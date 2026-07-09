import { useCallback, useMemo, useState } from 'react'
import { bestSellers, contactInfo, shippingInfo } from '../../data/assistantKnowledgeBase'
import { getAssistantProvider } from '../../lib/assistant/aiProvider'
import { emptyEscalationData, escalationSteps, type EscalationData } from '../../lib/assistant/escalationFlow'
import { WELCOME_MESSAGE, welcomeQuickReplies } from '../../lib/assistant/welcome'
import type { ChatMessage, QuickReply } from '../../lib/assistant/types'
import { buildEscalationMessage, buildWhatsAppUrl, GENERAL_INQUIRY_MESSAGE } from '../../lib/whatsapp'

function createId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

type EscalationState = { stepIndex: number; data: EscalationData }

export function useConversationManager() {
  const provider = useMemo(() => getAssistantProvider(), [])
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    { id: createId(), role: 'assistant', text: WELCOME_MESSAGE, quickReplies: welcomeQuickReplies },
  ])
  const [isTyping, setIsTyping] = useState(false)
  const [escalation, setEscalation] = useState<EscalationState | null>(null)

  const pushMessage = useCallback((message: Omit<ChatMessage, 'id'>) => {
    setMessages((prev) => [...prev, { ...message, id: createId() }])
  }, [])

  const startEscalation = useCallback(
    async (prefill?: Partial<EscalationData>) => {
      const data = { ...emptyEscalationData, ...prefill }
      const startIndex = escalationSteps.findIndex((step) => !data[step.field])
      const stepIndex = startIndex === -1 ? escalationSteps.length : startIndex
      setEscalation({ stepIndex, data })

      if (stepIndex < escalationSteps.length) {
        setIsTyping(true)
        await delay(450)
        setIsTyping(false)
        pushMessage({ role: 'assistant', text: escalationSteps[stepIndex].prompt })
      }
    },
    [pushMessage],
  )

  const completeEscalation = useCallback(
    async (data: EscalationData) => {
      setIsTyping(true)
      await delay(450)
      setIsTyping(false)
      const whatsappMessage = buildEscalationMessage(data)
      pushMessage({
        role: 'assistant',
        text: 'Thank you. One of our specialists will continue your order through WhatsApp.',
        cta: { label: 'Continue on WhatsApp', href: buildWhatsAppUrl(whatsappMessage), external: true },
      })
      setEscalation(null)
    },
    [pushMessage],
  )

  const handleAction = useCallback(
    async (actionId: string) => {
      switch (actionId) {
        case 'browse-products': {
          pushMessage({ role: 'user', text: 'Browse Products' })
          setIsTyping(true)
          await delay(400)
          setIsTyping(false)
          pushMessage({
            role: 'assistant',
            text: 'Here is our full research catalog, organized by category — Metabolic & Weight Management, Recovery & Regeneration, Longevity & Cellular Health, Cognitive & Performance, and Hormone & Wellness.',
            cta: { label: 'View Catalog', href: '/catalog' },
          })
          return
        }
        case 'best-sellers': {
          pushMessage({ role: 'user', text: 'Best Sellers' })
          setIsTyping(true)
          await delay(400)
          setIsTyping(false)
          const list = bestSellers.map((product) => `• ${product.name} — from $${product.startingPrice}`).join('\n')
          pushMessage({
            role: 'assistant',
            text: `Some of our most requested catalog entries:\n\n${list}`,
            cta: { label: 'View Catalog', href: '/catalog' },
          })
          return
        }
        case 'pricing': {
          pushMessage({ role: 'user', text: 'Pricing' })
          setIsTyping(true)
          await delay(400)
          setIsTyping(false)
          pushMessage({
            role: 'assistant',
            text: 'Pricing varies by product and strength — every catalog card shows a starting price, and our team confirms exact pricing and availability before you order.',
            cta: { label: 'View Catalog', href: '/catalog' },
          })
          return
        }
        case 'shipping': {
          pushMessage({ role: 'user', text: 'Shipping' })
          setIsTyping(true)
          await delay(400)
          setIsTyping(false)
          pushMessage({ role: 'assistant', text: `${shippingInfo.nationwide} ${shippingInfo.mexico}` })
          return
        }
        case 'local-delivery': {
          pushMessage({ role: 'user', text: 'Local Delivery' })
          setIsTyping(true)
          await delay(400)
          setIsTyping(false)
          pushMessage({ role: 'assistant', text: shippingInfo.local })
          return
        }
        case 'track-order': {
          pushMessage({ role: 'user', text: 'Track My Order' })
          setIsTyping(true)
          await delay(400)
          setIsTyping(false)
          pushMessage({
            role: 'assistant',
            text: 'For order status, our team can look that up directly on WhatsApp.',
            cta: {
              label: 'Continue on WhatsApp',
              href: buildWhatsAppUrl('Hello Encore Bio Labs, I would like an update on my order status.'),
              external: true,
            },
          })
          return
        }
        case 'contact-team': {
          pushMessage({ role: 'user', text: 'Contact Team' })
          setIsTyping(true)
          await delay(400)
          setIsTyping(false)
          pushMessage({
            role: 'assistant',
            text: `You can reach our team on WhatsApp at ${contactInfo.whatsappDisplay}. ${contactInfo.hours}`,
            cta: { label: 'Continue on WhatsApp', href: contactInfo.whatsappUrl, external: true },
          })
          return
        }
        case 'order-whatsapp':
        case 'start-order': {
          pushMessage({ role: 'user', text: 'Order on WhatsApp' })
          setIsTyping(true)
          await delay(400)
          setIsTyping(false)
          pushMessage({
            role: 'assistant',
            text: "I can help set that up. Let's collect a few details so our specialist can pick up right where you left off.",
          })
          await startEscalation()
          return
        }
        default:
          return
      }
    },
    [pushMessage, startEscalation],
  )

  const sendUserMessage = useCallback(
    async (rawText: string) => {
      const text = rawText.trim()
      if (!text) return

      pushMessage({ role: 'user', text })

      if (escalation) {
        const step = escalationSteps[escalation.stepIndex]
        const nextData = { ...escalation.data, [step.field]: text }
        const nextIndex = escalation.stepIndex + 1

        if (nextIndex >= escalationSteps.length) {
          await completeEscalation(nextData)
        } else {
          setEscalation({ stepIndex: nextIndex, data: nextData })
          setIsTyping(true)
          await delay(450)
          setIsTyping(false)
          pushMessage({ role: 'assistant', text: escalationSteps[nextIndex].prompt })
        }
        return
      }

      setIsTyping(true)
      const history = messages.map((message) => ({ role: message.role, text: message.text }))
      const [answer] = await Promise.all([provider.respond(text, history), delay(500)])
      setIsTyping(false)

      pushMessage({ role: 'assistant', text: answer.text, quickReplies: answer.quickReplies, cta: answer.cta })

      if (answer.action === 'start-escalation') {
        await startEscalation()
      }
    },
    [completeEscalation, escalation, messages, provider, pushMessage, startEscalation],
  )

  const handleQuickReply = useCallback(
    (reply: QuickReply) => {
      void handleAction(reply.id)
    },
    [handleAction],
  )

  const resetConversation = useCallback(() => {
    setMessages([{ id: createId(), role: 'assistant', text: WELCOME_MESSAGE, quickReplies: welcomeQuickReplies }])
    setEscalation(null)
    setIsTyping(false)
  }, [])

  return {
    messages,
    isTyping,
    escalation,
    sendUserMessage,
    handleAction,
    handleQuickReply,
    resetConversation,
    generalInquiryUrl: buildWhatsAppUrl(GENERAL_INQUIRY_MESSAGE),
  }
}
