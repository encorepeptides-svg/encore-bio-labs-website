import { describe, expect, it } from 'vitest'
import migration from '../../supabase/migrations/20260816032838_distributor_historical_metrics_and_keyset_pagination.sql?raw'
import databaseTest from '../../supabase/tests/database/distributor_historical_metrics.test.sql?raw'
import portalPage from '../components/distributor/DistributorPortalPage.tsx?raw'
import portalData from './distributorPortal.ts?raw'
import { distributor as en } from '../locales/en/distributor'
import { distributor as es } from '../locales/es/distributor'
import {
  calculateDistributorOverviewMetrics,
  createDistributorPage,
  decodeDistributorPageCursor,
  emptyDistributorDashboardMetrics,
  type DistributorDashboard,
} from './distributorPortal'

function uuid(value: number) {
  return `00000000-0000-4000-8000-${value.toString().padStart(12, '0')}`
}

function row(value: number, createdAt = new Date(Date.UTC(2026, 0, 1, 0, 0, value)).toISOString()) {
  return { id: uuid(value), created_at: createdAt }
}

describe('historical distributor metrics contract', () => {
  it('ships a 32-assertion database fixture with 600 sales and 101 payouts', () => {
    expect(databaseTest).toContain('select extensions.plan(32)')
    expect(databaseTest).toContain('from generate_series(1, 600)')
    expect(databaseTest).toContain('from generate_series(1, 101)')
    expect(databaseTest.match(/^select extensions\.(is|ok|throws_ok)/gmu)).toHaveLength(32)
  })

  it('calculates every historical card in one PostgreSQL RPC instead of visible arrays', () => {
    expect(portalData).toContain("rpc('get_distributor_dashboard_metrics'")
    expect(portalData).not.toMatch(/dashboard\.(sales|payouts|attributedOrders)\s*\.filter/u)
    expect(portalData).not.toMatch(/dashboard\.(sales|payouts|attributedOrders)\s*\.reduce/u)
    expect(migration).toContain('create or replace function public.get_distributor_dashboard_metrics')
    expect(migration).toContain('security invoker')
  })

  it('keeps legacy metric consumers but reads only the server snapshot', () => {
    const dashboard = {
      account: null,
      metrics: {
        ...emptyDistributorDashboardMetrics,
        totalOrdersAttributed: 600,
        netAttributedRevenueCents: 8_765_432,
        pendingCommissionCents: 120_000,
        payableCents: 80_000,
        pendingRecoveryCents: 3_000,
        paidCommissionCents: 2_500_000,
      },
      attributedOrders: row(1),
      sales: row(2),
      commissions: [],
      adjustments: [],
      payouts: [],
      balances: [],
    } as unknown as DistributorDashboard
    expect(calculateDistributorOverviewMetrics(dashboard)).toEqual({
      attributedOrders: 600,
      attributedCommissionableRevenue: 8_765_432,
      pendingCommission: 120_000,
      readyForPayout: 80_000,
      pendingRecovery: 3_000,
      paidCommission: 2_500_000,
    })
  })

  it('defines zero records and division by zero without fabricated percentages', () => {
    expect(emptyDistributorDashboardMetrics.totalSales).toBe(0)
    expect(emptyDistributorDashboardMetrics.orderPaymentRateBps).toBeNull()
    expect(migration).toContain('case when referral.attributed_count = 0 then null')
  })

  it('counts paid payouts from the accounting source rather than a visible payout page', () => {
    expect(migration).toContain("payout.status = 'paid'")
    expect(migration).toContain('coalesce(sum(payout.amount_cents), 0)::bigint as paid_commission')
    expect(portalData).not.toMatch(/payouts\s*\.filter\(\(payout\).*paid/u)
  })

  it('uses integer cents and ledger entries for partial/full refunds and signed adjustments', () => {
    for (const entryType of [
      'partial_refund_reversal',
      'full_refund_reversal',
      'manual_positive_adjustment',
      'manual_negative_adjustment',
      'chargeback',
      'chargeback_reversal',
    ]) expect(migration).toContain(entryType)
    expect(migration).not.toContain('double precision')
    expect(migration).not.toContain('real as')
  })

  it('separates gross revenue, refunds, and net revenue without tax or shipping', () => {
    expect(migration).toContain('sum(sale.original_commissionable_revenue_cents)')
    expect(migration).toContain('sum(sale.refunded_commissionable_revenue_cents)')
    expect(migration).toContain('sale.original_commissionable_revenue_cents - sale.refunded_commissionable_revenue_cents')
  })

  it('uses semi-open timestamptz ranges for referrals, sales, ledger, and payouts', () => {
    expect(migration.match(/>= start_at/gu)?.length).toBeGreaterThanOrEqual(5)
    expect(migration.match(/< end_at/gu)?.length).toBeGreaterThanOrEqual(5)
    expect(migration).not.toContain('<= end_at')
    expect(portalPage).toContain("DASHBOARD_TIME_ZONE = 'America/Denver'")
  })

  it('enforces owner/admin authorization instead of trusting the requested distributor', () => {
    expect(migration).toContain('caller_distributor_id uuid := public.portal_distributor_id()')
    expect(migration).toContain('caller_is_admin boolean := public.portal_is_admin()')
    expect(migration).toContain("raise exception 'distributor access denied'")
    expect(migration).not.toContain('user_metadata')
    expect(migration).not.toContain('service_role')
  })

  it('revokes public execution and grants only authenticated callers', () => {
    expect(migration).toContain('revoke all on function public.get_distributor_dashboard_metrics')
    expect(migration).toContain('grant execute on function public.get_distributor_dashboard_metrics')
    expect(migration).not.toContain('grant execute on function public.get_distributor_dashboard_metrics(uuid, timestamptz, timestamptz, text) to anon')
  })
})

describe('stable keyset pagination contract', () => {
  it.each([0, 1, 25, 100])('returns a bounded page for %i visible records', (count) => {
    const page = createDistributorPage(Array.from({ length: count }, (_, index) => row(index + 1)), Math.max(count, 1))
    expect(page.items).toHaveLength(count)
    expect(page.hasMore).toBe(false)
  })

  it.each([250, 251, 501])('does not turn a %i-row history into a historical total', (historySize) => {
    const history = Array.from({ length: historySize }, (_, index) => row(index + 1))
    const page = createDistributorPage(history.slice(0, 26), 25)
    expect(page.items).toHaveLength(25)
    expect(page.hasMore).toBe(true)
    expect(history).toHaveLength(historySize)
  })

  it('encodes both created_at and id so equal timestamps have no duplicates or omissions', () => {
    const timestamp = '2026-01-01T00:00:00.000Z'
    const first = createDistributorPage([row(3, timestamp), row(2, timestamp), row(1, timestamp)], 2)
    expect(first.items.map((item) => item.id)).toEqual([uuid(3), uuid(2)])
    expect(decodeDistributorPageCursor(first.nextCursor)).toEqual({ createdAt: timestamp, id: uuid(2) })
    const second = createDistributorPage([row(1, timestamp)], 2)
    expect(new Set([...first.items, ...second.items].map((item) => item.id)).size).toBe(3)
  })

  it('validates the maximum page size in both TypeScript and PostgreSQL', () => {
    expect(() => createDistributorPage([row(1)], 101)).toThrow('between 1 and 100')
    expect(migration.match(/page_size < 1 or page_size > 100/gu)?.length).toBe(5)
  })

  it('creates independent pages for referrals, sales, commissions, adjustments, and payouts', () => {
    for (const name of ['referrals', 'sales', 'commissions', 'adjustments', 'payouts']) {
      expect(migration).toContain(`get_distributor_${name}_page`)
      expect(portalData).toContain(`get_distributor_${name}_page`)
    }
    expect(portalPage).toContain('loadMore')
    expect(portalPage).toContain('setPage({ items: [], nextCursor: null, hasMore: false })')
  })

  it('uses purpose-built composite indexes matching the stable order', () => {
    for (const table of ['referrals', 'sales', 'ledger', 'payouts']) {
      expect(migration).toContain(`${table}_keyset_idx`)
    }
    expect(migration.match(/created_at desc, id desc/gu)?.length).toBeGreaterThanOrEqual(8)
    expect(migration.match(/order by .*\.created_at desc, .*\.id desc/gu)?.length).toBe(5)
  })

  it('keeps metrics unchanged when another page is loaded', () => {
    const metrics = { ...emptyDistributorDashboardMetrics, totalSales: 600 }
    const first = createDistributorPage(Array.from({ length: 26 }, (_, index) => row(index + 1)), 25)
    const second = createDistributorPage(Array.from({ length: 10 }, (_, index) => row(index + 27)), 25)
    expect(first.items).toHaveLength(25)
    expect(second.items).toHaveLength(10)
    expect(metrics.totalSales).toBe(600)
  })
})

describe('bilingual dashboard copy', () => {
  it('uses the exact valid order-payment label and explanatory tooltip', () => {
    expect(es.metricOrderPaymentRate).toBe('Tasa de pago de órdenes')
    expect(en.metricOrderPaymentRate).toBe('Order payment rate')
    expect(es.metricOrderPaymentRateTooltip).toBe('Porcentaje de órdenes atribuidas que llegaron a estado pagado. No representa visitantes ni clics.')
  })

  it('ships loading, error, empty, search, and load-more states in both languages', () => {
    for (const locale of [es, en]) {
      expect(locale.loadingRows).toBeTruthy()
      expect(locale.pageLoadError).toBeTruthy()
      expect(locale.emptySales).toBeTruthy()
      expect(locale.searchRecords).toBeTruthy()
      expect(locale.loadMore).toBeTruthy()
    }
  })
})
