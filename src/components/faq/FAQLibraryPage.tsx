import { ChevronDown } from 'lucide-react'
import { faqLibrary } from '../../data/faq'
import { getLocalizedFaqGroup } from '../../data/faqTranslations'
import { useLocale, useTranslation } from '../../i18n/LocaleContext'
import { CTA } from '../CTA'
import { Reveal } from '../Reveal'
import { InternalLinkGrid } from '../content/EditorialModules'

export function FAQLibraryPage() {
  const { path, locale } = useLocale()
  const { t } = useTranslation('faq')
  const { t: tBrand } = useTranslation('brand')
  const groups = faqLibrary.map((group) => getLocalizedFaqGroup(group, locale))

  return (
    <main id="main-content" className="bg-[#F8FAFC]">
      <div className="px-5 pt-6 sm:px-8">
        <div className="mx-auto flex max-w-[74rem] items-center gap-2 text-sm text-slate-500">
          <a href={path('/')} className="font-medium transition hover:text-[#071724]">
            {t('home')}
          </a>
          <span aria-hidden="true">/</span>
          <span className="font-semibold text-[#071724]">{t('faq')}</span>
        </div>
      </div>

      <section className="px-5 pb-10 pt-8 sm:px-8 lg:pb-14">
        <div className="mx-auto max-w-[74rem]">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-700">
            {t('eyebrow')}
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-[-0.045em] text-[#071724] sm:text-5xl">
            {t('title')}
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
            {t('subtitle')}
          </p>

          <div className="mt-8 flex flex-wrap gap-2">
            {groups.map((group) => (
              <a
                key={group.slug}
                href={`#${group.slug}`}
                className="rounded-full border border-slate-900/10 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:text-[#071724]"
              >
                {group.title}
              </a>
            ))}
          </div>
        </div>
      </section>

      <InternalLinkGrid
        eyebrow={t('startingPointsEyebrow')}
        title={t('startingPointsTitle')}
        links={[
          {
            label: t('categoriesLabel'),
            title: t('categoriesTitle'),
            href: '/#products',
            description: t('categoriesDescription'),
          },
          {
            label: t('featuredProductLabel'),
            title: t('featuredProductTitle'),
            href: '/products/retatrutide',
            description: t('featuredProductDescription'),
          },
          {
            label: t('trustLabel'),
            title: t('trustTitle'),
            href: '/about',
            description: t('trustDescription'),
          },
        ]}
      />

      {groups.map((group, groupIndex) => (
        <section key={group.slug} id={group.slug} className="px-5 py-8 sm:px-8 lg:py-10">
          <div className="mx-auto max-w-[74rem]">
            <Reveal>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">
                {`0${groupIndex + 1}`.slice(-2)} · {group.title}
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-[-0.035em] text-[#071724] sm:text-3xl">
                {group.intro}
              </h2>
            </Reveal>

            <div className="mt-6 divide-y divide-slate-900/10 overflow-hidden rounded-2xl border border-slate-900/10 bg-white shadow-[0_18px_44px_rgba(7,23,36,0.06)]">
              {group.items.map((item) => (
                <details key={item.question} className="group p-5 open:bg-[#f8fafc]">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-5 text-left text-base font-semibold text-[#071724]">
                    {item.question}
                    <ChevronDown
                      size={18}
                      aria-hidden="true"
                      className="shrink-0 text-teal-700 transition group-open:rotate-180"
                    />
                  </summary>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{item.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      ))}

      <section className="px-5 py-6 sm:px-8">
        <div className="mx-auto max-w-[74rem] rounded-[1.75rem] border border-teal-900/10 bg-[#071724] p-6 text-white shadow-[0_26px_80px_rgba(7,23,36,0.16)] sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-teal-200">
            {t('reminderEyebrow')}
          </p>
          <p className="mt-4 max-w-4xl text-lg leading-8 text-slate-100">
            {tBrand('sitewideResearchReminder')}
          </p>
        </div>
      </section>

      <section className="px-5 py-12 sm:px-8 lg:py-16">
        <div className="mx-auto max-w-[74rem] rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,#071724,#0d3144)] px-6 py-12 text-center text-white shadow-[0_34px_110px_rgba(7,23,36,0.22)] sm:px-10">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-teal-200">
            {t('stillHaveQuestion')}
          </p>
          <h2 className="mt-4 text-2xl font-semibold tracking-[-0.04em] sm:text-3xl">
            {t('reachPerson')}
          </h2>
          <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <CTA href="/intake" tone="light">
              {t('findMyMatch')}
            </CTA>
            <CTA
              href="https://wa.me/19153595448"
              target="_blank"
              rel="noopener noreferrer"
              tone="ghost"
              className="border-white/20 bg-white/10 text-white hover:bg-white/15"
            >
              {t('contactEncore')}
            </CTA>
          </div>
        </div>
      </section>
    </main>
  )
}
