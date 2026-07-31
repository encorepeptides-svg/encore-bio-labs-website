import { ArrowRight } from 'lucide-react'
import { useLocale, useTranslation } from '../../../i18n/LocaleContext'
import { track } from '../../../lib/analytics'

// Slim band after the FAQ. The projection/BMI tooling deliberately does not live
// on the product page — interested visitors self-select into intake instead, so
// the page never puts a personalized outcome estimate next to an add-to-cart.
export function RetatrutideProtocolBand() {
  const { locale, path } = useLocale()
  const { t } = useTranslation('retatrutide')

  return (
    <section className="px-5 pb-4 sm:px-8">
      <div className="mx-auto flex max-w-[88rem] flex-wrap items-center justify-between gap-6 rounded-[1.75rem] bg-[linear-gradient(120deg,#0d3b46,#071724)] px-6 py-7 text-white shadow-[0_28px_80px_rgba(7,23,36,0.2)] sm:px-8">
        <div className="min-w-0">
          <p className="text-xl font-semibold tracking-[-0.035em] sm:text-2xl">{t('protocolBandTitle')}</p>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">{t('protocolBandBody')}</p>
        </div>
        <a
          href={path('/intake?product=retatrutide&source=protocol-band')}
          onClick={() => track('retatrutide_protocol_band_click', { locale })}
          className="inline-flex min-h-14 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-teal-400 px-7 text-base font-bold text-[#071724] shadow-[0_18px_48px_rgba(20,184,166,0.28)] transition hover:-translate-y-0.5 hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-300"
        >
          {t('protocolBandCta')}
          <ArrowRight size={17} aria-hidden="true" />
        </a>
      </div>
    </section>
  )
}
