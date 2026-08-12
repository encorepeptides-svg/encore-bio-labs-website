import { describe, expect, it } from 'vitest'
import { CRM_FOLLOW_UP_INTERVAL_MS, leadNeedsFollowUp } from './crmFollowUp'
import type { Lead } from '../types/crm'

function lead(overrides: Partial<Lead> = {}): Lead {
  return {
    id: 'lead-1', createdAt: '2026-08-01T00:00:00.000Z', updatedAt: '2026-08-01T00:00:00.000Z',
    firstName: 'Test', lastName: 'Lead', email: 'lead@example.com', phone: '', city: '', state: '', country: '',
    preferredLanguage: 'Spanish', source: 'Website intake', campaignSource: 'Website Intake', interestedProducts: [],
    primaryGoal: '', budgetRange: '', status: 'new', leadScore: { score: 50, explanation: [] }, notes: '', timeline: [],
    ...overrides,
  }
}

describe('leadNeedsFollowUp', () => {
  const now = new Date('2026-08-11T12:00:00.000Z').getTime()

  it('flags every active lead that has never been contacted', () => {
    expect(leadNeedsFollowUp(lead(), now)).toBe(true)
  })

  it('waits 72 hours after a recorded contact before flagging again', () => {
    expect(leadNeedsFollowUp(lead({ status: 'contacted', lastContactedAt: new Date(now - CRM_FOLLOW_UP_INTERVAL_MS + 1).toISOString() }), now)).toBe(false)
    expect(leadNeedsFollowUp(lead({ status: 'contacted', lastContactedAt: new Date(now - CRM_FOLLOW_UP_INTERVAL_MS).toISOString() }), now)).toBe(true)
  })

  it('never queues converted or lost leads', () => {
    expect(leadNeedsFollowUp(lead({ status: 'converted' }), now)).toBe(false)
    expect(leadNeedsFollowUp(lead({ status: 'lost' }), now)).toBe(false)
  })
})
