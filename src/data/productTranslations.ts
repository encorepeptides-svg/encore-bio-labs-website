import type { Locale } from '../i18n/config'
import type { Product, ProductCardContent, ProductFAQ, ProductResearchHighlight } from './products'

/**
 * Spanish text overrides layered onto the (always-English-source) product
 * data at render time. Only prose/text fields are overridable — prices,
 * SKUs, variant structure, CAS numbers, and category (used for filtering)
 * always come from the single English source of truth in products.ts, so
 * they can never diverge between languages. A slug with no entry, or a
 * field left out of an entry, falls back to the English text.
 *
 * Coverage: every product has a translated catalog tagline and short
 * description (what's shown while browsing). Retatrutide, the flagship
 * bestseller, has full deep-page content translated as well. Other
 * products' long-form research essays (benefits, research highlights,
 * biology points) currently fall back to English — see the localization
 * report for the prioritized follow-up list.
 */
export type ProductTextOverride = Partial<{
  description: string
  catalogTagline: string
  catalogHighlights: string[]
  shortDescription: string
  headline: string
  keyHighlights: string[]
  benefits: ProductCardContent[]
  mechanismSteps: string[]
  researchHighlights: ProductResearchHighlight[]
  biologyPoints: ProductCardContent[]
  benefitAudiences: ProductCardContent[]
  galleryCaptions: string[]
  disclaimer: string
  faqs: ProductFAQ[]
}>

