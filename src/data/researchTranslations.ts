import type { Locale } from '../i18n/config'
import {
  contentTypeLabels,
  glossaryTerms,
  type GlossaryTerm,
  type ResearchArticle,
  type ResearchContentType,
} from './research'

const contentTypeLabelsEs: Record<ResearchContentType, string> = {
  'deep-dive': 'Análisis de compuesto',
  mechanism: 'Explicación de mecanismo',
  comparison: 'Guía comparativa',
  beginner: 'Conceptos básicos',
}

const contentTypeDescriptionsEs: Record<ResearchContentType, string> = {
  'deep-dive': 'Contexto del compuesto, vías estudiadas y límites de la evidencia disponible.',
  mechanism: 'Explicación accesible de la vía biológica y los parámetros que se estudian.',
  comparison: 'Comparación de enfoques de investigación sin clasificar ni recomendar productos.',
  beginner: 'Punto de partida para entender el catálogo y su lenguaje de investigación.',
}

const glossaryTermsEs: GlossaryTerm[] = [
  { term: 'Uso exclusivo para investigación (RUO)', definition: 'Clasificación que indica que un producto está destinado únicamente a investigación de laboratorio o institucional, no al consumo humano o animal, diagnóstico ni tratamiento.' },
  { term: 'Péptido', definition: 'Cadena corta de aminoácidos unidos entre sí; es más pequeña que una proteína completa y forma la base estructural de muchos compuestos del catálogo.' },
  { term: 'Liofilización', definition: 'Proceso de secado por congelación que elimina el agua para estabilizar un compuesto durante el almacenamiento y produce el polvo o sólido presente en muchos viales.' },
  { term: 'Reconstitución', definition: 'Proceso de disolver un compuesto liofilizado en un diluyente líquido dentro de un entorno de investigación calificado.' },
  { term: 'Agua bacteriostática', definition: 'Diluyente con una pequeña cantidad de conservador, citado con frecuencia en la literatura de investigación con péptidos.' },
  { term: 'Agonista o antagonista de receptor', definition: 'Un agonista activa un receptor biológico y genera una señal; un antagonista bloquea o reduce esa respuesta.' },
  { term: 'Certificado de análisis (COA)', definition: 'Documento de pruebas que informa la identidad, pureza y otros atributos medidos de un lote específico.' },
  { term: 'Vida media en investigación', definition: 'Tiempo necesario para que la mitad de un compuesto se elimine o degrade dentro de un modelo de investigación.' },
  { term: 'Análogo de péptido', definition: 'Versión modificada de un péptido natural, diseñada para estudiar cambios en afinidad, estabilidad o duración dentro de modelos controlados.' },
  { term: 'Secretagogo', definition: 'Sustancia que provoca la secreción de otra; por ejemplo, un compuesto que estimula la liberación de hormona de crecimiento.' },
]

export function localizedContentTypeLabel(type: ResearchContentType, locale: Locale): string {
  return locale === 'es' ? contentTypeLabelsEs[type] : contentTypeLabels[type]
}

export function getLocalizedResearchArticle(
  article: ResearchArticle,
  locale: Locale,
  context: { productName?: string; categoryName?: string } = {},
): ResearchArticle {
  if (locale === 'en') return article

  const subject = context.productName ?? context.categoryName
  const title = subject
    ? `${contentTypeLabelsEs[article.contentType]}: ${subject}`
    : article.contentType === 'beginner'
      ? 'Conceptos esenciales del catálogo de investigación'
      : contentTypeLabelsEs[article.contentType]

  return {
    ...article,
    title,
    description: contentTypeDescriptionsEs[article.contentType],
  }
}

export function getLocalizedGlossaryTerms(locale: Locale): GlossaryTerm[] {
  return locale === 'es' ? glossaryTermsEs : glossaryTerms
}
