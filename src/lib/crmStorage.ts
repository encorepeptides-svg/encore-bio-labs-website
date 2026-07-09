import { calculateLeadScore } from './leadScoring'
import { isPublicCrmDevMode, isSupabaseConfigured, supabase } from './supabaseClient'
import type {
  CampaignSource,
  CRMNote,
  IntakeSubmission,
  Lead,
  LeadStatus,
  ProductInterest,
  TimelineEvent,
} from '../types/crm'
import type { CustomerLead } from '../data/intake'

export const CRM_LEADS_STORAGE_KEY = 'encore_crm_leads'
const CRM_NOTES_STORAGE_KEY = 'encore_crm_notes'
const LEGACY_INTAKE_STORAGE_KEY = 'encore_ai_intake_leads'

type LeadRow = {
  id: string
  created_at: string
  updated_at: string
  first_name: string
  last_name: string
  email: string
  phone: string
  city: string
  state: string
  country: string
  preferred_language: string
  source: string
  campaign_source: CampaignSource
  interested_products: string[]
  primary_goal: string
  budget_range: string
  status: LeadStatus
  lead_score: number
  lead_score_explanation: string[]
  last_contacted_at?: string | null
  consent_to_contact: boolean
  research_use_acknowledgment: boolean
}

type IntakeRow = {
  id: string
  lead_id: string
  created_at: string
  age: number | null
  sex: string
  weight: string
  height: string
  main_goal: string
  current_routine: string
  sleep_quality: string
  appetite: string
  energy: string
  previous_products_used: string
  medical_conditions: string
  medications: string
  budget: string
  delivery_city: string
  preferred_contact_method: string
  consent_to_contact: boolean
  research_use_acknowledgment: boolean
}

type TimelineRow = {
  id: string
  lead_id: string
  created_at: string
  event_type: TimelineEvent['type']
  title: string
  description?: string | null
  metadata?: Record<string, unknown> | null
}

type NoteRow = {
  id: string
  lead_id: string
  created_at: string
  note: string
  created_by: string
}

export function isCrmUsingSupabase() {
  return isSupabaseConfigured && isPublicCrmDevMode
}

function now(offsetDays = 0) {
  const date = new Date()
  date.setDate(date.getDate() - offsetDays)
  return date.toISOString()
}

function createUuid() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }

  return '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, (char) =>
    (Number(char) ^ (Math.random() * 16) >> (Number(char) / 4)).toString(16),
  )
}

function product(productName: string, category?: string, priority: ProductInterest['priority'] = 'primary'): ProductInterest {
  return { productName, category, priority }
}

function timeline(type: TimelineEvent['type'], title: string, description?: string, offsetDays = 0): TimelineEvent {
  return {
    id: createUuid(),
    createdAt: now(offsetDays),
    type,
    title,
    description,
  }
}

function intake(overrides: Partial<IntakeSubmission> = {}): IntakeSubmission {
  return {
    id: createUuid(),
    submittedAt: now(),
    age: '38',
    sex: 'Prefer not to say',
    weight: '180',
    height: '5 ft 10 in',
    mainGoal: 'Research interest review',
    currentRoutine: 'Consistent training and nutrition routine',
    sleepQuality: 'Good',
    appetite: 'Stable',
    energy: 'Variable',
    previousProductsUsed: 'None reported',
    medicalConditions: 'None shared',
    medications: 'None shared',
    budget: '$500+ premium research budget',
    deliveryCity: 'El Paso',
    preferredContactMethod: 'WhatsApp',
    consentToContact: true,
    researchUseAcknowledgment: true,
    ...overrides,
  }
}

function buildLead(input: Omit<Lead, 'leadScore'>): Lead {
  return {
    ...input,
    leadScore: calculateLeadScore(input),
  }
}

