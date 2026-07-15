import type { Locale } from '../i18n/config'
import type { CategoryContent, ResearchArea } from './products'

const names: Record<string, string> = {
  'metabolic-weight-management': 'Metabolismo y control de peso',
  'recovery-regeneration': 'Recuperación y regeneración',
  'longevity-cellular-health': 'Longevidad y salud celular',
  'cognitive-performance': 'Investigación cognitiva',
  'hormone-wellness': 'Hormonas y bienestar',
}

const categoryThemeTitleEs: Record<string, string> = {
  'Incretin-receptor signaling': 'Señalización de receptores de incretinas',
  'GH-axis and IGF-1 signaling': 'Señalización del eje GH e IGF-1',
  'Ghrelin-receptor secretagogue research': 'Investigación de secretagogos del receptor de grelina',
  'Mitochondrial and AMPK-linked energy sensing': 'Detección energética mitocondrial asociada con AMPK',
  'Body-composition research models': 'Modelos de investigación de composición corporal',
  'Repair-associated signaling': 'Señalización asociada con la reparación',
  'Cytoskeletal remodeling and cell migration': 'Remodelación del citoesqueleto y migración celular',
  'Copper-peptide matrix biology': 'Biología de matriz de los péptidos de cobre',
  'Combination and kit-based research planning': 'Planificación de investigación con combinaciones y kits',
  'Redox metabolism and mitochondrial energy': 'Metabolismo redox y energía mitocondrial',
  'Antioxidant and detoxification biology': 'Biología antioxidante y de detoxificación',
  'Mitochondria-targeted membrane biology': 'Biología de membrana dirigida a la mitocondria',
  'Telomere-associated and circadian research': 'Investigación circadiana y asociada con telómeros',
  'Immune-signaling and cellular defense': 'Señalización inmunitaria y defensa celular',
  'Neurotrophic and neuronal-survival research': 'Investigación neurotrófica y de supervivencia neuronal',
  'ACTH-fragment and BDNF-linked signaling': 'Señalización del fragmento de ACTH asociada con BDNF',
  'Neuroimmune and stress-response signaling': 'Señalización neuroinmune y de respuesta al estrés',
  'Reproductive-axis signaling': 'Señalización del eje reproductivo',
  'Gonadotropin and steroidogenesis research': 'Investigación de gonadotropinas y esteroidogénesis',
  'Sleep and neuroendocrine signaling': 'Señalización del sueño y neuroendocrina',
  'Central melanocortin-receptor research': 'Investigación del receptor central de melanocortina',
}

export function localizeResearchArea(area: ResearchArea, locale: Locale): ResearchArea {
  if (locale === 'en') return area
  return { ...area, name: names[area.slug] ?? area.name, description: 'Área de investigación con compuestos estudiados en vías biológicas relacionadas.' }
}

/**
 * Real Spanish copy for the conversion-facing category hero fields (headline,
 * subheadline, overview). Deeper fields (themes, faqs, etc.) still fall back to
 * the generic Spanish presentation below. Adapted for persuasion, not literal.
 */
