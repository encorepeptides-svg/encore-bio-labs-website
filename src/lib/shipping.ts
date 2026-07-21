import { isSupabaseConfigured, supabase } from './supabaseClient'

export type DeliveryDestination =
  | 'us'
  | 'mexico'
  | 'local_el_paso'
  | 'local_juarez'
  | 'local_chihuahua'
  | 'international'

export type AddressChoice = 'recommended' | 'original'
export type LocalFulfillmentMethod = 'pickup' | 'home_delivery'

export type ShippingAddress = {
  country: string
  state: string
  city: string
  neighborhood: string
  postalCode: string
  street: string
  streetNumber: string
  line2: string
}

export type ShippingRate = {
  id: string
  carrier: string
  service: string
  amountCents: number
  currency: string
  deliveryDays: number | null
  deliveryDate: string | null
}

export type AddressVerificationStatus =
  | 'verified'
  | 'corrected'
  | 'incomplete'
  | 'invalid'
  | 'undeliverable'
  | 'out_of_coverage'
  | 'provider_unavailable'
  | 'manual_review'

export type AddressVerificationResult = {
  status: AddressVerificationStatus
  provider: 'easypost' | 'local_rules' | 'unavailable'
  originalAddress: ShippingAddress
  recommendedAddress: ShippingAddress | null
  messages: string[]
  rates: ShippingRate[]
  localDeliveryFeeCents: number | null
  localDeliveryTime: string | null
  distanceMiles: number | null
  pickupPointName: string | null
  pickupPointAddress: string | null
  verificationId: string | null
  checkedAt: string
  manualReviewRequired: boolean
  deliverable: boolean
}

export type ShippingVerificationRequest = {
  destination: DeliveryDestination
  address: ShippingAddress
  kitCount: number
  localFulfillment: LocalFulfillmentMethod | null
}

export type ShippingSelection = ShippingVerificationRequest & {
  verification: AddressVerificationResult
  addressChoice: AddressChoice | null
  selectedRateId: string | null
  manualReviewRequested: boolean
  destinationAcknowledged: boolean
}

export type ShippingCharges = {
  importFeeCents: number
  shippingCents: number | null
  totalCents: number | null
}

const US_ZIP = /^\d{5}(?:-\d{4})?$/
const MX_POSTAL_CODE = /^\d{5}$/
const INTERNATIONAL_POSTAL_CODE = /^[\p{L}\d][\p{L}\d -]{1,11}$/u
const ISO_COUNTRY = /^[A-Z]{2}$/

export function emptyShippingAddress(country = 'US'): ShippingAddress {
  return { country, state: '', city: '', neighborhood: '', postalCode: '', street: '', streetNumber: '', line2: '' }
}

export function splitUsStreetAddress(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return { street: '', streetNumber: '' }
  if (/^(?:p\.?\s*o\.?\s*box|post(?:al)?\s+office\s+box)\b/i.test(trimmed)) {
    return { street: trimmed, streetNumber: '' }
  }
  const match = trimmed.match(/^(\d[\dA-Za-z/-]*(?:\s+1\/2)?)\s+(.+)$/)
  return match ? { street: match[2], streetNumber: match[1] } : { street: trimmed, streetNumber: '' }
}

export function expectedCountryForDestination(destination: DeliveryDestination) {
  if (destination === 'us' || destination === 'local_el_paso') return 'US'
  if (destination === 'mexico' || destination === 'local_juarez' || destination === 'local_chihuahua') return 'MX'
  return null
}

export function destinationIsLocal(destination: DeliveryDestination) {
  return destination.startsWith('local_')
}

export function destinationUsesMexicoImportFee(destination: DeliveryDestination) {
  return destination === 'mexico' || destination === 'local_juarez' || destination === 'local_chihuahua'
}

export function localFulfillmentRequiresAddress(method: LocalFulfillmentMethod | null) {
  return method !== 'pickup'
}

