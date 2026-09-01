import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import {
  ArrowLeft,
  ArrowRight,
  Banknote,
  Building2,
  Camera,
  Check,
  Clock,
  Coins,
  Copy,
  CreditCard,
  Landmark,
  MapPin,
  MessageCircle,
  Package,
  QrCode,
  ShieldCheck,
  Smartphone,
  Store,
  Truck,
  Wallet,
  X,
  Zap,
  type LucideIcon,
} from 'lucide-react'
import logo from '../../assets/images/logo/encore-logo.png'
import { useLocale, useTranslation } from '../../i18n/LocaleContext'
import { purchaseTypeLabel } from '../../i18n/displayLabels'
import type { CartItem } from '../../lib/cart'
import { calculateSubtotal, formatCartCurrency } from '../../lib/cart'
import { promotionDiscountCents, promotionDiscountRate, qualifiesForFreeShipping } from '../../lib/promotions'
import { makeQrDataUrl } from '../../lib/qrCode'
import {
  EXPRESS_LOCAL_CITIES,
  buildExpressLabelBlock,
  buildExpressOrderMessage,
  buildExpressOrderUrl,
  createExpressOrderReference,
  emptyExpressAddress,
  emptyExpressContact,
  expressAcknowledgment,
  expressCountry,
  expressDetailsArriveInChat,
  expressOrderIssues,
  expressPayableCents,
  expressPaymentDetails,
  expressPaymentLink,
  expressPaymentMethod,
  expressPaymentMethodsFor,
  expressSurchargeCents,
  type ExpressAddress,
  type ExpressContact,
  type ExpressDestination,
  type ExpressFulfillment,
  type ExpressLocalCity,
  type ExpressPaymentMethodId,
  type ExpressPickupDay,
  type ExpressPickupWindow,
} from '../../lib/storefront/expressCheckout'
import { useReferralAttribution } from '../../lib/useReferralAttribution'
import { ProductImage } from '../ProductImage'

/**
 * The express order dialog.
 *
 * It exists to produce two artifacts the moment the chat opens: a printable
 * shipping label and a chosen payment rail. Three steps, in the order the
 * operator needs them — where it goes, how it gets paid, then one look at the
 * exact text that will be sent.
 *
 * The label block is shown to the shopper on the last step rather than hidden.
 * It is the strongest accuracy check available on a path with no address
 * verification: a shopper proof-reads their own address far better than they
 * proof-read a form, and what they approve is byte-for-byte what arrives in
 * WhatsApp and goes onto the carrier form.
 */

const PREMIUM_EASE = [0.16, 1, 0.3, 1] as const
const SHIP_TO_STORAGE_KEY = 'encore-express-ship-to-v1'

type Step = 0 | 1 | 2

const destinationIcons: Record<ExpressDestination, LucideIcon> = { us: Truck, mexico: Package, local: Store }
const localCityIcons: Record<ExpressLocalCity, LucideIcon> = { el_paso: Building2, juarez: Building2 }
const paymentIcons: Record<ExpressPaymentMethodId, LucideIcon> = {
  zelle: Zap,
  cashapp: CreditCard,
  paypal: Wallet,
  apple_pay: Smartphone,
  mx_bank_transfer: Landmark,
  cash_pickup: Coins,
  cod: Banknote,
}

type StoredShipTo = { contact: ExpressContact; address: ExpressAddress; destination: ExpressDestination; localCity: ExpressLocalCity | null }

function readStoredShipTo(): StoredShipTo | null {
  if (typeof window === 'undefined') return null
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(SHIP_TO_STORAGE_KEY) ?? 'null')
    if (!parsed || typeof parsed !== 'object') return null
    const candidate = parsed as Partial<StoredShipTo>
    if (!candidate.contact || !candidate.address) return null
    return {
      contact: { ...emptyExpressContact(), ...candidate.contact },
      address: { ...emptyExpressAddress(), ...candidate.address },
      destination: candidate.destination === 'mexico' || candidate.destination === 'local' ? candidate.destination : 'us',
      localCity: candidate.localCity && candidate.localCity in EXPRESS_LOCAL_CITIES ? candidate.localCity : null,
    }
  } catch {
    return null
  }
}

/**
 * One labelled text input.
 *
 * Defined at module scope on purpose: a component declared inside the dialog
 * body would be a new type on every keystroke, so React would unmount and
 * remount the input and the caret would jump out of the field mid-address.
 */
function ExpressField({ id, label, value, onChange, optional = false, optionalLabel, invalid = false, error, placeholder, autoComplete, inputMode, className = '' }: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  optional?: boolean
  optionalLabel?: string
  invalid?: boolean
  error?: string
  placeholder?: string
  autoComplete?: string
  inputMode?: 'text' | 'tel' | 'email' | 'numeric'
  className?: string
}) {
  return (
    <label className={`grid gap-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-slate-500 ${className}`} htmlFor={id}>
      <span>
        {label}
        {optional && optionalLabel ? <span className="ml-1.5 font-medium normal-case tracking-normal text-slate-400">{optionalLabel}</span> : null}
      </span>
      <input
        id={id}
        className={`min-h-11 w-full rounded-xl border bg-white px-3.5 text-sm text-[#071724] outline-none transition placeholder:text-slate-400 focus:ring-4 focus:ring-teal-100 ${invalid ? 'border-rose-400 bg-rose-50/40' : 'border-slate-900/12 focus:border-teal-600'}`}
        value={value}
        placeholder={placeholder}
        autoComplete={autoComplete}
        inputMode={inputMode}
        aria-invalid={invalid}
        onChange={(event) => onChange(event.target.value)}
      />
      {invalid && error ? <span className="text-xs font-medium normal-case tracking-normal text-rose-700">{error}</span> : null}
    </label>
  )
}

