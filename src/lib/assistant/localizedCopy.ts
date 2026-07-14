import type { Locale } from '../../i18n/config'
import type { QuickReply } from './types'

export type AssistantCopy = {
  welcome: string
  quickReplies: QuickReply[]
  escalationPrompts: Record<'product' | 'strength' | 'quantity' | 'city' | 'deliveryPreference', string>
  thanks: string
  catalogResponse: string
  bestSellersIntro: string
  pricingResponse: string
  shippingResponse: string
  localDeliveryResponse: string
  trackResponse: string
  contactResponse: string
  orderResponse: string
  helloResponse: string
  fallbackResponse: string
  continueWhatsapp: string
}

const english: AssistantCopy = {
  welcome: 'Hi! I’m the Encore AI Assistant.\n\nI can help you with:\n\n• Product information\n• Pricing\n• Local delivery\n• Shipping destination review\n• Delivery and handling confirmation\n• Ordering\n\nHow may I help you today?',
  quickReplies: [
    { id: 'browse-products', label: 'Browse Products' },
    { id: 'pricing', label: 'Pricing' },
    { id: 'order-whatsapp', label: 'Order on WhatsApp' },
  ],
  escalationPrompts: {
    product: 'Which product are you interested in?',
    strength: 'What strength or format would you like?',
    quantity: 'How many would you like?',
    city: 'What city are you located in? (Helps us flag local El Paso delivery.)',
    deliveryPreference: 'What is the destination for the shipping or delivery review?',
  },
  thanks: 'Thank you. One of our specialists will continue your order through WhatsApp.',
  catalogResponse: 'Here is our full research catalog, organized by category — Metabolic & Weight Management, Recovery & Regeneration, Longevity & Cellular Health, Cognitive & Performance, and Hormone & Wellness.',
  bestSellersIntro: 'Some of our most requested catalog entries:',
  pricingResponse: 'Pricing varies by product and strength — every catalog card shows a starting price, and our team confirms exact pricing and availability before you order.',
  shippingResponse: 'Available shipping destinations and methods are confirmed during order review. International destination eligibility and shipping cost are confirmed during order review.',
  localDeliveryResponse: 'Local delivery eligibility and timing are confirmed during order review.',
  trackResponse: 'For order status, our team can look that up directly on WhatsApp.',
  contactResponse: 'You can reach our team on WhatsApp. Our team typically responds within 24 hours.',
  orderResponse: 'I can help set that up. Let’s collect a few details so our specialist can pick up right where you left off.',
  helloResponse: 'Hello! I can help with product information, pricing, shipping, delivery, and ordering — what would you like to know?',
  fallbackResponse: 'I can help with product information, pricing, shipping, delivery, and ordering. You can also reach our team directly on WhatsApp for anything else.',
  continueWhatsapp: 'Continue on WhatsApp',
}

const spanish: AssistantCopy = {
  welcome: '¡Hola! Soy el asistente de Encore AI.\n\nPuedo ayudarte con:\n\n• Información de productos\n• Precios\n• Entrega local\n• Revisión de destinos de envío\n• Confirmación de entrega y manejo\n• Pedidos\n\n¿Cómo puedo ayudarte hoy?',
  quickReplies: [
    { id: 'browse-products', label: 'Explorar productos' },
    { id: 'pricing', label: 'Precios' },
    { id: 'order-whatsapp', label: 'Pedir por WhatsApp' },
  ],
  escalationPrompts: {
    product: '¿Qué producto te interesa?',
    strength: '¿Qué concentración o formato buscas?',
    quantity: '¿Qué cantidad necesitas?',
    city: '¿En qué ciudad te encuentras? (Nos ayuda a identificar la entrega local en El Paso.)',
    deliveryPreference: '¿Cuál es el destino que debemos revisar para el envío o la entrega?',
  },
  thanks: 'Gracias. Uno de nuestros especialistas continuará tu solicitud por WhatsApp.',
  catalogResponse: 'Aquí está nuestro catálogo completo de investigación, organizado por categoría: metabolismo y control de peso, recuperación y regeneración, longevidad y salud celular, cognición y rendimiento, y hormonas y bienestar.',
  bestSellersIntro: 'Estas son algunas de las entradas más solicitadas del catálogo:',
  pricingResponse: 'El precio varía según el producto y la concentración. Cada tarjeta muestra un precio inicial; nuestro equipo confirma el precio y la disponibilidad exactos antes del pedido.',
  shippingResponse: 'Los destinos y métodos de envío disponibles se confirman durante la revisión del pedido. La elegibilidad internacional y el costo de envío también se confirman durante esa revisión.',
  localDeliveryResponse: 'La elegibilidad y los tiempos de entrega local se confirman durante la revisión del pedido.',
  trackResponse: 'Para consultar el estado de un pedido, nuestro equipo puede revisarlo directamente por WhatsApp.',
  contactResponse: 'Puedes contactar a nuestro equipo por WhatsApp. Normalmente respondemos en un plazo de 24 horas.',
  orderResponse: 'Puedo ayudarte a iniciar la solicitud. Recopilemos algunos datos para que nuestro especialista pueda continuar donde lo dejamos.',
  helloResponse: '¡Hola! Puedo ayudarte con información de productos, precios, envíos, entregas y pedidos. ¿Qué te gustaría saber?',
  fallbackResponse: 'Puedo ayudarte con información de productos, precios, envíos, entregas y pedidos. También puedes contactar directamente a nuestro equipo por WhatsApp.',
  continueWhatsapp: 'Continuar por WhatsApp',
}

export function getAssistantCopy(locale: Locale): AssistantCopy {
  return locale === 'es' ? spanish : english
}
