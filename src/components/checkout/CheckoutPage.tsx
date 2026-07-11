import { Check, ChevronRight, Minus, MessageCircle, Plus, ShieldCheck, ShoppingCart, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import logo from '../../assets/images/logo/encore-logo.png'
import { useCart } from '../../context/useCart'
import { calculateTotal, formatCartCurrency } from '../../lib/cart'
import { createCRMLeadFromIntake, saveLead } from '../../lib/crmStorage'
import { cn } from '../../lib/utils'
import { EncoreCompleteKit } from '../EncoreCompleteKit'

const checkoutStages = [
  { key: 'cart', label: 'Cart' },
  { key: 'review', label: 'Information & Shipping' },
  { key: 'complete', label: 'Complete' },
] as const

function CheckoutProgress({ stage }: { stage: 'review' | 'complete' }) {
  return (
    <ol className="mx-auto mb-8 flex max-w-[76rem] flex-wrap items-center gap-2 px-5 sm:px-8">
      {checkoutStages.map((item, index) => {
        const isDone = item.key === 'cart' || (stage === 'complete' && item.key === 'review')
        const isCurrent = item.key === stage

        return (
          <li key={item.key} className="flex items-center gap-2">
            <span
              className={cn(
                'flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold',
                isDone
                  ? 'bg-teal-700 text-white'
                  : isCurrent
                    ? 'border border-teal-700 text-teal-700'
                    : 'border border-slate-300 text-slate-400',
              )}
            >
              {isDone ? <Check size={11} aria-hidden="true" /> : index + 1}
            </span>
            <span
              className={cn(
                'text-xs font-semibold uppercase tracking-[0.1em]',
                isCurrent ? 'text-[#071724]' : 'text-slate-400',
              )}
            >
              {item.label}
            </span>
            {index < checkoutStages.length - 1 ? (
              <span className="mx-1 h-px w-6 bg-slate-200" aria-hidden="true" />
            ) : null}
          </li>
        )
      })}
    </ol>
  )
}

type ReviewFormData = {
  email: string
  phone: string
  fullName: string
  address: string
  city: string
  state: string
  zip: string
  country: 'US' | 'MX'
  notes: string
}

const defaultFormData: ReviewFormData = {
  email: '',
  phone: '',
  fullName: '',
  address: '',
  city: '',
  state: '',
  zip: '',
  country: 'US',
  notes: '',
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function inputClass() {
  return 'h-12 w-full rounded-2xl border border-slate-900/10 bg-white px-4 text-sm text-[#071724] outline-none transition placeholder:text-slate-400 focus:border-teal-600/70 focus:ring-4 focus:ring-teal-100'
}

function CheckoutHeader() {
  return (
    <header className="border-b border-slate-900/10 bg-white/80 backdrop-blur-2xl">
      <div className="mx-auto flex max-w-[76rem] items-center justify-between px-5 py-4 sm:px-8">
        <a href="/" className="flex items-center gap-3" aria-label="Encore Bio Labs home">
          <img src={logo} alt="Encore Bio Labs" width="900" height="264" className="h-8 w-auto" />
        </a>
        <a
          href="/catalog"
          className="rounded-full border border-slate-900/10 bg-[#f5f5f2] px-4 py-2 text-xs font-semibold text-slate-600 transition hover:bg-white"
        >
          Continue browsing
        </a>
      </div>
    </header>
  )
}

export function CheckoutPage() {
  const { items, itemCount, updateQuantity, removeFromCart, clearCart } = useCart()
  const [formData, setFormData] = useState<ReviewFormData>(defaultFormData)
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [showValidation, setShowValidation] = useState(false)
  const totals = useMemo(
    () =>
      calculateTotal(items, {
        destinationCountry: formData.country,
        destinationState: formData.state,
      }),
    [formData.country, formData.state, items],
  )

  const formIsValid =
    isValidEmail(formData.email) &&
    formData.phone.trim().length > 0 &&
    [formData.fullName, formData.address, formData.city, formData.state, formData.zip].every(
      (value) => value.trim().length > 0,
    )

  function updateField<K extends keyof ReviewFormData>(key: K, value: ReviewFormData[K]) {
    setFormData((current) => ({ ...current, [key]: value }))
  }

  async function submitRequest() {
    setShowValidation(true)
    setSubmitError('')
    if (!formIsValid || !items.length || isSubmitting) return

    const nameParts = formData.fullName.trim().split(/\s+/)
    const firstName = nameParts.shift() || ''
    const lastName = nameParts.join(' ')
    const submittedAt = new Date().toISOString()

    setIsSubmitting(true)
    try {
      await saveLead(
        createCRMLeadFromIntake({
          firstName,
          lastName,
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          city: formData.city.trim(),
          state: formData.state.trim(),
          country: formData.country === 'MX' ? 'Mexico' : 'United States',
          source: 'Cart checkout inquiry',
          campaignSource: 'Catalog',
          interestedProducts: items.map((item, index) => ({
            productName: `${item.productName} — ${item.variantLabel} × ${item.quantity}`,
            priority: index === 0 ? 'primary' : 'secondary',
          })),
          primaryGoal: 'Catalog order review',
          notes: [
            formData.notes.trim(),
            `Estimated cart total: ${formatCartCurrency(totals.total)}. No payment collected.`,
          ].filter(Boolean).join('\n'),
          intakeSubmission: {
            id: crypto.randomUUID(),
            submittedAt,
            age: '',
            sex: '',
            weight: '',
            height: '',
            mainGoal: 'Catalog order review',
            currentRoutine: '',
            sleepQuality: '',
            appetite: '',
            energy: '',
            previousProductsUsed: '',
            medicalConditions: '',
            medications: '',
            budget: formatCartCurrency(totals.total),
            deliveryCity: formData.city.trim(),
            preferredContactMethod: 'Email or phone',
            consentToContact: true,
            researchUseAcknowledgment: true,
          },
        }),
      )
      clearCart()
      setSubmitted(true)
    } catch {
      setSubmitError('We could not submit your inquiry. Your cart is still saved—please try again or contact support through WhatsApp.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <main id="main-content" className="min-h-screen bg-[#f5f5f2]">
        <CheckoutHeader />
        <div className="pt-8">
          <CheckoutProgress stage="complete" />
        </div>
        <div className="mx-auto flex max-w-xl flex-col items-center px-5 py-16 text-center sm:px-8">
          <span className="flex size-16 items-center justify-center rounded-full bg-teal-50 text-teal-700">
            <Check size={28} aria-hidden="true" />
          </span>
          <h1 className="mt-6 text-4xl font-semibold tracking-[-0.05em] text-[#071724]">
            Inquiry submitted.
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-600">
            Encore Bio Labs will follow up with availability, documentation, and fulfillment details.
            No payment was collected.
          </p>
          <a
            href="/catalog"
            className="mt-8 inline-flex min-h-12 items-center justify-center rounded-full bg-[#071724] px-7 text-sm font-semibold text-white transition hover:bg-teal-700"
          >
            Return to catalog
          </a>
          <div className="mt-10 w-full">
            <EncoreCompleteKit variant="checkout" />
          </div>
          <p className="mt-6 flex items-center justify-center gap-1.5 text-xs font-medium text-slate-500">
            <MessageCircle size={13} aria-hidden="true" className="shrink-0 text-teal-700" />
            Need help? <a href="https://wa.me/19153595448" className="font-semibold text-teal-800 hover:underline">Contact Encore via WhatsApp</a>
          </p>
        </div>
      </main>
    )
  }

  return (
    <main id="main-content" className="min-h-screen bg-[#f5f5f2]">
      <CheckoutHeader />
      <div className="pt-8">
        <CheckoutProgress stage="review" />
      </div>
      <div className="mx-auto max-w-[76rem] px-5 pb-20 sm:px-8">
        <div className="mb-8 max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-700">Cart review</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-[#071724] sm:text-5xl">
            Review your research inquiry.
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-600">
            Confirm the products and shipping context. This submits an order inquiry for review; it does not collect payment.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
          <section className="rounded-[1.75rem] border border-white/70 bg-white/75 p-6 shadow-[0_24px_70px_rgba(7,23,36,0.06)] backdrop-blur-xl sm:p-8">
            <h2 className="text-2xl font-semibold tracking-[-0.04em] text-[#071724]">Contact and shipping</h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-semibold text-[#071724]">
                Email
                <input className={inputClass()} type="email" autoComplete="email" required aria-invalid={showValidation && !isValidEmail(formData.email)} value={formData.email} onChange={(event) => updateField('email', event.target.value)} />
              </label>
              <label className="grid gap-2 text-sm font-semibold text-[#071724]">
                Phone
                <input className={inputClass()} type="tel" autoComplete="tel" required aria-invalid={showValidation && !formData.phone.trim()} value={formData.phone} onChange={(event) => updateField('phone', event.target.value)} />
              </label>
              <label className="grid gap-2 text-sm font-semibold text-[#071724] sm:col-span-2">
                Full name
                <input className={inputClass()} autoComplete="name" required aria-invalid={showValidation && !formData.fullName.trim()} value={formData.fullName} onChange={(event) => updateField('fullName', event.target.value)} />
              </label>
              <label className="grid gap-2 text-sm font-semibold text-[#071724] sm:col-span-2">
                Address
                <input className={inputClass()} autoComplete="street-address" required aria-invalid={showValidation && !formData.address.trim()} value={formData.address} onChange={(event) => updateField('address', event.target.value)} />
              </label>
              <label className="grid gap-2 text-sm font-semibold text-[#071724]">
                City
                <input className={inputClass()} autoComplete="address-level2" required aria-invalid={showValidation && !formData.city.trim()} value={formData.city} onChange={(event) => updateField('city', event.target.value)} />
              </label>
              <label className="grid gap-2 text-sm font-semibold text-[#071724]">
                State
                <input className={inputClass()} autoComplete="address-level1" required aria-invalid={showValidation && !formData.state.trim()} value={formData.state} onChange={(event) => updateField('state', event.target.value)} />
              </label>
              <label className="grid gap-2 text-sm font-semibold text-[#071724]">
                ZIP
                <input className={inputClass()} inputMode="numeric" autoComplete="postal-code" required aria-invalid={showValidation && !formData.zip.trim()} value={formData.zip} onChange={(event) => updateField('zip', event.target.value)} />
              </label>
              <label className="grid gap-2 text-sm font-semibold text-[#071724]">
                Country
                <select className={inputClass()} value={formData.country} onChange={(event) => updateField('country', event.target.value as ReviewFormData['country'])}>
                  <option value="US">United States</option>
                  <option value="MX">Mexico</option>
                </select>
              </label>
              <label className="grid gap-2 text-sm font-semibold text-[#071724] sm:col-span-2">
                Notes
                <textarea
                  rows={4}
                  className="w-full resize-none rounded-2xl border border-slate-900/10 bg-white p-4 text-sm text-[#071724] outline-none transition placeholder:text-slate-400 focus:border-teal-600/70 focus:ring-4 focus:ring-teal-100"
                  value={formData.notes}
                  onChange={(event) => updateField('notes', event.target.value)}
                />
              </label>
            </div>
          </section>

          <aside className="order-first rounded-[1.75rem] border border-white/70 bg-white/85 p-6 shadow-[0_28px_80px_rgba(7,23,36,0.09)] backdrop-blur-2xl sm:p-7 lg:sticky lg:top-8 lg:order-none lg:self-start">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-2xl font-semibold tracking-[-0.04em] text-[#071724]">Cart</h2>
              <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-800">
                {itemCount} {itemCount === 1 ? 'item' : 'items'}
              </span>
            </div>

            {items.length ? (
              <div className="mt-5 grid gap-4">
                {items.map((item) => (
                  <article key={item.id} className="rounded-2xl border border-slate-900/10 bg-white p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-sm font-semibold text-[#071724]">{item.productName}</h3>
                        <p className="mt-1 text-xs text-slate-500">{item.variantLabel} · {item.variantFormat}</p>
                        <p className="mt-2 text-sm font-semibold text-[#071724]">{formatCartCurrency(item.unitPrice)}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.id)}
                        aria-label={`Remove ${item.productName}`}
                        className="text-slate-400 transition hover:text-rose-700"
                      >
                        <Trash2 size={16} aria-hidden="true" />
                      </button>
                    </div>
                    <div className="mt-4 inline-flex items-center rounded-full border border-slate-900/10 bg-[#f8fafc]">
                      <button type="button" onClick={() => updateQuantity(item.id, item.quantity - 1)} className="flex size-9 items-center justify-center text-slate-600">
                        <Minus size={14} aria-hidden="true" />
                      </button>
                      <span className="min-w-8 text-center text-sm font-semibold text-[#071724]">{item.quantity}</span>
                      <button type="button" onClick={() => updateQuantity(item.id, item.quantity + 1)} className="flex size-9 items-center justify-center text-slate-600">
                        <Plus size={14} aria-hidden="true" />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="mt-5 rounded-2xl border border-dashed border-slate-900/15 bg-[#f8fafc] p-8 text-center">
                <ShoppingCart className="mx-auto text-teal-700" size={26} aria-hidden="true" />
                <p className="mt-3 text-sm font-semibold text-[#071724]">Your cart is empty.</p>
                <a href="/catalog" className="mt-4 inline-flex min-h-11 items-center justify-center rounded-full bg-[#071724] px-5 text-sm font-semibold text-white">
                  Browse catalog
                </a>
              </div>
            )}

            <div className="mt-6 grid gap-2 border-t border-slate-900/10 pt-5 text-sm">
              <div className="flex items-center justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-semibold text-[#071724]">{formatCartCurrency(totals.subtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Shipping</span>
                <span className="font-semibold text-[#071724]">{totals.shipping ? formatCartCurrency(totals.shipping) : 'Calculated later'}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Tax</span>
                <span className="font-semibold text-[#071724]">Calculated later</span>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-slate-900/10 pt-4">
                <span className="text-base font-semibold text-[#071724]">Estimated total</span>
                <span className="text-2xl font-semibold tracking-[-0.03em] text-[#071724]">{formatCartCurrency(totals.total)}</span>
              </div>
            </div>

            {items.length ? (
              <div className="mt-6">
                <EncoreCompleteKit variant="checkout" />
              </div>
            ) : null}

            {showValidation && !formIsValid && items.length ? (
              <p className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-900" role="alert">
                Complete every required contact and shipping field with a valid email address.
              </p>
            ) : null}
            {submitError ? (
              <p className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm leading-6 text-rose-800" role="alert">
                {submitError}
              </p>
            ) : null}
            <button
              type="button"
              onClick={submitRequest}
              disabled={!items.length || isSubmitting}
              className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#071724] px-5 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-45"
            >
              {isSubmitting ? 'Submitting inquiry…' : 'Submit order inquiry'}
              <ChevronRight size={16} aria-hidden="true" />
            </button>

            <div className="mt-4 grid gap-1.5">
              <p className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                <ShieldCheck size={13} aria-hidden="true" className="shrink-0 text-teal-700" />
                Secure order processing · Contact information protected
              </p>
              <p className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                <Check size={13} aria-hidden="true" className="shrink-0 text-teal-700" />
                Order details reviewed before submission
              </p>
              <p className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                <MessageCircle size={13} aria-hidden="true" className="shrink-0 text-teal-700" />
                Support available —{' '}
                <a href="https://wa.me/19153595448" className="font-semibold text-teal-800 hover:underline">
                  contact Encore via WhatsApp
                </a>
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}
