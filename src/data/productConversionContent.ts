import {
  isRemainingConversionProductSlug,
  productConversionProfiles,
  type ProductConversionProfile,
  type ProductConversionProfileLocale,
  type RemainingConversionProductSlug,
} from './productConversionProfiles'
import { getProductTrendContent, type ProductTrendContent } from './productTrendContent'

export type PilotProductSlug = 'retatrutide' | 'wolverine-stack' | 'nad-plus'

export type ProductVisualVariant = 'metabolic' | 'recovery' | 'longevity' | 'cognitive' | 'hormone' | 'accessory'

export type EvidenceTone = 'human-trials' | 'preclinical' | 'early-human'

export type ProductEvidenceRow = {
  label: string
  body: string
}

export type ProductEvidenceSource = {
  label: string
  href: string
}

export type ProductInterestCard = {
  question: string
  answer: string
}

export type ProductConversionLocaleContent = {
  metadata: {
    title: string
    description: string
  }
  hero: {
    eyebrow: string
    headline: string
    support: string
    evidenceLabel: string
    evidenceTooltip: string
    strengthsLabel: string
    startingAtLabel: string
    primaryCta: string
    secondaryCta: string
    researchUseOnly: string
  }
  purchase: {
    eyebrow: string
    heading: string
    body: string
  }
  trustItems: string[]
  interests: {
    eyebrow: string
    heading: string
    body: string
    socialContext: string
    cards: ProductInterestCard[]
  }
  trends?: ProductTrendContent
  evidence: {
    eyebrow: string
    heading: string
    levelLabel: string
    summary: string
    rows: ProductEvidenceRow[]
    caveat: string
    technicalSummaryLabel: string
    technicalSummary: string[]
    sourcesLabel: string
    sources: ProductEvidenceSource[]
  }
  kit: {
    eyebrow: string
    heading: string
    body: string
  }
  overview: {
    eyebrow: string
    heading: string
    paragraphs: string[]
  }
  formats: {
    eyebrow: string
    heading: string
    body: string
    strengthLabel: string
    vialLabel: string
    kitLabel: string
    kitUnavailableLabel: string
  }
  documentation: {
    eyebrow: string
    heading: string
    body: string
  }
  faq: {
    eyebrow: string
    heading: string
    items: Array<{ question: string; answer: string }>
  }
  finalCta: {
    eyebrow: string
    heading: string
    body: string
    primaryCta: string
    secondaryCta: string
  }
}

export type ProductConversionContent = {
  visualVariant: ProductVisualVariant
  accent: string
  evidenceTone: EvidenceTone
  locales: Record<'en' | 'es', ProductConversionLocaleContent>
}

