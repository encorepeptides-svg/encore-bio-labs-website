import { createClient } from 'npm:@supabase/supabase-js@2.110.1'

type Destination = 'us' | 'mexico' | 'local_el_paso' | 'local_juarez' | 'local_chihuahua' | 'international'
type LocalFulfillment = 'pickup' | 'home_delivery'
type Address = { country: string; state: string; city: string; neighborhood: string; postalCode: string; street: string; streetNumber: string; line2: string }
type Rate = { id: string; carrier: string; service: string; amountCents: number; currency: string; deliveryDays: number | null; deliveryDate: string | null }
type Verification = {
  status: 'verified' | 'corrected' | 'incomplete' | 'invalid' | 'undeliverable' | 'out_of_coverage' | 'provider_unavailable' | 'manual_review'
  provider: 'easypost' | 'local_rules' | 'unavailable'
  originalAddress: Address
  recommendedAddress: Address | null
  messages: string[]
  rates: Rate[]
  localDeliveryFeeCents: number | null
  localDeliveryTime: string | null
  distanceMiles: number | null
  coverageCenterPostalCode: string | null
  pickupPointName: string | null
  pickupPointAddress: string | null
  verificationId: string | null
  checkedAt: string
  manualReviewRequired: boolean
  deliverable: boolean
}

const JSON_HEADERS = { 'content-type': 'application/json; charset=utf-8' }
const US_ZIP = /^\d{5}(?:-\d{4})?$/
const MX_POSTAL_CODE = /^\d{5}$/
const INTERNATIONAL_POSTAL_CODE = /^[\p{L}\d][\p{L}\d -]{1,11}$/u

function corsHeaders(origin: string | null) {
  const configured = (Deno.env.get('STOREFRONT_ALLOWED_ORIGINS') || '').split(',').map((value) => value.trim()).filter(Boolean)
  const allowed = !origin || !configured.length || configured.includes(origin)
  return {
    'access-control-allow-origin': allowed && origin ? origin : configured[0] || '*',
    'access-control-allow-headers': 'authorization, x-client-info, apikey, content-type',
    'access-control-allow-methods': 'POST, OPTIONS',
    'vary': 'Origin',
  }
}

function response(body: unknown, status = 200, origin: string | null = null) {
  return new Response(JSON.stringify(body), { status, headers: { ...JSON_HEADERS, ...corsHeaders(origin) } })
}

function text(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

function normalize(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/gi, '').toLowerCase()
}

function expectedCountry(destination: Destination) {
  if (destination === 'us' || destination === 'local_el_paso') return 'US'
  if (destination === 'mexico' || destination === 'local_juarez' || destination === 'local_chihuahua') return 'MX'
  return null
}

function isLocal(destination: Destination) {
  return destination.startsWith('local_')
}

function usesMexicoImportFee(destination: Destination) {
  return destination === 'mexico' || destination === 'local_juarez' || destination === 'local_chihuahua'
}

function localIdentityMatches(address: Address, destination: Destination) {
  const rule = localRule(destination)
  if (!rule) return true
  return rule.city.includes(normalize(address.city)) && rule.state.includes(normalize(address.state))
}

function isPoBox(address: Address) {
  return /\b(?:p\.?\s*o\.?\s*box|post(?:al)?\s+office\s+box|apartado\s+postal)\b/i.test(`${address.street} ${address.streetNumber} ${address.line2}`)
}

function sanitizeAddress(value: unknown): Address {
  const input = value && typeof value === 'object' ? value as Record<string, unknown> : {}
  return {
    country: text(input.country).toUpperCase(),
    state: text(input.state),
    city: text(input.city),
    neighborhood: text(input.neighborhood),
    postalCode: text(input.postalCode).toUpperCase(),
    street: text(input.street),
    streetNumber: text(input.streetNumber),
    line2: text(input.line2),
  }
}

