import type { Lead } from '../types/crm'

export const CRM_FOLLOW_UP_INTERVAL_MS = 72 * 60 * 60 * 1000

export function leadNeedsFollowUp(lead: Lead, now = Date.now()) {
  if (lead.status === 'converted' || lead.status === 'lost') return false
  if (!lead.lastContactedAt) return true

  const lastContactedAt = new Date(lead.lastContactedAt).getTime()
  return Number.isNaN(lastContactedAt) || now - lastContactedAt >= CRM_FOLLOW_UP_INTERVAL_MS
}

export function leadFollowUpTimestamp(lead: Lead) {
  return new Date(lead.lastContactedAt || lead.createdAt).getTime()
}
