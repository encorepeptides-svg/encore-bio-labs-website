export function calculateStockConcentration(massMg: number, solventMl: number) {
  if (!Number.isFinite(massMg) || !Number.isFinite(solventMl) || massMg <= 0 || solventMl <= 0) return null
  const mgPerMl = massMg / solventMl
  return { mgPerMl, microgramsPerMicroliter: mgPerMl }
}

export function calculateAliquotPlan(vialMassMg: number, diluentVolumeMl: number, targetAliquotMg: number) {
  if (
    !Number.isFinite(vialMassMg)
    || !Number.isFinite(diluentVolumeMl)
    || !Number.isFinite(targetAliquotMg)
    || vialMassMg <= 0
    || diluentVolumeMl <= 0
    || targetAliquotMg <= 0
    || targetAliquotMg > vialMassMg
  ) return null

  const concentrationMgPerMl = vialMassMg / diluentVolumeMl
  const transferVolumeMl = targetAliquotMg / concentrationMgPerMl
  const transferVolumeMicroliters = transferVolumeMl * 1000
  const syringeUnits = transferVolumeMl * 100
  const massMgPerUnit = concentrationMgPerMl / 100
  const aliquotsPerVial = vialMassMg / targetAliquotMg

  if (![concentrationMgPerMl, transferVolumeMl, transferVolumeMicroliters, syringeUnits, massMgPerUnit, aliquotsPerVial].every((value) => Number.isFinite(value) && value > 0)) return null

  return {
    totalMassMg: vialMassMg,
    targetAliquotMg,
    concentrationMgPerMl,
    massMgPerUnit,
    transferVolumeMl,
    transferVolumeMicroliters,
    syringeUnits,
    aliquotsPerVial,
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
