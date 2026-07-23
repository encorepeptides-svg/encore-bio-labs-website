import type { IntakeFormData } from '../../data/intake'
import { products } from '../../data/products'
import type { Lead } from '../../types/crm'
import { saveLead } from '../crmStorage'
import { isSupabaseConfigured, supabase } from '../supabaseClient'

export const INTAKE_SESSION_KEY = 'encore-intake-draft-v1'

export type StoredIntakeHandoff = {
  formData: IntakeFormData
  handoffToken: string
  locale: 'en' | 'es'
  submitted: boolean
}

function goalPrefill(mainGoal: IntakeFormData['mainGoal']) {
  switch (mainGoal) {
    case 'Metabolic Signaling':
      return { goal: 'weight-management', interest: 'metabolic-weight-management' }
    case 'Repair & Regeneration Models':
      return { goal: 'recovery', interest: 'recovery-regeneration' }
    case 'Cellular Resilience / Aging Biology':
      return { goal: 'wellness', interest: 'longevity-cellular-health' }
    case 'Neurobiology & Performance Models':
      return { goal: 'energy', interest: 'cognitive-performance' }
    case 'Endocrine Signaling':
      return { goal: 'wellness', interest: 'hormone-wellness' }
    default:
      return { goal: 'research-documentation', interest: 'longevity-cellular-health' }
  }
}

export function normalizeHelpNeeded(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
  return typeof value === 'string' && value.trim() ? [value] : []
}

export function createIntakeHandoffToken() {
  return crypto.randomUUID()
}

export function readStoredIntakeHandoff(): StoredIntakeHandoff | null {
  if (typeof window === 'undefined') return null

  try {
    const raw = window.sessionStorage.getItem(INTAKE_SESSION_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<StoredIntakeHandoff> & { phase?: string; formData?: Partial<IntakeFormData> }
    if (!parsed.formData || !parsed.handoffToken || (parsed.phase !== 'results' && !parsed.submitted)) return null
    return {
      formData: {
        ...parsed.formData,
        helpNeeded: normalizeHelpNeeded(parsed.formData.helpNeeded),
      } as IntakeFormData,
      handoffToken: parsed.handoffToken,
      locale: parsed.locale === 'es' ? 'es' : 'en',
      submitted: true,
    }
  } catch {
    return null
  }
}

export async function submitPublicIntake({
  lead,
  formData,
  handoffToken,
  locale,
}: {
  lead: Lead
  formData: IntakeFormData
  handoffToken: string
  locale: 'en' | 'es'
}) {
  if (!isSupabaseConfigured || !supabase) return saveLead(lead)

  const prefill = goalPrefill(formData.mainGoal)
  const interestedProductSlugs = formData.interestedProducts
    .map((name) => products.find((product) => product.name === name)?.slug)
    .filter((slug): slug is string => Boolean(slug))

  const { error } = await supabase.rpc('submit_public_intake', {
    submission: {
      lead_id: lead.id,
      intake_id: lead.intakeSubmission?.id,
      handoff_token: handoffToken,
      locale,
      first_name: lead.firstName,
      last_name: lead.lastName,
      email: lead.email,
      phone: lead.phone,
      city: lead.city,
      preferred_contact_method: lead.intakeSubmission?.preferredContactMethod,
      primary_goal: lead.primaryGoal,
      interested_products: lead.interestedProducts.map((item) => item.productName),
      lead_score: lead.leadScore.score,
      lead_score_explanation: lead.leadScore.explanation,
      current_routine: lead.intakeSubmission?.currentRoutine,
      sleep_quality: lead.intakeSubmission?.sleepQuality,
      appetite: lead.intakeSubmission?.appetite,
      energy: lead.intakeSubmission?.energy,
      previous_products_used: lead.intakeSubmission?.previousProductsUsed,
      medical_conditions: lead.intakeSubmission?.medicalConditions,
      medications: lead.intakeSubmission?.medications,
      delivery_city: lead.intakeSubmission?.deliveryCity,
      consent_to_contact: lead.intakeSubmission?.consentToContact,
      research_use_acknowledgment: lead.intakeSubmission?.researchUseAcknowledgment,
      form_data: formData,
      portal_prefill: {
        goals: [prefill.goal],
        research_interests: [prefill.interest],
        interested_products: interestedProductSlugs,
      },
    },
  })

  if (error) throw error
  return lead
}

export async function claimPublicIntakeHandoff(handoffToken: string) {
  if (!isSupabaseConfigured || !supabase || !handoffToken) return false
  const { data, error } = await supabase.rpc('claim_public_intake', { handoff_token: handoffToken })
  if (error) throw error
  return data === true
}
