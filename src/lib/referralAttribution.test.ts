// @vitest-environment jsdom

import { afterEach, describe, expect, it } from 'vitest'
import { normalizeReferralCode, readReferralAttribution, REFERRAL_COOKIE_NAME, storeReferralAttribution, validateAndStoreReferralCode } from './referralAttribution'

afterEach(() => {
  document.cookie = `${REFERRAL_COOKIE_NAME}=; Max-Age=0; Path=/`
})

describe('referral attribution', () => {
  it('normalizes valid codes and rejects unsafe values', () => {
    expect(normalizeReferralCode(' equipo-norte ')).toBe('EQUIPO-NORTE')
    expect(normalizeReferralCode('x')).toBeNull()
    expect(normalizeReferralCode('bad code')).toBeNull()
  })

  it('stores a server-validated first-party referral with campaign context', () => {
    const record = storeReferralAttribution({
      code: 'equipo-norte', capturedAt: new Date().toISOString(), landingPath: '/es/catalog', source: 'referral_link',
      customerDiscountRateBps: 500, customerDiscountMaxCents: 2500, utmSource: 'whatsapp', utmCampaign: 'agosto',
    })
    expect(record).toMatchObject({ code: 'EQUIPO-NORTE', landingPath: '/es/catalog', utmSource: 'whatsapp', utmCampaign: 'agosto' })
    expect(readReferralAttribution()?.code).toBe('EQUIPO-NORTE')
  })

  it('does not replace an existing attribution with an invalid server response', async () => {
    storeReferralAttribution({ code: 'VALID-123', capturedAt: new Date().toISOString(), landingPath: '/catalog', source: 'referral_link', customerDiscountRateBps: 500, customerDiscountMaxCents: 2500 })
    await validateAndStoreReferralCode('OTHER-123', async () => ({ valid: false, code: null, rateBps: 0, maxCents: 0 }), { source: 'manual_code' })
    expect(readReferralAttribution()?.code).toBe('VALID-123')
  })
})
