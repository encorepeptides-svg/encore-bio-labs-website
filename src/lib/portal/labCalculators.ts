export function calculateStockConcentration(massMg: number, solventMl: number) {
  if (!Number.isFinite(massMg) || !Number.isFinite(solventMl) || massMg <= 0 || solventMl <= 0) return null
  const mgPerMl = massMg / solventMl
  return { mgPerMl, microgramsPerMicroliter: mgPerMl }
}

export function calculateAliquotPlan(vialMassMg: number, diluentVolumeMl: number, targetAliquotMicrograms: number) {
  const totalMicrograms = vialMassMg * 1000
  if (
    !Number.isFinite(vialMassMg)
    || !Number.isFinite(diluentVolumeMl)
    || !Number.isFinite(targetAliquotMicrograms)
    || vialMassMg <= 0
    || diluentVolumeMl <= 0
    || targetAliquotMicrograms <= 0
    || targetAliquotMicrograms > totalMicrograms
  ) return null

  const concentrationMgPerMl = vialMassMg / diluentVolumeMl
  const concentrationMicrogramsPerMicroliter = concentrationMgPerMl
  const transferVolumeMicroliters = targetAliquotMicrograms / concentrationMicrogramsPerMicroliter
  return {
    totalMicrograms,
    concentrationMgPerMl,
    concentrationMicrogramsPerMicroliter,
    transferVolumeMicroliters,
    aliquotsPerVial: totalMicrograms / targetAliquotMicrograms,
  }
}

export function calculateWorkingDilution(stockMgPerMl: number, targetMgPerMl: number, finalVolumeMl: number) {
  if (
    !Number.isFinite(stockMgPerMl)
    || !Number.isFinite(targetMgPerMl)
    || !Number.isFinite(finalVolumeMl)
    || stockMgPerMl <= 0
    || targetMgPerMl <= 0
    || finalVolumeMl <= 0
    || targetMgPerMl > stockMgPerMl
  ) return null

  const stockVolumeMl = (targetMgPerMl * finalVolumeMl) / stockMgPerMl
  return { stockVolumeMl, solventVolumeMl: finalVolumeMl - stockVolumeMl }
}
