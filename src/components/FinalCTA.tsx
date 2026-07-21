import { useTranslation } from '../i18n/LocaleContext'
import { BacWaterHeroImage } from './BacWaterHeroImage'
import { CTA } from './CTA'

export function FinalCTA() {
  const { t } = useTranslation('homepage')

  return (
    <section className="px-5 py-12 sm:px-8 lg:py-16">
      <div className="relative mx-auto max-w-[88rem] overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,#071724,#0d3144)] px-6 py-14 text-center text-white shadow-[0_34px_110px_rgba(7,23,36,0.22)] sm:px-10 sm:py-16">
        <BacWaterHeroImage
          alt=""
          sizes="(min-width: 640px) 48vw, 100vw"
          className="pointer-events-none absolute inset-y-0 right-0 h-full w-full object-cover object-center opacity-[0.16] sm:w-[48%]"
        />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(7,23,36,0.98)_0%,rgba(7,23,36,0.88)_58%,rgba(7,23,36,0.5)_100%)]" aria-hidden="true" />
        <div className="molecule-field opacity-[0.1]" aria-hidden="true" />
        <div className="pointer-events-none absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 rounded-full bg-teal-300/16 blur-3xl" />

        <div className="relative mx-auto max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-teal-200">
            {t('finalCtaEyebrow')}
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-[-0.045em] sm:text-4xl lg:text-5xl">
            {t('finalCtaTitle')}
          </h2>
          <p className="mt-5 text-base leading-7 text-slate-300">
            {t('finalCtaBody')}
          </p>

          <div className="mt-8 flex justify-center">
            <CTA href="/catalog" tone="light">
              {t('finalCtaButton')}
            </CTA>
          </div>
        </div>
      </div>
    </section>
  )
}
