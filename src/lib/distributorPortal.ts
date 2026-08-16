import { supabase } from './supabaseClient'

export type DistributorAccountStatus = 'pending' | 'active' | 'suspended' | 'archived'
export type DistributorOnboardingState = 'draft' | 'invite_pending' | 'invited' | 'email_accepted' | 'documents_complete' | 'payment_configured' | 'approved' | 'active' | 'expired' | 'revoked' | 'rejected' | 'suspended'
export type DistributorOnboardingOutcome = 'completed' | 'already_completed' | 'pending' | 'blocked' | 'failed'
export type DistributorSaleStatus = 'pending' | 'approved' | 'in_payout' | 'paid' | 'voided' | 'reversed'
export type DistributorPayoutStatus = 'draft' | 'processing' | 'paid' | 'failed' | 'cancelled'
export type DistributorLedgerEntryType = 'commission_earned' | 'partial_refund_reversal' | 'full_refund_reversal' | 'chargeback' | 'chargeback_reversal' | 'manual_positive_adjustment' | 'manual_negative_adjustment' | 'legacy_balance'

export type DistributorAccount = {
  id: string
  user_id: string | null
  created_at: string
  email: string
  display_name: string
  referral_code: string
  status: DistributorAccountStatus
  commission_rate_bps: number
  customer_discount_rate_bps: number
  customer_discount_max_cents: number
  customer_discount_first_order_only: boolean
  customer_discount_enabled: boolean
  attribution_window_days: number
  commission_hold_days: number
  payout_minimum_cents: number
  payout_provider: string
  tax_status: string
  preferred_language: 'English' | 'Spanish'
  onboarding_status: DistributorOnboardingState
  invited_at: string | null
  email_accepted_at: string | null
  password_configured_at: string | null
  documents_completed_at: string | null
  payment_configured_at: string | null
  approved_at: string | null
  activated_at: string | null
  revoked_at: string | null
  rejected_at: string | null
  suspended_at: string | null
  status_reason: string | null
}

export type DistributorOnboardingSummary = {
  distributor_id: string
  display_name: string
  email: string
  referral_code: string
  onboarding_status: DistributorOnboardingState
  account_status: DistributorAccountStatus
  preferred_language: 'English' | 'Spanish'
  created_at: string
  invited_at: string | null
  email_accepted_at: string | null
  password_configured_at: string | null
  documents_completed_at: string | null
  payment_configured_at: string | null
  approved_at: string | null
  activated_at: string | null
  revoked_at: string | null
  rejected_at: string | null
  suspended_at: string | null
  status_reason: string | null
  invitation_id: string | null
  invitation_status: 'pending' | 'processing' | 'sent' | 'accepted' | 'failed' | 'expired' | 'revoked' | null
  sent_at: string | null
  expires_at: string | null
  last_resend_at: string | null
  resend_count: number
  invitation_error: string | null
  outbox_attempts: number | null
  outbox_status: 'pending' | 'processing' | 'completed' | 'failed' | 'blocked' | null
  outbox_error: string | null
  documents_complete_count: number
  documents_approved_count: number
  payment_provider: string | null
  payment_status: 'pending' | 'configured' | 'failed' | 'disabled' | null
  payment_last4: string | null
  payment_confirmed_at: string | null
}

export type DistributorOnboardingDocument = {
  id: string
  distributor_id: string
  invitation_id: string | null
  document_type: 'tax_form' | 'distribution_agreement'
  object_path: string
  original_filename: string
  mime_type: 'application/pdf' | 'image/jpeg' | 'image/png'
  byte_size: number
  status: 'submitted' | 'complete' | 'approved' | 'rejected'
  submitted_at: string
  completed_at: string | null
  approved_at: string | null
  rejected_at: string | null
  rejection_reason: string | null
}

export type DistributorOnboardingEvent = {
  id: string
  distributor_id: string
  invitation_id: string | null
  from_state: DistributorOnboardingState | null
  to_state: DistributorOnboardingState
  event_type: string
  source: 'admin' | 'distributor' | 'system' | 'migration' | 'provider'
  reason: string | null
  occurred_at: string
  metadata: Record<string, unknown>
}

export type DistributorOnboardingPayment = {
  distributor_id: string
  provider: string
  provider_status: 'pending' | 'configured' | 'failed' | 'disabled'
  account_last4: string | null
  confirmed_at: string | null
  last_error: string | null
}