function essentialErrors(address: Address, destination: Destination) {
  const errors: string[] = []
  const expected = expectedCountry(destination)
  if (!/^[A-Z]{2}$/.test(address.country)) errors.push('country')
  if (expected && address.country !== expected) errors.push('country_mismatch')
  if (destination === 'international' && ['US', 'MX'].includes(address.country)) errors.push('country_mismatch')
  if (!address.state) errors.push('state')
  if (!address.city) errors.push('city')
  if (address.country === 'MX' && !address.neighborhood) errors.push('neighborhood')
  if (!address.street) errors.push('street')
  if (!address.streetNumber && !isPoBox(address)) errors.push('street_number')
  if (!address.postalCode) errors.push('postal_code')
  else if (address.country === 'US' && !US_ZIP.test(address.postalCode)) errors.push('postal_code_invalid')
  else if (address.country === 'MX' && !MX_POSTAL_CODE.test(address.postalCode)) errors.push('postal_code_invalid')
  else if (!['US', 'MX'].includes(address.country) && !INTERNATIONAL_POSTAL_CODE.test(address.postalCode)) errors.push('postal_code_invalid')
  if (isLocal(destination) && isPoBox(address)) errors.push('po_box_local')
  if (isLocal(destination) && !localIdentityMatches(address, destination)) errors.push('local_city_mismatch')
  return [...new Set(errors)]
}

function baseVerification(address: Address, overrides: Partial<Verification>): Verification {
  return {
    status: 'manual_review',
    provider: 'unavailable',
    originalAddress: address,
    recommendedAddress: null,
    messages: [],
    rates: [],
    localDeliveryFeeCents: null,
    localDeliveryTime: null,
    distanceMiles: null,
    coverageCenterPostalCode: null,
    pickupPointName: null,
    pickupPointAddress: null,
    verificationId: null,
    checkedAt: new Date().toISOString(),
    manualReviewRequired: true,
    deliverable: false,
    ...overrides,
  }
}

function splitStreet(street1: string, original: Address) {
  const leading = street1.match(/^(\d+[\w-]*)\s+(.+)$/)
  if (leading) return { street: leading[2], streetNumber: leading[1] }
  const trailing = street1.match(/^(.+?)\s+(\d+[\w-]*)$/)
  if (trailing) return { street: trailing[1], streetNumber: trailing[2] }
  return { street: street1 || original.street, streetNumber: original.streetNumber }
}

function providerAddressToAddress(provider: Record<string, unknown>, original: Address): Address {
  const street = splitStreet(text(provider.street1), original)
  const providerLine2 = text(provider.street2)
  const neighborhoodPrefix = original.neighborhood ? new RegExp(`^col\\.?\\s*${original.neighborhood.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*,?\\s*`, 'i') : null
  return {
    country: text(provider.country).toUpperCase() || original.country,
    state: text(provider.state) || original.state,
    city: text(provider.city) || original.city,
    neighborhood: original.neighborhood,
    postalCode: text(provider.zip).toUpperCase() || original.postalCode,
    street: street.street,
    streetNumber: street.streetNumber,
    line2: (neighborhoodPrefix ? providerLine2.replace(neighborhoodPrefix, '') : providerLine2) || original.line2,
  }
}

function addressesDiffer(a: Address, b: Address) {
  return (Object.keys(a) as Array<keyof Address>).some((key) => normalize(a[key]) !== normalize(b[key]))
}

function easyPostAuth(apiKey: string) {
  return `Basic ${btoa(`${apiKey}:`)}`
}

function providerStreet1(address: Address) {
  if (!address.streetNumber) return address.street
  return address.country === 'US'
    ? `${address.streetNumber} ${address.street}`.trim()
    : `${address.street} ${address.streetNumber}`.trim()
}

