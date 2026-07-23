import { supabase } from '../supabaseClient'

function db() {
  if (!supabase) throw new Error('Portal data access is not configured.')
  return supabase
}

// ---------- Shared types ----------
export type PortalOrderItem = { id: string; product_slug: string; variant_sku: string; quantity: number; unit_amount_cents: number; metadata: { name?: string } }
export type PortalShipment = { id: string; status: string; carrier: string | null; tracking_number: string | null; shipped_at: string | null; delivered_at: string | null }
export type PortalOrder = {
  id: string; created_at: string; order_number: string; amount_cents: number
  payment_status: string; fulfillment_status: string; user_id: string
  portal_order_items: PortalOrderItem[]; shipments: PortalShipment[]
}
export type ClientProtocol = {
  id: string; user_id: string; created_at: string; updated_at: string; title: string; summary: string; body: string
  status: 'draft' | 'active' | 'completed' | 'archived'; starts_on: string | null; ends_on: string | null
}
export type IntakeResult = {
  user_id: string; submitted_at: string | null; decision: 'pending' | 'approved' | 'rejected' | 'corrections_requested'
  decision_at: string | null; date_of_birth: string | null; height_cm: number | null; starting_weight_kg: number | null
  current_weight_kg: number | null; waist_cm: number | null; preferred_units: 'imperial' | 'metric'; goals: string[]
  activity_level: string | null; exercise_frequency: string | null; average_sleep_hours: number | null
  water_consistency: number | null; appetite_rating: number | null; energy_rating: number | null
  stress_rating: number | null; wellness_rating: number | null
  research_interests: string[]; interested_products: string[]
  public_intake_answers?: { topPriorities?: string[]; helpNeeded?: string[] | string; currentConcerns?: string[] }
}
export type ProgressEntry = { id: string; entry_date: string; measurements: { weight_kg?: number; waist_cm?: number }; scores: { energy?: number; wellness?: number }; notes: string | null }
export type WeeklyCheckin = { id: string; week_start: string; measurements: { weight_kg?: number; waist_cm?: number }; scores: { energy?: number; appetite?: number; sleep?: number; stress?: number }; support_concern: boolean; notes: string | null }
export type PortalDocument = { id: string; created_at: string; category: string; title: string; version: string; storage_path: string; product_slug: string | null; expires_at: string | null }
export type SupportThread = { id: string; created_at: string; updated_at: string; category: string; subject: string; status: string; priority: string; user_id: string }
export type SupportMessage = { id: string; thread_id: string; author_id: string; created_at: string; message: string }
export type PortalNotification = { id: string; created_at: string; read_at: string | null; type: string; title: string; body: string; action_path: string | null }
export type PortalProfile = { legal_name: string; preferred_name: string; email: string; mobile: string; preferred_language: string; time_zone: string }
export type PortalReviewSubmission = {
  id: string; created_at: string; status: string; category: string; rating: number | null
  review_title: string; quote: string; product_name: string
}
export type ProgressPhoto = {
  id: string; created_at: string; capture_date: string; storage_path: string; mime_type: string; byte_size: number
  caption: string; staff_visible: boolean; scan_status: string; signed_url: string | null
}

const ORDER_SELECT = 'id,created_at,order_number,amount_cents,payment_status,fulfillment_status,user_id,portal_order_items(id,product_slug,variant_sku,quantity,unit_amount_cents,metadata),shipments(id,status,carrier,tracking_number,shipped_at,delivered_at)'

// ---------- Client queries ----------
export async function fetchMyOrders(): Promise<PortalOrder[]> {
  const { data, error } = await db().from('portal_orders').select(ORDER_SELECT).is('deleted_at', null).order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as unknown as PortalOrder[]
}

export async function fetchMyProtocols(): Promise<ClientProtocol[]> {
  const { data, error } = await db().from('client_protocols').select('id,user_id,created_at,updated_at,title,summary,body,status,starts_on,ends_on').is('deleted_at', null).neq('status', 'draft').order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as ClientProtocol[]
}

