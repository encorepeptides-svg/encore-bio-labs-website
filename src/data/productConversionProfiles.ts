import type { EvidenceTone, ProductVisualVariant } from './productConversionContent'

export type ProductConversionProfileLocale = {
  headline: string
  support: string
  evidenceLabel: string
  evidenceHeading: string
  publicInterest: string
  questionOne: string
  questionTwo: string
  researchFinding: string
  unknown: string
}

type ProfileSource = {
  href: string
  en: string
  es: string
}

export type ProductConversionProfile = {
  name: string
  visualVariant: ProductVisualVariant
  accent: string
  evidenceTone: EvidenceTone
  sources: [ProfileSource, ProfileSource]
  locales: Record<'en' | 'es', ProductConversionProfileLocale>
}

// Concise public-page copy distilled from the completed bilingual evidence
// review. Product identity, variants, pricing, purchase rules, and imagery stay
// canonical in products.ts.
export const productConversionProfiles = {
  tesamorelin: {
    name: 'Tesamorelin', visualVariant: 'metabolic', accent: '#20bfa9', evidenceTone: 'human-trials',
    sources: [
      { href: 'https://www.accessdata.fda.gov/drugsatfda_docs/label/2025/022505s020lbl.pdf', en: 'FDA EGRIFTA WR label', es: 'Etiqueta FDA de EGRIFTA WR' },
      { href: 'https://pubmed.ncbi.nlm.nih.gov/25038357/', en: 'JAMA imaging study', es: 'Estudio de imágenes en JAMA' },
    ],
    locales: {
      en: {
        headline: 'A focused way to study abdominal-fat and growth-hormone signaling.',
        support: 'Researchers use Tesamorelin to examine the GH–IGF-1 pathway and imaging-based fat distribution in a narrowly defined clinical context.',
        evidenceLabel: 'Strong human evidence — narrow use',
        evidenceHeading: 'Strong human evidence, limited to a specific approved-drug context.',
        publicInterest: 'Public interest often centers on stubborn abdominal fat and body composition. Those goals are not proof of a general weight-loss effect.',
        questionOne: 'How does the GH–IGF-1 signal change?',
        questionTwo: 'What did imaging studies actually measure?',
        researchFinding: 'Controlled studies measured abdominal-fat distribution in adults with HIV-associated lipodystrophy using regulated pharmaceutical material.',
        unknown: 'Those results do not establish general fat loss or outcomes from Encore Research Use Only material.',
      },
      es: {
        headline: 'Una forma enfocada de estudiar la grasa abdominal y la señalización de hormona del crecimiento.',
        support: 'Los investigadores usan Tesamorelin para examinar la vía GH–IGF-1 y la distribución de grasa medida por imágenes dentro de un contexto clínico muy específico.',
        evidenceLabel: 'Evidencia humana sólida — uso limitado',
        evidenceHeading: 'Evidencia humana sólida, limitada a un contexto farmacéutico aprobado y específico.',
        publicInterest: 'El interés público suele centrarse en la grasa abdominal difícil y la composición corporal. Esas metas no prueban un efecto general de pérdida de peso.',
        questionOne: '¿Cómo cambia la señal GH–IGF-1?',
        questionTwo: '¿Qué midieron realmente los estudios por imágenes?',
        researchFinding: 'Estudios controlados midieron la distribución de grasa abdominal en adultos con lipodistrofia asociada al VIH usando material farmacéutico regulado.',
        unknown: 'Esos resultados no establecen pérdida de grasa general ni resultados del material de Encore destinado solo a investigación.',
      },
    },
  },
  klow: {
    name: 'KLOW', visualVariant: 'recovery', accent: '#32c6a6', evidenceTone: 'preclinical',
    sources: [
      { href: 'https://www.bmj.com/content/bmj/393/bmj.s924.full.pdf', en: 'BMJ designer-peptide review', es: 'Revisión BMJ de péptidos de diseño' },
      { href: 'https://pubmed.ncbi.nlm.nih.gov/18061177/', en: 'KPV cell study', es: 'Estudio celular de KPV' },
    ],
    locales: {
      en: {
        headline: 'Four research paths, organized in one blend.',
        support: 'GHK-Cu, BPC-157, TB-500, and KPV bring skin-matrix, tissue-response, cell-migration, and inflammatory-signaling questions into one format.',
        evidenceLabel: 'Combination not clinically studied',
        evidenceHeading: 'The exact blend has not been clinically studied.',
        publicInterest: 'People search for KLOW around skin appearance, hair, inflammation, and recovery. Those popular themes are questions—not demonstrated benefits.',
        questionOne: 'How do the four components differ?',
        questionTwo: 'Has the exact blend been tested together?',
        researchFinding: 'The components have separate, mostly preclinical evidence streams; no controlled human study establishes the marketed four-part blend.',
        unknown: 'Synergy, human outcomes, and route-specific effects of the complete blend remain unestablished.',
      },
      es: {
        headline: 'Cuatro rutas de investigación, organizadas en una sola mezcla.',
        support: 'GHK-Cu, BPC-157, TB-500 y KPV reúnen preguntas sobre matriz de piel, respuesta tisular, migración celular y señales inflamatorias en un formato.',
        evidenceLabel: 'Combinación sin estudio clínico',
        evidenceHeading: 'La mezcla exacta no ha sido estudiada clínicamente.',
        publicInterest: 'La gente busca KLOW por piel, cabello, inflamación y recuperación. Esos temas populares son preguntas, no beneficios demostrados.',
        questionOne: '¿En qué se diferencian los cuatro componentes?',
        questionTwo: '¿Se ha probado la mezcla exacta en conjunto?',
        researchFinding: 'Los componentes tienen líneas de evidencia separadas y principalmente preclínicas; ningún estudio humano controlado establece la mezcla de cuatro partes.',
        unknown: 'La sinergia, los resultados humanos y los efectos según la vía de la mezcla completa no están establecidos.',
      },
    },
  },
  'igf1-lr3': {
    name: 'IGF1-LR3', visualVariant: 'hormone', accent: '#3bb8b0', evidenceTone: 'preclinical',
    sources: [
      { href: 'https://www.accessdata.fda.gov/drugsatfda_docs/label/2024/021839s031lbl.pdf', en: 'FDA mecasermin label', es: 'Etiqueta FDA de mecasermina' },
      { href: 'https://www.wada-ama.org/en/resources/world-anti-doping-program/prohibited-list', en: 'WADA prohibited list', es: 'Lista prohibida de WADA' },
    ],
    locales: {
      en: {
        headline: 'Long-acting IGF-1 analog research, without borrowing clinical claims.',
        support: 'IGF1-LR3 is used in controlled models to study IGF-1 receptor signaling, binding-protein interactions, and cell response.',
        evidenceLabel: 'Mostly preclinical research',
        evidenceHeading: 'Mostly cell and animal evidence; LR3 human outcomes are not established.',
        publicInterest: 'Public demand is driven largely by bodybuilding conversations about growth and recovery. Those conversations are not controlled evidence.',
        questionOne: 'How does LR3 differ from native IGF-1?',
        questionTwo: 'What do growth-signaling models measure?',
        researchFinding: 'Published LR3 research is concentrated in cultured cells and animals; approved mecasermin is a different material with a narrow use.',
        unknown: 'Controlled human outcomes specific to IGF1-LR3, including muscle or recovery outcomes, are not established.',
      },
      es: {
        headline: 'Investigación de un análogo de IGF-1 de acción prolongada, sin tomar afirmaciones clínicas prestadas.',
        support: 'IGF1-LR3 se usa en modelos controlados para estudiar el receptor de IGF-1, las proteínas de unión y la respuesta celular.',
        evidenceLabel: 'Investigación principalmente preclínica',
        evidenceHeading: 'Principalmente células y animales; no hay resultados humanos establecidos para LR3.',
        publicInterest: 'La demanda pública viene sobre todo de conversaciones de fisicoculturismo sobre crecimiento y recuperación. Esas conversaciones no son evidencia controlada.',
        questionOne: '¿En qué se diferencia LR3 del IGF-1 natural?',
        questionTwo: '¿Qué miden los modelos de señalización de crecimiento?',
        researchFinding: 'La investigación publicada de LR3 se concentra en células y animales; la mecasermina aprobada es un material distinto con uso limitado.',
        unknown: 'No están establecidos resultados humanos controlados específicos de IGF1-LR3, incluidos músculo o recuperación.',
      },
    },
  },
  'cjc1295-ipamorelin': {
    name: 'CJC-1295 + Ipamorelin', visualVariant: 'hormone', accent: '#2eb5a5', evidenceTone: 'early-human',
    sources: [
      { href: 'https://pubmed.ncbi.nlm.nih.gov/16352683/', en: 'CJC-1295 human pharmacology study', es: 'Estudio humano de CJC-1295' },
      { href: 'https://pubmed.ncbi.nlm.nih.gov/10496658/', en: 'Ipamorelin human pharmacology study', es: 'Estudio humano de Ipamorelin' },
    ],
    locales: {
      en: {
        headline: 'Two upstream growth-hormone signals in one research format.',
        support: 'This paired format lets researchers compare GHRH-receptor and ghrelin-receptor signaling while keeping the two evidence streams distinct.',
        evidenceLabel: 'Early human research',
        evidenceHeading: 'Early human hormone-response evidence; combination outcomes are not established.',
        publicInterest: 'Sleep, recovery, energy, and lean-mass language drives public interest. The controlled evidence does not establish those outcomes for the combination.',
        questionOne: 'How do the two signals reach the GH axis?',
        questionTwo: 'What have short human studies measured?',
        researchFinding: 'Small human studies measured hormone responses to the separate compounds, not reliable sleep, recovery, muscle, or anti-aging outcomes from the blend.',
        unknown: 'Direct clinical evidence for the exact combination and for different CJC-1295 forms remains unestablished.',
      },
      es: {
        headline: 'Dos señales previas de hormona del crecimiento en un formato de investigación.',
        support: 'Este formato permite comparar señalización del receptor de GHRH y del receptor de grelina manteniendo separadas las dos líneas de evidencia.',
        evidenceLabel: 'Investigación humana inicial',
        evidenceHeading: 'Evidencia humana inicial de respuesta hormonal; resultados de la combinación no establecidos.',
        publicInterest: 'Sueño, recuperación, energía y masa magra impulsan el interés público. La evidencia controlada no establece esos resultados para la combinación.',
        questionOne: '¿Cómo llegan las dos señales al eje GH?',
        questionTwo: '¿Qué han medido los estudios humanos cortos?',
        researchFinding: 'Estudios humanos pequeños midieron respuestas hormonales de los compuestos por separado, no resultados confiables de sueño, recuperación, músculo o antienvejecimiento de la mezcla.',
        unknown: 'No hay evidencia clínica directa establecida para la combinación exacta ni para las distintas formas de CJC-1295.',
      },
    },
  },
  'mots-c': {
    name: 'MOTS-C', visualVariant: 'longevity', accent: '#3ac7bd', evidenceTone: 'preclinical',
    sources: [
      { href: 'https://pubmed.ncbi.nlm.nih.gov/33473109/', en: 'Nature Communications physiology study', es: 'Estudio fisiológico en Nature Communications' },
      { href: 'https://pubmed.ncbi.nlm.nih.gov/25738459/', en: 'Cell Metabolism discovery study', es: 'Estudio de descubrimiento en Cell Metabolism' },
    ],
    locales: {
      en: {
        headline: 'A mitochondrial peptide for studying how cells sense energetic stress.',
        support: 'MOTS-C connects mitochondrial signaling with exercise-response, metabolic-stress, and AMPK-associated research questions.',
        evidenceLabel: 'Mostly preclinical research',
        evidenceHeading: 'Mostly animal evidence; human studies largely observe the body’s own peptide.',
        publicInterest: 'Energy, endurance, metabolism, and fat-loss language surrounds MOTS-C online. Those expectations go beyond the human evidence.',
        questionOne: 'How do mitochondria signal during stress?',
        questionTwo: 'What changes during exercise models?',
        researchFinding: 'Administered MOTS-C has been studied mainly in mice; small human studies measured endogenous MOTS-C during exercise.',
        unknown: 'Human endurance, weight, or general energy outcomes from administered MOTS-C are not established.',
      },
      es: {
        headline: 'Un péptido mitocondrial para estudiar cómo perciben las células el estrés energético.',
        support: 'MOTS-C conecta la señalización mitocondrial con preguntas sobre respuesta al ejercicio, estrés metabólico y vías asociadas con AMPK.',
        evidenceLabel: 'Investigación principalmente preclínica',
        evidenceHeading: 'Principalmente animales; los estudios humanos observan sobre todo el péptido del propio cuerpo.',
        publicInterest: 'Energía, resistencia, metabolismo y pérdida de grasa rodean a MOTS-C en internet. Esas expectativas superan la evidencia humana.',
        questionOne: '¿Cómo señalan las mitocondrias durante el estrés?',
        questionTwo: '¿Qué cambia en modelos de ejercicio?',
        researchFinding: 'MOTS-C administrado se ha estudiado principalmente en ratones; estudios humanos pequeños midieron MOTS-C endógeno durante ejercicio.',
        unknown: 'No están establecidos resultados humanos de resistencia, peso o energía general con MOTS-C administrado.',
      },
    },
  },
  'aod-9604': {
    name: 'AOD-9604', visualVariant: 'metabolic', accent: '#36bda8', evidenceTone: 'preclinical',
    sources: [
      { href: 'https://www.fda.gov/media/183584/download', en: 'FDA AOD-9604 evidence review', es: 'Revisión FDA de AOD-9604' },
      { href: 'https://www.nature.com/articles/0801740', en: 'Preclinical metabolic study', es: 'Estudio metabólico preclínico' },
    ],
    locales: {
      en: {
        headline: 'A growth-hormone fragment built around an unresolved metabolic question.',
        support: 'AOD-9604 was developed to isolate fat-metabolism signaling from full growth hormone, with positive preclinical signals but uncertain human results.',
        evidenceLabel: 'Mostly preclinical research',
        evidenceHeading: 'Mostly animal evidence; human results remain inconclusive.',
        publicInterest: 'People search for AOD-9604 as a simpler fat-loss idea. Public opinion is sharply divided and does not resolve the evidence gap.',
        questionOne: 'What was this GH fragment designed to isolate?',
        questionTwo: 'Why did animal findings not settle the human question?',
        researchFinding: 'Positive weight and fat-use signals came mainly from animal models, while the human development record did not establish dependable outcomes.',
        unknown: 'Reliable human efficacy, long-term safety, and product-characterization questions remain unresolved.',
      },
      es: {
        headline: 'Un fragmento de hormona del crecimiento construido alrededor de una pregunta metabólica no resuelta.',
        support: 'AOD-9604 se desarrolló para aislar señales de metabolismo de grasa de la hormona completa, con señales preclínicas positivas pero resultados humanos inciertos.',
        evidenceLabel: 'Investigación principalmente preclínica',
        evidenceHeading: 'Principalmente animales; los resultados humanos siguen sin ser concluyentes.',
        publicInterest: 'La gente busca AOD-9604 como una idea más sencilla de pérdida de grasa. La opinión pública está dividida y no resuelve la brecha de evidencia.',
        questionOne: '¿Qué intentó aislar este fragmento de GH?',
        questionTwo: '¿Por qué los hallazgos animales no resolvieron la pregunta humana?',
        researchFinding: 'Las señales positivas de peso y uso de grasa vinieron principalmente de animales; el desarrollo humano no estableció resultados confiables.',
        unknown: 'La eficacia humana confiable, la seguridad a largo plazo y la caracterización del producto siguen sin resolverse.',
      },
    },
  },
  glutathione: {
    name: 'Glutathione', visualVariant: 'longevity', accent: '#45c6ae', evidenceTone: 'early-human',
    sources: [
      { href: 'https://pubmed.ncbi.nlm.nih.gov/39444151/', en: '2024 glutathione and skin review', es: 'Revisión 2024 sobre glutatión y piel' },
      { href: 'https://pubmed.ncbi.nlm.nih.gov/30895708/', en: 'Critical route-specific evidence review', es: 'Revisión crítica de evidencia según la vía' },
    ],
    locales: {
      en: {
        headline: 'Study how cells manage oxidative stress and redox balance.',
        support: 'Glutathione is a foundational intracellular antioxidant used to examine GSH/GSSG cycling and oxidative-stress systems.',
        evidenceLabel: 'Mixed route-specific human evidence',
        evidenceHeading: 'Established biology with mixed human evidence that depends on the route.',
        publicInterest: '“Detox,” skin appearance, energy, and immunity drive demand. A molecule’s cellular role does not guarantee those visible or personal outcomes.',
        questionOne: 'How do cells recycle antioxidant capacity?',
        questionTwo: 'Why does the delivery route matter?',
        researchFinding: 'Oral and topical human studies report mixed or modest findings; broad injected skin-lightening claims are not supported by reviews.',
        unknown: 'Broad detox, immune, energy, or visible-skin outcomes from an Encore vial are not established.',
      },
      es: {
        headline: 'Estudia cómo manejan las células el estrés oxidativo y el equilibrio redox.',
        support: 'El glutatión es un antioxidante intracelular fundamental usado para examinar el ciclo GSH/GSSG y los sistemas de estrés oxidativo.',
        evidenceLabel: 'Evidencia humana mixta según la vía',
        evidenceHeading: 'Biología establecida con evidencia humana mixta que depende de la vía.',
        publicInterest: '“Desintoxicación”, piel, energía e inmunidad impulsan la demanda. El papel celular de una molécula no garantiza esos resultados visibles o personales.',
        questionOne: '¿Cómo reciclan las células su capacidad antioxidante?',
        questionTwo: '¿Por qué importa la vía de administración?',
        researchFinding: 'Estudios humanos orales y tópicos muestran hallazgos mixtos o modestos; las revisiones no respaldan afirmaciones amplias de aclaramiento por inyección.',
        unknown: 'No están establecidos resultados amplios de desintoxicación, inmunidad, energía o piel visible con un vial de Encore.',
      },
    },
  },
  'ghk-cu': {
    name: 'GHK-Cu', visualVariant: 'recovery', accent: '#29bba9', evidenceTone: 'preclinical',
    sources: [
      { href: 'https://pubmed.ncbi.nlm.nih.gov/8227353/', en: 'GHK-Cu wound-model study', es: 'Estudio de modelo de heridas con GHK-Cu' },
      { href: 'https://pubmed.ncbi.nlm.nih.gov/19319546/', en: 'Human-cell skin-model study', es: 'Estudio de piel con células humanas' },
    ],
    locales: {
      en: {
        headline: 'Copper-peptide research focused on skin structure and cellular remodeling.',
        support: 'GHK-Cu is studied across extracellular-matrix, cell-migration, reconstructed-skin, and wound-response models.',
        evidenceLabel: 'Mostly preclinical research',
        evidenceHeading: 'Mostly laboratory and animal evidence, with important route differences.',
        publicInterest: 'Skin glow, firmness, hair, and wound recovery dominate public interest. Many conversations do not distinguish topical from vial formats.',
        questionOne: 'How do skin-supporting cells organize structure?',
        questionTwo: 'What changes between topical and other research formats?',
        researchFinding: 'The literature includes cultured human cells, reconstructed skin, and animal wound models rather than broad injected human outcomes.',
        unknown: 'Injected human skin, hair, collagen, or healing outcomes are not established.',
      },
      es: {
        headline: 'Investigación de péptido de cobre enfocada en estructura de piel y remodelación celular.',
        support: 'GHK-Cu se estudia en modelos de matriz extracelular, migración celular, piel reconstruida y respuesta a heridas.',
        evidenceLabel: 'Investigación principalmente preclínica',
        evidenceHeading: 'Principalmente laboratorio y animales, con diferencias importantes según la vía.',
        publicInterest: 'Brillo, firmeza, cabello y recuperación de heridas dominan el interés público. Muchas conversaciones no distinguen formatos tópicos de viales.',
        questionOne: '¿Cómo organizan su estructura las células que sostienen la piel?',
        questionTwo: '¿Qué cambia entre formatos tópicos y otros formatos de investigación?',
        researchFinding: 'La literatura incluye células humanas cultivadas, piel reconstruida y modelos animales de heridas, no resultados humanos amplios por inyección.',
        unknown: 'No están establecidos resultados humanos por inyección en piel, cabello, colágeno o curación.',
      },
    },
  },
  'ahk-cu': {
    name: 'AHK-Cu', visualVariant: 'recovery', accent: '#3fc2a7', evidenceTone: 'preclinical',
    sources: [
      { href: 'https://pubmed.ncbi.nlm.nih.gov/17703734/', en: 'Human hair-follicle laboratory study', es: 'Estudio de laboratorio con folículos humanos' },
      { href: 'https://doi.org/10.1007/BF02978833', en: 'Peer-reviewed journal record', es: 'Registro de revista científica' },
    ],
    locales: {
      en: {
        headline: 'A focused copper peptide for follicle and scalp-cell research.',
        support: 'AHK-Cu is studied in isolated human hair-follicle and cultured scalp-cell models, separately from broader GHK-Cu claims.',
        evidenceLabel: 'Very limited laboratory evidence',
        evidenceHeading: 'Very limited ex-vivo and cell evidence—not a trial in people.',
        publicInterest: 'Hair growth and scalp support drive attention. Users often combine products, which makes personal reports impossible to attribute.',
        questionOne: 'What happens in isolated follicle models?',
        questionTwo: 'Why is AHK-Cu kept separate from GHK-Cu?',
        researchFinding: 'One directly relevant study reported changes in isolated human follicles and cultured scalp cells.',
        unknown: 'Hair growth, hair-loss prevention, and follicle stimulation in people are not established.',
      },
      es: {
        headline: 'Un péptido de cobre enfocado en investigación de folículos y células del cuero cabelludo.',
        support: 'AHK-Cu se estudia en folículos humanos aislados y células del cuero cabelludo cultivadas, separado de las afirmaciones más amplias de GHK-Cu.',
        evidenceLabel: 'Evidencia de laboratorio muy limitada',
        evidenceHeading: 'Evidencia muy limitada en tejido aislado y células; no es un ensayo en personas.',
        publicInterest: 'Crecimiento de cabello y cuero cabelludo impulsan la atención. Los usuarios suelen combinar productos, impidiendo atribuir sus relatos.',
        questionOne: '¿Qué ocurre en modelos de folículos aislados?',
        questionTwo: '¿Por qué se mantiene AHK-Cu separado de GHK-Cu?',
        researchFinding: 'Un estudio directamente relevante reportó cambios en folículos humanos aislados y células cultivadas del cuero cabelludo.',
        unknown: 'No están establecidos el crecimiento de cabello, la prevención de caída ni la estimulación folicular en personas.',
      },
    },
  },
  epithalon: {
    name: 'Epithalon', visualVariant: 'longevity', accent: '#59bfc3', evidenceTone: 'preclinical',
    sources: [
      { href: 'https://pubmed.ncbi.nlm.nih.gov/40908429/', en: '2025 human-cell study', es: 'Estudio 2025 en células humanas' },
      { href: 'https://pubmed.ncbi.nlm.nih.gov/12374907/', en: 'Historical aging-research record', es: 'Registro histórico de investigación de envejecimiento' },
    ],
    locales: {
      en: {
        headline: 'Explore telomere and cellular-aging hypotheses—without an anti-aging promise.',
        support: 'Epithalon is a short peptide used in controlled models to study telomere-associated biology, cell aging, and historical pineal-peptide questions.',
        evidenceLabel: 'Mostly cell research',
        evidenceHeading: 'Mostly cell evidence; reliable human outcomes are not established.',
        publicInterest: 'Longer life, younger biological age, sleep, and telomere repair are common claims online. They run far ahead of the evidence.',
        questionOne: 'What do telomere models actually measure?',
        questionTwo: 'Can a cell finding predict human aging?',
        researchFinding: 'Modern work reports telomere-related changes in cultured normal and cancer cell lines; older human reports are difficult to interpret.',
        unknown: 'Longer life, slower aging, telomere repair in people, and better sleep are not established.',
      },
      es: {
        headline: 'Explora hipótesis de telómeros y envejecimiento celular sin prometer antienvejecimiento.',
        support: 'Epithalon es un péptido corto usado en modelos controlados para estudiar biología asociada a telómeros, envejecimiento celular y preguntas históricas sobre péptidos pineales.',
        evidenceLabel: 'Investigación principalmente celular',
        evidenceHeading: 'Principalmente células; no hay resultados humanos confiables establecidos.',
        publicInterest: 'Vida más larga, edad biológica joven, sueño y reparación de telómeros son afirmaciones comunes en internet que superan ampliamente la evidencia.',
        questionOne: '¿Qué miden realmente los modelos de telómeros?',
        questionTwo: '¿Puede un hallazgo celular predecir envejecimiento humano?',
        researchFinding: 'El trabajo moderno reporta cambios relacionados con telómeros en líneas celulares normales y cancerosas; los informes humanos antiguos son difíciles de interpretar.',
        unknown: 'No están establecidos vida más larga, envejecimiento lento, reparación de telómeros en personas ni mejor sueño.',
      },
    },
  },
  cerebrolysin: {
    name: 'Cerebrolysin', visualVariant: 'cognitive', accent: '#4bb7c2', evidenceTone: 'early-human',
    sources: [
      { href: 'https://www.cochrane.org/evidence/CD008900_cerebrolysin-vascular-dementia', en: 'Cochrane vascular-dementia review', es: 'Revisión Cochrane de demencia vascular' },
      { href: 'https://www.cochrane.org/evidence/CD007026_cerebrolysin-acute-ischaemic-stroke', en: 'Cochrane acute-stroke review', es: 'Revisión Cochrane de derrame agudo' },
    ],
    locales: {
      en: {
        headline: 'A long clinical-research history, presented with its mixed results intact.',
        support: 'Cerebrolysin is a complex peptide mixture studied in neurological-recovery and cognitive contexts across condition-specific human trials.',
        evidenceLabel: 'Meaningful but inconsistent human evidence',
        evidenceHeading: 'Human studies exist, but the findings are inconsistent and condition-specific.',
        publicInterest: 'Brain fog, memory, focus, stroke, and concussion drive unusually dramatic stories in both directions. Anecdotes are not evidence.',
        questionOne: 'What neurological outcomes have trials measured?',
        questionTwo: 'Why do systematic reviews remain cautious?',
        researchFinding: 'Cochrane reviews describe low- or very-low-certainty evidence in vascular dementia and no clear mortality benefit in acute ischemic stroke.',
        unknown: 'Reliable brain-repair, memory-restoration, or general cognitive outcomes are not established.',
      },
      es: {
        headline: 'Una larga historia de investigación clínica, presentada con sus resultados mixtos intactos.',
        support: 'Cerebrolysin es una mezcla compleja de péptidos estudiada en recuperación neurológica y cognición mediante ensayos humanos específicos de cada condición.',
        evidenceLabel: 'Evidencia humana relevante pero inconsistente',
        evidenceHeading: 'Existen estudios humanos, pero los hallazgos son inconsistentes y específicos de cada condición.',
        publicInterest: 'Niebla mental, memoria, enfoque, derrame y conmoción generan relatos muy dramáticos en ambos sentidos. Las anécdotas no son evidencia.',
        questionOne: '¿Qué resultados neurológicos han medido los ensayos?',
        questionTwo: '¿Por qué siguen siendo cautas las revisiones sistemáticas?',
        researchFinding: 'Revisiones Cochrane describen evidencia baja o muy baja en demencia vascular y ningún beneficio claro de mortalidad en derrame isquémico agudo.',
        unknown: 'No están establecidos resultados confiables de reparación cerebral, restauración de memoria o cognición general.',
      },
    },
  },
  ss31: {
    name: 'SS-31', visualVariant: 'longevity', accent: '#42bdc0', evidenceTone: 'human-trials',
    sources: [
      { href: 'https://www.fda.gov/drugs/drug-trials-snapshots/drug-trials-snapshots-forzinity', en: 'FDA FORZINITY trial snapshot', es: 'Resumen FDA de FORZINITY' },
      { href: 'https://pubmed.ncbi.nlm.nih.gov/37268435/', en: 'Neutral Phase 3 trial', es: 'Ensayo fase 3 neutral' },
    ],
    locales: {
      en: {
        headline: 'Mitochondria-targeted research with one very narrow regulated context.',
        support: 'SS-31, discussed as elamipretide in regulated research, targets mitochondrial membrane and cardiolipin questions.',
        evidenceLabel: 'Strong human evidence — very narrow use',
        evidenceHeading: 'A strong but very narrow regulated context; general wellness evidence is weak.',
        publicInterest: 'Energy, fatigue, endurance, and “mitochondrial repair” dominate public interest. The regulated record does not support a general energy product.',
        questionOne: 'How is the mitochondrial membrane studied?',
        questionTwo: 'What does the rare-disease approval actually cover?',
        researchFinding: 'A regulated elamipretide drug received accelerated approval for a rare disease, while a larger trial in another mitochondrial condition missed its main endpoints.',
        unknown: 'General energy, fatigue, endurance, longevity, and mitochondrial-repair outcomes are not established.',
      },
      es: {
        headline: 'Investigación dirigida a mitocondrias con un contexto regulado muy limitado.',
        support: 'SS-31, descrito como elamipretida en investigación regulada, se dirige a preguntas sobre membrana mitocondrial y cardiolipina.',
        evidenceLabel: 'Evidencia humana sólida — uso muy limitado',
        evidenceHeading: 'Contexto regulado sólido pero muy limitado; evidencia débil para bienestar general.',
        publicInterest: 'Energía, fatiga, resistencia y “reparación mitocondrial” dominan el interés. El registro regulado no respalda un producto general de energía.',
        questionOne: '¿Cómo se estudia la membrana mitocondrial?',
        questionTwo: '¿Qué cubre realmente la aprobación para enfermedad rara?',
        researchFinding: 'Un medicamento regulado de elamipretida recibió aprobación acelerada para una enfermedad rara; un ensayo mayor en otra condición no logró sus objetivos principales.',
        unknown: 'No están establecidos energía general, fatiga, resistencia, longevidad ni reparación mitocondrial.',
      },
    },
  },
  dsip: {
    name: 'DSIP', visualVariant: 'hormone', accent: '#5aaec0', evidenceTone: 'early-human',
    sources: [
      { href: 'https://pubmed.ncbi.nlm.nih.gov/6895513/', en: 'Six-person sleep study', es: 'Estudio de sueño de seis personas' },
      { href: 'https://pubmed.ncbi.nlm.nih.gov/1299794/', en: 'Controlled insomnia study', es: 'Estudio controlado de insomnio' },
    ],
    locales: {
      en: {
        headline: 'A historically studied sleep-related peptide with a very small evidence base.',
        support: 'DSIP is used to revisit older questions about sleep architecture, neuroendocrine signals, and stress-response models.',
        evidenceLabel: 'Old, small human studies',
        evidenceHeading: 'Old, very small, and inconsistent human studies.',
        publicInterest: 'The product name encourages a “deep sleep” expectation. Public reports range from strong effects to no effect or worse sleep.',
        questionOne: 'What did the early sleep studies measure?',
        questionTwo: 'Why are the results considered uncertain?',
        researchFinding: 'A six-person study reported changes; a later controlled 16-person study found weak results that could have been incidental.',
        unknown: 'Dependable improvements in sleep quality, stress, recovery, or circadian rhythm are not established.',
      },
      es: {
        headline: 'Un péptido relacionado con el sueño, estudiado históricamente con una base de evidencia muy pequeña.',
        support: 'DSIP permite revisar preguntas antiguas sobre arquitectura del sueño, señales neuroendocrinas y modelos de respuesta al estrés.',
        evidenceLabel: 'Estudios humanos antiguos y pequeños',
        evidenceHeading: 'Estudios humanos antiguos, muy pequeños e inconsistentes.',
        publicInterest: 'El nombre fomenta una expectativa de “sueño profundo”. Los relatos van de efectos intensos a ningún efecto o peor sueño.',
        questionOne: '¿Qué midieron los primeros estudios de sueño?',
        questionTwo: '¿Por qué se consideran inciertos los resultados?',
        researchFinding: 'Un estudio de seis personas reportó cambios; otro controlado de 16 personas encontró resultados débiles que podían ser incidentales.',
        unknown: 'No están establecidas mejoras confiables en sueño, estrés, recuperación o ritmo circadiano.',
      },
    },
  },
  kisspeptin: {
    name: 'Kisspeptin', visualVariant: 'hormone', accent: '#47b9aa', evidenceTone: 'early-human',
    sources: [
      { href: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC4508256/', en: 'Human reproductive research review', es: 'Revisión humana de investigación reproductiva' },
      { href: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC9606846/', en: 'Randomized sexual-response study', es: 'Estudio aleatorizado de respuesta sexual' },
    ],
    locales: {
      en: {
        headline: 'Follow how reproductive signals communicate from brain to hormone release.',
        support: 'Kisspeptin is studied across GnRH signaling, fertility procedures, hormone release, and selected sexual-response research.',
        evidenceLabel: 'Early but credible human research',
        evidenceHeading: 'Early, credible human evidence with narrow populations and endpoints.',
        publicInterest: 'Fertility, testosterone, and libido language drives demand. The published findings are promising but do not prove broad personal benefits.',
        questionOne: 'How does the reproductive signal begin?',
        questionTwo: 'What have small human studies measured?',
        researchFinding: 'Small studies measured hormone signaling, egg maturation in IVF research, and sexual-response variables in selected populations.',
        unknown: 'General fertility, testosterone, libido, pregnancy, or hormone-restoration outcomes are not established.',
      },
      es: {
        headline: 'Sigue cómo se comunican las señales reproductivas desde el cerebro hasta la liberación hormonal.',
        support: 'Kisspeptin se estudia en señalización GnRH, procedimientos de fertilidad, liberación hormonal y estudios seleccionados de respuesta sexual.',
        evidenceLabel: 'Investigación humana inicial pero creíble',
        evidenceHeading: 'Evidencia humana inicial y creíble, con poblaciones y parámetros limitados.',
        publicInterest: 'Fertilidad, testosterona y libido impulsan la demanda. Los hallazgos son prometedores, pero no prueban beneficios personales amplios.',
        questionOne: '¿Cómo comienza la señal reproductiva?',
        questionTwo: '¿Qué han medido los estudios humanos pequeños?',
        researchFinding: 'Estudios pequeños midieron señalización hormonal, maduración de óvulos en FIV y variables de respuesta sexual en poblaciones seleccionadas.',
        unknown: 'No están establecidos fertilidad general, testosterona, libido, embarazo ni restauración hormonal.',
      },
    },
  },
  hcg: {
    name: 'HCG', visualVariant: 'hormone', accent: '#4bb3a4', evidenceTone: 'human-trials',
    sources: [
      { href: 'https://www.fda.gov/drugs/medication-health-fraud/questions-and-answers-hcg-products-weight-loss', en: 'FDA HCG weight-loss warning', es: 'Advertencia FDA sobre HCG y peso' },
      { href: 'https://dailymed.nlm.nih.gov/dailymed/fda/dailymed/fdaDrugXsl.cfm?setid=312ee87a-c6c3-6111-e063-6394a90ad8d7&type=display', en: 'Regulated HCG label', es: 'Etiqueta regulada de HCG' },
    ],
    locales: {
      en: {
        headline: 'An established reproductive-hormone reference for controlled signaling research.',
        support: 'HCG is studied through the LH/CG receptor in reproductive and endocrine models, with regulated drugs used for narrow medical contexts.',
        evidenceLabel: 'Strong human evidence — narrow uses',
        evidenceHeading: 'Strong human evidence for narrow approved drugs; weight-loss claims are disproven.',
        publicInterest: 'Fertility, TRT, bodybuilding, and weight-loss conversations surround HCG. The FDA specifically rejects the HCG weight-loss claim.',
        questionOne: 'How does HCG interact with the LH/CG receptor?',
        questionTwo: 'Which regulated uses have human evidence?',
        researchFinding: 'Regulated HCG drugs have established uses in selected fertility and hormone conditions.',
        unknown: 'General TRT support, hormone restoration, fertility preservation, and weight-loss outcomes from Encore material are not established.',
      },
      es: {
        headline: 'Una referencia de hormona reproductiva establecida para investigación controlada de señales.',
        support: 'HCG se estudia mediante el receptor LH/CG en modelos reproductivos y endocrinos; los medicamentos regulados tienen contextos médicos limitados.',
        evidenceLabel: 'Evidencia humana sólida — usos limitados',
        evidenceHeading: 'Evidencia humana sólida para medicamentos aprobados limitados; la afirmación de pérdida de peso está refutada.',
        publicInterest: 'Fertilidad, TRT, fisicoculturismo y pérdida de peso rodean a HCG. FDA rechaza específicamente la afirmación de pérdida de peso con HCG.',
        questionOne: '¿Cómo interactúa HCG con el receptor LH/CG?',
        questionTwo: '¿Qué usos regulados tienen evidencia humana?',
        researchFinding: 'Los medicamentos regulados de HCG tienen usos establecidos en ciertas condiciones de fertilidad y hormonas.',
        unknown: 'No están establecidos apoyo general para TRT, restauración hormonal, preservación de fertilidad ni pérdida de peso con material de Encore.',
      },
    },
  },
  'hgh-191aa': {
    name: 'HGH 191AA', visualVariant: 'hormone', accent: '#35b9a7', evidenceTone: 'human-trials',
    sources: [
      { href: 'https://www.accessdata.fda.gov/drugsatfda_docs/label/2016/020280s088lbl.pdf', en: 'FDA GENOTROPIN label', es: 'Etiqueta FDA de GENOTROPIN' },
      { href: 'https://www.deadiversion.usdoj.gov/drug_chem_info/hgh.pdf', en: 'DEA HGH use and misuse overview', es: 'Resumen DEA sobre uso y abuso de HGH' },
    ],
    locales: {
      en: {
        headline: 'Full-length growth-hormone reference material for controlled GH/IGF research.',
        support: 'HGH 191AA is used to examine growth-hormone receptor and downstream IGF signaling while keeping regulated-drug evidence separate.',
        evidenceLabel: 'Strong human evidence — narrow uses',
        evidenceHeading: 'Strong evidence for narrow approved drugs; enhancement claims are unsupported.',
        publicInterest: 'Muscle, fat loss, recovery, skin, and anti-aging claims drive demand. Those enhancement claims are not appropriate conclusions from approved-drug research.',
        questionOne: 'How does the GH receptor start the signal?',
        questionTwo: 'What do approved-drug studies actually cover?',
        researchFinding: 'Regulated somatropin is approved for specific growth-hormone deficiencies and a small number of defined conditions.',
        unknown: 'Bodybuilding, fat-loss, anti-aging, recovery, and younger-skin outcomes from Encore material are not established.',
      },
      es: {
        headline: 'Material de referencia de hormona del crecimiento completa para investigación controlada GH/IGF.',
        support: 'HGH 191AA se usa para examinar el receptor de hormona del crecimiento y señales IGF posteriores, manteniendo separada la evidencia farmacéutica regulada.',
        evidenceLabel: 'Evidencia humana sólida — usos limitados',
        evidenceHeading: 'Evidencia sólida para medicamentos aprobados limitados; las afirmaciones de mejora no están respaldadas.',
        publicInterest: 'Músculo, pérdida de grasa, recuperación, piel y antienvejecimiento impulsan la demanda. Esas afirmaciones no son conclusiones apropiadas de la investigación regulada.',
        questionOne: '¿Cómo inicia la señal el receptor de GH?',
        questionTwo: '¿Qué cubren realmente los estudios de medicamentos aprobados?',
        researchFinding: 'La somatropina regulada está aprobada para deficiencias específicas de hormona del crecimiento y pocas condiciones definidas.',
        unknown: 'No están establecidos fisicoculturismo, pérdida de grasa, antienvejecimiento, recuperación ni piel joven con material de Encore.',
      },
    },
  },
  'thymosin-alpha-1': {
    name: 'Thymosin Alpha-1', visualVariant: 'longevity', accent: '#3cbda1', evidenceTone: 'early-human',
    sources: [
      { href: 'https://pubmed.ncbi.nlm.nih.gov/33362999/', en: '2020 human-evidence review', es: 'Revisión 2020 de evidencia humana' },
      { href: 'https://pubmed.ncbi.nlm.nih.gov/39814420/', en: '2025 Phase 3 sepsis trial', es: 'Ensayo fase 3 de sepsis de 2025' },
    ],
    locales: {
      en: {
        headline: 'Immune-regulation research with a substantial—and mixed—human history.',
        support: 'Thymosin Alpha-1 is studied in immune-regulation and condition-specific clinical contexts, including important neutral findings.',
        evidenceLabel: 'Meaningful mixed human evidence',
        evidenceHeading: 'Meaningful human evidence that remains mixed and condition-specific.',
        publicInterest: 'Immune resilience, fewer illnesses, post-viral recovery, and inflammation drive interest. Broad “immune support” language overstates the record.',
        questionOne: 'How are immune-regulation signals measured?',
        questionTwo: 'Why do neutral trial results matter?',
        researchFinding: 'Human research spans several conditions, while a large 2025 Phase 3 sepsis trial found no clear mortality benefit.',
        unknown: 'Disease prevention, general immune boosting, long-COVID treatment, and broad resilience outcomes are not established.',
      },
      es: {
        headline: 'Investigación de regulación inmunitaria con una historia humana importante y mixta.',
        support: 'Thymosin Alpha-1 se estudia en regulación inmunitaria y contextos clínicos específicos, incluidos hallazgos neutrales importantes.',
        evidenceLabel: 'Evidencia humana relevante y mixta',
        evidenceHeading: 'Evidencia humana relevante que sigue siendo mixta y específica de cada condición.',
        publicInterest: 'Resistencia inmunitaria, menos enfermedades, recuperación posviral e inflamación impulsan el interés. “Apoyo inmunitario” exagera el registro.',
        questionOne: '¿Cómo se miden las señales de regulación inmunitaria?',
        questionTwo: '¿Por qué importan los resultados neutrales?',
        researchFinding: 'La investigación humana abarca varias condiciones; un gran ensayo fase 3 de sepsis de 2025 no encontró beneficio claro de mortalidad.',
        unknown: 'No están establecidos prevención de enfermedades, aumento general de inmunidad, tratamiento de COVID largo ni resiliencia amplia.',
      },
    },
  },
  'pt-141': {
    name: 'PT-141', visualVariant: 'hormone', accent: '#49b9ad', evidenceTone: 'human-trials',
    sources: [
      { href: 'https://www.accessdata.fda.gov/drugsatfda_docs/label/2020/210557s002lbl.pdf', en: 'FDA VYLEESI label', es: 'Etiqueta FDA de VYLEESI' },
      { href: 'https://pubmed.ncbi.nlm.nih.gov/31599840/', en: 'Two Phase 3 trials', es: 'Dos ensayos fase 3' },
    ],
    locales: {
      en: {
        headline: 'Central sexual-response research with one clearly defined human evidence base.',
        support: 'PT-141 is studied through melanocortin signaling, with Phase 3 pharmaceutical evidence in one narrow female population.',
        evidenceLabel: 'Strong human evidence — narrow use',
        evidenceHeading: 'Strong human evidence for one narrow approved-drug use.',
        publicInterest: 'Desire, arousal, erections, and general sexual enhancement drive attention. The approved evidence does not cover every person or every goal.',
        questionOne: 'How does central melanocortin signaling work?',
        questionTwo: 'Who was actually studied in Phase 3 trials?',
        researchFinding: 'Bremelanotide trials studied acquired, generalized low sexual desire causing distress in premenopausal women.',
        unknown: 'General enhancement, outcomes in men, erectile-dysfunction treatment, and outcomes from Encore material are not established.',
      },
      es: {
        headline: 'Investigación de respuesta sexual central con una base de evidencia humana claramente definida.',
        support: 'PT-141 se estudia mediante señalización de melanocortina, con evidencia farmacéutica fase 3 en una población femenina limitada.',
        evidenceLabel: 'Evidencia humana sólida — uso limitado',
        evidenceHeading: 'Evidencia humana sólida para un uso farmacéutico aprobado y limitado.',
        publicInterest: 'Deseo, excitación, erecciones y mejora sexual general impulsan la atención. La evidencia aprobada no cubre a todas las personas ni todas las metas.',
        questionOne: '¿Cómo funciona la señalización central de melanocortina?',
        questionTwo: '¿Quiénes fueron estudiadas en los ensayos fase 3?',
        researchFinding: 'Los ensayos de bremelanotida estudiaron deseo sexual bajo adquirido y generalizado que causaba malestar en mujeres premenopáusicas.',
        unknown: 'No están establecidos mejora general, resultados en hombres, tratamiento de disfunción eréctil ni resultados del material de Encore.',
      },
    },
  },
  semax: {
    name: 'Semax', visualVariant: 'cognitive', accent: '#52b6c5', evidenceTone: 'preclinical',
    sources: [
      { href: 'https://pubmed.ncbi.nlm.nih.gov/17353092/', en: 'Rat neurotrophin study', es: 'Estudio de neurotrofinas en ratas' },
      { href: 'https://pubmed.ncbi.nlm.nih.gov/24661604/', en: 'Rat brain-injury gene study', es: 'Estudio génico de lesión cerebral en ratas' },
    ],
    locales: {
      en: {
        headline: 'Explore a neuroactive peptide across learning, stress, and brain-response models.',
        support: 'Semax is studied in neurotrophin, gene-expression, learning, stress, and brain-injury models, with limited modern human evidence.',
        evidenceLabel: 'Mostly preclinical research',
        evidenceHeading: 'Mostly animal evidence with limited older human reports.',
        publicInterest: 'Focus, motivation, memory, and “nootropic” language drive demand. Self-reports also include anxiety, irritability, and no effect.',
        questionOne: 'What changes in neurotrophin models?',
        questionTwo: 'How are brain-response signals measured?',
        researchFinding: 'Modern accessible evidence is concentrated in rat brain and injury models; older human reports are not a robust independent evidence base.',
        unknown: 'Reliable focus, memory, motivation, brain-repair, or cognitive-enhancement outcomes are not established.',
      },
      es: {
        headline: 'Explora un péptido neuroactivo en modelos de aprendizaje, estrés y respuesta cerebral.',
        support: 'Semax se estudia en modelos de neurotrofinas, expresión génica, aprendizaje, estrés y lesión cerebral, con evidencia humana moderna limitada.',
        evidenceLabel: 'Investigación principalmente preclínica',
        evidenceHeading: 'Principalmente animales, con informes humanos antiguos y limitados.',
        publicInterest: 'Enfoque, motivación, memoria y lenguaje “nootrópico” impulsan la demanda. También se reportan ansiedad, irritabilidad y ningún efecto.',
        questionOne: '¿Qué cambia en modelos de neurotrofinas?',
        questionTwo: '¿Cómo se miden las señales de respuesta cerebral?',
        researchFinding: 'La evidencia moderna accesible se concentra en modelos de cerebro y lesión de ratas; los informes humanos antiguos no forman una base independiente sólida.',
        unknown: 'No están establecidos resultados confiables de enfoque, memoria, motivación, reparación cerebral ni mejora cognitiva.',
      },
    },
  },
  selank: {
    name: 'Selank', visualVariant: 'cognitive', accent: '#54b8bc', evidenceTone: 'early-human',
    sources: [
      { href: 'https://pubmed.ncbi.nlm.nih.gov/25176261/', en: 'Small comparative human study', es: 'Estudio humano comparativo pequeño' },
      { href: 'https://pubmed.ncbi.nlm.nih.gov/30255741/', en: 'Mechanistic evidence review', es: 'Revisión de evidencia mecanística' },
    ],
    locales: {
      en: {
        headline: 'Study stress and GABA-related signaling with the evidence kept in proportion.',
        support: 'Selank is a tuftsin-derived peptide examined in stress, receptor, and early anxiety research.',
        evidenceLabel: 'Early, limited human research',
        evidenceHeading: 'Early, limited human evidence plus laboratory research.',
        publicInterest: 'Calm focus, anxiety relief, mood, and stress tolerance drive attention. Public experiences are mixed and sometimes negative.',
        questionOne: 'How are GABA-related signals explored?',
        questionTwo: 'What did the small human study measure?',
        researchFinding: 'A small comparative study reported anxiety-related changes, but the broader evidence base is limited and concentrated in Russian research.',
        unknown: 'Reliable anxiety relief, mood support, calm focus, or replacement of prescribed care is not established.',
      },
      es: {
        headline: 'Estudia el estrés y la señalización relacionada con GABA manteniendo la evidencia en proporción.',
        support: 'Selank es un péptido derivado de tuftsin examinado en investigación de estrés, receptores y ansiedad inicial.',
        evidenceLabel: 'Investigación humana inicial y limitada',
        evidenceHeading: 'Evidencia humana inicial y limitada, más investigación de laboratorio.',
        publicInterest: 'Enfoque tranquilo, alivio de ansiedad, ánimo y tolerancia al estrés impulsan la atención. Las experiencias públicas son mixtas y a veces negativas.',
        questionOne: '¿Cómo se exploran las señales relacionadas con GABA?',
        questionTwo: '¿Qué midió el pequeño estudio humano?',
        researchFinding: 'Un estudio comparativo pequeño reportó cambios relacionados con ansiedad, pero la base general es limitada y concentrada en investigación rusa.',
        unknown: 'No están establecidos alivio confiable de ansiedad, apoyo del ánimo, enfoque tranquilo ni reemplazo de atención recetada.',
      },
    },
  },
  'bac-water': {
    name: 'BAC Water', visualVariant: 'accessory', accent: '#6bb7b0', evidenceTone: 'preclinical',
    sources: [
      { href: 'https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/hospira-inc-issues-voluntary-nationwide-recall-one-lot-bacteriostatic-water-injection-usp-due', en: 'FDA product description', es: 'Descripción FDA del producto' },
      { href: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=7db2e5a1-302f-43d4-b65b-5e14a41091c1', en: 'DailyMed reference label', es: 'Etiqueta de referencia DailyMed' },
    ],
    locales: {
      en: {
        headline: 'A clearly labeled laboratory accessory for documented workflows.',
        support: 'BAC Water is preserved sterile water intended only for compatible dilution contexts described by the relevant manufacturer documentation.',
        evidenceLabel: 'Laboratory accessory',
        evidenceHeading: 'An accessory with no biological benefit to market.',
        publicInterest: 'Most public conversation concerns mixing and injection preparation. Those instructions do not belong on a public Research Use Only page.',
        questionOne: 'What makes this a laboratory accessory?',
        questionTwo: 'Why must compatibility be checked?',
        researchFinding: 'Regulated descriptions identify bacteriostatic water as sterile water containing benzyl alcohol for compatible dilution contexts.',
        unknown: 'Universal compatibility, safety for every product, and any biological benefit are not established.',
      },
      es: {
        headline: 'Un accesorio de laboratorio claramente etiquetado para flujos documentados.',
        support: 'BAC Water es agua estéril conservada, destinada únicamente a contextos de dilución compatibles descritos por la documentación del fabricante correspondiente.',
        evidenceLabel: 'Accesorio de laboratorio',
        evidenceHeading: 'Un accesorio sin beneficio biológico que promocionar.',
        publicInterest: 'La conversación pública trata principalmente de mezcla y preparación de inyecciones. Esas instrucciones no pertenecen a una página pública de uso exclusivo para investigación.',
        questionOne: '¿Qué lo convierte en un accesorio de laboratorio?',
        questionTwo: '¿Por qué debe verificarse la compatibilidad?',
        researchFinding: 'Las descripciones reguladas identifican el agua bacteriostática como agua estéril con alcohol bencílico para contextos de dilución compatibles.',
        unknown: 'No están establecidas compatibilidad universal, seguridad para cada producto ni beneficios biológicos.',
      },
    },
  },
} satisfies Record<string, ProductConversionProfile>

export type RemainingConversionProductSlug = keyof typeof productConversionProfiles

export function isRemainingConversionProductSlug(slug: string): slug is RemainingConversionProductSlug {
  return slug in productConversionProfiles
}