export type DistributorOnboardingReconciliationIssue = {
  id: string
  issue_type: 'auth_orphan' | 'profile_orphan' | 'ambiguous_legacy_state' | 'invite_without_profile'
  distributor_id: string | null
  auth_user_id: string | null
  email: string | null
  detected_at: string
  status: 'open' | 'reviewed' | 'resolved' | 'ignored'
  details: Record<string, unknown>
  resolution: string | null
}

export type DistributorOnboardingData = {
  account: DistributorAccount
  invitation: Pick<DistributorOnboardingSummary, 'invitation_id' | 'invitation_status' | 'sent_at' | 'expires_at' | 'last_resend_at' | 'resend_count' | 'invitation_error' | 'outbox_attempts' | 'outbox_status' | 'outbox_error'> | null
  documents: DistributorOnboardingDocument[]
  payment: DistributorOnboardingPayment | null
  events: DistributorOnboardingEvent[]
}

export type DistributorAttributedOrder = {
  id: string
  distributor_id: string
  storefront_order_id: string
  created_at: string
  updated_at: string
  source: string
  estimated_order_value_cents: number | null
}

export type DistributorSale = {
  id: string
  distributor_id: string
  created_at: string
  paid_at: string
  hold_until: string
  order_reference: string
  currency: string
  gross_revenue_cents: number
  discount_cents: number
  discount_source: 'none' | 'volume_promotion' | 'distributor_incentive'
  distributor_discount_cents: number
  other_promotion_won: boolean
  net_commissionable_revenue_cents: number
  commission_rate_bps: number
  commission_amount_cents: number
  original_commissionable_revenue_cents: number
  original_commission_amount_cents: number
  refunded_commissionable_revenue_cents: number
  commission_reversed_cents: number
  status: DistributorSaleStatus
  ledger_net_commission_cents: number
}

export type DistributorCommissionEntry = {
  id: string
  distributor_id: string
  created_at: string
  order_reference: string | null
  entry_type: DistributorLedgerEntryType
  amount_cents: number
  currency: string
  reason_code: string
  reason: string
  recovery_status: 'not_applicable' | 'pending' | 'partial' | 'recovered'
  recovered_cents: number
  remaining_cents: number
}

export type DistributorPayout = {
  id: string
  distributor_id: string
  created_at: string
  period_start: string
  period_end: string
  currency: string
  amount_cents: number
  gross_commission_cents: number
  positive_adjustments_cents: number
  negative_adjustments_cents: number
  recoveries_applied_cents: number
  status: DistributorPayoutStatus
  provider: string
  external_reference: string | null
  paid_at: string | null
}

export type DistributorAdjustment = {
  id: string
  distributor_id: string
  created_at: string
  order_reference: string | null
  entry_type: Exclude<DistributorLedgerEntryType, 'commission_earned' | 'legacy_balance'>
  amount_cents: number
  currency: string
  reason_code: string
  reason: string
  original_payout_id: string | null
  recovery_payout_id: string | null
  recovery_status: 'not_applicable' | 'pending' | 'partial' | 'recovered'
  recovered_cents: number
  remaining_cents: number
}

export type DistributorBalance = {
  distributor_id: string
  currency: string
  gross_commission_cents: number
  refund_reversals_cents: number
  manual_adjustments_cents: number
  net_commission_cents: number
  recovered_cents: number
  pending_recovery_cents: number
  payable_cents: number
}

export type DistributorSaleItem = {
  id: string
  sale_id: string
  order_item_key: string
  sku: string | null
  product_name: string | null
  variant_name: string | null
  quantity: number
  gross_amount_cents: number
  allocated_discount_cents: number
  commissionable_amount_cents: number
  original_commission_cents: number
  refunded_commissionable_cents: number
  commission_reversed_cents: number
}

export type DistributorRefund = {
  id: string
  distributor_id: string
  storefront_order_id: string
  sale_id: string
  external_refund_id: string
  refund_event_cents: number
  refunded_total_cents: number
  commission_reversed_cents: number
  commission_remaining_cents: number
  public_reason: string
  occurred_at: string
}

export type DistributorDashboardMetrics = {
  currency: string
  activeDistributorsCount: number
  totalOrdersAttributed: number
  totalOrdersPaid: number
  totalOrdersRefunded: number
  totalSales: number
  grossAttributedRevenueCents: number
  refundsTotalCents: number
  netAttributedRevenueCents: number
  originalCommissionCents: number
  positiveAdjustmentsCents: number
  negativeAdjustmentsCents: number
  refundReversalsCents: number
  chargebackDebitsCents: number
  chargebackReversalsCents: number
  netCommissionCents: number
  pendingCommissionCents: number
  approvedCommissionCents: number
  inPayoutCommissionCents: number
  paidCommissionCents: number
  pendingRecoveryCents: number
  payableCents: number
  payoutCount: number
  lastPaidPayoutAt: string | null
  averageOrderValueCents: number | null
  orderPaymentRateBps: number | null
}

