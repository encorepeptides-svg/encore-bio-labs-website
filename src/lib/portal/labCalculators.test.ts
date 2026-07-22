import { describe, expect, it } from 'vitest'
import { calculateAliquotPlan, calculateStockConcentration, calculateWorkingDilution } from './labCalculators'

describe('research-only lab calculators', () => {
  it('calculates a stock concentration without administration units', () => {
    expect(calculateStockConcentration(10, 2)).toEqual({ mgPerMl: 5, microgramsPerMicroliter: 5 })
  })

  it('calculates a C1V1 working dilution', () => {
    expect(calculateWorkingDilution(5, 1, 10)).toEqual({ stockVolumeMl: 2, solventVolumeMl: 8 })
  })

  it('rejects invalid or concentration-increasing inputs', () => {
    expect(calculateStockConcentration(0, 2)).toBeNull()
    expect(calculateWorkingDilution(1, 2, 10)).toBeNull()
  })

  it('calculates a guided research aliquot plan', () => {
    expect(calculateAliquotPlan(5, 2, 250)).toEqual({
      totalMicrograms: 5000,
      concentrationMgPerMl: 2.5,
      concentrationMicrogramsPerMicroliter: 2.5,
      transferVolumeMicroliters: 100,
      aliquotsPerVial: 20,
    })
  })

  it('supports non-round laboratory volumes', () => {
    const result = calculateAliquotPlan(10, 1.5, 500)
    expect(result?.transferVolumeMicroliters).toBeCloseTo(75)
    expect(result?.concentrationMgPerMl).toBeCloseTo(6.6667, 4)
  })

  it('rejects aliquots larger than the vial contents', () => {
    expect(calculateAliquotPlan(1, 2, 1001)).toBeNull()
  })
})
