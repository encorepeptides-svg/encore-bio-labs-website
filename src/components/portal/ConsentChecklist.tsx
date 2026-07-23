import { ExternalLink, FileText, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useLocale, useTranslation } from '../../i18n/LocaleContext'

export type ConsentChecklistItem<Key extends string> = {
  key: Key
  title: string
  summary: string
  href?: '/legal/terms' | '/legal/privacy'
  required: boolean
  fullDocumentAvailable?: boolean
}

export function ConsentChecklist<Key extends string>({
  items,
  values,
  onChange,
}: {
  items: Array<ConsentChecklistItem<Key>>
  values: Record<Key, boolean>
  onChange: (key: Key, checked: boolean) => void
}) {
  const { path } = useLocale()
  const { t } = useTranslation('portal')
  const [openItem, setOpenItem] = useState<ConsentChecklistItem<Key> | null>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const triggerButtonRef = useRef<HTMLButtonElement | null>(null)

  function closeDocument() {
    setOpenItem(null)
    window.requestAnimationFrame(() => triggerButtonRef.current?.focus())
  }

  useEffect(() => {
    if (!openItem) return
    const previousOverflow = document.body.style.overflow
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeDocument()
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', closeOnEscape)
    closeButtonRef.current?.focus()
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [openItem])

  return (
    <>
      <div className="grid gap-3">
        {items.map((item) => {
          const inputId = `consent-${item.key}`
          return (
            <div key={item.key} className="flex min-h-16 items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 text-sm">
              <input
                id={inputId}
                type="checkbox"
                required={item.required}
                checked={values[item.key]}
                onChange={(event) => onChange(item.key, event.target.checked)}
                className="mt-1 size-4 shrink-0 accent-teal-700"
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  {item.href ? (
                    <a
                      href={path(item.href)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 font-semibold text-teal-800 underline decoration-teal-700/30 underline-offset-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
                    >
                      {item.title}<ExternalLink size={13} aria-hidden="true" />
                    </a>
                  ) : (
                    <button
                      type="button"
                      onClick={(event) => {
                        triggerButtonRef.current = event.currentTarget
                        setOpenItem(item)
                      }}
                      className="inline-flex items-center gap-1.5 text-left font-semibold text-teal-800 underline decoration-teal-700/30 underline-offset-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
                    >
                      {item.title}<FileText size={13} aria-hidden="true" />
                    </button>
                  )}
                  <span className={`rounded-full px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide ${item.required ? 'bg-slate-100 text-slate-600' : 'bg-teal-50 text-teal-800'}`}>
                    {item.required ? t('consentRequired') : t('consentOptional')}
                  </span>
                </div>
                <label htmlFor={inputId} className="mt-2 block cursor-pointer leading-6 text-slate-600">{item.summary}</label>
              </div>
            </div>
          )
        })}
      </div>

      {openItem ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="consent-document-title"
          aria-describedby="consent-document-summary"
          className="fixed inset-0 z-[120] grid place-items-center bg-[#020810]/75 p-4 backdrop-blur-sm"
          onMouseDown={(event) => { if (event.target === event.currentTarget) closeDocument() }}
        >
          <section className="max-h-[min(42rem,90vh)] w-full max-w-2xl overflow-y-auto rounded-[1.5rem] bg-white p-6 shadow-2xl sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">{t('consentDocument')}</p>
                <h2 id="consent-document-title" className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[#071724]">{openItem.title}</h2>
              </div>
              <button ref={closeButtonRef} type="button" onClick={closeDocument} aria-label={t('closeDocument')} className="flex size-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"><X size={18} /></button>
            </div>
            <p id="consent-document-summary" className="mt-6 text-sm leading-7 text-slate-700">{openItem.summary}</p>
            {openItem.fullDocumentAvailable === false ? (
              <p className="mt-6 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm leading-6 text-amber-950">{t('approvedConsentCopyPending')}</p>
            ) : null}
            <button type="button" onClick={closeDocument} className="mt-7 min-h-11 rounded-full bg-[#071724] px-6 text-sm font-semibold text-white">{t('closeDocument')}</button>
          </section>
        </div>
      ) : null}
    </>
  )
}
