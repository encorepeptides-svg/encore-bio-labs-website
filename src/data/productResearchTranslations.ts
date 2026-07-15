import type { Locale } from '../i18n/config'
import type { Product } from './products'
import type { ProductResearchContent } from './productResearchContent'

/**
 * Spanish titles for the research-area cards ("Research Applications" section).
 * These are the short, visitor-facing area names shown on every product's deep
 * research section; the surrounding summaries stay generic Spanish. A title with
 * no entry falls back to its English source.
 */
const researchAreaTitleEs: Record<string, string> = {
  'AMPK-associated signaling': 'Señalización asociada con AMPK',
  'Accessory classification': 'Clasificación de accesorio',
  'Acute neurological research': 'Investigación neurológica aguda',
  'Angiogenesis-associated signaling': 'Señalización asociada con la angiogénesis',
  'Angiogenesis-related assays': 'Ensayos relacionados con la angiogénesis',
  'Antigen presentation': 'Presentación de antígenos',
  'Biomarker reproducibility': 'Reproducibilidad de biomarcadores',
  'Cardiolipin biophysics': 'Biofísica de la cardiolipina',
  'Cell proliferation': 'Proliferación celular',
  'Clinical evidence gap': 'Brecha de evidencia clínica',
  'Cognitive outcomes': 'Resultados cognitivos',
  'Combination evidence': 'Evidencia de la combinación',
  'Controlled human outcomes': 'Resultados en humanos controlados',
  'Copper-peptide matrix biology': 'Biología de matriz del péptido de cobre',
  'Critical-care immune response': 'Respuesta inmune en cuidados intensivos',
  'Dermal-papilla biology': 'Biología de la papila dérmica',
  'Endocrine feedback': 'Retroalimentación endocrina',
  'Endothelial-cell migration': 'Migración de células endoteliales',
  'Energy-balance models': 'Modelos de balance energético',
  'Evidence inconsistency': 'Inconsistencia de la evidencia',
  'Evidence translation': 'Traslación de la evidencia',
  'Evidence variability': 'Variabilidad de la evidencia',
  'Exercise-associated biology': 'Biología asociada al ejercicio',
  'Extracellular matrix': 'Matriz extracelular',
  'Follicle organ culture': 'Cultivo de órgano folicular',
  'GABA receptor modulation': 'Modulación del receptor GABA',
  'GH and IGF-1 signaling': 'Señalización de GH e IGF-1',
  'GH receptor signaling': 'Señalización del receptor de GH',
  'GH-deficiency research': 'Investigación de deficiencia de GH',
  'GHRH analog pharmacology': 'Farmacología del análogo de GHRH',
  'Ghrelin-receptor secretagogue': 'Secretagogo del receptor de grelina',
  'GnRH pulse biology': 'Biología del pulso de GnRH',
  'Growth-hormone receptor separation': 'Separación del receptor de hormona de crecimiento',
  'Human body stores': 'Reservas del cuerpo humano',
  'Human evidence gap': 'Brecha de evidencia en humanos',
  'Human tissue aging': 'Envejecimiento del tejido humano',
  'IGF-1 response': 'Respuesta de IGF-1',
  'IGF-binding proteins': 'Proteínas de unión a IGF',
  'Inflammatory-pathway research': 'Investigación de vías inflamatorias',
  'Ischemia transcriptomics': 'Transcriptómica de la isquemia',
  'Keratinocyte biology': 'Biología de los queratinocitos',
  'Lipid and glucose markers': 'Marcadores de lípidos y glucosa',
  'Liver-fat imaging': 'Imagenología de grasa hepática',
  'Male endocrine response': 'Respuesta endocrina masculina',
  'Mechanism uncertainty': 'Incertidumbre del mecanismo',
  'Melanocortin signaling': 'Señalización de melanocortina',
  'Metabolic homeostasis': 'Homeostasis metabólica',
  'Mitochondrial energetics': 'Energética mitocondrial',
  'Mixed trial record': 'Registro mixto de ensayos',
  'Muscle homeostasis': 'Homeostasis muscular',
  'Neuronal gene expression': 'Expresión génica neuronal',
  'Neurotrophin expression': 'Expresión de neurotrofinas',
  'Peptide-form differences': 'Diferencias entre formas del péptido',
  'Pituitary localization': 'Localización hipofisaria',
  'Primary mitochondrial myopathy': 'Miopatía mitocondrial primaria',
  'Purchase-rule separation': 'Separación de reglas de compra',
  'Receptor biochemistry': 'Bioquímica del receptor',
  'Redox homeostasis': 'Homeostasis redox',
  'Redox metabolism': 'Metabolismo redox',
  'Repair and cell-migration signaling': 'Señalización de reparación y migración celular',
  'Reproductive disorders': 'Trastornos reproductivos',
  'Reproductive-axis protocols': 'Protocolos del eje reproductivo',
  'Sleep architecture': 'Arquitectura del sueño',
  'Specification review': 'Revisión de especificaciones',
  'Telomerase-associated biology': 'Biología asociada a la telomerasa',
  'Telomere length': 'Longitud de los telómeros',
  'Tendon and ligament models': 'Modelos de tendón y ligamento',
  'Tolerability profile': 'Perfil de tolerabilidad',
  'Visceral adipose tissue': 'Tejido adiposo visceral',
}