const categoryHeroEs: Record<string, { headline: string; subheadline: string; overview: string }> = {
  'metabolic-weight-management': {
    headline: 'Aquí empieza la investigación metabólica seria.',
    subheadline:
      'Desde agonistas de triple receptor como Retatrutide hasta compuestos del eje de la hormona de crecimiento: el catálogo de investigación metabólica y de composición corporal, con cada producto enviado como kit completo.',
    overview:
      'El catálogo de investigación metabólica y de composición corporal de Encore Bio Labs abarca dos de las líneas de investigación más activas del área: compuestos de receptores de incretinas (señalización GLP-1/GIP/glucagón) y compuestos del eje de la hormona de crecimiento (análogos de GHRH y secretagogos del receptor de grelina). Compara vías, formatos y documentación en paralelo, y recibe cada compuesto como un kit completo y listo para investigar, con los suministros correspondientes incluidos.',
  },
  'recovery-regeneration': {
    headline: 'Reparación, regeneración y recuperación en un solo catálogo.',
    subheadline:
      'Desde el Wolverine Stack de BPC-157 + TB-500 hasta compuestos de péptidos de cobre y la mezcla de cuatro compuestos KLOW: cada compuesto de recuperación enviado completo.',
    overview:
      'El catálogo de recuperación y regeneración de Encore Bio Labs reúne en un solo lugar los compuestos más estudiados en reparación tisular y remodelación de la matriz: el Wolverine Stack de BPC-157 + TB-500, la mezcla regenerativa de cuatro compuestos KLOW (GHK-Cu, BPC-157, TB-500, KPV) y los compuestos de péptidos de cobre GHK-Cu y AHK-Cu. Compara vías y formatos en paralelo, y recibe cada entrada como un kit completo y listo para investigar.',
  },
  'longevity-cellular-health': {
    headline: 'Investigación de salud celular y longevidad, todo en un solo lugar.',
    subheadline:
      'Desde NAD+ y glutatión hasta SS-31 dirigido a la mitocondria y Epithalon: el catálogo de investigación de resiliencia celular y envejecimiento saludable, enviado como kits completos.',
    overview:
      'El catálogo de longevidad y salud celular de Encore Bio Labs cubre los compuestos en el centro de la investigación del envejecimiento: el cofactor metabólico NAD+, el antioxidante esencial glutatión, el péptido dirigido a la mitocondria SS-31, el péptido asociado a los telómeros Epithalon y el péptido de señalización inmune Thymosin Alpha-1. Compara mecanismos, formatos y documentación, y recibe cada compuesto como un kit completo de investigación.',
  },
  'cognitive-performance': {
    headline: 'El catálogo de investigación cognitiva y de rendimiento.',
    subheadline:
      'Desde el péptido neurotrófico Cerebrolysin hasta la combinación de neuropéptidos Semax + Selank: el catálogo de investigación cognitiva y de neuroseñalización, enviado completo.',
    overview:
      'El catálogo cognitivo y de rendimiento de Encore Bio Labs reúne los compuestos de neuroseñalización más estudiados: Cerebrolysin, una mezcla de péptidos neurotróficos estudiada en la supervivencia neuronal y la plasticidad sináptica, y Semax y Selank, dos neuropéptidos estructuralmente distintos estudiados en la señalización asociada a BDNF y de respuesta al estrés. Compara vías y formatos en paralelo, y recibe cada compuesto como un kit completo de investigación.',
  },
  'hormone-wellness': {
    headline: 'El catálogo de investigación hormonal y de bienestar.',
    subheadline:
      'Desde compuestos del eje reproductivo como Kisspeptin y HCG hasta investigación del eje GH, del sueño y de melanocortina: el catálogo de investigación endocrina, enviado como kits completos.',
    overview:
      'El catálogo hormonal y de bienestar de Encore Bio Labs abarca toda la gama de la investigación endocrina: compuestos del eje reproductivo (Kisspeptin, HCG), señalización del eje de la hormona de crecimiento y de factores de crecimiento (HGH 191AA, IGF1-LR3), investigación del sueño y neuroendocrina (DSIP) e investigación del receptor central de melanocortina (PT-141). Compara ejes, formatos y documentación en paralelo, y recibe cada compuesto como un kit completo de investigación.',
  },
}

export function localizeCategoryContent(area: ResearchArea, content: CategoryContent, locale: Locale): CategoryContent {
  if (locale === 'en') return content
  const name = names[area.slug] ?? area.name
  const hero = categoryHeroEs[area.slug]
  return {
    ...content,
    eyebrow: `${name} · investigación`,
    headline: hero?.headline ?? `Investigación de ${name.toLowerCase()}.`,
    subheadline: hero?.subheadline ?? `Revisa el contexto científico, los mecanismos estudiados y la documentación disponible para ${name.toLowerCase()}.`,
    overview: hero?.overview ?? `${name} reúne compuestos estudiados en señalización biológica, energía celular, composición corporal y otros modelos relacionados. Esta página ofrece contexto de investigación, no recomendaciones de tratamiento.`,
    whyStudied: 'Los equipos científicos estudian estas vías para separar señales moleculares, parámetros medidos y límites del modelo antes de extraer conclusiones.',
    themes: content.themes.map((theme) => ({
      title: categoryThemeTitleEs[theme.title] ?? 'Vía biológica relacionada',
      description: 'Tema descrito en la literatura disponible; el modelo y sus límites deben revisarse en cada estudio.',
    })),
    comparisonNotes: Object.fromEntries(Object.keys(content.comparisonNotes).map((slug) => [slug, 'Entrada catalogada para un enfoque de investigación específico.'])),
    faqs: content.faqs.map(() => ({ question: `¿Qué se estudia en ${name.toLowerCase()}?`, answer: 'La investigación se interpreta según el compuesto, el modelo y los parámetros publicados. El catálogo no ofrece recomendaciones médicas ni resultados individuales.' })),
    disclaimer: 'Todos los productos de esta categoría se venden exclusivamente para investigación de laboratorio. No están destinados al consumo humano o animal y esta página no ofrece tratamiento, dosificación ni predicciones de resultados individuales.',
  }
}
