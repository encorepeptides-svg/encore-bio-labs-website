import type { Locale } from '../i18n/config'
import { products, researchAreas, type Product, type ProductVariant } from './products'

export type ProtocolCategorySlug = (typeof protocolCategorySlugs)[number]

export const protocolCategorySlugs = [
  'metabolic-weight-management',
  'recovery-regeneration',
  'longevity-cellular-health',
  'cognitive-performance',
  'hormone-wellness',
] as const

export type ProtocolComponentConfig = {
  productSlug: string
  quantity: number
  defaultVariantLabel: string
}

type LocalizedText = Record<Locale, string>

type ProtocolContent = {
  title: LocalizedText
  tagline: LocalizedText
  description: LocalizedText
  objective: LocalizedText
  education: Record<Locale, string[]>
}

export type ProtocolConfig = {
  slug: string
  categorySlug: ProtocolCategorySlug
  tags: LocalizedText[]
  components: ProtocolComponentConfig[]
  content: ProtocolContent
}

export type ResolvedProtocolComponent = {
  config: ProtocolComponentConfig
  product: Product
  defaultVariant: ProductVariant
}

export type LocalizedProtocol = Omit<ProtocolConfig, 'tags' | 'content'> & {
  tags: string[]
  title: string
  tagline: string
  description: string
  objective: string
  education: string[]
}

const t = (en: string, es: string): LocalizedText => ({ en, es })