export const sampleLeads: Lead[] = [
  buildLead({
    id: createUuid(),
    createdAt: now(1),
    updatedAt: now(1),
    firstName: 'Marisol',
    lastName: 'Vega',
    email: 'marisol.vega@example.com',
    phone: '915-555-0148',
    city: 'El Paso',
    state: 'TX',
    country: 'United States',
    preferredLanguage: 'English',
    source: 'Website intake',
    campaignSource: 'Instagram',
    interestedProducts: [product('Retatrutide', 'Metabolic & Weight Management'), product('NAD+', 'Longevity & Cellular Health', 'secondary')],
    primaryGoal: 'Metabolic signaling research inquiry',
    budgetRange: '$500+',
    status: 'new',
    notes: 'Asked for educational overview only.',
    intakeSubmission: intake({ age: '42', deliveryCity: 'El Paso', mainGoal: 'Metabolic signaling research inquiry' }),
    timeline: [timeline('lead_created', 'Lead captured from Instagram campaign', undefined, 1), timeline('intake_submitted', 'Research intake submitted', undefined, 1)],
  }),
  buildLead({
    id: createUuid(),
    createdAt: now(2),
    updatedAt: now(1),
    firstName: 'Andres',
    lastName: 'Nunez',
    email: 'andres.nunez@example.com',
    phone: '+52 656 555 0182',
    city: 'Ciudad Juarez',
    state: 'Chihuahua',
    country: 'Mexico',
    preferredLanguage: 'Spanish',
    source: 'WhatsApp inquiry',
    campaignSource: 'WhatsApp',
    interestedProducts: [product('MOTS-C', 'Metabolic & Weight Management')],
    primaryGoal: 'Cellular energy research interest',
    budgetRange: '$250-$500',
    status: 'contacted',
    notes: 'Prefers Spanish follow-up.',
    lastContactedAt: now(1),
    intakeSubmission: intake({ age: '35', budget: '$250-$500', deliveryCity: 'Ciudad Juarez', preferredContactMethod: 'WhatsApp' }),
    timeline: [timeline('lead_created', 'Lead created from WhatsApp inquiry', undefined, 2), timeline('status_changed', 'Marked contacted', undefined, 1)],
  }),
  buildLead({
    id: createUuid(),
    createdAt: now(6),
    updatedAt: now(4),
    firstName: 'Camila',
    lastName: 'Santos',
    email: 'camila.santos@example.com',
    phone: '',
    city: 'Chihuahua',
    state: 'Chihuahua',
    country: 'Mexico',
    preferredLanguage: 'Spanish',
    source: 'Google search',
    campaignSource: 'Google',
    interestedProducts: [product('NAD+', 'Longevity & Cellular Health'), product('GHK-Cu', 'Recovery & Regeneration', 'secondary')],
    primaryGoal: 'Longevity and cellular resilience research',
    budgetRange: '$150-$250',
    status: 'new',
    notes: 'Needs email follow-up.',
    intakeSubmission: intake({ age: '46', budget: '$150-$250', deliveryCity: 'Chihuahua', preferredContactMethod: 'Email' }),
    timeline: [timeline('lead_created', 'Lead captured from Google', undefined, 6), timeline('intake_submitted', 'Research intake submitted', undefined, 6)],
  }),
  buildLead({
    id: createUuid(),
    createdAt: now(8),
    updatedAt: now(3),
    firstName: 'Ethan',
    lastName: 'Brooks',
    email: 'ethan.brooks@example.com',
    phone: '575-555-0166',
    city: 'Las Cruces',
    state: 'NM',
    country: 'United States',
    preferredLanguage: 'English',
    source: 'Referral',
    campaignSource: 'Referral',
    interestedProducts: [product('BPC + TB', 'Recovery & Regeneration')],
    primaryGoal: 'Recovery research planning',
    budgetRange: '$250-$500',
    status: 'qualified',
    notes: 'Referral from existing customer.',
    lastContactedAt: now(3),
    intakeSubmission: intake({ age: '39', budget: '$250-$500', deliveryCity: 'Las Cruces', preferredContactMethod: 'Email' }),
    timeline: [timeline('lead_created', 'Lead created from referral', undefined, 8), timeline('status_changed', 'Marked qualified', undefined, 3)],
  }),
  buildLead({
    id: createUuid(),
    createdAt: now(0),
    updatedAt: now(0),
    firstName: 'Sofia',
    lastName: 'Martinez',
    email: 'sofia.martinez@example.com',
    phone: '915-555-0191',
    city: 'El Paso',
    state: 'TX',
    country: 'United States',
    preferredLanguage: 'Spanish',
    source: 'Website intake',
    campaignSource: 'Instagram',
    interestedProducts: [product('Kisspeptin', 'Hormone & Wellness')],
    primaryGoal: 'Endocrine signaling research',
    budgetRange: '$500+',
    status: 'new',
    notes: '',
    intakeSubmission: intake({ age: '31', deliveryCity: 'El Paso', mainGoal: 'Endocrine signaling research' }),
    timeline: [timeline('lead_created', 'Lead captured from website intake'), timeline('intake_submitted', 'Research intake submitted')],
  }),
  buildLead({
    id: createUuid(),
    createdAt: now(10),
    updatedAt: now(10),
    firstName: 'Diego',
    lastName: 'Ramos',
    email: 'diego.ramos@example.com',
    phone: '+52 656 555 0117',
    city: 'Ciudad Juarez',
    state: 'Chihuahua',
    country: 'Mexico',
    preferredLanguage: 'Spanish',
    source: 'Instagram DM',
    campaignSource: 'Instagram',
    interestedProducts: [product('GHK-CU', 'Recovery & Regeneration')],
    primaryGoal: 'Copper peptide educational inquiry',
    budgetRange: '$150-$250',
    status: 'contacted',
    notes: 'Requested catalog links.',
    lastContactedAt: now(10),
    intakeSubmission: intake({ age: '44', budget: '$150-$250', deliveryCity: 'Ciudad Juarez', preferredContactMethod: 'WhatsApp' }),
    timeline: [timeline('lead_created', 'Lead captured from Instagram DM', undefined, 10), timeline('status_changed', 'Marked contacted', undefined, 10)],
  }),
  buildLead({
    id: createUuid(),
    createdAt: now(3),
    updatedAt: now(2),
    firstName: 'Valeria',
    lastName: 'Ortega',
    email: 'valeria.ortega@example.com',
    phone: '+52 614 555 0104',
    city: 'Chihuahua',
    state: 'Chihuahua',
    country: 'Mexico',
    preferredLanguage: 'Spanish',
    source: 'Google search',
    campaignSource: 'Google',
    interestedProducts: [product('Retatrutide', 'Metabolic & Weight Management'), product('MOTS-C', 'Metabolic & Weight Management', 'secondary')],
    primaryGoal: 'Metabolic research comparison',
    budgetRange: '$500+',
    status: 'qualified',
    notes: 'High intent, asked about availability.',
    lastContactedAt: now(2),
    intakeSubmission: intake({ age: '37', budget: '$500+', deliveryCity: 'Chihuahua', preferredContactMethod: 'WhatsApp' }),
    timeline: [timeline('lead_created', 'Lead captured from Google', undefined, 3), timeline('status_changed', 'Marked qualified', undefined, 2)],
  }),
  buildLead({
    id: createUuid(),
    createdAt: now(15),
    updatedAt: now(12),
    firstName: 'Noah',
    lastName: 'Kim',
    email: 'noah.kim@example.com',
    phone: '575-555-0188',
    city: 'Las Cruces',
    state: 'NM',
    country: 'United States',
    preferredLanguage: 'English',
    source: 'Referral',
    campaignSource: 'Referral',
    interestedProducts: [product('NAD+', 'Longevity & Cellular Health'), product('GHK-CU', 'Recovery & Regeneration', 'secondary')],
    primaryGoal: 'Cellular resilience and matrix biology inquiry',
    budgetRange: '$250-$500',
    status: 'lost',
    notes: 'Paused follow-up until next month.',
    lastContactedAt: now(12),
    intakeSubmission: intake({ age: '50', budget: '$250-$500', deliveryCity: 'Las Cruces', preferredContactMethod: 'Email' }),
    timeline: [timeline('lead_created', 'Lead created from referral', undefined, 15), timeline('status_changed', 'Marked lost for now', undefined, 12)],
  }),
]