export const productConversionContent: Record<PilotProductSlug, ProductConversionContent> = {
  retatrutide: {
    visualVariant: 'metabolic',
    accent: '#28e0c1',
    evidenceTone: 'human-trials',
    locales: {
      en: {
        metadata: {
          title: 'Retatrutide Research Product | Encore Bio Labs',
          description: 'Review Retatrutide strengths, transparent pricing, purchase formats, and a plainly labeled snapshot of the public investigational evidence.',
        },
        hero: {
          eyebrow: 'Metabolic pathway research',
          headline: 'Three metabolic pathways. One advanced research molecule.',
          support: 'An investigational triple-agonist studied across GLP-1, GIP, and glucagon pathways, available in five clearly priced research strengths.',
          evidenceLabel: 'Advanced human trials',
          evidenceTooltip: 'This rating describes published research on the molecule or related regulated pharmaceutical material. It does not establish outcomes for Encore Research Use Only material.',
          strengthsLabel: 'Available strengths',
          startingAtLabel: 'Starting at',
          primaryCta: 'Choose Your Option',
          secondaryCta: 'View the evidence',
          researchUseOnly: 'For research use only. Not for human or animal consumption.',
        },
        purchase: {
          eyebrow: 'Configure your order',
          heading: 'Choose a strength, then choose your format.',
          body: 'Review the exact vial price, Complete Kit total, inventory status, and order total before adding anything to your cart.',
        },
        trustItems: ['Product-specific documentation', 'Strength and price shown together', 'Complete Kit available', 'Human support when you need it'],
        interests: {
          eyebrow: 'Why researchers look for it',
          heading: 'Common questions, translated into responsible research context.',
          body: 'Public interest often begins with appetite, cravings, portions, and metabolic outcomes. These cards separate those questions from what the evidence can actually establish.',
          socialContext: 'Interest is high across search and social channels; popularity is not evidence and is not presented here as proof.',
          cards: [
            { question: 'How are appetite pathways studied?', answer: 'Retatrutide activates GLP-1, GIP, and glucagon receptors in the regulated investigational material studied in clinical trials.' },
            { question: 'Why is body composition part of the conversation?', answer: 'Phase 2 and phase 3 programs measured weight and metabolic endpoints, but those results cannot be assigned to an Encore vial.' },
            { question: 'What makes this molecule distinct?', answer: 'Its public research program evaluates one molecule across three connected appetite and energy-regulation pathways.' },
          ],
        },
        evidence: {
          eyebrow: 'Evidence snapshot',
          heading: 'Strong human evidence for an investigational drug; not approved.',
          levelLabel: 'Advanced human trials',
          summary: 'Retatrutide has a substantial human clinical-trial program as an investigational medicine. That evidence supports studying the molecule; it does not validate the identity, quality, or outcomes of an Encore Bio Labs research vial.',
          rows: [
            { label: 'Human evidence', body: 'Randomized phase 2 studies and a phase 3 development program report weight and metabolic endpoints for regulated investigational retatrutide.' },
            { label: 'Preclinical evidence', body: 'Receptor, cellular, and animal models help explain the proposed triple-agonist mechanism.' },
            { label: 'Still unknown', body: 'Long-term generalizability, real-world outcomes, and results from non-trial material remain uncertain.' },
            { label: 'Product caveat', body: 'Published trial results do not establish equivalence to, or outcomes from, an Encore Bio Labs vial.' },
          ],
          caveat: 'Retatrutide remains investigational and is not approved for consumer or clinical use.',
          technicalSummaryLabel: 'Technical detail',
          technicalSummary: [
            'The public program evaluates concurrent GLP-1, GIP, and glucagon receptor agonism.',
            'Phase 2 obesity research reported substantial average weight changes under controlled trial conditions.',
            'Company-reported phase 3 topline findings should be read alongside peer-reviewed publications and regulatory review as they become available.',
          ],
          sourcesLabel: 'Primary sources',
          sources: [
            { label: 'NEJM phase 2 trial', href: 'https://www.nejm.org/doi/full/10.1056/NEJMoa2301972' },
            { label: 'Lilly phase 3 program update', href: 'https://investor.lilly.com/news-releases/news-release-details/lillys-triple-agonist-retatrutide-successful-two-additional' },
          ],
        },
        kit: {
          eyebrow: 'Complete Kit value',
          heading: 'One organized research format, with the supporting supplies shown upfront.',
          body: 'Everything needed for an organized laboratory workflow, matched to the selected product and packed together. The exact Retatrutide total updates in the purchase configurator.',
        },
        overview: {
          eyebrow: 'Research overview',
          heading: 'A triple-agonist research program with a clearly defined evidence boundary.',
          paragraphs: [
            'Retatrutide is a synthetic molecule designed to activate GLP-1, GIP, and glucagon receptors. Public clinical research has examined appetite regulation, energy balance, weight, and related metabolic markers.',
            'The strongest claims belong to the regulated investigational product used in those trials. Encore presents its vial as research material only and does not claim that it produced the published clinical outcomes.',
          ],
        },
        formats: {
          eyebrow: 'Available formats',
          heading: 'Five strengths, one transparent pricing structure.',
          body: 'Every price below comes from the same canonical product data used by the configurator and cart.',
          strengthLabel: 'Strength',
          vialLabel: 'Vial only',
          kitLabel: 'Complete Kit',
          kitUnavailableLabel: 'Not available',
        },
        documentation: {
          eyebrow: 'Documentation and trust',
          heading: 'Review product information before you configure an order.',
          body: 'Encore keeps product documentation, quality information, and batch-information requests connected to the same research-use-only standard.',
        },
        faq: {
          eyebrow: 'Retatrutide FAQ',
          heading: 'Focused answers before you choose a format.',
          items: [
            { question: 'Is Retatrutide approved for clinical use?', answer: 'No. Retatrutide remains an investigational drug. Encore Bio Labs products are sold for research use only and are not for human or animal consumption.' },
            { question: 'Do the published trials prove an Encore vial will produce the same results?', answer: 'No. The trials studied regulated investigational material and do not validate the identity, quality, or performance of an Encore Bio Labs vial.' },
            { question: 'What is the difference between Vial Only and Complete Kit?', answer: 'Vial Only includes the selected research vial. Complete Kit adds the applicable preparation supplies shown in the kit section and configurator.' },
            { question: 'Where do the displayed prices come from?', answer: 'The hero, format table, configurator, cart, and checkout all derive pricing from the same canonical product record.' },
          ],
        },
        finalCta: {
          eyebrow: 'Ready to configure Retatrutide?',
          heading: 'Choose the research strength and format that fits your plan.',
          body: 'Review the evidence boundary, then confirm the exact total in the purchase configurator.',
          primaryCta: 'Choose strength and format',
          secondaryCta: 'Ask a product question',
        },
      },
      es: {
        metadata: {
          title: 'Producto de investigación Retatrutide | Encore Bio Labs',
          description: 'Revisa concentraciones, precios transparentes, formatos de compra y un resumen claramente identificado de la evidencia pública de Retatrutide.',
        },
        hero: {
          eyebrow: 'Investigación de vías metabólicas',
          headline: 'Tres vías metabólicas. Una molécula avanzada de investigación.',
          support: 'Un triple agonista en investigación estudiado en las vías GLP-1, GIP y glucagón, disponible en cinco concentraciones de investigación con precios claros.',
          evidenceLabel: 'Ensayos avanzados en humanos',
          evidenceTooltip: 'Esta clasificación describe la investigación publicada sobre la molécula o material farmacéutico regulado relacionado. No establece resultados para el material de Encore destinado solo a investigación.',
          strengthsLabel: 'Concentraciones disponibles',
          startingAtLabel: 'Desde',
          primaryCta: 'Elige tu opción',
          secondaryCta: 'Ver la evidencia',
          researchUseOnly: 'Solo para uso en investigación. No apto para consumo humano ni animal.',
        },
        purchase: {
          eyebrow: 'Configura tu pedido',
          heading: 'Elige una concentración y después el formato.',
          body: 'Revisa el precio exacto del vial, el total del Kit Completo, el estado de inventario y el total del pedido antes de agregarlo al carrito.',
        },
        trustItems: ['Documentación específica del producto', 'Concentración y precio juntos', 'Kit Completo disponible', 'Soporte humano cuando lo necesites'],
        interests: {
          eyebrow: 'Por qué lo buscan los investigadores',
          heading: 'Preguntas comunes, traducidas a un contexto de investigación responsable.',
          body: 'El interés público suele empezar con apetito, antojos, porciones y resultados metabólicos. Estas tarjetas separan esas preguntas de lo que la evidencia realmente puede establecer.',
          socialContext: 'Existe alto interés en búsquedas y redes sociales; la popularidad no es evidencia y aquí no se presenta como prueba.',
          cards: [
            { question: '¿Cómo se estudian las vías del apetito?', answer: 'Retatrutide activa los receptores GLP-1, GIP y glucagón en el material en investigación regulado que se estudia en ensayos clínicos.' },
            { question: '¿Por qué se habla de composición corporal?', answer: 'Los programas de fase 2 y fase 3 midieron peso y variables metabólicas, pero esos resultados no pueden atribuirse a un vial de Encore.' },
            { question: '¿Qué distingue a esta molécula?', answer: 'Su programa público de investigación evalúa una sola molécula en tres vías conectadas de apetito y regulación energética.' },
          ],
        },
        evidence: {
          eyebrow: 'Resumen de evidencia',
          heading: 'Evidencia sólida en humanos para un fármaco en investigación; no aprobado.',
          levelLabel: 'Ensayos avanzados en humanos',
          summary: 'Retatrutide cuenta con un programa importante de ensayos clínicos en humanos como medicamento en investigación. Esa evidencia respalda el estudio de la molécula; no valida la identidad, calidad ni los resultados de un vial de investigación de Encore Bio Labs.',
          rows: [
            { label: 'Evidencia en humanos', body: 'Estudios aleatorizados de fase 2 y un programa de fase 3 reportan variables de peso y metabolismo con Retatrutide regulado en investigación.' },
            { label: 'Evidencia preclínica', body: 'Los modelos de receptores, células y animales ayudan a explicar el mecanismo propuesto de triple agonismo.' },
            { label: 'Aún se desconoce', body: 'La generalización a largo plazo, los resultados del mundo real y los resultados con material ajeno a los ensayos siguen siendo inciertos.' },
            { label: 'Límite del producto', body: 'Los resultados publicados no establecen equivalencia ni resultados de un vial de Encore Bio Labs.' },
          ],
          caveat: 'Retatrutide sigue en investigación y no está aprobado para uso clínico ni de consumo.',
          technicalSummaryLabel: 'Detalle técnico',
          technicalSummary: [
            'El programa público evalúa el agonismo simultáneo de los receptores GLP-1, GIP y glucagón.',
            'La investigación de fase 2 en obesidad reportó cambios promedio sustanciales de peso bajo condiciones controladas.',
            'Los resultados principales de fase 3 comunicados por la compañía deben leerse junto con publicaciones revisadas por pares y la evaluación regulatoria a medida que estén disponibles.',
          ],
          sourcesLabel: 'Fuentes primarias',
          sources: [
            { label: 'Ensayo de fase 2 en NEJM', href: 'https://www.nejm.org/doi/full/10.1056/NEJMoa2301972' },
            { label: 'Actualización del programa fase 3 de Lilly', href: 'https://investor.lilly.com/news-releases/news-release-details/lillys-triple-agonist-retatrutide-successful-two-additional' },
          ],
        },
        kit: {
          eyebrow: 'Valor del Kit Completo',
          heading: 'Un formato de investigación organizado, con los suministros de apoyo mostrados desde el inicio.',
          body: 'Todo lo necesario para un flujo de laboratorio organizado, adaptado al producto seleccionado y empacado en conjunto. El total exacto de Retatrutide se actualiza en el configurador.',
        },
        overview: {
          eyebrow: 'Resumen de investigación',
          heading: 'Un programa de triple agonismo con un límite de evidencia claramente definido.',
          paragraphs: [
            'Retatrutide es una molécula sintética diseñada para activar los receptores GLP-1, GIP y glucagón. La investigación clínica pública ha examinado regulación del apetito, balance energético, peso y marcadores metabólicos relacionados.',
            'Las afirmaciones más sólidas pertenecen al producto regulado en investigación usado en esos ensayos. Encore presenta su vial solo como material de investigación y no afirma haber producido los resultados clínicos publicados.',
          ],
        },
        formats: {
          eyebrow: 'Formatos disponibles',
          heading: 'Cinco concentraciones, una estructura de precios transparente.',
          body: 'Cada precio proviene de los mismos datos canónicos utilizados por el configurador y el carrito.',
          strengthLabel: 'Concentración',
          vialLabel: 'Solo vial',
          kitLabel: 'Kit Completo',
          kitUnavailableLabel: 'No disponible',
        },
        documentation: {
          eyebrow: 'Documentación y confianza',
          heading: 'Revisa la información del producto antes de configurar un pedido.',
          body: 'Encore conecta la documentación del producto, la información de calidad y las solicitudes de información de lote al mismo estándar de uso exclusivo en investigación.',
        },
        faq: {
          eyebrow: 'Preguntas sobre Retatrutide',
          heading: 'Respuestas concretas antes de elegir un formato.',
          items: [
            { question: '¿Retatrutide está aprobado para uso clínico?', answer: 'No. Retatrutide sigue siendo un fármaco en investigación. Los productos de Encore Bio Labs se venden solo para investigación y no son para consumo humano ni animal.' },
            { question: '¿Los ensayos publicados prueban que un vial de Encore producirá los mismos resultados?', answer: 'No. Los ensayos estudiaron material regulado en investigación y no validan la identidad, calidad ni rendimiento de un vial de Encore Bio Labs.' },
            { question: '¿Cuál es la diferencia entre Solo vial y Kit Completo?', answer: 'Solo vial incluye el vial de investigación seleccionado. Kit Completo agrega los suministros de preparación aplicables que se muestran en la sección del kit y el configurador.' },
            { question: '¿De dónde provienen los precios mostrados?', answer: 'El encabezado, la tabla de formatos, el configurador, el carrito y el pago obtienen los precios del mismo registro canónico del producto.' },
          ],
        },
        finalCta: {
          eyebrow: '¿Listo para configurar Retatrutide?',
          heading: 'Elige la concentración y el formato de investigación que se adapten a tu plan.',
          body: 'Revisa el límite de la evidencia y confirma el total exacto en el configurador de compra.',
          primaryCta: 'Elegir concentración y formato',
          secondaryCta: 'Hacer una pregunta del producto',
        },
      },
    },
  },
  'wolverine-stack': {
    visualVariant: 'recovery',
    accent: '#42d6a4',
    evidenceTone: 'preclinical',
    locales: {
      en: {
        metadata: {
          title: 'Wolverine Stack Research Product | Encore Bio Labs',
          description: 'Review the Wolverine Stack format, transparent pricing, and the separate evidence boundaries for BPC-157 and TB-500 research.',
        },
        hero: {
          eyebrow: 'Recovery and regeneration research',
          headline: 'Two recovery research paths, organized in one complete format.',
          support: 'BPC-157 and TB-500 remain separate evidence streams. This stack is built for organized laboratory comparison, not a promised clinical outcome.',
          evidenceLabel: 'Combination not clinically studied',
          evidenceTooltip: 'This rating describes published research on the molecule or related regulated pharmaceutical material. It does not establish outcomes for Encore Research Use Only material.',
          strengthsLabel: 'Available format',
          startingAtLabel: 'Starting at',
          primaryCta: 'Choose Your Option',
          secondaryCta: 'View the evidence',
          researchUseOnly: 'For research use only. Not for human or animal consumption.',
        },
        purchase: {
          eyebrow: 'Configure your order',
          heading: 'Choose Vial Only or the Encore Complete Kit.',
          body: 'The selected format, inventory status, exact price, and kit contents remain visible before you add the stack to your cart.',
        },
        trustItems: ['Product-specific documentation', 'Format and price shown together', 'Complete Kit available', 'Human support when you need it'],
        interests: {
          eyebrow: 'Why researchers look for it',
          heading: 'Recovery interest is real. The evidence needs careful separation.',
          body: 'Researchers often search for repair, connective-tissue, and recovery themes. The responsible question is what each component has actually been studied for—not what a popular stack name implies.',
          socialContext: 'The “Wolverine” name is common in search and social discussion; it is a catalog label, not clinical evidence.',
          cards: [
            { question: 'Why are these compounds discussed together?', answer: 'Both appear in recovery-focused research conversations, but the exact BPC-157 plus TB-500 combination has not been established in human clinical studies.' },
            { question: 'What does BPC-157 research examine?', answer: 'Published work is dominated by animal injury and tissue-response models, with extremely limited human evidence.' },
            { question: 'What does TB-500 research examine?', answer: 'Public discussion draws from thymosin-beta-4 biology and preclinical models; FDA reviewers reported no human TB-500 studies in the reviewed record.' },
          ],
        },
        evidence: {
          eyebrow: 'Evidence snapshot',
          heading: 'Mostly lab or animal evidence; the combination has not been studied clinically.',
          levelLabel: 'Combination not clinically studied',
          summary: 'BPC-157 and TB-500 each have a distinct, largely preclinical evidence base. Evidence for one component cannot be transferred to the other, and neither stream establishes outcomes for the combined Encore format.',
          rows: [
            { label: 'Human evidence', body: 'Direct human evidence is extremely limited for BPC-157, and the FDA review identified no human TB-500 studies in the material evaluated.' },
            { label: 'Preclinical evidence', body: 'Animal, cellular, and mechanistic work explores tissue response, angiogenesis, cell migration, and related pathways.' },
            { label: 'Still unknown', body: 'Clinical effectiveness, safety, dosing, interaction, and any synergy of the exact combination remain unestablished.' },
            { label: 'Product caveat', body: 'The combined research format organizes two compounds; it does not make the combination clinically validated.' },
          ],
          caveat: 'Do not interpret “recovery stack” as a claim that this product heals injuries or accelerates recovery.',
          technicalSummaryLabel: 'Technical detail',
          technicalSummary: [
            'BPC-157 literature is concentrated in animal injury and tissue-response models.',
            'TB-500 should not be treated as interchangeable with every finding involving full-length thymosin beta-4.',
            'No adequate human evidence establishes the safety or effectiveness of the exact BPC-157 plus TB-500 combination.',
          ],
          sourcesLabel: 'Evidence reviews',
          sources: [
            { label: 'FDA evidence review', href: 'https://www.fda.gov/media/193343/download' },
            { label: 'BPC-157 systematic review', href: 'https://pubmed.ncbi.nlm.nih.gov/40789979/' },
          ],
        },
        kit: {
          eyebrow: 'Complete Kit value',
          heading: 'Keep a two-component research format and its supporting supplies organized.',
          body: 'Everything needed for an organized laboratory workflow, matched to the selected product and packed together. The kit does not change the evidence level of either component or the combination.',
        },
        overview: {
          eyebrow: 'Research overview',
          heading: 'Two separate evidence streams, presented without collapsing them into one claim.',
          paragraphs: [
            'Wolverine Stack combines BPC-157 and TB-500 in one catalog format for laboratory planning around two recovery-adjacent research paths.',
            'Most public support is preclinical. Encore does not claim that the combination heals tissue, speeds recovery, or reproduces a result from either component’s separate literature.',
          ],
        },
        formats: {
          eyebrow: 'Available formats',
          heading: 'One product record with two clearly priced purchase formats.',
          body: 'Vial Only and Complete Kit totals are calculated from the same canonical product record.',
          strengthLabel: 'Format',
          vialLabel: 'Vial only',
          kitLabel: 'Complete Kit',
          kitUnavailableLabel: 'Not available',
        },
        documentation: {
          eyebrow: 'Documentation and trust',
          heading: 'Keep product identity, format, and evidence boundaries together.',
          body: 'Product documentation and batch-information requests support laboratory review without turning preclinical findings into clinical promises.',
        },
        faq: {
          eyebrow: 'Wolverine Stack FAQ',
          heading: 'Focused answers about the combined format.',
          items: [
            { question: 'Has the BPC-157 plus TB-500 combination been studied in human trials?', answer: 'Adequate human clinical evidence for the exact combination was not identified in the completed evidence review.' },
            { question: 'Does “Wolverine Stack” mean the product heals injuries?', answer: 'No. It is a catalog name for a two-component research format, not a clinical healing or recovery claim.' },
            { question: 'Can evidence for BPC-157 be applied to TB-500?', answer: 'No. They are different research materials with separate literature. Evidence should be evaluated component by component.' },
            { question: 'What changes with the Complete Kit?', answer: 'The kit adds the listed preparation supplies and packaging. It does not change the product’s evidence classification.' },
          ],
        },
        finalCta: {
          eyebrow: 'Ready to configure Wolverine Stack?',
          heading: 'Choose the format that keeps your research plan organized.',
          body: 'Review the separate evidence streams, then confirm Vial Only or Complete Kit pricing.',
          primaryCta: 'Choose purchase format',
          secondaryCta: 'Ask a product question',
        },
      },
      es: {
        metadata: {
          title: 'Producto de investigación Wolverine Stack | Encore Bio Labs',
          description: 'Revisa el formato Wolverine Stack, precios transparentes y los límites separados de evidencia para BPC-157 y TB-500.',
        },
        hero: {
          eyebrow: 'Investigación de recuperación y regeneración',
          headline: 'Dos vías de investigación de recuperación, organizadas en un formato completo.',
          support: 'BPC-157 y TB-500 mantienen bases de evidencia separadas. Este stack organiza la comparación de laboratorio; no promete un resultado clínico.',
          evidenceLabel: 'Combinación sin estudios clínicos',
          evidenceTooltip: 'Esta clasificación describe la investigación publicada sobre la molécula o material farmacéutico regulado relacionado. No establece resultados para el material de Encore destinado solo a investigación.',
          strengthsLabel: 'Formato disponible',
          startingAtLabel: 'Desde',
          primaryCta: 'Elige tu opción',
          secondaryCta: 'Ver la evidencia',
          researchUseOnly: 'Solo para uso en investigación. No apto para consumo humano ni animal.',
        },
        purchase: {
          eyebrow: 'Configura tu pedido',
          heading: 'Elige Solo vial o el Kit Completo de Encore.',
          body: 'El formato seleccionado, el inventario, el precio exacto y el contenido del kit permanecen visibles antes de agregarlo al carrito.',
        },
        trustItems: ['Documentación específica del producto', 'Formato y precio juntos', 'Kit Completo disponible', 'Soporte humano cuando lo necesites'],
        interests: {
          eyebrow: 'Por qué lo buscan los investigadores',
          heading: 'El interés en recuperación es real. La evidencia debe mantenerse separada.',
          body: 'Los investigadores suelen buscar temas de reparación, tejido conectivo y recuperación. La pregunta responsable es qué se ha estudiado realmente de cada componente, no lo que implica un nombre popular.',
          socialContext: 'El nombre “Wolverine” es común en búsquedas y conversaciones sociales; es una etiqueta de catálogo, no evidencia clínica.',
          cards: [
            { question: '¿Por qué se comentan juntos estos compuestos?', answer: 'Ambos aparecen en conversaciones de investigación sobre recuperación, pero la combinación exacta BPC-157 más TB-500 no se ha establecido en estudios clínicos en humanos.' },
            { question: '¿Qué examina la investigación de BPC-157?', answer: 'La literatura publicada está dominada por modelos animales de lesión y respuesta tisular, con evidencia en humanos extremadamente limitada.' },
            { question: '¿Qué examina la investigación de TB-500?', answer: 'La conversación pública parte de la biología de thymosin-beta-4 y modelos preclínicos; los revisores de la FDA no reportaron estudios en humanos de TB-500 en el registro revisado.' },
          ],
        },
        evidence: {
          eyebrow: 'Resumen de evidencia',
          heading: 'Principalmente evidencia de laboratorio o animal; la combinación no se ha estudiado clínicamente.',
          levelLabel: 'Combinación sin estudios clínicos',
          summary: 'BPC-157 y TB-500 tienen bases de evidencia distintas y en gran medida preclínicas. La evidencia de un componente no puede transferirse al otro, y ninguna establece resultados para el formato combinado de Encore.',
          rows: [
            { label: 'Evidencia en humanos', body: 'La evidencia directa en humanos es extremadamente limitada para BPC-157, y la revisión de la FDA no identificó estudios en humanos de TB-500 en el material evaluado.' },
            { label: 'Evidencia preclínica', body: 'Trabajos animales, celulares y mecanísticos exploran respuesta tisular, angiogénesis, migración celular y vías relacionadas.' },
            { label: 'Aún se desconoce', body: 'La eficacia clínica, seguridad, dosificación, interacción y posible sinergia de la combinación exacta no se han establecido.' },
            { label: 'Límite del producto', body: 'El formato combinado organiza dos compuestos; no convierte la combinación en clínicamente validada.' },
          ],
          caveat: 'No interpretes “stack de recuperación” como una afirmación de que este producto cura lesiones o acelera la recuperación.',
          technicalSummaryLabel: 'Detalle técnico',
          technicalSummary: [
            'La literatura sobre BPC-157 se concentra en modelos animales de lesión y respuesta tisular.',
            'TB-500 no debe tratarse como intercambiable con cada hallazgo sobre thymosin beta-4 de longitud completa.',
            'No existe evidencia humana adecuada que establezca la seguridad o eficacia de la combinación exacta BPC-157 más TB-500.',
          ],
          sourcesLabel: 'Revisiones de evidencia',
          sources: [
            { label: 'Revisión de evidencia de la FDA', href: 'https://www.fda.gov/media/193343/download' },
            { label: 'Revisión sistemática de BPC-157', href: 'https://pubmed.ncbi.nlm.nih.gov/40789979/' },
          ],
        },
        kit: {
          eyebrow: 'Valor del Kit Completo',
          heading: 'Mantén organizados un formato de investigación de dos componentes y sus suministros de apoyo.',
          body: 'Todo lo necesario para un flujo de laboratorio organizado, adaptado al producto seleccionado y empacado en conjunto. El kit no cambia el nivel de evidencia de ninguno de los componentes ni de la combinación.',
        },
        overview: {
          eyebrow: 'Resumen de investigación',
          heading: 'Dos bases de evidencia separadas, sin convertirlas en una sola afirmación.',
          paragraphs: [
            'Wolverine Stack combina BPC-157 y TB-500 en un formato de catálogo para planificar trabajo de laboratorio alrededor de dos vías de investigación relacionadas con recuperación.',
            'La mayor parte del respaldo público es preclínico. Encore no afirma que la combinación cure tejido, acelere la recuperación ni reproduzca un resultado de la literatura separada de cada componente.',
          ],
        },
        formats: {
          eyebrow: 'Formatos disponibles',
          heading: 'Un registro de producto con dos formatos de compra y precios claros.',
          body: 'Los totales de Solo vial y Kit Completo se calculan desde el mismo registro canónico del producto.',
          strengthLabel: 'Formato',
          vialLabel: 'Solo vial',
          kitLabel: 'Kit Completo',
          kitUnavailableLabel: 'No disponible',
        },
        documentation: {
          eyebrow: 'Documentación y confianza',
          heading: 'Mantén juntos la identidad, el formato y los límites de evidencia.',
          body: 'La documentación del producto y las solicitudes de información de lote apoyan la revisión de laboratorio sin convertir hallazgos preclínicos en promesas clínicas.',
        },
        faq: {
          eyebrow: 'Preguntas sobre Wolverine Stack',
          heading: 'Respuestas concretas sobre el formato combinado.',
          items: [
            { question: '¿La combinación BPC-157 más TB-500 se ha estudiado en ensayos humanos?', answer: 'La revisión de evidencia completada no identificó evidencia clínica adecuada en humanos para la combinación exacta.' },
            { question: '¿“Wolverine Stack” significa que el producto cura lesiones?', answer: 'No. Es un nombre de catálogo para un formato de investigación de dos componentes, no una afirmación clínica de curación o recuperación.' },
            { question: '¿Se puede aplicar la evidencia de BPC-157 a TB-500?', answer: 'No. Son materiales de investigación diferentes con literatura separada. La evidencia debe evaluarse componente por componente.' },
            { question: '¿Qué cambia con el Kit Completo?', answer: 'El kit agrega los suministros de preparación y empaque indicados. No cambia la clasificación de evidencia del producto.' },
          ],
        },
        finalCta: {
          eyebrow: '¿Listo para configurar Wolverine Stack?',
          heading: 'Elige el formato que mantenga organizado tu plan de investigación.',
          body: 'Revisa las bases de evidencia separadas y después confirma el precio de Solo vial o Kit Completo.',
          primaryCta: 'Elegir formato de compra',
          secondaryCta: 'Hacer una pregunta del producto',
        },
      },
    },
  },
  'nad-plus': {
    visualVariant: 'longevity',
    accent: '#67e8f9',
    evidenceTone: 'early-human',
    locales: {
      en: {
        metadata: {
          title: 'NAD+ Research Product | Encore Bio Labs',
          description: 'Review NAD+ strengths, transparent pricing, cellular research context, and the limits of direct human outcome evidence.',
        },
        hero: {
          eyebrow: 'Longevity and cellular research',
          headline: 'Study one of the cell’s most important energy-transfer systems.',
          support: 'A central cofactor for redox balance, energy transfer, and stress-response research, offered in 500 mg and 1000 mg formats with transparent pricing.',
          evidenceLabel: 'Early human research',
          evidenceTooltip: 'This rating describes published research on the molecule or related regulated pharmaceutical material. It does not establish outcomes for Encore Research Use Only material.',
          strengthsLabel: 'Available strengths',
          startingAtLabel: 'Starting at',
          primaryCta: 'Choose Your Option',
          secondaryCta: 'View the evidence',
          researchUseOnly: 'For research use only. Not for human or animal consumption.',
        },
        purchase: {
          eyebrow: 'Configure your order',
          heading: 'Choose 500 mg or 1000 mg, then choose your format.',
          body: 'Strength, Vial Only price, Complete Kit total, inventory status, and order total stay visible in one configurator.',
        },
        trustItems: ['Product-specific documentation', 'Strength and price shown together', 'Complete Kit available', 'Human support when you need it'],
        interests: {
          eyebrow: 'The NAD+ research story',
          heading: 'Why NAD+ gets so much attention.',
          body: 'NAD+ sits inside some of the cell’s most important systems. Researchers follow it to understand three big questions—in language anyone can follow.',
          socialContext: 'These are important research areas, not guaranteed personal benefits. Evidence about NAD precursors or other delivery routes does not automatically apply to an Encore NAD+ vial.',
          cards: [
            { question: 'How cells make energy', answer: 'NAD+ helps cells move energy from one process to another. Researchers study that essential job—but it does not prove that added NAD+ makes a person feel more energetic.' },
            { question: 'How cells handle stress', answer: 'NAD-dependent enzymes take part in stress-response and DNA-repair systems. Research maps how those systems work rather than promising personal repair.' },
            { question: 'What changes as cells age', answer: 'NAD biology shifts across many aging models. That makes it an important research target, not proof of an anti-aging effect.' },
          ],
        },
        evidence: {
          eyebrow: 'Evidence snapshot',
          heading: 'Strong basic biology; weak direct-vial human outcome evidence.',
          levelLabel: 'Early human research',
          summary: 'NAD+ is essential to cellular biology. Direct human research on administered NAD+ is sparse, and a 2026 systematic review found no eligible outcome trials of IV or IM NAD itself for anti-aging or wellness indications.',
          rows: [
            { label: 'Human evidence', body: 'A small pilot informs tolerability, while direct outcome evidence for administered NAD+ remains insufficient.' },
            { label: 'Preclinical evidence', body: 'Cellular and animal research strongly supports NAD’s roles in redox balance, metabolism, signaling, and stress response.' },
            { label: 'Still unknown', body: 'Whether a direct NAD+ vial improves energy, cognition, recovery, or longevity outcomes in humans is not established.' },
            { label: 'Product caveat', body: 'Evidence involving oral NAD precursors or other routes cannot automatically be applied to an Encore NAD+ vial.' },
          ],
          caveat: 'Essential biology is not the same as demonstrated benefit from adding a research material.',
          technicalSummaryLabel: 'Technical detail',
          technicalSummary: [
            'NAD+/NADH couples are central to oxidation-reduction reactions and cellular energy transfer.',
            'NAD is also consumed by enzyme families involved in signaling and DNA-repair biology.',
            'Human findings involving precursors may change biomarkers, but reported functional benefits are inconsistent and route-specific.',
          ],
          sourcesLabel: 'Evidence reviews',
          sources: [
            { label: '2026 systematic review', href: 'https://pubmed.ncbi.nlm.nih.gov/41655607/' },
            { label: 'Direct NAD+ tolerability pilot', href: 'https://pubmed.ncbi.nlm.nih.gov/41704678/' },
          ],
        },
        kit: {
          eyebrow: 'Complete Kit value',
          heading: 'Choose the research strength and supporting format in one place.',
          body: 'Everything needed for an organized laboratory workflow, matched to the selected product and packed together. The configurator shows the exact NAD+ strength and total before checkout.',
        },
        overview: {
          eyebrow: 'Research overview',
          heading: 'A central cellular cofactor, presented without turning mechanism into a wellness promise.',
          paragraphs: [
            'NAD+ is a coenzyme used throughout cellular redox and energy-transfer processes. It also intersects with enzyme systems involved in signaling, stress response, and DNA-repair research.',
            'The molecular role is well established, while direct human outcome evidence for administered NAD+ remains limited. Encore therefore describes the research pathways without promising energy, anti-aging, cognitive, or recovery outcomes.',
          ],
        },
        formats: {
          eyebrow: 'Available formats',
          heading: 'Two strengths with vial and Complete Kit totals side by side.',
          body: 'The displayed totals derive from the same canonical NAD+ record used in the configurator and cart.',
          strengthLabel: 'Strength',
          vialLabel: 'Vial only',
          kitLabel: 'Complete Kit',
          kitUnavailableLabel: 'Not available',
        },
        documentation: {
          eyebrow: 'Documentation and trust',
          heading: 'Keep cellular context, product details, and handling questions connected.',
          body: 'Review quality information and request product-specific batch information before including NAD+ in a laboratory plan.',
        },
        faq: {
          eyebrow: 'NAD+ FAQ',
          heading: 'Focused answers about biology, evidence, and format.',
          items: [
            { question: 'Does NAD+ being essential to cells prove that adding it improves wellness?', answer: 'No. A molecule’s essential biological role does not establish a beneficial human outcome from administering additional NAD+.' },
            { question: 'Can research on NAD precursors be applied directly to NAD+ vials?', answer: 'Not automatically. The compounds, delivery routes, exposure, and measured outcomes differ and should be evaluated separately.' },
            { question: 'What direct human evidence exists?', answer: 'Direct administered-NAD+ evidence is limited. A small pilot informs tolerability, while robust outcome evidence remains insufficient.' },
            { question: 'How do the 500 mg and 1000 mg formats differ?', answer: 'They contain different labeled research strengths. Select either strength in the configurator to see its exact Vial Only and Complete Kit total.' },
          ],
        },
        finalCta: {
          eyebrow: 'Ready to configure NAD+?',
          heading: 'Choose a strength with the evidence boundary still in view.',
          body: 'Compare 500 mg and 1000 mg, then confirm Vial Only or Complete Kit pricing.',
          primaryCta: 'Choose strength and format',
          secondaryCta: 'Ask a product question',
        },
      },
      es: {
        metadata: {
          title: 'Producto de investigación NAD+ | Encore Bio Labs',
          description: 'Revisa concentraciones de NAD+, precios transparentes, contexto de investigación celular y los límites de la evidencia directa en humanos.',
        },
        hero: {
          eyebrow: 'Investigación de longevidad y salud celular',
          headline: 'Estudia uno de los sistemas más importantes de transferencia de energía celular.',
          support: 'Un cofactor central para investigar balance redox, transferencia de energía y respuesta al estrés, disponible en 500 mg y 1000 mg con precios transparentes.',
          evidenceLabel: 'Investigación temprana en humanos',
          evidenceTooltip: 'Esta clasificación describe la investigación publicada sobre la molécula o material farmacéutico regulado relacionado. No establece resultados para el material de Encore destinado solo a investigación.',
          strengthsLabel: 'Concentraciones disponibles',
          startingAtLabel: 'Desde',
          primaryCta: 'Elige tu opción',
          secondaryCta: 'Ver la evidencia',
          researchUseOnly: 'Solo para uso en investigación. No apto para consumo humano ni animal.',
        },
        purchase: {
          eyebrow: 'Configura tu pedido',
          heading: 'Elige 500 mg o 1000 mg y después el formato.',
          body: 'La concentración, el precio de Solo vial, el total del Kit Completo, el inventario y el total del pedido permanecen visibles en un solo configurador.',
        },
        trustItems: ['Documentación específica del producto', 'Concentración y precio juntos', 'Kit Completo disponible', 'Soporte humano cuando lo necesites'],
        interests: {
          eyebrow: 'La historia de investigación de NAD+',
          heading: 'Por qué NAD+ genera tanta atención.',
          body: 'NAD+ participa en algunos de los sistemas más importantes de la célula. Los investigadores lo siguen para entender tres grandes preguntas, explicadas de manera sencilla.',
          socialContext: 'Estas son áreas importantes de investigación, no beneficios personales garantizados. La evidencia sobre precursores de NAD u otras vías no se aplica automáticamente a un vial de NAD+ de Encore.',
          cards: [
            { question: 'Cómo producen energía las células', answer: 'NAD+ ayuda a las células a mover energía de un proceso a otro. Los investigadores estudian esa función esencial, pero eso no prueba que agregar NAD+ haga que una persona sienta más energía.' },
            { question: 'Cómo manejan el estrés las células', answer: 'Las enzimas dependientes de NAD participan en sistemas de respuesta al estrés y reparación del ADN. La investigación explica cómo funcionan sin prometer reparación personal.' },
            { question: 'Qué cambia cuando las células envejecen', answer: 'La biología de NAD cambia en muchos modelos de envejecimiento. Eso la convierte en un objetivo importante de investigación, no en prueba de un efecto antienvejecimiento.' },
          ],
        },
        evidence: {
          eyebrow: 'Resumen de evidencia',
          heading: 'Biología básica sólida; evidencia débil de resultados humanos con vial directo.',
          levelLabel: 'Investigación temprana en humanos',
          summary: 'NAD+ es esencial para la biología celular. La investigación humana directa con NAD+ administrado es escasa, y una revisión sistemática de 2026 no encontró ensayos elegibles de resultados con NAD IV o IM para indicaciones antienvejecimiento o bienestar.',
          rows: [
            { label: 'Evidencia en humanos', body: 'Un pequeño estudio piloto aporta información de tolerabilidad, mientras la evidencia directa de resultados con NAD+ administrado sigue siendo insuficiente.' },
            { label: 'Evidencia preclínica', body: 'La investigación celular y animal respalda firmemente los papeles de NAD en balance redox, metabolismo, señalización y respuesta al estrés.' },
            { label: 'Aún se desconoce', body: 'No está establecido si un vial directo de NAD+ mejora energía, cognición, recuperación o longevidad en humanos.' },
            { label: 'Límite del producto', body: 'La evidencia sobre precursores orales de NAD u otras vías no puede aplicarse automáticamente a un vial de NAD+ de Encore.' },
          ],
          caveat: 'La biología esencial no equivale a un beneficio demostrado por agregar un material de investigación.',
          technicalSummaryLabel: 'Detalle técnico',
          technicalSummary: [
            'Los pares NAD+/NADH son centrales en reacciones de oxidación-reducción y transferencia de energía celular.',
            'NAD también es consumido por familias de enzimas involucradas en señalización y biología de reparación del ADN.',
            'Los hallazgos humanos con precursores pueden cambiar biomarcadores, pero los beneficios funcionales reportados son inconsistentes y dependen de la vía.',
          ],
          sourcesLabel: 'Revisiones de evidencia',
          sources: [
            { label: 'Revisión sistemática de 2026', href: 'https://pubmed.ncbi.nlm.nih.gov/41655607/' },
            { label: 'Estudio piloto de tolerabilidad de NAD+', href: 'https://pubmed.ncbi.nlm.nih.gov/41704678/' },
          ],
        },
        kit: {
          eyebrow: 'Valor del Kit Completo',
          heading: 'Elige la concentración de investigación y el formato de apoyo en un solo lugar.',
          body: 'Todo lo necesario para un flujo de laboratorio organizado, adaptado al producto seleccionado y empacado en conjunto. El configurador muestra la concentración y el total exactos de NAD+ antes del pago.',
        },
        overview: {
          eyebrow: 'Resumen de investigación',
          heading: 'Un cofactor celular central, presentado sin convertir el mecanismo en una promesa de bienestar.',
          paragraphs: [
            'NAD+ es una coenzima utilizada en procesos celulares de transferencia de energía y balance redox. También se cruza con sistemas enzimáticos involucrados en señalización, respuesta al estrés e investigación de reparación del ADN.',
            'El papel molecular está bien establecido, mientras la evidencia directa de resultados humanos con NAD+ administrado sigue siendo limitada. Por eso Encore describe las vías de investigación sin prometer resultados de energía, antienvejecimiento, cognición o recuperación.',
          ],
        },
        formats: {
          eyebrow: 'Formatos disponibles',
          heading: 'Dos concentraciones con totales de vial y Kit Completo lado a lado.',
          body: 'Los totales mostrados provienen del mismo registro canónico de NAD+ utilizado por el configurador y el carrito.',
          strengthLabel: 'Concentración',
          vialLabel: 'Solo vial',
          kitLabel: 'Kit Completo',
          kitUnavailableLabel: 'No disponible',
        },
        documentation: {
          eyebrow: 'Documentación y confianza',
          heading: 'Mantén conectados el contexto celular, los detalles del producto y las preguntas de manejo.',
          body: 'Revisa la información de calidad y solicita información específica del lote antes de incluir NAD+ en un plan de laboratorio.',
        },
        faq: {
          eyebrow: 'Preguntas sobre NAD+',
          heading: 'Respuestas concretas sobre biología, evidencia y formato.',
          items: [
            { question: '¿Que NAD+ sea esencial para las células prueba que agregarlo mejora el bienestar?', answer: 'No. El papel biológico esencial de una molécula no establece un resultado beneficioso en humanos al administrar NAD+ adicional.' },
            { question: '¿Se puede aplicar directamente la investigación sobre precursores de NAD a los viales de NAD+?', answer: 'No automáticamente. Los compuestos, vías de administración, exposición y resultados medidos difieren y deben evaluarse por separado.' },
            { question: '¿Qué evidencia humana directa existe?', answer: 'La evidencia directa con NAD+ administrado es limitada. Un pequeño estudio piloto aporta información de tolerabilidad, mientras la evidencia sólida de resultados sigue siendo insuficiente.' },
            { question: '¿En qué se diferencian los formatos de 500 mg y 1000 mg?', answer: 'Contienen diferentes concentraciones de investigación etiquetadas. Elige cualquiera en el configurador para ver el total exacto de Solo vial y Kit Completo.' },
          ],
        },
        finalCta: {
          eyebrow: '¿Listo para configurar NAD+?',
          heading: 'Elige una concentración manteniendo visible el límite de la evidencia.',
          body: 'Compara 500 mg y 1000 mg y después confirma el precio de Solo vial o Kit Completo.',
          primaryCta: 'Elegir concentración y formato',
          secondaryCta: 'Hacer una pregunta del producto',
        },
      },
    },
  },
}

