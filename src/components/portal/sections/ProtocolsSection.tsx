import { FlaskConical } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from '../../../i18n/LocaleContext'
import { fetchMyProtocols, type ClientProtocol } from '../../../lib/portal/portalData'
import { Badge, Card, EmptyCard, LoadState, SectionIntro, statusTone, useAsync, useDateFormatter } from './shared'

export function ProtocolsSection() {
  const { t } = useTranslation('portal')
  const { data, loading, error, reload } = useAsync(fetchMyProtocols)
  return <>
    <SectionIntro title={t('protocolsTitle')} copy={t('protocolsIntro')} />
    <LoadState loading={loading} error={error} onRetry={reload}>
      {data?.length ? <div className="mt-8 grid gap-4">{data.map((protocol) => <ProtocolCard key={protocol.id} protocol={protocol} />)}</div> : <EmptyCard title={t('protocolsEmptyTitle')} copy={t('protocolsEmptyCopy')} />}
    </LoadState>
    <p className="mt-6 text-xs leading-5 text-slate-500">{t('protocolsDisclaimer')}</p>
  </>
}

function ProtocolCard({ protocol }: { protocol: ClientProtocol }) {
  const { t } = useTranslation('portal')
  const formatDate = useDateFormatter()
  const [open, setOpen] = useState(protocol.status === 'active')
  const statusKey = ({ active: 'protocolStatusActive', completed: 'protocolStatusCompleted', archived: 'protocolStatusArchived' } as Record<string, string>)[protocol.status]
  return <Card>
    <button onClick={() => setOpen((value) => !value)} aria-expanded={open} className="flex w-full flex-wrap items-center justify-between gap-3 text-left">
      <div className="flex items-center gap-3"><span className="flex size-10 items-center justify-center rounded-2xl bg-teal-50 text-teal-700"><FlaskConical size={18} /></span><div><p className="font-semibold">{protocol.title}</p><p className="text-sm text-slate-500">{t('protocolUpdated', { date: formatDate(protocol.updated_at) })}</p></div></div>
      <Badge tone={statusTone(protocol.status)}>{statusKey ? t(statusKey) : protocol.status}</Badge>
    </button>
    {protocol.summary ? <p className="mt-4 text-sm leading-6 text-slate-600">{protocol.summary}</p> : null}
    {open && protocol.body ? <div className="mt-4 whitespace-pre-wrap rounded-[1.1rem] bg-white p-5 text-sm leading-7 text-slate-700">{protocol.body}</div> : null}
  </Card>
}
