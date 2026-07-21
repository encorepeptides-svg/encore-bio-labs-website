import { useState } from 'react'
import { useTranslation } from '../../../i18n/LocaleContext'
import { usePortalAuth } from '../../../context/usePortalAuth'
import { adminFetchStorefrontOrders, adminMarkStorefrontOrder, type StorefrontOrderRow } from '../../../lib/storefront/interimCheckout'
import { Badge, EmptyCard, formatMoney, LoadState, statusTone, useAsync, useDateFormatter } from '../sections/shared'

export function AdminStorefront() {
  const { t } = useTranslation('portal')
  const { identity } = usePortalAuth()
  const formatDate = useDateFormatter()
  const { data, loading, error, reload } = useAsync(adminFetchStorefrontOrders)
  const [busy, setBusy] = useState('')
  const [actionError, setActionError] = useState('')
  const [showAll, setShowAll] = useState(false)

  async function setStatus(order: StorefrontOrderRow, status: 'paid' | 'cancelled' | 'pending_payment') {
    if (!identity) return
    setActionError(''); setBusy(order.id)
    try { await adminMarkStorefrontOrder(order.id, identity.user.id, status); reload() }
    catch { setActionError(t('saveError')) }
    finally { setBusy('') }
  }

  const rows = (data ?? []).filter((order) => showAll || ['review_required', 'quote_pending', 'pending_payment'].includes(order.status))

  return <>
    <p className="mt-4 max-w-2xl leading-7 text-slate-600">{t('adminStorefrontIntro')}</p>
    <label className="mt-5 flex w-fit items-center gap-2 text-sm font-semibold text-slate-700">
      <input type="checkbox" checked={showAll} onChange={(event) => setShowAll(event.target.checked)} className="size-4 accent-teal-700" />
      {t('adminStorefrontShowAll')}
    </label>
    {actionError ? <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-800">{actionError}</p> : null}
    <LoadState loading={loading} error={error} onRetry={reload}>
      {rows.length ? <div className="mt-6 overflow-x-auto rounded-[1.5rem] border border-slate-900/8 bg-white">
        <table className="w-full min-w-[52rem] text-left text-sm">
          <thead><tr className="bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-500">
            <th className="px-5 py-3">{t('adminStorefrontReference')}</th>
            <th className="px-5 py-3">{t('adminStorefrontPlaced')}</th>
            <th className="px-5 py-3">{t('adminStorefrontChannel')}</th>
            <th className="px-5 py-3">{t('adminStorefrontMethod')}</th>
            <th className="px-5 py-3">{t('adminStorefrontContact')}</th>
            <th className="px-5 py-3">{t('orderTotal')}</th>
            <th className="px-5 py-3">{t('statusAccountStatus')}</th>
            <th className="px-5 py-3">{t('adminStorefrontActions')}</th>
          </tr></thead>
          <tbody>{rows.map((order) => {
            const contact = [order.contact?.name, order.contact?.phone, order.contact?.email].filter(Boolean).join(' · ')
            return <tr key={order.id} className="border-t border-slate-900/6 align-top">
              <td className="px-5 py-3">
                <p className="font-mono font-semibold">{order.order_reference}</p>
                <p className="mt-1 max-w-56 text-xs text-slate-500">{order.items.map((item) => `${item.quantity}x ${item.product} ${item.variant}`).join(', ')}</p>
                <p className="mt-1 text-xs font-semibold text-teal-800">{order.destination_type.replaceAll('_', ' ')}</p>
                {order.local_fulfillment_method ? <p className="mt-1 text-xs text-slate-500">{order.local_fulfillment_method.replaceAll('_', ' ')}{order.delivery_distance_miles !== null ? ` · ${order.delivery_distance_miles.toFixed(1)} mi` : ''}</p> : null}
              </td>
              <td className="px-5 py-3 text-slate-500">{formatDate(order.created_at, true)}</td>
              <td className="px-5 py-3 capitalize text-slate-600">{order.channel}</td>
              <td className="px-5 py-3 text-slate-600">{order.payment_method.replaceAll('_', ' ')}</td>
              <td className="px-5 py-3 text-slate-600">{contact || '—'}</td>
              <td className="px-5 py-3 font-semibold">{order.total_cents === null ? `${formatMoney(order.subtotal_cents)} + review` : formatMoney(order.total_cents)}</td>
              <td className="px-5 py-3"><Badge tone={statusTone(order.status === 'pending_payment' ? 'pending' : order.status)}>{order.status.replaceAll('_', ' ')}</Badge></td>
              <td className="px-5 py-3">
                {order.status === 'pending_payment' ? <div className="flex flex-wrap gap-2">
                  <button disabled={busy === order.id} onClick={() => { if (window.confirm(t('adminStorefrontMarkPaidConfirm', { reference: order.order_reference }))) void setStatus(order, 'paid') }} className="min-h-10 rounded-full bg-teal-700 px-4 text-xs font-semibold text-white transition hover:bg-teal-800 disabled:opacity-50">{t('adminStorefrontMarkPaid')}</button>
                  <button disabled={busy === order.id} onClick={() => void setStatus(order, 'cancelled')} className="min-h-10 rounded-full border border-red-200 px-4 text-xs font-semibold text-red-800 transition hover:bg-red-50 disabled:opacity-50">{t('adminStorefrontCancel')}</button>
                </div> : <button disabled={busy === order.id} onClick={() => void setStatus(order, 'pending_payment')} className="min-h-10 rounded-full border border-slate-900/10 px-4 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50">{t('adminStorefrontReopen')}</button>}
              </td>
            </tr>
          })}</tbody>
        </table>
      </div> : <EmptyCard title={t('adminStorefrontEmptyTitle')} copy={t('adminStorefrontEmptyCopy')} />}
    </LoadState>
  </>
}