export function isPilotProductSlug(slug: string): slug is PilotProductSlug {
  return slug in productConversionContent
}

export type ConversionProductSlug = PilotProductSlug | RemainingConversionProductSlug

const sharedCopy = {
  en: {
    heroEyebrows: {
      metabolic: 'Metabolic pathway research', recovery: 'Tissue-response research', longevity: 'Cellular systems research', cognitive: 'Cognitive pathway research', hormone: 'Hormone-signaling research', accessory: 'Laboratory workflow',
    } satisfies Record<ProductVisualVariant, string>,
    evidenceTooltip: 'This rating describes published research on the molecule or related regulated pharmaceutical material. It does not establish outcomes for Encore Research Use Only material.',
    researchUseOnly: 'For research use only. Not for human or animal consumption.',
    strengthsLabel: 'Available strengths or formats', startingAtLabel: 'Starting at', primaryCta: 'Choose Your Option', secondaryCta: 'View the evidence',
    purchaseEyebrow: 'Configure your order', purchaseHeading: 'Choose a strength or format, then review the total.', purchaseBody: 'Vial price, Complete Kit total, inventory status, and order total stay visible in one configurator.',
    trustItems: ['Product-specific documentation', 'Strength and price shown together', 'Complete Kit when available', 'Human support when you need it'],
    interestsEyebrow: 'Why researchers look for it', interestsHeading: (name: string) => `Why ${name} gets attention.`,
    interestsSocial: 'Public interest helps explain the questions people ask. It is not scientific evidence or proof of an outcome.',
    unknownQuestion: 'What has not been established?',
    evidenceEyebrow: 'Evidence snapshot', humanLabel: 'What the evidence shows', modelLabel: 'What researchers study', unknownLabel: 'Still unknown', caveatLabel: 'Product boundary',
    productBoundary: 'Published research does not establish the identity, quality, safety, or performance of an Encore Bio Labs Research Use Only product.',
    caveat: 'Molecule-level or pharmaceutical evidence cannot be transferred automatically to Encore material.', technicalSummaryLabel: 'Explore the research', sourcesLabel: 'Primary and authoritative sources',
    kitEyebrow: 'Complete Kit value', kitHeading: 'One organized laboratory format, with the supporting supplies shown upfront.', kitBody: 'Everything needed for an organized laboratory workflow, matched to the selected product and packed together. The configurator shows the exact total before checkout.',
    overviewEyebrow: 'Research overview', formatsEyebrow: 'Available formats', formatsHeading: 'Compare every canonical strength and price in one place.', formatsBody: 'Every total below comes from the same product record used by the configurator, cart, and checkout.', strengthLabel: 'Strength or format', vialLabel: 'Vial only', kitLabel: 'Complete Kit', kitUnavailableLabel: 'Not available',
    documentationEyebrow: 'Documentation and trust', documentationHeading: 'Keep the research context connected to the product record.', documentationBody: 'Review quality information and request product-specific batch documentation before adding the material to a laboratory plan.',
    faqEyebrow: (name: string) => `${name} FAQ`, faqHeading: 'Clear answers about evidence, formats, and boundaries.',
    faqEvidenceQuestion: 'What is the evidence level?', faqProofQuestion: (name: string) => `Does published research prove an Encore ${name} product will produce the same result?`, faqProofAnswer: 'No. Published studies evaluate specific materials, populations, routes, and endpoints. They do not validate an Encore Research Use Only product.',
    faqFormatQuestion: 'What can I compare before ordering?', faqFormatAnswer: 'The page shows canonical strengths or formats, Vial Only pricing, Complete Kit pricing when available, inventory status, and the current order total.',
    faqGuidanceQuestion: 'Does this page provide dosing or treatment guidance?', faqGuidanceAnswer: 'No. It provides research and purchasing context only, with no dosing, administration, treatment, or personalized-use instructions.',
    finalEyebrow: (name: string) => `Ready to configure ${name}?`, finalHeading: 'Choose the research format while keeping the evidence boundary visible.', finalBody: 'Compare the available options, confirm the exact total, and review the supporting research before ordering.', finalPrimaryCta: 'Choose format and price', finalSecondaryCta: 'Ask a product question',
  },
  es: {
    heroEyebrows: {
      metabolic: 'Investigación de vías metabólicas', recovery: 'Investigación de respuesta tisular', longevity: 'Investigación de sistemas celulares', cognitive: 'Investigación de vías cognitivas', hormone: 'Investigación de señalización hormonal', accessory: 'Flujo de laboratorio',
    } satisfies Record<ProductVisualVariant, string>,
    evidenceTooltip: 'Esta clasificación describe la investigación publicada sobre la molécula o material farmacéutico regulado relacionado. No establece resultados para el material de Encore destinado solo a investigación.',
    researchUseOnly: 'Solo para uso en investigación. No apto para consumo humano ni animal.',
    strengthsLabel: 'Concentraciones o formatos disponibles', startingAtLabel: 'Desde', primaryCta: 'Elige tu opción', secondaryCta: 'Ver la evidencia',
    purchaseEyebrow: 'Configura tu pedido', purchaseHeading: 'Elige una concentración o formato y revisa el total.', purchaseBody: 'El precio del vial, el total del Kit Completo, el inventario y el total del pedido permanecen visibles en un solo configurador.',
    trustItems: ['Documentación específica del producto', 'Concentración y precio juntos', 'Kit Completo cuando esté disponible', 'Soporte humano cuando lo necesites'],
    interestsEyebrow: 'Por qué lo buscan los investigadores', interestsHeading: (name: string) => `Por qué ${name} genera atención.`,
    interestsSocial: 'El interés público ayuda a entender las preguntas de la gente. No es evidencia científica ni prueba de un resultado.',
    unknownQuestion: '¿Qué no se ha establecido?',
    evidenceEyebrow: 'Resumen de evidencia', humanLabel: 'Lo que muestra la evidencia', modelLabel: 'Lo que estudian los investigadores', unknownLabel: 'Aún se desconoce', caveatLabel: 'Límite del producto',
    productBoundary: 'La investigación publicada no establece la identidad, calidad, seguridad ni desempeño de un producto de Encore Bio Labs destinado solo a investigación.',
    caveat: 'La evidencia de la molécula o de material farmacéutico no puede transferirse automáticamente al material de Encore.', technicalSummaryLabel: 'Explorar la investigación', sourcesLabel: 'Fuentes primarias y autorizadas',
    kitEyebrow: 'Valor del Kit Completo', kitHeading: 'Un formato de laboratorio organizado, con los insumos de apoyo mostrados desde el inicio.', kitBody: 'Todo lo necesario para un flujo de laboratorio organizado, adaptado al producto seleccionado y empacado en conjunto. El configurador muestra el total exacto antes de pagar.',
    overviewEyebrow: 'Resumen de investigación', formatsEyebrow: 'Formatos disponibles', formatsHeading: 'Compara cada concentración y precio canónico en un solo lugar.', formatsBody: 'Cada total proviene del mismo registro del producto que usa el configurador, el carrito y el pago.', strengthLabel: 'Concentración o formato', vialLabel: 'Solo vial', kitLabel: 'Kit Completo', kitUnavailableLabel: 'No disponible',
    documentationEyebrow: 'Documentación y confianza', documentationHeading: 'Mantén el contexto de investigación conectado con el registro del producto.', documentationBody: 'Revisa la información de calidad y solicita documentación específica del lote antes de agregar el material a un plan de laboratorio.',
    faqEyebrow: (name: string) => `Preguntas sobre ${name}`, faqHeading: 'Respuestas claras sobre evidencia, formatos y límites.',
    faqEvidenceQuestion: '¿Cuál es el nivel de evidencia?', faqProofQuestion: (name: string) => `¿La investigación publicada prueba que un producto ${name} de Encore producirá el mismo resultado?`, faqProofAnswer: 'No. Los estudios publicados evalúan materiales, poblaciones, vías y parámetros específicos. No validan un producto de Encore destinado solo a investigación.',
    faqFormatQuestion: '¿Qué puedo comparar antes de ordenar?', faqFormatAnswer: 'La página muestra concentraciones o formatos canónicos, precio de Solo vial, precio del Kit Completo cuando esté disponible, inventario y total actual.',
    faqGuidanceQuestion: '¿Esta página ofrece instrucciones de dosis o tratamiento?', faqGuidanceAnswer: 'No. Solo ofrece contexto de investigación y compra, sin dosis, administración, tratamiento ni instrucciones de uso personalizado.',
    finalEyebrow: (name: string) => `¿Listo para configurar ${name}?`, finalHeading: 'Elige el formato de investigación manteniendo visible el límite de la evidencia.', finalBody: 'Compara las opciones, confirma el total exacto y revisa la investigación de apoyo antes de ordenar.', finalPrimaryCta: 'Elegir formato y precio', finalSecondaryCta: 'Hacer una pregunta del producto',
  },
} as const

