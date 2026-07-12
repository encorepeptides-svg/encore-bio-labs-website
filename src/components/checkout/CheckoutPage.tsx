import { Check, ChevronRight, Minus, MessageCircle, Plus, ShieldCheck, ShoppingCart, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import logo from '../../assets/images/logo/encore-logo.png'
import { useCart } from '../../context/useCart'
import { calculateSubtotal, formatCartCurrency, type CartItem } from '../../lib/cart'
import { completeOrderRequest, isCheckoutFormValid, isValidEmail } from '../../lib/checkout'
import { createCRMLeadFromIntake, isCrmUsingSupabase, saveLead } from '../../lib/crmStorage'
import { cn } from '../../lib/utils'
import { buildCartOrderMessage, buildWhatsAppUrl } from '../../lib/whatsapp'
import { EncoreCompleteKit } from '../EncoreCompleteKit'

const checkoutStages = [
  { key: 'cart', label: 'Cart' },
  { key: 'review', label: 'Information' },
  { key: 'next', label: 'Next Step' },
] as const

function CheckoutProgress({ stage }: { stage: 'review' | 'next' }) {
  return (
    <ol className="mx-auto mb-8 flex max-w-[76rem] flex-wrap items-center gap-2 px-5 sm:px-8">
      {checkoutStages.map((item, index) => {
        const isDone = item.key === 'cart' || (stage === 'next' && item.key === 'review')
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
  address2: string
  city: string
  state: string
  zip: string
  country: 'US' | 'MX'
  preferredContact: 'email' | 'phone' | 'whatsapp'
  notes: string
  researchUseAcknowledged: boolean
}

type CheckoutSummary = {
  items: CartItem[]
  subtotal: number
}

const defaultFormData: ReviewFormData = {
  email: '',
  phone: '',
  fullName: '',
  address: '',
  address2: '',
  city: '',
  state: '',
  zip: '',
  country: 'US',
  preferredContact: 'whatsapp',
  notes: '',
  researchUseAcknowledged: false,
}

const CHECKOUT_SESSION_KEY = 'encore-checkout-information-v1'

function readStoredForm(): ReviewFormData {
  if (typeof window === 'undefined') return defaultFormData
  try {
    const stored = JSON.parse(window.sessionStorage.getItem(CHECKOUT_SESSION_KEY) || '{}') as Partial<ReviewFormData>
    return {
      ...defaultFormData,
      email: typeof stored.email === 'string' ? stored.email : '',
      phone: typeof stored.phone === 'string' ? stored.phone : '',
      fullName: typeof stored.fullName === 'string' ? stored.fullName : '',
      address: '',
      address2: '',
      city: '',
      state: '',
      zip: '',
      country: stored.country === 'MX' ? 'MX' : 'US',
      preferredContact: ['email', 'phone', 'whatsapp'].includes(stored.preferredContact || '')
        ? stored.preferredContact as ReviewFormData['preferredContact']
        : 'whatsapp',
      notes: typeof stored.notes === 'string' ? stored.notes : '',
      researchUseAcknowledged: false,
    }
  } catch {
    return defaultFormData
  }
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
          href="/cart"
          className="rounded-full border border-slate-900/10 bg-[#f5f5f2] px-4 py-2 text-xs font-semibold text-slate-600 transition hover:bg-white"
        >
          Return to cart
        </a>
      </div>
    </header>
  )
}

export function CheckoutPage() {
  const { items, itemCount, updateQuantity, removeFromCart, clearCart } = useCart()
  const [formData, setFormData] = useState<ReviewFormData>(() => readStoredForm())
  const [outcome, setOutcome] = useState<'submitted' | 'support' | null>(null)
  const [completedSummary, setCompletedSummary] = useState<CheckoutSummary | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [showValidation, setShowValidation] = useState(false)
  const checkoutFormRef = useRef<HTMLDivElement>(null)
  const subtotal = useMemo(() => calculateSubtotal(items), [items])
  const remoteSubmissionAvailable = isCrmUsingSupabase()
  const supportUrl = buildWhatsAppUrl(buildCartOrderMessage({
    items,
    subtotal: formatCartCurrency(subtotal),
  }))

  useEffect(() => {
    window.sessionStorage.setItem(CHECKOUT_SESSION_KEY, JSON.stringify({
      email: formData.email,
      phone: formData.phone,
      fullName: formData.fullName,
      country: formData.country,
      preferredContact: formData.preferredContact,
      notes: formData.notes,
    }))
  }, [formData])

  const formIsValid = isCheckoutFormValid(formData)

  function updateField<K extends keyof ReviewFormData>(key: K, value: ReviewFormData[K]) {
    setFormData((current) => ({ ...current, [key]: value }))
  }

  async function submitRequest() {
    setShowValidation(true)
    setSubmitError('')
    if (!formIsValid || !items.length || isSubmitting) {
      window.requestAnimationFrame(() => checkoutFormRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus())
      return
    }

    if (!remoteSubmissionAvailable) {
      setOutcome('support')
      return
    }

    const nameParts = formData.fullName.trim().split(/\s+/)
    const firstName = nameParts.shift() || ''
    const lastName = nameParts.join(' ')
    const submittedAt = new Date().toISOString()

    setIsSubmitting(true)
    try {
      await completeOrderRequest(() => saveLead(
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
            `Shipping address: ${[
              formData.address.trim(),
              formData.address2.trim(),
              formData.city.trim(),
              formData.state.trim(),
              formData.zip.trim(),
              formData.country === 'MX' ? 'Mexico' : 'United States',
            ].filter(Boolean).join(', ')}`,
            `Cart subtotal: ${formatCartCurrency(subtotal)}. Shipping and final details require review. No payment collected.`,
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
            budget: formatCartCurrency(subtotal),
            deliveryCity: formData.city.trim(),
            preferredContactMethod: formData.preferredContact,
            consentToContact: true,
            researchUseAcknowledgment: true,
          },
        }),
      ).then(() => undefined), clearCart)
      setCompletedSummary({ items, subtotal })
      window.sessionStorage.removeItem(CHECKOUT_SESSION_KEY)
      setOutcome('submitted')
    } catch {
      setSubmitError('We could not submit your inquiry. Your cart is still saved—please try again or contact support through WhatsApp.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (outcome) {
    const summaryItems = completedSummary?.items ?? items
    const summarySubtotal = completedSummary?.subtotal ?? subtotal

    return (
      <main id="main-content" className="min-h-screen bg-[#f5f5f2]">
        <CheckoutHeader />
        <div className="pt-8">
          <CheckoutProgress stage="next" />
        </div>
        <div className="mx-auto flex max-w-xl flex-col items-center px-5 py-16 text-center sm:px-8">
          <span className="flex size-16 items-center justify-center rounded-full bg-teal-50 text-teal-700">
            <Check size={28} aria-hidden="true" />
          </span>
          <h1 className="mt-6 text-4xl font-semibold tracking-[-0.05em] text-[#071724]">
            {outcome === 'submitted' ? 'Order Request Submitted' : 'Continue with Encore Support'}
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-600">
            {outcome === 'submitted'
              ? 'Your order request was saved for Encore review. Availability, shipping, and final order details still require confirmation. No payment was collected.'
              : 'Your contact preferences are saved in this browser and your cart remains intact. Continue to WhatsApp to send the product, strength, quantity, and subtotal summary to Encore. Opening WhatsApp does not complete an order.'}
          </p>
          <section className="mt-8 w-full rounded-3xl border border-slate-900/10 bg-white p-5 text-left" aria-labelledby="request-summary-heading">
            <h2 id="request-summary-heading" className="text-lg font-semibold text-[#071724]">Request summary</h2>
            <div className="mt-4 grid gap-3">
              {summaryItems.map((item) => (
                <div key={item.id} className="flex items-start justify-between gap-4 text-sm">
                  <span className="text-slate-600">{item.productName} · {item.variantLabel} × {item.quantity}</span>
                  <span className="shrink-0 font-semibold text-[#071724]">{formatCartCurrency(item.unitPrice * item.quantity)}</span>
                </div>
              ))}
              <div className="flex items-center justify-between border-t border-slate-900/10 pt-3 text-sm font-semibold text-[#071724]">
                <span>Subtotal</span>
                <span>{formatCartCurrency(summarySubtotal)}</span>
              </div>
            </div>
          </section>
          <a
            href={outcome === 'submitted' ? '/catalog' : supportUrl}
            target={outcome === 'support' ? '_blank' : undefined}
            rel={outcome === 'support' ? 'noopener noreferrer' : undefined}
            className="mt-8 inline-flex min-h-12 items-center justify-center rounded-full bg-[#071724] px-7 text-sm font-semibold text-white transition hover:bg-teal-700"
          >
            {outcome === 'submitted' ? 'Return to catalog' : 'Continue on WhatsApp'}
          </a>
          {outcome === 'support' ? <a href="/cart" className="mt-3 text-sm font-semibold text-slate-600 hover:text-[#071724]">Return to cart</a> : null}
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

  if (!items.length) {
    return (
      <main id="main-content" className="min-h-screen bg-[#f5f5f2]">
        <CheckoutHeader />
        <div className="mx-auto flex max-w-xl flex-col items-center px-5 py-24 text-center sm:px-8">
          <ShoppingCart size={32} aria-hidden="true" className="text-teal-700" />
          <h1 className="mt-6 text-4xl font-semibold tracking-[-0.05em] text-[#071724]">Your cart is empty.</h1>
          <p className="mt-4 text-base leading-7 text-slate-600">Add a product and strength before continuing to order information.</p>
          <a href="/catalog" className="mt-8 inline-flex min-h-12 items-center justify-center rounded-full bg-[#071724] px-7 text-sm font-semibold text-white">Browse Products</a>
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

        <div ref={checkoutFormRef} className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
          <section className="rounded-[1.75rem] border border-white/70 bg-white/75 p-6 shadow-[0_24px_70px_rgba(7,23,36,0.06)] backdrop-blur-xl sm:p-8">
            <h2 className="text-2xl font-semibold tracking-[-0.04em] text-[#071724]">Contact and shipping</h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-semibold text-[#071724]">
                Email
                <input className={inputClass()} type="email" autoComplete="email" required aria-invalid={showValidation && !isValidEmail(formData.email)} aria-describedby={showValidation && !isValidEmail(formData.email) ? 'email-error' : undefined} value={formData.email} onChange={(event) => updateField('email', event.target.value)} />
                {showValidation && !isValidEmail(formData.email) ? <span id="email-error" className="text-xs font-medium text-rose-700">Enter a valid email address.</span> : null}
              </label>
              <label className="grid gap-2 text-sm font-semibold text-[#071724]">
                Phone
                <input className={inputClass()} type="tel" inputMode="tel" autoComplete="tel" required aria-invalid={showValidation && formData.phone.trim().length < 7} aria-describedby={showValidation && formData.phone.trim().length < 7 ? 'phone-error' : undefined} value={formData.phone} onChange={(event) => updateField('phone', event.target.value)} />
                {showValidation && formData.phone.trim().length < 7 ? <span id="phone-error" className="text-xs font-medium text-rose-700">Enter a phone number with at least 7 digits.</span> : null}
              </label>
              <label className="grid gap-2 text-sm font-semibold text-[#071724] sm:col-span-2">
                Full name
                <input className={inputClass()} autoComplete="name" required aria-invalid={showValidation && !formData.fullName.trim()} aria-describedby={showValidation && !formData.fullName.trim() ? 'full-name-error' : undefined} value={formData.fullName} onChange={(event) => updateField('fullName', event.target.value)} />
                {showValidation && !formData.fullName.trim() ? <span id="full-name-error" className="text-xs font-medium text-rose-700">Enter your full name.</span> : null}
              </label>
              <label className="grid gap-2 text-sm font-semibold text-[#071724] sm:col-span-2">
                Address
                <input className={inputClass()} autoComplete="street-address" required aria-invalid={showValidation && !formData.address.trim()} aria-describedby={showValidation && !formData.address.trim() ? 'address-error' : undefined} value={formData.address} onChange={(event) => updateField('address', event.target.value)} />
                {showValidation && !formData.address.trim() ? <span id="address-error" className="text-xs font-medium text-rose-700">Enter a shipping address.</span> : null}
              </label>
              <label className="grid gap-2 text-sm font-semibold text-[#071724] sm:col-span-2">
                Address line 2 <span className="font-normal text-slate-400">(optional)</span>
                <input className={inputClass()} autoComplete="address-line2" value={formData.address2} onChange={(event) => updateField('address2', event.target.value)} />
              </label>
              <label className="grid gap-2 text-sm font-semibold text-[#071724]">
                City
                <input className={inputClass()} autoComplete="address-level2" required aria-invalid={showValidation && !formData.city.trim()} aria-describedby={showValidation && !formData.city.trim() ? 'city-error' : undefined} value={formData.city} onChange={(event) => updateField('city', event.target.value)} />
                {showValidation && !formData.city.trim() ? <span id="city-error" className="text-xs font-medium text-rose-700">Enter a city.</span> : null}
              </label>
              <label className="grid gap-2 text-sm font-semibold text-[#071724]">
                State
                <input className={inputClass()} autoComplete="address-level1" required aria-invalid={showValidation && !formData.state.trim()} aria-describedby={showValidation && !formData.state.trim() ? 'state-error' : undefined} value={formData.state} onChange={(event) => updateField('state', event.target.value)} />
                {showValidation && !formData.state.trim() ? <span id="state-error" className="text-xs font-medium text-rose-700">Enter a state or region.</span> : null}
              </label>
              <label className="grid gap-2 text-sm font-semibold text-[#071724]">
                ZIP
                <input className={inputClass()} inputMode="numeric" autoComplete="postal-code" required aria-invalid={showValidation && !formData.zip.trim()} aria-describedby={showValidation && !formData.zip.trim() ? 'zip-error' : undefined} value={formData.zip} onChange={(event) => updateField('zip', event.target.value)} />
                {showValidation && !formData.zip.trim() ? <span id="zip-error" className="text-xs font-medium text-rose-700">Enter a postal code.</span> : null}
              </label>
              <label className="grid gap-2 text-sm font-semibold text-[#071724]">
                Country
                <select className={inputClass()} value={formData.country} onChange={(event) => updateField('country', event.target.value as ReviewFormData['country'])}>
                  <option value="US">United States</option>
                  <option value="MX">Mexico</option>
                </select>
              </label>
              <label className="grid gap-2 text-sm font-semibold text-[#071724] sm:col-span-2">
                Preferred contact method
                <select className={inputClass()} value={formData.preferredContact} onChange={(event) => updateField('preferredContact', event.target.value as ReviewFormData['preferredContact'])}>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="email">Email</option>
                  <option value="phone">Phone</option>
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
              <div className="grid gap-2 sm:col-span-2">
                <label className="flex items-start gap-3 rounded-2xl border border-slate-900/10 bg-[#f8fafc] p-4 text-sm leading-6 text-slate-600">
                  <input type="checkbox" checked={formData.researchUseAcknowledged} onChange={(event) => updateField('researchUseAcknowledged', event.target.checked)} aria-invalid={showValidation && !formData.researchUseAcknowledged} aria-describedby={showValidation && !formData.researchUseAcknowledged ? 'research-use-error' : undefined} className="mt-1 size-4 accent-teal-700" />
                  <span>By continuing, I acknowledge that Encore Bio Labs products are sold for research use only and are not intended for human consumption or clinical use.</span>
                </label>
                {showValidation && !formData.researchUseAcknowledged ? <span id="research-use-error" className="text-xs font-medium text-rose-700">Acknowledge the research-use terms to continue.</span> : null}
              </div>
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
                        <p className="mt-2 text-xs text-slate-500">{formatCartCurrency(item.unitPrice)} each</p>
                        <p className="mt-1 text-sm font-semibold text-[#071724]">{formatCartCurrency(item.unitPrice * item.quantity)}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.id)}
                        aria-label={`Remove ${item.productName} ${item.variantLabel} from order request`}
                        className="text-slate-400 transition hover:text-rose-700"
                      >
                        <Trash2 size={16} aria-hidden="true" />
                      </button>
                    </div>
                    <div className="mt-4 inline-flex items-center rounded-full border border-slate-900/10 bg-[#f8fafc]">
                      <button type="button" aria-label={`Decrease ${item.productName} ${item.variantLabel} quantity`} onClick={() => updateQuantity(item.id, item.quantity - 1)} className="flex size-9 items-center justify-center text-slate-600">
                        <Minus size={14} aria-hidden="true" />
                      </button>
                      <span className="min-w-8 text-center text-sm font-semibold text-[#071724]">{item.quantity}</span>
                      <button type="button" aria-label={`Increase ${item.productName} ${item.variantLabel} quantity`} onClick={() => updateQuantity(item.id, item.quantity + 1)} className="flex size-9 items-center justify-center text-slate-600">
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
                <span className="font-semibold text-[#071724]">{formatCartCurrency(subtotal)}</span>
              </div>
              <p className="mt-2 text-xs leading-5 text-slate-500">Shipping is confirmed during order review. Taxes and a final payable total are not calculated here.</p>
            </div>

            {items.length ? (
              <div className="mt-6">
                <EncoreCompleteKit variant="checkout" />
                <p className="mt-2 text-xs leading-5 text-slate-500">Each eligible cart line receives its product-specific Complete Kit according to the reviewed order details.</p>
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
              {isSubmitting ? 'Submitting order request…' : remoteSubmissionAvailable ? 'Submit Order Request' : 'Continue with Encore Support'}
              <ChevronRight size={16} aria-hidden="true" />
            </button>

            <div className="mt-4 grid gap-1.5">
              <p className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                <ShieldCheck size={13} aria-hidden="true" className="shrink-0 text-teal-700" />
                Contact information stays in this form unless a remote request is successfully submitted
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
            <p className="mt-4 text-xs leading-5 text-slate-500">
              Review our <a href="/legal/terms" className="font-semibold text-teal-800 hover:underline">Terms</a>,{' '}
              <a href="/legal/privacy" className="font-semibold text-teal-800 hover:underline">Privacy Policy</a>, and{' '}
              <a href="/legal/shipping-returns" className="font-semibold text-teal-800 hover:underline">Shipping & Returns</a>.
            </p>
          </aside>
        </div>
      </div>
    </main>
  )
}