export type DistributorPageCursor = string

export type DistributorPage<T> = {
  items: T[]
  nextCursor: DistributorPageCursor | null
  hasMore: boolean
}

export type DistributorPageFilters = {
  startAt?: string | null
  endAt?: string | null
  search?: string
}

export type DistributorPageRequest = DistributorPageFilters & {
  distributorId?: string | null
  cursor?: DistributorPageCursor | null
  pageSize?: number
}

export type DistributorDashboard = {
  account: DistributorAccount | null
  metrics: DistributorDashboardMetrics
  attributedOrders: DistributorAttributedOrder[]
  sales: DistributorSale[]
  commissions: DistributorCommissionEntry[]
  payouts: DistributorPayout[]
  adjustments: DistributorAdjustment[]
  balances: DistributorBalance[]
}

export type DistributorAdminData = DistributorDashboard & {
  accounts: DistributorAccount[]
  saleItems: DistributorSaleItem[]
  refunds: DistributorRefund[]
  onboarding: DistributorOnboardingSummary[]
  onboardingDocuments: DistributorOnboardingDocument[]
  onboardingEvents: DistributorOnboardingEvent[]
  reconciliationIssues: DistributorOnboardingReconciliationIssue[]
}

export const emptyDistributorDashboardMetrics: DistributorDashboardMetrics = {
  currency: 'USD',
  activeDistributorsCount: 0,
  totalOrdersAttributed: 0,
  totalOrdersPaid: 0,
  totalOrdersRefunded: 0,
  totalSales: 0,
  grossAttributedRevenueCents: 0,
  refundsTotalCents: 0,
  netAttributedRevenueCents: 0,
  originalCommissionCents: 0,
  positiveAdjustmentsCents: 0,
  negativeAdjustmentsCents: 0,
  refundReversalsCents: 0,
  chargebackDebitsCents: 0,
  chargebackReversalsCents: 0,
  netCommissionCents: 0,
  pendingCommissionCents: 0,
  approvedCommissionCents: 0,
  inPayoutCommissionCents: 0,
  paidCommissionCents: 0,
  pendingRecoveryCents: 0,
  payableCents: 0,
  payoutCount: 0,
  lastPaidPayoutAt: null,
  averageOrderValueCents: null,
  orderPaymentRateBps: null,
}

export function calculateDistributorOverviewMetrics(dashboard: DistributorDashboard) {
  return {
    attributedOrders: dashboard.metrics.totalOrdersAttributed,
    attributedCommissionableRevenue: dashboard.metrics.netAttributedRevenueCents,
    pendingCommission: dashboard.metrics.pendingCommissionCents,
    readyForPayout: dashboard.metrics.payableCents,
    pendingRecovery: dashboard.metrics.pendingRecoveryCents,
    paidCommission: dashboard.metrics.paidCommissionCents,
  }
}

export function calculateDistributorAdminOverviewMetrics(data: DistributorAdminData) {
  return {
    activeDistributors: data.metrics.activeDistributorsCount,
    attributedOrders: data.metrics.totalOrdersAttributed,
    outstandingCommission: data.metrics.payableCents,
    paidCommission: data.metrics.paidCommissionCents,
  }
}

function requireClient() {
  if (!supabase) throw new Error('Distributor portal is not configured.')
  return supabase
}

const DISTRIBUTOR_ACCOUNT_SELECT = 'id,user_id,created_at,email,display_name,referral_code,status,commission_rate_bps,customer_discount_rate_bps,customer_discount_max_cents,customer_discount_first_order_only,customer_discount_enabled,attribution_window_days,commission_hold_days,payout_minimum_cents,payout_provider,tax_status,preferred_language,onboarding_status,invited_at,email_accepted_at,password_configured_at,documents_completed_at,payment_configured_at,approved_at,activated_at,revoked_at,rejected_at,suspended_at,status_reason'

const DEFAULT_DISTRIBUTOR_PAGE_SIZE = 25
const MAX_DISTRIBUTOR_PAGE_SIZE = 100

type KeysetRow = { id: string; created_at: string }

function encodePageCursor(row: KeysetRow): DistributorPageCursor {
  const value = `${row.created_at}|${row.id}`
  const encoded = globalThis.btoa(value)
  return encoded.replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/u, '')
}

