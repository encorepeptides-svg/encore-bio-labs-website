import type { Locale } from '../i18n/config'

// Real, on-file Certificates of Analysis. Only add an entry here once a signed
// lab report for that product has actually been received and reviewed — this
// list is intentionally shorter than the product catalog. Do not extrapolate
// or estimate values for products without an entry; the generic "documentation
// available on request" copy stays accurate and honest for everything else.
export type CoaRecord = {
  /** What was actually tested: the finished, packaged product, or the manufacturing-stage raw material. */
  scope: 'finished-product' | 'raw-material'
  labName: string
  labLocation: string
  method: string
  reportDate: string
  batchReference: string
  results: { component: string; value: string }[]
  fileUrl: string
  fileType: 'pdf' | 'image'
  /** Public, independently checkable verification, if the lab offers one. */
  verify?: { label: string; url: string }
}

/**
 * Spanish translations for the free-text COA method descriptions. Lab-standard
 * acronyms (LC-MS, LC-MS-UV) are language-neutral and pass through unchanged, so
 * only the full-sentence methods need an entry. Keeps the English data untouched.
 */
const coaMethodEs: Record<string, string> = {
  'Analytical testing referencing USP / EP / ChP methodology': 'Pruebas analíticas con referencia a metodología USP / EP / ChP',
}

/** Localizes a COA method string for display; unmapped values pass through as-is. */
export function localizeCoaMethod(method: string, locale: Locale): string {
  return locale === 'es' ? coaMethodEs[method] ?? method : method
}

export const coaBySlug: Record<string, CoaRecord> = {
  klow: {
    scope: 'finished-product',
    labName: 'Janoshik',
    labLocation: 'Independent third-party lab',
    method: 'LC-MS',
    reportDate: '2025-11-21',
    batchReference: 'Batch PMQA',
    results: [
      { component: 'GHK-Cu', value: '58.43 mg' },
      { component: 'BPC-157', value: '11.80 mg' },
      { component: 'TB-500 (TB4)', value: '10.13 mg' },
      { component: 'KPV', value: '10.76 mg' },
    ],
    fileUrl: '/coa/klow-batch-pmqa.png',
    fileType: 'image',
    verify: { label: 'Verify this result at janoshik.com/verify', url: 'https://www.janoshik.com/verify/' },
  },
  'ghk-cu': {
    scope: 'raw-material',
    labName: 'ACS Peptide Testing Labs',
    labLocation: 'Sun City Center, FL',
    method: 'LC-MS-UV',
    reportDate: '2026-05-27',
    batchReference: 'Batch 002',
    results: [{ component: 'GHK-Cu identity & purity', value: '99.99%' }],
    fileUrl: '/coa/ghk-cu-batch-002.pdf',
    fileType: 'pdf',
  },
  tesamorelin: {
    scope: 'raw-material',
    labName: 'North South Precision Testing Technology Service',
    labLocation: 'Shenzhen, China',
    method: 'Analytical testing referencing USP / EP / ChP methodology',
    reportDate: '2026-06-26',
    batchReference: 'Batch 20250518',
    results: [
      { component: 'Tesamorelin purity', value: '99.62%' },
      { component: 'Heavy metals (Pb, Cd, Hg, As)', value: 'Not detected' },
    ],
    fileUrl: '/coa/tesamorelin-batch-20250518.pdf',
    fileType: 'pdf',
  },
  'nad-plus': {
    scope: 'raw-material',
    labName: 'North South Precision Testing Technology Service',
    labLocation: 'Shenzhen, China',
    method: 'Analytical testing referencing USP / EP / ChP methodology',
    reportDate: '2026-06-04',
    batchReference: 'Batch 20250510',
    results: [
      { component: 'NAD+ purity', value: '99.89%' },
      { component: 'Heavy metals (Pb, Cd, Hg, As)', value: 'Not detected' },
    ],
    fileUrl: '/coa/nad-plus-batch-20250510.pdf',
    fileType: 'pdf',
  },
}
