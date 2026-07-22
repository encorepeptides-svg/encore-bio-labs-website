import { describe, expect, it } from 'vitest'
import { calculateStockConcentration, calculateWorkingDilution } from './labCalculators'

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
})