export function decodeDistributorPageCursor(cursor: DistributorPageCursor | null | undefined) {
  if (!cursor) return { createdAt: null, id: null }
  try {
    const normalized = cursor.replaceAll('-', '+').replaceAll('_', '/')
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=')
    const decoded = globalThis.atob(padded)
    const separator = decoded.lastIndexOf('|')
    const createdAt = decoded.slice(0, separator)
    const id = decoded.slice(separator + 1)
    if (separator < 1 || Number.isNaN(Date.parse(createdAt)) || !/^[0-9a-f-]{36}$/iu.test(id)) throw new Error('invalid cursor')
    return { createdAt, id }
  } catch {
    throw new Error('Invalid distributor page cursor.')
  }
}

export function createDistributorPage<T extends KeysetRow>(rows: T[], pageSize = DEFAULT_DISTRIBUTOR_PAGE_SIZE): DistributorPage<T> {
  if (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > MAX_DISTRIBUTOR_PAGE_SIZE) throw new Error('Page size must be between 1 and 100.')
  const hasMore = rows.length > pageSize
  const items = rows.slice(0, pageSize)
  return {
    items,
    hasMore,
    nextCursor: hasMore && items.length ? encodePageCursor(items.at(-1) as T) : null,
  }
}

function pageArguments(request: DistributorPageRequest) {
  const pageSize = request.pageSize ?? DEFAULT_DISTRIBUTOR_PAGE_SIZE
  if (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > MAX_DISTRIBUTOR_PAGE_SIZE) throw new Error('Page size must be between 1 and 100.')
  const cursor = decodeDistributorPageCursor(request.cursor)
  return {
    pageSize,
    params: {
      target_distributor_id: request.distributorId ?? null,
      page_size: pageSize,
      cursor_created_at: cursor.createdAt,
      cursor_id: cursor.id,
      start_at: request.startAt ?? null,
      end_at: request.endAt ?? null,
    },
  }
}

function toNumber(value: unknown) {
  return Number(value ?? 0)
}

export async function loadDistributorDashboardMetrics(options: {
  distributorId?: string | null
  startAt?: string | null
  endAt?: string | null
  currency?: string
} = {}): Promise<DistributorDashboardMetrics> {
  const { data, error } = await requireClient().rpc('get_distributor_dashboard_metrics', {
    target_distributor_id: options.distributorId ?? null,
    start_at: options.startAt ?? null,
    end_at: options.endAt ?? null,
    metric_currency: options.currency ?? 'USD',
  })
  if (error) throw error
  const row = Array.isArray(data) ? data[0] : data
  if (!row) return { ...emptyDistributorDashboardMetrics, currency: options.currency ?? 'USD' }
  return {
    currency: String(row.currency ?? options.currency ?? 'USD'),
    activeDistributorsCount: toNumber(row.active_distributors_count),
    totalOrdersAttributed: toNumber(row.total_orders_attributed),
    totalOrdersPaid: toNumber(row.total_orders_paid),
    totalOrdersRefunded: toNumber(row.total_orders_refunded),
    totalSales: toNumber(row.total_sales),
    grossAttributedRevenueCents: toNumber(row.gross_attributed_revenue_cents),
    refundsTotalCents: toNumber(row.refunds_total_cents),
    netAttributedRevenueCents: toNumber(row.net_attributed_revenue_cents),
    originalCommissionCents: toNumber(row.original_commission_cents),
    positiveAdjustmentsCents: toNumber(row.positive_adjustments_cents),
    negativeAdjustmentsCents: toNumber(row.negative_adjustments_cents),
    refundReversalsCents: toNumber(row.refund_reversals_cents),
    chargebackDebitsCents: toNumber(row.chargeback_debits_cents),
    chargebackReversalsCents: toNumber(row.chargeback_reversals_cents),
    netCommissionCents: toNumber(row.net_commission_cents),
    pendingCommissionCents: toNumber(row.pending_commission_cents),
    approvedCommissionCents: toNumber(row.approved_commission_cents),
    inPayoutCommissionCents: toNumber(row.in_payout_commission_cents),
    paidCommissionCents: toNumber(row.paid_commission_cents),
    pendingRecoveryCents: toNumber(row.pending_recovery_cents),
    payableCents: toNumber(row.payable_cents),
    payoutCount: toNumber(row.payout_count),
    lastPaidPayoutAt: row.last_paid_payout_at ? String(row.last_paid_payout_at) : null,
    averageOrderValueCents: row.average_order_value_cents === null ? null : toNumber(row.average_order_value_cents),
    orderPaymentRateBps: row.order_payment_rate_bps === null ? null : toNumber(row.order_payment_rate_bps),
  }
}

