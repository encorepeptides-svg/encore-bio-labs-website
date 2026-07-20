import { describe, expect, it } from 'vitest'
import { calculateBmi, calculatePercentageChange, optionalNumber } from './portalCalculations'
import { numberFromRecord, startOfWeekIso, stringFromRecord } from './portalData'

describe('portal calculations', () => {
  it('calculates BMI in imperial and metric units', () => {
    expect(calculateBmi(70, 180, 'imperial')).toBe(25.8)
    expect(calculateBmi(177.8, 81.6466, 'metric')).toBe(25.8)
    expect(calculateBmi(0, 180, 'imperial')).toBeNull()
  })

  it('calculates signed percentage change', () => {
    expect(calculatePercentageChange(200, 180)).toBe(-10)
    expect(calculatePercentageChange(0, 180)).toBeNull()
  })

  it('normalizes optional numeric form values', () => {
    expect(optionalNumber('')).toBeNull()
    expect(optionalNumber(' 12.5 ')).toBe(12.5)
    expect(optionalNumber('invalid')).toBeNull()
  })
})

describe('portal data helpers', () => {
  it('uses Monday as the beginning of the portal week', () => {
    expect(startOfWeekIso(new Date(2026, 6, 19))).toBe('2026-07-13')
    expect(startOfWeekIso(new Date(2026, 6, 20))).toBe('2026-07-20')
  })

  it('reads typed values from JSON records without coercion', () => {
    expect(numberFromRecord({ weight: 175.5 }, 'weight')).toBe(175.5)
    expect(numberFromRecord({ weight: '175.5' }, 'weight')).toBeNull()
    expect(stringFromRecord({ units: 'imperial' }, 'units')).toBe('imperial')
  })
})
