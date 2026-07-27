import { Check, ExternalLink, ShieldCheck } from 'lucide-react'
import { useEffect, useRef, type KeyboardEvent } from 'react'
import logo from '../../assets/images/logo/encore-logo.png'
import {
  acknowledgmentContent,
  acknowledgmentPolicies,
  type AcknowledgmentPolicyId,
} from '../../data/acknowledgmentContent'
import { useLocale } from '../../i18n/LocaleContext'
import { LanguageSelector } from '../LanguageSelector'
import { useAcknowledgment } from './useAcknowledgment'
import './SiteEntryAcknowledgment.css'

const entryPolicyIds: readonly AcknowledgmentPolicyId[] = [
  'terms',
  'privacy',
  'researchUseOnly',
]

const focusableSelector = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

export function SiteEntryAcknowledgment() {
  const { locale, path } = useLocale()
  const { acceptSiteEntry } = useAcknowledgment()
  const copy = acknowledgmentContent[locale].entry
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    dialogRef.current?.focus()

    const blockEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key !== 'Escape') return
      event.preventDefault()
      event.stopPropagation()
    }
    document.addEventListener('keydown', blockEscape, true)

    return () => {
      document.removeEventListener('keydown', blockEscape, true)
      document.body.style.overflow = previousOverflow
      if (previousFocus?.isConnected) previousFocus.focus()
    }
  }, [])

  function trapFocus(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Escape') {
      event.preventDefault()
      event.stopPropagation()
      return
    }
    if (event.key !== 'Tab') return
    const focusable = Array.from(dialogRef.current?.querySelectorAll<HTMLElement>(focusableSelector) ?? [])
      .filter((element) => !element.hasAttribute('disabled') && element.tabIndex !== -1)
    if (!focusable.length) {
      event.preventDefault()
      dialogRef.current?.focus()
      return
    }
    const first = focusable[0]
    const last = focusable.at(-1)!
    if (event.shiftKey && (document.activeElement === dialogRef.current || document.activeElement === first)) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }

  return (
    <div className="encore-acknowledgment-backdrop fixed inset-0 z-[250] flex items-center justify-center overflow-hidden bg-[#03131f]/94 px-4 [padding-bottom:max(1rem,env(safe-area-inset-bottom))] [padding-top:max(1rem,env(safe-area-inset-top))] backdrop-blur-xl">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="site-entry-acknowledgment-title"
        aria-describedby="site-entry-acknowledgment-description"
        tabIndex={-1}
        onKeyDown={trapFocus}
        className="encore-acknowledgment-card flex max-h-[calc(100dvh-2rem)] w-full max-w-[42rem] flex-col overflow-hidden rounded-[2rem] border border-white/70 bg-[#fbfcfa] shadow-[0_40px_140px_rgba(0,0,0,0.5)] outline-none"
      >
        <header className="flex shrink-0 items-center justify-between gap-4 border-b border-slate-900/8 bg-white/80 px-5 py-4 sm:px-7">
          <img src={logo} alt="Encore Bio Labs" className="h-8 w-auto sm:h-9" />
          <LanguageSelector variant="mobile" className="shrink-0 bg-white" />
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-6 sm:px-8 sm:py-8">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-teal-700">
            <ShieldCheck size={16} aria-hidden="true" />
            {copy.eyebrow}
          </div>
          <h1
            id="site-entry-acknowledgment-title"
            className="mt-4 text-3xl font-semibold tracking-[-0.045em] text-[#071724] sm:text-4xl"
          >
            {copy.title}
          </h1>
          <div id="site-entry-acknowledgment-description" className="mt-4 grid gap-3 text-sm leading-6 text-slate-600 sm:text-[0.95rem] sm:leading-7">
            <p className="font-semibold text-slate-700">{copy.ageBody}</p>
            <p>{copy.researchBody}</p>
          </div>

          <section className="mt-6 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-[0_12px_35px_rgba(7,23,36,0.05)] sm:p-5" aria-labelledby="entry-confirmations-title">
            <h2 id="entry-confirmations-title" className="text-sm font-semibold text-[#071724]">
              {copy.confirmationLead}
            </h2>
            <ul className="mt-3 grid gap-3 text-sm leading-6 text-slate-600">
              {copy.confirmations.map((confirmation) => (
                <li key={confirmation} className="flex items-start gap-3">
                  <span className="mt-1 flex size-5 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-800">
                    <Check size={13} strokeWidth={2.5} aria-hidden="true" />
                  </span>
                  <span>{confirmation}</span>
                </li>
              ))}
              <li className="flex items-start gap-3">
                <span className="mt-1 flex size-5 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-800">
                  <Check size={13} strokeWidth={2.5} aria-hidden="true" />
                </span>
                <span>
                  {copy.policyLead}{' '}
                  {entryPolicyIds.map((id, index) => {
                    const policy = acknowledgmentPolicies.find((entry) => entry.id === id)!
                    const isLast = index === entryPolicyIds.length - 1
                    const separator = index === 0
                      ? ''
                      : isLast
                        ? locale === 'en' ? `, ${copy.policyJoiner} ` : ` ${copy.policyJoiner} `
                        : ', '
                    return (
                      <span key={id}>
                        {separator}
                        <a
                          href={path(policy.href)}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`${policy.label[locale]} — ${copy.opensNewTab}`}
                          className="font-semibold text-teal-800 underline decoration-teal-700/35 underline-offset-2 transition hover:text-[#071724] focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
                        >
                          {policy.agreementLabel[locale]}
                          <ExternalLink size={11} className="ml-1 inline" aria-hidden="true" />
                        </a>
                      </span>
                    )
                  })}
                  .
                </span>
              </li>
            </ul>
          </section>
        </div>

        <footer className="shrink-0 border-t border-slate-900/8 bg-[#f7f9f7]/96 px-5 py-4 sm:px-8 sm:py-5">
          <button
            type="button"
            onClick={acceptSiteEntry}
            className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[#071724] px-6 text-sm font-semibold text-white shadow-[0_14px_35px_rgba(7,23,36,0.22)] transition hover:-translate-y-0.5 hover:bg-teal-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 motion-reduce:transform-none motion-reduce:transition-none"
          >
            {copy.enterButton}
          </button>
          <div className="mt-3 flex flex-col items-center justify-between gap-2 text-center sm:flex-row sm:text-left">
            <a
              href={path('/access-denied')}
              className="rounded-full px-3 py-2 text-sm font-semibold text-slate-500 transition hover:text-[#071724] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
            >
              {copy.exitButton}
            </a>
            <p className="text-[0.7rem] leading-4 text-slate-400">{copy.retentionNote}</p>
          </div>
        </footer>
      </div>
    </div>
  )
}
