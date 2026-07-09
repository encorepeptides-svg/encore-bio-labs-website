import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { leadStatusLabel } from '../../lib/crmLabels'
import type { Lead, LeadStatus } from '../../types/crm'
import { LeadStatusBadge } from './LeadStatusBadge'

const statuses: Array<LeadStatus | 'all'> = ['all', 'new', 'contacted', 'qualified', 'consultation_requested', 'converted', 'lost']

function unique(values: string[]) {
  return Array.from(new Set(values.filter(Boolean))).sort((a, b) => a.localeCompare(b))
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(new Date(value))
}

export function LeadTable({ leads, onSelect }: { leads: Lead[]; onSelect: (lead: Lead) => void }) {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<LeadStatus | 'all'>('all')
  const [product, setProduct] = useState('all')
  const [city, setCity] = useState('all')
  const [source, setSource] = useState('all')
  const [scoreSort, setScoreSort] = useState<'desc' | 'asc'>('desc')

  const productOptions = unique(leads.flatMap((lead) => lead.interestedProducts.map((item) => item.productName)))
  const cityOptions = unique(leads.map((lead) => lead.city))
  const sourceOptions = unique(leads.map((lead) => lead.campaignSource))

  const filteredLeads = useMemo(() => {
    const query = search.trim().toLowerCase()

    return leads
      .filter((lead) => {
        const matchesSearch =
          !query ||
          `${lead.firstName} ${lead.lastName} ${lead.email} ${lead.phone}`.toLowerCase().includes(query)
        const matchesStatus = status === 'all' || lead.status === status
        const matchesProduct = product === 'all' || lead.interestedProducts.some((item) => item.productName === product)
        const matchesCity = city === 'all' || lead.city === city
        const matchesSource = source === 'all' || lead.campaignSource === source
        return matchesSearch && matchesStatus && matchesProduct && matchesCity && matchesSource
      })
      .sort((a, b) => (scoreSort === 'desc' ? b.leadScore.score - a.leadScore.score : a.leadScore.score - b.leadScore.score))
  }, [city, leads, product, scoreSort, search, source, status])

  return (
    <section className="rounded-[1.75rem] border border-slate-900/10 bg-white/78 p-4 shadow-[0_24px_80px_rgba(7,23,36,0.08)] backdrop-blur-2xl sm:p-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">Lead table</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-[-0.04em] text-[#071724]">Pipeline</h2>
        </div>
        <label className="relative block lg:w-80">
          <Search size={16} aria-hidden="true" className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search name, email, phone"
            className="h-12 w-full rounded-full border border-slate-900/10 bg-white pl-11 pr-4 text-sm outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
          />
        </label>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        <Filter label="Status" value={status} onChange={(value) => setStatus(value as LeadStatus | 'all')} options={statuses.map(String)} />
        <Filter label="Product interest" value={product} onChange={setProduct} options={['all', ...productOptions]} />
        <Filter label="City" value={city} onChange={setCity} options={['all', ...cityOptions]} />
        <Filter label="Source" value={source} onChange={setSource} options={['all', ...sourceOptions]} />
        <Filter label="Sort by lead score" value={scoreSort} onChange={(value) => setScoreSort(value as 'desc' | 'asc')} options={['desc', 'asc']} />
      </div>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[68rem] border-separate border-spacing-0 text-left text-sm">
          <thead>
            <tr className="text-xs uppercase tracking-[0.14em] text-slate-400">
              {['Lead', 'Status', 'Score', 'Products', 'City', 'Source', 'Created'].map((heading) => (
                <th key={heading} className="border-b border-slate-900/10 px-3 py-3 font-semibold">{heading}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredLeads.map((lead) => (
              <tr key={lead.id} className="align-top">
                <td className="border-b border-slate-900/10 px-3 py-4">
                  <button type="button" onClick={() => onSelect(lead)} className="text-left">
                    <span className="block font-semibold text-[#071724] hover:text-teal-700">{lead.firstName} {lead.lastName}</span>
                    <span className="mt-1 block text-xs text-slate-500">{lead.email || lead.phone || 'No contact'}</span>
                  </button>
                </td>
                <td className="border-b border-slate-900/10 px-3 py-4"><LeadStatusBadge status={lead.status} /></td>
                <td className="border-b border-slate-900/10 px-3 py-4">
                  <span className="rounded-full bg-[#071724] px-3 py-1.5 text-xs font-semibold text-white">{lead.leadScore.score}</span>
                </td>
                <td className="border-b border-slate-900/10 px-3 py-4 text-slate-600">
                  {lead.interestedProducts.map((item) => item.productName).join(', ')}
                </td>
                <td className="border-b border-slate-900/10 px-3 py-4 text-slate-600">{lead.city}</td>
                <td className="border-b border-slate-900/10 px-3 py-4 text-slate-600">{lead.campaignSource}</td>
                <td className="border-b border-slate-900/10 px-3 py-4 text-slate-600">{formatDate(lead.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredLeads.length === 0 ? (
        <div className="mt-5 rounded-2xl border border-dashed border-slate-900/15 bg-[#f5f5f2] p-8 text-center text-sm font-semibold text-slate-500">
          No leads match these filters.
        </div>
      ) : null}
    </section>
  )
}

function Filter({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: string[] }) {
  return (
    <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 rounded-full border border-slate-900/10 bg-white px-4 text-sm font-semibold normal-case tracking-normal text-[#071724] outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option === 'all' ? 'All' : statuses.includes(option as LeadStatus) ? leadStatusLabel(option as LeadStatus) : option}
          </option>
        ))}
      </select>
    </label>
  )
}