export function distanceMilesBetween(latitudeA: number, longitudeA: number, latitudeB: number, longitudeB: number) {
  const radians = (degrees: number) => degrees * Math.PI / 180
  const earthRadiusMiles = 3958.7613
  const latitudeDelta = radians(latitudeB - latitudeA)
  const longitudeDelta = radians(longitudeB - longitudeA)
  const a = Math.sin(latitudeDelta / 2) ** 2 + Math.cos(radians(latitudeA)) * Math.cos(radians(latitudeB)) * Math.sin(longitudeDelta / 2) ** 2
  return earthRadiusMiles * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function localDestinationIdentityMatches(address: Pick<ShippingAddress, 'country' | 'state' | 'city'>, destination: DeliveryDestination) {
  const city = comparable(address.city)
  const state = comparable(address.state)
  const country = address.country.trim().toUpperCase()
  if (destination === 'local_el_paso') return country === 'US' && city === 'elpaso' && ['tx', 'texas'].includes(state)
  if (destination === 'local_juarez') return country === 'MX' && ['ciudadjuarez', 'juarez'].includes(city) && ['chihuahua', 'chih'].includes(state)
  if (destination === 'local_chihuahua') return country === 'MX' && ['chihuahua', 'chihuahuacity'].includes(city) && ['chihuahua', 'chih'].includes(state)
  return true
}

export function addressEssentialErrors(address: ShippingAddress, destination: DeliveryDestination) {
  const errors: string[] = []
  const country = address.country.trim().toUpperCase()
  const expectedCountry = expectedCountryForDestination(destination)

  if (!ISO_COUNTRY.test(country)) errors.push('country')
  if (expectedCountry && country !== expectedCountry) errors.push('country_mismatch')
  if (destination === 'international' && (country === 'US' || country === 'MX')) errors.push('country_mismatch')
  if (!address.state.trim()) errors.push('state')
  if (!address.city.trim()) errors.push('city')
  if (country === 'MX' && !address.neighborhood.trim()) errors.push('neighborhood')
  if (!address.street.trim()) errors.push('street')
  if (!address.streetNumber.trim() && !isPoBoxAddress(address)) errors.push('street_number')
  if (!address.postalCode.trim()) errors.push('postal_code')
  else if (country === 'US' && !US_ZIP.test(address.postalCode.trim())) errors.push('postal_code_invalid')
  else if (country === 'MX' && !MX_POSTAL_CODE.test(address.postalCode.trim())) errors.push('postal_code_invalid')
  else if (country !== 'US' && country !== 'MX' && !INTERNATIONAL_POSTAL_CODE.test(address.postalCode.trim())) errors.push('postal_code_invalid')
  if (isPoBoxAddress(address) && destinationIsLocal(destination)) errors.push('po_box_local')
  if (destinationIsLocal(destination) && !localDestinationIdentityMatches(address, destination)) errors.push('local_city_mismatch')

  return [...new Set(errors)]
}

export function isPoBoxAddress(address: Pick<ShippingAddress, 'street' | 'streetNumber' | 'line2'>) {
  return /\b(?:p\.?\s*o\.?\s*box|post(?:al)?\s+office\s+box|apartado\s+postal)\b/i.test(
    `${address.street} ${address.streetNumber} ${address.line2}`,
  )
}

function comparable(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/gi, '').toLowerCase()
}

export function addressesDiffer(original: ShippingAddress, recommended: ShippingAddress | null) {
  if (!recommended) return false
  return (Object.keys(original) as Array<keyof ShippingAddress>).some(
    (key) => comparable(original[key]) !== comparable(recommended[key]),
  )
}

export function selectedShippingAddress(selection: Pick<ShippingSelection, 'address' | 'verification' | 'addressChoice'>) {
  if (selection.addressChoice === 'recommended' && selection.verification.recommendedAddress) {
    return selection.verification.recommendedAddress
  }
  return selection.address
}

export function calculateMexicoImportFeeCents(kitCount: number) {
  if (kitCount <= 0) return 0
  return kitCount >= 5 ? 5_000 : 2_500
}

