import type { Locale } from './config'

type PageMeta = { title: string; description: string }
type LocalizedPageMeta = Record<Locale, PageMeta>

/**
 * Static route metadata keyed by the *logical* (locale-agnostic) path, e.g.
 * "/catalog" covers both "/catalog" and "/es/catalog". Category and product
 * pages compute their own metadata (see getCategoryMetadata / ProductPage).
 */
export const pageMetadata: Record<string, LocalizedPageMeta> = {
  '/': {
    en: { title: 'Encore Bio Labs | Research-grade compounds', description: 'Explore Encore Bio Labs research-use-only products, documentation, complete kits, and inquiry support.' },
    es: { title: 'Encore Bio Labs | Compuestos de investigación premium', description: 'Descubre los productos exclusivos para investigación de Encore Bio Labs, con documentación, kits completos y atención personalizada.' },
  },
  '/catalog': {
    en: { title: 'Research Compound Catalog | Encore Bio Labs', description: 'Compare research compounds by biological context, formulation, available strength, price, and supporting product documentation.' },
    es: { title: 'Catálogo de compuestos de investigación | Encore Bio Labs', description: 'Compara compuestos por contexto biológico, formulación, concentración disponible, precio y documentación de respaldo.' },
  },
  '/cart': {
    en: { title: 'Research Cart | Encore Bio Labs', description: 'Review selected research products, strengths, quantities, and catalog subtotal.' },
    es: { title: 'Carrito de investigación | Encore Bio Labs', description: 'Revisa los productos que seleccionaste, sus concentraciones, cantidades y el subtotal.' },
  },
  '/checkout': {
    en: { title: 'Order Information | Encore Bio Labs', description: 'Review an Encore Bio Labs research order inquiry and provide contact and shipping information.' },
    es: { title: 'Información del pedido | Encore Bio Labs', description: 'Revisa tu solicitud de pedido con Encore Bio Labs y proporciona tus datos de contacto y envío.' },
  },
  '/contact': {
    en: { title: 'Contact Encore Bio Labs | Product, Order & Shipping Support', description: 'Contact Encore Bio Labs for research product information, order assistance, local delivery questions, and nationwide shipping support.' },
    es: { title: 'Contacta a Encore Bio Labs | Productos, pedidos y envíos', description: 'Contacta a Encore Bio Labs para recibir información sobre productos de investigación, pedidos, entregas locales y envíos nacionales.' },
  },
  '/faq': {
    en: { title: 'Research Product FAQ | Encore Bio Labs', description: 'Read answers about research-use classification, products, documentation, ordering, shipping, and support.' },
    es: { title: 'Preguntas frecuentes | Encore Bio Labs', description: 'Encuentra respuestas sobre nuestra clasificación de uso exclusivo para investigación, productos, documentación, pedidos, envíos y soporte.' },
  },
  '/about': {
    en: { title: 'About Encore Bio Labs', description: 'Learn about Encore Bio Labs, its research catalog, documentation-first approach, and responsible product positioning.' },
    es: { title: 'Sobre Encore Bio Labs', description: 'Conoce a Encore Bio Labs, nuestro catálogo de investigación, nuestro enfoque centrado en la documentación y nuestro compromiso con la transparencia.' },
  },
  '/review-preview': {
    en: { title: 'Draft Review Preview | Encore Bio Labs', description: 'Development-only preview of imported review drafts that are not approved or published.' },
    es: { title: 'Vista previa de reseñas en borrador | Encore Bio Labs', description: 'Vista previa exclusiva para desarrollo de reseñas importadas que no están aprobadas ni publicadas.' },
  },
  '/intake': {
    en: { title: 'Research Intake | Encore Bio Labs', description: 'Share your research interests for a qualified Encore Bio Labs catalog review.' },
    es: { title: 'Inicia tu proceso de investigación | Encore Bio Labs', description: 'Cuéntanos sobre tus intereses de investigación y recibe una recomendación personalizada de nuestro catálogo.' },
  },
  '/quality': {
    en: { title: 'Quality and Documentation | Encore Bio Labs', description: 'Review Encore Bio Labs quality, documentation, handling, and research-use standards.' },
    es: { title: 'Calidad y documentación | Encore Bio Labs', description: 'Conoce los estándares de calidad, documentación, manejo y uso exclusivo para investigación de Encore Bio Labs.' },
  },
  '/kits': {
    en: { title: 'Encore Complete Kit', description: 'Review the shared components included with eligible Encore Bio Labs research products.' },
    es: { title: 'Kit completo de Encore', description: 'Conoce los componentes incluidos con los productos de investigación elegibles de Encore Bio Labs.' },
  },
  '/research': {
    en: { title: 'Research Library | Encore Bio Labs', description: 'Explore research-use educational material and product-category context from Encore Bio Labs.' },
    es: { title: 'Biblioteca de investigación | Encore Bio Labs', description: 'Explora material educativo y contexto por categoría de producto de Encore Bio Labs.' },
  },
  '/research/retatrutide': {
    en: { title: 'Retatrutide Research | Encore Bio Labs', description: 'Review educational Retatrutide research context, evidence status, and research-use limitations.' },
    es: { title: 'Investigación sobre Retatrutide | Encore Bio Labs', description: 'Conoce el contexto educativo, el estado de la evidencia y las limitaciones de uso exclusivo para investigación de Retatrutide.' },
  },
  '/legal/terms': {
    en: { title: 'Terms of Service | Encore Bio Labs', description: 'Read the Encore Bio Labs terms governing site access and research catalog inquiries.' },
    es: { title: 'Términos de servicio | Encore Bio Labs', description: 'Lee los términos que rigen el acceso al sitio y las solicitudes del catálogo de investigación de Encore Bio Labs.' },
  },
  '/legal/privacy': {
    en: { title: 'Privacy Policy | Encore Bio Labs', description: 'Read how Encore Bio Labs handles information submitted through the website.' },
    es: { title: 'Política de privacidad | Encore Bio Labs', description: 'Conoce cómo Encore Bio Labs maneja la información que envías a través del sitio web.' },
  },
  '/legal/shipping-returns': {
    en: { title: 'Shipping and Returns | Encore Bio Labs', description: 'Review Encore Bio Labs shipping, delivery, return, and support policies.' },
    es: { title: 'Envíos y devoluciones | Encore Bio Labs', description: 'Conoce las políticas de envío, entrega, devoluciones y soporte de Encore Bio Labs.' },
  },
  '/client-login': {
    en: { title: 'Sign In | Encore Bio Labs Client Portal', description: 'Sign in to the Encore Bio Labs private client portal to review your progress, orders, and documents.' },
    es: { title: 'Iniciar sesión | Portal de clientes de Encore Bio Labs', description: 'Inicia sesión en el portal privado de Encore Bio Labs para revisar tu progreso, pedidos y documentos.' },
  },
  '/client-register': {
    en: { title: 'Create Account | Encore Bio Labs Client Portal', description: 'Create an Encore Bio Labs client account to access your private research portal.' },
    es: { title: 'Crear cuenta | Portal de clientes de Encore Bio Labs', description: 'Crea tu cuenta de cliente de Encore Bio Labs para acceder a tu portal privado de investigación.' },
  },
  '/client-forgot-password': {
    en: { title: 'Reset Password | Encore Bio Labs Client Portal', description: 'Request a password reset for your Encore Bio Labs client portal account.' },
    es: { title: 'Restablecer contraseña | Portal de clientes de Encore Bio Labs', description: 'Solicita restablecer la contraseña de tu cuenta del portal de clientes de Encore Bio Labs.' },
  },
  '/client-reset-password': {
    en: { title: 'Choose a New Password | Encore Bio Labs Client Portal', description: 'Choose a new password for your Encore Bio Labs client portal account.' },
    es: { title: 'Elige una nueva contraseña | Portal de clientes de Encore Bio Labs', description: 'Elige una nueva contraseña para tu cuenta del portal de clientes de Encore Bio Labs.' },
  },
  '/portal': {
    en: { title: 'Client Portal | Encore Bio Labs', description: 'Your private Encore Bio Labs workspace for progress, orders, documents, and support.' },
    es: { title: 'Portal de clientes | Encore Bio Labs', description: 'Tu espacio privado de Encore Bio Labs para progreso, pedidos, documentos y soporte.' },
  },
}

