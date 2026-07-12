import type { QuickReply } from './types'

export const WELCOME_MESSAGE = [
  'Hi! I’m the Encore AI Assistant.',
  '',
  'I can help you with:',
  '',
  '• Product information',
  '• Pricing',
  '• Local delivery',
  '• Shipping destination review',
  '• Delivery and handling confirmation',
  '• Ordering',
  '',
  'How may I help you today?',
].join('\n')

export const welcomeQuickReplies: QuickReply[] = [
  { id: 'browse-products', label: 'Browse Products' },
  { id: 'pricing', label: 'Pricing' },
  { id: 'order-whatsapp', label: 'Order on WhatsApp' },
]
