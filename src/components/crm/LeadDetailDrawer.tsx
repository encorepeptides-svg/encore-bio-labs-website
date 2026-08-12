import { CheckCircle2, Copy, LoaderCircle, Mail, MessageCircle, Sparkles, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { useTranslation } from '../../i18n/LocaleContext'
import { addNote, addTimelineEvent, getNotes, recordLeadContact, updateLead } from '../../lib/crmStorage'
import { draftFollowUp, type FollowUpChannel } from '../../lib/crm/draftFollowUp'
import { LEAD_DIAL_CODES, buildWhatsAppUrlToLead, defaultDialCodeForLead, normalizeLeadPhone, type LeadDialCode } from '../../lib/whatsapp'
import type { CRMNote, Lead, LeadStatus } from '../../types/crm'
import { getEmailFollowUp, getInstagramDMFollowUp, getWhatsAppFollowUp } from './FollowUpTemplates'
import { LeadStatusBadge } from './LeadStatusBadge'

const statusOptions: LeadStatus[] = ['new', 'contacted', 'qualified', 'consultation_requested', 'converted', 'lost']

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
  const { t, locale } = useTranslation('crm')
  // Hooks must run before the empty-lead early return.
  const [draft, setDraft] = useState('')
  const [draftChannel, setDraftChannel] = useState<FollowUpChannel>('whatsapp')
  const [drafting, setDrafting] = useState<FollowUpChannel | null>(null)
  const [draftError, setDraftError] = useState('')
  const [noteDraft, setNoteDraft] = useState('')
  const [notes, setNotes] = useState<CRMNote[]>([])
  const [savingAction, setSavingAction] = useState<'status' | 'contact' | 'note' | null>(null)
  const [actionError, setActionError] = useState('')
  const [actionSuccess, setActionSuccess] = useState('')
  // null = follow the language-based default; set = the operator chose.
  const [dialCode, setDialCode] = useState<LeadDialCode | null>(null)
  const leadId = lead?.id

  useEffect(() => {
    setDraft('')
    setDraftError('')
    setNoteDraft('')
    setActionError('')
    setActionSuccess('')
    setDialCode(null)
    if (!leadId) {
      setNotes([])
      return
    }

    let active = true
    void getNotes(leadId)
      .then((nextNotes) => { if (active) setNotes(nextNotes) })
      .catch(() => { if (active) setActionError(t('actionError')) })
    return () => { active = false }
  }, [leadId, t])

  useEffect(() => {
    if (!lead) return
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose() }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [lead, onClose])

  if (!lead) {
    return null
  }
  const activeLead = lead
  const statusLabels: Record<LeadStatus, string> = {
    new: t('statusNew'), contacted: t('statusContacted'), qualified: t('statusQualified'),
    consultation_requested: t('statusConsultationRequested'), converted: t('statusConverted'), lost: t('statusLost'),
  }
  const formatDate = (value: string) => new Intl.DateTimeFormat(locale === 'es' ? 'es-MX' : 'en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(value))

  async function changeStatus(status: LeadStatus) {
    setSavingAction('status')
    setActionError('')
    setActionSuccess('')
    try {
      const marksContact = status !== 'new' && status !== 'lost' && !activeLead.lastContactedAt
      const updated = await updateLead(activeLead.id, {
        status,
        ...(marksContact ? { lastContactedAt: new Date().toISOString() } : {}),
      })
      const withEvent = await addTimelineEvent(activeLead.id, {
        type: 'status_changed',
        title: t('statusChanged', { status: statusLabels[status] }),
      })
      await onChange(withEvent || updated || activeLead)
    } catch {
      setActionError(t('actionError'))
    } finally {
      setSavingAction(null)
    }
  }

  async function saveNote() {
    const note = noteDraft.trim()
    if (!note) return
    setSavingAction('note')
    setActionError('')
    setActionSuccess('')
    try {
      const savedNote = await addNote(activeLead.id, note)
      const refreshed = await updateLead(activeLead.id, { notes: note })
      setNotes((current) => [savedNote, ...current.filter((item) => item.id !== savedNote.id)])
      setNoteDraft('')
      setActionSuccess(t('noteSaved'))
      if (refreshed) await onChange(refreshed)
    } catch {
      setActionError(t('actionError'))
    } finally {
      setSavingAction(null)
    }
  }

  async function markContacted() {
    setSavingAction('contact')
    setActionError('')
    setActionSuccess('')
    try {
      const updated = await recordLeadContact(activeLead.id, {
        title: t('contactEvent'),
        description: t('contactEventDescription'),
      })
      if (updated) await onChange(updated)
      setActionSuccess(t('contactRecorded'))
    } catch {
      setActionError(t('actionError'))
    } finally {
      setSavingAction(null)
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
      title: t('templateCopied', { channel }),
      description: t('templateCopiedDescription'),
    })
    if (updated) {
      await onChange(updated)
    }
  }

  async function generateDraft(channel: FollowUpChannel) {
    setDrafting(channel)
    setDraftError('')
    try {
      const result = await draftFollowUp(activeLead.id, channel)
      setDraft(result.draft)
      setDraftChannel(channel)
    } catch (error) {
      setDraftError(error instanceof Error ? error.message : t('draftError'))
    } finally {
      setDrafting(null)
    }
  }

  // Logged when the operator actually takes the draft somewhere sendable, so
  // the timeline reflects outreach rather than mere curiosity.
  async function recordDraftUse(action: string) {
    const updated = await addTimelineEvent(activeLead.id, {
      type: 'follow_up_copied',
      title: action,
      description: t('draftUsedDescription'),
    })
    if (updated) {
      await onChange(updated)
    }
  }

  // The intake never asked for a country, so the code is the operator's call.
  const activeDialCode = dialCode ?? defaultDialCodeForLead(activeLead.preferredLanguage, activeLead.country)
  const whatsAppNumber = normalizeLeadPhone(activeLead.phone, activeDialCode)
  const whatsAppHref = draft && whatsAppNumber ? buildWhatsAppUrlToLead(activeLead.phone, draft, activeDialCode) : ''
  const phoneHasOwnCode = activeLead.phone.replaceAll(/\D/g, '').length > 10
  const mailtoHref = draft
    ? `mailto:${activeLead.email}?subject=${encodeURIComponent(draft.startsWith('Subject:') ? draft.slice(8).split('\n')[0].trim() : 'Encore Bio Labs')}&body=${encodeURIComponent(draft.startsWith('Subject:') ? draft.split('\n').slice(1).join('\n').trim() : draft)}`
    : ''

  const intake = activeLead.intakeSubmission

  return (
    <div className="fixed inset-0 z-[120]">
      <button type="button" aria-label={t('closeDetails')} onClick={onClose} className="absolute inset-0 bg-[#071724]/45 backdrop-blur-sm" />
      <aside role="dialog" aria-modal="true" aria-labelledby="lead-detail-title" className="absolute right-0 top-0 h-full w-full max-w-3xl overflow-y-auto bg-[#f5f5f2] shadow-[0_0_80px_rgba(7,23,36,0.28)]">
        <div className="sticky top-0 z-10 border-b border-slate-900/10 bg-white/86 px-5 py-4 backdrop-blur-2xl sm:px-7">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">{t('leadDetail')}</p>
              <h2 id="lead-detail-title" className="mt-1 text-2xl font-semibold tracking-[-0.04em] text-[#071724]">
                {lead.firstName} {lead.lastName}
              </h2>
            </div>
            <button type="button" aria-label={t('closeDetails')} onClick={onClose} className="flex size-10 items-center justify-center rounded-full border border-slate-900/10 bg-white text-[#071724]">
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
                  <a href={`mailto:${lead.email}`} className="font-semibold text-white">{lead.email || t('noEmail')}</a>
                  <a href={`tel:${lead.phone}`} className="font-semibold text-white">{lead.phone || t('noPhone')}</a>
                  <span>{[lead.city, lead.state, lead.country].filter(Boolean).join(', ')}</span>
                  <span>{t('preferredLanguage', { language: lead.preferredLanguage })}</span>
                  <span>{lead.lastContactedAt ? t('lastContacted', { date: formatDate(lead.lastContactedAt) }) : t('lastContactNever')}</span>
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/8 p-4 text-right">
                <div className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-200">{t('leadScore')}</div>
                <div className="mt-2 text-4xl font-semibold tracking-[-0.06em]">{lead.leadScore.score}</div>
              </div>
            </div>
          </section>

          <section className="grid gap-4 rounded-[1.5rem] border border-slate-900/10 bg-white/80 p-5 shadow-[0_18px_54px_rgba(7,23,36,0.07)]">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-semibold text-[#071724]">
                {t('filterStatus')}
                <select
                  value={lead.status}
                  onChange={(event) => void changeStatus(event.target.value as LeadStatus)}
                  disabled={savingAction !== null}
                  className="h-11 rounded-full border border-slate-900/10 bg-white px-4 text-sm outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>{statusLabels[status]}</option>
                  ))}
                </select>
              </label>
              <div className="grid gap-2 text-sm">
                <span className="font-semibold text-[#071724]">{t('source')}</span>
                <span className="rounded-full border border-slate-900/10 bg-[#f5f5f2] px-4 py-3 font-semibold text-slate-600">
                  {lead.campaignSource} / {lead.source}
                </span>
              </div>
            </div>
            <div className="grid gap-3 rounded-2xl border border-teal-700/15 bg-teal-50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-[#071724]">{t('markContacted')}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-600">{t('contactHelp')}</p>
                </div>
                <button type="button" onClick={() => void markContacted()} disabled={savingAction !== null} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-teal-900 px-4 text-sm font-semibold text-white disabled:opacity-50">
                  {savingAction === 'contact' ? <LoaderCircle size={16} className="animate-spin" aria-hidden="true" /> : <CheckCircle2 size={16} aria-hidden="true" />}
                  {savingAction === 'contact' ? t('markingContacted') : t('markContacted')}
                </button>
              </div>
            </div>

            {actionError ? <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">{actionError}</p> : null}
            {actionSuccess ? <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">{actionSuccess}</p> : null}

            <label className="grid gap-2 text-sm font-semibold text-[#071724]">
              {t('notes')}
              <textarea
                value={noteDraft}
                onChange={(event) => setNoteDraft(event.target.value)}
                placeholder={t('notePlaceholder')}
                className="min-h-28 resize-none rounded-2xl border border-slate-900/10 bg-white p-4 text-sm leading-6 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
              />
              <button
                type="button"
                onClick={() => void saveNote()}
                disabled={!noteDraft.trim() || savingAction !== null}
                className="justify-self-start rounded-full bg-[#071724] px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {savingAction === 'note' ? t('saving') : t('saveNote')}
              </button>
            </label>

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-700">{t('noteHistory')}</h3>
              <div className="mt-3 grid gap-2">
                {notes.length ? notes.map((note) => <div key={note.id} className="rounded-2xl bg-[#f5f5f2] p-4">
                  <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">{note.note}</p>
                  <p className="mt-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">{formatDate(note.createdAt)}</p>
                </div>) : <p className="text-sm text-slate-500">{t('noteHistoryEmpty')}</p>}
              </div>
            </div>
          </section>

          <section className="grid gap-4 rounded-[1.5rem] border border-teal-600/20 bg-white/80 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-teal-700">{t('generateFollowUp')}</h3>
              <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-800">
                {t('writesIn', { language: lead.preferredLanguage })}
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                disabled={drafting !== null}
                onClick={() => void generateDraft('whatsapp')}
                className="flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-[#071724] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#102a3d] disabled:opacity-60"
              >
                {drafting === 'whatsapp' ? <LoaderCircle size={16} className="animate-spin" aria-hidden="true" /> : <Sparkles size={16} aria-hidden="true" />}
                <span>{drafting === 'whatsapp' ? t('writing') : t('generateWhatsapp')}</span>
              </button>
              <button
                type="button"
                disabled={drafting !== null}
                onClick={() => void generateDraft('email')}
                className="flex min-h-14 items-center justify-center gap-2 rounded-2xl border border-slate-900/10 bg-white px-4 py-3 text-sm font-semibold text-[#071724] transition hover:bg-[#f5f5f2] disabled:opacity-60"
              >
                {drafting === 'email' ? <LoaderCircle size={16} className="animate-spin" aria-hidden="true" /> : <Sparkles size={16} aria-hidden="true" />}
                <span>{drafting === 'email' ? t('writing') : t('generateEmail')}</span>
              </button>
            </div>

            {draftError ? (
              <p role="alert" className="rounded-2xl bg-red-50 p-4 text-sm leading-6 text-red-800">{draftError}</p>
            ) : null}

            {draft ? (
              <>
                <label className="grid gap-2 text-sm font-semibold text-[#071724]">
                  {t('draftEdit')}
                  <textarea
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    className="min-h-44 resize-y rounded-2xl border border-slate-900/10 bg-white p-4 text-sm leading-6 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                  />
                </label>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => void copyText(draft).then(() => recordDraftUse(t('draftCopied')))}
                    className="inline-flex min-h-12 items-center gap-2 rounded-full border border-slate-900/10 bg-white px-5 text-sm font-semibold text-[#071724]"
                  >
                    <Copy size={14} aria-hidden="true" />
                    {t('copy')}
                  </button>

                  {draftChannel === 'whatsapp' && !phoneHasOwnCode ? (
                    <label className="inline-flex min-h-12 items-center gap-2 rounded-full border border-slate-900/10 bg-white px-4 text-sm font-semibold text-[#071724]">
                      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">{t('country')}</span>
                      <select
                        value={activeDialCode}
                        onChange={(event) => setDialCode(event.target.value as LeadDialCode)}
                        className="bg-transparent text-sm font-semibold outline-none"
                        aria-label={t('countryCodeLabel')}
                      >
                        {LEAD_DIAL_CODES.map((entry) => (
                          <option key={entry.code} value={entry.code}>{entry.label}</option>
                        ))}
                      </select>
                    </label>
                  ) : null}

                  {draftChannel === 'whatsapp' && whatsAppHref ? (
                    <a
                      href={whatsAppHref}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => void recordDraftUse(t('whatsappOpened'))}
                      className="inline-flex min-h-12 items-center gap-2 rounded-full bg-[#071724] px-5 text-sm font-semibold text-white"
                    >
                      <MessageCircle size={14} aria-hidden="true" />
                      {t('openWhatsapp', { number: whatsAppNumber })}
                    </a>
                  ) : null}

                  {draftChannel === 'email' && activeLead.email ? (
                    <a
                      href={mailtoHref}
                      onClick={() => void recordDraftUse(t('emailOpened'))}
                      className="inline-flex min-h-12 items-center gap-2 rounded-full bg-[#071724] px-5 text-sm font-semibold text-white"
                    >
                      <Mail size={14} aria-hidden="true" />
                      {t('openEmail', { email: activeLead.email })}
                    </a>
                  ) : null}
                </div>

                <p className="text-xs leading-5 text-slate-500">
                  {t('sendDisclaimer')}
                  {draftChannel === 'whatsapp' && !whatsAppNumber ? ` ${t('noDialablePhone')}` : ''}
                  {draftChannel === 'whatsapp' && whatsAppNumber && !phoneHasOwnCode
                    ? ` ${t('verifyCountryCode')}`
                    : ''}
                </p>
              </>
            ) : null}
          </section>

          <section className="rounded-[1.5rem] border border-slate-900/10 bg-white/80 p-5">
            <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-teal-700">{t('templates')}</h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <TemplateButton icon={<MessageCircle size={16} />} label={t('copyWhatsapp')} onClick={() => void copyTemplate('WhatsApp')} />
              <TemplateButton icon={<MessageCircle size={16} />} label={t('copyInstagram')} onClick={() => void copyTemplate('Instagram')} />
              <TemplateButton icon={<Mail size={16} />} label={t('copyEmail')} onClick={() => void copyTemplate('Email')} />
            </div>
          </section>

          <section className="grid gap-4 rounded-[1.5rem] border border-slate-900/10 bg-white/80 p-5">
            <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-teal-700">{t('interestedProducts')}</h3>
            <div className="flex flex-wrap gap-2">
              {lead.interestedProducts.length ? lead.interestedProducts.map((item) => (
                <span key={`${item.productName}-${item.priority}`} className="rounded-full bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-800">
                  {item.productName}
                </span>
              )) : <span className="text-sm text-slate-500">{t('noProducts')}</span>}
            </div>
          </section>

          <section className="rounded-[1.5rem] border border-slate-900/10 bg-white/80 p-5">
            <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-teal-700">{t('scoreExplanation')}</h3>
            <div className="mt-4 grid gap-2">
              {lead.leadScore.explanation.map((item) => (
                <div key={item} className="rounded-2xl bg-[#f5f5f2] px-4 py-3 text-sm font-semibold text-slate-600">{item}</div>
              ))}
            </div>
          </section>

          <section className="rounded-[1.5rem] border border-slate-900/10 bg-white/80 p-5">
            <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-teal-700">{t('intakeAnswers')}</h3>
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
                  ['Consent to contact', intake.consentToContact ? t('yes') : t('no')],
                  ['Research-use-only acknowledgment', intake.researchUseAcknowledgment ? t('yes') : t('no')],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-2xl bg-[#f5f5f2] p-4">
                    <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">{label}</div>
                    <div className="mt-2 text-sm font-semibold leading-6 text-[#071724]">{value || t('notProvided')}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm text-slate-500">{t('noIntake')}</p>
            )}
          </section>

          <section className="rounded-[1.5rem] border border-slate-900/10 bg-white/80 p-5">
            <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-teal-700">{t('timeline')}</h3>
            <div className="mt-4 grid gap-3">
              {lead.timeline.length ? lead.timeline.map((event) => (
                <div key={event.id} className="rounded-2xl border border-slate-900/10 bg-[#f5f5f2] p-4">
                  <div className="text-sm font-semibold text-[#071724]">{event.title}</div>
                  <div className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">{formatDate(event.createdAt)}</div>
                  {event.description ? <p className="mt-2 text-sm leading-6 text-slate-600">{event.description}</p> : null}
                </div>
              )) : <p className="text-sm text-slate-500">{t('noTimeline')}</p>}
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