function canUseStorage() {
  return typeof window !== 'undefined' && Boolean(window.localStorage)
}

function normalizeLead(lead: Lead): Lead {
  const nextLead = {
    ...lead,
    updatedAt: lead.updatedAt || lead.createdAt,
    state: lead.state || '',
    country: lead.country || 'United States',
    preferredLanguage: lead.preferredLanguage || 'English',
    source: lead.source || lead.campaignSource || 'Website intake',
    budgetRange: lead.budgetRange || lead.intakeSubmission?.budget || '',
    status: lead.status || 'new',
    notes: lead.notes || '',
    timeline: lead.timeline || [],
    interestedProducts: lead.interestedProducts || [],
  }

  return {
    ...nextLead,
    leadScore: calculateLeadScore(nextLead),
  }
}

function mapLegacyLead(lead: CustomerLead): Lead {
  const intakeSubmission = intake({
    id: createUuid(),
    submittedAt: lead.createdAt,
    age: lead.age,
    sex: lead.sex,
    weight: lead.currentWeight,
    height: lead.height,
    mainGoal: lead.mainGoal,
    currentRoutine: lead.lifestyleAnswers?.lifestyleActivity || '',
    sleepQuality: lead.lifestyleAnswers?.sleepQuality || '',
    appetite: '',
    energy: lead.lifestyleAnswers?.energyLevels || '',
    previousProductsUsed: lead.experienceAnswers?.peptideExperience || '',
    medicalConditions: lead.sensitivities,
    medications: lead.medicationsOrCompounds,
    budget: '',
    deliveryCity: lead.city,
    preferredContactMethod: lead.preferredContactMethod,
    consentToContact: lead.consentAccepted,
    researchUseAcknowledgment: lead.consentAccepted,
  })

  return buildLead({
    id: createUuid(),
    createdAt: lead.createdAt,
    updatedAt: lead.createdAt,
    firstName: lead.firstName,
    lastName: lead.lastName,
    email: lead.email,
    phone: lead.phone,
    city: lead.city,
    state: '',
    country: 'United States',
    preferredLanguage: 'English',
    source: 'Website intake',
    campaignSource: 'Website Intake',
    interestedProducts: (lead.experienceAnswers?.interestedProducts?.length
      ? lead.experienceAnswers.interestedProducts
      : lead.recommendedProducts.map((item) => item.name)
    ).map((name) => product(name)),
    primaryGoal: lead.mainGoal,
    budgetRange: '',
    status: lead.status || 'new',
    notes: lead.notes || '',
    intakeSubmission,
    timeline: [
      timeline('lead_created', 'Lead migrated from intake storage'),
      timeline('intake_submitted', 'Research intake submitted'),
    ],
  })
}

