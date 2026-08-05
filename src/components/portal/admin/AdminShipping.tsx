import { useEffect, useMemo, useState } from 'react'
import {
  ArrowRight,
  CircleCheckBig,
  Clock3,
  Link2,
  LoaderCircle,
  MapPinCheck,
  Package,
  PackageCheck,
  RefreshCw,
  ScanLine,
  Truck,
} from 'lucide-react'
import { useLocale } from '../../../i18n/LocaleContext'
import { adminFetchOrders, type PortalOrder, type PortalShipment } from '../../../lib/portal/portalData'

function normalize(value: string) {
  return value.toLowerCase().replaceAll('_', ' ')
}

function isPaid(status: string) {
  return ['paid', 'succeeded', 'complete', 'completed'].includes(status.toLowerCase())
}

function isReady(order: PortalOrder) {
  return isPaid(order.payment_status) && ['pending', 'processing', 'unfulfilled', 'ready'].includes(order.fulfillment_status.toLowerCase())
}

function latestShipment(order: PortalOrder): PortalShipment | null {
  return order.shipments?.[0] ?? null
}

function money(cents: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100)
}

function when(value: string | null | undefined) {
  if (!value) return 'Not yet'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Unknown'
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(date)
}

export function AdminShipping() {
  const { path } = useLocale()
  const [orders, setOrders] = useState<PortalOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')

  async function load() {
    setLoading(true)
    setError('')
    try {
      setOrders(await adminFetchOrders())
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Shipping operations could not be loaded.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const ready = orders.filter(isReady)
  const inTransit = orders.filter((order) => {
    const status = latestShipment(order)?.status?.toLowerCase() ?? ''
    return ['shipped', 'in_transit', 'in transit', 'out_for_delivery'].includes(status)
  })
  const delivered = orders.filter((order) => order.fulfillment_status.toLowerCase() === 'delivered' || latestShipment(order)?.status?.toLowerCase() === 'delivered')
  const missingTracking = orders.filter((order) => {
    const fulfillment = order.fulfillment_status.toLowerCase()
    const shipment = latestShipment(order)
    return ['shipped', 'in_transit', 'in transit'].includes(fulfillment) && !shipment?.tracking_number
  })

  const queue = useMemo(() => {
    const value = query.trim().toLowerCase()
    const candidates = orders.filter((order) => isReady(order) || latestShipment(order))
    if (!value) return candidates.slice(0, 40)
    return candidates.filter((order) => {
      const shipment = latestShipment(order)
      return [
        order.order_number,
        order.payment_status,
        order.fulfillment_status,
        shipment?.carrier,
        shipment?.tracking_number,
      ].filter(Boolean).join(' ').toLowerCase().includes(value)
    }).slice(0, 40)
  }, [orders, query])

  if (loading && orders.length === 0) {
    return <div className="mt-8 grid min-h-72 place-items-center rounded-[1.75rem] border border-slate-900/8 bg-[#f8faf9]">
      <div className="text-center">
        <LoaderCircle size={30} className="mx-auto animate-spin text-teal-700" aria-hidden="true" />
        <p className="mt-4 text-sm font-semibold text-slate-600">Loading fulfillment queue…</p>
      </div>
    </div>
  }

  if (error && orders.length === 0) {
    return <div className="mt-8 rounded-[1.5rem] border border-red-200 bg-red-50 p-6 text-red-950">
      <p className="font-semibold">Shipping operations could not be loaded.</p>
      <p className="mt-2 text-sm leading-6">{error}</p>
      <button type="button" onClick={() => void load()} className="mt-4 rounded-full bg-red-950 px-5 py-2.5 text-sm font-semibold text-white">Retry</button>
    </div>
  }

  return <div className="mt-8 grid gap-7">
    <section className="relative overflow-hidden rounded-[2rem] bg-[#071724] p-6 text-white shadow-[0_28px_90px_rgba(7,23,36,.18)] sm:p-8">
      <div className="absolute -right-20 -top-20 size-64 rounded-full bg-teal-300/10 blur-3xl" aria-hidden="true" />
      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.18em] text-teal-200">Fulfillment control</p>
          <h2 className="mt-3 text-4xl font-semibold tracking-[-.055em] sm:text-5xl">Shipping operations</h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">Work paid orders, add carrier and tracking information through the existing order manager, and monitor fulfillment from one queue. This workspace is structured for a future carrier API without changing the admin flow.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a href={path('/admin/orders')} className="inline-flex h-11 items-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-[#071724]">
            Open order manager <ArrowRight size={15} aria-hidden="true" />
          </a>
          <button type="button" onClick={() => void load()} disabled={loading} className="inline-flex h-11 items-center gap-2 rounded-full border border-white/15 px-5 text-sm font-semibold text-white disabled:opacity-50">
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} aria-hidden="true" /> Refresh
          </button>
        </div>
      </div>
    </section>

    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Shipping scorecard">
      <Metric icon={PackageCheck} label="Ready to ship" value={ready.length} detail="Paid orders awaiting fulfillment" />
      <Metric icon={Truck} label="In transit" value={inTransit.length} detail="Shipments currently moving" />
      <Metric icon={CircleCheckBig} label="Delivered" value={delivered.length} detail="Completed fulfillment records" />
      <Metric icon={ScanLine} label="Tracking needed" value={missingTracking.length} detail="Shipped records without tracking" />
    </section>

    <section className="grid gap-5 xl:grid-cols-[1.35fr_.65fr]">
      <div className="overflow-hidden rounded-[1.5rem] border border-slate-900/8 bg-white shadow-[0_18px_60px_rgba(7,23,36,.06)]">
        <div className="flex flex-col gap-4 border-b border-slate-900/8 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.15em] text-teal-700">Daily queue</p>
            <h3 className="mt-1 text-2xl font-semibold tracking-[-.04em] text-[#071724]">Orders and shipments</h3>
          </div>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search order or tracking"
            className="h-11 w-full rounded-full border border-slate-900/10 bg-[#f8faf9] px-4 text-sm outline-none focus:border-teal-500 sm:w-72"
          />
        </div>
        <div className="divide-y divide-slate-900/7">
          {queue.length ? queue.map((order) => {
            const shipment = latestShipment(order)
            return <div key={order.id} className="grid gap-4 p-5 lg:grid-cols-[1fr_auto] lg:items-center">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-[#071724]">{order.order_number}</p>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold capitalize text-slate-700">{normalize(order.fulfillment_status)}</span>
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold capitalize ${isPaid(order.payment_status) ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>{normalize(order.payment_status)}</span>
                </div>
                <p className="mt-2 text-sm text-slate-600">{money(order.amount_cents)} · {order.portal_order_items.reduce((total, item) => total + item.quantity, 0)} item(s) · Created {when(order.created_at)}</p>
                {shipment ? <p className="mt-2 text-xs text-slate-500">{shipment.carrier || 'Carrier pending'} · {shipment.tracking_number || 'Tracking pending'} · {normalize(shipment.status)}</p> : <p className="mt-2 text-xs text-slate-500">No shipment record yet.</p>}
              </div>
              <a href={path('/admin/orders')} className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-slate-900/10 bg-white px-4 text-sm font-semibold text-[#071724] hover:bg-[#f8faf9]">Manage order <ArrowRight size={14} aria-hidden="true" /></a>
            </div>
          }) : <div className="grid min-h-52 place-items-center p-8 text-center">
            <div>
              <Package size={30} className="mx-auto text-slate-300" aria-hidden="true" />
              <p className="mt-3 text-sm font-semibold text-[#071724]">No fulfillment records match this view.</p>
              <p className="mt-2 text-xs text-slate-500">Paid and shipped orders will appear here.</p>
            </div>
          </div>}
        </div>
      </div>

      <div className="grid gap-5">
        <section className="rounded-[1.5rem] border border-teal-700/15 bg-teal-50/70 p-5">
          <div className="flex items-center justify-between gap-4">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-[#071724] text-teal-200"><Link2 size={19} aria-hidden="true" /></span>
            <span className="rounded-full bg-amber-100 px-3 py-1.5 text-xs font-semibold text-amber-900">Not connected</span>
          </div>
          <h3 className="mt-5 text-xl font-semibold tracking-[-.03em] text-[#071724]">Shipping API integration</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">The portal now has a dedicated fulfillment surface. A future carrier integration can add live rates, address validation, label purchasing, tracking synchronization, and label voids here.</p>
          <div className="mt-5 grid gap-2 text-sm text-slate-700">
            <Capability icon={MapPinCheck} label="Address validation" />
            <Capability icon={PackageCheck} label="Rate and service selection" />
            <Capability icon={ScanLine} label="Label and tracking creation" />
            <Capability icon={Clock3} label="Delivery-status synchronization" />
          </div>
        </section>

        <section className="rounded-[1.5rem] border border-slate-900/8 bg-[#f8faf9] p-5">
          <p className="text-xs font-bold uppercase tracking-[.15em] text-teal-700">Current workflow</p>
          <ol className="mt-4 grid gap-3 text-sm leading-6 text-slate-600">
            <li><strong className="text-[#071724]">1.</strong> Confirm payment and order contents.</li>
            <li><strong className="text-[#071724]">2.</strong> Pack and verify the shipment.</li>
            <li><strong className="text-[#071724]">3.</strong> Add carrier and tracking in Orders.</li>
            <li><strong className="text-[#071724]">4.</strong> Customer portal receives the shipment update.</li>
          </ol>
        </section>
      </div>
    </section>
  </div>
}

function Metric({ icon: Icon, label, value, detail }: { icon: typeof Truck; label: string; value: number; detail: string }) {
  return <div className="rounded-[1.5rem] border border-slate-900/8 bg-white p-5 shadow-[0_14px_45px_rgba(7,23,36,.05)]">
    <span className="flex size-11 items-center justify-center rounded-2xl bg-[#071724] text-teal-200"><Icon size={19} aria-hidden="true" /></span>
    <p className="mt-5 text-xs font-bold uppercase tracking-[.13em] text-slate-500">{label}</p>
    <p className="mt-2 text-4xl font-semibold tracking-[-.06em] text-[#071724]">{value}</p>
    <p className="mt-2 text-xs leading-5 text-slate-500">{detail}</p>
  </div>
}

function Capability({ icon: Icon, label }: { icon: typeof Truck; label: string }) {
  return <div className="flex items-center gap-3 rounded-xl bg-white/70 px-3 py-2.5">
    <Icon size={16} className="text-teal-800" aria-hidden="true" />
    <span className="font-semibold">{label}</span>
  </div>
}
