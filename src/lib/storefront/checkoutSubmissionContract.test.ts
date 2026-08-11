import { describe, expect, it } from 'vitest'
import checkoutPage from '../../components/checkout/CheckoutPage.tsx?raw'
import handoff from '../../components/cart/InterimCheckoutHandoff.tsx?raw'
import edgeFunction from '../../../supabase/functions/shipping-checkout/index.ts?raw'
import migration from '../../../supabase/migrations/20260727090000_accept_pending_shipping_review_checkout.sql?raw'
import processingMigration from '../../../supabase/migrations/20260811012954_storefront_cash_on_delivery_processing.sql?raw'

describe('checkout submission contract', () => {
  it('creates the order before showing the success screen', () => {
    expect(checkoutPage).toContain("channel: 'checkout'")
    expect(checkoutPage).toContain('await createPendingOrder')
    expect(checkoutPage.indexOf('await createPendingOrder')).toBeLessThan(checkoutPage.indexOf("setOutcome('support')"))
    expect(checkoutPage).toContain('completedSummary.order.reference')
  })

  it('stores manual requests as Pending Shipping Review and exposes them to admin queries', () => {
    expect(edgeFunction).toContain("const status = reviewRequired ? 'pending_shipping_review' : 'pending_payment'")
    expect(migration).toContain("status = 'pending_shipping_review'")
    expect(migration).toContain("channel in ('checkout', 'whatsapp', 'instagram')")
  })

  it('notifies support without making messaging the order-creation step', () => {
    expect(edgeFunction).toContain("const SUPPORT_EMAIL = 'support@encorebiolabs.com'")
    expect(edgeFunction).toContain('await notifySupport')
    expect(edgeFunction).toContain('EdgeRuntime.waitUntil(task)')
    expect(edgeFunction.indexOf("scheduleBackground(recordSupportNotification")).toBeLessThan(edgeFunction.indexOf("supportNotification: 'scheduled'"))
    expect(edgeFunction).toContain("source: 'checkout_order'")
    expect(handoff).not.toContain('createPendingOrder(')
    expect(handoff).toContain('order.reference')
  })

  it('persists the selected payment method and adds the server-authoritative 5% cash-on-delivery fee', () => {
    expect(checkoutPage).toContain("useState<InterimPaymentMethodId>('cash_on_delivery')")
    expect(checkoutPage).toContain('paymentMethod,')
    expect(edgeFunction).toContain("paymentMethod === 'cash_on_delivery'")
    expect(edgeFunction).toContain('* CASH_ON_DELIVERY_PROCESSING_RATE')
    expect(edgeFunction).toContain('processing_fee_cents: processingFeeCents')
    expect(processingMigration).toContain('add column if not exists processing_fee_cents')
  })
})
