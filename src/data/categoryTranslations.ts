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
    headline: 'Investigación metabólica, liderada por Retatrutide.',
    subheadline:
      'Comienza con el compuesto insignia de triple vía de Encore y compara otros cuatro enfoques metabólicos por mecanismo, formato, precio y documentación.',
    overview:
      'El catálogo de investigación metabólica y de composición corporal de Encore Bio Labs abarca dos de las líneas de investigación más activas del área: compuestos de receptores de incretinas (señalización GLP-1/GIP/glucagón) y compuestos del eje de la hormona de crecimiento (análogos de GHRH y secretagogos del receptor de grelina). Compara vías, formatos y documentación en paralelo, y recibe cada compuesto como un kit completo y listo para investigar, con los suministros correspondientes incluidos.',
  },
  'recovery-regeneration': {
    headline: 'Investigación de recuperación, liderada por Wolverine Stack.',
    subheadline:
      'Comienza con la combinación insignia BPC-157 + TB-500 y compara KLOW con dos vías distintas de péptidos de cobre por formato, precio y documentación.',
    overview:
      'El catálogo de recuperación y regeneración de Encore Bio Labs reúne en un solo lugar los compuestos más estudiados en reparación tisular y remodelación de la matriz: el Wolverine Stack de BPC-157 + TB-500, la mezcla regenerativa de cuatro compuestos KLOW (GHK-Cu, BPC-157, TB-500, KPV) y los compuestos de péptidos de cobre GHK-Cu y AHK-Cu. Compara vías y formatos en paralelo, y recibe cada entrada como un kit completo y listo para investigar.',
  },
  'longevity-cellular-health': {
    headline: 'Investigación de energía celular, liderada por NAD+.',
    subheadline:
      'Elige NAD+ de 500 mg o 1000 mg y compara vías antioxidantes, mitocondriales, circadianas y de señalización inmune en una sola colección clara.',
    overview:
      'El catálogo de longevidad y salud celular de Encore Bio Labs cubre los compuestos en el centro de la investigación del envejecimiento: el cofactor metabólico NAD+, el antioxidante esencial glutatión, el péptido dirigido a la mitocondria SS-31, el péptido asociado a los telómeros Epithalon y el péptido de señalización inmune Thymosin Alpha-1. Compara mecanismos, formatos y documentación, y recibe cada compuesto como un kit completo de investigación.',
  },
  'cognitive-performance': {
    headline: 'Investigación cognitiva, liderada por Cerebrolysin.',
    subheadline:
      'Comienza con la mezcla de péptidos neurotróficos y compara las vías distintas de Semax y Selank por formato, precio y documentación.',
    overview:
      'El catálogo cognitivo y de rendimiento de Encore Bio Labs reúne los compuestos de neuroseñalización más estudiados: Cerebrolysin, una mezcla de péptidos neurotróficos estudiada en la supervivencia neuronal y la plasticidad sináptica, y Semax y Selank, dos neuropéptidos estructuralmente distintos estudiados en la señalización asociada a BDNF y de respuesta al estrés. Compara vías y formatos en paralelo, y recibe cada compuesto como un kit completo de investigación.',
  },
  'hormone-wellness': {
    headline: 'Elige la vía. Encuentra el compuesto de investigación correcto.',
    subheadline:
      'Compara señalización reproductiva, de crecimiento, del sueño y de melanocortina, y elige el formato y precio actuales sin perderte en lenguaje técnico.',
    overview:
      'El catálogo hormonal y de bienestar de Encore Bio Labs abarca toda la gama de la investigación endocrina: compuestos del eje reproductivo (Kisspeptin, HCG), señalización del eje de la hormona de crecimiento y de factores de crecimiento (HGH 191AA, IGF1-LR3), investigación del sueño y neuroendocrina (DSIP) e investigación del receptor central de melanocortina (PT-141). Compara ejes, formatos y documentación en paralelo, y recibe cada compuesto como un kit completo de investigación.',
  },
}

