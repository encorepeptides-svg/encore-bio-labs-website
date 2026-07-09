import { categoryNames, products, researchAreas } from './products'
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
  tagline: 'A cleaner way to explore research compounds.',
  positioning:
    'Encore Bio Labs supplies research-use-only peptides and compounds for qualified researchers. We are not a medical provider and this assistant does not give medical advice, dosing guidance, protocols, or treatment recommendations.',
  location: 'El Paso, Texas',
}

export const shippingInfo = {
  local:
    'Same-day local delivery is available in the El Paso area for approved research inquiries, subject to order timing and courier availability.',
  nationwide: 'Nationwide U.S. shipping is available for research catalog fulfillment.',
  mexico: 'Mexico shipping is available and adds a flat $20 USD to standard shipping.',
  processing:
    'Orders are processed after an inquiry is approved and product availability is confirmed.',
}

export const policies = {
  researchUseOnly:
    'All products are sold for research use only — not for human or animal consumption, and not a drug, supplement, or cosmetic.',
  ordering:
    'Orders begin as an inquiry through the research intake process or WhatsApp; a specialist confirms pricing and availability before fulfillment.',
  returns:
    'Because products are sold for laboratory research use only and may have handling and storage requirements, returns are reviewed case by case. Contact Encore Bio Labs before returning any item.',
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
    answer:
      'No. Encore Bio Labs and this assistant provide research-use information only — not medical advice, dosing guidance, or treatment recommendations.',
  },
  {
    question: 'How do I place an order?',
    answer:
      'Start a research intake at /intake or message our team on WhatsApp with the product, strength, and quantity you are interested in.',
  },
  {
    question: 'Do you ship to Mexico?',
    answer: 'Yes — Mexico shipping is available and adds $20 USD to standard shipping.',
  },
  {
    question: 'Do you offer local delivery?',
    answer: 'Same-day local delivery is available in the El Paso area, subject to timing and availability.',
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