export const productTranslationsEs: Record<string, ProductTextOverride> = {
  retatrutide: {
    catalogTagline: 'Un agonista triple en investigación de GIP, GLP-1 y glucagón. Se estudia en señalización de nutrientes, balance energético y composición corporal.',
    description: 'Una entrada del catálogo de investigación organizada para comparar variantes, solicitar el COA y facilitar una revisión centrada en la documentación.',
    headline: 'Mapea la señalización de triple receptor. Estudia la respuesta metabólica. Revisa con precisión.',
    shortDescription: 'Retatrutide es un péptido sintético estudiado como agonista triple de los receptores GLP-1, GIP y glucagón, revisado en contextos de investigación para la señalización de regulación energética, modelos de composición corporal y respuesta de marcadores metabólicos.',
    keyHighlights: [
      'Agonista sintético de triple receptor (GLP-1 / GIP / glucagón)',
      'Señalización de los receptores GLP-1, GIP y glucagón',
      'Tendencia de peso corporal, glucosa en ayunas, HbA1c y marcadores del perfil de lípidos en diseños de investigación calificados',
      'Posicionamiento de uso exclusivo para investigación, sin protocolos de dosificación',
    ],
    mechanismSteps: [
      'Revisión del agonista de triple receptor',
      'Modelo de señalización GLP-1/GIP/glucagón',
      'Observación de la vía de gasto energético',
      'Registro de marcadores de composición corporal',
    ],
    benefits: [
      { title: 'Investigación de triple receptor', description: 'Útil para estudiar el compromiso combinado de los receptores GLP-1, GIP y glucagón en una sola entrada de investigación.' },
      { title: 'Modelos de gasto energético', description: 'El componente del receptor de glucagón suele revisarse junto con preguntas de investigación sobre gasto energético, distintas de las entradas exclusivas de GLP-1.' },
      { title: 'Contexto de composición corporal', description: 'Aparece en la literatura relacionada con la investigación de peso y composición corporal, presentada sin resultados garantizados.' },
      { title: 'Revisión de marcadores glucémicos', description: 'Apoya conversaciones de investigación sobre glucosa en ayunas y HbA1c junto con paneles metabólicos.' },
      { title: 'Investigación incretina comparativa', description: 'Útil para comparar modelos de investigación incretina de receptor único y múltiple dentro de la misma categoría.' },
      { title: 'Revisión centrada en documentación', description: 'Combina la revisión del producto con supervisión calificada, contexto de laboratorio y un registro cuidadoso.' },
    ],
    researchHighlights: [
      { title: 'Agonismo de triple receptor', journal: 'Literatura de la vía incretina', takeaway: 'Retatrutide se estudia como una sola molécula que compromete los receptores GLP-1, GIP y glucagón, lo que la distingue de las entradas de receptor único o doble en esta categoría.', metric: 'GLP·GIP·GCG' },
      { title: 'Señalización energética vía receptor de glucagón', journal: 'Resúmenes de investigación metabólica', takeaway: 'El componente del receptor de glucagón se analiza con frecuencia como un mecanismo de investigación del gasto energético, distinto de la sola señalización del apetito.', metric: 'EE' },
      { title: 'Investigación de composición corporal', journal: 'Contexto de literatura clínica', takeaway: 'Estudios publicados han evaluado retatrutide en modelos de peso y composición corporal; su aplicabilidad depende del diseño del estudio y la supervisión calificada.', metric: 'BC' },
    ],
    biologyPoints: [
      { title: 'Señalización del receptor GLP-1', description: 'Comparte la señalización de la vía incretina revisada en esta categoría de investigación, vinculada a modelos de apetito y respuesta glucémica.' },
      { title: 'Compromiso del receptor GIP', description: 'Suma una segunda vía incretina junto al GLP-1, una distinción de investigación frente a las entradas de receptor único.' },
      { title: 'Actividad del receptor de glucagón', description: 'El tercer receptor objetivo, más asociado en la literatura con preguntas de investigación sobre gasto energético.' },
    ],
  },
  tesamorelin: {
    catalogTagline: 'Un análogo sintético de GHRH estudiado a través del eje GH–IGF-1. La investigación examina señalización endocrina y composición corporal.',
    description: 'Una entrada de investigación metabólica presentada de forma clara, con documentación de respaldo y contexto de formato.',
  },
  'wolverine-stack': {
    catalogTagline: 'Un formato combinado de BPC-157 y TB-500. La literatura de sus componentes examina señalización tisular, biología de actina y migración celular en modelos preclínicos.',
    description: 'Una entrada de investigación de recuperación y reparación, preparada con un kit completo y lista para la revisión de registros.',
  },
  klow: {
    catalogTagline: 'GHK-Cu, BPC-157, TB-500 y KPV en una mezcla integrada. Posicionada para investigación en piel, señalización tisular y ciencia regenerativa.',
    description: 'Una entrada de insumos de investigación pensada para planear tu catálogo, dar contexto del kit y facilitar el seguimiento con documentación.',
  },
  'igf1-lr3': {
    catalogTagline: 'Un análogo de IGF-1 de acción prolongada investigado en modelos de señalización receptora. El estudio se centra en duración, respuesta celular y medición controlada.',
    description: 'Una entrada de investigación de rendimiento, estructurada para una revisión clara, formato bien definido y solicitud de registros.',
  },
  'cjc1295-ipamorelin': {
    catalogTagline: 'CJC-1295 e Ipamorelin combinan dos mecanismos de investigación del eje GH. La formulación permite comparar señalización de GHRH y del receptor de grelina.',
    description: 'Una entrada de investigación combinada, con las variantes agrupadas para comparar más fácilmente en el catálogo.',
  },
  'mots-c': {
    catalogTagline: 'Un péptido derivado de la mitocondria estudiado en señalización de energía celular. La investigación preclínica examina adaptación metabólica, vías asociadas con AMPK y comunicación mitocondrial.',
    description: 'Una entrada de investigación de péptidos mitocondriales, estructurada para revisar la señalización metabólica, el contexto energético celular y solicitar documentación.',
  },
  'aod-9604': {
    catalogTagline: 'Un fragmento modificado de hormona de crecimiento estudiado por separado de la hGH intacta. La investigación aborda señalización metabólica y balance energético, con evidencia humana limitada.',
    description: 'Una entrada de investigación de fragmentos de GH, estructurada para revisar la señalización metabólica, el contexto de composición corporal y solicitar documentación.',
  },
  'nad-plus': {
    catalogTagline: 'Un cofactor redox endógeno central para el metabolismo energético celular. La investigación abarca el ciclo NAD+/NADH, la función mitocondrial y la biología enzimática.',
    description: 'Una entrada de investigación de longevidad, con presentación premium, contexto de kit completo y documentación disponible para revisión.',
  },
  glutathione: {
    catalogTagline: 'Un tripéptido endógeno central para el equilibrio redox intracelular. La investigación mide el ciclo GSH/GSSG, marcadores de estrés oxidativo y sistemas antioxidantes enzimáticos.',
    description: 'Una entrada del catálogo de investigación con variantes visibles y espacio para solicitar documentación de respaldo.',
  },
  'ghk-cu': {
    catalogTagline: 'Un tripéptido unido al cobre estudiado en modelos de matriz extracelular y respuesta tisular. La investigación examina señalización del colágeno, migración celular y biología de la piel.',
    description: 'Una entrada de investigación estética, con todas sus opciones disponibles agrupadas para facilitar la revisión del catálogo.',
  },
  'ahk-cu': {
    catalogTagline: 'Un péptido de cobre investigado en modelos foliculares y de piel. Su perfil de investigación se mantiene distinto de la literatura más amplia sobre GHK-Cu.',
    description: 'Una entrada de investigación estética, estructurada para una presentación clara, revisión de kit y un posicionamiento premium.',
  },
  epithalon: {
    catalogTagline: 'Un tetrapéptido sintético estudiado en modelos de envejecimiento y ritmo circadiano. La evidencia abarca mecanismos asociados con telómeros, sistemas celulares y observaciones humanas limitadas.',
    description: 'Una entrada de investigación de longevidad, preparada con contenido educativo premium, filtros y solicitud de registros.',
  },
  cerebrolysin: {
    catalogTagline: 'Una mezcla de péptidos estudiada en modelos neurobiológicos y de respuesta neuronal. La investigación publicada examina señalización neurotrófica, cognición y contexto neurológico.',
    description: 'Una entrada de investigación cognitiva, preparada con una presentación premium y seguimiento basado en documentación.',
  },
  ss31: {
    catalogTagline: 'Un tetrapéptido dirigido a la mitocondria, estudiado mediante cardiolipina y función de membrana. La investigación examina bioenergética, estrés oxidativo y respuesta mitocondrial.',
    description: 'Una entrada de investigación de longevidad, organizada para conversaciones sobre programas de investigación y futuros detalles de registro.',
  },
  dsip: {
    catalogTagline: 'Un péptido relacionado con el sueño examinado en investigación neuroendocrina. Los estudios analizan arquitectura del sueño y señalización fisiológica, con evidencia humana limitada y mixta.',
    description: 'Una entrada de investigación diseñada para una revisión concisa y seguimiento listo con documentación.',
  },
  kisspeptin: {
    catalogTagline: 'Un péptido del eje reproductivo estudiado antes de la liberación de GnRH. La investigación examina señalización hipotalámico-hipofisaria y respuestas endocrinas controladas.',
    description: 'Una entrada de investigación de bienestar sexual, diseñada para mantener la revisión del producto concisa, organizada y lista para tu solicitud.',
  },
  hcg: {
    catalogTagline: 'Una hormona glucoproteica estudiada mediante señalización del receptor de hormona luteinizante. La investigación incluye biología del eje reproductivo y medición de respuestas endocrinas.',
    description: 'Una entrada de investigación de bienestar sexual, estructurada para una revisión clara, variantes visibles y conversación sobre documentación.',
  },
  'hgh-191aa': {
    catalogTagline: 'Hormona de crecimiento completa de 191 aminoácidos para investigación del receptor GH. Los modelos examinan señalización del eje, respuesta de IGF-1 y marcadores metabólicos.',
    description: 'Una entrada de investigación de rendimiento, organizada para revisar el formato, conversar sobre disponibilidad y canalizar la documentación.',
  },
  'thymosin-alpha-1': {
    catalogTagline: 'Un péptido tímico estudiado en modelos de señalización inmunitaria innata y adaptativa. La investigación examina defensa celular y coordinación de la respuesta inmunitaria.',
    description: 'Una entrada de investigación de salud celular, organizada para una revisión educativa y solicitudes responsables de documentación.',
  },
  'pt-141': {
    catalogTagline: 'Un agonista del receptor de melanocortina estudiado en modelos de señalización central. La investigación se centra en farmacología receptora y respuesta neurobiológica, sin implicar uso aprobado.',
    description: 'Una entrada de investigación de bienestar sexual, con los formatos disponibles agrupados para explorar rápido y acceder al catálogo de forma responsable.',
  },
  semax: {
    catalogTagline: 'Un análogo sintético de fragmento de ACTH investigado en modelos cognitivos y neurobiológicos. La investigación examina señalización asociada con BDNF, respuesta neuronal y conducta.',
    description: 'Una entrada de investigación cognitiva, preparada con una presentación premium y revisión responsable de documentación.',
  },
  selank: {
    catalogTagline: 'Un análogo sintético de tuftsina estudiado en modelos de estrés y neuroinmunidad. La investigación examina vías de señalización asociadas con cognición y adaptación conductual.',
    description: 'Una entrada de investigación cognitiva, con sus opciones agrupadas en una sola tarjeta clara y fácil de consultar.',
  },
  'bac-water': {
    catalogTagline: 'Un accesorio independiente de 10 mL de agua bacteriostática para manejo de laboratorio calificado. Se presenta por separado y no se trata como péptido.',
    description: 'Un accesorio independiente de 10 mL de agua bacteriostática, para flujos de manejo de investigación calificados.',
  },
}

