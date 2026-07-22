export type CategoryPathwayConfig = {
  themeIndex: number
  productSlugs: string[]
}

export type CategoryExperienceConfig = {
  slug: string
  flagshipSlug?: string
  heroProductSlugs: string[]
  productSlugs: string[]
  accessorySlugs?: string[]
  pathways: CategoryPathwayConfig[]
  heroMedia?: 'metabolic-video'
}

/**
 * Merchandising order and pathway groupings for category landing pages.
 * Prices, variants, eligibility, inventory state, and product copy continue to
 * come exclusively from products.ts.
 */
export const categoryExperienceBySlug: Record<string, CategoryExperienceConfig> = {
  'metabolic-weight-management': {
    slug: 'metabolic-weight-management',
    flagshipSlug: 'retatrutide',
    heroProductSlugs: ['retatrutide'],
    productSlugs: ['retatrutide', 'tesamorelin', 'mots-c', 'aod-9604', 'cjc1295-ipamorelin'],
    pathways: [
      { themeIndex: 0, productSlugs: ['retatrutide'] },
      { themeIndex: 1, productSlugs: ['tesamorelin', 'cjc1295-ipamorelin', 'aod-9604'] },
      { themeIndex: 3, productSlugs: ['mots-c'] },
    ],
    heroMedia: 'metabolic-video',
  },
  'recovery-regeneration': {
    slug: 'recovery-regeneration',
    flagshipSlug: 'wolverine-stack',
    heroProductSlugs: ['wolverine-stack', 'klow'],
    productSlugs: ['wolverine-stack', 'klow', 'ghk-cu', 'ahk-cu'],
    pathways: [
      { themeIndex: 0, productSlugs: ['wolverine-stack'] },
      { themeIndex: 3, productSlugs: ['klow'] },
      { themeIndex: 2, productSlugs: ['ghk-cu', 'ahk-cu'] },
    ],
  },
  'longevity-cellular-health': {
    slug: 'longevity-cellular-health',
    flagshipSlug: 'nad-plus',
    heroProductSlugs: ['nad-plus', 'ss31'],
    productSlugs: ['nad-plus', 'glutathione', 'ss31', 'epithalon', 'thymosin-alpha-1'],
    accessorySlugs: ['bac-water'],
    pathways: [
      { themeIndex: 0, productSlugs: ['nad-plus'] },
      { themeIndex: 1, productSlugs: ['glutathione'] },
      { themeIndex: 2, productSlugs: ['ss31'] },
      { themeIndex: 3, productSlugs: ['epithalon', 'thymosin-alpha-1'] },
    ],
  },
  'cognitive-performance': {
    slug: 'cognitive-performance',
    flagshipSlug: 'cerebrolysin',
    heroProductSlugs: ['cerebrolysin', 'semax', 'selank'],
    productSlugs: ['cerebrolysin', 'semax', 'selank'],
    pathways: [
      { themeIndex: 0, productSlugs: ['cerebrolysin'] },
      { themeIndex: 1, productSlugs: ['semax'] },
      { themeIndex: 2, productSlugs: ['selank'] },
    ],
  },
  'hormone-wellness': {
    slug: 'hormone-wellness',
    heroProductSlugs: ['kisspeptin', 'hgh-191aa', 'dsip'],
    productSlugs: ['kisspeptin', 'hcg', 'hgh-191aa', 'igf1-lr3', 'dsip', 'pt-141'],
    pathways: [
      { themeIndex: 0, productSlugs: ['kisspeptin', 'hcg'] },
      { themeIndex: 2, productSlugs: ['hgh-191aa', 'igf1-lr3'] },
      { themeIndex: 3, productSlugs: ['dsip'] },
      { themeIndex: 4, productSlugs: ['pt-141'] },
    ],
  },
}

export function getCategoryExperience(slug: string) {
  return categoryExperienceBySlug[slug]
}
