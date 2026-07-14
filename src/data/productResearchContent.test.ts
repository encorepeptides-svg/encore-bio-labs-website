import { describe, expect, it } from 'vitest'
import { products } from './products'
import { productResearchContent } from './productResearchContent'

describe('product research content registry', () => {
  const activeNonRetatrutide = products.filter((product) => product.slug !== 'retatrutide')

  it('covers every active non-Retatrutide product exactly by canonical slug', () => {
    expect(Object.keys(productResearchContent).sort()).toEqual(
      activeNonRetatrutide.map((product) => product.slug).sort(),
    )
    expect(productResearchContent.retatrutide).toBeUndefined()
  })

  it('provides product-specific research sections and limitations', () => {
    for (const product of activeNonRetatrutide) {
      const content = productResearchContent[product.slug]
      expect(content.overview.length).toBeGreaterThan(80)
      expect(content.mechanismSteps.length).toBeGreaterThanOrEqual(4)
      expect(content.researchAreas.length).toBeGreaterThanOrEqual(3)
      expect(content.limitations.length).toBeGreaterThanOrEqual(4)
      expect(content.faq.length).toBeGreaterThanOrEqual(4)
    }
  })

  it('keeps source records complete and explicitly allows only non-compound entries without studies', () => {
    const noStudySlugs = Object.entries(productResearchContent)
      .filter(([, content]) => content.studies.length === 0)
      .map(([slug]) => slug)
      .sort()

    expect(noStudySlugs).toEqual(['bac-water', 'klow'])

    for (const content of Object.values(productResearchContent)) {
      for (const study of content.studies) {
        expect(study.title.length).toBeGreaterThan(10)
        expect(study.year).toBeGreaterThan(1900)
        expect(study.url.startsWith('https://')).toBe(true)
        expect(study.summary.length).toBeGreaterThan(40)
        expect(study.limitation.length).toBeGreaterThan(30)
      }
    }
  })
})
