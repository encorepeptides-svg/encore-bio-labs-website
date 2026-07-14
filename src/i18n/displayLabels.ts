type Translator = (key: string, vars?: Record<string, string | number>) => string

/**
 * Internal cart values stay stable in English so stored carts and CRM records
 * remain compatible. These helpers are the only place those values become
 * user-facing labels.
 */
export function purchaseTypeLabel(t: Translator, value: string) {
  switch (value) {
    case 'Vial Only':
      return t('purchaseTypeVialOnly')
    case 'Product Only':
      return t('purchaseTypeProductOnly')
    case 'Encore Complete Kit':
      return t('purchaseTypeCompleteKit')
    case 'Multi-Vial Research Pack':
      return t('purchaseTypeMultipack')
    default:
      return value
  }
}

export function formatLabel(t: Translator, value: string) {
  const normalized = value.toLowerCase()
  if (normalized.includes('vial')) return t('formatVial')
  if (normalized.includes('kit')) return t('formatKit')
  if (normalized.includes('pack')) return t('formatPack')
  if (normalized.includes('supply')) return t('formatSupply')
  return value
}
