import { categoryNames, products, researchAreas } from './products'
import { brandText } from '../../config/brandText'
import { WHATSAPP_DISPLAY, WHATSAPP_PHONE } from '../lib/whatsapp'

/**
 * Local knowledge base for the Encore AI Assistant.
 *
 * This module is intentionally plain data (no React, no UI). It is the
 * single place the assistant reads business facts from today. Swapping the
 * assistant to a hosted AI backend later means pointing a new
 * AssistantAIProvider at this same shape (or an API that returns it) —
 * see src/lib/assistant/aiProvider.ts.
 */

export const companyInfo = {
  name: 'Encore Bio Labs',
  tagline: brandText.brandPromise,
  positioning: `${brandText.catalogPositioning} ${brandText.complianceDisclaimer}`,
  location: 'El Paso, Texas',
}

export const shippingInfo = {
  local: 'Local delivery eligibility and timing are confirmed during order review.',
  nationwide: 'Available shipping destinations and methods are confirmed during order review.',
  mexico: 'International destination eligibility and shipping cost are confirmed during order review.',
  processing:
    'Orders are processed after an inquiry is approved and product availability is confirmed.',
}

export const policies = {
  researchUseOnly: brandText.complianceDisclaimer,
  ordering:
    'Start with intake or WhatsApp; an Encore specialist confirms availability, quantity, pricing, and fulfillment requirements before procurement proceeds.',
  returns:
    'Our team reviews returns case by case because reagent format, handling, and storage requirements vary by order.',
}

export const contactInfo = {
  whatsappDisplay: WHATSAPP_DISPLAY,
  whatsappUrl: `https://wa.me/${WHATSAPP_PHONE}`,
  intakeUrl: '/intake',
  hours: 'Our team typically responds within 24 hours.',
}

export type CategorySummary = {
  name: string
  slug: string
  description: string
  href: string
}

export const categorySummaries: CategorySummary[] = categoryNames.map((name) => {
  const area = researchAreas.find((researchArea) => researchArea.name === name)
  return {
    name,
    slug: area?.slug ?? '',
    description: area?.description ?? '',
    href: area?.slug ? `/categories/${area.slug}` : '/catalog',
  }
})

export type ProductSummary = {
  slug: string
  name: string
  category: string
  startingPrice: number
  description: string
  featured: boolean
  href: string
}

export const productSummaries: ProductSummary[] = products.map((product) => ({
  slug: product.slug,
  name: product.name,
  category: product.category,
  startingPrice: Math.min(...product.variants.map((variant) => variant.price)),
  description: product.catalogTagline ?? product.shortDescription,
  featured: product.featured,
  href: `/products/${product.slug}`,
}))

export const bestSellers: ProductSummary[] = productSummaries
  .filter((product) => product.featured)
  .slice(0, 6)

export type KnowledgeBaseFAQ = { question: string; answer: string }

export const knowledgeBaseFAQs: KnowledgeBaseFAQ[] = [
  {
    question: 'Is this medical advice?',
    answer: brandText.complianceDisclaimer,
  },
  {
    question: 'How do I place an order?',
    answer:
      'Start a research intake at /intake or message our team on WhatsApp with the product, strength, and quantity you are interested in.',
  },
  {
    question: 'Do you ship to Mexico?',
    answer: 'Destination eligibility, shipping method, and cost are confirmed during order review.',
  },
  {
    question: 'Do you offer local delivery?',
    answer: 'Local delivery eligibility and timing are confirmed during order review.',
  },
]

export const assistantKnowledgeBase = {
  company: companyInfo,
  products: productSummaries,
  bestSellers,
  categories: categorySummaries,
  shipping: shippingInfo,
  policies,
  faqs: knowledgeBaseFAQs,
  contact: contactInfo,
}
