export function calculateBmi(height: number, weight: number, units: 'imperial' | 'metric') {
  if (!Number.isFinite(height) || !Number.isFinite(weight) || height <= 0 || weight <= 0) return null
  const heightMeters = units === 'metric' ? height / 100 : height * 0.0254
  const weightKg = units === 'metric' ? weight : weight * 0.45359237
  return Math.round((weightKg / (heightMeters * heightMeters)) * 10) / 10
}

export function calculatePercentageChange(startingValue: number, currentValue: number) {
  if (!Number.isFinite(startingValue) || !Number.isFinite(currentValue) || startingValue <= 0) return null
  return Math.round(((currentValue - startingValue) / startingValue) * 1000) / 10
}

export function optionalNumber(value: string) {
  if (!value.trim()) return null
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}
