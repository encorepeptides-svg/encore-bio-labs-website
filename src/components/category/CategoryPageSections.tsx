import type { ResearchArea } from '../../data/products'
import { useLocale, useTranslation } from '../../i18n/LocaleContext'

/** Shared, locale-aware breadcrumb used by every premium category page. */
export function CategoryBreadcrumb({ area }: { area: ResearchArea }) {
  const { path } = useLocale()
  const { t } = useTranslation('categoryPage')
  return (
    <div className="bg-[#030b18] px-5 pt-5 text-white sm:px-8">
      <nav aria-label={t('breadcrumbLabel')} className="mx-auto flex max-w-[88rem] items-center gap-2 text-sm text-slate-400">
        <a href={path('/')} className="min-h-11 content-center font-medium transition hover:text-white">
          {t('home')}
        </a>
        <span aria-hidden="true">/</span>
        <a href={path('/#products')} className="min-h-11 content-center font-medium transition hover:text-white">
          {t('categories')}
        </a>
        <span aria-hidden="true">/</span>
        <span aria-current="page" className="truncate font-semibold text-white">{area.name}</span>
      </nav>
    </div>
  )
}
