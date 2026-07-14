import type { notFound as notFoundEn } from '../en/notFound'

export const notFound = {
  eyebrow: 'Página no encontrada',
  title: 'Esta página no está disponible.',
  body: 'Es posible que la dirección esté desactualizada o sea incorrecta. Continúa explorando nuestro catálogo de investigación activo o vuelve al inicio.',
  browseCatalog: 'Explorar el catálogo',
  returnHome: 'Volver al inicio',
} satisfies Record<keyof typeof notFoundEn, string>
