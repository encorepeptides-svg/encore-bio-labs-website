import { Download, FileText } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from '../../../i18n/LocaleContext'
import { usePortalAuth } from '../../../context/usePortalAuth'
import { createDocumentDownloadUrl, fetchMyDocuments } from '../../../lib/portal/portalData'
import { Badge, Card, EmptyCard, LoadState, SectionIntro, useAsync, useDateFormatter } from './shared'

export function DocumentsSection() {
  const { t } = useTranslation('portal')
  const { identity } = usePortalAuth()
  const formatDate = useDateFormatter()
  const { data, loading, error, reload } = useAsync(() => identity ? fetchMyDocuments(identity.user.id) : Promise.resolve([]), [identity?.user.id])
  const [downloadError, setDownloadError] = useState('')

  async function download(storagePath: string) {
    setDownloadError('')
    try {
      const url = await createDocumentDownloadUrl(storagePath)
      window.open(url, '_blank', 'noopener')
    } catch { setDownloadError(t('documentDownloadError')) }
  }

  return <>
    <SectionIntro title={t('documentsTitle')} copy={t('documentsIntro')} />
    {downloadError ? <p role="alert" className="mt-6 rounded-xl bg-red-50 p-3 text-sm text-red-800">{downloadError}</p> : null}
    <LoadState loading={loading} error={error} onRetry={reload}>
      {data?.length ? <div className="mt-8 grid gap-3">{data.map((document) => <Card key={document.id} className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3"><span className="flex size-10 items-center justify-center rounded-2xl bg-teal-50 text-teal-700"><FileText size={18} /></span><div><p className="font-semibold">{document.title}</p><p className="text-sm text-slate-500">{document.category} · v{document.version} · {formatDate(document.created_at)}</p></div></div>
        <div className="flex items-center gap-3">{document.expires_at ? <Badge tone="neutral">{t('documentExpires', { date: formatDate(document.expires_at) })}</Badge> : null}<button onClick={() => void download(document.storage_path)} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#071724] px-5 text-sm font-semibold text-white transition hover:bg-[#0b3a3e]"><Download size={15} />{t('documentDownload')}</button></div>
      </Card>)}</div> : <EmptyCard title={t('statusNoDocuments')} copy={t('documentsEmptyCopy')} />}
    </LoadState>
  </>
}
