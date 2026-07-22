import { categoryContent, type ResearchArea } from '../../data/products'
import { localizeCategoryContent } from '../../data/categoryTranslations'
import { useLocale } from '../../i18n/LocaleContext'
import { PremiumCategoryPage } from './PremiumCategoryPage'

/** Backward-compatible entrypoint retained for route-level and rendering tests. */
export function HormoneWellnessCategoryPage({ area }: { area: ResearchArea }) {
  const { locale } = useLocale()
  const content = categoryContent['hormone-wellness']
  return <PremiumCategoryPage area={area} content={localizeCategoryContent(area, content, locale)} />
}
