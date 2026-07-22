import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const migration = readFileSync(
  new URL('../../../supabase/migrations/202607220002_require_complete_client_intake.sql', import.meta.url),
  'utf8',
)

describe('complete client intake migration', () => {
  it('enforces complete intake at submission and activation', () => {
    expect(migration).toContain('portal_client_intake_is_complete')
    expect(migration).toContain('complete client intake required')
    expect(migration).toContain('require_complete_intake_before_activation')
    expect(migration).toContain("status.status in ('active', 'pending_review')")
  })

  it('checks every required profile, research, lifestyle, notification, and consent group', () => {
    for (const field of ['legal_name', 'mobile', 'preferred_language', 'time_zone', 'date_of_birth', 'height_cm', 'starting_weight_kg', 'current_weight_kg', 'waist_cm', 'goals', 'research_interests', 'interested_products', 'activity_level', 'exercise_frequency', 'average_sleep_hours']) {
      expect(migration).toContain(field)
    }
    for (const consent of ['terms', 'privacy', 'research_use_only', 'no_medical_advice', 'electronic_communications', 'progress_data']) {
      expect(migration).toContain(consent)
    }
  })
})
