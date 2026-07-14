import type { Locale } from '../i18n/config'
import { getCatalogFilter, type CatalogFilter } from '../components/catalog/catalogHelpers'
import { getLocalizedProduct } from './productTranslations'
import { products, type Product } from './products'

type SearchAliases = { en: string[]; es: string[] }

/** Search vocabulary is metadata layered over the canonical products array. */
export const productSearchAliases: Record<string, SearchAliases> = {
  retatrutide: { en: ['retatrutide', 'triple agonist', 'gip glp-1 glucagon'], es: ['retatrutida', 'agonista triple'] },
  tesamorelin: { en: ['tesamorelin', 'ghrh analog', 'growth hormone releasing hormone'], es: ['tesamorelina', 'análogo de ghrh'] },
  'wolverine-stack': { en: ['wolverine stack', 'wolverine', 'bpc-157 tb-500', 'bpc157 tb500', 'bpc-157 + tb-500'], es: ['mezcla wolverine', 'bpc-157 tb-500', 'bpc157 tb500'] },
  klow: { en: ['klow', 'ghk-cu bpc-157 tb-500 kpv', 'four compound blend'], es: ['klow', 'mezcla de cuatro compuestos'] },
  'igf1-lr3': { en: ['igf-1 lr3', 'igf1-lr3', 'igf-1lr3', 'igf1 lr3', 'igf1lr3', 'igf-1 analog'], es: ['igf-1 lr3', 'igf1-lr3', 'análogo de igf-1'] },
  'cjc1295-ipamorelin': { en: ['cjc-1295', 'cjc1295', 'ipamorelin', 'cjc ipamorelin'], es: ['cjc-1295', 'cjc1295', 'ipamorelina'] },
  'mots-c': { en: ['mots-c', 'mots c', 'mitochondrial peptide'], es: ['mots-c', 'péptido mitocondrial'] },
  'aod-9604': { en: ['aod-9604', 'aod9604', 'growth hormone fragment'], es: ['aod-9604', 'fragmento de hormona de crecimiento'] },
  'nad-plus': { en: ['nad', 'nad+', 'nad plus', 'nad/nadh', 'nicotinamide adenine dinucleotide', 'cellular energy'], es: ['nad', 'nad+', 'nad plus', 'dinucleótido de nicotinamida y adenina', 'energía celular'] },
  glutathione: { en: ['glutathione', 'gsh', 'gssg', 'redox buffer'], es: ['glutatión', 'gsh', 'gssg', 'equilibrio redox'] },
  'ghk-cu': { en: ['ghk-cu', 'ghk cu', 'ghk copper peptide', 'copper peptide'], es: ['ghk-cu', 'ghk cu', 'péptido de cobre'] },
  'ahk-cu': { en: ['ahk-cu', 'ahk cu', 'copper peptide'], es: ['ahk-cu', 'ahk cu', 'péptido de cobre'] },
  epithalon: { en: ['epithalon', 'epitalon', 'telomere research'], es: ['epitalón', 'epithalon', 'telómeros'] },
  cerebrolysin: { en: ['cerebrolysin', 'neurotrophic peptide'], es: ['cerebrolisina', 'cerebrolysin', 'péptido neurotrófico'] },
  ss31: { en: ['ss-31', 'ss31', 'elamipretide', 'mitochondria targeted'], es: ['ss-31', 'ss31', 'elamipretida'] },
  dsip: { en: ['dsip', 'delta sleep inducing peptide', 'sleep peptide'], es: ['dsip', 'péptido relacionado con el sueño'] },
  kisspeptin: { en: ['kisspeptin', 'kiss-1', 'gnrh signaling'], es: ['kisspeptina', 'kisspeptin', 'señalización gnrh'] },
  hcg: { en: ['hcg', 'human chorionic gonadotropin', 'gonadotropin'], es: ['hcg', 'gonadotropina coriónica humana', 'gonadotropina'] },
  'hgh-191aa': { en: ['hgh 191aa', 'human growth hormone', '191 amino acid'], es: ['hgh 191aa', 'hormona de crecimiento humana', '191 aminoácidos'] },
  'thymosin-alpha-1': { en: ['thymosin alpha-1', 'thymosin alpha 1', 'ta1'], es: ['timosina alfa-1', 'timosina alfa 1'] },
  'pt-141': { en: ['pt-141', 'pt141', 'bremelanotide', 'melanocortin'], es: ['pt-141', 'pt141', 'bremelanotida', 'melanocortina'] },
  semax: { en: ['semax', 'acth fragment', 'bdnf'], es: ['semax', 'fragmento de acth'] },
  selank: { en: ['selank', 'tuftsin analog', 'neuroimmune'], es: ['selank', 'análogo de tuftsin', 'neuroinmune'] },
  'bac-water': { en: ['bac water', 'bacteriostatic water', 'bacteriostaticwater', 'diluent', '10 ml water'], es: ['agua bacteriostática', 'agua bacteriostatica', 'bacteriostatic water', 'diluyente', '10 ml'] },
}

