import type { Locale } from '../i18n/config'
import type { CategoryContent, ResearchArea } from './products'

const names: Record<string, string> = {
  'metabolic-weight-management': 'Metabolismo y composición corporal',
  'recovery-regeneration': 'Recuperación y regeneración',
  'longevity-cellular-health': 'Energía celular y longevidad',
  'cognitive-performance': 'Investigación cognitiva',
  'hormone-wellness': 'Señalización hormonal',
}

export function localizeResearchArea(area: ResearchArea, locale: Locale): ResearchArea {
  if (locale === 'en') return area
  return { ...area, name: names[area.slug] ?? area.name, description: 'Área de investigación con compuestos estudiados en vías biológicas relacionadas.' }
}

export function localizeCategoryContent(area: ResearchArea, content: CategoryContent, locale: Locale): CategoryContent {
  if (locale === 'en') return content
  const name = names[area.slug] ?? area.name
  return {
    ...content,
    eyebrow: `${name} · investigación`,
    headline: `Investigación de ${name.toLowerCase()}.`,
    subheadline: `Revisa el contexto científico, los mecanismos estudiados y la documentación disponible para ${name.toLowerCase()}.`,
    overview: `${name} reúne compuestos estudiados en señalización biológica, energía celular, composición corporal y otros modelos relacionados. Esta página ofrece contexto de investigación, no recomendaciones de tratamiento.`,
    whyStudied: 'Los equipos científicos estudian estas vías para separar señales moleculares, parámetros medidos y límites del modelo antes de extraer conclusiones.',
    themes: content.themes.map((theme) => ({ title: `Investigación: ${theme.title}`, description: 'Tema descrito en la literatura disponible; el modelo y sus límites deben revisarse en cada estudio.' })),
    comparisonNotes: Object.fromEntries(Object.keys(content.comparisonNotes).map((slug) => [slug, 'Entrada catalogada para un enfoque de investigación específico.'])),
    faqs: content.faqs.map(() => ({ question: `¿Qué se estudia en ${name.toLowerCase()}?`, answer: 'La investigación se interpreta según el compuesto, el modelo y los parámetros publicados. El catálogo no ofrece recomendaciones médicas ni resultados individuales.' })),
    disclaimer: 'Todos los productos de esta categoría se venden exclusivamente para investigación de laboratorio. No están destinados al consumo humano o animal y esta página no ofrece tratamiento, dosificación ni predicciones de resultados individuales.',
  }
}
