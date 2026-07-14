import { categoryContent, getResearchAreaBySlug } from '../../data/products'
import { localizeCategoryContent, localizeResearchArea } from '../../data/categoryTranslations'
import { useLocale } from '../../i18n/LocaleContext'
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

export function CategoryPage({ slug }: { slug: string }) {
  const { locale, path } = useLocale()
  const area = getResearchAreaBySlug(slug)
  const content = area ? categoryContent[area.slug] : undefined

  if (!area || !content) {
    return (
      <main id="main-content" className="bg-[#F8FAFC] px-5 py-20 sm:px-8">
        <div className="mx-auto max-w-3xl rounded-[2rem] border border-slate-900/10 bg-white p-8 text-center shadow-[0_24px_80px_rgba(7,23,36,0.08)]">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-700">
            {locale === 'es' ? 'Categoría no encontrada' : 'Category not found'}
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-[#071724]">
            {locale === 'es' ? 'Esta categoría de investigación no está disponible.' : "This research category isn't available."}
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-600">
            {locale === 'es' ? 'Vuelve al catálogo de Encore Bio Labs para seguir revisando áreas de investigación.' : 'Return to the Encore Bio Labs catalog to continue exploring research areas.'}
          </p>
          <a
            href={path('/#products')}
            className="mt-7 inline-flex rounded-full bg-[#071724] px-5 py-3 text-sm font-semibold text-white"
          >
            {locale === 'es' ? 'Volver a categorías' : 'Back to categories'}
          </a>
        </div>
      </main>
    )
  }

  const displayArea = localizeResearchArea(area, locale)
  const displayContent = localizeCategoryContent(area, content, locale)
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
