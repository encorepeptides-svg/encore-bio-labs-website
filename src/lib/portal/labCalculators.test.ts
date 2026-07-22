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
    expect(calculateAliquotPlan(10, 2, 1)).toEqual({
      totalMassMg: 10,
      targetAliquotMg: 1,
      concentrationMgPerMl: 5,
      massMgPerUnit: 0.05,
      transferVolumeMl: 0.2,
      transferVolumeMicroliters: 200,
      syringeUnits: 20,
      aliquotsPerVial: 10,
    })
  })

  it('supports non-round laboratory volumes', () => {
    const result = calculateAliquotPlan(10, 1.5, 0.5)
    expect(result?.transferVolumeMicroliters).toBeCloseTo(75)
    expect(result?.syringeUnits).toBeCloseTo(7.5)
    expect(result?.concentrationMgPerMl).toBeCloseTo(6.6667, 4)
  })

  it('rejects aliquots larger than the vial contents', () => {
    expect(calculateAliquotPlan(1, 2, 1.001)).toBeNull()
  })

  it('calculates every requested preset and representative custom-value combination in milligrams', () => {
    const targetValues = [1, 2, 4, 6, 10, 2.5]
    const vialValues = [1, 10, 15, 25, 30, 12.5]
    const diluentValues = [1, 2, 3, 5, 10, 2.5]

    for (const targetMg of targetValues) {
      for (const vialMg of vialValues) {
        for (const diluentMl of diluentValues) {
          const result = calculateAliquotPlan(vialMg, diluentMl, targetMg)
          if (targetMg > vialMg) {
            expect(result).toBeNull()
            continue
          }

          const expectedConcentration = vialMg / diluentMl
          const expectedVolumeMl = targetMg / expectedConcentration
          expect(result?.concentrationMgPerMl).toBeCloseTo(expectedConcentration, 10)
          expect(result?.transferVolumeMl).toBeCloseTo(expectedVolumeMl, 10)
          expect(result?.syringeUnits).toBeCloseTo(expectedVolumeMl * 100, 10)
          expect(result?.massMgPerUnit).toBeCloseTo(expectedConcentration / 100, 10)
          expect(result?.aliquotsPerVial).toBeCloseTo(vialMg / targetMg, 10)
        }
      }
    }
  })

  it('rejects zero, negative, non-finite, and divide-by-zero inputs', () => {
    expect(calculateAliquotPlan(0, 2, 1)).toBeNull()
    expect(calculateAliquotPlan(10, 0, 1)).toBeNull()
    expect(calculateAliquotPlan(10, 2, 0)).toBeNull()
    expect(calculateAliquotPlan(-10, 2, 1)).toBeNull()
    expect(calculateAliquotPlan(10, -2, 1)).toBeNull()
    expect(calculateAliquotPlan(10, 2, -1)).toBeNull()
    expect(calculateAliquotPlan(Number.NaN, 2, 1)).toBeNull()
    expect(calculateAliquotPlan(10, Number.POSITIVE_INFINITY, 1)).toBeNull()
    expect(calculateAliquotPlan(10, 2, Number.NEGATIVE_INFINITY)).toBeNull()
  })
})