export const protocols: ProtocolConfig[] = [
  {
    slug: 'metabolic-pathway-comparison',
    categorySlug: 'metabolic-weight-management',
    tags: [t('Three-pathway review', 'Revisión de tres vías'), t('Metabolic signaling', 'Señalización metabólica')],
    components: [
      { productSlug: 'retatrutide', quantity: 1, defaultVariantLabel: '10 mg' },
      { productSlug: 'mots-c', quantity: 1, defaultVariantLabel: '10 mg' },
      { productSlug: 'aod-9604', quantity: 1, defaultVariantLabel: '5 mg' },
    ],
    content: {
      title: t('Metabolic Pathway Comparison Set', 'Set comparativo de vías metabólicas'),
      tagline: t('Compare incretin, mitochondrial, and GH-fragment research pathways.', 'Compara vías de investigación incretina, mitocondrial y de fragmentos de GH.'),
      description: t('A three-component set for qualified teams comparing distinct metabolic-signaling models without combining the products into one formulation.', 'Un set de tres componentes para equipos calificados que comparan distintos modelos de señalización metabólica sin combinar los productos en una sola formulación.'),
      objective: t('For qualified laboratory teams planning a side-by-side review of three distinct metabolic research pathways, with each component kept as its own catalog item and batch record.', 'Para equipos de laboratorio calificados que planean una revisión paralela de tres vías distintas de investigación metabólica, con cada componente como producto y registro de lote independiente.'),
      education: {
        en: ['Retatrutide is cataloged for triple-receptor research context, while MOTS-C is reviewed through mitochondrial signaling and AOD-9604 through GH-fragment models.', 'Keeping the components separate supports clearer controls, variant selection, and lot-level documentation. This set is not a dosing or administration plan.'],
        es: ['Retatrutide se cataloga en el contexto de investigación de triple receptor, mientras que MOTS-C se revisa mediante señalización mitocondrial y AOD-9604 mediante modelos de fragmentos de GH.', 'Mantener los componentes separados facilita controles más claros, selección de variantes y documentación por lote. Este set no es un plan de dosificación ni de administración.'],
      },
    },
  },
  {
    slug: 'gh-axis-signaling',
    categorySlug: 'metabolic-weight-management',
    tags: [t('GH-axis research', 'Investigación del eje GH'), t('Two-formulation set', 'Set de dos formulaciones')],
    components: [
      { productSlug: 'tesamorelin', quantity: 1, defaultVariantLabel: '10 mg' },
      { productSlug: 'cjc1295-ipamorelin', quantity: 1, defaultVariantLabel: '5 mg + 5 mg' },
    ],
    content: {
      title: t('GH-Axis Signaling Set', 'Set de señalización del eje GH'),
      tagline: t('Review two distinct GH-axis research formulations together.', 'Revisa juntas dos formulaciones distintas de investigación del eje GH.'),
      description: t('Pairs a GHRH-analog catalog entry with a dual-mechanism research blend for structured pathway comparison.', 'Combina una entrada de análogo de GHRH con una mezcla de investigación de doble mecanismo para comparar vías de forma estructurada.'),
      objective: t('For qualified researchers comparing GHRH-receptor and combined GHRH/ghrelin-receptor signaling models with separate products and records.', 'Para investigadores calificados que comparan modelos de señalización del receptor de GHRH y de receptores combinados de GHRH/grelina con productos y registros separados.'),
      education: {
        en: ['Tesamorelin and CJC-1295 + Ipamorelin are distinct catalog entries with different research identities, even though both are discussed around the GH axis.', 'The set keeps each formulation independent so a research team can document identity, format, and observations without implying interchangeability.'],
        es: ['Tesamorelin y CJC-1295 + Ipamorelin son entradas distintas del catálogo con identidades de investigación diferentes, aunque ambas se estudian alrededor del eje GH.', 'El set mantiene cada formulación independiente para documentar identidad, formato y observaciones sin implicar que sean intercambiables.'],
      },
    },
  },
  {
    slug: 'repair-matrix-signaling',
    categorySlug: 'recovery-regeneration',
    tags: [t('Repair signaling', 'Señalización de reparación'), t('Matrix biology', 'Biología de matriz')],
    components: [
      { productSlug: 'wolverine-stack', quantity: 1, defaultVariantLabel: 'BPC-157 + TB-500' },
      { productSlug: 'ghk-cu', quantity: 1, defaultVariantLabel: '50 mg' },
    ],
    content: {
      title: t('Repair & Matrix Signaling Set', 'Set de señalización de reparación y matriz'),
      tagline: t('Bring repair-pathway and copper-peptide research into one review set.', 'Integra investigación de vías de reparación y péptidos de cobre en un solo set de revisión.'),
      description: t('Organizes the Wolverine Stack beside GHK-Cu for teams comparing complementary tissue-signaling and extracellular-matrix research contexts.', 'Organiza Wolverine Stack junto con GHK-Cu para equipos que comparan contextos complementarios de señalización tisular y matriz extracelular.'),
      objective: t('For laboratory teams reviewing how a BPC-157/TB-500 blend and a separate copper-peptide entry are represented across recovery-focused research models.', 'Para equipos de laboratorio que revisan cómo se representan una mezcla de BPC-157/TB-500 y una entrada separada de péptido de cobre en modelos de investigación de recuperación.'),
      education: {
        en: ['Wolverine Stack is a finished blend entry, while GHK-Cu remains a separate product with selectable strength and its own documentation context.', 'The bundle is a catalog convenience only. It does not direct use, timing, administration, or expected outcomes.'],
        es: ['Wolverine Stack es una entrada de mezcla terminada, mientras que GHK-Cu sigue siendo un producto separado con concentración seleccionable y su propio contexto documental.', 'El paquete es solo una facilidad del catálogo. No indica uso, tiempos, administración ni resultados esperados.'],
      },
    },
  },
  {
    slug: 'copper-peptide-matrix',
    categorySlug: 'recovery-regeneration',
    tags: [t('Copper peptides', 'Péptidos de cobre'), t('Matrix comparison', 'Comparación de matriz')],
    components: [
      { productSlug: 'ghk-cu', quantity: 1, defaultVariantLabel: '50 mg' },
      { productSlug: 'ahk-cu', quantity: 1, defaultVariantLabel: '50 mg' },
    ],
    content: {
      title: t('Copper Peptide Matrix Set', 'Set de matriz de péptidos de cobre'),
      tagline: t('Compare two copper-peptide entries without collapsing their identities.', 'Compara dos entradas de péptidos de cobre sin mezclar sus identidades.'),
      description: t('A concise two-product set for reviewing GHK-Cu and AHK-Cu across matrix and dermal research contexts.', 'Un set conciso de dos productos para revisar GHK-Cu y AHK-Cu en contextos de investigación de matriz y dermis.'),
      objective: t('For qualified teams organizing a controlled comparison of two separate copper-peptide catalog entries, formats, and records.', 'Para equipos calificados que organizan una comparación controlada de dos entradas, formatos y registros separados de péptidos de cobre.'),
      education: {
        en: ['GHK-Cu and AHK-Cu are displayed together for research planning, but they remain separate products with distinct identities and documentation.', 'Variant changes affect current catalog subtotal and SKU selection immediately; no bundle discount or performance claim is implied.'],
        es: ['GHK-Cu y AHK-Cu se muestran juntos para planear investigación, pero siguen siendo productos separados con identidades y documentación distintas.', 'Los cambios de variante actualizan de inmediato el subtotal y el SKU; no se implica descuento de paquete ni afirmación de desempeño.'],
      },
    },
  },
  {
    slug: 'cellular-energy-research',
    categorySlug: 'longevity-cellular-health',
    tags: [t('Cellular energy', 'Energía celular'), t('Mitochondrial research', 'Investigación mitocondrial')],
    components: [
      { productSlug: 'nad-plus', quantity: 1, defaultVariantLabel: '500 mg' },
      { productSlug: 'ss31', quantity: 1, defaultVariantLabel: '10 mg' },
      { productSlug: 'mots-c', quantity: 1, defaultVariantLabel: '10 mg' },
    ],
    content: {
      title: t('Cellular Energy Research Set', 'Set de investigación de energía celular'),
      tagline: t('Organize cofactor and mitochondrial-pathway entries in one comparison.', 'Organiza entradas de cofactores y vías mitocondriales en una sola comparación.'),
      description: t('Groups NAD+, SS-31, and MOTS-C for documentation-led review across distinct cellular-energy research contexts.', 'Agrupa NAD+, SS-31 y MOTS-C para una revisión guiada por documentación en distintos contextos de investigación de energía celular.'),
      objective: t('For qualified research teams comparing redox-cofactor and mitochondrial-signaling entries while preserving independent variants and records.', 'Para equipos de investigación calificados que comparan entradas de cofactores redox y señalización mitocondrial, manteniendo variantes y registros independientes.'),
      education: {
        en: ['NAD+ is represented as a cellular redox cofactor, while SS-31 and MOTS-C are separate peptide entries discussed in mitochondrial research contexts.', 'The configurable NAD+ strength lets teams align the catalog selection with a documented study plan without publishing use instructions.'],
        es: ['NAD+ se representa como cofactor redox celular, mientras que SS-31 y MOTS-C son péptidos separados estudiados en contextos mitocondriales.', 'La concentración configurable de NAD+ permite alinear la selección del catálogo con un plan de estudio documentado sin publicar instrucciones de uso.'],
      },
    },
  },
  {
    slug: 'redox-balance-research',
    categorySlug: 'longevity-cellular-health',
    tags: [t('Redox context', 'Contexto redox'), t('Two-product review', 'Revisión de dos productos')],
    components: [
      { productSlug: 'nad-plus', quantity: 1, defaultVariantLabel: '500 mg' },
      { productSlug: 'glutathione', quantity: 1, defaultVariantLabel: '1500 mg' },
    ],
    content: {
      title: t('Redox Balance Research Set', 'Set de investigación de equilibrio redox'),
      tagline: t('Review two endogenous redox-system entries side by side.', 'Revisa en paralelo dos entradas del sistema redox endógeno.'),
      description: t('Pairs NAD+ and Glutathione as separate catalog products for controlled redox and oxidative-balance research planning.', 'Combina NAD+ y Glutathione como productos separados para planear investigación controlada de redox y equilibrio oxidativo.'),
      objective: t('For qualified teams comparing two distinct endogenous molecules within laboratory redox and oxidative-balance models.', 'Para equipos calificados que comparan dos moléculas endógenas distintas en modelos de laboratorio de redox y equilibrio oxidativo.'),
      education: {
        en: ['NAD+ and Glutathione participate in different biochemical systems and should not be presented as interchangeable products.', 'The page centralizes selection and records while keeping claims, dosing, and administration guidance out of the open storefront.'],
        es: ['NAD+ y Glutathione participan en sistemas bioquímicos distintos y no deben presentarse como productos intercambiables.', 'La página centraliza selección y registros sin incluir afirmaciones, dosificación ni orientación de administración en la tienda abierta.'],
      },
    },
  },
  {
    slug: 'multi-pathway-neuro-signaling',
    categorySlug: 'cognitive-performance',
    tags: [t('Neuro-signaling', 'Neuroseñalización'), t('Three-format review', 'Revisión de tres formatos')],
    components: [
      { productSlug: 'cerebrolysin', quantity: 1, defaultVariantLabel: 'Published Ampoule Format' },
      { productSlug: 'semax', quantity: 1, defaultVariantLabel: '10 mg' },
      { productSlug: 'selank', quantity: 1, defaultVariantLabel: '10 mg' },
    ],
    content: {
      title: t('Multi-Pathway Neuro-Signaling Set', 'Set multivía de neuroseñalización'),
      tagline: t('Compare one ampoule-format mixture and two peptide entries.', 'Compara una mezcla en ampolleta y dos entradas de péptidos.'),
      description: t('Organizes Cerebrolysin, Semax, and Selank for side-by-side review of distinct neuro-signaling research formats.', 'Organiza Cerebrolysin, Semax y Selank para revisar en paralelo distintos formatos de investigación de neuroseñalización.'),
      objective: t('For qualified teams comparing distinct neuro-signaling catalog entries, formats, and documentation without implying a clinical regimen.', 'Para equipos calificados que comparan entradas, formatos y documentación de neuroseñalización sin implicar un régimen clínico.'),
      education: {
        en: ['Cerebrolysin is presented in its published ampoule format, while Semax and Selank remain independent vial-format entries.', 'Grouping them supports catalog comparison only; it does not establish combined use, sequence, or an expected cognitive outcome.'],
        es: ['Cerebrolysin se presenta en su formato publicado de ampolleta, mientras que Semax y Selank siguen siendo entradas independientes en vial.', 'Agruparlos solo facilita la comparación del catálogo; no establece uso combinado, secuencia ni un resultado cognitivo esperado.'],
      },
    },
  },
  {
    slug: 'focused-neuro-signaling-pair',
    categorySlug: 'cognitive-performance',
    tags: [t('Peptide pair', 'Par de péptidos'), t('Focused comparison', 'Comparación enfocada')],
    components: [
      { productSlug: 'semax', quantity: 1, defaultVariantLabel: '10 mg' },
      { productSlug: 'selank', quantity: 1, defaultVariantLabel: '10 mg' },
    ],
    content: {
      title: t('Focused Neuro-Signaling Pair', 'Par enfocado de neuroseñalización'),
      tagline: t('A concise two-entry comparison for cognitive research planning.', 'Una comparación concisa de dos entradas para planear investigación cognitiva.'),
      description: t('Keeps Semax and Selank together as a simple, documentation-led comparison set while preserving separate SKUs.', 'Mantiene Semax y Selank juntos como un set comparativo simple y guiado por documentación, conservando SKUs separados.'),
      objective: t('For qualified laboratory teams seeking a smaller cognitive-category set with clear product identity and no clinical-use instructions.', 'Para equipos de laboratorio calificados que buscan un set cognitivo más pequeño, con identidad clara y sin instrucciones de uso clínico.'),
      education: {
        en: ['Semax and Selank remain independent catalog entries with separate product pages, research context, and records.', 'This focused set shortens the path to comparison and cart selection without making condition, treatment, or outcome claims.'],
        es: ['Semax y Selank siguen siendo entradas independientes con páginas, contexto de investigación y registros separados.', 'Este set enfocado acorta el camino a la comparación y al carrito sin afirmar condiciones, tratamientos ni resultados.'],
      },
    },
  },
  {
    slug: 'reproductive-signaling-research',
    categorySlug: 'hormone-wellness',
    tags: [t('Endocrine signaling', 'Señalización endocrina'), t('Reproductive research', 'Investigación reproductiva')],
    components: [
      { productSlug: 'kisspeptin', quantity: 1, defaultVariantLabel: '10 mg' },
      { productSlug: 'hcg', quantity: 1, defaultVariantLabel: '10,000 IU' },
      { productSlug: 'dsip', quantity: 1, defaultVariantLabel: '10 mg' },
    ],
    content: {
      title: t('Reproductive Signaling Research Set', 'Set de investigación de señalización reproductiva'),
      tagline: t('Organize three endocrine research entries for controlled review.', 'Organiza tres entradas de investigación endocrina para una revisión controlada.'),
      description: t('Groups Kisspeptin, HCG, and DSIP for qualified teams comparing reproductive, gonadotropin, and sleep-linked signaling contexts.', 'Agrupa Kisspeptin, HCG y DSIP para equipos calificados que comparan contextos reproductivos, gonadotrópicos y de señalización vinculada al sueño.'),
      objective: t('For qualified researchers organizing separate endocrine-signaling entries into one catalog review without presenting a fertility or wellness treatment plan.', 'Para investigadores calificados que organizan entradas separadas de señalización endocrina en una sola revisión sin presentar un plan de fertilidad ni bienestar.'),
      education: {
        en: ['Each component has a distinct identity, format, and research context; the page does not suggest that the products are interchangeable.', 'Because the storefront is open, this set intentionally omits condition claims, dosing, timing, and administration guidance.'],
        es: ['Cada componente tiene identidad, formato y contexto de investigación distintos; la página no sugiere que sean intercambiables.', 'Como la tienda es abierta, este set omite intencionalmente afirmaciones sobre condiciones, dosificación, tiempos y administración.'],
      },
    },
  },
  {
    slug: 'growth-circadian-signaling',
    categorySlug: 'hormone-wellness',
    tags: [t('Growth signaling', 'Señalización de crecimiento'), t('Circadian context', 'Contexto circadiano')],
    components: [
      { productSlug: 'hgh-191aa', quantity: 1, defaultVariantLabel: '4 × 15 IU vials' },
      { productSlug: 'cjc1295-ipamorelin', quantity: 1, defaultVariantLabel: '5 mg + 5 mg' },
      { productSlug: 'dsip', quantity: 1, defaultVariantLabel: '10 mg' },
    ],
    content: {
      title: t('Growth & Circadian Signaling Set', 'Set de señalización de crecimiento y circadiana'),
      tagline: t('Compare growth-axis formats alongside a circadian research entry.', 'Compara formatos del eje de crecimiento junto con una entrada de investigación circadiana.'),
      description: t('A three-product set for reviewing direct growth-hormone, secretagogue, and sleep-linked research contexts as separate records.', 'Un set de tres productos para revisar contextos de hormona de crecimiento, secretagogos y señalización vinculada al sueño como registros separados.'),
      objective: t('For qualified teams planning a controlled comparison of three distinct hormone-category research entries, not a combined-use regimen.', 'Para equipos calificados que planean una comparación controlada de tres entradas distintas de investigación hormonal, no un régimen de uso combinado.'),
      education: {
        en: ['HGH 191AA, CJC-1295 + Ipamorelin, and DSIP differ in identity, format, and research pathway; grouping does not imply equivalence.', 'Variant and price information comes directly from the live catalog, while use instructions remain outside this open research storefront.'],
        es: ['HGH 191AA, CJC-1295 + Ipamorelin y DSIP difieren en identidad, formato y vía de investigación; agruparlos no implica equivalencia.', 'La información de variantes y precios proviene directamente del catálogo, mientras que las instrucciones de uso quedan fuera de esta tienda de investigación abierta.'],
      },
    },
  },
]