const categoryDetailsEs: Record<string, Pick<CategoryContent, 'whyStudied' | 'themes' | 'comparisonNotes' | 'faqs' | 'disclaimer'>> = {
  'metabolic-weight-management': {
    whyStudied: 'La investigación metabólica estudia tanto la biología de los receptores de incretinas —GLP-1, GIP y glucagón— como las vías independientes del eje GH que influyen en IGF-1 y otros marcadores metabólicos. La colección separa estas vías para que los equipos puedan comparar preguntas de investigación distintas sin confundirlas con resultados garantizados.',
    themes: [
      { title: 'Señalización de receptores de incretinas', description: 'Vías de los receptores GLP-1, GIP y glucagón en modelos de señalización metabólica y relacionada con el apetito.' },
      { title: 'Señalización del eje GH e IGF-1', description: 'Activación del receptor de GHRH, respuesta pulsátil de GH e IGF-1 como marcador posterior.' },
      { title: 'Investigación de secretagogos del receptor de grelina', description: 'Cómo se estudia el agonismo del receptor de grelina junto con la señalización de GHRH.' },
      { title: 'Detección energética mitocondrial asociada con AMPK', description: 'Investigación de péptidos derivados de la mitocondria vinculada con adaptación energética y flexibilidad metabólica.' },
      { title: 'Modelos de investigación de composición corporal', description: 'Cómo se registran marcadores relacionados con composición sin prometer resultados individuales.' },
    ],
    comparisonNotes: {
      retatrutide: 'La única opción de triple receptor en esta categoría',
      'aod-9604': 'Fragmento de GH estudiado en señalización metabólica',
      tesamorelin: 'Opción de un solo compuesto para el eje GH',
      'cjc1295-ipamorelin': 'Combinación de dos señales del eje GH',
      'mots-c': 'El único péptido derivado de la mitocondria en la categoría',
    },
    faqs: [
      { question: '¿Cuál es la diferencia entre Retatrutide y Tesamorelin?', answer: 'Retatrutide se estudia mediante la biología de receptores GLP-1, GIP y glucagón; Tesamorelin se estudia mediante el eje GHRH–GH–IGF-1. Son familias de vías distintas.' },
      { question: '¿Por qué CJC-1295 e Ipamorelin se presentan juntos?', answer: 'Se revisan juntos porque actúan sobre señales complementarias del eje GH: un análogo de GHRH y un secretagogo del receptor de grelina.' },
      { question: '¿MOTS-C utiliza la misma vía que los demás productos?', answer: 'No. Se agrupa por su relevancia metabólica, pero su contexto de péptido mitocondrial y señalización asociada con AMPK es distinto.' },
      { question: '¿Esta página predice resultados individuales?', answer: 'No. El contenido describe vías y contextos de investigación; no promete resultados ni ofrece recomendaciones de tratamiento.' },
    ],
    disclaimer: 'Todos los productos de esta categoría se venden exclusivamente para investigación de laboratorio. No están destinados al consumo humano o animal, no son productos para bajar de peso y esta página no ofrece recomendaciones de tratamiento, dosificación ni predicciones de resultados.',
  },
  'recovery-regeneration': {
    whyStudied: 'La investigación de recuperación conecta señalización asociada con reparación, remodelación del citoesqueleto y biología de la matriz extracelular. Wolverine Stack, KLOW y los péptidos de cobre organizan esas preguntas como rutas distintas para que el equipo pueda comparar mecanismos y formatos con claridad.',
    themes: [
      { title: 'Señalización asociada con la reparación', description: 'Contexto de angiogénesis, óxido nítrico y modelos de estrés tisular relacionado con BPC-157.' },
      { title: 'Remodelación del citoesqueleto y migración celular', description: 'Regulación de actina y contexto de migración celular vinculado con TB-500.' },
      { title: 'Biología de matriz de los péptidos de cobre', description: 'Colágeno, elastina y remodelación de la matriz estudiados mediante GHK-Cu y AHK-Cu.' },
      { title: 'Planificación de investigación con combinaciones y kits', description: 'Organización de compuestos complementarios y componentes del kit para una revisión más clara.' },
    ],
    comparisonNotes: {
      'wolverine-stack': 'Combina las vías de investigación de BPC-157 y TB-500',
      klow: 'Mezcla regenerativa de cuatro compuestos, no un péptido de una sola vía',
      'ghk-cu': 'Enfoque amplio en matriz y piel',
      'ahk-cu': 'Enfoque más específico en folículo y señalización dérmica',
    },
    faqs: [
      { question: '¿Se venden BPC-157 o TB-500 por separado?', answer: 'No. Encore los ofrece juntos como Wolverine Stack, una sola entrada que organiza ambas vías de investigación.' },
      { question: '¿Qué contiene Wolverine Stack?', answer: 'La entrada reúne BPC-157 y TB-500 para revisión de investigación. No incluye instrucciones de dosificación ni tratamiento.' },
      { question: '¿KLOW es un solo péptido?', answer: 'No. KLOW es una mezcla de GHK-Cu, BPC-157, TB-500 y KPV que reúne varias vías de investigación.' },
      { question: '¿En qué se diferencian GHK-Cu y AHK-Cu?', answer: 'GHK-Cu se presenta con un alcance más amplio de matriz y piel; AHK-Cu se enfoca con mayor precisión en biología folicular y dérmica.' },
    ],
    disclaimer: 'Todos los productos de esta categoría se venden exclusivamente para investigación de laboratorio. No están destinados al consumo humano o animal, no son tratamientos para lesiones o heridas y esta página no ofrece protocolos de recuperación.',
  },
  'longevity-cellular-health': {
    whyStudied: 'La investigación de biología del envejecimiento conecta producción de energía mitocondrial, reacciones redox, defensa antioxidante y señalización celular. NAD+, Glutathione, SS-31, Epithalon y Thymosin Alpha-1 representan rutas diferentes dentro de ese contexto y deben compararse por mecanismo, no por promesas de resultado.',
    themes: [
      { title: 'Metabolismo redox y energía mitocondrial', description: 'Ciclo NAD+/NADH, fosforilación oxidativa y producción de energía celular.' },
      { title: 'Biología antioxidante y de detoxificación', description: 'Función de Glutathione en el equilibrio redox y sistemas enzimáticos antioxidantes.' },
      { title: 'Biología de membrana dirigida a la mitocondria', description: 'Interacción estudiada de SS-31 con cardiolipina y estabilidad de la membrana interna.' },
      { title: 'Investigación circadiana y asociada con telómeros', description: 'Contexto de Epithalon en literatura de péptidos pineales, telómeros y ritmos circadianos.' },
      { title: 'Señalización inmunitaria y defensa celular', description: 'Relevancia de Thymosin Alpha-1 en modelos de señalización inmune y resiliencia celular.' },
    ],
    comparisonNotes: {
      'nad-plus': 'El alcance más amplio de cofactor metabólico de la categoría',
      glutathione: 'Opción central para investigación del equilibrio redox',
      epithalon: 'Tetrapéptido vinculado con contexto circadiano y telomérico',
      ss31: 'La vía más específica para membrana mitocondrial',
      'thymosin-alpha-1': 'La única opción enfocada en señalización inmune',
    },
    faqs: [
      { question: '¿Por qué NAD+ se relaciona con investigación de longevidad?', answer: 'Porque participa en función mitocondrial, sirtuinas, enzimas PARP y respuesta al estrés celular, todas vías estudiadas en biología del envejecimiento.' },
      { question: '¿SS-31 es lo mismo que elamipretide?', answer: 'SS-31 se asocia con elamipretide en la literatura de investigación. Esta página solo presenta contexto de uso investigativo.' },
      { question: '¿Epithalon afirma prolongar la vida?', answer: 'No. Se presenta únicamente por su contexto de investigación circadiana, pineal y asociada con telómeros.' },
      { question: '¿Por qué hay un péptido inmunitario en esta categoría?', answer: 'La señalización de defensa celular se cruza con preguntas de resiliencia y envejecimiento, por lo que Thymosin Alpha-1 se organiza aquí.' },
    ],
    disclaimer: 'Todos los productos de esta categoría se venden exclusivamente para investigación de laboratorio. No están destinados al consumo humano o animal, no son tratamientos antienvejecimiento y esta página no afirma efectos sobre longevidad ni resultados individuales.',
  },
  'cognitive-performance': {
    whyStudied: 'La investigación cognitiva compara sistemas neurotróficos, supervivencia neuronal, expresión relacionada con BDNF y señalización neuroinmune. Cerebrolysin, Semax y Selank son compuestos estructuralmente distintos y se presentan para preguntas de investigación diferentes, no como productos de mejora cognitiva.',
    themes: [
      { title: 'Investigación neurotrófica y de supervivencia neuronal', description: 'Relevancia estudiada de Cerebrolysin para plasticidad sináptica y vías de respuesta neuronal.' },
      { title: 'Señalización del fragmento de ACTH asociada con BDNF', description: 'Contexto de Semax en expresión de marcadores neurotróficos y modelos cognitivos.' },
      { title: 'Señalización neuroinmune y de respuesta al estrés', description: 'Contexto de Selank como análogo de tuftsin en señalización neuroinmune y respuesta al estrés.' },
    ],
    comparisonNotes: {
      cerebrolysin: 'Mezcla de péptidos en lugar de una secuencia única',
      semax: 'Análogo de fragmento de ACTH estudiado junto con Selank',
      selank: 'Análogo de tuftsin con un ángulo neuroinmune distinto',
    },
    faqs: [
      { question: '¿Semax y Selank son intercambiables?', answer: 'No. Son compuestos estructuralmente distintos y se revisan por vías complementarias, no como sustitutos.' },
      { question: '¿Cerebrolysin se presenta como tratamiento cognitivo?', answer: 'No. Se muestra únicamente por su contexto de investigación neurotrófica y de supervivencia neuronal.' },
      { question: '¿Esta categoría promete mejorar el rendimiento?', answer: 'No. “Rendimiento” describe las preguntas biológicas estudiadas, no una promesa de mejora o resultado personal.' },
    ],
    disclaimer: 'Todos los productos de esta categoría se venden exclusivamente para investigación de laboratorio. No están destinados al consumo humano o animal, no son productos de mejora cognitiva o de rendimiento y esta página no promete memoria, enfoque ni resultados de desempeño.',
  },
  'hormone-wellness': {
    whyStudied: 'La investigación endocrina abarca ejes independientes: señalización reproductiva, eje GH e IGF-1, señalización neuroendocrina del sueño y receptores centrales de melanocortina. Estos compuestos comparten un dominio de investigación, no un mecanismo único, por lo que la selección comienza con la vía.',
    themes: [
      { title: 'Señalización del eje reproductivo', description: 'Investigación del receptor de Kisspeptin, el eje GnRH y la respuesta posterior de LH y FSH.' },
      { title: 'Investigación de gonadotropinas y esteroidogénesis', description: 'Relevancia de HCG en señalización del receptor LH/CG y marcadores endocrinos.' },
      { title: 'Señalización del eje GH e IGF-1', description: 'Activación del receptor de GH, señalización JAK-STAT y marcadores posteriores de IGF-1.' },
      { title: 'Señalización del sueño y neuroendocrina', description: 'Contexto de DSIP en modelos de arquitectura del sueño y respuesta al estrés.' },
      { title: 'Investigación del receptor central de melanocortina', description: 'Relevancia de PT-141 en señalización del sistema nervioso central.' },
    ],
    comparisonNotes: {
      kisspeptin: 'Regulador situado al inicio del eje reproductivo',
      hcg: 'Opción posterior de investigación con gonadotropinas',
      'hgh-191aa': 'Señalización directa del receptor de GH',
      'igf1-lr3': 'Señalización del receptor de factor de crecimiento posterior al eje GH',
      dsip: 'La única opción enfocada en señalización del sueño',
      'pt-141': 'La única opción enfocada en señalización central de melanocortina',
    },
    faqs: [
      { question: '¿Cómo se relacionan Kisspeptin y HCG?', answer: 'Kisspeptin se estudia al inicio del eje reproductivo; HCG actúa más adelante sobre receptores LH/CG. No son opciones intercambiables.' },
      { question: '¿Qué significa “191AA” en HGH 191AA?', answer: 'Se refiere a la secuencia de 191 aminoácidos de la hormona de crecimiento humana estudiada en investigación de somatropina.' },
      { question: '¿PT-141 es lo mismo que bremelanotide?', answer: 'PT-141 se asocia con bremelanotide en la literatura, pero este catálogo es exclusivamente para investigación y no ofrece instrucciones de tratamiento.' },
      { question: '¿DSIP ofrece orientación para tratar el sueño?', answer: 'No. Solo presenta contexto de investigación sobre señalización del sueño y modelos neuroendocrinos.' },
    ],
    disclaimer: 'Todos los productos de esta categoría se venden exclusivamente para investigación de laboratorio. No están destinados al consumo humano o animal, no son terapia hormonal ni tratamientos de bienestar sexual y esta página no ofrece recomendaciones ni promete resultados.',
  },
}

