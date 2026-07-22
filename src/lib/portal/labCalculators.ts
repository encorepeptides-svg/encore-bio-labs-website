export function calculateStockConcentration(massMg: number, solventMl: number) {
  if (!Number.isFinite(massMg) || !Number.isFinite(solventMl) || massMg <= 0 || solventMl <= 0) return null
  const mgPerMl = massMg / solventMl
  return { mgPerMl, microgramsPerMicroliter: mgPerMl }
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
