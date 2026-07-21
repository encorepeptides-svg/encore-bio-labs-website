import { describe, expect, it } from 'vitest'
import {
  addressEssentialErrors,
  addressesDiffer,
  calculateMexicoImportFeeCents,
  calculateShippingCharges,
  destinationUsesMexicoImportFee,
  emptyShippingAddress,
  isPoBoxAddress,
  localDestinationIdentityMatches,
  localPostalCodeCovered,
  shippingSelectionAllowsPayment,
  verifyShippingAddress,
  type AddressVerificationResult,
  type ShippingAddress,
  type ShippingSelection,
} from './shipping'

const elPaso: ShippingAddress = {
  country: 'US', state: 'TX', city: 'El Paso', neighborhood: '', postalCode: '79901', street: 'North Oregon Street', streetNumber: '500', line2: 'Suite 2',
}

const verified: AddressVerificationResult = {
  status: 'verified', provider: 'easypost', originalAddress: elPaso, recommendedAddress: elPaso, messages: [],
  rates: [{ id: 'rate_1', carrier: 'USPS', service: 'Priority', amountCents: 1299, currency: 'USD', deliveryDays: 2, deliveryDate: null }],
  localDeliveryFeeCents: null, localDeliveryTime: null, verificationId: 'adr_1', checkedAt: '2026-07-20T00:00:00.000Z', manualReviewRequired: false, deliverable: true,
}

function selection(overrides: Partial<ShippingSelection> = {}): ShippingSelection {
  return { destination: 'us', address: elPaso, kitCount: 1, verification: verified, addressChoice: null, selectedRateId: 'rate_1', manualReviewRequested: false, destinationAcknowledged: true, ...overrides }
}

describe('shipping address validation and coverage', () => {
  it('accepts a complete U.S. address and rejects incomplete essentials', () => {
    expect(addressEssentialErrors(elPaso, 'us')).toEqual([])
    expect(addressEssentialErrors({ ...elPaso, streetNumber: '', state: '' }, 'us')).toEqual(expect.arrayContaining(['street_number', 'state']))
  })

  it('detects invalid U.S. and Mexico postal codes', () => {
    expect(addressEssentialErrors({ ...elPaso, postalCode: '7990' }, 'us')).toContain('postal_code_invalid')
    const juarez = { ...elPaso, country: 'MX', state: 'Chihuahua', city: 'Ciudad Juárez', neighborhood: 'Centro', postalCode: '3200' }
    expect(addressEssentialErrors(juarez, 'mexico')).toContain('postal_code_invalid')
  })

  it('flags misspelled provider corrections without silently replacing the original', () => {
    const misspelled = { ...elPaso, street: 'N Oregn Stret' }
    expect(addressesDiffer(misspelled, elPaso)).toBe(true)
    expect(misspelled.street).toBe('N Oregn Stret')
  })

  it('detects P.O. boxes and rejects them for local hand delivery', () => {
    const poBox = { ...elPaso, street: 'P.O. Box', streetNumber: '210' }
    expect(isPoBoxAddress(poBox)).toBe(true)
    expect(addressEssentialErrors(poBox, 'local_el_paso')).toContain('po_box_local')
  })

  it('confirms exact local-city identity and rejects nearby addresses outside the selected city', () => {
    expect(localDestinationIdentityMatches(elPaso, 'local_el_paso')).toBe(true)
    const juarez = { ...elPaso, country: 'MX', state: 'Chihuahua', city: 'Ciudad Juárez', neighborhood: 'Centro', postalCode: '32000' }
    const chihuahua = { ...juarez, city: 'Chihuahua', postalCode: '31000' }
    expect(localDestinationIdentityMatches(juarez, 'local_juarez')).toBe(true)
    expect(localDestinationIdentityMatches(chihuahua, 'local_chihuahua')).toBe(true)
    const sunlandPark = { ...elPaso, city: 'Sunland Park', state: 'NM', postalCode: '88063' }
    expect(localDestinationIdentityMatches(sunlandPark, 'local_el_paso')).toBe(false)
    expect(addressEssentialErrors(sunlandPark, 'local_el_paso')).toContain('local_city_mismatch')
  })

  it('classifies a nearby local address as outside coverage before calling the carrier', async () => {
    const sunlandPark = { ...elPaso, city: 'Sunland Park', state: 'NM', postalCode: '88063' }
    const result = await verifyShippingAddress({ destination: 'local_el_paso', address: sunlandPark, kitCount: 1 })
    expect(result).toMatchObject({ status: 'out_of_coverage', provider: 'local_rules', deliverable: false })
  })

  it('rejects a nearby postal code that is outside the configured local zone', () => {
    expect(localPostalCodeCovered('79901', ['79901', '79902'])).toBe(true)
    expect(localPostalCodeCovered('79936', ['79901', '79902'])).toBe(false)
  })

  it('requires a colonia for Mexico while keeping it optional in the United States', () => {
    expect(addressEssentialErrors(elPaso, 'us')).not.toContain('neighborhood')
    const mexico = { ...elPaso, country: 'MX', state: 'Chihuahua', city: 'Chihuahua', postalCode: '31000', neighborhood: '' }
    expect(addressEssentialErrors(mexico, 'mexico')).toContain('neighborhood')
  })
})