export function localizeCategoryContent(area: ResearchArea, content: CategoryContent, locale: Locale): CategoryContent {
  if (locale === 'en') return content
  const name = names[area.slug] ?? area.name
  const hero = categoryHeroEs[area.slug]
  const details = categoryDetailsEs[area.slug]
  return {
    ...content,
    eyebrow: `${name} · investigación`,
    headline: hero?.headline ?? `Investigación de ${name.toLowerCase()}.`,
    subheadline: hero?.subheadline ?? `Revisa el contexto científico, los mecanismos estudiados y la documentación disponible para ${name.toLowerCase()}.`,
    overview: hero?.overview ?? `${name} reúne compuestos estudiados en señalización biológica, energía celular, composición corporal y otros modelos relacionados. Esta página ofrece contexto de investigación, no recomendaciones de tratamiento.`,
    whyStudied: details?.whyStudied ?? 'Los equipos científicos estudian estas vías para separar señales moleculares, parámetros medidos y límites del modelo antes de extraer conclusiones.',
    themes: details?.themes ?? content.themes.map((theme) => ({
      title: categoryThemeTitleEs[theme.title] ?? 'Vía biológica relacionada',
      description: 'Tema descrito en la literatura disponible; el modelo y sus límites deben revisarse en cada estudio.',
    })),
    comparisonNotes: details?.comparisonNotes ?? Object.fromEntries(Object.keys(content.comparisonNotes).map((slug) => [slug, 'Entrada catalogada para un enfoque de investigación específico.'])),
    faqs: details?.faqs ?? content.faqs.map(() => ({ question: `¿Qué se estudia en ${name.toLowerCase()}?`, answer: 'La investigación se interpreta según el compuesto, el modelo y los parámetros publicados. El catálogo no ofrece recomendaciones médicas ni resultados individuales.' })),
    disclaimer: details?.disclaimer ?? 'Todos los productos de esta categoría se venden exclusivamente para investigación de laboratorio. No están destinados al consumo humano o animal y esta página no ofrece tratamiento, dosificación ni predicciones de resultados individuales.',
  }
}
