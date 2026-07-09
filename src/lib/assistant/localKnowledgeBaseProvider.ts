import {
  assistantKnowledgeBase,
  bestSellers,
  categorySummaries,
  contactInfo,
  productSummaries,
  shippingInfo,
} from '../../data/assistantKnowledgeBase'
import { COMPLIANCE_RESPONSE, isRestrictedQuery } from './complianceRules'
import type { AssistantAIProvider, AssistantAnswer, ConversationTurn } from './types'

const topicQuickReplies = [
  { id: 'pricing', label: 'Pricing' },
  { id: 'shipping', label: 'Shipping' },
  { id: 'order-whatsapp', label: 'Order on WhatsApp' },
]

function matchesAny(text: string, patterns: RegExp[]) {
  return patterns.some((pattern) => pattern.test(text))
}

function findProductMatch(text: string) {
  const lower = text.toLowerCase()
  return productSummaries.find((product) => lower.includes(product.name.toLowerCase()))
}

function findCategoryMatch(text: string) {
  const lower = text.toLowerCase()
  return categorySummaries.find((category) => lower.includes(category.name.toLowerCase()))
}

/**
 * Local, deterministic "brain" for the assistant. It routes on keywords
 * against the static knowledge base — no network calls, no external
 * dependency. Implements AssistantAIProvider so it can be swapped for a
 * hosted model without touching any UI component.
 */
export const localKnowledgeBaseProvider: AssistantAIProvider = {
  async respond(userText: string, _history: ConversationTurn[]): Promise<AssistantAnswer> {
    const text = userText.trim()

    if (isRestrictedQuery(text)) {
      return { text: COMPLIANCE_RESPONSE, quickReplies: topicQuickReplies }
    }

    if (matchesAny(text, [/\border\b/i, /\bbuy\b/i, /\bpurchase\b/i, /\bcheckout\b/i, /\bplace an order\b/i])) {
      return {
        text: "I can help you start that order. Let's collect a few quick details so our specialist can pick up right where you left off.",
        action: 'start-escalation',
      }
    }

    if (/\bmexico\b/i.test(text)) {
      return {
        text: `${shippingInfo.mexico} ${shippingInfo.nationwide}`,
        quickReplies: [{ id: 'order-whatsapp', label: 'Order on WhatsApp' }],
      }
    }

    if (matchesAny(text, [/\bel paso\b/i, /local delivery/i, /same[- ]day/i])) {
      return { text: shippingInfo.local, quickReplies: [{ id: 'order-whatsapp', label: 'Order on WhatsApp' }] }
    }

    if (/\bship/i.test(text)) {
      return {
        text: `${shippingInfo.nationwide} ${shippingInfo.mexico}`,
        quickReplies: [{ id: 'local-delivery', label: 'Local Delivery' }],
      }
    }

    if (matchesAny(text, [/\bprice/i, /\bpricing\b/i, /\bcost\b/i, /how much/i])) {
      return {
        text: 'Pricing varies by product and strength. Every catalog card shows a starting price, and our team confirms exact pricing and availability before you order.',
        cta: { label: 'View Catalog', href: '/catalog' },
      }
    }

    if (matchesAny(text, [/\btrack/i, /where is my order/i, /order status/i])) {
      return {
        text: 'For order status, our team can look it up directly on WhatsApp.',
        cta: { label: 'Continue on WhatsApp', href: contactInfo.whatsappUrl, external: true },
      }
    }

    if (matchesAny(text, [/\bcontact\b/i, /\bphone\b/i, /\bemail\b/i, /talk to (a )?(human|person|someone|specialist)/i])) {
      return {
        text: `You can reach our team on WhatsApp at ${contactInfo.whatsappDisplay}. ${contactInfo.hours}`,
        cta: { label: 'Continue on WhatsApp', href: contactInfo.whatsappUrl, external: true },
      }
    }

    if (matchesAny(text, [/best.?seller/i, /most popular/i, /top product/i])) {
      const list = bestSellers.map((product) => `• ${product.name} — from $${product.startingPrice}`).join('\n')
      return { text: `Some of our most requested catalog entries:\n\n${list}`, cta: { label: 'View Catalog', href: '/catalog' } }
    }

    const productMatch = findProductMatch(text)
    if (productMatch) {
      return {
        text: `${productMatch.name} (${productMatch.category}) — ${productMatch.description} Starting at $${productMatch.startingPrice}.`,
        cta: { label: `View ${productMatch.name}`, href: productMatch.href },
        quickReplies: [{ id: 'order-whatsapp', label: 'Order on WhatsApp' }],
      }
    }

    const categoryMatch = findCategoryMatch(text)
    if (categoryMatch) {
      return {
        text: `${categoryMatch.name}: ${categoryMatch.description}`,
        cta: { label: 'Browse this category', href: categoryMatch.href },
      }
    }

    if (matchesAny(text, [/\bproducts?\b/i, /\bcatalog\b/i, /what do you (sell|have|offer)/i])) {
      return {
        text: `${assistantKnowledgeBase.company.name} carries research compounds across ${categorySummaries.length} categories — Metabolic & Weight Management, Recovery & Regeneration, Longevity & Cellular Health, Cognitive & Performance, and Hormone & Wellness.`,
        cta: { label: 'View Catalog', href: '/catalog' },
      }
    }

    if (matchesAny(text, [/^hi\b/i, /^hello\b/i, /^hey\b/i])) {
      return {
        text: 'Hello! I can help with product information, pricing, shipping, delivery, and ordering — what would you like to know?',
      }
    }

    return {
      text: 'I can help with product information, pricing, shipping, delivery, and ordering. You can also reach our team directly on WhatsApp for anything else.',
      quickReplies: topicQuickReplies,
    }
  },
}