async function easyPostRequest(path: string, apiKey: string, body: unknown) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 12_000)
  try {
    const result = await fetch(`https://api.easypost.com/v2/${path}`, {
      method: 'POST',
      headers: { authorization: easyPostAuth(apiKey), 'content-type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    })
    const payload = await result.json().catch(() => ({})) as Record<string, unknown>
    return { ok: result.ok, status: result.status, payload }
  } finally {
    clearTimeout(timer)
  }
}

function providerErrorMessages(payload: Record<string, unknown>) {
  const error = payload.error && typeof payload.error === 'object' ? payload.error as Record<string, unknown> : {}
  const nested = Array.isArray(error.errors) ? error.errors : []
  const codes = nested.flatMap((entry) => entry && typeof entry === 'object' ? [text((entry as Record<string, unknown>).code), text((entry as Record<string, unknown>).field)].filter(Boolean) : [])
  return [...new Set([text(error.code), ...codes].filter(Boolean))]
}

function providerIsUnavailable(messages: string[]) {
  return messages.some((message) => /UNAVAILABLE|UPSTREAM|TIMEOUT|INTL_NOT_ENABLED|MODE\.UNAUTHORIZED/i.test(message))
}

function originAndParcel(kitCount: number) {
  const fromAddress = {
    name: Deno.env.get('EASYPOST_FROM_NAME') || 'Encore Bio Labs',
    street1: Deno.env.get('EASYPOST_FROM_STREET1') || '',
    street2: Deno.env.get('EASYPOST_FROM_STREET2') || '',
    city: Deno.env.get('EASYPOST_FROM_CITY') || '',
    state: Deno.env.get('EASYPOST_FROM_STATE') || '',
    zip: Deno.env.get('EASYPOST_FROM_ZIP') || '',
    country: Deno.env.get('EASYPOST_FROM_COUNTRY') || 'US',
    phone: Deno.env.get('EASYPOST_FROM_PHONE') || '',
  }
  const parcel = {
    length: Number(Deno.env.get('EASYPOST_PARCEL_LENGTH_IN') || ''),
    width: Number(Deno.env.get('EASYPOST_PARCEL_WIDTH_IN') || ''),
    height: Number(Deno.env.get('EASYPOST_PARCEL_HEIGHT_IN') || ''),
    weight: Number(Deno.env.get('EASYPOST_WEIGHT_OZ_PER_KIT') || '') * Math.max(1, kitCount),
  }
  const addressReady = Boolean(fromAddress.street1 && fromAddress.city && fromAddress.state && fromAddress.zip && fromAddress.country)
  const parcelReady = Object.values(parcel).every((value) => Number.isFinite(value) && value > 0)
  return addressReady && parcelReady ? { fromAddress, parcel } : null
}

async function fetchRates(apiKey: string, toAddress: Record<string, unknown>, kitCount: number, destination: Destination) {
  if (destination === 'international') return { rates: [] as Rate[], configured: false }
  const configuration = originAndParcel(kitCount)
  if (!configuration) return { rates: [] as Rate[], configured: false }
  const cleanToAddress = text(toAddress.id)
    ? { id: text(toAddress.id) }
    : {
        street1: text(toAddress.street1), street2: text(toAddress.street2), city: text(toAddress.city),
        state: text(toAddress.state), zip: text(toAddress.zip), country: text(toAddress.country),
      }
  const shipment = await easyPostRequest('shipments', apiKey, {
    shipment: { to_address: cleanToAddress, from_address: configuration.fromAddress, parcel: configuration.parcel },
  })
  if (!shipment.ok) return { rates: [] as Rate[], configured: true }
  const rates = Array.isArray(shipment.payload.rates) ? shipment.payload.rates : []
  const normalizedRates = rates.flatMap((value): Rate[] => {
    if (!value || typeof value !== 'object') return []
    const rate = value as Record<string, unknown>
    const amount = Number(rate.rate)
    const currency = text(rate.currency).toUpperCase()
    if (!text(rate.id) || !text(rate.carrier) || !text(rate.service) || !Number.isFinite(amount) || amount < 0 || currency !== 'USD') return []
    return [{
      id: text(rate.id),
      carrier: text(rate.carrier),
      service: text(rate.service),
      amountCents: Math.round(amount * 100),
      currency,
      deliveryDays: Number.isFinite(Number(rate.delivery_days)) ? Number(rate.delivery_days) : null,
      deliveryDate: text(rate.delivery_date) || null,
    }]
  }).sort((a, b) => a.amountCents - b.amountCents).slice(0, 12)
  return { rates: normalizedRates, configured: true }
}

function localRule(destination: Destination) {
  // Fixed WGS84 postal-code centroids are the business-approved centers for
  // the 10-mile radius. Customer coordinates still come from EasyPost.
  if (destination === 'local_el_paso') return { city: ['elpaso'], state: ['tx', 'texas'], key: 'EL_PASO', postalCode: '79912', center: { latitude: 31.8383, longitude: -106.5364 } }
  if (destination === 'local_juarez') return { city: ['ciudadjuarez', 'juarez'], state: ['chihuahua', 'chih'], key: 'JUAREZ', postalCode: '32510', center: { latitude: 31.7228, longitude: -106.4304 } }
  if (destination === 'local_chihuahua') return { city: ['chihuahua', 'chihuahuacity'], state: ['chihuahua', 'chih'], key: 'CHIHUAHUA', postalCode: '31200', center: { latitude: 28.6550704, longitude: -106.0812946 } }
  return null
}

function distanceMilesBetween(latitudeA: number, longitudeA: number, latitudeB: number, longitudeB: number) {
  const radians = (degrees: number) => degrees * Math.PI / 180
  const earthRadiusMiles = 3958.7613
  const latitudeDelta = radians(latitudeB - latitudeA)
  const longitudeDelta = radians(longitudeB - longitudeA)
  const a = Math.sin(latitudeDelta / 2) ** 2 + Math.cos(radians(latitudeA)) * Math.cos(radians(latitudeB)) * Math.sin(longitudeDelta / 2) ** 2
  return earthRadiusMiles * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function verifiedCoordinates(delivery: Record<string, unknown> | null) {
  const details = delivery?.details && typeof delivery.details === 'object' ? delivery.details as Record<string, unknown> : null
  const latitudeValue = details?.latitude
  const longitudeValue = details?.longitude
  if (latitudeValue === null || latitudeValue === undefined || longitudeValue === null || longitudeValue === undefined || !String(latitudeValue).trim() || !String(longitudeValue).trim()) return null
  const latitude = Number(latitudeValue)
  const longitude = Number(longitudeValue)
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || Math.abs(latitude) > 90 || Math.abs(longitude) > 180) return null
  return { latitude, longitude }
}

function localConfiguration(key: string) {
  return {
    homeDeliveryTime: Deno.env.get(`LOCAL_DELIVERY_${key}_HOME_DELIVERY_TIME`) || '',
    pickupName: Deno.env.get(`LOCAL_DELIVERY_${key}_PICKUP_NAME`) || '',
    pickupAddress: Deno.env.get(`LOCAL_DELIVERY_${key}_PICKUP_ADDRESS`) || '',
    pickupTime: Deno.env.get(`LOCAL_DELIVERY_${key}_PICKUP_TIME`) || '',
  }
}

function validatePickup(destination: Destination, address: Address) {
  const rule = localRule(destination)
  if (!rule || address.country !== expectedCountry(destination) || !localIdentityMatches(address, destination)) {
    return baseVerification(address, { status: 'out_of_coverage', provider: 'local_rules', messages: ['local_city_mismatch'], manualReviewRequired: false })
  }
  const configuration = localConfiguration(rule.key)
  const configured = Boolean(configuration.pickupName && configuration.pickupAddress && configuration.pickupTime)
  return baseVerification(address, {
    status: configured ? 'verified' : 'manual_review',
    provider: 'local_rules',
    messages: configured ? [] : ['pickup_details_not_configured'],
    localDeliveryFeeCents: 0,
    localDeliveryTime: configuration.pickupTime || null,
    coverageCenterPostalCode: rule.postalCode,
    pickupPointName: configuration.pickupName || null,
    pickupPointAddress: configuration.pickupAddress || null,
    manualReviewRequired: !configured,
    deliverable: true,
  })
}

function applyLocalCoverage(result: Verification, destination: Destination, coordinates: { latitude: number; longitude: number } | null) {
  const rule = localRule(destination)
  if (!rule) return result
  if (!rule.city.includes(normalize(result.recommendedAddress?.city || result.originalAddress.city)) || !rule.state.includes(normalize(result.recommendedAddress?.state || result.originalAddress.state))) {
    return { ...result, status: 'out_of_coverage' as const, provider: 'local_rules' as const, messages: [...result.messages, 'local_city_mismatch'], rates: [], localDeliveryFeeCents: null, localDeliveryTime: null, coverageCenterPostalCode: rule.postalCode, deliverable: false, manualReviewRequired: false }
  }

  const configuration = localConfiguration(rule.key)
  if (!coordinates) {
    return { ...result, status: 'manual_review' as const, provider: 'local_rules' as const, messages: [...result.messages, 'local_radius_unavailable'], rates: [], localDeliveryFeeCents: null, localDeliveryTime: null, coverageCenterPostalCode: rule.postalCode, manualReviewRequired: true }
  }

  const distanceMiles = distanceMilesBetween(rule.center.latitude, rule.center.longitude, coordinates.latitude, coordinates.longitude)
  if (distanceMiles > 10) {
    return { ...result, status: 'out_of_coverage' as const, provider: 'local_rules' as const, messages: [...result.messages, 'local_outside_ten_miles'], rates: [], localDeliveryFeeCents: null, localDeliveryTime: null, distanceMiles, coverageCenterPostalCode: rule.postalCode, deliverable: false, manualReviewRequired: false }
  }

  const timingConfigured = Boolean(configuration.homeDeliveryTime)
  return {
    ...result,
    provider: 'local_rules' as const,
    rates: [],
    localDeliveryFeeCents: 1_000,
    localDeliveryTime: configuration.homeDeliveryTime || null,
    distanceMiles,
    coverageCenterPostalCode: rule.postalCode,
    manualReviewRequired: result.manualReviewRequired || !timingConfigured,
    messages: timingConfigured ? result.messages : [...result.messages, 'local_delivery_time_not_configured'],
  }
}

async function validateAddress(destination: Destination, address: Address, kitCount: number, localFulfillment: LocalFulfillment | null): Promise<Verification> {
  const coverageRule = localRule(destination)
  const finish = (verification: Verification): Verification => coverageRule
    ? { ...verification, coverageCenterPostalCode: coverageRule.postalCode }
    : verification
  if (isLocal(destination) && !localFulfillment) return finish(baseVerification(address, { status: 'incomplete', provider: 'local_rules', messages: ['local_fulfillment_required'], manualReviewRequired: false }))
  if (isLocal(destination) && localFulfillment === 'pickup') return validatePickup(destination, address)
  const errors = essentialErrors(address, destination)
  if (errors.length) {
    const outsideLocalCity = errors.includes('local_city_mismatch')
    return finish(baseVerification(address, {
      status: outsideLocalCity ? 'out_of_coverage' : 'incomplete',
      provider: outsideLocalCity ? 'local_rules' : 'unavailable',
      messages: errors,
      manualReviewRequired: false,
    }))
  }

  const apiKey = Deno.env.get('EASYPOST_API_KEY') || ''
  if (!apiKey) return finish(baseVerification(address, { status: 'provider_unavailable', messages: ['provider_not_configured'] }))

  const street2 = [address.neighborhood ? `Col. ${address.neighborhood}` : '', address.line2].filter(Boolean).join(', ')
  let providerResult: Awaited<ReturnType<typeof easyPostRequest>>
  try {
    providerResult = await easyPostRequest('addresses', apiKey, {
      address: {
        street1: providerStreet1(address),
        street2,
        city: address.city,
        state: address.state,
        zip: address.postalCode,
        country: address.country,
      },
      verify: true,
    })
  } catch {
    return finish(baseVerification(address, { status: 'provider_unavailable', messages: ['provider_timeout'] }))
  }

  if (!providerResult.ok) {
    const messages = providerErrorMessages(providerResult.payload)
    return finish(baseVerification(address, {
      status: providerIsUnavailable(messages) ? 'provider_unavailable' : 'undeliverable',
      provider: 'easypost',
      messages: messages.length ? messages : ['address_not_verified'],
      manualReviewRequired: providerIsUnavailable(messages),
    }))
  }

  const recommended = providerAddressToAddress(providerResult.payload, address)
  const verifications = providerResult.payload.verifications && typeof providerResult.payload.verifications === 'object'
    ? providerResult.payload.verifications as Record<string, unknown>
    : {}
  const delivery = verifications.delivery && typeof verifications.delivery === 'object' ? verifications.delivery as Record<string, unknown> : null
  const verified = delivery?.success === true
  const verificationErrors = Array.isArray(delivery?.errors)
    ? (delivery.errors as unknown[]).flatMap((value) => value && typeof value === 'object' ? [text((value as Record<string, unknown>).code)].filter(Boolean) : [])
    : []

  if (!verified) {
    const internationalNeedsReview = address.country !== 'US' && !delivery
    return finish(baseVerification(address, {
      status: internationalNeedsReview ? 'manual_review' : 'undeliverable',
      provider: 'easypost',
      recommendedAddress: recommended,
      messages: verificationErrors.length ? verificationErrors : [internationalNeedsReview ? 'international_verification_inconclusive' : 'address_not_deliverable'],
      verificationId: text(providerResult.payload.id) || null,
      manualReviewRequired: internationalNeedsReview,
    }))
  }

  const rateResult = isLocal(destination) ? { rates: [] as Rate[], configured: true } : await fetchRates(apiKey, providerResult.payload, kitCount, destination)
  const corrected = addressesDiffer(address, recommended)
  let result: Verification = baseVerification(address, {
    status: corrected ? 'corrected' : 'verified',
    provider: 'easypost',
    recommendedAddress: recommended,
    messages: [],
    rates: rateResult.rates,
    verificationId: text(providerResult.payload.id) || null,
    manualReviewRequired: destination === 'international' || (!isLocal(destination) && (!rateResult.configured || !rateResult.rates.length)),
    deliverable: true,
  })
  if (result.manualReviewRequired) result.messages.push(destination === 'international' ? 'international_quote_required' : 'live_rates_unavailable')
  if (isLocal(destination)) result = applyLocalCoverage(result, destination, verifiedCoordinates(delivery))
  return finish(result)
}

function getSecretKey() {
  const legacy = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (legacy) return legacy
  try {
    const keys = JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS') || '{}') as Record<string, string>
    return keys.default || ''
  } catch {
    return ''
  }
}

function generateReference() {
  const bytes = new Uint16Array(1)
  crypto.getRandomValues(bytes)
  return `ORD-${String(1000 + (bytes[0] % 9000)).padStart(4, '0')}`
}

function selectedAddress(input: Record<string, unknown>, verification: Verification) {
  return input.addressChoice === 'recommended' && verification.recommendedAddress ? verification.recommendedAddress : verification.originalAddress
}

function selectedRateMatches(input: Record<string, unknown>, verification: Verification) {
  const selected = input.selectedRate && typeof input.selectedRate === 'object' ? input.selectedRate as Record<string, unknown> : null
  if (!selected) return null
  return verification.rates.find((rate) =>
    normalize(rate.carrier) === normalize(text(selected.carrier)) &&
    normalize(rate.service) === normalize(text(selected.service)) &&
    rate.amountCents === Number(selected.amountCents),
  ) || null
}

function packSizeFromSku(value: unknown) {
  const match = text(value).toUpperCase().match(/-(VIAL-ONLY|COMPLETE-KIT|MULTIPACK)-(\d+)(?:-KIT)?$/)
  if (!match) return 0
  const size = Number(match[2])
  if (match[1] === 'MULTIPACK') return [2, 3, 5].includes(size) ? size : 0
  return size === 1 ? 1 : 0
}

function inventorySkuFromQuoteSku(value: unknown) {
  return text(value).toUpperCase().replace(/-(VIAL-ONLY|COMPLETE-KIT|MULTIPACK)-\d+(?:-KIT)?$/, '')
}

async function createOrder(body: Record<string, unknown>, origin: string | null) {
  const destination = text(body.destination) as Destination
  const localFulfillment = ['pickup', 'home_delivery'].includes(text(body.localFulfillment)) ? text(body.localFulfillment) as LocalFulfillment : null
  const address = sanitizeAddress(body.address)
  const items = Array.isArray(body.items) ? body.items : []
  const kitCount = Math.min(999, items.reduce((count, value) => {
    if (!value || typeof value !== 'object') return count
    const item = value as Record<string, unknown>
    const quantity = Math.max(1, Math.min(99, Math.floor(Number(item.quantity) || 1)))
    return count + packSizeFromSku(item.sku) * quantity
  }, 0))
  if (!['us', 'mexico', 'local_el_paso', 'local_juarez', 'local_chihuahua', 'international'].includes(destination) || !items.length || !kitCount) {
    return response({ code: 'invalid_order_request' }, 400, origin)
  }
  if (Math.floor(Number(body.kitCount) || 0) !== kitCount) return response({ code: 'cart_quantity_mismatch' }, 409, origin)
  if (body.destinationAcknowledged !== true) return response({ code: 'destination_acknowledgment_required' }, 422, origin)
  const contact = body.contact && typeof body.contact === 'object' ? body.contact as Record<string, unknown> : {}
  if (!text(contact.name) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text(contact.email)) || text(contact.phone).replace(/\D/g, '').length < 7) {
    return response({ code: 'contact_information_incomplete' }, 422, origin)
  }

  const verification = await validateAddress(destination, address, kitCount, localFulfillment)
  const manualRequested = body.manualReviewRequested === true
  const canRequestManualReview = ['provider_unavailable', 'manual_review', 'undeliverable', 'out_of_coverage'].includes(verification.status)
  if (!verification.deliverable && !(manualRequested && canRequestManualReview) && !verification.manualReviewRequired) {
    return response({ code: 'address_not_deliverable', verification }, 422, origin)
  }
  if (verification.status === 'corrected' && !['recommended', 'original'].includes(text(body.addressChoice))) {
    return response({ code: 'address_choice_required', verification }, 422, origin)
  }

  const matchedRate = selectedRateMatches(body, verification)
  const localReady = isLocal(destination) && verification.localDeliveryFeeCents !== null && Boolean(verification.localDeliveryTime)
  const transportReady = destination === 'mexico' ? Boolean(matchedRate) : isLocal(destination) ? localReady : destination === 'international' ? false : Boolean(matchedRate)
  const reviewRequired = manualRequested || verification.manualReviewRequired || !transportReady || !verification.deliverable
  if (!reviewRequired && !matchedRate && !localReady) return response({ code: 'shipping_rate_changed', verification }, 409, origin)

  const safeItems = items.slice(0, 50).flatMap((value) => {
    if (!value || typeof value !== 'object') return []
    const item = value as Record<string, unknown>
    const quantity = Math.max(1, Math.min(99, Math.floor(Number(item.quantity) || 1)))
    const unitPriceCents = Math.max(0, Math.min(10_000_000, Math.round(Number(item.unit_price_cents) || 0)))
    const requestedLineTotal = Math.round(Number(item.line_total_cents) || 0)
    const lineTotalCents = Math.max(unitPriceCents * quantity, Math.min(100_000_000, requestedLineTotal))
    if (!text(item.sku) || !text(item.product)) return []
    return [{ ...item, quantity, unit_price_cents: unitPriceCents, line_total_cents: lineTotalCents }]
  })
  if (!safeItems.length) return response({ code: 'invalid_order_items' }, 400, origin)
  const subtotalCents = safeItems.reduce((sum, item) => sum + Number(item.line_total_cents), 0)
  const importFeeCents = usesMexicoImportFee(destination) ? (kitCount >= 5 ? 5_000 : 2_500) : 0
  const shippingCents = destination === 'mexico' ? 1_500 : isLocal(destination) ? verification.localDeliveryFeeCents : matchedRate?.amountCents ?? null
  const totalCents = shippingCents === null ? null : subtotalCents + importFeeCents + shippingCents
  const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
  const secretKey = getSecretKey()
  if (!supabaseUrl || !secretKey) return response({ code: 'order_store_unavailable' }, 503, origin)
  const client = createClient(supabaseUrl, secretKey, { auth: { persistSession: false } })

  // Repeat availability validation on the trusted server. Exact balances never
  // leave this function, and forged client requests cannot order inactive or
  // insufficient SKUs. Confirmed-order reservations remain atomic in Postgres.
  const requiredBySku = new Map<string, number>()
  for (const item of safeItems) {
    const sku = inventorySkuFromQuoteSku(item.sku)
    const units = packSizeFromSku(item.sku) * Number(item.quantity)
    requiredBySku.set(sku, (requiredBySku.get(sku) || 0) + units)
  }
  const { data: inventoryRows, error: inventoryError } = await client.from('inventory_variants')
    .select('sku,on_hand,reserved,allow_backorder,active,inventory_products!inner(active)')
    .in('sku', [...requiredBySku.keys()])
  if (inventoryError) return response({ code: 'inventory_check_unavailable' }, 503, origin)
  const inventoryBySku = new Map((inventoryRows || []).map((row) => [row.sku, row]))
  for (const [sku, required] of requiredBySku) {
    const row = inventoryBySku.get(sku) as { on_hand: number; reserved: number; allow_backorder: boolean; active: boolean; inventory_products: { active: boolean } | { active: boolean }[] } | undefined
    const productActive = Array.isArray(row?.inventory_products) ? row?.inventory_products[0]?.active : row?.inventory_products?.active
    if (!row || !row.active || !productActive || (!row.allow_backorder && row.on_hand - row.reserved < required)) {
      return response({ code: 'inventory_unavailable', sku }, 409, origin)
    }
  }

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const reference = generateReference()
    const { error } = await client.from('storefront_orders').insert({
      order_reference: reference,
      status: reviewRequired ? (destination === 'international' ? 'quote_pending' : 'review_required') : 'pending_payment',
      channel: text(body.channel) === 'instagram' ? 'instagram' : 'whatsapp',
      payment_method: reviewRequired ? 'manual_review' : text(body.paymentMethod),
      items: safeItems,
      subtotal_cents: subtotalCents,
      import_fee_cents: importFeeCents,
      shipping_cents: shippingCents,
      total_cents: totalCents,
      locale: text(body.locale) === 'es' ? 'es' : 'en',
      contact,
      destination_type: destination,
      local_fulfillment_method: isLocal(destination) ? localFulfillment : null,
      delivery_distance_miles: verification.distanceMiles,
      original_address: address,
      validated_address: verification.recommendedAddress || verification.originalAddress,
      selected_address: selectedAddress(body, verification),
      address_choice: text(body.addressChoice) || null,
      address_verification: { ...verification, pricing_revalidation: 'manual_catalog_review_required' },
      shipping_service: matchedRate || (localReady ? { carrier: localFulfillment === 'pickup' ? 'Encore Distribution Point' : 'Encore Local Delivery', service: verification.localDeliveryTime, amountCents: verification.localDeliveryFeeCents, currency: 'USD' } : null),
      shipping_review_required: reviewRequired,
      destination_acknowledged: body.destinationAcknowledged === true,
    })
    if (!error) return response({ reference, subtotalCents, importFeeCents, shippingCents, totalCents, recorded: true, reviewRequired, verification }, 200, origin)
    if (error.code !== '23505') return response({ code: 'order_store_unavailable' }, 503, origin)
  }
  return response({ code: 'order_reference_collision' }, 503, origin)
}