export function calculateShippingCharges({
  destination,
  kitCount,
  subtotalCents,
  selectedRate,
  localDeliveryFeeCents,
}: {
  destination: DeliveryDestination
  kitCount: number
  subtotalCents: number
  selectedRate: ShippingRate | null
  localDeliveryFeeCents: number | null
}): ShippingCharges {
  const importFeeCents = destinationUsesMexicoImportFee(destination) ? calculateMexicoImportFeeCents(kitCount) : 0
  let shippingCents: number | null = null
  if (destination === 'mexico') shippingCents = 1_500
  else if (destinationIsLocal(destination)) shippingCents = localDeliveryFeeCents
  else if (selectedRate) shippingCents = selectedRate.amountCents

  return {
    importFeeCents,
    shippingCents,
    totalCents: shippingCents === null ? null : subtotalCents + importFeeCents + shippingCents,
  }
}

export function shippingSelectionAllowsPayment(selection: ShippingSelection) {
  if (!selection.destinationAcknowledged || selection.manualReviewRequested) return false
  if (!selection.verification.deliverable || selection.verification.manualReviewRequired) return false
  if (selection.verification.status === 'corrected' && !selection.addressChoice) return false
  if (selection.destination === 'international') return false
  if (destinationIsLocal(selection.destination)) {
    if (!selection.localFulfillment) return false
    return selection.verification.localDeliveryFeeCents !== null && Boolean(selection.verification.localDeliveryTime)
  }
  if (selection.destination === 'mexico') return selection.verification.rates.length > 0 && Boolean(selection.selectedRateId)
  return Boolean(selection.selectedRateId)
}

export async function verifyShippingAddress(input: ShippingVerificationRequest): Promise<AddressVerificationResult> {
  if (destinationIsLocal(input.destination) && !input.localFulfillment) {
    return {
      status: 'incomplete', provider: 'local_rules', originalAddress: input.address, recommendedAddress: null,
      messages: ['local_fulfillment_required'], rates: [], localDeliveryFeeCents: null, localDeliveryTime: null,
      distanceMiles: null, pickupPointName: null, pickupPointAddress: null,
      verificationId: null, checkedAt: new Date().toISOString(), manualReviewRequired: false, deliverable: false,
    }
  }
  const pickup = destinationIsLocal(input.destination) && input.localFulfillment === 'pickup'
  const localErrors = pickup
    ? (localDestinationIdentityMatches(input.address, input.destination) ? [] : ['local_city_mismatch'])
    : addressEssentialErrors(input.address, input.destination)
  if (localErrors.length) {
    const outsideLocalCity = localErrors.includes('local_city_mismatch')
    return {
      status: outsideLocalCity ? 'out_of_coverage' : 'incomplete',
      provider: outsideLocalCity ? 'local_rules' : 'unavailable',
      originalAddress: input.address,
      recommendedAddress: null,
      messages: localErrors,
      rates: [],
      localDeliveryFeeCents: null,
      localDeliveryTime: null,
      distanceMiles: null,
      pickupPointName: null,
      pickupPointAddress: null,
      verificationId: null,
      checkedAt: new Date().toISOString(),
      manualReviewRequired: false,
      deliverable: false,
    }
  }

  if (!isSupabaseConfigured || !supabase) {
    return {
      status: 'provider_unavailable',
      provider: 'unavailable',
      originalAddress: input.address,
      recommendedAddress: null,
      messages: ['provider_unavailable'],
      rates: [],
      localDeliveryFeeCents: pickup ? 0 : null,
      localDeliveryTime: null,
      distanceMiles: null,
      pickupPointName: null,
      pickupPointAddress: null,
      verificationId: null,
      checkedAt: new Date().toISOString(),
      manualReviewRequired: true,
      deliverable: false,
    }
  }

  const { data, error } = await supabase.functions.invoke<AddressVerificationResult>('shipping-checkout', {
    body: { action: 'validate', ...input },
  })
  if (error || !data) {
    return {
      status: 'provider_unavailable',
      provider: 'unavailable',
      originalAddress: input.address,
      recommendedAddress: null,
      messages: ['provider_unavailable'],
      rates: [],
      localDeliveryFeeCents: pickup ? 0 : null,
      localDeliveryTime: null,
      distanceMiles: null,
      pickupPointName: null,
      pickupPointAddress: null,
      verificationId: null,
      checkedAt: new Date().toISOString(),
      manualReviewRequired: true,
      deliverable: false,
    }
  }
  return data
}
