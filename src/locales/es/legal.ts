import type { legal as legalEn } from '../en/legal'

export const legal = {
  eyebrow: 'Legal',
  termsOfService: 'Términos de servicio',
  privacyPolicy: 'Política de privacidad',
  shippingReturns: 'Envíos y devoluciones',
  effectiveDate: 'Fecha de entrada en vigor: {date}',
  counselNotice: 'Estas políticas están redactadas para el contexto de un sitio web de uso exclusivo para investigación y deben ser revisadas por un asesor legal calificado antes de aplicarse a una transacción o jurisdicción específica.',
  questionsTitle: '¿Tiene preguntas sobre esta página?',
  questionsBodyPrefix: 'Contacte a Encore Bio Labs a través del',
  questionsBodyConnector: 'o por WhatsApp al',
  researchIntakeProcess: 'proceso de solicitud de investigación',
} satisfies Record<keyof typeof legalEn, string>
