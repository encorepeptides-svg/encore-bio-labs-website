import { products, type Product } from './products'

export const PORTAL_RESEARCH_INTERESTS = [
  'metabolic-weight-management',
  'recovery-regeneration',
  'longevity-cellular-health',
  'cognitive-performance',
  'hormone-wellness',
] as const

export type PortalResearchInterest = (typeof PORTAL_RESEARCH_INTERESTS)[number]

const interestProducts: Record<PortalResearchInterest, string[]> = {
  'metabolic-weight-management': ['retatrutide', 'tesamorelin', 'mots-c', 'aod-9604', 'cjc1295-ipamorelin'],
  'recovery-regeneration': ['wolverine-stack', 'klow', 'ghk-cu', 'ahk-cu'],
  'longevity-cellular-health': ['nad-plus', 'ss31', 'glutathione', 'epithalon', 'thymosin-alpha-1'],
  'cognitive-performance': ['cerebrolysin', 'semax', 'selank'],
  'hormone-wellness': ['kisspeptin', 'hcg', 'pt-141', 'dsip', 'igf1-lr3'],
}

const goalInterestAliases: Array<[string[], PortalResearchInterest[]]> = [
  [['weight-management', 'body-composition', 'weight management', 'control de peso', 'composición corporal'], ['metabolic-weight-management']],
  [['recovery', 'recuperación'], ['recovery-regeneration']],
  [['energy', 'energía'], ['longevity-cellular-health', 'metabolic-weight-management']],
  [['wellness', 'bienestar'], ['longevity-cellular-health', 'hormone-wellness']],
  [['documentation', 'documentación'], ['longevity-cellular-health']],
]

export type PortalProductMatch = {
  product: Product
  matchType: 'selected' | 'interest' | 'profile'
  matchedInterest?: PortalResearchInterest
}

function normalized(value: string) {
  return value.trim().toLocaleLowerCase()
}

export function inferResearchInterests(goals: string[]): PortalResearchInterest[] {
  const goalText = goals.map(normalized)
  const matches = new Set<PortalResearchInterest>()
  for (const [aliases, interests] of goalInterestAliases) {
    if (aliases.some((alias) => goalText.some((goal) => goal.includes(alias)))) {
      interests.forEach((interest) => matches.add(interest))
    }
  }
  return [...matches]
}

export function getPortalProductMatches(input: {
  goals?: string[]
  researchInterests?: string[]
  interestedProducts?: string[]
  limit?: number
}): PortalProductMatch[] {
  const explicitProducts = new Set((input.interestedProducts ?? []).map(normalized))
  const validInterests = (input.researchInterests ?? []).filter((value): value is PortalResearchInterest =>
    PORTAL_RESEARCH_INTERESTS.includes(value as PortalResearchInterest),
  )
  const inferredInterests = inferResearchInterests(input.goals ?? [])
  const interests = [...new Set([...validInterests, ...inferredInterests])]
  const score = new Map<string, { points: number; matchType: PortalProductMatch['matchType']; matchedInterest?: PortalResearchInterest }>()

  for (const slug of explicitProducts) {
    score.set(slug, { points: 1000, matchType: 'selected' })
  }
  interests.forEach((interest, interestIndex) => {
    interestProducts[interest].forEach((slug, productIndex) => {
      const current = score.get(slug)
      if (current?.matchType === 'selected') return
      const points = 500 - interestIndex * 20 - productIndex
      if (!current || current.points < points) score.set(slug, { points, matchType: 'interest', matchedInterest: interest })
    })
  })

  if (score.size === 0) {
    ['retatrutide', 'wolverine-stack', 'nad-plus', 'ghk-cu'].forEach((slug, index) => {
      score.set(slug, { points: 100 - index, matchType: 'profile' })
    })
  }

  return products
    .filter((product) => score.has(product.slug))
    .sort((a, b) => score.get(b.slug)!.points - score.get(a.slug)!.points)
    .slice(0, input.limit ?? 4)
    .map((product) => ({ product, ...score.get(product.slug)! }))
}

export function productsForInterestSelection(limit = 15) {
  const priority = [...new Set(PORTAL_RESEARCH_INTERESTS.flatMap((interest) => interestProducts[interest]))]
  return priority
    .map((slug) => products.find((product) => product.slug === slug))
    .filter((product): product is Product => Boolean(product))
    .slice(0, limit)
}
