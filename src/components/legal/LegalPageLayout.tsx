import { AlertTriangle } from 'lucide-react'
import type { ReactNode } from 'react'
import { useLocale, useTranslation } from '../../i18n/LocaleContext'

export type LegalSection = {
  heading: string
  body: ReactNode
}

export function LegalPageLayout({
  title,
  effectiveDate,
  intro,
  sections,
}: {
  title: string
  effectiveDate: string
  intro: string
  sections: LegalSection[]
}) {
  const { path } = useLocale()
  const { t } = useTranslation('legal')

  const legalNav = [
    { label: t('termsOfService'), href: '/legal/terms' },
    { label: t('privacyPolicy'), href: '/legal/privacy' },
    { label: t('shippingReturns'), href: '/legal/shipping-returns' },
  ]

  return (
    <main id="main-content" className="bg-[#f5f5f2] px-5 py-14 sm:px-8 lg:py-20">
      <div className="mx-auto max-w-4xl">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-700">{t('eyebrow')}</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-[-0.045em] text-[#071724] sm:text-5xl">
          {title}
        </h1>
        <p className="mt-3 text-sm font-semibold text-slate-500">{t('effectiveDate', { date: effectiveDate })}</p>
        <p className="mt-6 text-base leading-7 text-slate-600">{intro}</p>

        <div className="mt-8 flex flex-wrap gap-2">
          {legalNav.map((item) => (
            <a
              key={item.href}
              href={path(item.href)}
              className="rounded-full border border-slate-900/10 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:text-[#071724]"
            >
              {item.label}
            </a>
          ))}
        </div>

        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-amber-400/30 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
          <AlertTriangle size={18} aria-hidden="true" className="mt-0.5 shrink-0 text-amber-600" />
          <p>
            {t('counselNotice')}
          </p>
        </div>

        <div className="mt-10 grid gap-8">
          {sections.map((section) => (
            <section key={section.heading}>
              <h2 className="text-xl font-semibold tracking-[-0.03em] text-[#071724]">
                {section.heading}
              </h2>
              <div className="mt-3 grid gap-3 text-sm leading-7 text-slate-600">{section.body}</div>
            </section>
          ))}
        </div>

        <div className="mt-12 rounded-2xl border border-slate-900/10 bg-white p-5 text-sm leading-6 text-slate-600">
          <p className="font-semibold text-[#071724]">{t('questionsTitle')}</p>
          <p className="mt-2">
            {t('questionsBodyPrefix')}{' '}
            <a href={path('/intake')} className="font-semibold text-teal-700 hover:underline">
              {t('researchIntakeProcess')}
            </a>{' '}
            {t('questionsBodyConnector')}{' '}
            <a href="https://wa.me/19153595448" className="font-semibold text-teal-700 hover:underline">
              9153595448
            </a>
            .
          </p>
        </div>
      </div>
    </main>
  )
}
