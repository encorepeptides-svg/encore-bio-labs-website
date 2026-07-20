import { Package, Truck } from 'lucide-react'
import { useTranslation } from '../../../i18n/LocaleContext'
import { fetchMyOrders, type PortalOrder } from '../../../lib/portal/portalData'
import { Badge, Card, EmptyCard, formatMoney, LoadState, SectionIntro, statusTone, useAsync, useDateFormatter } from './shared'

export function OrdersSection() {
  const { t } = useTranslation('portal')
  const { data, loading, error, reload } = useAsync(fetchMyOrders)
  return <>
    <SectionIntro title={t('ordersTitle')} copy={t('ordersIntro')} />
    <LoadState loading={loading} error={error} onRetry={reload}>
      {data?.length ? <div className="mt-8 grid gap-4">{data.map((order) => <OrderCard key={order.id} order={order} />)}</div> : <EmptyCard title={t('ordersEmptyTitle')} copy={t('ordersEmptyCopy')} />}
    </LoadState>
  </>
}

function OrderCard({ order }: { order: PortalOrder }) {
  const { t } = useTranslation('portal')
  const formatDate = useDateFormatter()
  const paymentKey = ({ paid: 'orderPaymentPaid', payment_pending: 'orderPaymentPending', refunded: 'orderPaymentRefunded' } as Record<string, string>)[order.payment_status]
  const fulfillmentKey = ({ review_required: 'orderFulfillmentReview', processing: 'orderFulfillmentProcessing', shipped: 'orderFulfillmentShipped', delivered: 'orderFulfillmentDelivered', cancelled: 'orderFulfillmentCancelled' } as Record<string, string>)[order.fulfillment_status]
  return <Card>
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3"><span className="flex size-10 items-center justify-center rounded-2xl bg-teal-50 text-teal-700"><Package size={18} /></span><div><p className="font-semibold">{order.order_number}</p><p className="text-sm text-slate-500">{formatDate(order.created_at)}</p></div></div>
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone={statusTone(order.payment_status)}>{paymentKey ? t(paymentKey) : order.payment_status.replaceAll('_', ' ')}</Badge>
        <Badge tone={statusTone(order.fulfillment_status)}>{fulfillmentKey ? t(fulfillmentKey) : order.fulfillment_status.replaceAll('_', ' ')}</Badge>
      </div>
    </div>
    {order.portal_order_items.length ? <div className="mt-5 overflow-hidden rounded-[1.1rem] border border-slate-900/8 bg-white">{order.portal_order_items.map((item) => <div key={item.id} className="flex items-center justify-between gap-3 border-b border-slate-900/6 px-4 py-3 text-sm last:border-b-0"><span className="font-semibold">{item.metadata?.name || item.variant_sku}</span><span className="text-slate-500">×{item.quantity}</span><span className="font-semibold">{formatMoney(item.unit_amount_cents * item.quantity)}</span></div>)}</div> : null}
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm font-bold">{t('orderTotal')}: {formatMoney(order.amount_cents)}</p>
    </div>
    {order.shipments.length ? <div className="mt-4 grid gap-2">{order.shipments.map((shipment) => <div key={shipment.id} className="flex flex-wrap items-center gap-3 rounded-[1.1rem] bg-white px-4 py-3 text-sm"><Truck size={16} className="text-teal-700" /><span className="font-semibold">{shipment.carrier ?? t('shipmentCarrierUnknown')}</span>{shipment.tracking_number ? <span className="font-mono text-xs text-slate-600">{shipment.tracking_number}</span> : null}<Badge tone={statusTone(shipment.status)}>{shipment.status === 'shipped' ? t('shipmentShipped') : shipment.status === 'delivered' ? t('shipmentDelivered') : shipment.status.replaceAll('_', ' ')}</Badge></div>)}</div> : null}
  </Card>
}