/** Keeps one research registry while supplying a Spanish presentation layer. */
export function localizeProductResearchContent(product: Product, content: ProductResearchContent, locale: Locale): ProductResearchContent {
  if (locale === 'en') return content
  return {
    ...content,
    compoundClass: 'Material de investigación catalogado',
    primaryFocus: `Investigación de ${product.name}`,
    biologicalPathway: 'Vías biológicas descritas en la literatura del compuesto.',
    evidenceProfile: 'Evidencia dependiente del modelo y del estudio',
    overview: `${product.name} se presenta como material de investigación para estudiar las preguntas descritas en la literatura disponible. La interpretación depende del modelo, la formulación y los parámetros medidos en cada estudio.`,
    scientificIdentity: 'La identidad, la pureza y la documentación deben verificarse para cada material y lote; la literatura publicada no valida por sí sola un producto de catálogo.',
    howStudied: 'La investigación puede incluir modelos celulares, animales, observacionales o clínicos, según el registro. Cada modelo tiene límites y no debe extrapolarse a resultados individuales.',
    mechanismSummary: `Los estudios de ${product.name} examinan las vías descritas para esta entrada mediante parámetros medibles. La relación entre un mecanismo propuesto y un resultado depende del diseño experimental.`,
    mechanismSteps: content.mechanismSteps.map((step, index) => ({
      ...step,
      label: ['Material de investigación', 'Objetivo molecular', 'Señal biológica', 'Parámetro intermedio', 'Resultado medido'][index] ?? 'Etapa de investigación',
      description: 'Esta etapa se evalúa dentro de modelos y condiciones experimentales específicos.',
    })),
    researchAreas: content.researchAreas.map((area) => {
      const titleEs = researchAreaTitleEs[area.title] ?? 'Área de investigación relacionada'
      return {
        ...area,
        title: titleEs,
        summary: `${titleEs} — estudiada dentro del modelo y el nivel de evidencia descritos.`,
      }
    }),
    studies: content.studies.map((study) => ({
      ...study,
      title: `Estudio de ${product.name} (${study.year})`,
      summary: `Registro ${study.year}: el estudio examina ${product.name} dentro del modelo y los parámetros descritos en la publicación original.`,
      keyFinding: 'El estudio informa hallazgos dentro del modelo descrito; no establece resultados individuales ni valida materiales de catálogo.',
      limitation: 'La población, el modelo y el diseño limitan cualquier generalización fuera de las condiciones publicadas.',
    })),
    limitations: [
      'La fuerza de la evidencia depende del modelo y del diseño de cada estudio.',
      'Los hallazgos publicados no garantizan identidad, pureza o desempeño de un material de terceros.',
      'Los parámetros experimentales no equivalen a resultados clínicos o individuales.',
      'La interpretación debe mantenerse dentro del contexto de uso exclusivo para investigación.',
    ],
    faq: content.faq.map(() => ({
      question: `¿Qué debe considerarse al revisar ${product.name}?`,
      answer: 'La evidencia debe leerse según el modelo, los parámetros y las limitaciones de cada publicación.',
    })),
  }
}