export function ExpressOrderDialog({ items, open, onClose }: { items: CartItem[]; open: boolean; onClose: () => void }) {
  const { locale, path } = useLocale()
  const { t } = useTranslation('cart')
  const { t: tCommon } = useTranslation('common')
  const referralAttribution = useReferralAttribution()
  const prefersReducedMotion = useReducedMotion()
  const fieldId = useId()
  const dialogRef = useRef<HTMLDivElement>(null)
  const paneRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const stored = useRef<StoredShipTo | null>(null)

  const [reference, setReference] = useState(() => createExpressOrderReference())
  const [step, setStep] = useState<Step>(0)
  const [destination, setDestination] = useState<ExpressDestination>('us')
  const [localCity, setLocalCity] = useState<ExpressLocalCity | null>(null)
  const [fulfillment, setFulfillment] = useState<ExpressFulfillment>('ship')
  const [contact, setContact] = useState<ExpressContact>(emptyExpressContact)
  const [address, setAddress] = useState<ExpressAddress>(emptyExpressAddress)
  const [paymentMethod, setPaymentMethod] = useState<ExpressPaymentMethodId | null>(null)
  const [pickupDay, setPickupDay] = useState<ExpressPickupDay | null>(null)
  const [pickupWindow, setPickupWindow] = useState<ExpressPickupWindow | null>(null)
  const [notes, setNotes] = useState('')
  const [accepted, setAccepted] = useState(false)
  const [showValidation, setShowValidation] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const [sent, setSent] = useState(false)
  const [qr, setQr] = useState<string | null>(null)

  // A returning shopper should not retype a label they already dictated once.
  // Only the ship-to details are restored; the reference, payment rail, and
  // acknowledgment are per-order and always start clean.
  useEffect(() => {
    if (!open) return
    stored.current ??= readStoredShipTo()
    const previous = stored.current
    setReference(createExpressOrderReference())
    setStep(0)
    setShowValidation(false)
    setSent(false)
    setAccepted(false)
    setPaymentMethod(null)
    setPickupDay(null)
    setPickupWindow(null)
    setQr(null)
    if (previous) {
      setContact(previous.contact)
      setAddress(previous.address)
      setDestination(previous.destination)
      setLocalCity(previous.localCity)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeButtonRef.current?.focus()

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
      if (event.key !== 'Tab' || !dialogRef.current) return
      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'),
      ).filter((element) => !element.hasAttribute('hidden'))
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (!first || !last) return
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
      previouslyFocused?.focus()
    }
  }, [onClose, open])

  // A step change swaps the whole pane's content, so the shopper must land at
  // the top of the new step rather than wherever the previous one was scrolled.
  useEffect(() => {
    paneRef.current?.scrollTo({ top: 0 })
  }, [step])

  // Picking a local city already states the country, city, and state, so those
  // are filled in rather than asked for twice.
  useEffect(() => {
    if (destination !== 'local' || !localCity) return
    const preset = EXPRESS_LOCAL_CITIES[localCity]
    setAddress((current) => ({ ...current, city: preset.city, state: preset.state }))
  }, [destination, localCity])

  useEffect(() => {
    if (destination === 'local') return
    setLocalCity(null)
    setFulfillment('ship')
  }, [destination])


  useEffect(() => {
    if (fulfillment === 'pickup') return
    setPickupDay(null)
    setPickupWindow(null)
  }, [fulfillment])

  const country = expressCountry(destination, localCity)
  const subtotal = calculateSubtotal(items)
  const subtotalCents = Math.round(subtotal * 100)
  const discountCents = promotionDiscountCents(subtotalCents)
  const discountRate = promotionDiscountRate(subtotalCents)
  const surchargeCents = expressSurchargeCents(subtotalCents, paymentMethod)
  const availableMethods = useMemo(() => expressPaymentMethodsFor(destination, localCity, fulfillment), [destination, fulfillment, localCity])
  const paymentDetails = expressPaymentDetails(paymentMethod)
  const payableCents = expressPayableCents({ items, destination, localCity, fulfillment, paymentMethod })
  const paymentLink = expressPaymentLink(paymentMethod, payableCents)
  const detailsInChat = expressDetailsArriveInChat(paymentMethod)
  // Only a rail the customer sends money on can produce a receipt to photograph.
  const prepaidRail = Boolean(paymentMethod) && paymentMethod !== 'cod' && paymentMethod !== 'cash_pickup'
  // A rail can stop being offered when the shopper goes back and switches to
  // pickup or a US address; the stale choice must not survive into the message.
  const selectionStillOffered = !paymentMethod || availableMethods.some((method) => method.id === paymentMethod)

  useEffect(() => {
    if (!selectionStillOffered) setPaymentMethod(null)
  }, [selectionStillOffered])

  const issues = expressOrderIssues({ contact, destination, localCity, fulfillment, address, paymentMethod })
  const deliveryIssues = (['name', 'phone', 'localCity', 'street', 'neighborhood', 'city', 'state', 'postalCode'] as const).filter((field) => issues[field])
  const deliveryReady = deliveryIssues.length === 0
  const paymentReady = !issues.paymentMethod
  const readyToSend = deliveryReady && paymentReady && accepted && items.length > 0

  const orderInput = {
    reference,
    items,
    locale,
    contact,
    destination,
    localCity,
    fulfillment,
    address,
    paymentMethod,
    pickupDay,
    pickupWindow,
    notes,
    referralCode: referralAttribution?.code ?? null,
    translatePurchaseType: (value: string) => purchaseTypeLabel(tCommon, value),
  }
  const labelBlock = buildExpressLabelBlock({ locale, contact, destination, localCity, fulfillment, address })
  const message = buildExpressOrderMessage(orderInput)

  // A rail the shopper cannot select is worse than no rail at all, so a method
  // whose destination account is still blank in config is flagged rather than
  // silently handing the shopper nothing to pay into.
  function persistShipTo() {
    try {
      window.localStorage.setItem(SHIP_TO_STORAGE_KEY, JSON.stringify({ contact, address, destination, localCity } satisfies StoredShipTo))
    } catch {
      // A browser with storage disabled simply forgets the address next time.
    }
  }

  async function copy(value: string, key: string) {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(key)
      window.setTimeout(() => setCopied((current) => (current === key ? null : current)), 2000)
    } catch {
      setCopied(null)
    }
  }

  /**
   * Scrolls the first field that is blocking the step into view.
   *
   * Without this the shopper can be at the bottom of a long delivery step,
   * press Continue, and see nothing happen — every error is rendered above the
   * fold. Deferred a frame so it runs after the invalid styling is painted.
   *
   * The scroll is instant rather than smooth: focusing the field cancels an
   * in-flight smooth scroll, which left the pane stranded partway and the field
   * still off-screen — exactly the problem this is here to solve.
   */
  function revealFirstIssue() {
    requestAnimationFrame(() => {
      const invalid = paneRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')
      if (!invalid) {
        paneRef.current?.scrollTo({ top: 0 })
        return
      }
      invalid.focus({ preventScroll: true })
      invalid.scrollIntoView({ block: 'center' })
    })
  }

  function advance() {
    setShowValidation(true)
    if ((step === 0 && !deliveryReady) || (step === 1 && !paymentReady)) {
      revealFirstIssue()
      return
    }
    setShowValidation(false)
    setStep((current) => (current === 2 ? current : ((current + 1) as Step)))
  }

  function send() {
    setShowValidation(true)
    if (!readyToSend) {
      revealFirstIssue()
      return
    }
    persistShipTo()
    window.open(buildExpressOrderUrl(orderInput), '_blank', 'noopener,noreferrer')
    setSent(true)
  }

  /**
   * A desktop shopper has the order in front of them and WhatsApp on their
   * phone. The QR carries the whole prefilled wa.me link, so scanning it hands
   * the phone the finished message rather than making them retype anything.
   *
   * That link runs about 1,600 characters once the label and acknowledgment are
   * encoded, which is a ~150-module QR. It is generated at level `L` and 1024px
   * and rendered at 18rem for that reason: at the default level and a thumbnail
   * size each module lands on roughly one screen pixel and no phone camera can
   * resolve it. Nothing is lost — the code lives on a screen, not on a box.
   */
  async function showQr() {
    if (qr) {
      setQr(null)
      return
    }
    setQr(await makeQrDataUrl(buildExpressOrderUrl(orderInput), { width: 1024, errorCorrectionLevel: 'L' }).catch(() => null))
  }

  const money = (cents: number) => formatCartCurrency(cents / 100, locale)
  const steps = [t('expressStepDelivery'), t('expressStepPayment'), t('expressStepReview')]


  // Rendered into <body> on purpose. The cart summary that owns this dialog
  // sits inside the app shell's `overflow-x-clip` wrapper, and a fixed overlay
  // inside that wrapper is painted underneath the sticky navbar no matter how
  // high its z-index goes — which buries the close button. The portal is the
  // same escape the cart drawer gets by being mounted at the App root.
  if (typeof document === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[130] flex items-end justify-center sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.25 }}
        >
          <button type="button" aria-label={t('expressClose')} onClick={onClose} className="absolute inset-0 cursor-default bg-[#04121c]/70 backdrop-blur-sm" />

          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${fieldId}-title`}
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 40, scale: 0.98 }}
            animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.98 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.42, ease: PREMIUM_EASE }}
            className="relative flex max-h-[92vh] w-full max-w-[64rem] flex-col overflow-hidden rounded-t-[2rem] bg-[#f5f5f2] shadow-[0_40px_120px_rgba(4,18,28,0.45)] sm:max-h-[88vh] sm:rounded-[2rem]"
          >
            {/* Header — navy glass with the molecule wash used across the site. */}
            <header className="relative shrink-0 overflow-hidden bg-[#071724] px-5 pb-5 pt-5 text-white sm:px-8 sm:pb-6 sm:pt-6">
              <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-70" style={{ backgroundImage: 'radial-gradient(120% 140% at 12% -20%, rgba(45,212,191,0.28) 0%, rgba(7,23,36,0) 55%), radial-gradient(90% 120% at 92% 0%, rgba(56,189,248,0.16) 0%, rgba(7,23,36,0) 60%)' }} />
              <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)', backgroundSize: '22px 22px' }} />

              <div className="relative flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2.5">
                    <img src={logo} alt="" aria-hidden="true" className="h-6 w-auto brightness-0 invert" />
                    <span className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-teal-300">{t('expressBadge')}</span>
                  </div>
                  <h2 id={`${fieldId}-title`} className="mt-3 text-2xl font-semibold tracking-[-0.04em] sm:text-3xl">{t('expressTitle')}</h2>
                  <p className="mt-1.5 max-w-lg text-sm leading-6 text-slate-300">{t('expressBody')}</p>
                </div>
                <button
                  ref={closeButtonRef}
                  type="button"
                  onClick={onClose}
                  aria-label={t('expressClose')}
                  className="flex size-10 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white transition hover:bg-white/20 focus:outline-none focus:ring-4 focus:ring-teal-500/40"
                >
                  <X size={17} aria-hidden="true" />
                </button>
              </div>

              <div className="relative mt-5 flex flex-wrap items-center gap-x-4 gap-y-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 font-mono text-xs tracking-[0.08em] text-teal-200">{reference}</span>
                <ol className="flex flex-1 items-center gap-2 text-xs font-semibold">
                  {steps.map((label, index) => (
                    <li key={label} className="flex flex-1 items-center gap-2">
                      <span className={`flex size-6 shrink-0 items-center justify-center rounded-full text-[0.7rem] transition ${index < step ? 'bg-teal-400 text-[#071724]' : index === step ? 'bg-white text-[#071724]' : 'border border-white/25 text-white/50'}`}>
                        {index < step ? <Check size={12} aria-hidden="true" strokeWidth={3} /> : index + 1}
                      </span>
                      <span className={`hidden truncate sm:block ${index === step ? 'text-white' : 'text-white/50'}`}>{label}</span>
                      {index < steps.length - 1 ? <span aria-hidden="true" className={`h-px flex-1 ${index < step ? 'bg-teal-400' : 'bg-white/15'}`} /> : null}
                    </li>
                  ))}
                </ol>
              </div>
            </header>

            <div className="grid min-h-0 flex-1 grid-cols-1 overflow-hidden lg:grid-cols-[minmax(0,1fr)_20rem]">
              <div ref={paneRef} className="min-h-0 overflow-y-auto px-5 py-6 sm:px-8">
                {step === 0 ? (
                  <div className="grid gap-6">
                    <fieldset>
                      <legend className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-700">{t('expressDestination')}</legend>
                      <div className="mt-3 grid gap-2.5 sm:grid-cols-3">
                        {(['us', 'mexico', 'local'] as const).map((option) => {
                          const Icon = destinationIcons[option]
                          const selected = destination === option
                          return (
                            <button
                              key={option}
                              type="button"
                              aria-pressed={selected}
                              onClick={() => setDestination(option)}
                              className={`relative flex min-h-20 flex-col items-start gap-2 rounded-2xl border p-3.5 text-left transition ${selected ? 'border-teal-700 bg-teal-50/70 shadow-[0_12px_32px_rgba(7,23,36,0.1)] ring-2 ring-teal-600/25' : 'border-slate-900/10 bg-white/70 hover:border-teal-500/60 hover:bg-white'}`}
                            >
                              <Icon size={18} aria-hidden="true" className={selected ? 'text-teal-700' : 'text-slate-400'} />
                              {selected ? <Check size={14} aria-hidden="true" strokeWidth={3} className="absolute right-3 top-3 text-teal-700" /> : null}
                              <span className="text-sm font-semibold text-[#071724]">{t(`expressDestination_${option}`)}</span>
                              <span className="text-xs leading-4 text-slate-500">{t(`expressDestinationNote_${option}`)}</span>
                            </button>
                          )
                        })}
                      </div>
                    </fieldset>

                    {destination === 'local' ? (
                      <div className="grid gap-4 rounded-2xl border border-teal-200 bg-teal-50/60 p-4">
                        <fieldset>
                          <legend className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-800">{t('expressLocalCity')}</legend>
                          <div className="mt-2.5 flex flex-wrap gap-2">
                            {(Object.keys(EXPRESS_LOCAL_CITIES) as ExpressLocalCity[]).map((city) => {
                              const Icon = localCityIcons[city]
                              const selected = localCity === city
                              return (
                                <button
                                  key={city}
                                  type="button"
                                  aria-pressed={selected}
                                  aria-invalid={showValidation && Boolean(issues.localCity)}
                                  onClick={() => setLocalCity(city)}
                                  className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-3.5 text-xs font-semibold transition ${selected ? 'border-teal-700 bg-teal-600 text-white' : showValidation && issues.localCity ? 'border-rose-400 bg-white text-slate-600' : 'border-teal-900/12 bg-white/70 text-slate-600 hover:border-teal-500'}`}
                                >
                                  <Icon size={14} aria-hidden="true" />
                                  {t(`expressLocalCity_${city}`)}
                                </button>
                              )
                            })}
                          </div>
                          {showValidation && issues.localCity ? <p className="mt-2 text-xs font-medium text-rose-700" role="alert">{t('expressLocalCityError')}</p> : null}
                        </fieldset>
                        <fieldset>
                          <legend className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-800">{t('expressFulfillment')}</legend>
                          <div className="mt-2.5 flex flex-wrap gap-2">
                            {(['ship', 'pickup'] as const).map((option) => {
                              const selected = fulfillment === option
                              return (
                                <button
                                  key={option}
                                  type="button"
                                  aria-pressed={selected}
                                  onClick={() => setFulfillment(option)}
                                  className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-3.5 text-xs font-semibold transition ${selected ? 'border-teal-700 bg-teal-600 text-white' : 'border-teal-900/12 bg-white/70 text-slate-600 hover:border-teal-500'}`}
                                >
                                  {option === 'pickup' ? <Store size={14} aria-hidden="true" /> : <Truck size={14} aria-hidden="true" />}
                                  {t(`expressFulfillment_${option}`)}
                                </button>
                              )
                            })}
                          </div>
                        </fieldset>
                      </div>
                    ) : null}

                    <div className="grid gap-4 sm:grid-cols-2">
                      <ExpressField id={`${fieldId}-name`} label={t('expressName')} value={contact.name} onChange={(value) => setContact((c) => ({ ...c, name: value }))} autoComplete="name" placeholder={t('expressNamePlaceholder')} invalid={showValidation && Boolean(issues.name)} error={t('expressNameError')} />
                      <ExpressField id={`${fieldId}-phone`} label={t('expressPhone')} value={contact.phone} onChange={(value) => setContact((c) => ({ ...c, phone: value }))} autoComplete="tel" inputMode="tel" placeholder={country === 'MX' ? '+52 656 123 4567' : '+1 915 123 4567'} invalid={showValidation && Boolean(issues.phone)} error={t(issues.phone === 'invalid' ? 'expressPhoneInvalid' : 'expressPhoneError')} />
                      <ExpressField id={`${fieldId}-email`} label={t('expressEmail')} value={contact.email} onChange={(value) => setContact((c) => ({ ...c, email: value }))} autoComplete="email" inputMode="email" optional optionalLabel={t('expressOptional')} placeholder={t('expressEmailPlaceholder')} className="sm:col-span-2" />
                    </div>
                    <p className="-mt-2 flex items-start gap-2 text-xs leading-5 text-slate-500">
                      <ShieldCheck size={14} aria-hidden="true" className="mt-0.5 shrink-0 text-teal-700" />
                      {t('expressPhoneNote')}
                    </p>

                    {fulfillment === 'pickup' ? (
                      <div className="grid gap-4 rounded-2xl border border-slate-900/10 bg-white p-4">
                        <div>
                          <p className="flex items-center gap-2 text-sm font-semibold text-[#071724]"><Store size={15} aria-hidden="true" className="text-teal-700" />{t('expressPickupTitle')}</p>
                          <p className="mt-1.5 text-xs leading-5 text-slate-500">{t('expressPickupBody')}</p>
                        </div>
                        <fieldset>
                          <legend className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-teal-700">
                            <Clock size={13} aria-hidden="true" />
                            {t('expressPickupWhen')} <span className="font-medium normal-case tracking-normal text-slate-400">{t('expressOptional')}</span>
                          </legend>
                          <div className="flex flex-wrap gap-2">
                            {(['today', 'tomorrow', 'later'] as const).map((day) => {
                              const selected = pickupDay === day
                              return (
                                <button
                                  key={day}
                                  type="button"
                                  aria-pressed={selected}
                                  onClick={() => setPickupDay(selected ? null : day)}
                                  className={`min-h-11 rounded-full border px-3.5 text-xs font-semibold transition ${selected ? 'border-teal-700 bg-teal-600 text-white' : 'border-slate-900/12 bg-white text-slate-600 hover:border-teal-500'}`}
                                >
                                  {t(`expressPickupDay_${day}`)}
                                </button>
                              )
                            })}
                          </div>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {(['morning', 'afternoon', 'evening'] as const).map((window) => {
                              const selected = pickupWindow === window
                              return (
                                <button
                                  key={window}
                                  type="button"
                                  aria-pressed={selected}
                                  onClick={() => setPickupWindow(selected ? null : window)}
                                  className={`min-h-11 rounded-full border px-3.5 text-xs font-semibold transition ${selected ? 'border-teal-700 bg-teal-600 text-white' : 'border-slate-900/12 bg-white text-slate-600 hover:border-teal-500'}`}
                                >
                                  {t(`expressPickupWindow_${window}`)}
                                </button>
                              )
                            })}
                          </div>
                          <p className="mt-2 text-xs leading-5 text-slate-500">{t('expressPickupSlotNote')}</p>
                        </fieldset>
                      </div>
                    ) : (
                      <fieldset className="grid gap-4">
                        <legend className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-teal-700">{t('expressShipTo')}</legend>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <ExpressField
                            id={`${fieldId}-street`}
                            label={t(country === 'MX' ? 'expressStreetMx' : 'expressStreet')}
                            value={address.street}
                            onChange={(value) => setAddress((a) => ({ ...a, street: value }))}
                            autoComplete="address-line1"
                            placeholder={country === 'MX' ? t('expressStreetPlaceholderMx') : t('expressStreetPlaceholder')}
                            invalid={showValidation && Boolean(issues.street)}
                            error={t('expressStreetError')}
                            className="sm:col-span-2"
                          />
                          <ExpressField id={`${fieldId}-line2`} label={t(country === 'MX' ? 'expressLine2Mx' : 'expressLine2')} value={address.line2} onChange={(value) => setAddress((a) => ({ ...a, line2: value }))} autoComplete="address-line2" optional optionalLabel={t('expressOptional')} placeholder={country === 'MX' ? 'Int. 5' : 'Apt 4B'} />
                          {country === 'MX' ? (
                            <ExpressField id={`${fieldId}-neighborhood`} label={t('expressNeighborhood')} value={address.neighborhood} onChange={(value) => setAddress((a) => ({ ...a, neighborhood: value }))} placeholder="Partido Romero" invalid={showValidation && Boolean(issues.neighborhood)} error={t('expressNeighborhoodError')} />
                          ) : null}
                          <ExpressField id={`${fieldId}-city`} label={t('expressCity')} value={address.city} onChange={(value) => setAddress((a) => ({ ...a, city: value }))} autoComplete="address-level2" invalid={showValidation && Boolean(issues.city)} error={t('expressCityError')} />
                          <ExpressField id={`${fieldId}-state`} label={t(country === 'MX' ? 'expressStateMx' : 'expressState')} value={address.state} onChange={(value) => setAddress((a) => ({ ...a, state: value }))} autoComplete="address-level1" placeholder={country === 'MX' ? 'Chihuahua' : 'TX'} invalid={showValidation && Boolean(issues.state)} error={t('expressStateError')} />
                          <ExpressField id={`${fieldId}-postal`} label={t(country === 'MX' ? 'expressPostalMx' : 'expressPostal')} value={address.postalCode} onChange={(value) => setAddress((a) => ({ ...a, postalCode: value }))} autoComplete="postal-code" inputMode="numeric" placeholder={country === 'MX' ? '32030' : '79925'} invalid={showValidation && Boolean(issues.postalCode)} error={t(issues.postalCode === 'invalid' ? 'expressPostalInvalid' : 'expressPostalError')} />
                          <ExpressField id={`${fieldId}-references`} label={t('expressReferences')} value={address.references} onChange={(value) => setAddress((a) => ({ ...a, references: value }))} optional optionalLabel={t('expressOptional')} placeholder={t('expressReferencesPlaceholder')} className="sm:col-span-2" />
                        </div>
                      </fieldset>
                    )}
                  </div>
                ) : null}

                {step === 1 ? (
                  <div className="grid gap-5">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-700">{t('expressPaymentTitle')}</p>
                      <p className="mt-1.5 text-sm leading-6 text-slate-600">{t('expressPaymentBody')}</p>
                    </div>

                    <div className="grid gap-2.5 sm:grid-cols-2">
                      {availableMethods.map((method) => {
                        const Icon = paymentIcons[method.id]
                        const selected = paymentMethod === method.id
                        const fee = method.surchargeRate ? expressSurchargeCents(subtotalCents, method.id) : 0
                        return (
                          <button
                            key={method.id}
                            type="button"
                            aria-pressed={selected}
                            onClick={() => setPaymentMethod(method.id)}
                            className={`flex min-h-[4.5rem] items-start gap-3 rounded-2xl border p-3.5 text-left transition ${selected ? 'border-teal-700 bg-teal-50/70 shadow-[0_12px_32px_rgba(7,23,36,0.1)] ring-2 ring-teal-600/25' : 'border-slate-900/10 bg-white/70 hover:border-teal-500/60 hover:bg-white'}`}
                          >
                            <span className={`flex size-9 shrink-0 items-center justify-center rounded-xl transition ${selected ? 'bg-teal-50 text-teal-800' : 'bg-slate-100 text-slate-500'}`}>
                              <Icon size={17} aria-hidden="true" />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="flex items-center justify-between gap-2">
                                <span className="text-sm font-semibold text-[#071724]">{t(`expressPay_${method.id}`)}</span>
                                {selected ? <Check size={15} aria-hidden="true" className="shrink-0 text-teal-700" strokeWidth={3} /> : null}
                              </span>
                              <span className="mt-0.5 block text-xs leading-4 text-slate-500">{t(`expressPayNote_${method.id}`)}</span>
                              {fee ? <span className="mt-1.5 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-[0.7rem] font-semibold text-amber-900">{t('expressCodFee', { amount: money(fee) })}</span> : null}
                            </span>
                          </button>
                        )
                      })}
                    </div>

                    {showValidation && issues.paymentMethod ? <p className="text-xs font-medium text-rose-700" role="alert">{t('expressPaymentError')}</p> : null}

                    {paymentMethod === 'cod' ? (
                      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                        <p className="flex items-center gap-2 text-sm font-semibold text-amber-950"><Banknote size={15} aria-hidden="true" />{t('expressCodTitle')}</p>
                        <p className="mt-1.5 text-xs leading-5 text-amber-900">{t('expressCodBody', { amount: money(surchargeCents) })}</p>
                      </div>
                    ) : null}

                    {paymentMethod === 'cash_pickup' ? (
                      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                        <p className="flex items-center gap-2 text-sm font-semibold text-emerald-950"><Coins size={15} aria-hidden="true" />{t('expressCashPickupTitle')}</p>
                        <p className="mt-1.5 text-xs leading-5 text-emerald-900">{t('expressCashPickupBody')}</p>
                      </div>
                    ) : null}

                    {detailsInChat ? (
                      <div className="rounded-2xl border border-slate-900/10 bg-white p-4">
                        <p className="flex items-center gap-2 text-sm font-semibold text-[#071724]"><ShieldCheck size={15} aria-hidden="true" className="text-teal-700" />{t('expressClabeTitle')}</p>
                        <p className="mt-1.5 text-xs leading-5 text-slate-500">{t('expressClabeBody')}</p>
                      </div>
                    ) : null}

                    {paymentDetails ? (
                      <div className="rounded-2xl border border-slate-900/10 bg-white p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{t('expressPaymentDetails')}</p>
                        <ul className="mt-2.5 grid gap-2">
                          {paymentDetails.details.map((detail) => (
                            <li key={detail} className="flex items-center justify-between gap-3 rounded-xl bg-[#f8fafc] px-3 py-2.5">
                              <span className="min-w-0 truncate font-mono text-sm text-[#071724]">{detail}</span>
                              <button type="button" onClick={() => void copy(detail, detail)} className="inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-full border border-slate-900/10 bg-white px-3 text-xs font-semibold text-teal-800 transition hover:bg-teal-50">
                                {copied === detail ? <Check size={13} aria-hidden="true" strokeWidth={3} /> : <Copy size={13} aria-hidden="true" />}
                                {t(copied === detail ? 'expressCopied' : 'expressCopy')}
                              </button>
                            </li>
                          ))}
                        </ul>
                        {payableCents === null ? null : (
                          <p className="mt-3 flex items-center justify-between gap-3 rounded-xl bg-teal-50 px-3 py-2.5 text-sm">
                            <span className="font-semibold text-teal-900">{t('expressAmountDue')}</span>
                            <span className="text-lg font-semibold text-[#071724]">{money(payableCents)}</span>
                          </p>
                        )}
                        {paymentLink ? (
                          <a href={paymentLink.url} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-full border border-teal-700 px-4 text-sm font-semibold text-teal-800 transition hover:bg-teal-50">
                            {locale === 'es' ? paymentLink.labelEs : paymentLink.labelEn}
                            {expressPaymentMethod(paymentMethod)?.amountInLink && payableCents !== null ? ` · ${money(payableCents)}` : ''}
                          </a>
                        ) : null}
                        <div className="mt-3 flex items-center justify-between gap-3 rounded-xl bg-[#f8fafc] px-3 py-2.5">
                          <span className="min-w-0">
                            <span className="block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{t('expressPaymentMemo')}</span>
                            <span className="mt-0.5 block truncate font-mono text-sm text-[#071724]">{reference}</span>
                          </span>
                          <button type="button" onClick={() => void copy(reference, 'reference')} className="inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-full border border-slate-900/10 bg-white px-3 text-xs font-semibold text-teal-800 transition hover:bg-teal-50">
                            {copied === 'reference' ? <Check size={13} aria-hidden="true" strokeWidth={3} /> : <Copy size={13} aria-hidden="true" />}
                            {t(copied === 'reference' ? 'expressCopied' : 'expressCopy')}
                          </button>
                        </div>
                        <p className="mt-2 text-xs leading-5 text-slate-500">{t('expressPaymentReference', { reference })}</p>
                      </div>
                    ) : paymentMethod && !detailsInChat && paymentMethod !== 'cod' && paymentMethod !== 'cash_pickup' ? (
                      <div className="rounded-2xl border border-slate-900/10 bg-white p-4">
                        <p className="text-xs leading-5 text-slate-500">{t('expressPaymentPending')}</p>
                      </div>
                    ) : null}
                  </div>
                ) : null}

                {step === 2 ? (
                  <div className="grid gap-5">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-700">{t('expressReviewTitle')}</p>
                      <p className="mt-1.5 text-sm leading-6 text-slate-600">{t('expressReviewBody')}</p>
                    </div>

                    <div className="overflow-hidden rounded-2xl border border-slate-900/10 bg-white">
                      <div className="flex items-center justify-between gap-3 border-b border-slate-900/10 px-4 py-3">
                        <p className="flex items-center gap-2 text-sm font-semibold text-[#071724]">
                          <MapPin size={15} aria-hidden="true" className="text-teal-700" />
                          {t(fulfillment === 'pickup' ? 'expressPickupBlock' : 'expressLabelBlock')}
                        </p>
                        <button type="button" onClick={() => void copy(labelBlock, 'label')} className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-slate-900/10 px-3 text-xs font-semibold text-teal-800 transition hover:bg-teal-50">
                          {copied === 'label' ? <Check size={13} aria-hidden="true" strokeWidth={3} /> : <Copy size={13} aria-hidden="true" />}
                          {t(copied === 'label' ? 'expressCopied' : 'expressCopy')}
                        </button>
                      </div>
                      <pre className="overflow-x-auto whitespace-pre-wrap break-words px-4 py-3.5 font-mono text-[0.8rem] leading-6 text-[#071724]">{labelBlock}</pre>
                      <div className="flex items-center justify-between gap-3 border-t border-slate-900/10 bg-[#f8fafc] px-4 py-2.5">
                        <span className="text-xs text-slate-500">{t('expressLabelHint')}</span>
                        <button type="button" onClick={() => setStep(0)} className="text-xs font-semibold text-teal-800 hover:text-[#071724]">{t('expressEdit')}</button>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-900/10 bg-white p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="flex items-center gap-2 text-sm font-semibold text-[#071724]"><QrCode size={15} aria-hidden="true" className="text-teal-700" />{t('expressQrTitle')}</p>
                          <p className="mt-1.5 text-xs leading-5 text-slate-500">{t('expressQrBody')}</p>
                        </div>
                        <button type="button" onClick={() => void showQr()} aria-expanded={Boolean(qr)} className="inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-full border border-slate-900/10 px-3 text-xs font-semibold text-teal-800 transition hover:bg-teal-50">
                          {t(qr ? 'expressQrHide' : 'expressQrShow')}
                        </button>
                      </div>
                      {qr ? <img src={qr} alt={t('expressQrAlt')} width={288} height={288} className="mx-auto mt-4 size-72 max-w-full rounded-xl border border-slate-900/10 bg-white p-1.5" /> : null}
                    </div>

                    <label className="grid gap-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-slate-500" htmlFor={`${fieldId}-notes`}>
                      <span>{t('expressNotes')} <span className="ml-1 font-medium normal-case tracking-normal text-slate-400">{t('expressOptional')}</span></span>
                      <textarea
                        id={`${fieldId}-notes`}
                        rows={2}
                        className="w-full resize-none rounded-xl border border-slate-900/12 bg-white px-3.5 py-2.5 text-sm text-[#071724] outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
                        placeholder={t('expressNotesPlaceholder')}
                        value={notes}
                        onChange={(event) => setNotes(event.target.value)}
                      />
                    </label>

                    <label className="flex items-start gap-3 rounded-2xl border border-slate-900/10 bg-white p-4 text-xs leading-5 text-slate-600">
                      <input
                        type="checkbox"
                        checked={accepted}
                        aria-invalid={showValidation && !accepted}
                        onChange={(event) => setAccepted(event.target.checked)}
                        className="mt-0.5 size-4 shrink-0 accent-teal-700"
                      />
                      <span>{expressAcknowledgment[locale]}</span>
                    </label>
                    {showValidation && !accepted ? <p className="-mt-3 text-xs font-medium text-rose-700" role="alert">{t('expressAcknowledgmentError')}</p> : null}

                    {sent ? (
                      <div className="rounded-2xl border border-[#25d366]/40 bg-[#f6fdf8] p-4">
                        <p className="flex items-center gap-2 text-sm font-semibold text-[#071724]"><Check size={15} aria-hidden="true" className="text-[#128c7e]" strokeWidth={3} />{t('expressSentTitle')}</p>
                        <p className="mt-1.5 text-xs leading-5 text-slate-600">{t('expressSentBody')}</p>
                        <button type="button" onClick={() => void copy(message, 'message')} className="mt-3 inline-flex min-h-10 items-center gap-1.5 rounded-full border border-slate-900/10 bg-white px-3.5 text-xs font-semibold text-teal-800 transition hover:bg-teal-50">
                          {copied === 'message' ? <Check size={13} aria-hidden="true" strokeWidth={3} /> : <Copy size={13} aria-hidden="true" />}
                          {t(copied === 'message' ? 'expressCopied' : 'expressCopyMessage')}
                        </button>
                        {prepaidRail ? (
                          <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-teal-200 bg-white p-3">
                            <Camera size={15} aria-hidden="true" className="mt-0.5 shrink-0 text-teal-700" />
                            <p className="text-xs leading-5 text-slate-600">{t('expressReceiptPrompt', { reference })}</p>
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>

              {/* Summary rail — always visible so the shopper never loses the price while filling a label. */}
              <aside className="hidden min-h-0 flex-col overflow-y-auto border-l border-slate-900/10 bg-white px-5 py-6 lg:flex">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-700">{t('orderSummary')}</p>
                <ul className="mt-4 grid gap-3">
                  {items.map((item) => (
                    <li key={item.id} className="flex items-start gap-3">
                      <span className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#eef3f0]">
                        <ProductImage product={{ slug: item.productSlug, image: item.image, heroImage: item.image }} alt="" width={44} height={44} sizes="44px" className="h-full w-full object-contain p-1" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-[#071724]">{item.productName}</span>
                        <span className="block text-xs text-slate-500">{item.quantity}× {item.variantLabel} · {purchaseTypeLabel(tCommon, item.purchaseType)}</span>
                      </span>
                      <span className="shrink-0 text-sm font-semibold text-[#071724]">{formatCartCurrency(item.linePrice * item.quantity, locale)}</span>
                    </li>
                  ))}
                </ul>

                <dl className="mt-5 grid gap-2 border-t border-slate-900/10 pt-4 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-slate-500">{t('subtotal')}</dt>
                    <dd className="font-semibold text-[#071724]">{money(subtotalCents)}</dd>
                  </div>
                  {discountCents ? (
                    <div className="flex items-center justify-between gap-3">
                      <dt className="text-emerald-700">{t('expressSummaryPromotion', { percent: Math.round(discountRate * 100) })}</dt>
                      <dd className="font-semibold text-emerald-700">-{money(discountCents)}</dd>
                    </div>
                  ) : null}
                  {qualifiesForFreeShipping(subtotalCents) ? (
                    <div className="flex items-center justify-between gap-3">
                      <dt className="text-emerald-700">{t('expressSummaryExpress')}</dt>
                      <dd className="font-semibold text-emerald-700">{money(0)}</dd>
                    </div>
                  ) : null}
                  {surchargeCents ? (
                    <div className="flex items-center justify-between gap-3">
                      <dt className="text-amber-800">{t('expressSummarySurcharge')}</dt>
                      <dd className="font-semibold text-amber-800">{money(surchargeCents)}</dd>
                    </div>
                  ) : null}
                  {payableCents === null ? null : (
                    <div className="mt-2 flex items-center justify-between gap-3 border-t border-slate-900/10 pt-3">
                      <dt className="font-semibold text-[#071724]">{t('expressSummaryTotal')}</dt>
                      <dd className="text-xl font-semibold text-[#071724]">{money(payableCents)}</dd>
                    </div>
                  )}
                </dl>

                <p className="mt-4 rounded-xl bg-[#f8fafc] p-3 text-xs leading-5 text-slate-500">{t(payableCents === null ? 'expressSummaryNote' : 'expressSummaryTotalNote')}</p>
                <a href={path('/checkout')} className="mt-auto pt-5 text-xs font-semibold text-teal-800 transition hover:text-[#071724]">{t('expressFullCheckout')}</a>
              </aside>
            </div>

            <footer className="shrink-0 border-t border-slate-900/10 bg-white px-5 py-4 sm:px-8">
              <div className="flex items-center gap-3">
                {step > 0 ? (
                  <button type="button" onClick={() => setStep((current) => ((current - 1) as Step))} className="inline-flex min-h-12 items-center gap-1.5 rounded-full border border-slate-900/12 px-4 text-sm font-semibold text-[#071724] transition hover:bg-slate-50">
                    <ArrowLeft size={15} aria-hidden="true" />
                    {t('expressBack')}
                  </button>
                ) : null}
                <div className="flex-1 text-right lg:hidden">
                  <p className="text-xs text-slate-500">{t('subtotal')}</p>
                  <p className="text-lg font-semibold text-[#071724]">{money(subtotalCents)}</p>
                </div>
                {step < 2 ? (
                  <button type="button" onClick={advance} className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full bg-[#071724] px-5 text-sm font-semibold text-white transition hover:bg-teal-700 lg:flex-none lg:min-w-[14rem]">
                    {t('expressContinue')}
                    <ArrowRight size={15} aria-hidden="true" />
                  </button>
                ) : (
                  <button type="button" onClick={send} className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full bg-[#25d366] px-5 text-sm font-semibold text-[#071724] transition hover:bg-[#1eb855] lg:flex-none lg:min-w-[14rem]">
                    <MessageCircle size={16} aria-hidden="true" />
                    {t('expressSubmit')}
                  </button>
                )}
              </div>
              <p className="mt-2.5 text-center text-xs leading-5 text-slate-500 sm:text-right">{t('expressFootnote')}</p>
            </footer>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  )
}
