import { Copy, Mail, MessageCircle, X } from 'lucide-react'
import type { ReactNode } from 'react'
import { addNote, addTimelineEvent, updateLead } from '../../lib/crmStorage'
import { leadStatusLabel } from '../../lib/crmLabels'
import type { Lead, LeadStatus } from '../../types/crm'
import { getEmailFollowUp, getInstagramDMFollowUp, getWhatsAppFollowUp } from './FollowUpTemplates'
import { LeadStatusBadge } from './LeadStatusBadge'

const statusOptions: LeadStatus[] = ['new', 'contacted', 'qualified', 'consultation_requested', 'converted', 'lost']

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(
    new Date(value),
  )
}

async function copyText(text: string) {
  await navigator.clipboard.writeText(text)
}

export function LeadDetailDrawer({
  lead,
  onClose,
  onChange,
}: {
  lead: Lead | null
  onClose: () => void
  onChange: (lead: Lead) => void | Promise<void>
}) {
  if (!lead) {
    return null
  }
  const activeLead = lead

  async function changeStatus(status: LeadStatus) {
    const updated = await updateLead(activeLead.id, { status })
    const withEvent = await addTimelineEvent(activeLead.id, {
      type: 'status_changed',
      title: `Status changed to ${leadStatusLabel(status)}`,
    })
    await onChange(withEvent || updated || activeLead)
  }

  async function changeNotes(notes: string) {
    const updated = await updateLead(activeLead.id, { notes })
    if (updated) {
      await onChange(updated)
    }
  }

  async function saveNote() {
    if (!activeLead.notes.trim()) {
      return
    }

    await addNote(activeLead.id, activeLead.notes)
    const refreshed = await updateLead(activeLead.id, { notes: activeLead.notes })
    if (refreshed) {
      await onChange(refreshed)
    }
  }

  async function copyTemplate(channel: 'WhatsApp' | 'Instagram' | 'Email') {
    const text =
      channel === 'WhatsApp'
        ? getWhatsAppFollowUp(activeLead)
        : channel === 'Instagram'
          ? getInstagramDMFollowUp(activeLead)
          : getEmailFollowUp(activeLead)

    await copyText(text)
    const updated = await addTimelineEvent(activeLead.id, {
      type: 'follow_up_copied',
      title: `${channel} follow-up copied`,
      description: 'Template copied for manual review and sending.',
    })
    if (updated) {
      await onChange(updated)
    }
  }

  const intake = activeLead.intakeSubmission

  return (
    <div className="fixed inset-0 z-[120]">
      <button type="button" aria-label="Close lead details" onClick={onClose} className="absolute inset-0 bg-[#071724]/45 backdrop-blur-sm" />
      <aside className="absolute right-0 top-0 h-full w-full max-w-3xl overflow-y-auto bg-[#f5f5f2] shadow-[0_0_80px_rgba(7,23,36,0.28)]">
        <div className="sticky top-0 z-10 border-b border-slate-900/10 bg-white/86 px-5 py-4 backdrop-blur-2xl sm:px-7">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">Lead detail</p>
              <h2 className="mt-1 text-2xl font-semibold tracking-[-0.04em] text-[#071724]">
                {lead.firstName} {lead.lastName}
              </h2>
            </div>
            <button type="button" onClick={onClose} className="flex size-10 items-center justify-center rounded-full border border-slate-900/10 bg-white text-[#071724]">
              <X size={18} aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="grid gap-5 p-5 sm:p-7">
          <section className="rounded-[1.5rem] border border-slate-900/10 bg-[#071724] p-5 text-white shadow-[0_24px_80px_rgba(7,23,36,0.16)]">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <LeadStatusBadge status={lead.status} />
                <div className="mt-5 grid gap-1 text-sm text-slate-300">
                  <a href={`mailto:${lead.email}`} className="font-semibold text-white">{lead.email || 'No email'}</a>
                  <a href={`tel:${lead.phone}`} className="font-semibold text-white">{lead.phone || 'No phone'}</a>
                  <span>{[lead.city, lead.state, lead.country].filter(Boolean).join(', ')}</span>
                  <span>Preferred language: {lead.preferredLanguage}</span>
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/8 p-4 text-right">
                <div className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-200">Lead score</div>
                <div className="mt-2 text-4xl font-semibold tracking-[-0.06em]">{lead.leadScore.score}</div>
              </div>
            </div>
          </section>

          <section className="grid gap-4 rounded-[1.5rem] border border-slate-900/10 bg-white/80 p-5 shadow-[0_18px_54px_rgba(7,23,36,0.07)]">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-semibold text-[#071724]">
                Status
                <select
                  value={lead.status}
                  onChange={(event) => void changeStatus(event.target.value as LeadStatus)}
                  className="h-11 rounded-full border border-slate-900/10 bg-white px-4 text-sm outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>{leadStatusLabel(status)}</option>
                  ))}
                </select>
              </label>
              <div className="grid gap-2 text-sm">
                <span className="font-semibold text-[#071724]">Source</span>
                <span className="rounded-full border border-slate-900/10 bg-[#f5f5f2] px-4 py-3 font-semibold text-slate-600">
                  {lead.campaignSource} / {lead.source}
                </span>
              </div>
            </div>
            <label className="grid gap-2 text-sm font-semibold text-[#071724]">
              Notes
              <textarea
                value={lead.notes}
                onChange={(event) => void changeNotes(event.target.value)}
                placeholder="Add internal notes"
                className="min-h-28 resize-none rounded-2xl border border-slate-900/10 bg-white p-4 text-sm leading-6 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
              />
              <button
                type="button"
                onClick={() => void saveNote()}
                className="justify-self-start rounded-full bg-[#071724] px-4 py-2 text-sm font-semibold text-white"
              >
                Save note to timeline
              </button>
            </label>
          </section>

          <section className="rounded-[1.5rem] border border-slate-900/10 bg-white/80 p-5">
            <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-teal-700">Follow-up templates</h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <TemplateButton icon={<MessageCircle size={16} />} label="Copy WhatsApp follow-up" onClick={() => void copyTemplate('WhatsApp')} />
              <TemplateButton icon={<MessageCircle size={16} />} label="Copy Instagram DM follow-up" onClick={() => void copyTemplate('Instagram')} />
              <TemplateButton icon={<Mail size={16} />} label="Copy email follow-up" onClick={() => void copyTemplate('Email')} />
            </div>
          </section>

          <section className="grid gap-4 rounded-[1.5rem] border border-slate-900/10 bg-white/80 p-5">
            <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-teal-700">Interested products</h3>
            <div className="flex flex-wrap gap-2">
              {lead.interestedProducts.map((item) => (
                <span key={`${item.productName}-${item.priority}`} className="rounded-full bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-800">
                  {item.productName}
                </span>
              ))}
            </div>
          </section>

          <section className="rounded-[1.5rem] border border-slate-900/10 bg-white/80 p-5">
            <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-teal-700">Lead score explanation</h3>
            <div className="mt-4 grid gap-2">
              {lead.leadScore.explanation.map((item) => (
                <div key={item} className="rounded-2xl bg-[#f5f5f2] px-4 py-3 text-sm font-semibold text-slate-600">{item}</div>
              ))}
            </div>
          </section>

          <section className="rounded-[1.5rem] border border-slate-900/10 bg-white/80 p-5">
            <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-teal-700">Intake answers</h3>
            {intake ? (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {[
                  ['Age', intake.age],
                  ['Sex', intake.sex],
                  ['Weight', intake.weight],
                  ['Height', intake.height],
                  ['Main goal', intake.mainGoal],
                  ['Current routine', intake.currentRoutine],
                  ['Sleep quality', intake.sleepQuality],
                  ['Appetite', intake.appetite],
                  ['Energy', intake.energy],
                  ['Previous products used', intake.previousProductsUsed],
                  ['Medical conditions', intake.medicalConditions],
                  ['Medications', intake.medications],
                  ['Budget', intake.budget],
                  ['Delivery city', intake.deliveryCity],
                  ['Preferred contact', intake.preferredContactMethod],
                  ['Consent to contact', intake.consentToContact ? 'Yes' : 'No'],
                  ['Research-use-only acknowledgment', intake.researchUseAcknowledgment ? 'Yes' : 'No'],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-2xl bg-[#f5f5f2] p-4">
                    <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">{label}</div>
                    <div className="mt-2 text-sm font-semibold leading-6 text-[#071724]">{value || 'Not provided'}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm text-slate-500">No intake submission attached.</p>
            )}
          </section>

          <section className="rounded-[1.5rem] border border-slate-900/10 bg-white/80 p-5">
            <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-teal-700">Timeline</h3>
            <div className="mt-4 grid gap-3">
              {lead.timeline.map((event) => (
                <div key={event.id} className="rounded-2xl border border-slate-900/10 bg-[#f5f5f2] p-4">
                  <div className="text-sm font-semibold text-[#071724]">{event.title}</div>
                  <div className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">{formatDate(event.createdAt)}</div>
                  {event.description ? <p className="mt-2 text-sm leading-6 text-slate-600">{event.description}</p> : null}
                </div>
              ))}
            </div>
          </section>
        </div>
      </aside>
    </div>
  )
}

function TemplateButton({ icon, label, onClick }: { icon: ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-14 items-center justify-center gap-2 rounded-2xl border border-slate-900/10 bg-[#071724] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#102a3d]"
    >
      {icon}
      <span>{label}</span>
      <Copy size={14} aria-hidden="true" />
    </button>
  )
}