export async function fetchMyIntake(userId: string): Promise<IntakeResult | null> {
  const { data, error } = await db().from('onboarding_profiles').select('*').eq('user_id', userId).maybeSingle()
  if (error) throw error
  return data as IntakeResult | null
}

export async function fetchProgressEntries(): Promise<ProgressEntry[]> {
  const { data, error } = await db().from('progress_entries').select('id,entry_date,measurements,scores,notes').is('deleted_at', null).order('entry_date', { ascending: false }).limit(120)
  if (error) throw error
  return (data ?? []) as ProgressEntry[]
}

export async function saveProgressEntry(userId: string, entry: { entry_date: string; measurements: ProgressEntry['measurements']; scores: ProgressEntry['scores']; notes: string }) {
  const { error } = await db().from('progress_entries').insert({ user_id: userId, ...entry, notes: entry.notes || null })
  if (error) throw error
}

export async function hasProgressPhotoConsent(): Promise<boolean> {
  const { data, error } = await db().rpc('portal_has_progress_photo_consent')
  if (error) throw error
  return Boolean(data)
}

export async function acceptProgressPhotoConsent(userId: string, signatureValue: string) {
  const client = db()
  const { data: consentVersion, error: versionError } = await client
    .from('consent_versions')
    .select('id')
    .eq('consent_key', 'progress_photos')
    .eq('active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (versionError || !consentVersion) throw versionError ?? new Error('Photo consent version unavailable.')
  const { error } = await client.from('consent_acceptances').insert({
    user_id: userId,
    consent_version_id: consentVersion.id,
    signature_value: signatureValue.trim(),
    metadata: { source: 'portal_research_media' },
  })
  if (error) throw error
}

export async function fetchProgressPhotos(userId: string): Promise<ProgressPhoto[]> {
  const client = db()
  const { data, error } = await client
    .from('progress_photos')
    .select('id,created_at,capture_date,storage_path,mime_type,byte_size,caption,staff_visible,scan_status')
    .eq('user_id', userId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(48)
  if (error) throw error
  const rows = (data ?? []) as Omit<ProgressPhoto, 'signed_url'>[]
  if (!rows.length) return []
  const { data: signed, error: signedError } = await client.storage.from('progress-photos').createSignedUrls(rows.map((row) => row.storage_path), 300)
  if (signedError) throw signedError
  return rows.map((row, index) => ({ ...row, signed_url: signed?.[index]?.signedUrl ?? null }))
}

export async function uploadProgressPhoto(userId: string, input: { file: File; captureDate: string; caption: string; staffVisible: boolean }) {
  const client = db()
  const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp'])
  if (!allowedTypes.has(input.file.type)) throw new Error('Unsupported image type.')
  if (input.file.size > 8 * 1024 * 1024) throw new Error('Image exceeds the 8 MB limit.')
  const safeName = input.file.name.replaceAll(/[^\w.-]/g, '_')
  const storagePath = `${userId}/${crypto.randomUUID()}-${safeName}`
  const { error: uploadError } = await client.storage.from('progress-photos').upload(storagePath, input.file, {
    contentType: input.file.type,
    upsert: false,
  })
  if (uploadError) throw uploadError
  const { error: recordError } = await client.from('progress_photos').insert({
    user_id: userId,
    capture_date: input.captureDate,
    storage_path: storagePath,
    mime_type: input.file.type,
    byte_size: input.file.size,
    caption: input.caption.trim(),
    staff_visible: input.staffVisible,
  })
  if (recordError) {
    await client.storage.from('progress-photos').remove([storagePath])
    throw recordError
  }
}

export async function fetchMyReviewSubmissions(userId: string): Promise<PortalReviewSubmission[]> {
  const { data, error } = await db()
    .from('testimonials')
    .select('id,created_at,status,category,rating,review_title,quote,product_name')
    .eq('submitted_by', userId)
    .order('created_at', { ascending: false })
    .limit(20)
  if (error) throw error
  return (data ?? []) as PortalReviewSubmission[]
}

export async function submitPortalReview(userId: string, input: {
  displayName: string; reviewTitle: string; quote: string; productName: string; rating: number; category: string
}) {
  const reference = `portal:${userId}:${crypto.randomUUID()}`
  const { error } = await db().from('testimonials').insert({
    submitted_by: userId,
    status: 'draft',
    display_name: input.displayName.trim(),
    review_title: input.reviewTitle.trim(),
    quote: input.quote.trim(),
    product_name: input.productName.trim(),
    rating: input.rating,
    category: input.category,
    submission_date: new Date().toISOString().slice(0, 10),
    verified_purchase: null,
    source_record_reference: reference,
    source_user_style: 'portal_client_submission',
    verification_notes: 'Submitted by an authenticated portal client; administrator verification is still required.',
    relationship_to_business: 'Verified portal client; any additional material relationship requires administrator review.',
    incentive_provided: false,
    incentive_disclosure: '',
    consent_verified: false,
    consent_record_reference: `${reference}:publication-requested`,
    claim_review_passed: false,
  })
  if (error) throw error
}

export async function fetchCheckins(): Promise<WeeklyCheckin[]> {
  const { data, error } = await db().from('weekly_checkins').select('id,week_start,measurements,scores,support_concern,notes').order('week_start', { ascending: false }).limit(60)
  if (error) throw error
  return (data ?? []) as WeeklyCheckin[]
}

export async function saveCheckin(userId: string, checkin: { week_start: string; measurements: WeeklyCheckin['measurements']; scores: WeeklyCheckin['scores']; support_concern: boolean; notes: string }) {
  const { error } = await db().from('weekly_checkins').upsert({ user_id: userId, ...checkin, notes: checkin.notes || null }, { onConflict: 'user_id,week_start' })
  if (error) throw error
}

export async function fetchMyDocuments(userId: string): Promise<PortalDocument[]> {
  const { data, error } = await db().from('document_assignments').select('documents(id,created_at,category,title,version,storage_path,product_slug,expires_at)').eq('user_id', userId).is('revoked_at', null)
  if (error) throw error
  return (data ?? []).map((row) => (row as unknown as { documents: PortalDocument }).documents).filter(Boolean)
}

export async function createDocumentDownloadUrl(storagePath: string): Promise<string> {
  const { data, error } = await db().storage.from('portal-documents').createSignedUrl(storagePath, 300)
  if (error || !data?.signedUrl) throw error ?? new Error('signed url unavailable')
  return data.signedUrl
}

export async function fetchMyThreads(): Promise<SupportThread[]> {
  const { data, error } = await db().from('support_threads').select('id,created_at,updated_at,category,subject,status,priority,user_id').order('updated_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as SupportThread[]
}

export async function fetchThreadMessages(threadId: string): Promise<SupportMessage[]> {
  const { data, error } = await db().from('support_messages').select('id,thread_id,author_id,created_at,message').eq('thread_id', threadId).order('created_at', { ascending: true })
  if (error) throw error
  return (data ?? []) as SupportMessage[]
}

export async function createSupportThread(_userId: string, input: { category: string; subject: string; message: string }) {
  const { data, error } = await db().rpc('create_portal_support_thread', {
    thread_subject: input.subject,
    thread_category: input.category,
    initial_message: input.message,
  })
  if (error) throw error
  return data as string
}

export async function sendSupportMessage(threadId: string, authorId: string, message: string) {
  const { error } = await db().from('support_messages').insert({ thread_id: threadId, author_id: authorId, message })
  if (error) throw error
}

export async function fetchNotifications(): Promise<PortalNotification[]> {
  const { data, error } = await db().from('notifications').select('id,created_at,read_at,type,title,body,action_path').order('created_at', { ascending: false }).limit(80)
  if (error) throw error
  return (data ?? []) as PortalNotification[]
}

export async function markNotificationRead(id: string) {
  const { error } = await db().from('notifications').update({ read_at: new Date().toISOString() }).eq('id', id)
  if (error) throw error
}

export async function markAllNotificationsRead(userId: string) {
  const { error } = await db().from('notifications').update({ read_at: new Date().toISOString() }).eq('user_id', userId).is('read_at', null)
  if (error) throw error
}

export async function fetchMyProfile(userId: string): Promise<PortalProfile> {
  const { data, error } = await db().from('profiles').select('legal_name,preferred_name,email,mobile,preferred_language,time_zone').eq('id', userId).single()
  if (error) throw error
  return data as PortalProfile
}

export async function updateMyProfile(userId: string, profile: Omit<PortalProfile, 'email'>) {
  const { error } = await db().from('profiles').update({ ...profile, updated_at: new Date().toISOString() }).eq('id', userId)
  if (error) throw error
}

export async function requestDataExport(userId: string) {
  const { error } = await db().from('data_export_requests').insert({ user_id: userId })
  if (error) throw error
}

export async function requestAccountDeletion(userId: string) {
  const { error } = await db().from('account_deletion_requests').insert({ user_id: userId })
  if (error) throw error
}

export type OverviewSummary = { orders: number; unreadNotifications: number; documents: number; activeProtocols: number; latestOrder: PortalOrder | null }
export async function fetchOverviewSummary(userId: string): Promise<OverviewSummary> {
  const client = db()
  const [orders, notifications, documents, protocols] = await Promise.all([
    client.from('portal_orders').select(ORDER_SELECT).is('deleted_at', null).order('created_at', { ascending: false }).limit(25),
    client.from('notifications').select('id', { count: 'exact', head: true }).is('read_at', null),
    client.from('document_assignments').select('id', { count: 'exact', head: true }).eq('user_id', userId).is('revoked_at', null),
    client.from('client_protocols').select('id', { count: 'exact', head: true }).eq('status', 'active').is('deleted_at', null),
  ])
  const orderRows = (orders.data ?? []) as unknown as PortalOrder[]
  return {
    orders: orderRows.length,
    unreadNotifications: notifications.count ?? 0,
    documents: documents.count ?? 0,
    activeProtocols: protocols.count ?? 0,
    latestOrder: orderRows[0] ?? null,
  }
}

// ---------- Admin queries ----------
export type AdminClientRow = { user_id: string; status: string; profiles: { legal_name: string; preferred_name: string; email: string; mobile: string; preferred_language: string } | null }
export async function adminFetchClients(): Promise<AdminClientRow[]> {
  const { data, error } = await db().from('client_statuses').select('user_id,status,profiles!client_statuses_user_id_fkey(legal_name,preferred_name,email,mobile,preferred_language)').order('updated_at', { ascending: false }).limit(200)
  if (error) throw error
  return (data ?? []) as unknown as AdminClientRow[]
}

export type AdminApplicationRow = { user_id: string; submitted_at: string | null; decision: string; goals: string[]; profiles: { legal_name: string; email: string } | null }
export async function adminFetchApplications(): Promise<AdminApplicationRow[]> {
  const { data, error } = await db().from('onboarding_profiles').select('user_id,submitted_at,decision,goals,profiles!onboarding_profiles_user_id_fkey(legal_name,email)').not('submitted_at', 'is', null).eq('decision', 'pending').order('submitted_at', { ascending: true }).limit(100)
  if (error) throw error
  return (data ?? []) as unknown as AdminApplicationRow[]
}

export async function adminDecideApplication(
  _adminId: string,
  clientId: string,
  decision: 'approved' | 'rejected' | 'corrections_requested',
  _notification: { title: string; body: string },
  reason = '',
) {
  const { error } = await db().rpc('review_portal_application', {
    target_user_id: clientId,
    application_result: decision,
    decision_reason: reason,
  })
  if (error) throw error
}

export async function adminSetClientStatus(adminId: string, clientId: string, status: string) {
  const { error } = await db().from('client_statuses').update({ status, updated_at: new Date().toISOString(), updated_by: adminId }).eq('user_id', clientId)
  if (error) throw error
  await db().from('audit_logs').insert({ actor_id: adminId, actor_role: 'admin', event_type: 'client_status_changed', resource_type: 'client_status', resource_id: clientId, metadata: { status } })
}

export async function adminFetchOrders(): Promise<PortalOrder[]> {
  const { data, error } = await db().from('portal_orders').select(ORDER_SELECT).is('deleted_at', null).order('created_at', { ascending: false }).limit(200)
  if (error) throw error
  return (data ?? []) as unknown as PortalOrder[]
}

export type NewOrderItem = { name: string; sku: string; quantity: number; unitAmountCents: number }
export async function adminCreateOrder(adminId: string, input: { userId: string; items: NewOrderItem[]; paymentStatus: string; notification: { title: string; body: string } }) {
  const client = db()
  const amount = input.items.reduce((total, item) => total + item.quantity * item.unitAmountCents, 0)
  const orderNumber = `EBL-${new Date().toISOString().slice(2, 10).replaceAll('-', '')}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`
  const { data, error } = await client.from('portal_orders').insert({ user_id: input.userId, order_number: orderNumber, amount_cents: amount, payment_status: input.paymentStatus, fulfillment_status: 'processing' }).select('id').single()
  if (error) throw error
  const { error: itemsError } = await client.from('portal_order_items').insert(input.items.map((item) => ({ order_id: data.id, product_slug: item.sku.toLowerCase(), variant_sku: item.sku, quantity: item.quantity, unit_amount_cents: item.unitAmountCents, metadata: { name: item.name } })))
  if (itemsError) throw itemsError
  const { error: inventoryError } = await client.rpc('inventory_apply_portal_order_status', { p_order_id: data.id, p_target_status: 'processing' })
  if (inventoryError) throw inventoryError
  await client.from('notifications').insert({ user_id: input.userId, type: 'order', title: input.notification.title, body: `${input.notification.body} ${orderNumber}`.trim(), action_path: '/portal/orders' })
  await client.from('audit_logs').insert({ actor_id: adminId, actor_role: 'admin', event_type: 'order_created', resource_type: 'portal_order', resource_id: data.id })
  return orderNumber
}

export async function adminUpdateOrderStatus(adminId: string, order: PortalOrder, updates: { payment_status?: string; fulfillment_status?: string }, notification: { title: string; body: string }) {
  const client = db()
  let error = null
  if (updates.fulfillment_status) {
    const result = await client.rpc('inventory_apply_portal_order_status', { p_order_id: order.id, p_target_status: updates.fulfillment_status })
    error = result.error
  }
  if (!error && updates.payment_status) {
    const result = await client.from('portal_orders').update({ payment_status: updates.payment_status, updated_at: new Date().toISOString() }).eq('id', order.id)
    error = result.error
  }
  if (error) throw error
  await client.from('notifications').insert({ user_id: order.user_id, type: 'order', title: notification.title, body: `${notification.body} ${order.order_number}`.trim(), action_path: '/portal/orders' })
  await client.from('audit_logs').insert({ actor_id: adminId, actor_role: 'admin', event_type: 'order_status_changed', resource_type: 'portal_order', resource_id: order.id, metadata: updates })
}

export async function adminAddShipment(adminId: string, order: PortalOrder, shipment: { carrier: string; tracking_number: string }, notification: { title: string; body: string }) {
  const client = db()
  const { error: inventoryError } = await client.rpc('inventory_apply_portal_order_status', { p_order_id: order.id, p_target_status: 'shipped' })
  if (inventoryError) throw inventoryError
  const { error } = await client.from('shipments').insert({ order_id: order.id, status: 'shipped', carrier: shipment.carrier, tracking_number: shipment.tracking_number, shipped_at: new Date().toISOString() })
  if (error) throw error
  await client.from('notifications').insert({ user_id: order.user_id, type: 'order', title: notification.title, body: `${notification.body} ${order.order_number} · ${shipment.carrier} ${shipment.tracking_number}`.trim(), action_path: '/portal/orders' })
  await client.from('audit_logs').insert({ actor_id: adminId, actor_role: 'admin', event_type: 'shipment_created', resource_type: 'portal_order', resource_id: order.id })
}

export async function adminFetchProtocols(): Promise<(ClientProtocol & { profiles: { legal_name: string; email: string } | null })[]> {
  const { data, error } = await db().from('client_protocols').select('id,user_id,created_at,updated_at,title,summary,body,status,starts_on,ends_on,profiles!client_protocols_user_id_fkey(legal_name,email)').is('deleted_at', null).order('created_at', { ascending: false }).limit(200)
  if (error) throw error
  return (data ?? []) as unknown as (ClientProtocol & { profiles: { legal_name: string; email: string } | null })[]
}

export async function adminSaveProtocol(adminId: string, input: { id?: string; userId: string; title: string; summary: string; body: string; status: ClientProtocol['status'] }, notification: { title: string; body: string }) {
  const client = db()
  if (input.id) {
    const { error } = await client.from('client_protocols').update({ title: input.title, summary: input.summary, body: input.body, status: input.status }).eq('id', input.id)
    if (error) throw error
  } else {
    const { error } = await client.from('client_protocols').insert({ user_id: input.userId, created_by: adminId, title: input.title, summary: input.summary, body: input.body, status: input.status })
    if (error) throw error
    if (input.status === 'active') {
      await client.from('notifications').insert({ user_id: input.userId, type: 'protocol', title: notification.title, body: notification.body, action_path: '/portal/protocols' })
    }
  }
  await client.from('audit_logs').insert({ actor_id: adminId, actor_role: 'admin', event_type: input.id ? 'protocol_updated' : 'protocol_created', resource_type: 'client_protocol' })
}

export async function adminUploadDocument(adminId: string, input: { file: File; title: string; category: string; version: string; userId: string }, notification: { title: string; body: string }) {
  const client = db()
  if (!input.file.name.toLowerCase().endsWith('.pdf') || (input.file.type && input.file.type !== 'application/pdf')) throw new Error('Only PDF documents are allowed.')
  if (input.file.size > 10 * 1024 * 1024) throw new Error('The document exceeds the 10 MB limit.')
  const safeName = input.file.name.replaceAll(/[^\w.-]/g, '_')
  const storagePath = `${input.userId}/${Date.now()}-${safeName}`
  const { error: uploadError } = await client.storage.from('portal-documents').upload(storagePath, input.file, { contentType: input.file.type || 'application/octet-stream' })
  if (uploadError) throw uploadError
  const { data, error } = await client.from('documents').insert({ category: input.category, title: input.title, version: input.version || '1.0', storage_path: storagePath }).select('id').single()
  if (error) throw error
  const { error: assignError } = await client.from('document_assignments').insert({ document_id: data.id, user_id: input.userId })
  if (assignError) throw assignError
  await client.from('notifications').insert({ user_id: input.userId, type: 'document', title: notification.title, body: `${notification.body} ${input.title}`.trim(), action_path: '/portal/documents' })
  await client.from('audit_logs').insert({ actor_id: adminId, actor_role: 'admin', event_type: 'document_assigned', resource_type: 'document', resource_id: data.id })
}

export type AdminDocumentRow = { id: string; created_at: string; category: string; title: string; version: string; storage_path: string; document_assignments: { user_id: string; revoked_at: string | null }[] }
export async function adminFetchDocuments(): Promise<AdminDocumentRow[]> {
  const { data, error } = await db().from('documents').select('id,created_at,category,title,version,storage_path,document_assignments(user_id,revoked_at)').is('deleted_at', null).order('created_at', { ascending: false }).limit(200)
  if (error) throw error
  return (data ?? []) as unknown as AdminDocumentRow[]
}

export async function adminFetchThreads(): Promise<(SupportThread & { profiles: { legal_name: string; email: string } | null })[]> {
  const { data, error } = await db().from('support_threads').select('id,created_at,updated_at,category,subject,status,priority,user_id,profiles!support_threads_user_id_fkey(legal_name,email)').order('updated_at', { ascending: false }).limit(200)
  if (error) throw error
  return (data ?? []) as unknown as (SupportThread & { profiles: { legal_name: string; email: string } | null })[]
}

export async function adminSetThreadStatus(threadId: string, status: string) {
  const { error } = await db().from('support_threads').update({ status, updated_at: new Date().toISOString(), ...(status === 'closed' ? { closed_at: new Date().toISOString() } : {}) }).eq('id', threadId)
  if (error) throw error
}

export type AuditLogRow = { id: string; created_at: string; actor_id: string | null; actor_role: string | null; event_type: string; resource_type: string | null; success: boolean }
export async function adminFetchAuditLog(): Promise<AuditLogRow[]> {
  const { data, error } = await db().from('audit_logs').select('id,created_at,actor_id,actor_role,event_type,resource_type,success').order('created_at', { ascending: false }).limit(150)
  if (error) throw error
  return (data ?? []) as AuditLogRow[]
}

export type AdminOverview = { pendingApplications: number; activeClients: number; openThreads: number; processingOrders: number }
export async function adminFetchOverview(): Promise<AdminOverview> {
  const client = db()
  const [applications, clients, threads, orders] = await Promise.all([
    client.from('onboarding_profiles').select('user_id', { count: 'exact', head: true }).not('submitted_at', 'is', null).eq('decision', 'pending'),
    client.from('client_statuses').select('user_id', { count: 'exact', head: true }).eq('status', 'active'),
    client.from('support_threads').select('id', { count: 'exact', head: true }).eq('status', 'open'),
    client.from('portal_orders').select('id', { count: 'exact', head: true }).eq('fulfillment_status', 'processing'),
  ])
  return { pendingApplications: applications.count ?? 0, activeClients: clients.count ?? 0, openThreads: threads.count ?? 0, processingOrders: orders.count ?? 0 }
}

export type CommunicationMessage = { id: string; created_at: string; direction: 'inbound' | 'outbound'; source: string; mailbox: string; status: string; is_read: boolean; sender_name: string; sender_email: string; sender_phone: string | null; recipient_email: string; subject: string; body_text: string; locale: 'en' | 'es'; assigned_to: string | null; delivery_status: string }
export async function adminFetchCommunications(options: { mailbox?: string; contactOnly?: boolean; search?: string; page?: number } = {}) {
  const page = options.page ?? 0
  let query = db().from('communication_messages').select('id,created_at,direction,source,mailbox,status,is_read,sender_name,sender_email,sender_phone,recipient_email,subject,body_text,locale,assigned_to,delivery_status', { count: 'exact' }).order('created_at', { ascending: false }).range(page * 25, page * 25 + 24)
  if (options.mailbox) query = query.eq('mailbox', options.mailbox)
  if (options.contactOnly) query = query.eq('source', 'contact_form')
  if (options.search) query = query.or(`subject.ilike.%${options.search.replaceAll(',', ' ')}%,sender_email.ilike.%${options.search.replaceAll(',', ' ')}%,sender_name.ilike.%${options.search.replaceAll(',', ' ')}%`)
  const { data, error, count } = await query
  if (error) throw error
  return { rows: (data ?? []) as CommunicationMessage[], count: count ?? 0 }
}
export async function adminUpdateCommunication(id: string, updates: Partial<Pick<CommunicationMessage, 'mailbox' | 'status' | 'is_read' | 'assigned_to'>>) {
  const { error } = await db().from('communication_messages').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id)
  if (error) throw error
}
export async function adminUnreadCommunicationCount() { const { count, error } = await db().from('communication_messages').select('id', { count: 'exact', head: true }).in('mailbox', ['inbox', 'contact']).eq('is_read', false); if (error) throw error; return count ?? 0 }