function getLegacyLeads() {
  if (!canUseStorage()) {
    return []
  }

  try {
    const stored = window.localStorage.getItem(LEGACY_INTAKE_STORAGE_KEY)
    return stored ? (JSON.parse(stored) as CustomerLead[]).map(mapLegacyLead) : []
  } catch {
    return []
  }
}

function getLocalLeads() {
  if (!canUseStorage()) {
    return sampleLeads
  }

  try {
    const stored = window.localStorage.getItem(CRM_LEADS_STORAGE_KEY)
    if (stored) {
      return (JSON.parse(stored) as Lead[]).map(normalizeLead)
    }
  } catch {
    return sampleLeads
  }

  const seeded = [...getLegacyLeads(), ...sampleLeads]
  window.localStorage.setItem(CRM_LEADS_STORAGE_KEY, JSON.stringify(seeded))
  return seeded
}

function persistLocalLeads(leads: Lead[]) {
  if (canUseStorage()) {
    window.localStorage.setItem(CRM_LEADS_STORAGE_KEY, JSON.stringify(leads.map(normalizeLead)))
  }
}

function getLocalNotes() {
  if (!canUseStorage()) {
    return []
  }

  try {
    const stored = window.localStorage.getItem(CRM_NOTES_STORAGE_KEY)
    return stored ? (JSON.parse(stored) as CRMNote[]) : []
  } catch {
    return []
  }
}

function persistLocalNotes(notes: CRMNote[]) {
  if (canUseStorage()) {
    window.localStorage.setItem(CRM_NOTES_STORAGE_KEY, JSON.stringify(notes))
  }
}

function rowToIntake(row: IntakeRow): IntakeSubmission {
  return {
    id: row.id,
    submittedAt: row.created_at,
    age: row.age?.toString() || '',
    sex: row.sex || '',
    weight: row.weight || '',
    height: row.height || '',
    mainGoal: row.main_goal || '',
    currentRoutine: row.current_routine || '',
    sleepQuality: row.sleep_quality || '',
    appetite: row.appetite || '',
    energy: row.energy || '',
    previousProductsUsed: row.previous_products_used || '',
    medicalConditions: row.medical_conditions || '',
    medications: row.medications || '',
    budget: row.budget || '',
    deliveryCity: row.delivery_city || '',
    preferredContactMethod: row.preferred_contact_method || '',
    consentToContact: row.consent_to_contact,
    researchUseAcknowledgment: row.research_use_acknowledgment,
  }
}