describe('server-mirrored charges and payment gates', () => {
  it.each([[1, 2500], [4, 2500], [5, 5000], [8, 5000]])('calculates the Mexico import fee for %i kits', (kits, expected) => {
    expect(calculateMexicoImportFeeCents(kits)).toBe(expected)
  })

  it('applies the Mexico import fee to shipped and local Mexico destinations only', () => {
    expect(destinationUsesMexicoImportFee('mexico')).toBe(true)
    expect(destinationUsesMexicoImportFee('local_juarez')).toBe(true)
    expect(destinationUsesMexicoImportFee('local_chihuahua')).toBe(true)
    expect(destinationUsesMexicoImportFee('local_el_paso')).toBe(false)
    expect(destinationUsesMexicoImportFee('us')).toBe(false)
  })

  it('applies the supplied Mexico shipping rule and recomputes the final total', () => {
    expect(calculateShippingCharges({ destination: 'mexico', kitCount: 4, subtotalCents: 20_000, selectedRate: verified.rates[0], localDeliveryFeeCents: null })).toEqual({ importFeeCents: 2500, shippingCents: 1500, totalCents: 24_000 })
    expect(calculateShippingCharges({ destination: 'mexico', kitCount: 5, subtotalCents: 20_000, selectedRate: verified.rates[0], localDeliveryFeeCents: null }).totalCents).toBe(26_500)
  })

  it('does not invent local charges when the zone fee is not configured', () => {
    expect(calculateShippingCharges({ destination: 'local_el_paso', kitCount: 1, subtotalCents: 10_000, selectedRate: null, localDeliveryFeeCents: null })).toEqual({ importFeeCents: 0, shippingCents: null, totalCents: null })
    expect(calculateShippingCharges({ destination: 'local_juarez', kitCount: 4, subtotalCents: 10_000, selectedRate: null, localDeliveryFeeCents: null })).toEqual({ importFeeCents: 2500, shippingCents: null, totalCents: null })
  })

  it('combines the import fee with a configured local Mexico delivery charge', () => {
    expect(calculateShippingCharges({ destination: 'local_chihuahua', kitCount: 5, subtotalCents: 20_000, selectedRate: null, localDeliveryFeeCents: 1000 })).toEqual({ importFeeCents: 5000, shippingCents: 1000, totalCents: 26_000 })
  })

  it('blocks payment for provider downtime, manual review, and unaccepted destination details', () => {
    expect(shippingSelectionAllowsPayment(selection())).toBe(true)
    expect(shippingSelectionAllowsPayment(selection({ destinationAcknowledged: false }))).toBe(false)
    expect(shippingSelectionAllowsPayment(selection({ manualReviewRequested: true }))).toBe(false)
    expect(shippingSelectionAllowsPayment(selection({ verification: { ...verified, status: 'provider_unavailable', rates: [], manualReviewRequired: true, deliverable: false } }))).toBe(false)
  })

  it('starts an empty international address without assuming a country', () => {
    expect(emptyShippingAddress('')).toMatchObject({ country: '', street: '', postalCode: '' })
  })
})