export async function loadDistributorReferralsPage(request: DistributorPageRequest = {}): Promise<DistributorPage<DistributorAttributedOrder>> {
  const { pageSize, params } = pageArguments(request)
  const { data, error } = await requireClient().rpc('get_distributor_referrals_page', params)
  if (error) throw error
  return createDistributorPage((data ?? []) as DistributorAttributedOrder[], pageSize)
}

export async function loadDistributorSalesPage(request: DistributorPageRequest = {}): Promise<DistributorPage<DistributorSale>> {
  const { pageSize, params } = pageArguments(request)
  const { data, error } = await requireClient().rpc('get_distributor_sales_page', { ...params, search_text: request.search?.trim() || null })
  if (error) throw error
  const rows = (data ?? []).map((row: Record<string, unknown>) => ({ ...row, ledger_net_commission_cents: toNumber(row.ledger_net_commission_cents) })) as DistributorSale[]
  return createDistributorPage(rows, pageSize)
}

export async function loadDistributorCommissionsPage(request: DistributorPageRequest = {}): Promise<DistributorPage<DistributorCommissionEntry>> {
  const { pageSize, params } = pageArguments(request)
  const { data, error } = await requireClient().rpc('get_distributor_commissions_page', { ...params, search_text: request.search?.trim() || null })
  if (error) throw error
  return createDistributorPage((data ?? []) as DistributorCommissionEntry[], pageSize)
}

export async function loadDistributorAdjustmentsPage(request: DistributorPageRequest = {}): Promise<DistributorPage<DistributorAdjustment>> {
  const { pageSize, params } = pageArguments(request)
  const { data, error } = await requireClient().rpc('get_distributor_adjustments_page', { ...params, search_text: request.search?.trim() || null })
  if (error) throw error
  return createDistributorPage((data ?? []) as DistributorAdjustment[], pageSize)
}

export async function loadDistributorPayoutsPage(request: DistributorPageRequest = {}): Promise<DistributorPage<DistributorPayout>> {
  const { pageSize, params } = pageArguments(request)
  const { data, error } = await requireClient().rpc('get_distributor_payouts_page', { ...params, search_text: request.search?.trim() || null })
  if (error) throw error
  return createDistributorPage((data ?? []) as DistributorPayout[], pageSize)
}

export async function loadDistributorDashboard(userId: string): Promise<DistributorDashboard> {
  const client = requireClient()
  const { data: account, error: accountError } = await client
    .from('distributor_accounts')
    .select(DISTRIBUTOR_ACCOUNT_SELECT)
    .eq('user_id', userId)
    .maybeSingle()
  if (accountError) throw accountError
  if (!account) return { account: null, metrics: emptyDistributorDashboardMetrics, attributedOrders: [], sales: [], commissions: [], payouts: [], adjustments: [], balances: [] }

  const [metrics, balancesResult] = await Promise.all([
    loadDistributorDashboardMetrics({ distributorId: account.id }),
    client.from('distributor_commission_balances').select('distributor_id,currency,gross_commission_cents,refund_reversals_cents,manual_adjustments_cents,net_commission_cents,recovered_cents,pending_recovery_cents,payable_cents').eq('distributor_id', account.id),
  ])
  if (balancesResult.error) throw balancesResult.error
  return {
    account: account as DistributorAccount,
    metrics,
    attributedOrders: [],
    sales: [],
    commissions: [],
    payouts: [],
    adjustments: [],
    balances: (balancesResult.data ?? []) as DistributorBalance[],
  }
}