/**
 * Spanish overrides for the three catalog-card research highlights. Kept in a
 * dedicated map (rather than inside each product's prose override) so the
 * highlight sets stay easy to audit side-by-side with the English source in
 * products.ts. `getLocalizedProduct` layers these on for the `es` locale.
 */
export const catalogHighlightsEs: Record<string, [string, string, string]> = {
  retatrutide: ['Investigación de pérdida de grasa', 'Estudios de control del apetito', 'Acción metabólica de triple receptor'],
  tesamorelin: ['Investigación de grasa abdominal', 'Estudios de hormona de crecimiento', 'Enfoque en composición corporal'],
  'wolverine-stack': ['Investigación de reparación de lesiones', 'Estudios de recuperación acelerada', 'Apoyo a articulaciones y tendones'],
  klow: ['Mezcla piel, cabello y recuperación', 'Investigación de sanación y rejuvenecimiento', 'Enfoque integral de regeneración'],
  'igf1-lr3': ['Investigación de crecimiento muscular', 'Estudios de masa magra e hipertrofia', 'Enfoque en partición de nutrientes'],
  'cjc1295-ipamorelin': ['Investigación de hormona de crecimiento', 'Estudios de recuperación y músculo', 'Enfoque en sueño y antiedad'],
  'mots-c': ['Investigación de metabolismo y grasa', 'Estudios de resistencia y rendimiento', 'Enfoque en energía celular'],
  'aod-9604': ['Investigación de quema de grasa', 'Estudios de control de peso', 'Enfoque metabólico sin GH'],
  'nad-plus': ['Investigación antiedad y longevidad', 'Estudios de energía celular', 'Enfoque en claridad mental'],
  glutathione: ['Investigación de detox y antioxidantes', 'Estudios de luminosidad de la piel', 'Enfoque en soporte inmune'],
  'ghk-cu': ['Investigación de piel y colágeno', 'Estudios antiedad y de firmeza', 'Enfoque en cabello y cicatrización'],
  'ahk-cu': ['Investigación de crecimiento capilar', 'Estudios de estimulación folicular', 'Enfoque en cuero cabelludo'],
  epithalon: ['Investigación de longevidad y telómeros', 'Estudios antienvejecimiento', 'Enfoque en sueño y ritmo circadiano'],
  cerebrolysin: ['Investigación de memoria y cognición', 'Estudios de recuperación neuronal', 'Enfoque en salud cerebral'],
  ss31: ['Investigación de energía mitocondrial', 'Estudios antiedad y de resistencia', 'Enfoque en reparación celular'],
  dsip: ['Investigación de sueño profundo', 'Estudios de estrés y recuperación', 'Enfoque en ritmo circadiano'],
  kisspeptin: ['Investigación de fertilidad y hormonas', 'Estudios de soporte de testosterona', 'Enfoque en libido y reproducción'],
  hcg: ['Investigación de soporte de testosterona', 'Estudios de fertilidad y TRT', 'Enfoque en restauración hormonal'],
  'hgh-191aa': ['Investigación de músculo y pérdida de grasa', 'Estudios de recuperación y antiedad', 'Enfoque en hormona de crecimiento'],
  'thymosin-alpha-1': ['Investigación de soporte inmune', 'Estudios de recuperación y resiliencia', 'Enfoque en inflamación crónica'],
  'pt-141': ['Investigación de libido y excitación', 'Estudios de función sexual', 'Enfoque en deseo sexual'],
  semax: ['Investigación de enfoque y memoria', 'Estudios nootrópicos', 'Enfoque en neuroprotección'],
  selank: ['Investigación de ansiedad y estrés', 'Estudios de calma y concentración', 'Enfoque en estado de ánimo'],
  'bac-water': ['Reconstitución de péptidos', 'Formato estéril de 10 mL', 'Esencial para manejo de laboratorio'],
}

export function getLocalizedProduct(product: Product, locale: Locale): Product {
  if (locale === 'en') return product
  const overrides = productTranslationsEs[product.slug]
  const highlightsEs = catalogHighlightsEs[product.slug]
  if (!overrides && !highlightsEs) return product
  return {
    ...product,
    ...overrides,
    ...(highlightsEs ? { catalogHighlights: highlightsEs } : {}),
  }
}
