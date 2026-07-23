import { getGeneralInquiryMessage, buildWhatsAppUrl } from '../../lib/whatsapp'
import { track } from '../../lib/analytics'
import { useLocale, useTranslation } from '../../i18n/LocaleContext'
import { CTA } from '../CTA'

export function CatalogHelpCallout() {
  const { locale } = useLocale()
  const { t } = useTranslation('catalog')
  const { t: tCommon } = useTranslation('common')

  return (
    <section className="px-5 py-10 sm:px-8 sm:py-12">
      <div className="mx-auto max-w-[88rem] rounded-[2rem] border border-slate-900/8 bg-white p-6 text-center shadow-[0_20px_65px_rgba(7,23,36,0.06)] sm:p-10">
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
            onClick={() => track('whatsapp_click', { source: 'catalog_help', locale })}
          >
            {tCommon('whatsapp')}
          </CTA>
        </div>
      </div>
    </section>
  )
}