const categoryAliases: Record<CatalogFilter, string[]> = {
  All: [],
  'Metabolic Research': ['metabolic research', 'metabolic signaling', 'investigación metabólica', 'señalización metabólica', 'composición corporal'],
  'Recovery & Regeneration': ['recovery and regeneration', 'recovery regeneration', 'tissue response', 'regenerative research', 'recuperación y regeneración', 'investigación regenerativa'],
  'Hormone & Wellness': ['hormone and wellness', 'hormonal signaling', 'hormonas y bienestar', 'señalización hormonal'],
  'Cellular Energy & Longevity': ['cellular energy', 'longevity research', 'cellular energy and longevity', 'energía celular y longevidad', 'investigación de longevidad'],
  'Cognitive Research': ['cognitive research', 'neurobiology', 'investigación cognitiva', 'señalización neurobiológica'],
  Essentials: ['essentials', 'laboratory accessories', 'esenciales', 'accesorios de laboratorio'],
}

export function normalizeSearchText(value: string) {
  return value
    .toLocaleLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, '')
}

export type ProductSearchResult = {
  product: Product
  matchedTerms: string[]
  score: number
}

function getSearchTerms(product: Product, locale: Locale) {
  const localized = getLocalizedProduct(product, locale)
  const category = getCatalogFilter(product)
  const aliases = productSearchAliases[product.slug]
  return [
    product.name,
    product.slug,
    product.category,
    category,
    ...categoryAliases[category],
    product.casNumber,
    localized.description,
    localized.shortDescription,
    localized.catalogTagline,
    ...localized.catalogHighlights,
    ...(aliases?.en ?? []),
    ...(aliases?.es ?? []),
  ].filter(Boolean)
}

export function searchProducts(query: string, locale: Locale = 'en', filter: CatalogFilter = 'All'): ProductSearchResult[] {
  const normalizedQuery = normalizeSearchText(query.trim())
  const candidates = products.filter((product) => filter === 'All' || getCatalogFilter(product) === filter)

  return candidates
    .map((product) => {
      const terms = getSearchTerms(product, locale)
      if (!normalizedQuery) return { product, matchedTerms: [], score: 0 }

      const matchingTerms = terms.filter((term) => normalizeSearchText(term).includes(normalizedQuery))
      if (!matchingTerms.length) return null

      const normalizedName = normalizeSearchText(product.name)
      const normalizedAliases = (productSearchAliases[product.slug]?.[locale] ?? []).map(normalizeSearchText)
      const score = matchingTerms.reduce((total, term) => {
        const normalizedTerm = normalizeSearchText(term)
        if (normalizedTerm === normalizedQuery) return total + 100
        if (normalizedName === normalizedTerm) return total + 70
        if (normalizedName.startsWith(normalizedQuery)) return total + 50
        if (normalizedAliases.includes(normalizedTerm)) return total + 35
        return total + 10
      }, 0)

      return { product, matchedTerms: matchingTerms.slice(0, 3), score }
    })
    .filter((result): result is ProductSearchResult => Boolean(result))
    .sort((a, b) => b.score - a.score || a.product.name.localeCompare(b.product.name))
}
