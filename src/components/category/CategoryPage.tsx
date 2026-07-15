import { categoryContent, getResearchAreaBySlug } from '../../data/products'
import { localizeCategoryContent, localizeResearchArea } from '../../data/categoryTranslations'
import { useLocale, useTranslation } from '../../i18n/LocaleContext'
import {
  CategoryBreadcrumb,
  CategoryComparisonTable,
  CategoryDisclaimer,
  CategoryFAQSection,
  CategoryFeaturedProducts,
  CategoryFinalCTA,
  CategoryHero,
  CategoryOverview,
  CategoryResearchLinks,
  KeyThemes,
  RelatedCategories,
  WhyStudied,
} from './CategoryPageSections'
import { HormoneWellnessCategoryPage } from './HormoneWellnessCategoryPage'

export function CategoryPage({ slug }: { slug: string }) {
  const { locale, path } = useLocale()
  const { t } = useTranslation('categoryPage')
  const area = getResearchAreaBySlug(slug)
  const content = area ? categoryContent[area.slug] : undefined

  if (!area || !content) {
    return (
      <main id="main-content" className="bg-[#F8FAFC] px-5 py-20 sm:px-8">
        <div className="mx-auto max-w-3xl rounded-[2rem] border border-slate-900/10 bg-white p-8 text-center shadow-[0_24px_80px_rgba(7,23,36,0.08)]">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-700">
            {t('notFoundEyebrow')}
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-[#071724]">
            {t('notFoundTitle')}
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-600">
            {t('notFoundBody')}
          </p>
          <a
            href={path('/#products')}
            className="mt-7 inline-flex rounded-full bg-[#071724] px-5 py-3 text-sm font-semibold text-white"
          >
            {t('notFoundCta')}
          </a>
        </div>
      </main>
    )
  }

  const displayArea = localizeResearchArea(area, locale)
  const displayContent = localizeCategoryContent(area, content, locale)

  if (slug === 'hormone-wellness') return <HormoneWellnessCategoryPage area={displayArea} />

  return (
    <main id="main-content" className="bg-[#F8FAFC]">
      <CategoryBreadcrumb area={displayArea} />
      <CategoryHero area={displayArea} content={displayContent} />
      <CategoryOverview content={displayContent} />
      <WhyStudied content={displayContent} />
      <KeyThemes content={displayContent} />
      <CategoryFeaturedProducts area={displayArea} />
      <CategoryComparisonTable area={displayArea} content={displayContent} />
      <CategoryFAQSection area={displayArea} content={displayContent} />
      <CategoryResearchLinks area={displayArea} />
      <RelatedCategories content={displayContent} />
      <CategoryDisclaimer content={displayContent} />
      <CategoryFinalCTA area={displayArea} />
    </main>
  )
}
