import { BarChart3, Clock, MapPin, PackageSearch, TrendingUp, Users } from 'lucide-react'
import type { ReactNode } from 'react'
import { useLocale, useTranslation } from '../../i18n/LocaleContext'
import { leadFollowUpTimestamp, leadNeedsFollowUp } from '../../lib/crmFollowUp'
import type { Lead } from '../../types/crm'

function isThisWeek(value: string) {
  const date = new Date(value)
  const today = new Date()
  const start = new Date(today)
  start.setDate(today.getDate() - today.getDay())
  start.setHours(0, 0, 0, 0)
  return date >= start
}

function countBy<T extends string>(values: T[]) {
  return values.reduce<Record<string, number>>((acc, value) => {
    acc[value] = (acc[value] || 0) + 1
    return acc
  }, {})
}

function topEntries(record: Record<string, number>, limit = 5) {
  return Object.entries(record)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
}

function formatDate(value: string, locale: 'en' | 'es') {
  return new Intl.DateTimeFormat(locale === 'es' ? 'es-MX' : 'en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(
    new Date(value),
  )
}

export function CRMDashboard({ leads, onSelect }: { leads: Lead[]; onSelect: (lead: Lead) => void }) {
  const { path, locale } = useLocale()
  const { t } = useTranslation('crm')
  const newThisWeek = leads.filter((lead) => isThisWeek(lead.createdAt)).length
  const highIntent = leads.filter((lead) => lead.leadScore.score >= 70).length
  const followUpQueue = leads
    .filter((lead) => leadNeedsFollowUp(lead))
    .sort((a, b) => leadFollowUpTimestamp(a) - leadFollowUpTimestamp(b))
  const followUpNeeded = followUpQueue.length
  const productCounts = topEntries(countBy(leads.flatMap((lead) => lead.interestedProducts.map((item) => item.productName))))
  const cityCounts = topEntries(countBy(leads.map((lead) => lead.city)))
  const sourceCounts = topEntries(countBy(leads.map((lead) => lead.campaignSource)))
  const recentIntakes = leads
    .filter((lead) => lead.intakeSubmission)
    .sort((a, b) => new Date(b.intakeSubmission?.submittedAt || b.createdAt).getTime() - new Date(a.intakeSubmission?.submittedAt || a.createdAt).getTime())
    .slice(0, 5)

  return (
    <div className="grid gap-5">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={<Users size={19} />} label={t('totalLeads')} value={leads.length.toString()} />
        <MetricCard icon={<TrendingUp size={19} />} label={t('newThisWeek')} value={newThisWeek.toString()} />
        <MetricCard icon={<BarChart3 size={19} />} label={t('highIntent')} value={highIntent.toString()} />
        <MetricCard icon={<Clock size={19} />} label={t('followUpNeeded')} value={followUpNeeded.toString()} urgent={followUpNeeded > 0} />
      </div>

      <section className={`rounded-[1.75rem] border p-5 shadow-[0_24px_80px_rgba(7,23,36,0.08)] ${followUpNeeded ? 'border-amber-300 bg-amber-50' : 'border-emerald-200 bg-emerald-50'}`}>
        <p className={`text-xs font-semibold uppercase tracking-[0.18em] ${followUpNeeded ? 'text-amber-800' : 'text-emerald-800'}`}>{t('followUpQueueEyebrow')}</p>
        <h2 className="mt-1 text-2xl font-semibold tracking-[-0.04em] text-[#071724]">{t('followUpQueueTitle')}</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t('followUpQueueCopy')}</p>
        {followUpQueue.length ? <div className="mt-5 grid gap-3">
          {followUpQueue.slice(0, 8).map((lead) => <button
            key={lead.id}
            type="button"
            onClick={() => onSelect(lead)}
            className="grid gap-3 rounded-2xl border border-amber-900/10 bg-white p-4 text-left transition hover:border-amber-600/35 md:grid-cols-[1fr_auto] md:items-center"
          >
            <span>
              <span className="block font-semibold text-[#071724]">{lead.firstName} {lead.lastName}</span>
              <span className="mt-1 block text-sm text-slate-600">{lead.primaryGoal || lead.interestedProducts.map((item) => item.productName).join(', ')}</span>
            </span>
            <span className="flex items-center gap-3 text-sm font-semibold text-amber-900">
              {lead.lastContactedAt ? t('lastContacted', { date: formatDate(lead.lastContactedAt, locale) }) : t('neverContacted')}
              <span className="rounded-full bg-amber-950 px-3 py-1.5 text-xs text-white">{t('openLead')}</span>
            </span>
          </button>)}
        </div> : <p className="mt-5 rounded-2xl bg-white p-4 text-sm font-semibold text-emerald-900">{t('followUpQueueClear')}</p>}
      </section>

      <div className="grid gap-5 xl:grid-cols-3">
        <RankedPanel icon={<PackageSearch size={18} />} title={t('requestedProducts')} entries={productCounts} />
        <RankedPanel icon={<MapPin size={18} />} title={t('leadsByCity')} entries={cityCounts} />
        <RankedPanel icon={<BarChart3 size={18} />} title={t('leadsBySource')} entries={sourceCounts} />
      </div>

      <section className="rounded-[1.75rem] border border-slate-900/10 bg-white/78 p-5 shadow-[0_24px_80px_rgba(7,23,36,0.08)] backdrop-blur-2xl">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">{t('recentIntakes')}</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-[-0.04em] text-[#071724]">{t('latestInquiries')}</h2>
          </div>
          <a href={path('/intake')} className="rounded-full border border-slate-900/10 bg-white px-4 py-2 text-sm font-semibold text-[#071724]">
            {t('openIntake')}
          </a>
        </div>
        <div className="mt-5 grid gap-3">
          {recentIntakes.map((lead) => (
            <button type="button" onClick={() => onSelect(lead)} key={lead.id} className="grid gap-3 rounded-2xl border border-slate-900/10 bg-[#f5f5f2]/80 p-4 text-left md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <p className="font-semibold text-[#071724]">{lead.firstName} {lead.lastName}</p>
                <p className="mt-1 text-sm text-slate-600">
                  {lead.primaryGoal} · {lead.interestedProducts.map((item) => item.productName).join(', ')}
                </p>
              </div>
              <div className="text-sm font-semibold text-slate-500">{formatDate(lead.intakeSubmission?.submittedAt || lead.createdAt, locale)}</div>
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}

function MetricCard({ icon, label, value, urgent = false }: { icon: ReactNode; label: string; value: string; urgent?: boolean }) {
  return (
    <div className={`rounded-[1.5rem] border p-5 shadow-[0_18px_60px_rgba(7,23,36,0.07)] backdrop-blur-2xl ${urgent ? 'border-amber-300 bg-amber-50' : 'border-slate-900/10 bg-white/78'}`}>
      <div className="flex size-11 items-center justify-center rounded-2xl bg-[#071724] text-teal-300">{icon}</div>
      <div className="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{label}</div>
      <div className="mt-2 text-4xl font-semibold tracking-[-0.06em] text-[#071724]">{value}</div>
    </div>
  )
}

function RankedPanel({ icon, title, entries }: { icon: ReactNode; title: string; entries: Array<[string, number]> }) {
  const max = Math.max(...entries.map((entry) => entry[1]), 1)

  return (
    <section className="rounded-[1.5rem] border border-slate-900/10 bg-white/78 p-5 shadow-[0_18px_60px_rgba(7,23,36,0.07)] backdrop-blur-2xl">
      <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] text-teal-700">
        {icon}
        {title}
      </div>
      <div className="mt-5 grid gap-3">
        {entries.map(([label, value]) => (
          <div key={label}>
            <div className="mb-2 flex items-center justify-between gap-3 text-sm">
              <span className="font-semibold text-[#071724]">{label}</span>
              <span className="font-semibold text-slate-500">{value}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-900/10">
              <div className="h-full rounded-full bg-teal-500" style={{ width: `${(value / max) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
