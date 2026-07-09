import { useEffect, useMemo, useState } from 'react'
import { Database, FileText, Mail, MessageCircle, Send, ShieldCheck } from 'lucide-react'
import {
  getPrivateFollowUpTemplate,
  getStoredLeads,
  protocolStatusOptions,
  saveStoredLeads,
  type CustomerLead,
  type ProtocolStatus,
} from '../../data/intake'

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value))
}

function protocolStatusLabel(status: ProtocolStatus) {
  return status
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export function AdminLeadsPage({ leadId }: { leadId?: string }) {
  const [leads, setLeads] = useState<CustomerLead[]>([])

  useEffect(() => {
    setLeads(getStoredLeads())
  }, [])

  const selectedLead = useMemo(
    () => (leadId ? leads.find((lead) => lead.id === leadId) : undefined),
    [leadId, leads],
  )

  function updateLead(nextLead: CustomerLead) {
    const nextLeads = leads.map((lead) => (lead.id === nextLead.id ? nextLead : lead))
    setLeads(nextLeads)
    saveStoredLeads(nextLeads)
  }

  if (leadId) {
    return <LeadDetail lead={selectedLead} onUpdate={updateLead} />
  }

  return (
    <main id="main-content" className="bg-[#f5f5f2] px-5 py-10 sm:px-8 lg:py-16">
      <div className="mx-auto max-w-[88rem]">
        <AdminHeader count={leads.length} />

        <div className="mt-8 overflow-hidden rounded-[1.75rem] border border-slate-900/10 bg-white/76 p-4 shadow-[0_24px_80px_rgba(7,23,36,0.08)] backdrop-blur-2xl sm:p-6">
          {leads.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[76rem] border-separate border-spacing-0 text-left text-sm">
                <thead>
                  <tr className="text-xs uppercase tracking-[0.14em] text-slate-400">
                    {[
                      'Lead name',
                      'Date submitted',
                      'City',
                      'Main goal',
                      'Current weight',
                      'Goal weight',
                      'Recommended products',
                      'Consent',
                      'Review status',
                      'Contact method',
                      'Send channel',
                    ].map((heading) => (
                      <th key={heading} className="border-b border-slate-900/10 px-3 py-3 font-semibold">
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => (
                    <tr key={lead.id} className="align-top">
                      <td className="border-b border-slate-900/10 px-3 py-4">
                        <a href={`/admin/leads/${lead.id}`} className="font-semibold text-[#071724] hover:text-teal-700">
                          {lead.firstName} {lead.lastName}
                        </a>
                      </td>
                      <td className="border-b border-slate-900/10 px-3 py-4 text-slate-600">{formatDate(lead.createdAt)}</td>
                      <td className="border-b border-slate-900/10 px-3 py-4 text-slate-600">{lead.city}</td>
                      <td className="border-b border-slate-900/10 px-3 py-4 text-slate-600">{lead.mainGoal}</td>
                      <td className="border-b border-slate-900/10 px-3 py-4 text-slate-600">{lead.currentWeight}</td>
                      <td className="border-b border-slate-900/10 px-3 py-4 text-slate-600">{lead.goalWeight}</td>
                      <td className="border-b border-slate-900/10 px-3 py-4 text-slate-600">
                        {lead.recommendedProducts.map((product) => product.name).join(', ')}
                      </td>
                      <td className="border-b border-slate-900/10 px-3 py-4 text-slate-600">
                        {lead.consentAccepted ? 'Yes' : 'No'}
                      </td>
                      <td className="border-b border-slate-900/10 px-3 py-4">
                        <span className="rounded-full bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-800">
                          {protocolStatusLabel(lead.reviewStatus)}
                        </span>
                      </td>
                      <td className="border-b border-slate-900/10 px-3 py-4 text-slate-600">{lead.preferredContactMethod}</td>
                      <td className="border-b border-slate-900/10 px-3 py-4 text-slate-600">{lead.sendChannel || lead.preferredContactMethod}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState />
          )}
        </div>
      </div>
    </main>
  )
}

function AdminHeader({ count }: { count: number }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-700">Admin</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-[-0.055em] text-[#071724] sm:text-5xl">
          Lead intake database
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
          Local placeholder database for AI intake submissions, ready to connect to Supabase, Firebase, Airtable, or PostgreSQL.
        </p>
      </div>
      <div className="rounded-2xl border border-slate-900/10 bg-white/82 px-5 py-4 shadow-sm">
        <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Submissions</div>
        <div className="mt-1 text-3xl font-semibold text-[#071724]">{count}</div>
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="grid min-h-[24rem] place-items-center rounded-2xl border border-dashed border-slate-900/15 bg-[#f5f5f2]/70 p-8 text-center">
      <div>
        <ShieldCheck size={28} aria-hidden="true" className="mx-auto text-teal-700" />
        <p className="mt-4 text-sm font-semibold text-[#071724]">No leads submitted yet.</p>
        <p className="mt-1 text-sm text-slate-500">Completed AI intake forms will appear here.</p>
        <a href="/intake" className="mt-5 inline-flex rounded-full bg-[#071724] px-5 py-3 text-sm font-semibold text-white">
          Open intake
        </a>
      </div>
    </div>
  )
}

function LeadDetail({
  lead,
  onUpdate,
}: {
  lead?: CustomerLead
  onUpdate: (lead: CustomerLead) => void
}) {
  if (!lead) {
    return (
      <main id="main-content" className="bg-[#f5f5f2] px-5 py-20 sm:px-8">
        <div className="mx-auto max-w-3xl rounded-[1.75rem] border border-slate-900/10 bg-white p-8 text-center shadow-[0_24px_80px_rgba(7,23,36,0.08)]">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-700">Lead not found</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-[#071724]">This lead is not available.</h1>
          <a href="/admin/leads" className="mt-7 inline-flex rounded-full bg-[#071724] px-5 py-3 text-sm font-semibold text-white">
            Back to leads
          </a>
        </div>
      </main>
    )
  }

  const fullName = `${lead.firstName} ${lead.lastName}`

  return (
    <main id="main-content" className="bg-[#f5f5f2] px-5 py-10 sm:px-8 lg:py-16">
      <div className="mx-auto max-w-[88rem]">
        <a href="/admin/leads" className="text-sm font-semibold text-teal-700">
          Back to leads
        </a>
        <div className="mt-5 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <aside className="rounded-[1.75rem] border border-slate-900/10 bg-[#071724] p-6 text-white shadow-[0_28px_90px_rgba(7,23,36,0.2)]">
            <Database size={24} aria-hidden="true" className="text-teal-300" />
            <h1 className="mt-5 text-4xl font-semibold tracking-[-0.055em]">{fullName}</h1>
            <p className="mt-3 text-sm leading-6 text-slate-300">{lead.email}</p>
            <p className="text-sm leading-6 text-slate-300">{lead.phone}</p>
            <p className="text-sm leading-6 text-slate-300">{lead.city}</p>

            <div className="mt-7 grid gap-3 rounded-2xl border border-white/10 bg-white/7 p-4">
              <label className="grid gap-2 text-sm font-semibold text-white">
                Status
                <select
                  value={lead.reviewStatus}
                  onChange={(event) => {
                    const nextStatus = event.target.value as ProtocolStatus
                    onUpdate({
                      ...lead,
                      reviewStatus: nextStatus,
                      protocolStatus: nextStatus,
                      recommendationProtocol: {
                        ...lead.recommendationProtocol,
                        status: nextStatus,
                      },
                    })
                  }}
                  className="h-11 rounded-full border border-white/10 bg-white px-4 text-sm font-semibold text-[#071724] outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                >
                  {protocolStatusOptions.map((status) => (
                    <option key={status} value={status}>
                      {protocolStatusLabel(status)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-2 text-sm font-semibold text-white">
                Preferred follow-up
                <select
                  value={lead.preferredContactMethod}
                  onChange={(event) =>
                    onUpdate({
                      ...lead,
                      preferredContactMethod: event.target.value,
                      sendChannel: event.target.value,
                    })
                  }
                  className="h-11 rounded-full border border-white/10 bg-white px-4 text-sm font-semibold text-[#071724] outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                >
                  <option value="">Not selected</option>
                  {['Email', 'SMS', 'WhatsApp'].map((method) => (
                    <option key={method} value={method}>
                      {method}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-2 text-sm font-semibold text-white">
                Notes
                <textarea
                  value={lead.notes}
                  onChange={(event) => onUpdate({ ...lead, notes: event.target.value })}
                  className="min-h-32 resize-none rounded-2xl border border-white/10 bg-white p-4 text-sm leading-6 text-[#071724] outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                  placeholder="Add internal notes"
                />
              </label>
            </div>
          </aside>

          <section className="grid gap-5">
            <RecommendationProtocolPanel lead={lead} onUpdate={onUpdate} />

            <DetailSection title="AI recommendation summary" icon={<FileText size={18} aria-hidden="true" />}>
              <DetailGrid
                items={[
                  ['Primary category', lead.recommendationSummary.primaryCategory],
                  ['Secondary category', lead.recommendationSummary.secondaryCategory],
                  ['Confidence', `${lead.recommendationSummary.confidenceScore}%`],
                  ['Disclaimer', lead.recommendationSummary.disclaimer],
                ]}
              />
              <p className="mt-4 text-sm leading-7 text-slate-600">{lead.recommendationSummary.explanation}</p>
            </DetailSection>

            <DetailSection title="Recommended products" icon={<Database size={18} aria-hidden="true" />}>
              <div className="grid gap-3 sm:grid-cols-2">
                {lead.recommendedProducts.map((product) => (
                  <a key={product.slug} href={`/products/${product.slug}`} className="rounded-2xl border border-slate-900/10 bg-white/82 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-700">{product.category}</p>
                    <h3 className="mt-2 text-lg font-semibold text-[#071724]">{product.name}</h3>
                  </a>
                ))}
              </div>
            </DetailSection>

            <DetailSection title="Biometrics" icon={<Database size={18} aria-hidden="true" />}>
              <DetailGrid
                items={[
                  ['Age', lead.age],
                  ['Biological sex', lead.sex],
                  ['Height', lead.height],
                  ['Current weight', lead.currentWeight],
                  ['Goal weight', lead.goalWeight],
                  ['Body fat', lead.bodyFat],
                  ['Waist', lead.waist],
                  ['Activity level', lead.activityLevel],
                  ['Medications or compounds', lead.medicationsOrCompounds],
                  ['Sensitivities', lead.sensitivities],
                ]}
              />
            </DetailSection>

            <DetailSection title="Full intake answers" icon={<FileText size={18} aria-hidden="true" />}>
              <DetailGrid
                items={[
                  ['Main goal', lead.mainGoal],
                  ['Lifestyle activity', lead.lifestyleAnswers.lifestyleActivity],
                  ['Exercise days', lead.lifestyleAnswers.exerciseDays],
                  ['Sleep quality', lead.lifestyleAnswers.sleepQuality],
                  ['Energy levels', lead.lifestyleAnswers.energyLevels],
                  ['Nutrition consistency', lead.lifestyleAnswers.nutritionConsistency],
                  ['Main obstacle', lead.lifestyleAnswers.mainObstacle],
                  ['Peptide experience', lead.experienceAnswers.peptideExperience],
                  ['GLP / GIP / glucagon category experience', lead.experienceAnswers.glpExperience],
                  ['Interested products', lead.experienceAnswers.interestedProducts.join(', ')],
                  ['Research result of interest', lead.experienceAnswers.desiredResearchResult],
                  ['Preferred contact method', lead.preferredContactMethod],
                  ['Consent accepted', lead.consentAccepted ? 'Yes' : 'No'],
                  ['Consent timestamp', lead.consentTimestamp ? formatDate(lead.consentTimestamp) : 'Not provided'],
                  ['Review status', protocolStatusLabel(lead.reviewStatus)],
                  ['Send channel', lead.sendChannel || lead.preferredContactMethod],
                  ['Submitted', formatDate(lead.createdAt)],
                ]}
              />
            </DetailSection>
          </section>
        </div>
      </div>
    </main>
  )
}

function RecommendationProtocolPanel({
  lead,
  onUpdate,
}: {
  lead: CustomerLead
  onUpdate: (lead: CustomerLead) => void
}) {
  const isApproved = lead.recommendationProtocol.status === 'approved'
  const sendTemplate = getPrivateFollowUpTemplate(lead)

  function updateProtocolField(
    field: keyof CustomerLead['recommendationProtocol'],
    value: string,
  ) {
    const nextProtocol = {
      ...lead.recommendationProtocol,
      [field]: value,
    }
    onUpdate({
      ...lead,
      protocolStatus: nextProtocol.status,
      reviewStatus: nextProtocol.status,
      internalRecommendationNotes: nextProtocol.internalNotes,
      recommendationProtocol: nextProtocol,
    })
  }

  function sendPlaceholder(method: 'Email' | 'SMS' | 'WhatsApp') {
    if (!isApproved) {
      return
    }

    const sentAt = new Date().toISOString()
    onUpdate({
      ...lead,
      preferredContactMethod: method,
      sendChannel: method,
      protocolStatus: 'sent',
      reviewStatus: 'sent',
      recommendationProtocol: {
        ...lead.recommendationProtocol,
        status: 'sent',
        lastSentBy: method,
        lastSentAt: sentAt,
      },
    })
  }

  return (
    <DetailSection title="Recommendation & Protocol" icon={<Send size={18} aria-hidden="true" />}>
      <div className="mb-5 rounded-2xl border border-teal-700/20 bg-teal-50 p-4 text-sm leading-6 text-teal-950">
        Internal only. Review and approve before sending private follow-up. No public website page displays these fields.
      </div>

      <div className="grid gap-4">
        <EditableTextArea
          label="Recommended products"
          value={lead.recommendationProtocol.recommendedProducts}
          onChange={(value) => updateProtocolField('recommendedProducts', value)}
        />
        <EditableTextArea
          label="Internal notes"
          value={lead.recommendationProtocol.internalNotes}
          onChange={(value) => updateProtocolField('internalNotes', value)}
        />
        <EditableTextArea
          label="Internal safety notes"
          value={lead.recommendationProtocol.internalSafetyNotes}
          onChange={(value) => updateProtocolField('internalSafetyNotes', value)}
          placeholder="Internal safety review notes only."
        />
        <EditableTextArea
          label="Internal protocol notes"
          value={lead.recommendationProtocol.internalProtocolNotes}
          onChange={(value) => updateProtocolField('internalProtocolNotes', value)}
          placeholder="Internal protocol review notes only."
        />
        <EditableTextArea
          label="Suggested research protocol"
          value={lead.recommendationProtocol.suggestedResearchProtocol}
          onChange={(value) => updateProtocolField('suggestedResearchProtocol', value)}
          placeholder="Internal review notes only."
        />
        <EditableTextArea
          label="Suggested duration"
          value={lead.recommendationProtocol.suggestedDuration}
          onChange={(value) => updateProtocolField('suggestedDuration', value)}
          placeholder="Internal review notes only."
        />
        <EditableTextArea
          label="Safety notes"
          value={lead.recommendationProtocol.safetyNotes}
          onChange={(value) => updateProtocolField('safetyNotes', value)}
          placeholder="Internal review notes only."
        />

        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm font-semibold text-[#071724]">
            Status
            <select
              value={lead.recommendationProtocol.status}
              onChange={(event) => updateProtocolField('status', event.target.value)}
              className="h-12 rounded-2xl border border-slate-900/10 bg-white/82 px-4 text-sm text-[#071724] outline-none transition focus:border-teal-600/70 focus:ring-4 focus:ring-teal-100"
            >
              {protocolStatusOptions.map((status) => (
                <option key={status} value={status}>
                  {protocolStatusLabel(status)}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2 text-sm font-semibold text-[#071724]">
            Follow-up method
            <select
              value={lead.preferredContactMethod}
              onChange={(event) =>
                onUpdate({
                  ...lead,
                  preferredContactMethod: event.target.value,
                  sendChannel: event.target.value,
                })
              }
              className="h-12 rounded-2xl border border-slate-900/10 bg-white/82 px-4 text-sm text-[#071724] outline-none transition focus:border-teal-600/70 focus:ring-4 focus:ring-teal-100"
            >
              <option value="">Not selected</option>
              {['Email', 'SMS', 'WhatsApp'].map((method) => (
                <option key={method} value={method}>
                  {method}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="rounded-2xl border border-slate-900/10 bg-[#f5f5f2]/70 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Private follow-up template</p>
          <pre className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[#071724]">{sendTemplate}</pre>
        </div>

        <div className="grid gap-3 rounded-2xl border border-slate-900/10 bg-white/82 p-4 text-sm leading-6 text-slate-600">
          <p className="font-semibold text-[#071724]">Integration placeholders</p>
          <p>Email: SendGrid / Resend / Mailgun through environment variables such as VITE_SENDGRID_ENDPOINT or VITE_RESEND_ENDPOINT.</p>
          <p>SMS: Twilio through environment variables such as VITE_TWILIO_SMS_ENDPOINT.</p>
          <p>WhatsApp: Twilio WhatsApp Business API through environment variables such as VITE_TWILIO_WHATSAPP_ENDPOINT.</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <SendButton
            label="Send by Email"
            icon={<Mail size={16} aria-hidden="true" />}
            disabled={!isApproved}
            onClick={() => sendPlaceholder('Email')}
          />
          <SendButton
            label="Send by SMS"
            icon={<MessageCircle size={16} aria-hidden="true" />}
            disabled={!isApproved}
            onClick={() => sendPlaceholder('SMS')}
          />
          <SendButton
            label="Send by WhatsApp"
            icon={<Send size={16} aria-hidden="true" />}
            disabled={!isApproved}
            onClick={() => sendPlaceholder('WhatsApp')}
          />
        </div>

        {!isApproved ? (
          <p className="text-sm font-semibold text-slate-500">
            Set status to Approved before sending private follow-up.
          </p>
        ) : null}

        {lead.recommendationProtocol.lastSentBy ? (
          <p className="text-sm font-semibold text-teal-700">
            Last marked sent by {lead.recommendationProtocol.lastSentBy}
            {lead.recommendationProtocol.lastSentAt ? ` on ${formatDate(lead.recommendationProtocol.lastSentAt)}` : ''}.
          </p>
        ) : null}
      </div>
    </DetailSection>
  )
}

function EditableTextArea({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-[#071724]">
      {label}
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="min-h-28 resize-none rounded-2xl border border-slate-900/10 bg-white/82 p-4 text-sm leading-6 text-[#071724] outline-none transition placeholder:text-slate-400 focus:border-teal-600/70 focus:ring-4 focus:ring-teal-100"
      />
    </label>
  )
}

function SendButton({
  label,
  icon,
  disabled,
  onClick,
}: {
  label: string
  icon: React.ReactNode
  disabled: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#071724] px-5 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(7,23,36,0.16)] transition hover:bg-[#102a3d] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none"
    >
      {icon}
      {label}
    </button>
  )
}

function DetailSection({
  title,
  icon,
  children,
}: {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="rounded-[1.75rem] border border-slate-900/10 bg-white/76 p-5 shadow-[0_24px_80px_rgba(7,23,36,0.08)] backdrop-blur-2xl sm:p-6">
      <div className="mb-5 flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-2xl bg-[#071724] text-teal-300">{icon}</span>
        <h2 className="text-xl font-semibold tracking-[-0.03em] text-[#071724]">{title}</h2>
      </div>
      {children}
    </div>
  )
}

function DetailGrid({ items }: { items: Array<[string, string]> }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {items.map(([label, value]) => (
        <div key={label} className="rounded-2xl border border-slate-900/10 bg-[#f5f5f2]/70 p-4">
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">{label}</div>
          <div className="mt-2 text-sm font-semibold leading-6 text-[#071724]">{value || 'Not provided'}</div>
        </div>
      ))}
    </div>
  )
}
