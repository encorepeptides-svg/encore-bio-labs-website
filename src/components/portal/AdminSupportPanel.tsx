import { Send } from 'lucide-react'
import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { usePortalAuth } from '../../context/usePortalAuth'
import { useLocale, useTranslation } from '../../i18n/LocaleContext'
import { listSupportMessages, type SupportMessageRow, type SupportThreadRow } from '../../lib/portal/portalData'
import { supabase } from '../../lib/supabaseClient'

type AdminSupportThread = SupportThreadRow & { user_id: string }

function formatDateTime(value: string, locale: 'en' | 'es') {
  return new Intl.DateTimeFormat(locale === 'es' ? 'es-US' : 'en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
}

function humanize(value: string) {
  return value.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())
}

export function AdminSupportPanel() {
  const { identity } = usePortalAuth()
  const { locale } = useLocale()
  const { t } = useTranslation('portal')
  const [threads, setThreads] = useState<AdminSupportThread[]>([])
  const [profiles, setProfiles] = useState<Record<string, { legal_name: string; email: string }>>({})
  const [selected, setSelected] = useState('')
  const [messages, setMessages] = useState<SupportMessageRow[]>([])
  const [reply, setReply] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const loadThreads = useCallback(async () => {
    if (!supabase) return
    setLoading(true)
    const { data, error: queryError } = await supabase
      .from('support_threads')
      .select('id,user_id,created_at,updated_at,category,subject,status,priority,closed_at')
      .order('updated_at', { ascending: false })
      .limit(100)
    if (queryError) {
      setError(t('adminSupportLoadError'))
      setLoading(false)
      return
    }
    const nextThreads = (data ?? []) as AdminSupportThread[]
    setThreads(nextThreads)
    const userIds = [...new Set(nextThreads.map((thread) => thread.user_id))]
    if (userIds.length > 0) {
      const { data: profileRows } = await supabase.from('profiles').select('id,legal_name,email').in('id', userIds)
      setProfiles(Object.fromEntries((profileRows ?? []).map((profile) => [profile.id, { legal_name: profile.legal_name, email: profile.email }])))
    }
    setLoading(false)
  }, [t])

  useEffect(() => { void loadThreads() }, [loadThreads])
  useEffect(() => {
    if (!selected) { setMessages([]); return }
    void listSupportMessages(selected).then(setMessages).catch(() => setError(t('adminSupportLoadError')))
  }, [selected, t])

  async function sendReply(event: FormEvent) {
    event.preventDefault()
    if (!supabase || !identity || !selected || !reply.trim()) return
    setSaving(true)
    const { error: insertError } = await supabase.from('support_messages').insert({ thread_id: selected, author_id: identity.user.id, message: reply.trim() })
    if (insertError) setError(t('adminSupportSaveError'))
    else {
      setReply('')
      setMessages(await listSupportMessages(selected))
      await loadThreads()
    }
    setSaving(false)
  }

  async function closeThread() {
    if (!supabase || !selected) return
    setSaving(true)
    const { error: updateError } = await supabase.from('support_threads').update({ status: 'closed', closed_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', selected)
    if (updateError) setError(t('adminSupportSaveError'))
    else await loadThreads()
    setSaving(false)
  }

  const current = threads.find((thread) => thread.id === selected)
  return <div className="mt-9 grid gap-5 xl:grid-cols-[minmax(18rem,.75fr)_minmax(0,1.25fr)]"><section className="rounded-[1.5rem] border border-slate-900/8 bg-slate-50 p-5"><h2 className="text-xl font-semibold">{t('adminSupportQueue')}</h2>{error?<p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-800">{error}</p>:null}<div className="mt-4 grid gap-2">{loading?<p className="text-sm text-slate-500">{t('portalLoading')}</p>:threads.length?threads.map((thread)=>{const profile=profiles[thread.user_id];return <button key={thread.id} type="button" onClick={()=>setSelected(thread.id)} className={`rounded-xl border p-4 text-left ${selected===thread.id?'border-teal-600 bg-teal-50':'border-slate-200 bg-white'}`}><span className="flex items-center justify-between gap-2"><span className="font-semibold">{thread.subject}</span><span className="text-[.7rem] text-slate-500">{humanize(thread.status)}</span></span><span className="mt-1 block text-xs text-slate-500">{profile?.legal_name||profile?.email||t('adminClientApplication')}</span><time className="mt-1 block text-[.7rem] text-slate-400">{formatDateTime(thread.updated_at,locale)}</time></button>}):<p className="text-sm text-slate-500">{t('adminSupportEmpty')}</p>}</div></section><section className="rounded-[1.5rem] border border-slate-900/8 bg-[#f8faf9] p-5 sm:p-6"><div className="flex flex-wrap items-start justify-between gap-4"><div><h2 className="text-xl font-semibold">{current?.subject||t('adminSupportConversation')}</h2>{current?<p className="mt-1 text-sm text-slate-500">{profiles[current.user_id]?.email} · {humanize(current.category)}</p>:null}</div>{current&&current.status!=='closed'?<button type="button" disabled={saving} onClick={()=>void closeThread()} className="min-h-10 rounded-full border border-slate-300 bg-white px-4 text-xs font-semibold">{t('adminSupportClose')}</button>:null}</div>{current?<><div className="mt-5 grid max-h-[34rem] gap-3 overflow-y-auto">{messages.map((message)=><article key={message.id} className={`max-w-[90%] rounded-2xl p-4 ${message.author_id===identity?.user.id?'ml-auto bg-[#071724] text-white':'bg-white text-slate-700'}`}><p className="text-sm leading-6">{message.message}</p><time className={`mt-2 block text-[.7rem] ${message.author_id===identity?.user.id?'text-slate-300':'text-slate-400'}`}>{formatDateTime(message.created_at,locale)}</time></article>)}</div>{current.status!=='closed'?<form onSubmit={sendReply} className="mt-5 flex gap-2"><input aria-label={t('supportReply')} className="portal-input min-w-0 flex-1" value={reply} onChange={(event)=>setReply(event.target.value)}/><button disabled={saving||!reply.trim()} aria-label={t('supportSend')} className="grid size-12 shrink-0 place-items-center rounded-full bg-teal-700 text-white disabled:opacity-50"><Send size={17}/></button></form>:<p className="mt-5 rounded-xl bg-slate-100 p-4 text-sm text-slate-600">{t('adminSupportClosed')}</p>}</>:<div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">{t('adminSupportSelect')}</div>}</section></div>
}
