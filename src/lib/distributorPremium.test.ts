// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { buildPartnerUrl, csvCell, growthReportCsv, simpleReportPdf, type GrowthReportRow } from './distributorPremium'

const row: GrowthReportRow = {
  link_id: 'link-1', created_at: '2026-08-16T00:00:00Z', campaign_id: null,
  campaign_name: '=HYPERLINK("bad")', destination_path: '/catalog', channel: 'whatsapp',
  sub_id: '@unsafe', language: 'es', active: true, expires_at: null, clicks: 10,
  unique_visitors: 8, checkout_starts: 3, paid_orders: 2, net_revenue_cents: 15000,
  conversion_bps: 2500,
}

describe('premium distributor exports and links', () => {
  it('protects spreadsheet exports from formula injection', () => {
    expect(csvCell('=2+2')).toBe('"\'=2+2"')
    expect(csvCell('@command')).toBe('"\'@command"')
    expect(growthReportCsv([row], 'es')).toContain('\'=HYPERLINK')
  })

  it('builds a first-party measurable URL without exposing internal ids', () => {
    const url = new URL(buildPartnerUrl('https://encore.test', 'PARTNER25', {
      destination_path: '/products/retatrutide', language: 'es', slug: 'partnerlink',
      channel: 'whatsapp', sub_id: 'june-a',
    }, 'Summer Campaign'))
    expect(url.pathname).toBe('/es/products/retatrutide')
    expect(url.searchParams.get('ref')).toBe('PARTNER25')
    expect(url.searchParams.get('pl')).toBe('partnerlink')
    expect(url.searchParams.get('utm_medium')).toBe('partner')
    expect(url.searchParams.get('utm_campaign')).toBe('summer-campaign')
  })

  it('produces a downloadable PDF payload with no external service', async () => {
    const pdf = simpleReportPdf('Encore growth report', [row])
    expect(pdf.type).toBe('application/pdf')
    expect(await pdf.text()).toMatch(/^%PDF-1\.4/)
  })
})
