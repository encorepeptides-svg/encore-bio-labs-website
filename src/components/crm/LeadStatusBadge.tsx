import type { LeadStatus } from '../../types/crm'
import { leadStatusLabel } from '../../lib/crmLabels'

const statusStyles: Record<LeadStatus, string> = {
  new: 'bg-teal-50 text-teal-800 ring-teal-700/10',
  contacted: 'bg-sky-50 text-sky-800 ring-sky-700/10',
  qualified: 'bg-emerald-50 text-emerald-800 ring-emerald-700/10',
  consultation_requested: 'bg-violet-50 text-violet-800 ring-violet-700/10',
  converted: 'bg-slate-900 text-white ring-slate-900/10',
  lost: 'bg-slate-100 text-slate-600 ring-slate-900/10',
}

export function LeadStatusBadge({ status }: { status: LeadStatus }) {
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ${statusStyles[status]}`}>
      {leadStatusLabel(status)}
    </span>
  )
}
