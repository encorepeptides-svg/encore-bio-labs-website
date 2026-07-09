import type { LeadStatus } from '../types/crm'

export function leadStatusLabel(status: LeadStatus) {
  return status
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}