function rowToTimeline(row: TimelineRow): TimelineEvent {
  return {
    id: row.id,
    createdAt: row.created_at,
    type: row.event_type,
    title: row.title,
    description: row.description || undefined,
    metadata: row.metadata || undefined,
  }
}

function rowToNote(row: NoteRow): CRMNote {
  return {
    id: row.id,
    leadId: row.lead_id,
    createdAt: row.created_at,
    note: row.note,
    createdBy: row.created_by,
  }
}

function rowToLead(row: LeadRow, intakeSubmission?: IntakeSubmission, timelineEvents: TimelineEvent[] = []): Lead {
  return normalizeLead({
    id: row.id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    phone: row.phone,
    city: row.city,
    state: row.state,
    country: row.country,
    preferredLanguage: row.preferred_language,
    source: row.source,
    campaignSource: row.campaign_source,
    interestedProducts: row.interested_products.map((productName) => ({ productName })),
    primaryGoal: row.primary_goal,
    budgetRange: row.budget_range,
    status: row.status,
    leadScore: {
      score: row.lead_score,
      explanation: row.lead_score_explanation || [],
    },
    notes: '',
    lastContactedAt: row.last_contacted_at || undefined,
    intakeSubmission,
    timeline: timelineEvents,
  })
}

function leadToRow(lead: Lead): LeadRow {
  const scored = normalizeLead(lead)
  return {
    id: scored.id,
    created_at: scored.createdAt,
    updated_at: scored.updatedAt,
    first_name: scored.firstName,
    last_name: scored.lastName,
    email: scored.email,
    phone: scored.phone,
    city: scored.city,
    state: scored.state,
    country: scored.country,
    preferred_language: scored.preferredLanguage,
    source: scored.source,
    campaign_source: scored.campaignSource,
    interested_products: scored.interestedProducts.map((item) => item.productName),
    primary_goal: scored.primaryGoal,
    budget_range: scored.budgetRange,
    status: scored.status,
    lead_score: scored.leadScore.score,
    lead_score_explanation: scored.leadScore.explanation,
    last_contacted_at: scored.lastContactedAt || null,
    consent_to_contact: Boolean(scored.intakeSubmission?.consentToContact),
    research_use_acknowledgment: Boolean(scored.intakeSubmission?.researchUseAcknowledgment),
  }
}

function intakeToRow(leadId: string, submission: IntakeSubmission): Omit<IntakeRow, 'lead_id'> & { lead_id: string } {
  return {
    id: submission.id || createUuid(),
    lead_id: leadId,
    created_at: submission.submittedAt,
    age: submission.age ? Number.parseInt(submission.age, 10) || null : null,
    sex: submission.sex,
    weight: submission.weight,
    height: submission.height,
    main_goal: submission.mainGoal,
    current_routine: submission.currentRoutine,
    sleep_quality: submission.sleepQuality,
    appetite: submission.appetite,
    energy: submission.energy,
    previous_products_used: submission.previousProductsUsed,
    medical_conditions: submission.medicalConditions,
    medications: submission.medications,
    budget: submission.budget,
    delivery_city: submission.deliveryCity,
    preferred_contact_method: submission.preferredContactMethod,
    consent_to_contact: submission.consentToContact,
    research_use_acknowledgment: submission.researchUseAcknowledgment,
  }
}

function eventToRow(leadId: string, event: TimelineEvent): Omit<TimelineRow, 'lead_id'> & { lead_id: string } {
  return {
    id: event.id || createUuid(),
    lead_id: leadId,
    created_at: event.createdAt || new Date().toISOString(),
    event_type: event.type,
    title: event.title,
    description: event.description || null,
    metadata: event.metadata || {},
  }
}

function assertSupabase() {
  if (!supabase || !isCrmUsingSupabase()) {
    throw new Error('Supabase CRM is not configured for this environment.')
  }

  return supabase
}

