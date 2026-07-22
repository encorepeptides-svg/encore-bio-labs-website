import { describe, expect, it } from 'vitest'
import { faqLibrary } from '../data/faq'
import { getLocalizedFaqGroup } from '../data/faqTranslations'
import { products } from '../data/products'
import { getLocalizedProduct, localizedCategoryLabel } from '../data/productTranslations'
import { getLocalizedGlossaryTerms } from '../data/researchTranslations'
import { translate } from './translate'

describe('Spanish storefront experience', () => {
  it('uses the approved category names and direct homepage actions', () => {
    expect(translate('es', 'categories', 'sectionTitle')).toBe('Elige tu enfoque de investigación')
    expect(translate('es', 'homepage', 'viewResearchDetails')).toBe('Ver productos')
    expect(localizedCategoryLabel('Recovery & Regeneration', 'es')).toBe('Recuperación y regeneración')
    expect(localizedCategoryLabel('Longevity & Cellular Health', 'es')).toBe('Longevidad y salud celular')
    expect(localizedCategoryLabel('Metabolic & Weight Management', 'es')).toBe('Metabolismo y control de peso')
    expect(localizedCategoryLabel('Hormone & Wellness', 'es')).toBe('Hormonas y bienestar')
    expect(localizedCategoryLabel('Cognitive & Performance', 'es')).toBe('Investigación cognitiva')
  })

  it('renders the required FAQ questions in Spanish', () => {
    const group = getLocalizedFaqGroup(faqLibrary.find((entry) => entry.slug === 'research-use-only')!, 'es')
    expect(group.items.slice(0, 5).map((item) => item.question)).toEqual([
      '¿Qué significa “solo para uso en investigación” en Encore Bio Labs?',
      '¿Los productos de Encore Bio Labs están aprobados para uso humano o animal?',
      '¿Puedo utilizar estos productos con fines de salud personal?',
      '¿Encore Bio Labs ofrece asesoría médica?',
      '¿Por qué se utiliza lenguaje de investigación en lugar de información de dosificación?',
    ])
    expect(group.items.slice(0, 5).every((item) => item.answer.length > 40)).toBe(true)
    expect(translate('es', 'homepage', 'viewAllFaqs')).toBe('Ver todas las preguntas frecuentes')
  })

  it('provides Spanish questions and answers for every FAQ entry', () => {
    for (const sourceGroup of faqLibrary) {
      const localized = getLocalizedFaqGroup(sourceGroup, 'es')
      expect(localized.title, `${sourceGroup.slug} title`).not.toBe(sourceGroup.title)
      expect(localized.intro, `${sourceGroup.slug} intro`).not.toBe(sourceGroup.intro)
      expect(localized.items).toHaveLength(sourceGroup.items.length)
      localized.items.forEach((item, index) => {
        expect(item.question, `${sourceGroup.slug} question ${index + 1}`).not.toBe(sourceGroup.items[index].question)
        expect(item.answer, `${sourceGroup.slug} answer ${index + 1}`).not.toBe(sourceGroup.items[index].answer)
      })
    }
  })

  it('localizes product-facing category, badge, specs, formats, and KLOW artwork', () => {
    for (const product of products) {
      const localized = getLocalizedProduct(product, 'es')
      expect(localized.badge).not.toMatch(/\bResearch\b/i)
      expect(localized.specs.map((spec) => spec.label).join(' ')).not.toMatch(/Research area|Available format|Use classification/i)
    }
    const klow = getLocalizedProduct(products.find((product) => product.slug === 'klow')!, 'es')
    expect(klow.image).toBe('klow-es.png')
  })

  it('uses the approved conversion copy for Retatrutide and KLOW', () => {
    expect(translate('es', 'catalog', 'retaEyebrow')).toBe('TRES VÍAS. UNA SOLA MOLÉCULA.')
    expect(translate('es', 'catalog', 'retaPullQuote')).toBe('Lleva tu investigación metabólica más lejos.')
    expect(translate('es', 'catalog', 'retaPrimaryCta')).toBe('Elegir concentración')
    expect(translate('es', 'catalog', 'retaSecondaryCta')).toBe('Revisar la investigación')
    expect(translate('es', 'catalog', 'klowEyebrow')).toBe('MEZCLA REGENERATIVA DE CUATRO COMPUESTOS')
    expect(translate('es', 'catalog', 'klowTitle')).toBe('KLOW: cuatro compuestos en una fórmula de investigación más completa.')
    expect(translate('es', 'catalog', 'klowCta')).toBe('Comprar KLOW')
    expect(translate('es', 'catalog', 'klowVisualAlt')).toMatch(/KLOW.*GHK-Cu.*BPC-157.*TB-500.*KPV/)
  })

  it('keeps the Spanish research glossary free of English definitions', () => {
    const glossary = getLocalizedGlossaryTerms('es')
    expect(glossary).toHaveLength(10)
    expect(glossary.map((entry) => `${entry.term} ${entry.definition}`).join(' ')).not.toMatch(/Research Use Only|freeze-drying|half-life/i)
  })
})
