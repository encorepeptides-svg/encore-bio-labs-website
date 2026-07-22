import { describe, expect, it } from 'vitest'
import { products } from './products'
import {
  getLocalizedProtocol,
  getProtocolsByCategory,
  protocolCategorySlugs,
  protocolFaqs,
  protocols,
  resolveProtocolComponents,
} from './protocols'

describe('protocol catalog', () => {
  it('maps two curated protocols to every actual storefront category', () => {
    expect(protocols).toHaveLength(10)
    for (const categorySlug of protocolCategorySlugs) {
      expect(getProtocolsByCategory(categorySlug), categorySlug).toHaveLength(2)
    }
  })

  it('resolves every component and default variant from the centralized product catalog', () => {
    for (const protocol of protocols) {
      const resolved = resolveProtocolComponents(protocol)
      expect(resolved).toHaveLength(protocol.components.length)
      for (const component of resolved) {
        expect(products.find((product) => product.slug === component.product.slug)).toBe(component.product)
        expect(component.product.variants).toContain(component.defaultVariant)
        expect(component.defaultVariant.price).toBeGreaterThan(0)
      }
    }
  })

  it('ships equivalent English and Spanish protocol content plus six FAQs', () => {
    for (const protocol of protocols) {
      const en = getLocalizedProtocol(protocol, 'en')
      const es = getLocalizedProtocol(protocol, 'es')
      expect(es.title).not.toBe(en.title)
      expect(es.description).not.toBe(en.description)
      expect(es.education).toHaveLength(en.education.length)
    }
    expect(protocolFaqs.en).toHaveLength(6)
    expect(protocolFaqs.es).toHaveLength(protocolFaqs.en.length)
  })
})