export const protocolFaqs = {
  en: [
    { question: 'Is this a dosing or administration protocol?', answer: 'No. Encore protocols are curated catalog groupings for qualified laboratory planning. They do not provide human or animal dosing, timing, reconstitution, injection, administration, or treatment guidance.' },
    { question: 'Are the components combined in one vial?', answer: 'No, unless a named component is already sold as its own finished blend. Otherwise each listed component remains a separate product, SKU, variant, quantity, and batch record.' },
    { question: 'How is the protocol price calculated?', answer: 'The displayed subtotal is calculated from the current centralized catalog price for each selected variant and quantity. There is no hidden protocol price or assumed bundle discount.' },
    { question: 'Can I change an available strength?', answer: 'Yes. A variant selector appears for any component with more than one current catalog option. The subtotal and cart SKU update from that selection.' },
    { question: 'What documentation is available?', answer: 'On-file COAs are linked only where Encore has a reviewed record. Other lot, identity, handling, and availability records may be requested; documentation varies by product and batch.' },
    { question: 'How is fulfillment handled?', answer: 'Components are added to the existing cart as separate line items and follow current availability, destination, shipping, and checkout rules. A team member will contact you if an item needs review.' },
  ],
  es: [
    { question: '¿Es un protocolo de dosificación o administración?', answer: 'No. Los protocolos Encore son agrupaciones del catálogo para la planeación de laboratorios calificados. No ofrecen dosificación humana o animal, tiempos, reconstitución, inyección, administración ni orientación de tratamiento.' },
    { question: '¿Los componentes vienen combinados en un solo vial?', answer: 'No, salvo que un componente nombrado ya se venda como su propia mezcla terminada. Los demás componentes siguen siendo productos, SKUs, variantes, cantidades y registros de lote separados.' },
    { question: '¿Cómo se calcula el precio del protocolo?', answer: 'El subtotal mostrado se calcula con el precio actual del catálogo centralizado para cada variante y cantidad seleccionada. No existe un precio oculto ni un descuento de paquete supuesto.' },
    { question: '¿Puedo cambiar una concentración disponible?', answer: 'Sí. Aparece un selector para cada componente con más de una opción actual en el catálogo. El subtotal y el SKU del carrito se actualizan con esa selección.' },
    { question: '¿Qué documentación está disponible?', answer: 'Los COA archivados se enlazan solo cuando Encore tiene un registro revisado. Se pueden solicitar otros registros de lote, identidad, manejo y disponibilidad; la documentación varía por producto y lote.' },
    { question: '¿Cómo se gestiona el envío?', answer: 'Los componentes se agregan al carrito como líneas separadas y siguen las reglas actuales de disponibilidad, destino, envío y checkout. Un integrante del equipo se comunicará si algún producto requiere revisión.' },
  ],
} as const

