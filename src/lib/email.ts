export const SUPPORT_EMAIL = 'support@encorebiolabs.com'
export const BUSINESS_EMAILS = {
  support: SUPPORT_EMAIL,
  sales: 'sales@encorebiolabs.com',
  wholesale: 'wholesale@encorebiolabs.com',
  billing: 'billing@encorebiolabs.com',
  returns: 'returns@encorebiolabs.com',
} as const

export function supportMailto(subject?: string) {
  return `mailto:${SUPPORT_EMAIL}${subject ? `?subject=${encodeURIComponent(subject)}` : ''}`
}
