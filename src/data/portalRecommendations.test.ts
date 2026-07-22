import { describe, expect, it } from 'vitest'
import { getPortalProductMatches, inferResearchInterests } from './portalRecommendations'

describe('portal research matches', () => {
  it('keeps an explicitly selected product first', () => {
    const matches = getPortalProductMatches({
      interestedProducts: ['ghk-cu'],
      researchInterests: ['metabolic-weight-management'],
    })
    expect(matches[0].product.slug).toBe('ghk-cu')
    expect(matches[0].matchType).toBe('selected')
  })

  it('maps bilingual legacy goals to stable research interests', () => {
    expect(inferResearchInterests(['Seguimiento de recuperación', 'Energy tracking'])).toEqual([
      'recovery-regeneration',
      'longevity-cellular-health',
      'metabolic-weight-management',
    ])
  })

  it('returns a deliberate default collection when no interests are on file', () => {
    expect(getPortalProductMatches({}).map((match) => match.product.slug)).toEqual([
      'retatrutide',
      'wolverine-stack',
      'nad-plus',
      'ghk-cu',
    ])
  })
})
