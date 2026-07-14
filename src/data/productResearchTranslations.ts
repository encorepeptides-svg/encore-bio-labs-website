import type { Locale } from '../i18n/config'
import type { Product } from './products'
import type { ProductResearchContent } from './productResearchContent'

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
      description: `La etapa «${step.label}» se evalúa dentro de modelos y condiciones experimentales específicos.`,
    })),
    researchAreas: content.researchAreas.map((area) => ({
      ...area,
      summary: `Estudia ${area.title.toLowerCase()} dentro del modelo y el nivel de evidencia descritos.`,
    })),
    studies: content.studies.map((study) => ({
      ...study,
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
    faq: content.faq.map((item) => ({
      ...item,
      answer: `${item.answer} La evidencia debe leerse según el modelo, los parámetros y las limitaciones de la publicación.`,
    })),
  }
}
