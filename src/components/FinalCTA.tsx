import { useLocale, useTranslation } from '../i18n/LocaleContext'
import { track } from '../lib/analytics'
import { buildWhatsAppUrl, getGeneralInquiryMessage } from '../lib/whatsapp'
import { CTA } from './CTA'

export function FinalCTA() {
  const { locale } = useLocale()
  const { t } = useTranslation('homepage')

  return (
    <section className="relative overflow-hidden bg-[#030b18] px-5 py-16 text-white sm:px-8 lg:py-20">
      <div className="molecule-field opacity-[0.12]" aria-hidden="true" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-72 w-[42rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-teal-300/14 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(40,224,193,0.08),transparent_34rem),linear-gradient(180deg,transparent,rgba(0,0,0,0.22))]" />

      <div className="relative mx-auto max-w-3xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-teal-200">
          {t('finalCtaEyebrow')}
        </p>
        <h2 className="mt-4 text-3xl font-semibold tracking-[-0.045em] sm:text-4xl lg:text-5xl">
          {t('finalCtaTitle')}
        </h2>
        <p className="mt-5 text-base leading-7 text-slate-300">
          {t('finalCtaBody')}
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <CTA href="/catalog" tone="light">
            {t('finalCtaButton')}
          </CTA>
          <CTA
            href={buildWhatsAppUrl(getGeneralInquiryMessage(locale))}
            tone="ghost"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track('whatsapp_click', { source: 'homepage_final_cta', locale })}
            className="border-white/20 bg-white/8 text-white hover:bg-white/14"
          >
            {t('finalCtaContact')}
          </CTA>
        </div>
      </div>
    </section>
  )
}