export async function loadDistributorAdminData(): Promise<DistributorAdminData> {
  const client = requireClient()
  const [accountsResult, metrics, attributedOrdersPage, salesPage, commissionsPage, payoutsPage, adjustmentsPage, balancesResult, refundsResult, onboardingResult, onboardingDocumentsResult, onboardingEventsResult, reconciliationResult] = await Promise.all([
    client.from('distributor_accounts').select(DISTRIBUTOR_ACCOUNT_SELECT).order('created_at', { ascending: false }),
    loadDistributorDashboardMetrics(),
    loadDistributorReferralsPage(),
    loadDistributorSalesPage(),
    loadDistributorCommissionsPage(),
    loadDistributorPayoutsPage(),
    loadDistributorAdjustmentsPage(),
    client.from('distributor_commission_balances').select('distributor_id,currency,gross_commission_cents,refund_reversals_cents,manual_adjustments_cents,net_commission_cents,recovered_cents,pending_recovery_cents,payable_cents'),
    client.from('distributor_refunds').select('id,distributor_id,storefront_order_id,sale_id,external_refund_id,refund_event_cents,refunded_total_cents,commission_reversed_cents,commission_remaining_cents,public_reason,occurred_at').order('occurred_at', { ascending: false }).limit(100),
    client.from('distributor_onboarding_admin_v').select('*').order('created_at', { ascending: false }),
    client.from('distributor_onboarding_documents').select('id,distributor_id,invitation_id,document_type,object_path,original_filename,mime_type,byte_size,status,submitted_at,completed_at,approved_at,rejected_at,rejection_reason').order('submitted_at', { ascending: false }).limit(1000),
    client.from('distributor_onboarding_events').select('id,distributor_id,invitation_id,from_state,to_state,event_type,source,reason,occurred_at,metadata').order('occurred_at', { ascending: false }).limit(2000),
    client.from('distributor_onboarding_reconciliation_v').select('*').order('detected_at', { ascending: false }).limit(500),
  ])
  const saleIds = salesPage.items.map((sale) => sale.id)
  const saleItemsResult = saleIds.length
    ? await client.from('distributor_sale_items').select('id,sale_id,order_item_key,sku,product_name,variant_name,quantity,gross_amount_cents,allocated_discount_cents,commissionable_amount_cents,original_commission_cents,refunded_commissionable_cents,commission_reversed_cents').in('sale_id', saleIds).order('created_at', { ascending: true })
    : { data: [], error: null }
  const firstError = accountsResult.error || balancesResult.error || saleItemsResult.error || refundsResult.error || onboardingResult.error || onboardingDocumentsResult.error || onboardingEventsResult.error || reconciliationResult.error
  if (firstError) throw firstError
  return {
    account: null,
    metrics,
    accounts: (accountsResult.data ?? []) as DistributorAccount[],
    attributedOrders: attributedOrdersPage.items,
    sales: salesPage.items,
    commissions: commissionsPage.items,
    payouts: payoutsPage.items,
    adjustments: adjustmentsPage.items,
    balances: (balancesResult.data ?? []) as DistributorBalance[],
    saleItems: (saleItemsResult.data ?? []) as DistributorSaleItem[],
    refunds: (refundsResult.data ?? []) as DistributorRefund[],
    onboarding: (onboardingResult.data ?? []) as DistributorOnboardingSummary[],
    onboardingDocuments: (onboardingDocumentsResult.data ?? []) as DistributorOnboardingDocument[],
    onboardingEvents: (onboardingEventsResult.data ?? []) as DistributorOnboardingEvent[],
    reconciliationIssues: (reconciliationResult.data ?? []) as DistributorOnboardingReconciliationIssue[],
  }
}

export async function loadDistributorOnboarding(userId: string): Promise<DistributorOnboardingData | null> {
  const client = requireClient()
  const { data: account, error: accountError } = await client
    .from('distributor_accounts')
    .select(DISTRIBUTOR_ACCOUNT_SELECT)
    .eq('user_id', userId)
    .maybeSingle()
  if (accountError) throw accountError
  if (!account) return null
  const [summaryResult, documentsResult, paymentResult, eventsResult] = await Promise.all([
    client.from('distributor_onboarding_admin_v').select('*').eq('distributor_id', account.id).maybeSingle(),
    client.from('distributor_onboarding_documents').select('id,distributor_id,invitation_id,document_type,object_path,original_filename,mime_type,byte_size,status,submitted_at,completed_at,approved_at,rejected_at,rejection_reason').eq('distributor_id', account.id).order('submitted_at', { ascending: false }),
    client.from('distributor_onboarding_payment_profiles').select('distributor_id,provider,provider_status,account_last4,confirmed_at,last_error').eq('distributor_id', account.id).maybeSingle(),
    client.from('distributor_onboarding_events').select('id,distributor_id,invitation_id,from_state,to_state,event_type,source,reason,occurred_at,metadata').eq('distributor_id', account.id).order('occurred_at', { ascending: false }).limit(250),
  ])
  const firstError = summaryResult.error || documentsResult.error || paymentResult.error || eventsResult.error
  if (firstError) throw firstError
  const summary = summaryResult.data as DistributorOnboardingSummary | null
  return {
    account: account as DistributorAccount,
    invitation: summary ? {
      invitation_id: summary.invitation_id,
      invitation_status: summary.invitation_status,
      sent_at: summary.sent_at,
      expires_at: summary.expires_at,
      last_resend_at: summary.last_resend_at,
      resend_count: summary.resend_count,
      invitation_error: summary.invitation_error,
      outbox_attempts: summary.outbox_attempts,
      outbox_status: summary.outbox_status,
      outbox_error: summary.outbox_error,
    } : null,
    documents: (documentsResult.data ?? []) as DistributorOnboardingDocument[],
    payment: paymentResult.data as DistributorOnboardingPayment | null,
    events: (eventsResult.data ?? []) as DistributorOnboardingEvent[],
  }
}

