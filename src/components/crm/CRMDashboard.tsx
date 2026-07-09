import { BarChart3, Clock, MapPin, PackageSearch, TrendingUp, Users } from 'lucide-react'
import type { ReactNode } from 'react'
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

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(
    new Date(value),
  )
}

export function CRMDashboard({ leads }: { leads: Lead[] }) {
  const newThisWeek = leads.filter((lead) => isThisWeek(lead.createdAt)).length
  const highIntent = leads.filter((lead) => lead.leadScore.score >= 70).length
  const followUpNeeded = leads.filter((lead) => !lead.lastContactedAt && ['new', 'qualified'].includes(lead.status)).length
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
        <MetricCard icon={<Users size={19} />} label="Total leads" value={leads.length.toString()} />
        <MetricCard icon={<TrendingUp size={19} />} label="New leads this week" value={newThisWeek.toString()} />
        <MetricCard icon={<BarChart3 size={19} />} label="High intent leads" value={highIntent.toString()} />
        <MetricCard icon={<Clock size={19} />} label="Follow-up needed" value={followUpNeeded.toString()} />
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <RankedPanel icon={<PackageSearch size={18} />} title="Most requested products" entries={productCounts} />
        <RankedPanel icon={<MapPin size={18} />} title="Leads by city" entries={cityCounts} />
        <RankedPanel icon={<BarChart3 size={18} />} title="Leads by source" entries={sourceCounts} />
      </div>

      <section className="rounded-[1.75rem] border border-slate-900/10 bg-white/78 p-5 shadow-[0_24px_80px_rgba(7,23,36,0.08)] backdrop-blur-2xl">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">Recent intake submissions</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-[-0.04em] text-[#071724]">Latest research inquiries</h2>
          </div>
          <a href="/intake" className="rounded-full border border-slate-900/10 bg-white px-4 py-2 text-sm font-semibold text-[#071724]">
            Open intake
          </a>
        </div>
        <div className="mt-5 grid gap-3">
          {recentIntakes.map((lead) => (
            <div key={lead.id} className="grid gap-3 rounded-2xl border border-slate-900/10 bg-[#f5f5f2]/80 p-4 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <p className="font-semibold text-[#071724]">{lead.firstName} {lead.lastName}</p>
                <p className="mt-1 text-sm text-slate-600">
                  {lead.primaryGoal} · {lead.interestedProducts.map((item) => item.productName).join(', ')}
                </p>
              </div>
              <div className="text-sm font-semibold text-slate-500">{formatDate(lead.intakeSubmission?.submittedAt || lead.createdAt)}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

function MetricCard({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-[1.5rem] border border-slate-900/10 bg-white/78 p-5 shadow-[0_18px_60px_rgba(7,23,36,0.07)] backdrop-blur-2xl">
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
