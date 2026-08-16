import { describe, expect, it } from 'vitest'
import portalPage from '../components/distributor/DistributorPortalPage.tsx?raw'
import adminPage from '../components/distributor/DistributorAdminPage.tsx?raw'
import portalData from './distributorPortal.ts?raw'
import instrumentation from '../../docs/distributor-funnel-instrumentation.md?raw'
import phaseOneMigration from '../../supabase/migrations/20260812203548_distributor_portal_phase1.sql?raw'
import { distributor as en } from '../locales/en/distributor'
import { distributor as es } from '../locales/es/distributor'
import {
  calculateDistributorAdminOverviewMetrics,
  calculateDistributorOverviewMetrics,
  emptyDistributorDashboardMetrics,
  type DistributorAdminData,
  type DistributorDashboard,
} from './distributorPortal'

const dashboard = {
  account: null,
  metrics: {
    ...emptyDistributorDashboardMetrics,
    activeDistributorsCount: 1,
    totalOrdersAttributed: 2,
    totalSales: 1,
    netAttributedRevenueCents: 10_000,
    pendingCommissionCents: 1_500,
    payableCents: 600,
    pendingRecoveryCents: 300,
    paidCommissionCents: 1_000,
  },
  attributedOrders: [
    { id: 'ref-1', storefront_order_id: 'order-1' },
    { id: 'ref-2', storefront_order_id: 'order-2' },
  ],
  sales: [
    { id: 'sale-1', status: 'paid', original_commissionable_revenue_cents: 10_000 },
    { id: 'sale-2', status: 'voided', original_commissionable_revenue_cents: 5_000 },
  ],
  payouts: [
    { id: 'payout-1', status: 'paid', amount_cents: 1_000 },
    { id: 'payout-2', status: 'draft', amount_cents: 5_000 },
  ],
  adjustments: [],
  balances: [{ net_commission_cents: 2_500, payable_cents: 600, pending_recovery_cents: 300 }],
} as unknown as DistributorDashboard

describe('distributor portal funnel removal', () => {
  it('removes the funnel from the distributor dashboard render path', () => {
    expect(portalPage).not.toContain('function Funnel')
    expect(portalPage).not.toContain("t('funnelTitle')")
    expect(portalPage).not.toContain('converted / total')
  })

  it('does not expose funnel or qualification stages in the admin portal', () => {
    expect(adminPage).not.toMatch(/funnel|qualified|conversion/i)
    expect(adminPage).toContain("t('adminAttributedOrders')")
  })

  it('does not show a conversion percentage derived from attributed orders', () => {
    expect(portalPage).not.toContain('Math.round')
    expect(portalPage).not.toContain("'%'")
    expect(en).not.toHaveProperty('funnelRate')
    expect(es).not.toHaveProperty('funnelRate')
  })

  it('uses precise attributed-order labels in English and Spanish', () => {
    expect(en.metricAttributedOrders).toBe('Attributed orders')
    expect(es.metricAttributedOrders).toBe('Órdenes atribuidas')
    expect(en.adminAttributedOrders).toBe('Attributed orders')
    expect(es.adminAttributedOrders).toBe('Órdenes atribuidas')
    expect(JSON.stringify(en)).not.toContain('Attributed inquiries')
    expect(JSON.stringify(es)).not.toContain('Solicitudes atribuidas')
  })

  it('keeps a complete responsive layout after removing the funnel', () => {
    expect(portalPage).toContain('sm:grid-cols-2 xl:grid-cols-4')
    expect(portalPage).toContain('<AttributedOrdersTable')
    expect(portalPage).not.toContain('lg:grid-cols-[.85fr_1.15fr]')
  })

  it('preserves valid distributor metric calculations', () => {
    expect(calculateDistributorOverviewMetrics(dashboard)).toEqual({
      attributedOrders: 2,
      attributedCommissionableRevenue: 10_000,
      pendingCommission: 1_500,
      readyForPayout: 600,
      pendingRecovery: 300,
      paidCommission: 1_000,
    })
  })

  it('preserves valid admin metric calculations', () => {
    const data = {
      ...dashboard,
      metrics: { ...dashboard.metrics, activeDistributorsCount: 1 },
      accounts: [{ status: 'active' }, { status: 'suspended' }],
      saleItems: [],
      refunds: [],
    } as unknown as DistributorAdminData
    expect(calculateDistributorAdminOverviewMetrics(data)).toEqual({
      activeDistributors: 1,
      attributedOrders: 2,
      outstandingCommission: 600,
      paidCommission: 1_000,
    })
  })

  it('keeps order attribution attached to actual order creation', () => {
    expect(phaseOneMigration).toContain('create trigger create_distributor_referral_after_order')
    expect(phaseOneMigration).toContain('after insert on public.storefront_orders')
    expect(phaseOneMigration).toContain('insert into public.distributor_referrals')
  })

  it('keeps commission and payout operations unchanged by this UI correction', () => {
    expect(phaseOneMigration).toContain('create or replace function public.sync_distributor_sale_from_order()')
    expect(phaseOneMigration).toContain('create or replace function public.admin_create_distributor_payout')
    expect(phaseOneMigration).toContain('create or replace function public.admin_mark_distributor_payout_paid')
  })

  it('stops querying funnel-only stage data while retaining attributed orders', () => {
    expect(portalPage).not.toContain('.stage')
    expect(portalPage).toContain('order.storefront_order_id')
    expect(portalData).not.toContain('created_at,updated_at,stage,source')
    expect(portalData).toContain("rpc('get_distributor_referrals_page'")
  })

  it('documents every event required before a real funnel can return', () => {
    for (const event of [
      'referral_link_clicked',
      'unique_visitor_recorded',
      'product_viewed',
      'checkout_started',
      'checkout_completed',
      'order_paid',
      'order_cancelled',
      'order_refunded',
    ]) expect(instrumentation).toContain(event)
    expect(instrumentation).toContain('idempotency key')
    expect(instrumentation).toContain('known bots')
  })
})
