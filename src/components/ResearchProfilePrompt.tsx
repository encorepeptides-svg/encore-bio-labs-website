import { FlaskConical, MessageCircle, Target } from 'lucide-react'
import { useLocale, useTranslation } from '../i18n/LocaleContext'
import { CTA } from './CTA'
import { Reveal } from './Reveal'

export function ResearchProfilePrompt() {
  const { path } = useLocale()
  const { t } = useTranslation('homepage')

  const previewSteps = [
    { icon: FlaskConical, label: t('promptStep1'), href: '/intake#research-goal', ariaLabel: t('promptStep1Aria') },
    { icon: Target, label: t('promptStep2'), href: '/intake#research-priorities', ariaLabel: t('promptStep2Aria') },
    { icon: MessageCircle, label: t('promptStep3'), href: '/intake#research-support', ariaLabel: t('promptStep3Aria') },
  ]

  return (
    <section id="research-profile-prompt" className="px-5 py-8 sm:px-8 lg:py-10">
      <div className="mx-auto max-w-[88rem]">
        <div className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-[linear-gradient(135deg,#071724,#0d3144)] shadow-[0_28px_90px_rgba(7,23,36,0.18)]">
          <div className="molecule-field opacity-[0.1]" aria-hidden="true" />
          <div className="pointer-events-none absolute right-[12%] top-1/2 size-56 -translate-y-1/2 rounded-full bg-teal-300/14 blur-3xl" />

          <div className="relative grid gap-7 px-6 py-7 sm:px-8 sm:py-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-10">
            <Reveal>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-teal-200">
                {t('promptEyebrow')}
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-[-0.045em] text-white sm:text-4xl">
                {t('promptTitle')}
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
                {t('promptBody')}
              </p>
              <ul className="mt-5 flex flex-wrap gap-2" aria-label={t('promptCardEyebrow')}>
                {previewSteps.map((step) => (
                  <li key={step.label}>
                    <a
                      href={path(step.href)}
                      aria-label={step.ariaLabel}
                      className="inline-flex min-h-10 items-center gap-2 rounded-full border border-white/10 bg-white/6 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:border-teal-200/45 hover:bg-white/12 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-200 focus-visible:ring-offset-2 focus-visible:ring-offset-[#071724]"
                    >
                      <step.icon size={14} aria-hidden="true" className="text-teal-200" />
                      {step.label}
                    </a>
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal delay={0.08} className="lg:justify-self-end">
              <CTA href="/intake" tone="light" className="min-h-12 whitespace-nowrap px-7">
                {t('startYourResearch')}
              </CTA>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}
