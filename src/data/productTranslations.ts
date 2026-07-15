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
    headline: 'El compuesto del eje GH para investigación metabólica seria.',
    keyHighlights: [
      'Análogo sintético de GHRH',
      'Receptor de GHRH y señalización del eje GH',
      'IGF-1, lípidos en ayunas, marcadores de glucosa y parámetros de cintura o composición en estudios calificados',
      'Posicionamiento de uso exclusivo para investigación, sin protocolos de dosificación',
    ],
  },
  'wolverine-stack': {
    catalogTagline: 'Un formato combinado de BPC-157 y TB-500. La literatura de sus componentes examina señalización tisular, biología de actina y migración celular en modelos preclínicos.',
    description: 'Una entrada de investigación de recuperación y reparación, preparada con un kit completo y lista para la revisión de registros.',
    headline: 'BPC-157 + TB-500. El kit completo de investigación de recuperación.',
    keyHighlights: [
      'Combinación de investigación de recuperación BPC-157 más TB-500',
      'Vías complementarias de señalización de reparación y migración celular',
      'Observaciones de reparación, organización del colágeno, contexto de angiogénesis, marcadores inflamatorios y registros de recuperación',
      'Posicionamiento de uso exclusivo para investigación, sin protocolos de dosificación',
    ],
  },
  klow: {
    catalogTagline: 'GHK-Cu, BPC-157, TB-500 y KPV en una mezcla integrada. Posicionada para investigación en piel, señalización tisular y ciencia regenerativa.',
    description: 'Una entrada de insumos de investigación pensada para planear tu catálogo, dar contexto del kit y facilitar el seguimiento con documentación.',
    headline: 'Cuatro compuestos. Una mezcla regenerativa insignia.',
    keyHighlights: [
      'Mezcla regenerativa de cuatro compuestos (GHK-Cu, BPC-157, TB-500, KPV)',
      'Vías de péptido de cobre, señalización de reparación, migración celular y señalización inflamatoria',
      'Contexto de colágeno y elastina, observaciones de respuesta a heridas, marcadores de migración celular, contexto de angiogénesis y parámetros de señalización inflamatoria',
      'Posicionamiento de uso exclusivo para investigación, sin protocolos de dosificación',
    ],
  },
  'igf1-lr3': {
    catalogTagline: 'Un análogo de IGF-1 de acción prolongada investigado en modelos de señalización receptora. El estudio se centra en duración, respuesta celular y medición controlada.',
    description: 'Una entrada de investigación de rendimiento, estructurada para una revisión clara, formato bien definido y solicitud de registros.',
    headline: 'Investigación de IGF-1 de acción prolongada, simplificada.',
    keyHighlights: [
      'Análogo de IGF-1 Long Arginine 3 (LR3)',
      'Vía del receptor de IGF-1',
      'Contexto del eje IGF, marcadores de glucosa, observaciones de crecimiento celular y marcadores de la vía de síntesis proteica',
      'Posicionamiento de uso exclusivo para investigación, sin protocolos de dosificación',
    ],
  },
  'cjc1295-ipamorelin': {
    catalogTagline: 'CJC-1295 e Ipamorelin combinan dos mecanismos de investigación del eje GH. La formulación permite comparar señalización de GHRH y del receptor de grelina.',
    description: 'Una entrada de investigación combinada, con las variantes agrupadas para comparar más fácilmente en el catálogo.',
    headline: 'Dos mecanismos del eje GH. Un kit listo para investigar.',
    keyHighlights: [
      'Análogo de GHRH más secretagogo del receptor de grelina',
      'Receptor de GHRH y receptor secretagogo de hormona de crecimiento',
      'IGF-1, contexto del pulso de GH, registros de recuperación, marcadores de composición y observaciones de sueño o rendimiento',
      'Posicionamiento de uso exclusivo para investigación, sin protocolos de dosificación',
    ],
  },
  'mots-c': {
    catalogTagline: 'Un péptido derivado de la mitocondria estudiado en señalización de energía celular. La investigación preclínica examina adaptación metabólica, vías asociadas con AMPK y comunicación mitocondrial.',
    description: 'Una entrada de investigación de péptidos mitocondriales, estructurada para revisar la señalización metabólica, el contexto energético celular y solicitar documentación.',
    headline: 'El péptido mitocondrial detrás de la investigación de energía metabólica.',
    keyHighlights: [
      'Péptido derivado de la mitocondria',
      'Señalización de estrés mitocondrial y vías metabólicas asociadas con AMPK',
      'Contexto de AMPK, marcadores de glucosa e insulina, respuesta al estrés mitocondrial y observaciones de capacidad de ejercicio',
      'Posicionamiento de uso exclusivo para investigación, sin protocolos de dosificación',
    ],
  },
  'aod-9604': {
    catalogTagline: 'Un fragmento modificado de hormona de crecimiento estudiado por separado de la hGH intacta. La investigación aborda señalización metabólica y balance energético, con evidencia humana limitada.',
    description: 'Una entrada de investigación de fragmentos de GH, estructurada para revisar la señalización metabólica, el contexto de composición corporal y solicitar documentación.',
    headline: 'El fragmento de GH para investigación metabólica.',
    keyHighlights: [
      'Revisión de catálogo centrada en la documentación',
      'Variantes agrupadas en una sola página de producto',
      'Posicionamiento de uso exclusivo para investigación con lenguaje conforme',
      'Posicionamiento de uso exclusivo para investigación, sin protocolos de dosificación',
    ],
  },
  'nad-plus': {
    catalogTagline: 'Un cofactor redox endógeno central para el metabolismo energético celular. La investigación abarca el ciclo NAD+/NADH, la función mitocondrial y la biología enzimática.',
    description: 'Una entrada de investigación de longevidad, con presentación premium, contexto de kit completo y documentación disponible para revisión.',
    headline: 'El cofactor de energía celular en el corazón de la investigación de longevidad.',
    keyHighlights: [
      'Dinucleótido de nicotinamida y adenina (NAD+)',
      'Metabolismo redox, función mitocondrial y vías asociadas con PARP y sirtuinas',
      'Contexto NAD+/NADH, marcadores mitocondriales, marcadores de estrés oxidativo y paneles de reparación de ADN e inflamación',
      'Posicionamiento de uso exclusivo para investigación, sin protocolos de dosificación',
    ],
  },
  glutathione: {
    catalogTagline: 'Un tripéptido endógeno central para el equilibrio redox intracelular. La investigación mide el ciclo GSH/GSSG, marcadores de estrés oxidativo y sistemas antioxidantes enzimáticos.',
    description: 'Una entrada del catálogo de investigación con variantes visibles y espacio para solicitar documentación de respaldo.',
    headline: 'El antioxidante maestro para investigación redox y de detoxificación.',
    keyHighlights: [
      'Tripéptido antioxidante endógeno',
      'Equilibrio redox, glutatión peroxidasa y vías de detoxificación y estrés oxidativo',
      'Relación GSH/GSSG, marcadores de estrés oxidativo, contexto de enzimas hepáticas y paneles inflamatorios y redox',
      'Posicionamiento de uso exclusivo para investigación, sin protocolos de dosificación',
    ],
  },
  'ghk-cu': {
    catalogTagline: 'Un tripéptido unido al cobre estudiado en modelos de matriz extracelular y respuesta tisular. La investigación examina señalización del colágeno, migración celular y biología de la piel.',
    description: 'Una entrada de investigación estética, con todas sus opciones disponibles agrupadas para facilitar la revisión del catálogo.',
    headline: 'El péptido de cobre detrás de la investigación de piel y matriz.',
    keyHighlights: [
      'Complejo tripéptido de cobre',
      'Señalización de péptido de cobre, matriz extracelular y vías de colágeno y respuesta a heridas',
      'Marcadores de colágeno, contexto de elastina, equilibrio MMP/TIMP, observaciones de respuesta a heridas y parámetros en modelos de piel',
      'Posicionamiento de uso exclusivo para investigación, sin protocolos de dosificación',
    ],
  },
  'ahk-cu': {
    catalogTagline: 'Un péptido de cobre investigado en modelos foliculares y de piel. Su perfil de investigación se mantiene distinto de la literatura más amplia sobre GHK-Cu.',
    description: 'Una entrada de investigación estética, estructurada para una presentación clara, revisión de kit y un posicionamiento premium.',
    headline: 'El péptido de cobre para investigación folicular y dérmica.',
    keyHighlights: [
      'Complejo de péptido de cobre',
      'Modelos de soporte folicular, señalización dérmica y biología del péptido de cobre y la matriz',
      'Observaciones del ciclo folicular, marcadores de papila dérmica, contexto de colágeno y marcadores inflamatorios y de remodelación de la matriz',
      'Posicionamiento de uso exclusivo para investigación, sin protocolos de dosificación',
    ],
  },
  epithalon: {
    catalogTagline: 'Un tetrapéptido sintético estudiado en modelos de envejecimiento y ritmo circadiano. La evidencia abarca mecanismos asociados con telómeros, sistemas celulares y observaciones humanas limitadas.',
    description: 'Una entrada de investigación de longevidad, preparada con contenido educativo premium, filtros y solicitud de registros.',
    headline: 'El tetrapéptido en la frontera de la investigación de longevidad.',
    keyHighlights: [
      'Tetrapéptido sintético',
      'Biología del envejecimiento, investigación asociada a los telómeros y contexto de vías pineales y circadianas',
      'Marcadores asociados a los telómeros, marcadores de senescencia, paneles de estrés oxidativo y observaciones circadianas',
      'Posicionamiento de uso exclusivo para investigación, sin protocolos de dosificación',
    ],
  },
  cerebrolysin: {
    catalogTagline: 'Una mezcla de péptidos estudiada en modelos neurobiológicos y de respuesta neuronal. La investigación publicada examina señalización neurotrófica, cognición y contexto neurológico.',
    description: 'Una entrada de investigación cognitiva, preparada con una presentación premium y seguimiento basado en documentación.',
    headline: 'El péptido neurotrófico para investigación cognitiva seria.',
    keyHighlights: [
      'Mezcla de péptidos neurotróficos',
      'Señalización neurotrófica, supervivencia neuronal y vías de plasticidad sináptica y reparación',
      'Modelos de tareas cognitivas, marcadores neuroinflamatorios, marcadores de plasticidad sináptica y observaciones de supervivencia neuronal',
      'Posicionamiento de uso exclusivo para investigación, sin protocolos de dosificación',
    ],
  },
  ss31: {
    catalogTagline: 'Un tetrapéptido dirigido a la mitocondria, estudiado mediante cardiolipina y función de membrana. La investigación examina bioenergética, estrés oxidativo y respuesta mitocondrial.',
    description: 'Una entrada de investigación de longevidad, organizada para conversaciones sobre programas de investigación y futuros detalles de registro.',
    headline: 'Dirigido a la mitocondria. Diseñado para investigación de energía celular.',
    keyHighlights: [
      'Tetrapéptido dirigido a la mitocondria',
      'Membrana mitocondrial interna y biología asociada a la cardiolipina',
      'Potencial de membrana mitocondrial, marcadores de ROS, contexto de ATP y observaciones de cardiolipina y estrés oxidativo',
      'Posicionamiento de uso exclusivo para investigación, sin protocolos de dosificación',
    ],
  },
  dsip: {
    catalogTagline: 'Un péptido relacionado con el sueño examinado en investigación neuroendocrina. Los estudios analizan arquitectura del sueño y señalización fisiológica, con evidencia humana limitada y mixta.',
    description: 'Una entrada de investigación diseñada para una revisión concisa y seguimiento listo con documentación.',
    headline: 'El péptido del sueño para investigación neuroendocrina.',
    keyHighlights: [
      'Péptido inductor del sueño delta',
      'Arquitectura del sueño, señalización neuroendocrina y modelos de respuesta al estrés',
      'Observaciones de las etapas del sueño, contexto de cortisol, marcadores autonómicos, registros de recuperación y paneles neuroendocrinos',
      'Posicionamiento de uso exclusivo para investigación, sin protocolos de dosificación',
    ],
  },
  kisspeptin: {
    catalogTagline: 'Un péptido del eje reproductivo estudiado antes de la liberación de GnRH. La investigación examina señalización hipotalámico-hipofisaria y respuestas endocrinas controladas.',
    description: 'Una entrada de investigación de bienestar sexual, diseñada para mantener la revisión del producto concisa, organizada y lista para tu solicitud.',
    headline: 'El péptido del eje reproductivo para investigación hormonal.',
    keyHighlights: [
      'Neuropéptido del eje reproductivo',
      'Receptor de kisspeptina y señalización del eje GnRH',
      'LH, FSH, contexto de testosterona o estradiol, modelos de pulso de GnRH y marcadores de investigación de fertilidad',
      'Posicionamiento de uso exclusivo para investigación, sin protocolos de dosificación',
    ],
  },
  hcg: {
    catalogTagline: 'Una hormona glucoproteica estudiada mediante señalización del receptor de hormona luteinizante. La investigación incluye biología del eje reproductivo y medición de respuestas endocrinas.',
    description: 'Una entrada de investigación de bienestar sexual, estructurada para una revisión clara, variantes visibles y conversación sobre documentación.',
    headline: 'La gonadotropina para investigación del eje endocrino.',
    keyHighlights: [
      'Gonadotropina coriónica humana',
      'Señalización del receptor LH/CG',
      'Contexto del receptor LH/CG, marcadores de testosterona o estradiol, contexto de progesterona y marcadores de investigación de fertilidad',
      'Posicionamiento de uso exclusivo para investigación, sin protocolos de dosificación',
    ],
  },
  'hgh-191aa': {
    catalogTagline: 'Hormona de crecimiento completa de 191 aminoácidos para investigación del receptor GH. Los modelos examinan señalización del eje, respuesta de IGF-1 y marcadores metabólicos.',
    description: 'Una entrada de investigación de rendimiento, organizada para revisar el formato, conversar sobre disponibilidad y canalizar la documentación.',
    headline: 'Hormona de crecimiento completa de 191 aminoácidos, lista para investigar.',
    keyHighlights: [
      'Secuencia de hormona de crecimiento humana de 191 aminoácidos',
      'Receptor de hormona de crecimiento y eje IGF-1',
      'IGF-1, marcadores de glucosa, marcadores de lípidos, contexto de composición corporal y observaciones de recuperación y metabolismo proteico',
      'Posicionamiento de uso exclusivo para investigación, sin protocolos de dosificación',
    ],
  },
  'thymosin-alpha-1': {
    catalogTagline: 'Un péptido tímico estudiado en modelos de señalización inmunitaria innata y adaptativa. La investigación examina defensa celular y coordinación de la respuesta inmunitaria.',
    description: 'Una entrada de investigación de salud celular, organizada para una revisión educativa y solicitudes responsables de documentación.',
    headline: 'El péptido de señalización inmune para investigación de defensa celular.',
    keyHighlights: [
      'Péptido tímico de señalización inmune',
      'Señalización de células T, contexto de células dendríticas y modelos de respuesta inmune innata y adaptativa',
      'Marcadores de células T, paneles de citoquinas, marcadores inflamatorios y observaciones de respuesta inmune innata y equilibrio inmune',
      'Posicionamiento de uso exclusivo para investigación, sin protocolos de dosificación',
    ],
  },
  'pt-141': {
    catalogTagline: 'Un agonista del receptor de melanocortina estudiado en modelos de señalización central. La investigación se centra en farmacología receptora y respuesta neurobiológica, sin implicar uso aprobado.',
    description: 'Una entrada de investigación de bienestar sexual, con los formatos disponibles agrupados para explorar rápido y acceder al catálogo de forma responsable.',
    headline: 'El compuesto de melanocortina para investigación de bienestar.',
    keyHighlights: [
      'Agonista del receptor de melanocortina',
      'Receptores de melanocortina, en especial el contexto de investigación de MC3R y MC4R',
      'Contexto del receptor de melanocortina, observaciones autonómicas, parámetros de modelos conductuales y marcadores de seguridad cardiovascular en estudios calificados',
      'Posicionamiento de uso exclusivo para investigación, sin protocolos de dosificación',
    ],
  },
  semax: {
    catalogTagline: 'Un análogo sintético de fragmento de ACTH investigado en modelos cognitivos y neurobiológicos. La investigación examina señalización asociada con BDNF, respuesta neuronal y conducta.',
    description: 'Una entrada de investigación cognitiva, preparada con una presentación premium y revisión responsable de documentación.',
    headline: 'El neuropéptido nootrópico para investigación cognitiva.',
    keyHighlights: [
      'Análogo neuropéptido sintético de fragmento de ACTH',
      'Señalización de neuropéptidos, expresión asociada a BDNF y modelos cognitivos y de respuesta al estrés',
      'Contexto de BDNF, modelos de tareas cognitivas, marcadores de estrés y observaciones neuroinflamatorias y relacionadas con la atención',
      'Posicionamiento de uso exclusivo para investigación, sin protocolos de dosificación',
    ],
  },
  selank: {
    catalogTagline: 'Un análogo sintético de tuftsina estudiado en modelos de estrés y neuroinmunidad. La investigación examina vías de señalización asociadas con cognición y adaptación conductual.',
    description: 'Una entrada de investigación cognitiva, con sus opciones agrupadas en una sola tarjeta clara y fácil de consultar.',
    headline: 'El neuropéptido para investigación de respuesta al estrés.',
    keyHighlights: [
      'Neuropéptido análogo sintético de tuftsina',
      'Modelos de respuesta al estrés, señalización inmune-neuropéptido y contexto del sistema de serotonina',
      'Marcadores de estrés, observaciones de modelos conductuales, contexto de serotonina y marcadores inmunes e inflamatorios',
      'Posicionamiento de uso exclusivo para investigación, sin protocolos de dosificación',
    ],
  },
  'bac-water': {
    catalogTagline: 'Un accesorio independiente de 10 mL de agua bacteriostática para manejo de laboratorio calificado. Se presenta por separado y no se trata como péptido.',
    description: 'Un accesorio independiente de 10 mL de agua bacteriostática, para flujos de manejo de investigación calificados.',
    headline: 'Un tamaño verificado. Precio de accesorio claro. Lógica de kit independiente.',
    keyHighlights: [
      'Accesorio de manejo para investigación: agua bacteriostática de 10 mL',
      'Flujos de trabajo calificados de preparación y manejo de laboratorio',
      'Tamaño del frasco, empaque, documentación de lote y contexto de almacenamiento',
      'Posicionamiento de uso exclusivo para investigación, sin protocolos de dosificación',
    ],
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

/**
 * Spanish eyebrow (badge) per category. The English badge is built as
 * `${category} research` in products.ts; here we mirror the category-page
 * eyebrow style (`${name} · investigación`) so the product hero eyebrow reads
 * naturally in Spanish. Keyed by the English category display string.
 */
const categoryNameEs: Record<string, string> = {
  'Metabolic & Weight Management': 'Metabolismo y control de peso',
  'Recovery & Regeneration': 'Recuperación y regeneración',
  'Longevity & Cellular Health': 'Longevidad y salud celular',
  'Cognitive & Performance': 'Investigación cognitiva',
  'Hormone & Wellness': 'Hormonas y bienestar',
}

const badgeByCategoryEs: Record<string, string> = {
  'Metabolic & Weight Management': 'Metabolismo y control de peso · investigación',
  'Recovery & Regeneration': 'Recuperación y regeneración · investigación',
  'Longevity & Cellular Health': 'Longevidad y salud celular · investigación',
  'Cognitive & Performance': 'Investigación cognitiva',
  'Hormone & Wellness': 'Hormonas y bienestar · investigación',
}

/** Locale-specific artwork used when the English source image contains an
 *  incorrect product label or English-only legal copy. */
const productImageEs: Record<string, string> = {
  klow: 'klow-es.png',
}

/** Localized category display name (used for card eyebrows, etc.). */
export function localizedCategoryLabel(category: string, locale: Locale): string {
  if (locale === 'en') return category
  return categoryNameEs[category] ?? category
}

/** Spanish labels for the fixed product-spec rows. */
const specLabelEs: Record<string, string> = {
  'Research area': 'Área de investigación',
  'Product identity': 'Identidad del producto',
  'Primary target': 'Objetivo principal',
  'Research markers': 'Marcadores de investigación',
  'Available format': 'Formato disponible',
  'Catalog options': 'Opciones de catálogo',
  'Access pathway': 'Vía de acceso',
  'Use classification': 'Clasificación de uso',
}

/**
 * Spanish names for the hero "Primary review lens" label (product.biologyPoints[0].title),
 * keyed by the English source phrase so both facts-backed products and the
 * positioning fallback (aod-9604) are covered. Unmapped phrases fall back to English.
 */
const reviewLensEs: Record<string, string> = {
  'Accessory workflow': 'Flujo de trabajo del accesorio',
  'GLP-1 receptor signaling': 'Señalización del receptor GLP-1',
  'GHRH receptor signaling': 'Señalización del receptor de GHRH',
  'Dual receptor map': 'Mapa de doble receptor',
  'Mitochondrial peptide map': 'Mapa del péptido mitocondrial',
  'Growth-factor receptor map': 'Mapa del receptor del factor de crecimiento',
  'Stacked recovery matrix': 'Matriz de recuperación combinada',
  'Four-compound regenerative blend': 'Mezcla regenerativa de cuatro compuestos',
  'Mitochondrial energy field': 'Campo de energía mitocondrial',
  'Redox shield diagram': 'Diagrama de escudo redox',
  'Copper peptide lattice': 'Retícula del péptido de cobre',
  'Follicle signaling field': 'Campo de señalización folicular',
  'Telomere research arc': 'Arco de investigación de telómeros',
  'Neural network map': 'Mapa de la red neuronal',
  'Mitochondrial membrane map': 'Mapa de la membrana mitocondrial',
  'Sleep signaling wave': 'Onda de señalización del sueño',
  'Reproductive-axis map': 'Mapa del eje reproductivo',
  'Hormone receptor field': 'Campo del receptor hormonal',
  'GH receptor cascade': 'Cascada del receptor de GH',
  'Immune signaling array': 'Matriz de señalización inmune',
  'Melanocortin receptor map': 'Mapa del receptor de melanocortina',
  'Focus pathway lattice': 'Retícula de la vía de concentración',
  'Neural balance field': 'Campo de equilibrio neuronal',
  'GH-fragment metabolic pathway': 'Vía metabólica del fragmento de GH',
}

function formatWordEs(value: string): string {
  const normalized = value.toLowerCase()
  if (normalized.includes('multi-vial')) return 'Formato multi-vial'
  if (normalized.includes('vial')) return 'Formato vial'
  if (normalized.includes('supply')) return 'Formato de insumo de investigación'
  if (normalized.includes('ampoule')) return 'Formato ampolleta'
  if (normalized.includes('bottle')) return 'Formato botella'
  if (normalized.includes('kit')) return 'Formato de kit'
  if (normalized.includes('pack')) return 'Formato de paquete'
  return value
}

/** Localized display label for stable English variant-format values. */
export function localizedFormatLabel(value: string, locale: Locale): string {
  return locale === 'es' ? formatWordEs(value) : value
}

/** Localizes the fixed-shape product spec rows to Spanish, reusing the already
 *  translated key highlights for the identity/target/markers values. */
function localizeSpecsEs(product: Product, keyHighlights?: string[]): Product['specs'] {
  return product.specs.map((spec) => {
    const label = specLabelEs[spec.label] ?? spec.label
    let value = spec.value
    switch (spec.label) {
      case 'Research area':
        value = categoryNameEs[product.category] ?? spec.value
        break
      case 'Product identity':
        value = keyHighlights?.[0] ?? spec.value
        break
      case 'Primary target':
        value = keyHighlights?.[1] ?? spec.value
        break
      case 'Research markers':
        value = keyHighlights?.[2] ?? spec.value
        break
      case 'Available format':
        value = spec.value.split(', ').map(formatWordEs).join(', ')
        break
      case 'Access pathway':
        value = 'Solicitud de evaluación y documentación'
        break
      case 'Use classification':
        value = 'Uso exclusivo para investigación'
        break
      default:
        break
    }
    return { label, value }
  })
}

export function getLocalizedProduct(product: Product, locale: Locale): Product {
  if (locale === 'en') return product
  const overrides = productTranslationsEs[product.slug]
  const highlightsEs = catalogHighlightsEs[product.slug]
  const badgeEs = badgeByCategoryEs[product.category]
  const imageEs = productImageEs[product.slug]
  if (!overrides && !highlightsEs && !badgeEs && !imageEs) return product
  const keyHighlights = overrides?.keyHighlights
  const lensTitleEs = product.biologyPoints[0] ? reviewLensEs[product.biologyPoints[0].title] : undefined
  return {
    ...product,
    ...(badgeEs ? { badge: badgeEs } : {}),
    ...(imageEs ? { image: imageEs } : {}),
    ...overrides,
    ...(highlightsEs ? { catalogHighlights: highlightsEs } : {}),
    specs: localizeSpecsEs(product, keyHighlights),
    ...(lensTitleEs
      ? { biologyPoints: [{ ...product.biologyPoints[0], title: lensTitleEs }, ...product.biologyPoints.slice(1)] }
      : {}),
  }
}