function operationKey(prefix: string) {
  return `${prefix}:${crypto.randomUUID()}`
}

export async function acceptDistributorInvitation() {
  const { data, error } = await requireClient().rpc('distributor_accept_invitation', {
    operation_idempotency_key: operationKey('accept-invitation'),
  })
  if (error) throw error
  return data as { outcome: DistributorOnboardingOutcome; reason?: string; state?: DistributorOnboardingState }
}

export async function recordDistributorPasswordConfigured() {
  const { data, error } = await requireClient().rpc('distributor_record_password_configured', {
    operation_idempotency_key: operationKey('password-configured'),
  })
  if (error) throw error
  return data as { outcome: DistributorOnboardingOutcome; reason?: string }
}

export async function uploadDistributorOnboardingDocument(accountId: string, documentType: 'tax_form' | 'distribution_agreement', file: File) {
  const client = requireClient()
  const allowed = ['application/pdf', 'image/jpeg', 'image/png']
  if (!allowed.includes(file.type)) throw new Error('Unsupported document type.')
  if (file.size < 1 || file.size > 10 * 1024 * 1024) throw new Error('Document must be 10 MB or smaller.')
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]+/g, '-').slice(-120) || 'document'
  const objectPath = `${accountId}/${crypto.randomUUID()}/${safeName}`
  const idempotencyKey = operationKey(`document-${documentType}`)
  const { error: uploadError } = await client.storage.from('distributor-onboarding-private').upload(objectPath, file, {
    contentType: file.type,
    upsert: false,
  })
  if (uploadError) throw uploadError
  const { data, error } = await client.rpc('distributor_register_onboarding_document', {
    document_kind: documentType,
    storage_object_path: objectPath,
    source_filename: file.name,
    source_mime_type: file.type,
    source_byte_size: file.size,
    operation_idempotency_key: idempotencyKey,
  })
  if (error || data?.outcome === 'blocked') {
    await client.storage.from('distributor-onboarding-private').remove([objectPath])
    if (error) throw error
    throw new Error(data?.reason || 'Document registration was blocked.')
  }
  return data as { outcome: DistributorOnboardingOutcome; document_id: string; all_required_complete: boolean }
}

export async function adminReviewDistributorDocument(documentId: string, decision: 'approved' | 'rejected', reason = '') {
  const { data, error } = await requireClient().rpc('admin_review_distributor_document', {
    target_document_id: documentId,
    review_decision: decision,
    review_reason: reason || null,
    operation_idempotency_key: operationKey(`document-${decision}`),
  })
  if (error) throw error
  return data as { outcome: DistributorOnboardingOutcome; reason?: string }
}

export async function adminConfirmDistributorPayment(input: { distributorId: string; provider: string; accountReference: string; last4: string }) {
  const { data, error } = await requireClient().rpc('admin_confirm_distributor_payment_configuration', {
    target_distributor_id: input.distributorId,
    payment_provider: input.provider,
    provider_account_reference: input.accountReference,
    account_last_four: input.last4 || null,
    operation_idempotency_key: operationKey('payment-configured'),
  })
  if (error) throw error
  return data as { outcome: DistributorOnboardingOutcome; reason?: string }
}

async function invokeDistributorOnboarding(body: Record<string, unknown>) {
  const { data, error } = await requireClient().functions.invoke('distributor-onboarding', { body })
  if (error) throw error
  if (!data) throw new Error('Distributor onboarding did not return a result.')
  return data as {
    outcome: DistributorOnboardingOutcome
    operation: { outcome: DistributorOnboardingOutcome; reason?: string; state?: DistributorOnboardingState; distributor_id?: string; invitation_id?: string }
    worker: { claimed: number; completed: number; pending: number; blocked: number }
  }
}

export async function adminResendDistributorInvitation(distributorId: string) {
  return invokeDistributorOnboarding({ action: 'resend', distributorId, idempotencyKey: operationKey('resend-invitation') })
}

export async function adminProcessDistributorOnboardingOutbox() {
  return invokeDistributorOnboarding({ action: 'process', idempotencyKey: operationKey('process-onboarding-outbox') })
}

