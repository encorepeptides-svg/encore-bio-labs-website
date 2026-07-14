import {
  bestSellers,
  categorySummaries,
  contactInfo,
  productSummaries,
} from '../../data/assistantKnowledgeBase'
import { COMPLIANCE_RESPONSE, isRestrictedQuery } from './complianceRules'
import type { AssistantAIProvider, AssistantAnswer, ConversationTurn } from './types'
import type { Locale } from '../../i18n/config'
import { getAssistantCopy } from './localizedCopy'
import { localizePath } from '../../i18n/config'

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
export function createLocalKnowledgeBaseProvider(locale: Locale = 'en'): AssistantAIProvider {
  const copy = getAssistantCopy(locale)
  const topicQuickReplies = copy.quickReplies
  return {
  async respond(userText: string, _history: ConversationTurn[]): Promise<AssistantAnswer> {
    const text = userText.trim()

    if (isRestrictedQuery(text)) {
      return { text: locale === 'es' ? 'Este catálogo ofrece contexto de investigación únicamente. No proporciona consejo médico, diagnóstico, tratamiento, dosificación ni instrucciones de uso.' : COMPLIANCE_RESPONSE, quickReplies: topicQuickReplies }
    }

    if (matchesAny(text, [/\border\b/i, /\bbuy\b/i, /\bpurchase\b/i, /\bcheckout\b/i, /\bplace an order\b/i])) {
      return {
        text: copy.orderResponse,
        action: 'start-escalation',
      }
    }

    if (/\bmexico\b/i.test(text)) {
      return {
        text: copy.shippingResponse,
        quickReplies: topicQuickReplies,
      }
    }

    if (matchesAny(text, [/\bel paso\b/i, /local delivery/i, /same[- ]day/i])) {
      return { text: copy.localDeliveryResponse, quickReplies: topicQuickReplies }
    }

    if (/\bship/i.test(text)) {
      return {
        text: copy.shippingResponse,
        quickReplies: [{ id: 'local-delivery', label: locale === 'es' ? 'Entrega local' : 'Local Delivery' }],
      }
    }

    if (matchesAny(text, [/\bprice/i, /\bpricing\b/i, /\bcost\b/i, /how much/i])) {
      return {
        text: copy.pricingResponse,
        cta: { label: locale === 'es' ? 'Ver catálogo' : 'View Catalog', href: localizePath('/catalog', locale) },
      }
    }

    if (matchesAny(text, [/\btrack/i, /where is my order/i, /order status/i])) {
      return {
        text: copy.trackResponse,
        cta: { label: copy.continueWhatsapp, href: contactInfo.whatsappUrl, external: true },
      }
    }

    if (matchesAny(text, [/\bcontact\b/i, /\bphone\b/i, /\bemail\b/i, /talk to (a )?(human|person|someone|specialist)/i])) {
      return {
        text: `${copy.contactResponse} ${contactInfo.whatsappDisplay}.`,
        cta: { label: copy.continueWhatsapp, href: contactInfo.whatsappUrl, external: true },
      }
    }

    if (matchesAny(text, [/best.?seller/i, /most popular/i, /top product/i])) {
      const list = bestSellers.map((product) => `• ${product.name} — ${locale === 'es' ? 'desde' : 'from'} $${product.startingPrice}`).join('\n')
      return { text: `${copy.bestSellersIntro}\n\n${list}`, cta: { label: locale === 'es' ? 'Ver catálogo' : 'View Catalog', href: localizePath('/catalog', locale) } }
    }

    const productMatch = findProductMatch(text)
    if (productMatch) {
      return {
        text: locale === 'es'
          ? `${productMatch.name} (${productMatch.category}) — Esta entrada se presenta para contexto de investigación. Precio inicial desde $${productMatch.startingPrice}.`
          : `${productMatch.name} (${productMatch.category}) — ${productMatch.description} Starting at $${productMatch.startingPrice}.`,
        cta: { label: locale === 'es' ? `Ver ${productMatch.name}` : `View ${productMatch.name}`, href: localizePath(productMatch.href, locale) },
        quickReplies: [{ id: 'order-whatsapp', label: locale === 'es' ? 'Pedir por WhatsApp' : 'Order on WhatsApp' }],
      }
    }

    const categoryMatch = findCategoryMatch(text)
    if (categoryMatch) {
      return {
        text: locale === 'es' ? `${categoryMatch.name}: Área de investigación del catálogo.` : `${categoryMatch.name}: ${categoryMatch.description}`,
        cta: { label: locale === 'es' ? 'Ver esta categoría' : 'Browse this category', href: localizePath(categoryMatch.href, locale) },
      }
    }

    if (matchesAny(text, [/\bproducts?\b/i, /\bcatalog\b/i, /what do you (sell|have|offer)/i])) {
      return {
        text: copy.catalogResponse,
        cta: { label: locale === 'es' ? 'Ver catálogo' : 'View Catalog', href: localizePath('/catalog', locale) },
      }
    }

    if (matchesAny(text, [/^hi\b/i, /^hello\b/i, /^hey\b/i])) {
      return {
        text: copy.helloResponse,
      }
    }

    return {
      text: copy.fallbackResponse,
      quickReplies: topicQuickReplies,
    }
  },
  }
}

export const localKnowledgeBaseProvider: AssistantAIProvider = createLocalKnowledgeBaseProvider('en')