async function getSupabaseLeads() {
  const client = assertSupabase()
  const { data, error } = await client
    .from('crm_leads')
    .select('*, crm_intake_submissions(*), crm_timeline_events(*)')
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return ((data || []) as Array<LeadRow & {
    crm_intake_submissions?: IntakeRow[]
    crm_timeline_events?: TimelineRow[]
  }>).map((row) =>
    rowToLead(
      row,
      row.crm_intake_submissions?.[0] ? rowToIntake(row.crm_intake_submissions[0]) : undefined,
      (row.crm_timeline_events || [])
        .map(rowToTimeline)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    ),
  )
}

export async function getLeads() {
  if (isCrmUsingSupabase()) {
    return getSupabaseLeads()
  }

  return getLocalLeads()
}

export async function getLeadById(id: string) {
  if (isCrmUsingSupabase()) {
    const leads = await getSupabaseLeads()
    return leads.find((lead) => lead.id === id)
  }

  return getLocalLeads().find((lead) => lead.id === id)
}

export async function saveIntakeSubmission(leadId: string, submission: IntakeSubmission) {
  if (isCrmUsingSupabase()) {
    const client = assertSupabase()
    const { error } = await client.from('crm_intake_submissions').upsert(intakeToRow(leadId, submission))
    if (error) {
      throw error
    }
    return submission
  }

  const leads = getLocalLeads()
  const nextLeads = leads.map((lead) => (lead.id === leadId ? normalizeLead({ ...lead, intakeSubmission: submission }) : lead))
  persistLocalLeads(nextLeads)
  return submission
}

export async function getIntakeSubmissionByLeadId(leadId: string) {
  if (isCrmUsingSupabase()) {
    const client = assertSupabase()
    const { data, error } = await client
      .from('crm_intake_submissions')
      .select('*')
      .eq('lead_id', leadId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) {
      throw error
    }

    return data ? rowToIntake(data as IntakeRow) : undefined
  }

  return getLocalLeads().find((lead) => lead.id === leadId)?.intakeSubmission
}

export async function addTimelineEvent(leadId: string, event: Omit<TimelineEvent, 'id' | 'createdAt'>) {
  const nextEvent: TimelineEvent = {
    id: createUuid(),
    createdAt: new Date().toISOString(),
    ...event,
  }

  if (isCrmUsingSupabase()) {
    const client = assertSupabase()
    const { error } = await client.from('crm_timeline_events').insert(eventToRow(leadId, nextEvent))
    if (error) {
      throw error
    }
    return getLeadById(leadId)
  }

  const leads = getLocalLeads()
  const current = leads.find((lead) => lead.id === leadId)
  if (!current) {
    return undefined
  }

  const nextLead = normalizeLead({
    ...current,
    timeline: [nextEvent, ...current.timeline],
    updatedAt: new Date().toISOString(),
  })
  persistLocalLeads(leads.map((lead) => (lead.id === leadId ? nextLead : lead)))
  return nextLead
}

export async function getTimelineEvents(leadId: string) {
  if (isCrmUsingSupabase()) {
    const client = assertSupabase()
    const { data, error } = await client
      .from('crm_timeline_events')
      .select('*')
      .eq('lead_id', leadId)
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    return ((data || []) as TimelineRow[]).map(rowToTimeline)
  }

  return getLocalLeads().find((lead) => lead.id === leadId)?.timeline || []
}

export async function saveLead(lead: Lead) {
  const nextLead = normalizeLead({ ...lead, updatedAt: new Date().toISOString() })

  if (isCrmUsingSupabase()) {
    const client = assertSupabase()
    const { error } = await client.from('crm_leads').upsert(leadToRow(nextLead))
    if (error) {
      throw error
    }

    if (nextLead.intakeSubmission) {
      await saveIntakeSubmission(nextLead.id, nextLead.intakeSubmission)
    }

    for (const event of nextLead.timeline) {
      const { error: eventError } = await client.from('crm_timeline_events').upsert(eventToRow(nextLead.id, event))
      if (eventError) {
        throw eventError
      }
    }

    if (nextLead.interestedProducts.length > 0) {
      await client.from('crm_products_interests').delete().eq('lead_id', nextLead.id)
      const { error: productsError } = await client.from('crm_products_interests').insert(
        nextLead.interestedProducts.map((item) => ({
          lead_id: nextLead.id,
          product_name: item.productName,
          category: item.category || null,
          priority: item.priority || null,
        })),
      )
      if (productsError) {
        throw productsError
      }
    }

    return nextLead
  }

  const leads = getLocalLeads()
  const exists = leads.some((item) => item.id === nextLead.id)
  persistLocalLeads(exists ? leads.map((item) => (item.id === nextLead.id ? nextLead : item)) : [nextLead, ...leads])
  return nextLead
}

