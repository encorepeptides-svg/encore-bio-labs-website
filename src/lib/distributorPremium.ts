import { supabase } from './supabaseClient'

export type PremiumDashboard = {
  account: { id: string; displayName: string; status: string; onboardingStatus: string; referralCode: string; commissionRateBps: number; attributionWindowDays: number; commissionHoldDays: number; payoutMinimumCents: number; taxStatus: string; countryCode: string | null; entityType: string | null }
  period: { startAt: string; endAt: string; priorStartAt: string; timeZone: string; analyticsStartedAt: string; analyticsAvailable: boolean; attributionModel: string }
  traffic: { clicks: number; uniqueClicks: number; uniqueVisitors: number; productViews: number; checkouts: number; completedCheckouts: number; paidOrders: number; visitorToCheckoutBps: number | null; checkoutToPaidBps: number | null; visitorToPaidBps: number | null; clickToPaidBps: number | null }
  trafficPrior: Record<string, number>
  commerce: { paidOrders: number; grossRevenueCents: number; refundsCents: number; netAttributedRevenueCents: number; netCommissionCents: number; averageOrderValueCents: number | null }
  commercePrior: Record<string, number>
  financial: { availableCents: number; pendingCents: number; inPayoutCents: number; pendingAdjustmentsCents: number; totalPaidCents: number; minimumCents: number; amountToMinimumCents: number; progressBps: number; nextPayoutDate: string | null; nextPayoutReason: string; paymentProvider: string | null; paymentStatus: string | null; paymentLast4: string | null; currency: string }
  onboarding: Array<{ key: string; complete: boolean; completedAt: string | null; actionPath: string; blockedReason: string | null }>
  bestProduct: Record<string, string | number> | null
  bestProductConversion: Record<string, string | number> | null
  bestCampaign: Record<string, string | number> | null
  bestChannel: Record<string, string | number> | null
  partnerManager: { displayName: string; title: string; email: string; phone: string | null; whatsapp: string | null; responseTimeEn: string; responseTimeEs: string; avatarPath: string | null } | null
  goals: Array<{ id: string; metric: string; targetValue: number; periodStart: string; periodEnd: string; status: string; reachedAt: string | null }>
  unreadNotifications: number
  openDisputes: number
  campaignCount: number
  activeLinkCount: number
  featureFlags: Record<string, boolean>
}

export type Campaign = { id: string; name: string; channel: string; language: 'en' | 'es'; status: string; starts_at: string | null; ends_at: string | null }
export type PartnerLink = { id: string; slug: string; campaign_id: string | null; destination_type: string; destination_path: string; channel: string; sub_id: string | null; language: 'en' | 'es'; active: boolean; expires_at: string | null; created_at: string }
export type GrowthAsset = { id: string; title: string; description: string | null; language: 'en' | 'es'; asset_type: string; product_id: string | null; recommended_channel: string | null; format: string | null; dimensions: string | null; version: string; object_path: string | null; preview_path: string | null; download_count: number; published_at: string }
export type ApprovedCopy = { id: string; title: string; copy_type: string; language: 'en' | 'es'; product_id: string | null; body: string; version: string; published_at: string }
export type GrowthReportRow = { link_id: string; created_at: string; campaign_id: string | null; campaign_name: string | null; destination_path: string; channel: string; sub_id: string | null; language: string; active: boolean; expires_at: string | null; clicks: number; unique_visitors: number; checkout_starts: number; paid_orders: number; net_revenue_cents: number; conversion_bps: number | null }
export type DistributorNotification = { id: string; created_at: string; notification_type: string; title_en: string; title_es: string; body_en: string; body_es: string; action_path: string | null; read_at: string | null }
export type DistributorDispute = { id: string; created_at: string; updated_at: string; sale_id: string | null; commission_ledger_id: string | null; dispute_type: string; explanation: string; evidence_due_at: string | null; status: string; public_resolution: string | null; resolved_at: string | null }
export type PayoutReceipt = { id: string; payout_id: string; receipt_number: string; created_at: string; snapshot: Record<string, unknown> }

function client() {
  if (!supabase) throw new Error('Portal data is not configured.')
  return supabase
}

export async function loadPremiumDashboard(distributorId: string, startAt?: string, endAt?: string) {
  const { data, error } = await client().rpc('get_distributor_premium_dashboard', {
    target_distributor_id: distributorId,
    start_at: startAt ?? null,
    end_at: endAt ?? null,
    metric_currency: 'USD',
  })
  if (error) throw error
  return data as PremiumDashboard
}

