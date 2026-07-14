import { useCallback, useMemo, useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { bestSellers, contactInfo } from '../../data/assistantKnowledgeBase'
import { getAssistantProvider } from '../../lib/assistant/aiProvider'
import { emptyEscalationData, escalationSteps, type EscalationData } from '../../lib/assistant/escalationFlow'
import type { ChatMessage, QuickReply } from '../../lib/assistant/types'
import { buildEscalationMessage, buildWhatsAppUrl, getGeneralInquiryMessage } from '../../lib/whatsapp'
import { getAssistantCopy } from '../../lib/assistant/localizedCopy'
import { localizePath } from '../../i18n/config'

function createId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

type EscalationState = { stepIndex: number; data: EscalationData }

export function useConversationManager() {
  const { locale } = useLocale()
  const copy = useMemo(() => getAssistantCopy(locale), [locale])
  const provider = useMemo(() => getAssistantProvider(locale), [locale])
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    { id: createId(), role: 'assistant', text: copy.welcome, quickReplies: copy.quickReplies },
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
        pushMessage({ role: 'assistant', text: copy.escalationPrompts[escalationSteps[stepIndex].field] })
      }
    },
    [copy, pushMessage],
  )

  const completeEscalation = useCallback(
    async (data: EscalationData) => {
      setIsTyping(true)
      await delay(450)
      setIsTyping(false)
      const whatsappMessage = buildEscalationMessage({ ...data, locale })
      pushMessage({
        role: 'assistant',
        text: copy.thanks,
        cta: { label: copy.continueWhatsapp, href: buildWhatsAppUrl(whatsappMessage), external: true },
      })
      setEscalation(null)
    },
    [copy, locale, pushMessage],
  )

  const handleAction = useCallback(
    async (actionId: string) => {
      switch (actionId) {
        case 'browse-products': {
          pushMessage({ role: 'user', text: locale === 'es' ? 'Explorar productos' : 'Browse Products' })
          setIsTyping(true)
          await delay(400)
          setIsTyping(false)
          pushMessage({ role: 'assistant', text: copy.catalogResponse, cta: { label: locale === 'es' ? 'Ver catálogo' : 'View Catalog', href: localizePath('/catalog', locale) } })
          return
        }
        case 'best-sellers': {
          pushMessage({ role: 'user', text: locale === 'es' ? 'Más solicitados' : 'Best Sellers' })
          setIsTyping(true)
          await delay(400)
          setIsTyping(false)
          const list = bestSellers.map((product) => `• ${product.name} — ${locale === 'es' ? 'desde' : 'from'} $${product.startingPrice}`).join('\n')
          pushMessage({
            role: 'assistant',
            text: `${copy.bestSellersIntro}\n\n${list}`,
            cta: { label: locale === 'es' ? 'Ver catálogo' : 'View Catalog', href: localizePath('/catalog', locale) },
          })
          return
        }
        case 'pricing': {
          pushMessage({ role: 'user', text: locale === 'es' ? 'Precios' : 'Pricing' })
          setIsTyping(true)
          await delay(400)
          setIsTyping(false)
          pushMessage({
            role: 'assistant',
            text: copy.pricingResponse,
            cta: { label: locale === 'es' ? 'Ver catálogo' : 'View Catalog', href: localizePath('/catalog', locale) },
          })
          return
        }
        case 'shipping': {
          pushMessage({ role: 'user', text: locale === 'es' ? 'Envíos' : 'Shipping' })
          setIsTyping(true)
          await delay(400)
          setIsTyping(false)
          pushMessage({ role: 'assistant', text: copy.shippingResponse })
          return
        }
        case 'local-delivery': {
          pushMessage({ role: 'user', text: locale === 'es' ? 'Entrega local' : 'Local Delivery' })
          setIsTyping(true)
          await delay(400)
          setIsTyping(false)
          pushMessage({ role: 'assistant', text: copy.localDeliveryResponse })
          return
        }
        case 'track-order': {
          pushMessage({ role: 'user', text: locale === 'es' ? 'Rastrear mi pedido' : 'Track My Order' })
          setIsTyping(true)
          await delay(400)
          setIsTyping(false)
          pushMessage({
            role: 'assistant',
            text: copy.trackResponse,
            cta: {
              label: copy.continueWhatsapp,
              href: buildWhatsAppUrl(locale === 'es' ? 'Hola Encore Bio Labs, quisiera una actualización sobre el estado de mi pedido.' : 'Hello Encore Bio Labs, I would like an update on my order status.'),
              external: true,
            },
          })
          return
        }
        case 'contact-team': {
          pushMessage({ role: 'user', text: locale === 'es' ? 'Contactar al equipo' : 'Contact Team' })
          setIsTyping(true)
          await delay(400)
          setIsTyping(false)
          pushMessage({
            role: 'assistant',
            text: `${copy.contactResponse} ${contactInfo.whatsappDisplay}.`,
            cta: { label: copy.continueWhatsapp, href: contactInfo.whatsappUrl, external: true },
          })
          return
        }
        case 'order-whatsapp':
        case 'start-order': {
          pushMessage({ role: 'user', text: locale === 'es' ? 'Pedir por WhatsApp' : 'Order on WhatsApp' })
          setIsTyping(true)
          await delay(400)
          setIsTyping(false)
          pushMessage({
            role: 'assistant',
            text: copy.orderResponse,
          })
          await startEscalation()
          return
        }
        default:
          return
      }
    },
    [copy, locale, pushMessage, startEscalation],
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
          pushMessage({ role: 'assistant', text: copy.escalationPrompts[escalationSteps[nextIndex].field] })
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
    [completeEscalation, copy, escalation, messages, provider, pushMessage, startEscalation],
  )

  const handleQuickReply = useCallback(
    (reply: QuickReply) => {
      void handleAction(reply.id)
    },
    [handleAction],
  )

  const resetConversation = useCallback(() => {
    setMessages([{ id: createId(), role: 'assistant', text: copy.welcome, quickReplies: copy.quickReplies }])
    setEscalation(null)
    setIsTyping(false)
  }, [copy])

  return {
    messages,
    isTyping,
    escalation,
    sendUserMessage,
    handleAction,
    handleQuickReply,
    resetConversation,
    generalInquiryUrl: buildWhatsAppUrl(getGeneralInquiryMessage(locale)),
  }
}