Deno.serve(async (request) => {
  const origin = request.headers.get('origin')
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders(origin) })
  if (request.method !== 'POST') return response({ code: 'method_not_allowed' }, 405, origin)
  const allowedOrigins = (Deno.env.get('STOREFRONT_ALLOWED_ORIGINS') || '').split(',').map((value) => value.trim()).filter(Boolean)
  if (origin && allowedOrigins.length && !allowedOrigins.includes(origin)) return response({ code: 'origin_not_allowed' }, 403, origin)

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return response({ code: 'invalid_json' }, 400, origin)
  }
  const destination = text(body.destination) as Destination
  if (!['us', 'mexico', 'local_el_paso', 'local_juarez', 'local_chihuahua', 'international'].includes(destination)) {
    return response({ code: 'invalid_destination' }, 400, origin)
  }
  if (body.action === 'create_order') return createOrder(body, origin)
  if (body.action !== 'validate') return response({ code: 'invalid_action' }, 400, origin)

  const address = sanitizeAddress(body.address)
  const kitCount = Math.max(0, Math.min(999, Math.floor(Number(body.kitCount) || 0)))
  const localFulfillment = ['pickup', 'home_delivery'].includes(text(body.localFulfillment)) ? text(body.localFulfillment) as LocalFulfillment : null
  return response(await validateAddress(destination, address, kitCount, localFulfillment), 200, origin)
})
