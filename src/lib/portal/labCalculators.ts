/**
 * Bench preparation math for reconstituted research material.
 *
 * Every output is a laboratory unit — mg, mL, µL, mg/mL, µg/µL. The plan
 * deliberately does NOT return U-100 syringe units: U-100 is a human insulin
 * syringe scale, and reporting a transfer on it turns preparation math into
 * administration instruction on a research-use-only catalog. Microlitres carry
 * the same information at finer resolution, so nothing is lost at the bench.
 *
 * Do not reintroduce `syringeUnits` or a per-unit mass without the owner
 * deciding to take that risk again.
 */
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
  // mg/mL and µg/µL are the same ratio; both are reported so the bench value can
  // be read at whichever scale the transfer is being measured in.
  const microgramsPerMicroliter = concentrationMgPerMl
  const aliquotsPerVial = vialMassMg / targetAliquotMg

  if (![concentrationMgPerMl, transferVolumeMl, transferVolumeMicroliters, microgramsPerMicroliter, aliquotsPerVial].every((value) => Number.isFinite(value) && value > 0)) return null

  return {
    totalMassMg: vialMassMg,
    targetAliquotMg,
    concentrationMgPerMl,
    microgramsPerMicroliter,
    transferVolumeMl,
    transferVolumeMicroliters,
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