export async function updateLead(id: string, updates: Partial<Lead>) {
  const current = await getLeadById(id)

  if (!current) {
    return undefined
  }

  const nextLead = normalizeLead({
    ...current,
    ...updates,
    id,
    updatedAt: new Date().toISOString(),
  })

  if (isCrmUsingSupabase()) {
    const client = assertSupabase()
    const { error } = await client.from('crm_leads').update(leadToRow(nextLead)).eq('id', id)
    if (error) {
      throw error
    }
    return nextLead
  }

  persistLocalLeads(getLocalLeads().map((lead) => (lead.id === id ? nextLead : lead)))
  return nextLead
}

export async function deleteLead(id: string) {
  if (isCrmUsingSupabase()) {
    const client = assertSupabase()
    const { error } = await client.from('crm_leads').delete().eq('id', id)
    if (error) {
      throw error
    }
    return
  }

  persistLocalLeads(getLocalLeads().filter((lead) => lead.id !== id))
}

export async function addNote(leadId: string, note: string, createdBy = 'admin') {
  const nextNote: CRMNote = {
    id: createUuid(),
    leadId,
    createdAt: new Date().toISOString(),
    note,
    createdBy,
  }

  if (isCrmUsingSupabase()) {
    const client = assertSupabase()
    const { data, error } = await client
      .from('crm_notes')
      .insert({
        id: nextNote.id,
        lead_id: leadId,
        created_at: nextNote.createdAt,
        note,
        created_by: createdBy,
      })
      .select('*')
      .single()

    if (error) {
      throw error
    }

    await addTimelineEvent(leadId, {
      type: 'note_added',
      title: 'Internal note added',
    })

    return rowToNote(data as NoteRow)
  }

  const notes = getLocalNotes()
  persistLocalNotes([nextNote, ...notes])
  await addTimelineEvent(leadId, {
    type: 'note_added',
    title: 'Internal note added',
  })
  return nextNote
}

export async function getNotes(leadId: string) {
  if (isCrmUsingSupabase()) {
    const client = assertSupabase()
    const { data, error } = await client
      .from('crm_notes')
      .select('*')
      .eq('lead_id', leadId)
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    return ((data || []) as NoteRow[]).map(rowToNote)
  }

  return getLocalNotes().filter((note) => note.leadId === leadId)
}

export function createCRMLeadFromIntake(input: {
  firstName: string
  lastName: string
  email: string
  phone: string
  city: string
  state?: string
  country?: string
  preferredLanguage?: string
  source?: string
  campaignSource?: CampaignSource
  interestedProducts: ProductInterest[]
  primaryGoal: string
  budgetRange?: string
  status?: LeadStatus
  notes?: string
  intakeSubmission: IntakeSubmission
}) {
  const createdAt = new Date().toISOString()
  return buildLead({
    id: createUuid(),
    createdAt,
    updatedAt: createdAt,
    firstName: input.firstName,
    lastName: input.lastName,
    email: input.email,
    phone: input.phone,
    city: input.city,
    state: input.state || '',
    country: input.country || 'United States',
    preferredLanguage: input.preferredLanguage || 'English',
    source: input.source || 'Website intake',
    campaignSource: input.campaignSource || 'Website Intake',
    interestedProducts: input.interestedProducts,
    primaryGoal: input.primaryGoal,
    budgetRange: input.budgetRange || input.intakeSubmission.budget,
    status: input.status || 'new',
    notes: input.notes || '',
    intakeSubmission: {
      ...input.intakeSubmission,
      id: input.intakeSubmission.id || createUuid(),
    },
    timeline: [
      {
        id: createUuid(),
        createdAt,
        type: 'lead_created',
        title: 'Lead created from website intake',
      },
      {
        id: createUuid(),
        createdAt,
        type: 'intake_submitted',
        title: 'Research intake submitted',
        description: 'Submission includes research-use-only acknowledgment.',
      },
    ],
  })
}