export function getProtocolBySlug(slug: string) {
  return protocols.find((protocol) => protocol.slug === slug)
}

export function getLocalizedProtocol(protocol: ProtocolConfig, locale: Locale): LocalizedProtocol {
  return {
    ...protocol,
    tags: protocol.tags.map((tag) => tag[locale]),
    title: protocol.content.title[locale],
    tagline: protocol.content.tagline[locale],
    description: protocol.content.description[locale],
    objective: protocol.content.objective[locale],
    education: protocol.content.education[locale],
  }
}

export function resolveProtocolComponents(protocol: ProtocolConfig): ResolvedProtocolComponent[] {
  return protocol.components.map((component) => {
    const product = products.find((entry) => entry.slug === component.productSlug)
    if (!product) throw new Error(`Unknown protocol product: ${component.productSlug}`)
    const defaultVariant = product.variants.find((variant) => variant.label === component.defaultVariantLabel)
    if (!defaultVariant) throw new Error(`Unknown default variant ${component.defaultVariantLabel} for ${component.productSlug}`)
    return { config: component, product, defaultVariant }
  })
}

export function getProtocolsByCategory(categorySlug: ProtocolCategorySlug) {
  return protocols.filter((protocol) => protocol.categorySlug === categorySlug)
}

export function getRelatedProtocols(protocol: ProtocolConfig, limit = 4) {
  return protocols.filter((candidate) => candidate.categorySlug === protocol.categorySlug && candidate.slug !== protocol.slug).slice(0, limit)
}

