import type { StorefrontOrderRow } from './interimCheckout'

const FOLLOW_UP_STATUSES = new Set<StorefrontOrderRow['status']>([
  'pending_shipping_review',
  'quote_pending',
  'pending_payment',
])

export function storefrontOrderNeedsFollowUp(order: Pick<StorefrontOrderRow, 'status'>) {
  return FOLLOW_UP_STATUSES.has(order.status)
}

export function selectStorefrontFollowUps<T extends Pick<StorefrontOrderRow, 'status' | 'created_at'>>(
  orders: T[],
  limit = 5,
) {
  return orders
    .filter(storefrontOrderNeedsFollowUp)
    .sort((left, right) => new Date(right.created_at).getTime() - new Date(left.created_at).getTime())
    .slice(0, limit)
}
