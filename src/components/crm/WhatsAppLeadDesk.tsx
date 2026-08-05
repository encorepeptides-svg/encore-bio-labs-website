import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import {
  AlertTriangle,
  Bot,
  CalendarClock,
  CheckCircle2,
  LoaderCircle,
  MessageCircle,
  RefreshCw,
  Search,
  Send,
  ShieldCheck,
  UserRound,
} from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'

const WEBHOOK_URL = 'https://rrrkjohvxbsahxxevzcg.supabase.co/functions/v1/whatsapp-closeos'
type Row = Record<string, any>

type Bootstrap = {
  conversations: Row[]
  review_tasks: Row[]
  metrics: {
    total_conversations: number
    hot: number
    warm: number
    open_reviews: number
    due_followups: number
    human_takeovers: number
  }
  automation: { enabled?: boolean; mode?: string }
  readiness: {
    webhook: { configured: boolean; missing: string[] }
    delivery: { configured: boolean; missing: string[] }
    openai_configured: boolean
  }
}

async function invokeCloseOS<T>(body: Row): Promise<T> {
  if (!supabase) throw new Error('Supabase is not configured for this deployment.')
  const { data, error } = await supabase.functions.invoke<{ ok: boolean; data?: T; error?: string }>('closeos-admin', { body })
  if (error) throw new Error(error.message || 'CloseOS could not be reached.')
  if (!data?.ok) throw new Error(data?.error || 'CloseOS rejected the request.')
  return data.data as T
}

function fmt(value?: string | null) {
  if (!value) return 'Not yet'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Unknown'
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(date)
}

function localInput(date: Date) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
  return local.toISOString().slice(0, 16)
}

function windowOpen(value?: string | null) {
  if (!value) return false
  return Date.now() - new Date(value).getTime() < 24 * 60 * 60 * 1000
}

function badge(status = '') {
  if (status === 'HOT') return 'bg-rose-100 text-rose-800'
  if (status === 'WARM') return 'bg-amber-100 text-amber-800'
  if (status === 'NURTURE') return 'bg-sky-100 text-sky-800'
  if (status.includes('SUPPRESS') || status.includes('NOT_CONVERTIBLE')) return 'bg-slate-200 text-slate-700'
  return 'bg-slate-100 text-slate-700'
}