export const notFoundMetadata: LocalizedPageMeta = {
  en: { title: 'Page Not Found | Encore Bio Labs', description: 'The requested Encore Bio Labs page is not available.' },
  es: { title: 'Página no encontrada | Encore Bio Labs', description: 'La página que buscas no está disponible.' },
}

const categoryNameEs: Record<string, string> = {
  'metabolic-weight-management': 'Metabolismo y control de peso',
  'recovery-regeneration': 'Recuperación y regeneración',
  'longevity-cellular-health': 'Longevidad y salud celular',
  'cognitive-performance': 'Rendimiento cognitivo',
  'hormone-wellness': 'Hormonas y bienestar',
}

export function getCategoryMetadata(slug: string, englishName: string): LocalizedPageMeta {
  if (slug === 'metabolic-weight-management') {
    return {
      en: {
        title: 'Metabolic Research Peptides | Encore Bio Labs',
        description: 'Compare Retatrutide, Tesamorelin, MOTS-C, AOD-9604, and CJC-1295 + Ipamorelin by research pathway, format, price, and documentation.',
      },
      es: {
        title: 'Péptidos de investigación metabólica | Encore Bio Labs',
        description: 'Compara Retatrutide, Tesamorelin, MOTS-C, AOD-9604 y CJC-1295 + Ipamorelin por vía de investigación, formato, precio y documentación.',
      },
    }
  }
  const spanishName = categoryNameEs[slug] ?? englishName
  return {
    en: {
      title: `${englishName} Research | Encore Bio Labs`,
      description: `Explore Encore Bio Labs ${englishName.toLowerCase()} research products and educational context.`,
    },
    es: {
      title: `Investigación en ${spanishName} | Encore Bio Labs`,
      description: `Explora los productos de investigación de Encore Bio Labs en ${spanishName.toLowerCase()} y su contexto educativo.`,
    },
  }
}
