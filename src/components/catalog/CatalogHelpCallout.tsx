import { getGeneralInquiryMessage, buildWhatsAppUrl } from '../../lib/whatsapp'
import { useLocale, useTranslation } from '../../i18n/LocaleContext'
import kitHeroImage from '../../assets/images/complete-research-kit-hero.webp'
import { CTA } from '../CTA'

export function CatalogHelpCallout() {
  const { locale, path } = useLocale()
  const { t } = useTranslation('catalog')
  const { t: tCommon } = useTranslation('common')

  return (
    <section className="px-5 py-12 sm:px-8 lg:py-16">
      <div className="mx-auto max-w-[88rem] rounded-[2rem] border border-slate-900/8 bg-white p-6 text-center shadow-[0_20px_65px_rgba(7,23,36,0.06)] sm:p-10">
        <div className="grid items-center gap-6 text-left lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div className="overflow-hidden rounded-[1.35rem] border border-teal-900/10 bg-[#f5fbfa] shadow-[0_16px_40px_rgba(7,23,36,0.06)]">
            <img
              src={kitHeroImage}
              alt={t('kitCalloutImageAlt')}
              width="1536"
              height="1024"
              loading="lazy"
              decoding="async"
              className="aspect-[3/2] h-full w-full object-cover object-[62%_center]"
            />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">{t('kitCalloutEyebrow')}</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-[-0.035em] text-[#071724] sm:text-3xl">{t('kitCalloutTitle')}</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">{t('kitCalloutBody')}</p>
            <a
              href={path('/kits')}
              className="mt-5 inline-flex min-h-11 items-center justify-center rounded-full bg-[#071724] px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
            >
              {t('kitCalloutCta')}
            </a>
          </div>
        </div>

        <div className="mt-10 border-t border-slate-900/8 pt-10">
        <h2 className="text-2xl font-semibold tracking-[-0.035em] text-[#071724] sm:text-3xl">
          {t('helpTitle')}
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600 sm:text-base">
          {t('helpBody')}
        </p>
        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <CTA href="/intake">{t('startResearchIntake')}</CTA>
          <CTA
            href={buildWhatsAppUrl(getGeneralInquiryMessage(locale))}
            tone="ghost"
            target="_blank"
            rel="noopener noreferrer"
          >
            {tCommon('whatsapp')}
          </CTA>
        </div>
        </div>
      </div>
    </section>
  )
}