function buildProfileLocaleContent(profile: ProductConversionProfile, locale: 'en' | 'es'): ProductConversionLocaleContent {
  const copy = sharedCopy[locale]
  const profileCopy: ProductConversionProfileLocale = profile.locales[locale]
  const name = profile.name

  return {
    metadata: {
      title: locale === 'en' ? `${name} Research Product | Encore Bio Labs` : `Producto de investigación ${name} | Encore Bio Labs`,
      description: locale === 'en'
        ? `Review ${name} formats, transparent pricing, plain-language research highlights, and a clearly labeled evidence snapshot.`
        : `Revisa formatos de ${name}, precios transparentes, puntos de investigación en lenguaje sencillo y un resumen claro de evidencia.`,
    },
    hero: {
      eyebrow: copy.heroEyebrows[profile.visualVariant], headline: profileCopy.headline, support: profileCopy.support, evidenceLabel: profileCopy.evidenceLabel,
      evidenceTooltip: copy.evidenceTooltip, strengthsLabel: copy.strengthsLabel, startingAtLabel: copy.startingAtLabel, primaryCta: copy.primaryCta, secondaryCta: copy.secondaryCta, researchUseOnly: copy.researchUseOnly,
    },
    purchase: { eyebrow: copy.purchaseEyebrow, heading: copy.purchaseHeading, body: copy.purchaseBody },
    trustItems: [...copy.trustItems],
    interests: {
      eyebrow: copy.interestsEyebrow, heading: copy.interestsHeading(name), body: profileCopy.publicInterest, socialContext: copy.interestsSocial,
      cards: [
        { question: profileCopy.questionOne, answer: profileCopy.support },
        { question: profileCopy.questionTwo, answer: profileCopy.researchFinding },
        { question: copy.unknownQuestion, answer: profileCopy.unknown },
      ],
    },
    evidence: {
      eyebrow: copy.evidenceEyebrow, heading: profileCopy.evidenceHeading, levelLabel: profileCopy.evidenceLabel,
      summary: `${profileCopy.researchFinding} ${profileCopy.unknown}`,
      rows: [
        { label: copy.humanLabel, body: profileCopy.researchFinding },
        { label: copy.modelLabel, body: profileCopy.support },
        { label: copy.unknownLabel, body: profileCopy.unknown },
        { label: copy.caveatLabel, body: copy.productBoundary },
      ],
      caveat: copy.caveat, technicalSummaryLabel: copy.technicalSummaryLabel,
      technicalSummary: [profileCopy.support, profileCopy.researchFinding, profileCopy.unknown],
      sourcesLabel: copy.sourcesLabel,
      sources: profile.sources.map((source) => ({ label: source[locale], href: source.href })),
    },
    kit: { eyebrow: copy.kitEyebrow, heading: copy.kitHeading, body: copy.kitBody },
    overview: { eyebrow: copy.overviewEyebrow, heading: profileCopy.headline, paragraphs: [profileCopy.support, `${profileCopy.researchFinding} ${profileCopy.unknown}`] },
    formats: { eyebrow: copy.formatsEyebrow, heading: copy.formatsHeading, body: copy.formatsBody, strengthLabel: copy.strengthLabel, vialLabel: copy.vialLabel, kitLabel: copy.kitLabel, kitUnavailableLabel: copy.kitUnavailableLabel },
    documentation: { eyebrow: copy.documentationEyebrow, heading: copy.documentationHeading, body: copy.documentationBody },
    faq: {
      eyebrow: copy.faqEyebrow(name), heading: copy.faqHeading,
      items: [
        { question: copy.faqEvidenceQuestion, answer: `${profileCopy.evidenceHeading} ${profileCopy.researchFinding}` },
        { question: copy.faqProofQuestion(name), answer: copy.faqProofAnswer },
        { question: copy.faqFormatQuestion, answer: copy.faqFormatAnswer },
        { question: copy.faqGuidanceQuestion, answer: copy.faqGuidanceAnswer },
      ],
    },
    finalCta: { eyebrow: copy.finalEyebrow(name), heading: copy.finalHeading, body: copy.finalBody, primaryCta: copy.finalPrimaryCta, secondaryCta: copy.finalSecondaryCta },
  }
}

function buildProfileContent(profile: ProductConversionProfile): ProductConversionContent {
  return {
    visualVariant: profile.visualVariant,
    accent: profile.accent,
    evidenceTone: profile.evidenceTone,
    locales: { en: buildProfileLocaleContent(profile, 'en'), es: buildProfileLocaleContent(profile, 'es') },
  }
}

const generatedProductConversionContent = Object.fromEntries(
  Object.entries(productConversionProfiles).map(([slug, profile]) => [slug, buildProfileContent(profile)]),
) as Record<RemainingConversionProductSlug, ProductConversionContent>

export function isConversionProductSlug(slug: string): slug is ConversionProductSlug {
  return isPilotProductSlug(slug) || isRemainingConversionProductSlug(slug)
}

export function getProductConversionContent(slug: ConversionProductSlug, locale: 'en' | 'es') {
  const entry = isPilotProductSlug(slug)
    ? productConversionContent[slug]
    : generatedProductConversionContent[slug]
  const localeContent = entry.locales[locale]

  return {
    ...entry,
    localeContent: slug === 'retatrutide'
      ? localeContent
      : { ...localeContent, trends: getProductTrendContent(slug, locale) },
  }
}
