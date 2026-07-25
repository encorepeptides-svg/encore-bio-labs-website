import { describe, expect, it } from 'vitest'
import { isMissingOnboardingEvaluationRelation } from './portalData'

describe('portal applications compatibility fallback', () => {
  it('recognizes missing-relation responses from PostgREST and Postgres', () => {
    expect(isMissingOnboardingEvaluationRelation({ code: 'PGRST205' })).toBe(true)
    expect(isMissingOnboardingEvaluationRelation({ code: '42P01' })).toBe(true)
  })

  it('does not hide unrelated authorization or server failures', () => {
    expect(isMissingOnboardingEvaluationRelation({ code: '42501' })).toBe(false)
    expect(isMissingOnboardingEvaluationRelation(null)).toBe(false)
  })
})
