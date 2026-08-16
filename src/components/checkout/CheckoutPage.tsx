import {
  AlertTriangle,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Globe2,
  LoaderCircle,
  MapPin,
  MessageCircle,
  Minus,
  PackageCheck,
  Plus,
  RefreshCw,
  ShieldCheck,
  ShoppingCart,
  Trash2,
  Truck,
  type LucideIcon,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import logo from '../../assets/images/logo/encore-logo.png'
import { getEnabledPaymentMethods, type InterimPaymentMethodId } from '../../config/interimCheckout'
import { useCart } from '../../context/useCart'
import { useLocale, useTranslation } from '../../i18n/LocaleContext'
import { purchaseTypeLabel } from '../../i18n/displayLabels'
import { calculateItemCount, calculateSubtotal, formatCartCurrency, type CartItem } from '../../lib/cart'
import { isCheckoutFormValid, isValidEmail } from '../../lib/checkout'
import { promotionDiscountRate, qualifiesForExpressUpgrade, qualifiesForFreeShipping, selectExpressRate } from '../../lib/promotions'
import { resolveDistributorPromotion } from '../../lib/distributorIncentive'
import {
  addressEssentialErrors,
  calculatePaymentProcessingFeeCents,
  calculateShippingCharges,
  destinationUsesMexicoImportFee,
  expectedCountryForDestination,
  isPoBoxAddress,
  localDistributionPostalCode,
  shippingSelectionAllowsPayment,
  shippingVerificationCanBeReviewed,
  splitUsStreetAddress,
  verifyShippingAddress,
  type AddressChoice,
  type AddressVerificationResult,
  type DeliveryDestination,
  type LocalFulfillmentMethod,
  type ShippingAddress,
  type ShippingSelection,
} from '../../lib/shipping'
import { cn } from '../../lib/utils'
import { EncoreCompleteKit } from '../EncoreCompleteKit'
import { LanguageSelector } from '../LanguageSelector'
import { InterimCheckoutHandoff } from '../cart/InterimCheckoutHandoff'
import { DistributorCodeField } from '../cart/DistributorCodeField'
import { useReferralAttribution } from '../../lib/useReferralAttribution'
import { createPendingOrder, type OrderContact, type PendingOrder } from '../../lib/storefront/interimCheckout'
import { trackDistributorEvent } from '../../lib/distributorAnalytics'
import { CheckoutAcknowledgment } from '../acknowledgment/CheckoutAcknowledgment'
import {
  createCheckoutAcknowledgmentAudit,
  createEmptyCheckoutAcknowledgmentState,
  isCheckoutAcknowledgmentComplete,
} from '../../data/acknowledgmentContent'

type ReviewFormData = {
  email: string
  phone: string
  fullName: string
  address: string
  streetNumber: string
  neighborhood: string
  address2: string
  city: string
  state: string
  zip: string
  country: string
  destination: DeliveryDestination
  localFulfillment: LocalFulfillmentMethod | null
  preferredContact: 'email' | 'phone' | 'whatsapp'
  notes: string
  destinationAcknowledged: boolean
}

type CheckoutSummary = {
  items: CartItem[]
  subtotal: number
  shipping: ShippingSelection
  contact: OrderContact
  order: PendingOrder
}

const defaultFormData: ReviewFormData = {
  email: '',
  phone: '',
  fullName: '',
  address: '',
  streetNumber: '',
  neighborhood: '',
  address2: '',
  city: '',
  state: '',
  zip: '',
  country: 'US',
  destination: 'us',
  localFulfillment: null,
  preferredContact: 'whatsapp',
  notes: '',
  destinationAcknowledged: false,
}

const destinationOptions: Array<{ id: DeliveryDestination; icon: LucideIcon; titleKey: string; bodyKey: string }> = [
  { id: 'us', icon: MapPin, titleKey: 'destinationUs', bodyKey: 'destinationUsBody' },
  { id: 'mexico', icon: MapPin, titleKey: 'destinationMexico', bodyKey: 'destinationMexicoBody' },
  { id: 'local_el_paso', icon: Truck, titleKey: 'destinationElPaso', bodyKey: 'destinationLocalBody' },
  { id: 'local_juarez', icon: Truck, titleKey: 'destinationJuarez', bodyKey: 'destinationLocalMexicoBody' },
  { id: 'local_chihuahua', icon: Truck, titleKey: 'destinationChihuahua', bodyKey: 'destinationLocalMexicoBody' },
  { id: 'international', icon: Globe2, titleKey: 'destinationInternational', bodyKey: 'destinationInternationalBody' },
]

const paymentMethodLabelKeys: Record<InterimPaymentMethodId, string> = {
  bank_transfer: 'paymentBankTransfer',
  paypal: 'paymentPaypal',
  venmo: 'paymentVenmo',
  cashapp: 'paymentCashApp',
  zelle: 'paymentZelle',
  apple_pay: 'paymentApplePay',
  cash_on_delivery: 'paymentCashOnDelivery',
  manual_review: 'paymentManualReview',
}

const checkoutPaymentMethods = getEnabledPaymentMethods()
const cashOnDeliveryMethod = checkoutPaymentMethods.find((method) => method.id === 'cash_on_delivery')
const alternatePaymentMethods = checkoutPaymentMethods.filter((method) => method.id !== 'cash_on_delivery')

function localDestinationDefaults(destination: DeliveryDestination) {
  if (destination === 'local_el_paso') return { state: 'TX', city: 'El Paso' }
  if (destination === 'local_juarez') return { state: 'Chihuahua', city: 'Ciudad Juárez' }
  if (destination === 'local_chihuahua') return { state: 'Chihuahua', city: 'Chihuahua' }
  return null
}

const COUNTRY_CODES = 'AD AE AF AG AI AL AM AO AR AT AU AW AZ BA BB BD BE BF BG BH BI BJ BN BO BR BS BT BW BY BZ CA CD CF CG CH CI CL CM CN CO CR CU CV CY CZ DE DJ DK DM DO DZ EC EE EG ER ES ET FI FJ FM FR GA GB GD GE GH GM GN GQ GR GT GW GY HK HN HR HT HU ID IE IL IN IQ IR IS IT JM JO JP KE KG KH KI KM KN KP KR KW KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MG MH MK ML MM MN MR MT MU MV MW MX MY MZ NA NE NG NI NL NO NP NR NZ OM PA PE PG PH PK PL PS PT PW PY QA RO RS RU RW SA SB SC SD SE SG SI SK SL SM SN SO SR SS ST SV SY SZ TD TG TH TJ TL TM TN TO TR TT TV TW TZ UA UG US UY UZ VA VC VE VN VU WS YE ZA ZM ZW'.split(' ')

const US_STATES = [
  ['AL', 'Alabama'], ['AK', 'Alaska'], ['AZ', 'Arizona'], ['AR', 'Arkansas'], ['CA', 'California'], ['CO', 'Colorado'], ['CT', 'Connecticut'], ['DE', 'Delaware'], ['FL', 'Florida'], ['GA', 'Georgia'], ['HI', 'Hawaii'], ['ID', 'Idaho'], ['IL', 'Illinois'], ['IN', 'Indiana'], ['IA', 'Iowa'], ['KS', 'Kansas'], ['KY', 'Kentucky'], ['LA', 'Louisiana'], ['ME', 'Maine'], ['MD', 'Maryland'], ['MA', 'Massachusetts'], ['MI', 'Michigan'], ['MN', 'Minnesota'], ['MS', 'Mississippi'], ['MO', 'Missouri'], ['MT', 'Montana'], ['NE', 'Nebraska'], ['NV', 'Nevada'], ['NH', 'New Hampshire'], ['NJ', 'New Jersey'], ['NM', 'New Mexico'], ['NY', 'New York'], ['NC', 'North Carolina'], ['ND', 'North Dakota'], ['OH', 'Ohio'], ['OK', 'Oklahoma'], ['OR', 'Oregon'], ['PA', 'Pennsylvania'], ['RI', 'Rhode Island'], ['SC', 'South Carolina'], ['SD', 'South Dakota'], ['TN', 'Tennessee'], ['TX', 'Texas'], ['UT', 'Utah'], ['VT', 'Vermont'], ['VA', 'Virginia'], ['WA', 'Washington'], ['WV', 'West Virginia'], ['WI', 'Wisconsin'], ['WY', 'Wyoming'], ['DC', 'District of Columbia'], ['PR', 'Puerto Rico'], ['GU', 'Guam'], ['VI', 'U.S. Virgin Islands'], ['AS', 'American Samoa'], ['MP', 'Northern Mariana Islands'],
] as const

const MEXICO_STATES = [
  'Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche', 'Chiapas', 'Chihuahua', 'Ciudad de México', 'Coahuila', 'Colima', 'Durango', 'Estado de México', 'Guanajuato', 'Guerrero', 'Hidalgo', 'Jalisco', 'Michoacán', 'Morelos', 'Nayarit', 'Nuevo León', 'Oaxaca', 'Puebla', 'Querétaro', 'Quintana Roo', 'San Luis Potosí', 'Sinaloa', 'Sonora', 'Tabasco', 'Tamaulipas', 'Tlaxcala', 'Veracruz', 'Yucatán', 'Zacatecas',
] as const

export const CHECKOUT_SESSION_KEY = 'encore-checkout-information-v1'

export function readStoredForm(): ReviewFormData {
  if (typeof window === 'undefined') return defaultFormData
  try {
    const stored = JSON.parse(window.sessionStorage.getItem(CHECKOUT_SESSION_KEY) || '{}') as Partial<ReviewFormData>
    const destination = destinationOptions.some((option) => option.id === stored.destination) ? stored.destination as DeliveryDestination : stored.country === 'MX' ? 'mexico' : 'us'
    const country = expectedCountryForDestination(destination) || (typeof stored.country === 'string' ? stored.country : '')
    const localDefaults = localDestinationDefaults(destination)
    const storedStreet = typeof stored.address === 'string' ? stored.address : ''
    const storedStreetNumber = typeof stored.streetNumber === 'string' ? stored.streetNumber : ''
    return {
      ...defaultFormData,
      email: typeof stored.email === 'string' ? stored.email : '',
      phone: typeof stored.phone === 'string' ? stored.phone : '',
      fullName: typeof stored.fullName === 'string' ? stored.fullName : '',
      address: country === 'US' && storedStreetNumber ? `${storedStreetNumber} ${storedStreet}`.trim() : storedStreet,
      streetNumber: country === 'US' ? '' : storedStreetNumber,
      neighborhood: typeof stored.neighborhood === 'string' ? stored.neighborhood : '',
      address2: typeof stored.address2 === 'string' ? stored.address2 : '',
      city: localDefaults?.city || (typeof stored.city === 'string' ? stored.city : ''),
      state: localDefaults?.state || (typeof stored.state === 'string' ? stored.state : ''),
      zip: typeof stored.zip === 'string' ? stored.zip : '',
      country,
      destination,
      localFulfillment: destination.startsWith('local_') && (stored.localFulfillment === 'pickup' || stored.localFulfillment === 'home_delivery') ? stored.localFulfillment : null,
      preferredContact: ['email', 'phone', 'whatsapp'].includes(stored.preferredContact || '') ? stored.preferredContact as ReviewFormData['preferredContact'] : 'whatsapp',
      notes: typeof stored.notes === 'string' ? stored.notes : '',
    }
  } catch {
    return defaultFormData
  }
}

function useCheckoutStages() {
  const { t } = useTranslation('checkout')
  return [
    { key: 'cart', label: t('stageCart') },
    { key: 'review', label: t('stageInformation') },
    { key: 'next', label: t('stageNextStep') },
  ] as const
}

function CheckoutProgress({ stage }: { stage: 'review' | 'next' }) {
  const checkoutStages = useCheckoutStages()
  return (
    <ol className="mx-auto mb-8 flex max-w-[76rem] flex-wrap items-center gap-2 px-5 sm:px-8">
      {checkoutStages.map((item, index) => {
        const isDone = item.key === 'cart' || (stage === 'next' && item.key === 'review')
        const isCurrent = item.key === stage
        return (
          <li key={item.key} className="flex items-center gap-2">
            <span className={cn('flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold', isDone ? 'bg-teal-700 text-white' : isCurrent ? 'border border-teal-700 text-teal-700' : 'border border-slate-300 text-slate-400')}>
              {isDone ? <Check size={11} aria-hidden="true" /> : index + 1}
            </span>
            <span className={cn('text-xs font-semibold uppercase tracking-[0.1em]', isCurrent ? 'text-[#071724]' : 'text-slate-400')}>{item.label}</span>
            {index < checkoutStages.length - 1 ? <span className="mx-1 h-px w-6 bg-slate-200" aria-hidden="true" /> : null}
          </li>
        )
      })}
    </ol>
  )
}

function inputClass() {
  return 'h-12 w-full rounded-2xl border border-slate-900/10 bg-white px-4 text-sm text-[#071724] outline-none transition placeholder:text-slate-400 focus:border-teal-600/70 focus:ring-4 focus:ring-teal-100 disabled:bg-slate-100 disabled:text-slate-500'
}

function CheckoutHeader() {
  const { path } = useLocale()
  const { t } = useTranslation('checkout')
  return (
    <header className="border-b border-slate-900/10 bg-white/80 backdrop-blur-2xl">
      <div className="mx-auto flex max-w-[76rem] items-center justify-between gap-3 px-5 py-4 sm:px-8">
        <a href={path('/')} className="flex items-center gap-3" aria-label="Encore Bio Labs home"><img src={logo} alt="Encore Bio Labs" width="900" height="264" className="h-8 w-auto" /></a>
        <div className="flex items-center gap-2 sm:gap-3">
          <a href={path('/legal/shipping-returns')} className="hidden text-xs font-semibold text-teal-800 hover:underline sm:inline">{t('shippingDeliveryLink')}</a>
          <LanguageSelector variant="nav" />
          <a href={path('/cart')} className="rounded-full border border-slate-900/10 bg-[#f5f5f2] px-4 py-2 text-xs font-semibold text-slate-600 transition hover:bg-white">{t('returnToCart')}</a>
        </div>
      </div>
    </header>
  )
}

function formatAddress(address: ShippingAddress) {
  const streetLine = address.country === 'US'
    ? [address.streetNumber, address.street].filter(Boolean).join(' ')
    : [address.street, address.streetNumber].filter(Boolean).join(' ')
  return [streetLine, address.line2, address.neighborhood, address.city, address.state, address.postalCode, address.country].filter(Boolean).join(', ')
}

function verificationMessage(message: string, locale: 'en' | 'es') {
  const copy: Record<string, { en: string; es: string }> = {
    country: { en: 'Choose a country.', es: 'Elige un país.' },
    country_mismatch: { en: 'The country does not match the selected destination.', es: 'El país no coincide con el destino seleccionado.' },
    state: { en: 'Enter a state or region.', es: 'Ingresa un estado o región.' },
    city: { en: 'Enter a city.', es: 'Ingresa una ciudad.' },
    neighborhood: { en: 'Enter the neighborhood or colonia.', es: 'Ingresa la colonia.' },
    street: { en: 'Enter the street name.', es: 'Ingresa la calle.' },
    street_number: { en: 'Enter the street number.', es: 'Ingresa el número exterior.' },
    postal_code: { en: 'Enter a postal code.', es: 'Ingresa el código postal.' },
    postal_code_invalid: { en: 'The postal-code format is invalid.', es: 'El formato del código postal no es válido.' },
    po_box_local: { en: 'Local delivery is not available to a P.O. box.', es: 'La entrega local no está disponible para un apartado postal.' },
    provider_not_configured: { en: 'The carrier validation service is not configured yet.', es: 'El servicio de validación del transportista aún no está configurado.' },
    provider_unavailable: { en: 'The carrier validation service is temporarily unavailable.', es: 'El servicio de validación del transportista no está disponible temporalmente.' },
    provider_timeout: { en: 'The carrier took too long to respond.', es: 'El transportista tardó demasiado en responder.' },
    live_rates_unavailable: { en: 'No current transport rates are available for this address.', es: 'No hay tarifas vigentes de transporte para esta dirección.' },
    international_quote_required: { en: 'International shipping requires a reviewed quote.', es: 'El envío internacional requiere una cotización revisada.' },
    international_verification_inconclusive: { en: 'International verification was inconclusive.', es: 'La verificación internacional no fue concluyente.' },
    local_city_mismatch: { en: 'The address is outside the selected local-delivery city.', es: 'La dirección está fuera de la ciudad de entrega local seleccionada.' },
    local_fulfillment_required: { en: 'Choose distribution-point pickup or home delivery.', es: 'Elige recolección en punto de distribución o entrega a domicilio.' },
    pickup_details_not_configured: { en: 'The pickup point or schedule still requires confirmation.', es: 'El punto de recolección o el horario aún requiere confirmación.' },
    local_radius_unavailable: { en: 'The 10-mile radius could not be confirmed automatically.', es: 'No se pudo confirmar automáticamente el radio de 10 millas.' },
    local_outside_ten_miles: { en: 'The address is more than 10 miles from the distribution point.', es: 'La dirección está a más de 10 millas del punto de distribución.' },
    local_delivery_time_not_configured: { en: 'The local-delivery schedule still requires confirmation.', es: 'El horario de entrega local aún requiere confirmación.' },
    address_not_deliverable: { en: 'The carrier could not confirm this address as deliverable.', es: 'El transportista no pudo confirmar que esta dirección sea entregable.' },
    address_not_verified: { en: 'The address could not be verified.', es: 'No se pudo verificar la dirección.' },
  }
  return copy[message]?.[locale] || (locale === 'es' ? 'El proveedor reportó un problema con la dirección.' : 'The provider reported an address issue.')
}

function VerificationPanel({
  result,
  validating,
  addressChoice,
  selectedRateId,
  manualReviewRequested,
  freeShipping,
  onAddressChoice,
  onRate,
  onEdit,
  onManualReview,
  onRetry,
}: {
  result: AddressVerificationResult | null
  validating: boolean
  addressChoice: AddressChoice | null
  selectedRateId: string | null
  manualReviewRequested: boolean
  freeShipping: boolean
  onAddressChoice: (choice: AddressChoice) => void
  onRate: (rateId: string) => void
  onEdit: () => void
  onManualReview: () => void
  onRetry: () => void
}) {
  const { locale } = useLocale()
  const { t } = useTranslation('checkout')
  if (validating) return <div role="status" className="mt-5 flex items-center gap-3 rounded-2xl border border-teal-200 bg-teal-50 p-4 text-sm text-teal-950"><LoaderCircle size={18} className="animate-spin" aria-hidden="true" />{t('validatingAddress')}</div>
  if (!result) return <button type="button" onClick={onRetry} className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-teal-700/25 bg-teal-50 px-5 text-sm font-semibold text-teal-900"><RefreshCw size={15} aria-hidden="true" />{t('verifyAddress')}</button>

  const issue = ['incomplete', 'invalid', 'undeliverable', 'out_of_coverage', 'provider_unavailable', 'manual_review'].includes(result.status)
  return (
    <div className={cn('mt-5 rounded-2xl border p-4', issue ? 'border-amber-200 bg-amber-50' : 'border-emerald-200 bg-emerald-50')} aria-live="polite">
      <div className="flex items-start gap-3">
        {issue ? <AlertTriangle size={19} className="mt-0.5 shrink-0 text-amber-700" aria-hidden="true" /> : <CheckCircle2 size={19} className="mt-0.5 shrink-0 text-emerald-700" aria-hidden="true" />}
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-[#071724]">{t(result.status === 'corrected' ? 'addressCorrected' : result.status === 'verified' ? 'addressVerified' : result.status === 'out_of_coverage' ? 'outsideCoverage' : result.status === 'undeliverable' ? 'addressUndeliverable' : result.status === 'incomplete' ? 'addressIncomplete' : 'manualReviewNeeded')}</p>
          {result.messages.length ? <ul className="mt-2 grid gap-1 text-sm leading-6 text-slate-700">{result.messages.map((message) => <li key={message}>• {verificationMessage(message, locale)}</li>)}</ul> : null}
        </div>
      </div>

      {result.status === 'corrected' && result.recommendedAddress ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <button type="button" onClick={() => onAddressChoice('recommended')} className={cn('rounded-2xl border p-4 text-left', addressChoice === 'recommended' ? 'border-teal-700 bg-white ring-2 ring-teal-100' : 'border-slate-200 bg-white/70')}>
            <span className="text-xs font-bold uppercase tracking-[0.12em] text-teal-800">{t('recommendedAddress')}</span>
            <span className="mt-2 block text-sm leading-6 text-slate-700">{formatAddress(result.recommendedAddress)}</span>
            <span className="mt-3 block text-sm font-semibold text-[#071724]">{t('useRecommendedAddress')}</span>
          </button>
          <button type="button" onClick={() => onAddressChoice('original')} className={cn('rounded-2xl border p-4 text-left', addressChoice === 'original' ? 'border-teal-700 bg-white ring-2 ring-teal-100' : 'border-slate-200 bg-white/70')}>
            <span className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">{t('originalAddress')}</span>
            <span className="mt-2 block text-sm leading-6 text-slate-700">{formatAddress(result.originalAddress)}</span>
            <span className="mt-3 block text-sm font-semibold text-[#071724]">{t('keepOriginalAddress')}</span>
          </button>
          <button type="button" onClick={onEdit} className="sm:col-span-2 min-h-11 text-sm font-semibold text-teal-800 hover:underline">{t('editAddress')}</button>
        </div>
      ) : null}

      {result.rates.length ? (
        <fieldset className="mt-4">
          <legend className="text-sm font-semibold text-[#071724]">{t('availableShippingServices')}</legend>
          <div className="mt-2 grid gap-2">
            {result.rates.map((rate) => (
              <label key={rate.id} className={cn('flex cursor-pointer items-start justify-between gap-3 rounded-xl border bg-white p-3', selectedRateId === rate.id ? 'border-teal-700 ring-2 ring-teal-100' : 'border-slate-200')}>
                <span className="flex items-start gap-3"><input type="radio" name="shipping-rate" className="mt-1 accent-teal-700" checked={selectedRateId === rate.id} onChange={() => onRate(rate.id)} /><span><span className="block text-sm font-semibold text-[#071724]">{rate.carrier} · {rate.service}</span><span className="mt-1 block text-xs text-slate-500">{rate.deliveryDays !== null ? t('transportDays', { count: rate.deliveryDays }) : t('transportTimeNotProvided')}</span></span></span>
                <span className="shrink-0 text-sm font-semibold text-[#071724]">
                  {freeShipping && rate.amountCents > 0 ? (
                    <>
                      <span className="mr-1.5 font-medium text-slate-400 line-through">{formatCartCurrency(rate.amountCents / 100)}</span>
                      <span className="text-emerald-700">{formatCartCurrency(0)}</span>
                    </>
                  ) : formatCartCurrency(rate.amountCents / 100)}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      ) : null}

      {result.localDeliveryFeeCents !== null || result.localDeliveryTime ? <p className="mt-4 text-sm leading-6 text-slate-700">{t('localDeliveryConfirmed', { cost: result.localDeliveryFeeCents === null ? t('pendingConfirmation') : formatCartCurrency(result.localDeliveryFeeCents / 100), time: result.localDeliveryTime || t('pendingConfirmation') })}</p> : null}
      {result.coverageCenterPostalCode ? <p className="mt-3 text-sm leading-6 text-slate-700">{t('localCoverageCenter', { postalCode: result.coverageCenterPostalCode })}</p> : null}
      {result.pickupPointName || result.pickupPointAddress ? <div className="mt-4 rounded-xl border border-teal-200 bg-white p-3 text-sm leading-6 text-slate-700"><p className="font-semibold text-[#071724]">{result.pickupPointName || t('distributionPoint')}</p>{result.pickupPointAddress ? <p>{result.pickupPointAddress}</p> : null}</div> : null}
      {result.distanceMiles !== null ? <p className="mt-3 text-sm leading-6 text-slate-700">{t('verifiedLocalDistance', { distance: result.distanceMiles.toFixed(1) })}</p> : null}
      {issue || result.manualReviewRequired ? (
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={onEdit} className="inline-flex min-h-10 items-center rounded-full border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700">{t('editAddress')}</button>
          <button type="button" onClick={onRetry} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700"><RefreshCw size={14} aria-hidden="true" />{t('retryValidation')}</button>
          <button type="button" onClick={onManualReview} className={cn('inline-flex min-h-10 items-center rounded-full px-4 text-sm font-semibold', manualReviewRequested ? 'bg-teal-700 text-white' : 'bg-[#071724] text-white')}>{manualReviewRequested ? t('manualReviewSelected') : t('requestManualReview')}</button>
        </div>
      ) : null}
    </div>
  )
}

export function CheckoutPage() {
  const { items, itemCount, updateQuantity, removeFromCart } = useCart()
  const { path, locale } = useLocale()
  const { t } = useTranslation('checkout')
  const { t: tCommon } = useTranslation('common')
  const [formData, setFormData] = useState<ReviewFormData>(() => readStoredForm())
  const [verification, setVerification] = useState<AddressVerificationResult | null>(null)
  const [validating, setValidating] = useState(false)
  const [addressChoice, setAddressChoice] = useState<AddressChoice | null>(null)
  const [selectedRateId, setSelectedRateId] = useState<string | null>(null)
  const [manualReviewRequested, setManualReviewRequested] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<InterimPaymentMethodId>('cash_on_delivery')
  const [outcome, setOutcome] = useState<'support' | null>(null)
  const [completedSummary, setCompletedSummary] = useState<CheckoutSummary | null>(null)
  const [showValidation, setShowValidation] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(false)
  const [checkoutAcknowledgments, setCheckoutAcknowledgments] = useState(createEmptyCheckoutAcknowledgmentState)
  const referralAttribution = useReferralAttribution()
  const checkoutFormRef = useRef<HTMLDivElement>(null)
  const validationSequence = useRef(0)
  const subtotal = useMemo(() => calculateSubtotal(items), [items])
  useEffect(() => {
    if (referralAttribution) void trackDistributorEvent('checkout_started', referralAttribution, { metadata: { itemCount } })
  }, [itemCount, referralAttribution])
  const kitCount = useMemo(() => calculateItemCount(items), [items])
  const cartAcknowledgmentKey = useMemo(
    () => items.map((item) => `${item.id}:${item.quantity}:${item.linePrice}`).sort().join('|'),
    [items],
  )
  const usStreetAddress = useMemo(() => splitUsStreetAddress(formData.address), [formData.address])
  const address = useMemo<ShippingAddress>(() => ({
    country: formData.country,
    state: formData.state,
    city: formData.city,
    neighborhood: formData.country === 'MX' ? formData.neighborhood : '',
    postalCode: formData.zip,
    street: formData.country === 'US' ? usStreetAddress.street : formData.address,
    streetNumber: formData.country === 'US' ? usStreetAddress.streetNumber : formData.streetNumber,
    line2: formData.address2,
  }), [formData.address, formData.address2, formData.city, formData.country, formData.neighborhood, formData.state, formData.streetNumber, formData.zip, usStreetAddress.street, usStreetAddress.streetNumber])
  const pickupSelected = formData.destination.startsWith('local_') && formData.localFulfillment === 'pickup'
  const verificationAddress = useMemo<ShippingAddress>(() => pickupSelected ? {
    ...address,
    neighborhood: '',
    postalCode: '',
    street: '',
    streetNumber: '',
    line2: '',
  } : address, [address, pickupSelected])
  const countryNames = useMemo(() => {
    const display = new Intl.DisplayNames([locale], { type: 'region' })
    return COUNTRY_CODES.map((code) => ({ code, name: display.of(code) || code })).sort((a, b) => a.name.localeCompare(b.name, locale))
  }, [locale])

  useEffect(() => {
    window.sessionStorage.setItem(CHECKOUT_SESSION_KEY, JSON.stringify({
      email: formData.email,
      phone: formData.phone,
      fullName: formData.fullName,
      address: formData.address,
      streetNumber: formData.streetNumber,
      neighborhood: formData.neighborhood,
      address2: formData.address2,
      city: formData.city,
      state: formData.state,
      zip: formData.zip,
      country: formData.country,
      destination: formData.destination,
      localFulfillment: formData.localFulfillment,
      preferredContact: formData.preferredContact,
      notes: formData.notes,
    }))
  }, [formData])

  useEffect(() => {
    setCheckoutAcknowledgments(createEmptyCheckoutAcknowledgmentState())
  }, [cartAcknowledgmentKey])

  const runVerification = useCallback(async () => {
    const sequence = ++validationSequence.current
    setValidating(true)
    const result = await verifyShippingAddress({ destination: formData.destination, address: verificationAddress, kitCount, localFulfillment: formData.localFulfillment })
    if (sequence !== validationSequence.current) return
    setVerification(result)
    setAddressChoice(null)
    setSelectedRateId(null)
    setManualReviewRequested(shippingVerificationCanBeReviewed(result))
    setValidating(false)
  }, [formData.destination, formData.localFulfillment, kitCount, verificationAddress])

  useEffect(() => {
    validationSequence.current += 1
    setVerification(null)
    setAddressChoice(null)
    setSelectedRateId(null)
    setManualReviewRequested(false)
    setValidating(false)
    const local = formData.destination.startsWith('local_')
    const addressRequired = !local || formData.localFulfillment === 'home_delivery'
    if ((local && !formData.localFulfillment) || (addressRequired && addressEssentialErrors(address, formData.destination).length) || !items.length) return
    const timer = window.setTimeout(() => void runVerification(), 750)
    return () => window.clearTimeout(timer)
  }, [address, formData.destination, formData.localFulfillment, items.length, runVerification])

  function updateField<K extends keyof ReviewFormData>(key: K, value: ReviewFormData[K]) {
    setFormData((current) => ({ ...current, [key]: value }))
  }

  function chooseDestination(destination: DeliveryDestination) {
    const country = expectedCountryForDestination(destination)
    const localDefaults = localDestinationDefaults(destination)
    setFormData((current) => {
      const nextCountry = country || (['US', 'MX'].includes(current.country) ? '' : current.country)
      const countryChanged = current.country !== nextCountry
      return {
        ...current,
        destination,
        localFulfillment: destination.startsWith('local_') && current.destination === destination ? current.localFulfillment : null,
        country: nextCountry,
        address: countryChanged ? '' : current.address,
        streetNumber: countryChanged ? '' : current.streetNumber,
        neighborhood: countryChanged ? '' : current.neighborhood,
        address2: countryChanged ? '' : current.address2,
        zip: countryChanged ? '' : current.zip,
        state: localDefaults?.state || (countryChanged ? '' : current.state),
        city: localDefaults?.city || (countryChanged ? '' : current.city),
        destinationAcknowledged: false,
      }
    })
  }

  function chooseLocalFulfillment(localFulfillment: LocalFulfillmentMethod) {
    setFormData((current) => ({ ...current, localFulfillment, destinationAcknowledged: false }))
  }

  // Preselect a sensible service so the shopper does not have to decipher
  // carrier rates just to finish. Express rewards still take priority; all
  // other orders start with the least expensive current service.
  useEffect(() => {
    if (!verification?.rates.length || selectedRateId) return
    const automaticRate = qualifiesForExpressUpgrade(Math.round(subtotal * 100))
      ? selectExpressRate(verification.rates)
      : [...verification.rates].sort((left, right) => left.amountCents - right.amountCents)[0]
    setSelectedRateId(automaticRate?.id ?? null)
  }, [selectedRateId, subtotal, verification])

  const selectedRate = verification?.rates.find((rate) => rate.id === selectedRateId) ?? null
  const charges = calculateShippingCharges({ destination: formData.destination, kitCount, subtotalCents: Math.round(subtotal * 100), selectedRate, localDeliveryFeeCents: verification?.localDeliveryFeeCents ?? null })
  const promotionPreview = resolveDistributorPromotion({
    subtotalCents: Math.round(subtotal * 100),
    volumeDiscountCents: charges.discountCents,
    eligible: Boolean(referralAttribution),
    rateBps: referralAttribution?.customerDiscountRateBps,
    maxCents: referralAttribution?.customerDiscountMaxCents,
  })
  const processingFeeCents = calculatePaymentProcessingFeeCents({ subtotalCents: Math.round(subtotal * 100), discountCents: promotionPreview.discountCents, paymentMethod })
  const checkoutTotalCents = charges.totalCents === null ? null : charges.totalCents + charges.discountCents - promotionPreview.discountCents + processingFeeCents
  const shippingSelection: ShippingSelection | null = verification ? {
    destination: formData.destination,
    address: verificationAddress,
    kitCount,
    localFulfillment: formData.localFulfillment,
    verification,
    addressChoice,
    selectedRateId,
    manualReviewRequested,
    destinationAcknowledged: formData.destinationAcknowledged,
  } : null
  const paymentAllowed = shippingSelection ? shippingSelectionAllowsPayment(shippingSelection) : false
  const correctedChoiceReady = verification?.status !== 'corrected' || Boolean(addressChoice)
  const reviewPathReady = verification ? verification.deliverable || verification.manualReviewRequired || manualReviewRequested : false
  const poBoxAllowed = isPoBoxAddress(address) && !formData.destination.startsWith('local_')
  const checkoutAcknowledgmentComplete = isCheckoutAcknowledgmentComplete(checkoutAcknowledgments)
  const baseFormValid = pickupSelected
    ? (!formData.email.trim() || isValidEmail(formData.email)) && formData.phone.replace(/\D/g, '').length >= 7 && Boolean(formData.fullName.trim())
    : isCheckoutFormValid({
        ...formData,
        streetNumber: poBoxAllowed ? undefined : address.streetNumber,
        neighborhoodRequired: formData.country === 'MX',
      })
  const formIsValid = baseFormValid
    && Boolean(verification)
    && !validating
    && correctedChoiceReady
    && reviewPathReady
    && formData.destinationAcknowledged
    && checkoutAcknowledgmentComplete

  async function submitRequest() {
    setShowValidation(true)
    setSubmitError(false)
    if (!formIsValid || !items.length || !shippingSelection || submitting) {
      window.requestAnimationFrame(() => checkoutFormRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus())
      return
    }
    const contact: OrderContact = {
      name: formData.fullName,
      phone: formData.phone,
      email: formData.email,
      address: pickupSelected ? '' : formData.country === 'US' ? formData.address : [formData.address, formData.streetNumber].filter(Boolean).join(' '),
      address2: pickupSelected ? '' : [formData.neighborhood, formData.address2].filter(Boolean).join(', '),
      city: formData.city,
      state: formData.state,
      zip: pickupSelected ? '' : formData.zip,
      country: formData.country,
      preferredContact: formData.preferredContact,
      notes: formData.notes,
    }
    setSubmitting(true)
    try {
      const order = await createPendingOrder({
        items,
        channel: 'checkout',
        paymentMethod,
        locale,
        contact,
        shipping: shippingSelection,
        acknowledgment: createCheckoutAcknowledgmentAudit(locale),
        referralAttribution,
      })
      setCompletedSummary({ items, subtotal, shipping: shippingSelection, contact, order })
      setOutcome('support')
    } catch {
      setSubmitError(true)
    } finally {
      setSubmitting(false)
    }
  }

  if (outcome && completedSummary) {
    const summaryPaymentAllowed = shippingSelectionAllowsPayment(completedSummary.shipping)
    return (
      <main id="main-content" className="min-h-screen bg-[#f5f5f2]">
        <CheckoutHeader />
        <div className="pt-8"><CheckoutProgress stage="next" /></div>
        <div className="mx-auto flex max-w-xl flex-col items-center px-5 py-12 text-center sm:px-8">
          <span className={cn('flex size-16 items-center justify-center rounded-full', summaryPaymentAllowed ? 'bg-teal-50 text-teal-700' : 'bg-amber-50 text-amber-700')}>{summaryPaymentAllowed ? <Check size={28} aria-hidden="true" /> : <AlertTriangle size={28} aria-hidden="true" />}</span>
          <h1 className="mt-6 text-4xl font-semibold tracking-[-0.05em] text-[#071724]">{t(summaryPaymentAllowed ? 'orderSubmittedTitle' : 'manualReviewOutcomeTitle')}</h1>
          <p className="mt-4 text-base leading-7 text-slate-600">{t(summaryPaymentAllowed ? completedSummary.order.paymentMethod === 'cash_on_delivery' ? 'cashOnDeliverySubmittedBody' : 'orderSubmittedBody' : 'manualReviewOutcomeBody')}</p>
          <div className="mt-6 rounded-2xl bg-[#071724] px-6 py-4 text-white" role="status">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-200">{t('orderReferenceLabel')}</p>
            <p className="mt-1 font-mono text-3xl font-semibold">{completedSummary.order.reference}</p>
          </div>
          <section className="mt-8 w-full rounded-3xl border border-slate-900/10 bg-white p-5 text-left" aria-labelledby="request-summary-heading">
            <h2 id="request-summary-heading" className="text-lg font-semibold text-[#071724]">{t('requestSummary')}</h2>
            <div className="mt-4 grid gap-3">
              {completedSummary.items.map((item) => <div key={item.id} className="flex items-start justify-between gap-4 text-sm"><span className="text-slate-600">{item.productName} · {item.variantLabel} · {purchaseTypeLabel(tCommon, item.purchaseType)} · {tCommon('packLabel', { pack: item.packSize })} × {item.quantity}</span><span className="shrink-0 font-semibold text-[#071724]">{formatCartCurrency(item.linePrice * item.quantity)}</span></div>)}
              <div className="grid gap-2 border-t border-slate-900/10 pt-3 text-sm">
                <div className="flex justify-between"><span>{t('subtotal')}</span><span className="font-semibold">{formatCartCurrency(completedSummary.subtotal)}</span></div>
                {completedSummary.order.importFeeCents ? <div className="flex justify-between"><span>{t('importFee')}</span><span className="font-semibold">{formatCartCurrency(completedSummary.order.importFeeCents / 100)}</span></div> : null}
                <div className="flex justify-between"><span>{t(completedSummary.shipping.localFulfillment === 'pickup' ? 'pickupCharge' : completedSummary.shipping.localFulfillment === 'home_delivery' ? 'localDeliveryCharge' : 'shipping')}</span><span className={cn('font-semibold', completedSummary.order.shippingWaived ? 'text-emerald-700' : '')}>{completedSummary.order.shippingCents === null ? t('pendingConfirmation') : completedSummary.order.shippingWaived ? t('freeShippingApplied') : formatCartCurrency(completedSummary.order.shippingCents / 100)}</span></div>
                {completedSummary.order.discountCents ? <div className="flex justify-between text-emerald-700"><span>{completedSummary.order.discountSource === 'distributor_incentive' ? t('distributorDiscount') : t('volumeDiscount', { rate: Math.round(promotionDiscountRate(Math.round(completedSummary.subtotal * 100)) * 100) })}</span><span className="font-semibold">−{formatCartCurrency(completedSummary.order.discountCents / 100)}</span></div> : null}
                {completedSummary.order.otherPromotionWon ? <p className="text-xs leading-5 text-slate-500">{t('betterPromotionApplied')}</p> : null}
                {completedSummary.order.processingFeeCents ? <div className="flex justify-between"><span>{t('processingFee')}</span><span className="font-semibold">{formatCartCurrency(completedSummary.order.processingFeeCents / 100)}</span></div> : null}
                <div className="flex justify-between"><span>{t('paymentMethodTitle')}</span><span className="font-semibold text-right">{t(paymentMethodLabelKeys[completedSummary.order.paymentMethod])}</span></div>
                <div className="flex justify-between text-base font-semibold"><span>{t('total')}</span><span>{completedSummary.order.totalCents === null ? t('pendingConfirmation') : formatCartCurrency(completedSummary.order.totalCents / 100)}</span></div>
              </div>
            </div>
          </section>
          <div className="mt-8 w-full text-left"><InterimCheckoutHandoff items={completedSummary.items} shipping={completedSummary.shipping} contact={completedSummary.contact} order={completedSummary.order} /></div>
          <a href={path('/cart')} className="mt-5 text-sm font-semibold text-slate-600 hover:text-[#071724]">{t('returnToCart')}</a>
          <div className="mt-10 w-full"><EncoreCompleteKit variant="checkout" /></div>
        </div>
      </main>
    )
  }

  if (!items.length) {
    return <main id="main-content" className="min-h-screen bg-[#f5f5f2]"><CheckoutHeader /><div className="mx-auto flex max-w-xl flex-col items-center px-5 py-24 text-center sm:px-8"><ShoppingCart size={32} aria-hidden="true" className="text-teal-700" /><h1 className="mt-6 text-4xl font-semibold tracking-[-0.05em] text-[#071724]">{t('emptyCartTitle')}</h1><p className="mt-4 text-base leading-7 text-slate-600">{t('emptyCartBody')}</p><a href={path('/catalog')} className="mt-8 inline-flex min-h-12 items-center justify-center rounded-full bg-[#071724] px-7 text-sm font-semibold text-white">{t('browseProducts')}</a></div></main>
  }

  const countryLocked = Boolean(expectedCountryForDestination(formData.destination))
  const localDestination = formData.destination.startsWith('local_')
  const localPostalCode = localDistributionPostalCode(formData.destination)
  const usAddress = formData.country === 'US'
  const mexicoAddress = formData.country === 'MX'
  const currentAddressErrors = addressEssentialErrors(address, formData.destination)
  return (
    <main id="main-content" className="min-h-screen bg-[#f5f5f2]">
      <CheckoutHeader />
      <div className="pt-8"><CheckoutProgress stage="review" /></div>
      <div className="mx-auto max-w-[76rem] px-5 pb-20 sm:px-8">
        <div className="mb-8 max-w-3xl"><p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-700">{t('cartReviewEyebrow')}</p><h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-[#071724] sm:text-5xl">{t('reviewInquiryTitle')}</h1><p className="mt-4 text-base leading-7 text-slate-600">{t('reviewInquiryBody')}</p>{referralAttribution ? <p className="mt-4 inline-flex rounded-full bg-teal-50 px-4 py-2 text-xs font-semibold text-teal-900">{t('distributorAttribution', { code: referralAttribution.code })}</p> : null}</div>

        <div ref={checkoutFormRef} className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
          <div className="grid gap-6">
            <section className="rounded-[1.75rem] border border-white/70 bg-white/75 p-6 shadow-[0_24px_70px_rgba(7,23,36,0.06)] backdrop-blur-xl sm:p-8">
              <h2 className="text-2xl font-semibold tracking-[-0.04em] text-[#071724]">{t('shippingDestinationTitle')}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{t('shippingDestinationBody')}</p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {destinationOptions.map(({ id, icon: Icon, titleKey, bodyKey }) => <button key={id} type="button" onClick={() => chooseDestination(id)} aria-pressed={formData.destination === id} className={cn('flex min-h-28 items-start gap-3 rounded-2xl border p-4 text-left transition', formData.destination === id ? 'border-teal-700 bg-teal-50 ring-2 ring-teal-100' : 'border-slate-200 bg-white hover:border-teal-500/50')}><span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white text-teal-800"><Icon size={18} aria-hidden="true" /></span><span><span className="block text-sm font-semibold text-[#071724]">{t(titleKey)}</span><span className="mt-1 block text-xs leading-5 text-slate-500">{t(bodyKey)}</span></span></button>)}
              </div>
            </section>

            <section className="rounded-[1.75rem] border border-white/70 bg-white/75 p-6 shadow-[0_24px_70px_rgba(7,23,36,0.06)] backdrop-blur-xl sm:p-8">
              <h2 className="text-2xl font-semibold tracking-[-0.04em] text-[#071724]">{t('contactAndShipping')}</h2>
              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <label className="grid gap-2 text-sm font-semibold text-[#071724] sm:col-span-2">{t('fullName')}<input className={inputClass()} autoComplete="name" required aria-invalid={showValidation && !formData.fullName.trim()} value={formData.fullName} onChange={(event) => updateField('fullName', event.target.value)} />{showValidation && !formData.fullName.trim() ? <span className="text-xs font-medium text-rose-700">{t('fullNameError')}</span> : null}</label>
                <label className="grid gap-2 text-sm font-semibold text-[#071724]">{t('phone')}<input className={inputClass()} type="tel" autoComplete="tel" required aria-invalid={showValidation && formData.phone.replace(/\D/g, '').length < 7} value={formData.phone} onChange={(event) => updateField('phone', event.target.value)} />{showValidation && formData.phone.replace(/\D/g, '').length < 7 ? <span className="text-xs font-medium text-rose-700">{t('phoneError')}</span> : null}</label>
                <label className="grid gap-2 text-sm font-semibold text-[#071724]"><span>{t('email')} <span className="font-normal text-slate-400">{t('optional')}</span></span><input className={inputClass()} type="email" autoComplete="email" aria-invalid={showValidation && Boolean(formData.email.trim()) && !isValidEmail(formData.email)} value={formData.email} onChange={(event) => updateField('email', event.target.value)} />{showValidation && formData.email.trim() && !isValidEmail(formData.email) ? <span className="text-xs font-medium text-rose-700">{t('emailError')}</span> : null}</label>
                {localDestination ? <fieldset className="sm:col-span-2">
                  <legend className="text-sm font-semibold text-[#071724]">{t('localFulfillmentTitle')}</legend>
                  <p className="mt-1 text-xs leading-5 text-slate-500">{t('localFulfillmentBody')}</p>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <label className={cn('flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition', formData.localFulfillment === 'pickup' ? 'border-teal-700 bg-teal-50 ring-2 ring-teal-100' : 'border-slate-200 bg-white hover:border-teal-500/50')}>
                      <input type="radio" name="local-fulfillment" value="pickup" checked={formData.localFulfillment === 'pickup'} onChange={() => chooseLocalFulfillment('pickup')} className="mt-1 accent-teal-700" />
                      <PackageCheck size={18} className="mt-0.5 shrink-0 text-teal-800" aria-hidden="true" />
                      <span><span className="flex items-center justify-between gap-3 font-semibold text-[#071724]"><span>{t('pickupAtDistributionPoint')}</span><span>{t('free')}</span></span><span className="mt-1 block text-xs font-normal leading-5 text-slate-500">{t('pickupAtDistributionPointBody', { postalCode: localPostalCode || '' })}</span></span>
                    </label>
                    <label className={cn('flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition', formData.localFulfillment === 'home_delivery' ? 'border-teal-700 bg-teal-50 ring-2 ring-teal-100' : 'border-slate-200 bg-white hover:border-teal-500/50')}>
                      <input type="radio" name="local-fulfillment" value="home_delivery" checked={formData.localFulfillment === 'home_delivery'} onChange={() => chooseLocalFulfillment('home_delivery')} className="mt-1 accent-teal-700" />
                      <Truck size={18} className="mt-0.5 shrink-0 text-teal-800" aria-hidden="true" />
                      <span><span className="flex items-center justify-between gap-3 font-semibold text-[#071724]"><span>{t('homeDelivery')}</span><span>$10</span></span><span className="mt-1 block text-xs font-normal leading-5 text-slate-500">{t('homeDeliveryBody', { postalCode: localPostalCode || '' })}</span></span>
                    </label>
                  </div>
                  {showValidation && !formData.localFulfillment ? <p className="mt-2 text-xs font-medium text-rose-700">{t('localFulfillmentError')}</p> : null}
                </fieldset> : null}
                {localDestination && !formData.localFulfillment ? <div className="sm:col-span-2 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">{t('chooseLocalFulfillmentFirst')}</div> : pickupSelected ? <div className="sm:col-span-2 rounded-2xl border border-teal-200 bg-teal-50 p-4 text-sm leading-6 text-teal-950"><p className="font-semibold">{t('pickupCitySummary', { city: formData.city })}</p><p className="mt-1 text-xs leading-5 text-teal-900">{t('pickupDetailsPending')}</p></div> : <>
                <label className="grid gap-2 text-sm font-semibold text-[#071724] sm:col-span-2">{t('country')}<select className={inputClass()} disabled={countryLocked} value={formData.country} onChange={(event) => updateField('country', event.target.value)}><option value="">{t('selectCountry')}</option>{countryNames.map((country) => <option key={country.code} value={country.code}>{country.name}</option>)}</select></label>
                {usAddress ? <>
                  <label className="grid gap-2 text-sm font-semibold text-[#071724] sm:col-span-2">{t('usStreetAddress')}<input className={inputClass()} autoComplete="address-line1" placeholder={t('usStreetPlaceholder')} required aria-invalid={showValidation && currentAddressErrors.some((error) => error === 'street' || error === 'street_number')} value={formData.address} onChange={(event) => updateField('address', event.target.value)} />{showValidation && currentAddressErrors.includes('street_number') ? <span className="text-xs font-medium text-rose-700">{t('usStreetNumberError')}</span> : null}</label>
                  <label className="grid gap-2 text-sm font-semibold text-[#071724] sm:col-span-2">{t('usUnit')} <span className="font-normal text-slate-400">{t('optional')}</span><input className={inputClass()} autoComplete="address-line2" placeholder={t('usUnitPlaceholder')} value={formData.address2} onChange={(event) => updateField('address2', event.target.value)} /></label>
                  <label className="grid gap-2 text-sm font-semibold text-[#071724]">{t('usCity')}<input className={inputClass()} autoComplete="address-level2" disabled={localDestination} placeholder={t('usCityPlaceholder')} required aria-invalid={showValidation && !formData.city.trim()} value={formData.city} onChange={(event) => updateField('city', event.target.value)} /></label>
                  <label className="grid gap-2 text-sm font-semibold text-[#071724]">{t('usState')}<select className={inputClass()} autoComplete="address-level1" disabled={localDestination} required aria-invalid={showValidation && !formData.state.trim()} value={formData.state} onChange={(event) => updateField('state', event.target.value)}><option value="">{t('selectState')}</option>{US_STATES.map(([code, name]) => <option key={code} value={code}>{name} ({code})</option>)}</select></label>
                  <label className="grid gap-2 text-sm font-semibold text-[#071724]">{t('usZip')}<input className={inputClass()} inputMode="numeric" autoComplete="postal-code" placeholder="79901" required aria-invalid={showValidation && currentAddressErrors.some((error) => error.startsWith('postal_code'))} value={formData.zip} onChange={(event) => updateField('zip', event.target.value)} /></label>
                </> : mexicoAddress ? <>
                  <label className="grid gap-2 text-sm font-semibold text-[#071724]">{t('mexicoState')}<select className={inputClass()} autoComplete="address-level1" disabled={localDestination} required aria-invalid={showValidation && !formData.state.trim()} value={formData.state} onChange={(event) => updateField('state', event.target.value)}><option value="">{t('selectState')}</option>{MEXICO_STATES.map((state) => <option key={state} value={state}>{state}</option>)}</select></label>
                  <label className="grid gap-2 text-sm font-semibold text-[#071724]">{t('mexicoCityMunicipality')}<input className={inputClass()} autoComplete="address-level2" disabled={localDestination} placeholder={t('mexicoCityPlaceholder')} required aria-invalid={showValidation && !formData.city.trim()} value={formData.city} onChange={(event) => updateField('city', event.target.value)} /></label>
                  <label className="grid gap-2 text-sm font-semibold text-[#071724]">{t('mexicoPostalCode')}<input className={inputClass()} inputMode="numeric" autoComplete="postal-code" placeholder="32000" maxLength={5} required aria-invalid={showValidation && currentAddressErrors.some((error) => error.startsWith('postal_code'))} value={formData.zip} onChange={(event) => updateField('zip', event.target.value)} /></label>
                  <label className="grid gap-2 text-sm font-semibold text-[#071724] sm:col-span-2">{t('mexicoNeighborhood')}<input className={inputClass()} autoComplete="address-level3" placeholder={t('mexicoNeighborhoodPlaceholder')} required aria-invalid={showValidation && !formData.neighborhood.trim()} value={formData.neighborhood} onChange={(event) => updateField('neighborhood', event.target.value)} /></label>
                  <label className="grid gap-2 text-sm font-semibold text-[#071724]">{t('mexicoStreet')}<input className={inputClass()} autoComplete="address-line1" placeholder={t('mexicoStreetPlaceholder')} required aria-invalid={showValidation && !formData.address.trim()} value={formData.address} onChange={(event) => updateField('address', event.target.value)} /></label>
                  <label className="grid gap-2 text-sm font-semibold text-[#071724]">{t('mexicoExteriorNumber')}<input className={inputClass()} placeholder="100" required aria-invalid={showValidation && !formData.streetNumber.trim()} value={formData.streetNumber} onChange={(event) => updateField('streetNumber', event.target.value)} /></label>
                  <label className="grid gap-2 text-sm font-semibold text-[#071724] sm:col-span-2">{t('mexicoInteriorNumber')} <span className="font-normal text-slate-400">{t('optional')}</span><input className={inputClass()} autoComplete="address-line2" placeholder={t('mexicoInteriorPlaceholder')} value={formData.address2} onChange={(event) => updateField('address2', event.target.value)} /></label>
                </> : <>
                  <label className="grid gap-2 text-sm font-semibold text-[#071724]">{t('state')}<input className={inputClass()} autoComplete="address-level1" required aria-invalid={showValidation && !formData.state.trim()} value={formData.state} onChange={(event) => updateField('state', event.target.value)} /></label>
                  <label className="grid gap-2 text-sm font-semibold text-[#071724]">{t('city')}<input className={inputClass()} autoComplete="address-level2" required aria-invalid={showValidation && !formData.city.trim()} value={formData.city} onChange={(event) => updateField('city', event.target.value)} /></label>
                  <label className="grid gap-2 text-sm font-semibold text-[#071724]">{t('zip')}<input className={inputClass()} autoComplete="postal-code" required aria-invalid={showValidation && currentAddressErrors.some((error) => error.startsWith('postal_code'))} value={formData.zip} onChange={(event) => updateField('zip', event.target.value)} /></label>
                  <label className="grid gap-2 text-sm font-semibold text-[#071724]">{t('street')}<input className={inputClass()} autoComplete="address-line1" required aria-invalid={showValidation && !formData.address.trim()} value={formData.address} onChange={(event) => updateField('address', event.target.value)} /></label>
                  <label className="grid gap-2 text-sm font-semibold text-[#071724]">{t('streetNumber')}<input className={inputClass()} required aria-invalid={showValidation && !formData.streetNumber.trim()} value={formData.streetNumber} onChange={(event) => updateField('streetNumber', event.target.value)} /></label>
                  <label className="grid gap-2 text-sm font-semibold text-[#071724] sm:col-span-2">{t('addressLine2')} <span className="font-normal text-slate-400">{t('optional')}</span><input className={inputClass()} autoComplete="address-line2" value={formData.address2} onChange={(event) => updateField('address2', event.target.value)} /></label>
                </>}
                </>}
              </div>
              <VerificationPanel result={verification} validating={validating} addressChoice={addressChoice} selectedRateId={selectedRateId} manualReviewRequested={manualReviewRequested} freeShipping={qualifiesForFreeShipping(Math.round(subtotal * 100))} onAddressChoice={setAddressChoice} onRate={setSelectedRateId} onEdit={() => { setVerification(null); setManualReviewRequested(false); checkoutFormRef.current?.querySelector<HTMLInputElement>('input[autocomplete="address-line1"]')?.focus() }} onManualReview={() => setManualReviewRequested(true)} onRetry={() => void runVerification()} />
              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <label className="grid gap-2 text-sm font-semibold text-[#071724]">{t('preferredContactMethod')}<select className={inputClass()} value={formData.preferredContact} onChange={(event) => updateField('preferredContact', event.target.value as ReviewFormData['preferredContact'])}><option value="whatsapp">{t('whatsapp')}</option><option value="email">{t('emailOption')}</option><option value="phone">{t('phoneOption')}</option></select></label>
                <label className="grid gap-2 text-sm font-semibold text-[#071724] sm:col-span-2">{t('notes')}<textarea rows={4} className="w-full resize-none rounded-2xl border border-slate-900/10 bg-white p-4 text-sm text-[#071724] outline-none transition focus:border-teal-600/70 focus:ring-4 focus:ring-teal-100" value={formData.notes} onChange={(event) => updateField('notes', event.target.value)} /></label>
                <div className="grid gap-3 sm:col-span-2">
                  <label className="flex items-start gap-3 rounded-2xl border border-slate-900/10 bg-[#f8fafc] p-4 text-sm leading-6 text-slate-600"><input type="checkbox" checked={formData.destinationAcknowledged} onChange={(event) => updateField('destinationAcknowledged', event.target.checked)} aria-invalid={showValidation && !formData.destinationAcknowledged} className="mt-1 size-4 accent-teal-700" /><span>{t('destinationAcknowledgment')}</span></label>
                </div>
              </div>
            </section>
            <CheckoutAcknowledgment value={checkoutAcknowledgments} onChange={setCheckoutAcknowledgments} />
          </div>

          <aside className="order-first rounded-[1.75rem] border border-white/70 bg-white/85 p-6 shadow-[0_28px_80px_rgba(7,23,36,0.09)] backdrop-blur-2xl sm:p-7 lg:sticky lg:top-8 lg:order-none">
            <details open className="group"><summary className="flex cursor-pointer list-none items-center justify-between gap-4"><span className="text-2xl font-semibold tracking-[-0.04em] text-[#071724]">{t('cart')}</span><span className="flex items-center gap-2"><span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-800">{t(itemCount === 1 ? 'itemCountOne' : 'itemCountOther', { count: itemCount })}</span><ChevronDown size={16} className="transition group-open:rotate-180" aria-hidden="true" /></span></summary>
              <div className="mt-5 grid gap-4">{items.map((item) => <article key={item.id} className="rounded-2xl border border-slate-900/10 bg-white p-4"><div className="flex items-start justify-between gap-4"><div><h3 className="text-sm font-semibold text-[#071724]">{item.productName}</h3><p className="mt-1 text-xs text-slate-500">{item.variantLabel} · {purchaseTypeLabel(tCommon, item.purchaseType)} · {tCommon('packLabel', { pack: item.packSize })}</p><p className="mt-2 text-sm font-semibold text-[#071724]">{formatCartCurrency(item.linePrice * item.quantity)}</p></div><button type="button" onClick={() => removeFromCart(item.id)} aria-label={t('removeFromOrder', { product: item.productName, variant: item.variantLabel })} className="text-slate-400 hover:text-rose-700"><Trash2 size={16} aria-hidden="true" /></button></div><div className="mt-4 inline-flex items-center rounded-full border border-slate-900/10 bg-[#f8fafc]"><button type="button" aria-label={t('decreaseQuantity', { product: item.productName, variant: item.variantLabel })} onClick={() => updateQuantity(item.id, item.quantity - 1)} className="flex size-9 items-center justify-center"><Minus size={14} aria-hidden="true" /></button><span className="min-w-8 text-center text-sm font-semibold">{item.quantity}</span><button type="button" aria-label={t('increaseQuantity', { product: item.productName, variant: item.variantLabel })} onClick={() => updateQuantity(item.id, item.quantity + 1)} className="flex size-9 items-center justify-center"><Plus size={14} aria-hidden="true" /></button></div></article>)}</div>
            </details>
            <section className="mt-6 border-t border-slate-900/10 pt-5" aria-labelledby="checkout-payment-heading">
              <DistributorCodeField subtotalCents={Math.round(subtotal * 100)} />
              <h2 id="checkout-payment-heading" className="text-base font-semibold text-[#071724]">{t('paymentMethodTitle')}</h2>
              <p className="mt-1 text-xs leading-5 text-slate-500">{t('paymentMethodBody')}</p>
              {cashOnDeliveryMethod ? <label className={cn('mt-3 flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition', paymentMethod === cashOnDeliveryMethod.id ? 'border-teal-700 bg-teal-50 ring-2 ring-teal-100' : 'border-slate-200 bg-white')}>
                <input type="radio" name="checkout-payment-method" value={cashOnDeliveryMethod.id} checked={paymentMethod === cashOnDeliveryMethod.id} onChange={() => setPaymentMethod(cashOnDeliveryMethod.id)} className="mt-1 size-4 accent-teal-700" />
                <span className="min-w-0 flex-1"><span className="flex flex-wrap items-center justify-between gap-2 text-sm font-semibold text-[#071724]"><span>{t(paymentMethodLabelKeys[cashOnDeliveryMethod.id])}</span><span className="rounded-full bg-[#071724] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">{t('recommended')}</span></span><span className="mt-1 block text-xs font-normal leading-5 text-slate-600">{t('cashOnDeliveryBody')}</span></span>
              </label> : null}
              {alternatePaymentMethods.length ? <details className="group mt-3">
                <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between rounded-xl px-2 text-sm font-semibold text-teal-800"><span>{t('otherPaymentMethods')}</span><ChevronDown size={15} className="transition group-open:rotate-180" aria-hidden="true" /></summary>
                <div className="mt-2 grid gap-2">{alternatePaymentMethods.map((method) => (
                  <label key={method.id} className={cn('flex cursor-pointer items-center gap-3 rounded-xl border p-3 text-sm font-semibold transition', paymentMethod === method.id ? 'border-teal-700 bg-teal-50' : 'border-slate-200 bg-white')}><input type="radio" name="checkout-payment-method" value={method.id} checked={paymentMethod === method.id} onChange={() => setPaymentMethod(method.id)} className="size-4 accent-teal-700" /><span>{t(paymentMethodLabelKeys[method.id])}</span></label>
                ))}</div>
              </details> : null}
            </section>
            <div className="mt-6 grid gap-2 border-t border-slate-900/10 pt-5 text-sm">
              <div className="flex justify-between text-slate-600"><span>{t('subtotal')}</span><span className="font-semibold text-[#071724]">{formatCartCurrency(subtotal)}</span></div>
              {charges.importFeeCents ? <div className="flex justify-between text-slate-600"><span>{t('importFee')}</span><span className="font-semibold text-[#071724]">{formatCartCurrency(charges.importFeeCents / 100)}</span></div> : null}
              <div className="flex justify-between text-slate-600"><span>{t(formData.localFulfillment === 'pickup' ? 'pickupCharge' : formData.localFulfillment === 'home_delivery' ? 'localDeliveryCharge' : 'shipping')}</span><span className={cn('font-semibold', charges.shippingWaived ? 'text-emerald-700' : 'text-[#071724]')}>{charges.shippingCents === null ? t('pendingConfirmation') : charges.shippingWaived ? t('freeShippingApplied') : formatCartCurrency(charges.shippingCents / 100)}</span></div>
              {promotionPreview.discountCents ? <div className="flex justify-between text-emerald-700"><span>{promotionPreview.discountSource === 'distributor_incentive' ? t('distributorDiscountPreview') : t('volumeDiscount', { rate: Math.round(promotionDiscountRate(Math.round(subtotal * 100)) * 100) })}</span><span className="font-semibold">−{formatCartCurrency(promotionPreview.discountCents / 100)}</span></div> : null}
              {promotionPreview.otherPromotionWon ? <p className="text-xs leading-5 text-slate-500">{t('betterPromotionApplied')}</p> : null}
              {processingFeeCents ? <div className="flex justify-between text-slate-600"><span>{t('processingFee')}</span><span className="font-semibold text-[#071724]">{formatCartCurrency(processingFeeCents / 100)}</span></div> : null}
              <div className="mt-2 flex justify-between border-t border-slate-900/10 pt-3 text-base font-semibold text-[#071724]"><span>{t('total')}</span><span>{checkoutTotalCents === null ? t('pendingConfirmation') : formatCartCurrency(checkoutTotalCents / 100)}</span></div>
              {processingFeeCents ? <p className="mt-1 text-xs leading-5 text-slate-500">{t('processingFeeNote')}</p> : null}
              {destinationUsesMexicoImportFee(formData.destination) ? <p className="mt-2 rounded-xl bg-teal-50 p-3 text-xs leading-5 text-teal-950">{t('mexicoProcessingNote')}</p> : null}
              {!paymentAllowed && verification ? <p className="mt-2 rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-950">{t('paymentBlockedPendingReview')}</p> : null}
              <a href={path('/legal/shipping-returns')} className="mt-2 text-xs font-semibold text-teal-800 hover:underline">{t('shippingDeliveryLink')}</a>
            </div>
            <div className="mt-6"><EncoreCompleteKit variant="checkout" /></div>
            {showValidation && !formIsValid ? <p className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-900" role="alert">{t('validationBannerShipping')}</p> : null}
            {submitError ? <p className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm leading-6 text-red-900" role="alert">{t('submitErrorGeneric')}</p> : null}
            <button
              type="button"
              onClick={() => void submitRequest()}
              disabled={!checkoutAcknowledgmentComplete || submitting}
              aria-describedby="checkout-acknowledgment-status"
              className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#071724] px-5 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-45"
            >
              {submitting ? <><LoaderCircle size={16} className="animate-spin" aria-hidden="true" />{t('submittingOrder')}</> : <>{t(paymentMethod === 'cash_on_delivery' ? 'placeOrderPayOnDelivery' : 'submitOrderRequest')}<ChevronRight size={16} aria-hidden="true" /></>}
            </button>
            <div className="mt-4 grid gap-1.5"><p className="flex items-center gap-1.5 text-xs font-medium text-slate-500"><ShieldCheck size={13} className="text-teal-700" aria-hidden="true" />{t('serverValidationNote')}</p><p className="flex items-center gap-1.5 text-xs font-medium text-slate-500"><PackageCheck size={13} className="text-teal-700" aria-hidden="true" />{t('inventoryReviewNote')}</p><p className="flex items-center gap-1.5 text-xs font-medium text-slate-500"><MessageCircle size={13} className="text-teal-700" aria-hidden="true" />{t('supportAvailable')} <a href="https://wa.me/19153595448" className="font-semibold text-teal-800 hover:underline">{t('contactEncoreWhatsapp')}</a></p></div>
          </aside>
        </div>
      </div>
    </main>
  )
}