export function WhatsAppLeadDesk() {
  const [data, setData] = useState<Bootstrap | null>(null)
  const [selected, setSelected] = useState('')
  const [detail, setDetail] = useState<Row | null>(null)
  const [search, setSearch] = useState('')
  const [reply, setReply] = useState('')
  const [dueAt, setDueAt] = useState(() => localInput(new Date(Date.now() + 8 * 60 * 60 * 1000)))
  const [busy, setBusy] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  async function load(preferred?: string) {
    setError('')
    const next = await invokeCloseOS<Bootstrap>({ action: 'bootstrap' })
    setData(next)
    const target = preferred && next.conversations.some((item) => item.id === preferred)
      ? preferred
      : selected && next.conversations.some((item) => item.id === selected)
        ? selected
        : next.conversations[0]?.id || ''
    setSelected(target)
    if (!target) setDetail(null)
  }

  async function loadConversation(id: string) {
    if (!id) return setDetail(null)
    setDetail(await invokeCloseOS<Row>({ action: 'conversation', conversationId: id }))
  }

  useEffect(() => {
    void load().catch((loadError) => setError(loadError instanceof Error ? loadError.message : 'WhatsApp CRM could not load.'))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (selected) void loadConversation(selected).catch((loadError) => setError(loadError instanceof Error ? loadError.message : 'Conversation could not load.'))
  }, [selected])

  const conversations = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return data?.conversations || []
    return (data?.conversations || []).filter((item) => [
      item.display_name,
      item.identity?.phone_e164,
      item.identity?.external_user_id,
      item.latest_message?.body,
      item.conversion_status,
    ].filter(Boolean).join(' ').toLowerCase().includes(query))
  }, [data?.conversations, search])

  async function act(name: string, action: () => Promise<void>) {
    setBusy(name)
    setError('')
    setNotice('')
    try {
      await action()
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : 'The action failed.')
    } finally {
      setBusy('')
    }
  }

  async function refreshCurrent() {
    await Promise.all([load(selected), selected ? loadConversation(selected) : Promise.resolve()])
  }

  async function takeOver() {
    if (!detail) return
    await act('takeover', async () => {
      const active = !detail.conversation.human_takeover_active
      await invokeCloseOS({ action: 'set_human_takeover', conversationId: detail.conversation.id, active, reason: active ? 'CRM manual takeover' : 'CRM takeover released' })
      setNotice(active ? 'Human takeover enabled; automated follow-ups were canceled.' : 'Human takeover released.')
      await refreshCurrent()
    })
  }

  async function sendReply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!detail || !reply.trim()) return
    await act('send', async () => {
      const result = await invokeCloseOS<Row>({ action: 'send_message', conversationId: detail.conversation.id, message: reply.trim() })
      if (!result.delivery?.delivered) {
        const missing = result.missing?.length ? ` Missing: ${result.missing.join(', ')}.` : ''
        throw new Error(`${result.reason || result.delivery?.reason || 'Message was not delivered.'}${missing}`)
      }
      setReply('')
      setNotice('WhatsApp reply sent and recorded.')
      await refreshCurrent()
    })
  }

  async function schedule(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!detail) return
    await act('schedule', async () => {
      await invokeCloseOS({
        action: 'schedule_followup',
        conversationId: detail.conversation.id,
        dueAt: new Date(dueAt).toISOString(),
        priority: 'normal',
        purpose: 'service',
        reason: 'Resolve the customer-requested support question.',
        openLoop: detail.conversation.open_loop || undefined,
        angle: detail.conversation.follow_up_angle || 'Resolve the open service loop.',
      })
      setNotice('Service follow-up scheduled for restricted human review.')
      await refreshCurrent()
    })
  }

  async function resolveReview(taskId: string) {
    await act(`review-${taskId}`, async () => {
      await invokeCloseOS({ action: 'resolve_review', taskId, status: 'resolved' })
      setNotice('Review task resolved.')
      await refreshCurrent()
    })
  }

  async function runWorker() {
    await act('worker', async () => {
      const result = await invokeCloseOS<Row>({ action: 'run_followup_worker', batchSize: 20 })
      setNotice(Number(result.claimed || 0) ? `${result.claimed} follow-up draft(s) prepared.` : 'No due follow-ups were waiting.')
      await refreshCurrent()
    })
  }

  const connected = Boolean(data?.readiness.webhook.configured)
  const deliverable = Boolean(data?.readiness.delivery.configured)
  const lead = detail?.lead || null
  const conversation = detail?.conversation || null
  const reviews = (detail?.review_tasks || []).filter((task: Row) => task.status === 'open')
  const canReply = deliverable && windowOpen(conversation?.last_inbound_at) && !lead?.do_not_contact

  return (
    <section className="grid gap-5" aria-label="WhatsApp CloseOS lead desk">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">WhatsApp CloseOS</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-[-0.045em] text-[#071724]">Qualification and follow-up desk</h2>
          <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-600">
            Bilingual inbound qualification with CRM synchronization, opt-out controls, human takeover, service-window checks, review routing, and restricted follow-up drafts.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => void runWorker()} disabled={Boolean(busy)} className="inline-flex h-11 items-center gap-2 rounded-full border border-slate-900/10 bg-white px-4 text-sm font-semibold disabled:opacity-50">
            {busy === 'worker' ? <LoaderCircle size={15} className="animate-spin" /> : <CalendarClock size={15} />}
            Process follow-ups
          </button>
          <button type="button" onClick={() => void act('refresh', refreshCurrent)} disabled={Boolean(busy)} className="inline-flex h-11 items-center gap-2 rounded-full bg-[#071724] px-4 text-sm font-semibold text-white disabled:opacity-50">
            <RefreshCw size={15} className={busy === 'refresh' ? 'animate-spin' : ''} />Refresh
          </button>
        </div>
      </div>

      {error ? <div role="alert" className="flex gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-950"><AlertTriangle size={18} className="mt-0.5 shrink-0" />{error}</div> : null}
      {notice ? <div role="status" className="flex gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-950"><CheckCircle2 size={18} className="mt-0.5 shrink-0" />{notice}</div> : null}

      {!connected ? (
        <div className="grid gap-5 rounded-2xl border border-amber-200 bg-amber-50 p-5 lg:grid-cols-2">
          <div>
            <p className="text-sm font-semibold text-amber-950">Meta activation is pending</p>
            <p className="mt-2 text-sm leading-6 text-amber-900/75">The CRM and chatbot engine are installed. Live intake and delivery stay off until Meta credentials are saved as Supabase Edge Function secrets.</p>
            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.12em] text-amber-800">Webhook callback</p>
            <code className="mt-2 block break-all rounded-xl bg-white/70 p-3 text-xs text-amber-950">{WEBHOOK_URL}</code>
          </div>
          <div className="rounded-xl bg-white/70 p-4">
            <p className="text-sm font-semibold text-amber-950">Missing secret names</p>
            <div className="mt-3 grid gap-2 text-xs text-amber-900">
              {(data?.readiness.webhook.missing || ['WHATSAPP_ACCESS_TOKEN', 'WHATSAPP_PHONE_NUMBER_ID', 'WHATSAPP_APP_SECRET', 'WHATSAPP_VERIFY_TOKEN', 'WHATSAPP_GRAPH_VERSION']).map((name) => <code key={name}>{name}</code>)}
            </div>
          </div>
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-6">
        {[
          ['Conversations', data?.metrics.total_conversations || 0],
          ['Hot', data?.metrics.hot || 0],
          ['Warm', data?.metrics.warm || 0],
          ['Open reviews', data?.metrics.open_reviews || 0],
          ['Due follow-ups', data?.metrics.due_followups || 0],
          ['Takeovers', data?.metrics.human_takeovers || 0],
        ].map(([label, value]) => <div key={String(label)} className="rounded-2xl border border-slate-900/10 bg-white p-4"><p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">{label}</p><p className="mt-2 text-3xl font-semibold text-[#071724]">{value}</p></div>)}
      </div>

      <div className="flex items-start gap-3 rounded-2xl border border-slate-900/10 bg-white p-4">
        <ShieldCheck size={18} className="mt-0.5 shrink-0 text-teal-700" />
        <div><p className="text-sm font-semibold text-[#071724]">Draft-only restricted mode</p><p className="mt-1 text-sm leading-6 text-slate-600">Product recommendations, prices, checkout, dosing, protocols, personal-use advice, and automated marketing are blocked.</p></div>
      </div>

      <div className="grid min-h-[40rem] overflow-hidden rounded-[1.5rem] border border-slate-900/10 bg-white shadow-[0_24px_80px_rgba(7,23,36,0.08)] xl:grid-cols-[21rem_1fr]">
        <aside className="border-b border-slate-900/10 bg-[#f8f9fb] xl:border-b-0 xl:border-r">
          <label className="relative block border-b border-slate-900/10 p-4">
            <Search size={16} className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search conversations" className="h-11 w-full rounded-full border border-slate-900/10 bg-white pl-11 pr-4 text-sm outline-none focus:border-teal-500" />
          </label>
          <div className="max-h-[34rem] overflow-y-auto">
            {conversations.length ? conversations.map((item) => (
              <button key={item.id} type="button" onClick={() => setSelected(item.id)} className={`grid w-full gap-2 border-b border-slate-900/8 p-4 text-left ${selected === item.id ? 'bg-white shadow-[inset_3px_0_0_#2EC4A5]' : 'hover:bg-white/70'}`}>
                <div className="flex items-center justify-between gap-2"><span className="truncate text-sm font-semibold text-[#071724]">{item.display_name}</span><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${badge(item.conversion_status)}`}>{item.conversion_status}</span></div>
                <span className="text-xs text-slate-500">{item.identity?.phone_e164 || item.identity?.external_user_id}</span>
                <span className="line-clamp-2 text-xs leading-5 text-slate-600">{item.latest_message?.body || 'No message preview'}</span>
                <span className="text-[10px] text-slate-400">{fmt(item.updated_at)}</span>
              </button>
            )) : <div className="p-7 text-center"><MessageCircle size={28} className="mx-auto text-slate-300" /><p className="mt-3 text-sm font-semibold">No WhatsApp conversations yet</p><p className="mt-2 text-xs leading-5 text-slate-500">Customer-initiated messages appear after Meta webhook activation.</p></div>}
          </div>
        </aside>

        {!detail ? <div className="grid min-h-[36rem] place-items-center p-8 text-center text-sm text-slate-500">Select a WhatsApp lead to review qualification and follow-up.</div> : (
          <div className="grid min-w-0 grid-rows-[auto_minmax(16rem,1fr)_auto]">
            <header className="border-b border-slate-900/10 p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div><div className="flex flex-wrap items-center gap-2"><h3 className="text-2xl font-semibold text-[#071724]">{lead?.preferred_name || 'WhatsApp lead'}</h3><span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${badge(conversation?.conversion_status)}`}>{conversation?.conversion_status} · {conversation?.conversion_score}</span>{conversation?.human_takeover_active ? <span className="rounded-full bg-violet-100 px-2.5 py-1 text-[11px] font-bold text-violet-800">Human takeover</span> : null}</div><p className="mt-2 text-xs text-slate-500">{detail.identity?.phone_e164 || detail.identity?.external_user_id} · {lead?.preferred_language} · {conversation?.stage}</p>{conversation?.conversion_reason ? <p className="mt-3 text-sm leading-6 text-slate-600">{conversation.conversion_reason}</p> : null}</div>
                <button type="button" onClick={() => void takeOver()} disabled={Boolean(busy)} className="inline-flex h-10 items-center gap-2 rounded-full bg-[#071724] px-4 text-xs font-semibold text-white disabled:opacity-50">{busy === 'takeover' ? <LoaderCircle size={14} className="animate-spin" /> : <UserRound size={14} />}{conversation?.human_takeover_active ? 'Release takeover' : 'Take over'}</button>
              </div>
            </header>

            <div className="overflow-y-auto bg-[#f8f9fb] p-5">
              {reviews.map((task: Row) => <div key={task.id} className="mb-3 rounded-2xl border border-amber-200 bg-amber-50 p-4"><p className="text-xs font-bold uppercase tracking-[0.1em] text-amber-950">{String(task.task_type).replaceAll('_', ' ')}</p>{task.ai_draft ? <p className="mt-2 text-sm leading-6 text-amber-950/80">{task.ai_draft}</p> : null}<button type="button" onClick={() => void resolveReview(task.id)} disabled={Boolean(busy)} className="mt-3 rounded-full bg-amber-950 px-3 py-2 text-xs font-semibold text-white">Resolve review</button></div>)}
              <div className="grid gap-3">{(detail.messages || []).map((message: Row) => <div key={message.id} className={`flex ${message.direction === 'OUTBOUND' ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[80%] rounded-2xl px-4 py-3 ${message.direction === 'OUTBOUND' ? 'bg-[#071724] text-white' : 'border border-slate-900/8 bg-white text-[#071724]'}`}><p className="text-[10px] font-semibold uppercase tracking-[0.1em] opacity-60">{message.direction === 'OUTBOUND' ? <><Bot size={11} className="mr-1 inline" />Encore · {message.status}</> : 'Customer'}</p><p className="mt-2 whitespace-pre-wrap text-sm leading-6">{message.body || `[${message.message_type}]`}</p><p className="mt-2 text-[10px] opacity-50">{fmt(message.created_at)}</p></div></div>)}</div>
            </div>

            <div className="grid gap-4 border-t border-slate-900/10 p-5 lg:grid-cols-[1.5fr_1fr]">
              <form onSubmit={sendReply} className="rounded-2xl border border-slate-900/10 p-4"><p className="text-sm font-semibold">Human service reply</p><textarea value={reply} onChange={(event) => setReply(event.target.value)} rows={4} maxLength={1400} placeholder="Write a concise support reply…" className="mt-3 w-full resize-none rounded-xl border border-slate-900/10 bg-[#f8f9fb] p-3 text-sm outline-none focus:border-teal-500" />{!deliverable ? <p className="mt-2 text-xs text-amber-700">Meta delivery credentials are not configured.</p> : !windowOpen(conversation?.last_inbound_at) ? <p className="mt-2 text-xs text-amber-700">The 24-hour service window is closed.</p> : null}<button type="submit" disabled={!canReply || !reply.trim() || Boolean(busy)} className="mt-3 inline-flex h-10 items-center gap-2 rounded-full bg-[#071724] px-4 text-sm font-semibold text-white disabled:opacity-40">{busy === 'send' ? <LoaderCircle size={14} className="animate-spin" /> : <Send size={14} />}Send reply</button></form>
              <form onSubmit={schedule} className="rounded-2xl border border-slate-900/10 bg-[#f8f9fb] p-4"><p className="text-sm font-semibold">Service follow-up review</p><p className="mt-1 text-xs leading-5 text-slate-500">Creates a restricted draft; no automated marketing.</p><input type="datetime-local" value={dueAt} min={localInput(new Date(Date.now() + 60_000))} onChange={(event) => setDueAt(event.target.value)} required className="mt-3 h-11 w-full rounded-xl border border-slate-900/10 bg-white px-3 text-sm" /><button type="submit" disabled={lead?.do_not_contact || conversation?.human_takeover_active || Boolean(busy)} className="mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-full border border-slate-900/10 bg-white px-4 text-sm font-semibold disabled:opacity-40">{busy === 'schedule' ? <LoaderCircle size={14} className="animate-spin" /> : <CalendarClock size={14} />}Schedule draft</button></form>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