export async function loadGrowthCenter(distributorId: string) {
  const db = client()
  const [campaigns, links, assets, copy, report] = await Promise.all([
    db.from('distributor_campaigns').select('id,name,channel,language,status,starts_at,ends_at').eq('distributor_id', distributorId).neq('status', 'archived').order('created_at', { ascending: false }),
    db.from('distributor_partner_links').select('id,slug,campaign_id,destination_type,destination_path,channel,sub_id,language,active,expires_at,created_at').eq('distributor_id', distributorId).order('created_at', { ascending: false }).limit(100),
    db.from('distributor_growth_assets').select('id,title,description,language,asset_type,product_id,recommended_channel,format,dimensions,version,object_path,preview_path,download_count,published_at').eq('approval_status', 'approved').lte('published_at', new Date().toISOString()).or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`).order('published_at', { ascending: false }).limit(100),
    db.from('distributor_approved_copy').select('id,title,copy_type,language,product_id,body,version,published_at').eq('approval_status', 'approved').lte('published_at', new Date().toISOString()).or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`).order('published_at', { ascending: false }).limit(100),
    db.rpc('get_distributor_growth_report', { target_distributor_id: distributorId }),
  ])
  const failed = [campaigns, links, assets, copy, report].find((result) => result.error)
  if (failed?.error) throw failed.error
  return {
    campaigns: (campaigns.data ?? []) as Campaign[],
    links: (links.data ?? []) as PartnerLink[],
    assets: (assets.data ?? []) as GrowthAsset[],
    copy: (copy.data ?? []) as ApprovedCopy[],
    report: (report.data ?? []) as GrowthReportRow[],
  }
}

export async function loadGrowthReport(distributorId: string, filters: { startAt?: string; endAt?: string; channel?: string; campaignId?: string; product?: string; language?: string; active?: boolean | null } = {}) {
  const { data, error } = await client().rpc('get_distributor_growth_report', {
    target_distributor_id: distributorId,
    start_at: filters.startAt || null,
    end_at: filters.endAt || null,
    channel_filter: filters.channel || null,
    campaign_filter: filters.campaignId || null,
    product_filter: filters.product || null,
    language_filter: filters.language || null,
    active_filter: filters.active ?? null,
  })
  if (error) throw error
  return (data ?? []) as GrowthReportRow[]
}

export async function createCampaign(distributorId: string, userId: string, input: { name: string; channel: string; language: 'en' | 'es' }) {
  const { data, error } = await client().from('distributor_campaigns').insert({
    distributor_id: distributorId, name: input.name.trim(), channel: input.channel, language: input.language,
    status: 'active', starts_at: new Date().toISOString(), created_by: userId, updated_by: userId,
  }).select('id,name,channel,language,status,starts_at,ends_at').single()
  if (error) throw error
  return data as Campaign
}

export async function createPartnerLink(distributorId: string, userId: string, input: { campaignId?: string; destinationType: string; destinationPath: string; channel: string; subId?: string; language: 'en' | 'es'; expiresAt?: string }) {
  const { data, error } = await client().from('distributor_partner_links').insert({
    distributor_id: distributorId,
    campaign_id: input.campaignId || null,
    destination_type: input.destinationType,
    destination_path: input.destinationPath,
    channel: input.channel,
    sub_id: input.subId?.trim() || null,
    language: input.language,
    expires_at: input.expiresAt || null,
    created_by: userId,
    updated_by: userId,
  }).select('id,slug,campaign_id,destination_type,destination_path,channel,sub_id,language,active,expires_at,created_at').single()
  if (error) throw error
  return data as PartnerLink
}

export function buildPartnerUrl(origin: string, referralCode: string, link: Pick<PartnerLink, 'destination_path' | 'language' | 'slug' | 'channel' | 'sub_id'>, campaignName?: string | null) {
  const localizedPath = link.language === 'es' && link.destination_path !== '/' ? `/es${link.destination_path}` : link.language === 'es' ? '/es/' : link.destination_path
  const url = new URL(localizedPath, origin)
  url.searchParams.set('ref', referralCode)
  url.searchParams.set('pl', link.slug)
  url.searchParams.set('utm_source', link.channel)
  url.searchParams.set('utm_medium', 'partner')
  if (campaignName) url.searchParams.set('utm_campaign', campaignName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''))
  if (link.sub_id) url.searchParams.set('sub_id', link.sub_id)
  return url.toString()
}

export async function makeQrDataUrl(url: string) {
  const { default: QRCode } = await import('qrcode')
  return QRCode.toDataURL(url, { width: 640, margin: 2, errorCorrectionLevel: 'M', color: { dark: '#071724', light: '#FFFFFF' } })
}

export async function growthAssetDownloadUrl(asset: GrowthAsset, distributorId: string, partnerLinkId?: string) {
  if (!asset.object_path) throw new Error('Asset file unavailable.')
  const db = client()
  const { data, error } = await db.storage.from('distributor-growth-assets').createSignedUrl(asset.object_path, 60)
  if (error || !data) throw error ?? new Error('Asset unavailable.')
  await db.from('distributor_asset_downloads').insert({ distributor_id: distributorId, asset_id: asset.id, partner_link_id: partnerLinkId || null, idempotency_key: `${asset.id}:${crypto.randomUUID()}` })
  return data.signedUrl
}