export async function adminTransitionDistributorOnboarding(distributorId: string, transition: 'approve' | 'activate' | 'revoke' | 'reject' | 'suspend' | 'reactivate', reason = '') {
  return invokeDistributorOnboarding({ action: 'transition', distributorId, transition, reason, idempotencyKey: operationKey(`onboarding-${transition}`) })
}

export async function adminInviteDistributor(input: {
  email: string
  name: string
  code: string
  preferredLanguage: 'English' | 'Spanish'
}) {
  return invokeDistributorOnboarding({ action: 'invite', ...input, idempotencyKey: operationKey('invite-distributor') })
}

export async function adminReconcileDistributorSale(orderReference: string) {
  const { data, error } = await requireClient().rpc('admin_reconcile_distributor_sale', {
    target_order_reference: orderReference,
  })
  if (error) throw error
  return data as string
}

export async function adminCreateDistributorPayout(distributorId: string, periodStart: string, periodEnd: string) {
  const { data, error } = await requireClient().rpc('admin_create_distributor_payout', {
    target_distributor_id: distributorId,
    payout_period_start: periodStart,
    payout_period_end: periodEnd,
  })
  if (error) throw error
  return data as string
}

export async function adminMarkDistributorPayoutPaid(payoutId: string, paymentReference: string) {
  const { error } = await requireClient().rpc('admin_mark_distributor_payout_paid', {
    target_payout_id: payoutId,
    payment_reference: paymentReference,
  })
  if (error) throw error
}

export type DistributorAccountingPreview = {
  grossOrderCents?: number
  alreadyRefundedCents?: number
  refundEventCents?: number
  refundedTotalCents?: number
  remainingOrderCents?: number
  originalCommissionCents: number
  alreadyReversedCents: number
  newAdjustmentCents: number
  netCommissionCents: number
  affectedPayoutId: string | null
  pendingRecoveryCents: number
}

export type RefundItemInput = {
  order_item_id: string
  order_item_key: string
  quantity: number
  amount_cents: number
}

export async function adminPreviewDistributorRefund(orderReference: string, amountCents: number, items: RefundItemInput[]) {
  const { data, error } = await requireClient().rpc('preview_distributor_refund', {
    target_order_reference: orderReference,
    target_refund_cents: amountCents,
    target_refund_items: items,
  })
  if (error) throw error
  return data as DistributorAccountingPreview
}

export async function adminRecordDistributorRefund(input: {
  orderReference: string
  amountCents: number
  externalRefundId: string
  reasonCode: string
  publicReason: string
  internalNotes: string
  items: RefundItemInput[]
  idempotencyKey: string
}) {
  const { data, error } = await requireClient().rpc('admin_record_distributor_refund', {
    target_order_reference: input.orderReference,
    target_refund_cents: input.amountCents,
    target_external_refund_id: input.externalRefundId,
    target_reason_code: input.reasonCode,
    target_public_reason: input.publicReason,
    target_internal_notes: input.internalNotes || null,
    target_refund_items: input.items,
    target_idempotency_key: input.idempotencyKey,
  })
  if (error) throw error
  if (!data?.ok) throw new Error(data?.error || 'Refund could not be recorded.')
  return data as { ok: true; refundId: string; ledgerEntryId: string | null }
}

export async function adminPreviewDistributorAdjustment(distributorId: string, saleId: string | null, direction: 'positive' | 'negative', amountCents: number, payoutId: string | null) {
  const { data, error } = await requireClient().rpc('preview_distributor_adjustment', {
    target_distributor_id: distributorId,
    target_sale_id: saleId,
    target_direction: direction,
    target_amount_cents: amountCents,
    target_payout_id: payoutId,
  })
  if (error) throw error
  return data as DistributorAccountingPreview
}

export async function adminCreateDistributorAdjustment(input: {
  distributorId: string
  saleId: string | null
  direction: 'positive' | 'negative'
  amountCents: number
  reasonCode: string
  reason: string
  payoutId: string | null
  idempotencyKey: string
}) {
  const { data, error } = await requireClient().rpc('admin_create_distributor_adjustment', {
    target_distributor_id: input.distributorId,
    target_sale_id: input.saleId,
    target_direction: input.direction,
    target_amount_cents: input.amountCents,
    target_reason_code: input.reasonCode,
    target_reason: input.reason,
    target_payout_id: input.payoutId,
    target_idempotency_key: input.idempotencyKey,
  })
  if (error) throw error
  if (!data?.ok) throw new Error(data?.error || 'Adjustment could not be recorded.')
  return data as { ok: true; ledgerEntryId: string; amountCents: number }
}
