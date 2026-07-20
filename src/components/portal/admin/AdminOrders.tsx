import { Plus, Trash2 } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useTranslation } from '../../../i18n/LocaleContext'
import { usePortalAuth } from '../../../context/usePortalAuth'
import { adminAddShipment, adminCreateOrder, adminFetchClients, adminFetchOrders, adminUpdateOrderStatus, type NewOrderItem, type PortalOrder } from '../../../lib/portal/portalData'
import { Badge, Card, EmptyCard, FieldLabel, formatMoney, LoadState, statusTone, SubmitButton, useAsync, useDateFormatter } from '../sections/shared'

const PAYMENT_STATUSES = ['payment_pending', 'paid', 'refunded'] as const
const FULFILLMENT_STATUSES = ['review_required', 'processing', 'shipped', 'delivered', 'cancelled'] as const

export function AdminOrders() {
  const { t } = useTranslation('portal')
  const { data, loading, error, reload } = useAsync(adminFetchOrders)
  const clients = useAsync(adminFetchClients)
  const [showCreate, setShowCreate] = useState(false)
  const clientById = new Map((clients.data ?? []).map((row) => [row.user_id, row]))

  return <>
    <button onClick={() => setShowCreate((value) => !value)} className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-full bg-[#071724] px-6 text-sm font-semibold text-white transition hover:bg-[#0b3a3e]"><Plus size={16} />{t('adminNewOrder')}</button>
    {showCreate ? <CreateOrderForm onCreated={() => { setShowCreate(false); reload() }} /> : null}
    <LoadState loading={loading} error={error} onRetry={reload}>
      {data?.length ? <div className="mt-6 grid gap-4">{data.map((order) => <AdminOrderCard key={order.id} order={order} clientLabel={clientById.get(order.user_id)?.profiles?.email ?? order.user_id.slice(0, 8)} onChanged={reload} />)}</div> : <EmptyCard title={t('adminNoOrders')} copy={t('adminNoOrdersCopy')} />}
    </LoadState>
  </>
}

function CreateOrderForm({ onCreated }: { onCreated: () => void }) {
  const { t } = useTranslation('portal')
  const { identity } = usePortalAuth()
  const clients = useAsync(adminFetchClients)
  const [userId, setUserId] = useState('')
  const [paymentStatus, setPaymentStatus] = useState<string>('payment_pending')
  const [items, setItems] = useState<NewOrderItem[]>([{ name: '', sku: '', quantity: 1, unitAmountCents: 0 }])
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  function updateItem(index: number, patch: Partial<NewOrderItem>) {
    setItems((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item))
  }

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (!identity || !userId) return
    const validItems = items.filter((item) => item.name.trim() && item.quantity > 0)
    if (!validItems.length) { setFormError(t('adminOrderItemsRequired')); return }
    setFormError(''); setSaving(true)
    try {
      await adminCreateOrder(identity.user.id, { userId, items: validItems.map((item) => ({ ...item, sku: item.sku.trim() || item.name.trim().toUpperCase().replaceAll(' ', '-').slice(0, 24) })), paymentStatus, notification: { title: t('notifyOrderCreatedTitle'), body: t('notifyOrderCreatedBody') } })
      onCreated()
    } catch { setFormError(t('saveError')) } finally { setSaving(false) }
  }

  return <Card className="mt-4">
    <h2 className="text-lg font-semibold">{t('adminNewOrder')}</h2>
    <form onSubmit={submit} className="mt-4 grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <FieldLabel label={t('adminOrderClient')}><select required value={userId} onChange={(e) => setUserId(e.target.value)} className="portal-input"><option value="">{t('selectPlaceholder')}</option>{(clients.data ?? []).map((row) => <option key={row.user_id} value={row.user_id}>{row.profiles?.legal_name || row.profiles?.email || row.user_id.slice(0, 8)} ({row.profiles?.email})</option>)}</select></FieldLabel>
        <FieldLabel label={t('adminOrderPaymentStatus')}><select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)} className="portal-input">{PAYMENT_STATUSES.map((status) => <option key={status} value={status}>{status.replaceAll('_', ' ')}</option>)}</select></FieldLabel>
      </div>
      <div className="grid gap-3">{items.map((item, index) => <div key={index} className="grid gap-3 rounded-[1.1rem] bg-white p-4 sm:grid-cols-[2fr_1fr_5rem_7rem_2.75rem]">
        <FieldLabel label={t('adminOrderItemName')}><input value={item.name} onChange={(e) => updateItem(index, { name: e.target.value })} className="portal-input" /></FieldLabel>
        <FieldLabel label={t('adminOrderItemSku')}><input value={item.sku} onChange={(e) => updateItem(index, { sku: e.target.value })} className="portal-input" /></FieldLabel>
        <FieldLabel label={t('adminOrderItemQty')}><input type="number" min="1" value={item.quantity} onChange={(e) => updateItem(index, { quantity: Number(e.target.value) })} className="portal-input" /></FieldLabel>
        <FieldLabel label={t('adminOrderItemPrice')}><input type="number" min="0" step="0.01" value={item.unitAmountCents / 100 || ''} onChange={(e) => updateItem(index, { unitAmountCents: Math.round(Number(e.target.value) * 100) })} className="portal-input" /></FieldLabel>
        <button type="button" aria-label={t('adminOrderItemRemove')} onClick={() => setItems((current) => current.filter((_, itemIndex) => itemIndex !== index))} className="mb-1 self-end rounded-xl border border-red-200 p-3 text-red-800 transition hover:bg-red-50"><Trash2 size={16} /></button>
      </div>)}</div>
      <button type="button" onClick={() => setItems((current) => [...current, { name: '', sku: '', quantity: 1, unitAmountCents: 0 }])} className="justify-self-start text-sm font-semibold text-teal-800">+ {t('adminOrderAddItem')}</button>
      <p className="text-sm font-bold">{t('orderTotal')}: {formatMoney(items.reduce((total, item) => total + item.quantity * item.unitAmountCents, 0))}</p>
      {formError ? <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">{formError}</p> : null}
      <div><SubmitButton loading={saving} label={t('adminOrderCreate')} loadingLabel={t('submitting')} /></div>
    </form>
  </Card>
}

