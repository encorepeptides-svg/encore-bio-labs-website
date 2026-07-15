import { describe, expect, it } from 'vitest'
import { retatrutideDocumentation, retatrutideSources, triumphOne } from './retatrutideClinicalData'

describe('retatrutide clinical data', () => {
  it('keeps every chart value attached to complete source metadata', () => {
    expect(triumphOne.trialIdentifier).toBe('NCT05929066')
    expect(triumphOne.sponsor).toBe('Eli Lilly and Company')
    expect(triumphOne.participantsRandomized).toBe(2339)
    expect(triumphOne.timepoint).toBe('Week 80')
    expect(triumphOne.lastVerified).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(retatrutideSources.find((source) => source.id === triumphOne.sourceId)).toMatchObject({
      sourceType: 'sponsor-topline',
      publishedAt: '2026-05-21',
    })
    expect(triumphOne.arms.map((arm) => arm.averageWeightReduction)).toEqual([19, 25.9, 28.3, 2.2])
    expect(triumphOne.arms.map((arm) => arm.reachedThirtyPercent)).toEqual([15.3, 37.9, 45.3, 0.5])
  })

  it('does not seed illustrative batch documentation', () => {
    expect(retatrutideDocumentation).toEqual([])
  })
})
