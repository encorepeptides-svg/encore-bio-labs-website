import type { Lead } from '../types/crm'

function escapeCsv(value: unknown) {
  const text = String(value ?? '')
  if (/[",\n\r]/.test(text)) {
    return `"${text.replaceAll('"', '""')}"`
  }

  return text
}

export function leadsToCsv(leads: Lead[]) {
  const headers = [
    'id',
    'createdAt',
    'firstName',
    'lastName',
    'email',
    'phone',
    'city',
    'state',
    'country',
    'preferredLanguage',
    'source',
    'campaignSource',
    'interestedProducts',
    'primaryGoal',
    'budgetRange',
    'status',
    'leadScore',
    'leadScoreExplanation',
    'lastContactedAt',
  ]

  const rows = leads.map((lead) => [
    lead.id,
    lead.createdAt,
    lead.firstName,
    lead.lastName,
    lead.email,
    lead.phone,
    lead.city,
    lead.state,
    lead.country,
    lead.preferredLanguage,
    lead.source,
    lead.campaignSource,
    lead.interestedProducts.map((item) => item.productName).join('; '),
    lead.primaryGoal,
    lead.budgetRange,
    lead.status,
    lead.leadScore.score,
    lead.leadScore.explanation.join('; '),
    lead.lastContactedAt || '',
  ])

  return [headers, ...rows].map((row) => row.map(escapeCsv).join(',')).join('\n')
}

export function downloadLeadsCsv(leads: Lead[], filename = 'encore-crm-leads.csv') {
  const blob = new Blob([leadsToCsv(leads)], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}
