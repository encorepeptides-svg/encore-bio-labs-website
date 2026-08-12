import type { LeadStatus } from '../../types/crm'
import { useTranslation } from '../../i18n/LocaleContext'

const statusStyles: Record<LeadStatus, string> = {
  new: 'bg-teal-50 text-teal-800 ring-teal-700/10',
  contacted: 'bg-sky-50 text-sky-800 ring-sky-700/10',
  qualified: 'bg-emerald-50 text-emerald-800 ring-emerald-700/10',
  consultation_requested: 'bg-violet-50 text-violet-800 ring-violet-700/10',
  converted: 'bg-slate-900 text-white ring-slate-900/10',
  lost: 'bg-slate-100 text-slate-600 ring-slate-900/10',
}

export function LeadStatusBadge({ status }: { status: LeadStatus }) {
  const { t } = useTranslation('crm')
  const labels: Record<LeadStatus, string> = {
    new: t('statusNew'),
    contacted: t('statusContacted'),
    qualified: t('statusQualified'),
    consultation_requested: t('statusConsultationRequested'),
    converted: t('statusConverted'),
    lost: t('statusLost'),
  }
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ${statusStyles[status]}`}>
      {labels[status]}
    </span>
  )
}
