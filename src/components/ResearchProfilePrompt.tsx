import { FlaskConical, MessageCircle, Target } from 'lucide-react'
import { useTranslation } from '../i18n/LocaleContext'
import { CTA } from './CTA'
import { Reveal } from './Reveal'

export function ResearchProfilePrompt() {
  const { t } = useTranslation('homepage')

  const previewSteps = [
    { icon: FlaskConical, label: t('promptStep1') },
    { icon: Target, label: t('promptStep2') },
    { icon: MessageCircle, label: t('promptStep3') },
  ]

  const microcopy = [t('promptMicrocopy1'), t('promptMicrocopy2'), t('promptMicrocopy3')]

  return (
    <section id="research-profile-prompt" className="px-5 py-14 sm:px-8 lg:py-20">
      <div className="mx-auto max-w-[88rem]">
        <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,#071724,#0d3144)] shadow-[0_34px_110px_rgba(7,23,36,0.22)]">
          <div className="molecule-field opacity-[0.1]" aria-hidden="true" />
          <div className="pointer-events-none absolute left-1/2 top-0 size-64 -translate-x-1/2 rounded-full bg-teal-300/16 blur-3xl" />

          <div className="relative grid gap-10 px-6 py-14 sm:px-10 sm:py-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-8">
            <Reveal className="text-center lg:text-left">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-teal-200">
                {t('promptEyebrow')}
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.045em] text-white sm:text-4xl lg:text-5xl">
                {t('promptTitle')}
              </h2>
              <p className="mx-auto mt-5 max-w-lg text-base leading-7 text-slate-300 lg:mx-0">
                {t('promptBody')}
              </p>

              <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row lg:items-start">
                <CTA href="/intake" tone="light">
                  {t('startYourResearch')}
                </CTA>
                <CTA
                  href="/catalog"
                  tone="ghost"
                  className="border-white/20 bg-white/10 text-white hover:bg-white/15"
                >
                  {t('promptBrowseCatalog')}
                </CTA>
              </div>

              <ul className="mx-auto mt-6 flex max-w-lg flex-col items-center gap-1.5 text-xs leading-5 text-slate-400 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-x-4 lg:mx-0 lg:justify-start lg:text-left">
                {microcopy.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </Reveal>

            <Reveal delay={0.08} className="mx-auto w-full max-w-sm">
              <div className="rounded-[1.5rem] border border-white/10 bg-white/6 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-200">
                  {t('promptCardEyebrow')}
                </p>
                <div className="mt-5 flex flex-col gap-3">
                  {previewSteps.map((step) => (
                    <div
                      key={step.label}
                      className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5"
                    >
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-teal-300/14 text-teal-100">
                        <step.icon size={16} aria-hidden="true" />
                      </span>
                      <span className="text-sm font-semibold text-slate-100">{step.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}
