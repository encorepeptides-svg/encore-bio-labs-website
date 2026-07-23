import type { PortalOnboardingForm } from './onboardingValidation'
import { supabase } from '../supabaseClient'

export type PortalOnboardingRow = {
  date_of_birth: string | null
  height_cm: number | null
  starting_weight_kg: number | null
  current_weight_kg: number | null
  waist_cm: number | null
  preferred_units: 'imperial' | 'metric'
  goals: string[]
  research_interests: string[]
  interested_products: string[]
  activity_level: string | null
  exercise_frequency: string | null
  average_sleep_hours: number | null
  water_consistency: number | null
  appetite_rating: number | null
  energy_rating: number | null
  stress_rating: number | null
  wellness_rating: number | null
  communication_preferences: Record<string, boolean> | null
  submitted_at: string | null
  draft_data: Partial<PortalOnboardingForm> | null
  draft_current_step: number | null
  draft_saved_at: string | null
  draft_completed_at: string | null
}

export function restorePortalOnboardingForm(
  base: PortalOnboardingForm,
  row: PortalOnboardingRow | null,
): PortalOnboardingForm {
  if (!row) return base
  const metric = row.preferred_units === 'metric'
  const lengthValue = (value: number | null) => value == null ? '' : String(metric ? value : Number((value / 2.54).toFixed(2)))
  const weightValue = (value: number | null) => value == null ? '' : String(metric ? value : Number((value / 0.453592).toFixed(2)))
  const preferences = row.communication_preferences ?? {}
  const canonical: PortalOnboardingForm = {
    ...base,
    dateOfBirth: row.date_of_birth ?? '',
    height: lengthValue(row.height_cm),
    startingWeight: weightValue(row.starting_weight_kg),
    currentWeight: weightValue(row.current_weight_kg),
    waist: lengthValue(row.waist_cm),
    units: row.preferred_units ?? 'imperial',
    goals: row.goals ?? [],
    researchInterests: row.research_interests ?? [],
    interestedProducts: row.interested_products ?? [],
    activity: row.activity_level ?? '',
    exercise: row.exercise_frequency ?? '',
    sleep: row.average_sleep_hours == null ? '' : String(row.average_sleep_hours),
    water: row.water_consistency == null ? '3' : String(row.water_consistency),
    appetite: row.appetite_rating == null ? '3' : String(row.appetite_rating),
    energy: row.energy_rating == null ? '3' : String(row.energy_rating),
    stress: row.stress_rating == null ? '3' : String(row.stress_rating),
    wellness: row.wellness_rating == null ? '3' : String(row.wellness_rating),
    emailNotifications: preferences.email ?? base.emailNotifications,
    portalNotifications: preferences.portal ?? base.portalNotifications,
    orderUpdates: preferences.orders ?? base.orderUpdates,
    checkinReminders: preferences.checkins ?? base.checkinReminders,
    documentNotifications: preferences.documents ?? base.documentNotifications,
    supportNotifications: preferences.support ?? base.supportNotifications,
  }
  return row.draft_data && !row.draft_completed_at ? { ...canonical, ...row.draft_data } : canonical
}

export async function loadPortalOnboardingDraft(userId: string) {
  if (!supabase) throw new Error('Portal data is unavailable.')
  const { data, error } = await supabase
    .from('onboarding_profiles')
    .select('date_of_birth,height_cm,starting_weight_kg,current_weight_kg,waist_cm,preferred_units,goals,research_interests,interested_products,activity_level,exercise_frequency,average_sleep_hours,water_consistency,appetite_rating,energy_rating,stress_rating,wellness_rating,communication_preferences,submitted_at,draft_data,draft_current_step,draft_saved_at,draft_completed_at')
    .eq('user_id', userId)
    .maybeSingle()
  if (error) throw error
  return data as PortalOnboardingRow | null
}

export async function savePortalOnboardingDraft({
  form,
  step,
  knownSavedAt,
}: {
  form: PortalOnboardingForm
  step: number
  knownSavedAt: string | null
}) {
  if (!supabase) throw new Error('Portal data is unavailable.')
  const { data, error } = await supabase.rpc('save_portal_onboarding_draft', {
    draft: form,
    current_step: step,
    known_saved_at: knownSavedAt,
  })
  if (error) throw error
  const result = (data ?? {}) as { status?: 'saved' | 'stale' | 'completed'; saved_at?: string | null }
  return { status: result.status ?? 'saved', savedAt: result.saved_at ?? knownSavedAt }
}