function AdminOrderCard({ order, clientLabel, onChanged }: { order: PortalOrder; clientLabel: string; onChanged: () => void }) {
  const { t } = useTranslation('portal')
  const { identity } = usePortalAuth()
  const formatDate = useDateFormatter()
  const [busy, setBusy] = useState(false)
  const [shipment, setShipment] = useState({ carrier: '', tracking: '' })
  const [showShipment, setShowShipment] = useState(false)
  const [actionError, setActionError] = useState('')

  async function run(action: () => Promise<void>) {
    setActionError(''); setBusy(true)
    try { await action(); onChanged() } catch { setActionError(t('saveError')) } finally { setBusy(false) }
  }

  return <Card>
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div><p className="font-semibold">{order.order_number}</p><p className="text-sm text-slate-500">{clientLabel} · {formatDate(order.created_at)} · {formatMoney(order.amount_cents)}</p></div>
      <div className="flex flex-wrap gap-2"><Badge tone={statusTone(order.payment_status)}>{order.payment_status.replaceAll('_', ' ')}</Badge><Badge tone={statusTone(order.fulfillment_status)}>{order.fulfillment_status.replaceAll('_', ' ')}</Badge></div>
    </div>
    {order.portal_order_items.length ? <p className="mt-3 text-sm text-slate-600">{order.portal_order_items.map((item) => `${item.metadata?.name || item.variant_sku} ×${item.quantity}`).join(' · ')}</p> : null}
    {order.shipments.length ? <p className="mt-2 text-sm text-slate-600">{order.shipments.map((entry) => `${entry.carrier ?? '—'} ${entry.tracking_number ?? ''}`).join(' · ')}</p> : null}
    <div className="mt-4 flex flex-wrap items-end gap-3">
      <FieldLabel label={t('adminOrderPaymentStatus')}><select disabled={busy} value={order.payment_status} onChange={(e) => { if (identity) void run(() => adminUpdateOrderStatus(identity.user.id, order, { payment_status: e.target.value }, { title: t('notifyOrderUpdatedTitle'), body: t('notifyOrderUpdatedBody') })) }} className="portal-input !min-h-10 !py-1">{PAYMENT_STATUSES.map((status) => <option key={status} value={status}>{status.replaceAll('_', ' ')}</option>)}</select></FieldLabel>
      <FieldLabel label={t('adminOrderFulfillmentStatus')}><select disabled={busy} value={order.fulfillment_status} onChange={(e) => { if (identity) void run(() => adminUpdateOrderStatus(identity.user.id, order, { fulfillment_status: e.target.value }, { title: t('notifyOrderUpdatedTitle'), body: t('notifyOrderUpdatedBody') })) }} className="portal-input !min-h-10 !py-1">{FULFILLMENT_STATUSES.map((status) => <option key={status} value={status}>{status.replaceAll('_', ' ')}</option>)}</select></FieldLabel>
      <button onClick={() => setShowShipment((value) => !value)} className="min-h-11 rounded-full border border-slate-900/10 px-5 text-sm font-semibold text-slate-700 transition hover:bg-white">{t('adminAddShipment')}</button>
    </div>
    {showShipment ? <div className="mt-3 flex flex-wrap items-end gap-3 rounded-[1.1rem] bg-white p-4">
      <FieldLabel label={t('adminShipmentCarrier')}><input value={shipment.carrier} onChange={(e) => setShipment({ ...shipment, carrier: e.target.value })} className="portal-input" /></FieldLabel>
      <FieldLabel label={t('adminShipmentTracking')}><input value={shipment.tracking} onChange={(e) => setShipment({ ...shipment, tracking: e.target.value })} className="portal-input" /></FieldLabel>
      <button disabled={busy || !shipment.carrier.trim() || !shipment.tracking.trim()} onClick={() => { if (identity) void run(() => adminAddShipment(identity.user.id, order, { carrier: shipment.carrier, tracking_number: shipment.tracking }, { title: t('notifyShipmentTitle'), body: t('notifyShipmentBody') })).then(() => { setShowShipment(false); setShipment({ carrier: '', tracking: '' }) }) }} className="min-h-11 rounded-full bg-teal-700 px-5 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:opacity-50">{t('adminShipmentSave')}</button>
    </div> : null}
    {actionError ? <p role="alert" className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-800">{actionError}</p> : null}
  </Card>
}