export async function loadNotifications(distributorId: string) {
  const { data, error } = await client().from('distributor_notifications').select('id,created_at,notification_type,title_en,title_es,body_en,body_es,action_path,read_at').eq('distributor_id', distributorId).order('created_at', { ascending: false }).limit(100)
  if (error) throw error
  return (data ?? []) as DistributorNotification[]
}

export async function markNotificationRead(id: string) {
  const { error } = await client().from('distributor_notifications').update({ read_at: new Date().toISOString() }).eq('id', id)
  if (error) throw error
}

export async function loadDisputes(distributorId: string) {
  const { data, error } = await client().from('distributor_disputes').select('id,created_at,updated_at,sale_id,commission_ledger_id,dispute_type,explanation,evidence_due_at,status,public_resolution,resolved_at').eq('distributor_id', distributorId).order('created_at', { ascending: false }).limit(100)
  if (error) throw error
  return (data ?? []) as DistributorDispute[]
}

export async function openDispute(input: { distributorId: string; userId: string; saleId: string; type: string; explanation: string }) {
  const idempotencyKey = `portal:${input.userId}:${input.saleId}:${crypto.randomUUID()}`
  const { data, error } = await client().from('distributor_disputes').insert({
    distributor_id: input.distributorId,
    sale_id: input.saleId,
    dispute_type: input.type,
    explanation: input.explanation.trim(),
    created_by: input.userId,
    idempotency_key: idempotencyKey,
  }).select('id').single()
  if (error) throw error
  return data.id as string
}

export async function loadPayoutReceipts(distributorId: string) {
  const { data, error } = await client().from('distributor_payout_receipts').select('id,payout_id,receipt_number,created_at,snapshot').eq('distributor_id', distributorId).order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as PayoutReceipt[]
}

export function csvCell(value: unknown) {
  const raw = String(value ?? '')
  const protectedValue = /^[=+\-@\t\r]/.test(raw) ? `'${raw}` : raw
  return `"${protectedValue.replaceAll('"', '""')}"`
}

export function growthReportCsv(rows: GrowthReportRow[], locale: 'en' | 'es') {
  const headers = locale === 'es'
    ? ['Fecha', 'Campaña', 'Destino', 'Canal', 'Sub-ID', 'Idioma', 'Activo', 'Clics', 'Visitantes únicos', 'Checkouts', 'Pedidos pagados', 'Ingreso neto', 'Conversión']
    : ['Date', 'Campaign', 'Destination', 'Channel', 'Sub-ID', 'Language', 'Active', 'Clicks', 'Unique visitors', 'Checkouts', 'Paid orders', 'Net revenue', 'Conversion']
  const lines = rows.map((row) => [row.created_at, row.campaign_name, row.destination_path, row.channel, row.sub_id, row.language, row.active, row.clicks, row.unique_visitors, row.checkout_starts, row.paid_orders, (row.net_revenue_cents / 100).toFixed(2), row.conversion_bps === null ? '' : (row.conversion_bps / 100).toFixed(2)].map(csvCell).join(','))
  return `\uFEFF${headers.map(csvCell).join(',')}\r\n${lines.join('\r\n')}`
}

function pdfEscape(value: string) {
  return value.replaceAll('\\', '\\\\').replaceAll('(', '\\(').replaceAll(')', '\\)').replace(/[^\x20-\x7E]/g, '?')
}

export function simpleTextPdf(title: string, lines: string[]) {
  const lineText = [title, `Generated: ${new Date().toISOString()}`, '', ...lines.slice(0, 44)]
  const commands = lineText.map((line, index) => `${index ? '0 -14 Td' : '50 760 Td'} (${pdfEscape(line)}) Tj`).join('\n')
  const stream = `BT /F1 9 Tf 12 TL\n${commands}\nET`
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>',
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  ]
  let pdf = '%PDF-1.4\n'
  const offsets = [0]
  objects.forEach((object, index) => { offsets.push(pdf.length); pdf += `${index + 1} 0 obj\n${object}\nendobj\n` })
  const xref = pdf.length
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets.slice(1).map((offset) => `${String(offset).padStart(10, '0')} 00000 n `).join('\n')}\ntrailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`
  return new Blob([pdf], { type: 'application/pdf' })
}

export function simpleReportPdf(title: string, rows: GrowthReportRow[]) {
  return simpleTextPdf(title, rows.map((row) => `${row.created_at.slice(0, 10)} | ${row.channel} | ${row.destination_path} | clicks ${row.clicks} | paid ${row.paid_orders} | $${(row.net_revenue_cents / 100).toFixed(2)}`))
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}