export function getConfiguredProtocolSubtotal(protocol: ProtocolConfig, selectedVariants?: Record<string, string>) {
  return resolveProtocolComponents(protocol).reduce((sum, entry) => {
    const selected = entry.product.variants.find((variant) => variant.label === selectedVariants?.[entry.product.slug]) ?? entry.defaultVariant
    return sum + selected.price * entry.config.quantity
  }, 0)
}

export function getProtocolCategoryName(categorySlug: ProtocolCategorySlug, locale: Locale) {
  const area = researchAreas.find((entry) => entry.slug === categorySlug)
  if (!area) return categorySlug
  if (locale === 'en') return area.name
  return ({
    'metabolic-weight-management': 'Metabolismo y control de peso',
    'recovery-regeneration': 'Recuperación y regeneración',
    'longevity-cellular-health': 'Longevidad y salud celular',
    'cognitive-performance': 'Investigación cognitiva',
    'hormone-wellness': 'Hormonas y bienestar',
  } as Record<ProtocolCategorySlug, string>)[categorySlug]
}

function validateProtocols() {
  const slugs = new Set<string>()
  for (const protocol of protocols) {
    if (!protocol.slug || slugs.has(protocol.slug)) throw new Error(`Invalid or duplicate protocol slug: ${protocol.slug}`)
    slugs.add(protocol.slug)
    if (!protocolCategorySlugs.includes(protocol.categorySlug)) throw new Error(`Invalid protocol category: ${protocol.categorySlug}`)
    if (protocol.components.length < 2) throw new Error(`Protocol must contain at least two products: ${protocol.slug}`)
    resolveProtocolComponents(protocol)
  }
  if (protocolFaqs.en.length < 4 || protocolFaqs.en.length > 6 || protocolFaqs.es.length !== protocolFaqs.en.length) {
    throw new Error('Protocols require four to six matching bilingual FAQs')
  }
  for (const categorySlug of protocolCategorySlugs) {
    if (!protocols.some((protocol) => protocol.categorySlug === categorySlug)) throw new Error(`Protocol category is empty: ${categorySlug}`)
  }
}

validateProtocols()
