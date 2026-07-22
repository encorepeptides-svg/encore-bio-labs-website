import { ArrowRight, BadgeCheck, FlaskConical, PackageCheck, Sparkles } from 'lucide-react'
import { ProductImage } from '../../ProductImage'
import { usePortalAuth } from '../../../context/usePortalAuth'
import { getPortalProductMatches } from '../../../data/portalRecommendations'
import { getLocalizedProduct, localizedCategoryLabel } from '../../../data/productTranslations'
import { getProductResearchContent } from '../../../data/productResearchContent'
import { localizeProductResearchContent } from '../../../data/productResearchTranslations'
import { useLocale, useTranslation } from '../../../i18n/LocaleContext'
import { fetchMyIntake } from '../../../lib/portal/portalData'
import { Badge, LoadState, SectionIntro, useAsync } from './shared'

export function ResearchMatchesSection() {
  const { identity } = usePortalAuth()
  const { locale, path } = useLocale()
  const { t } = useTranslation('portal')
  const { data, loading, error, reload } = useAsync(
    () => identity ? fetchMyIntake(identity.user.id) : Promise.resolve(null),
    [identity?.user.id],
  )
  const matches = getPortalProductMatches({
    goals: data?.goals,
    researchInterests: data?.research_interests,
    interestedProducts: data?.interested_products,
  })

  return <>
    <SectionIntro title={t('researchMatchesTitle')} copy={t('researchMatchesIntro')} />
    <div className="mt-6 flex flex-wrap items-center gap-2 rounded-[1.25rem] bg-[#071724] p-5 text-white">
      <Sparkles size={19} className="text-teal-300" aria-hidden="true" />
      <p className="text-sm leading-6 text-slate-200">{data ? t('researchMatchesProfileReady') : t('researchMatchesStarter')}</p>
      <a href={path('/portal/intake')} className="ml-auto inline-flex min-h-10 items-center gap-2 rounded-full bg-white px-4 text-sm font-semibold text-[#071724]">{t('researchMatchesViewIntake')}<ArrowRight size={15} /></a>
    </div>
    <LoadState loading={loading} error={error} onRetry={reload}>
      <div className="mt-6 grid gap-5 xl:grid-cols-2">
        {matches.map((match) => {
          const product = getLocalizedProduct(match.product, locale)
          const baseResearch = getProductResearchContent(product.slug)
          const research = baseResearch ? localizeProductResearchContent(product, baseResearch, locale) : null
          const fromPrice = Math.min(...product.variants.map((variant) => variant.price))
          const matchLabel = match.matchType === 'selected' ? t('researchMatchesSelected') : match.matchType === 'interest' ? t('researchMatchesInterest') : t('researchMatchesFeatured')
          return <article key={product.slug} className="group overflow-hidden rounded-[1.6rem] border border-slate-900/8 bg-white shadow-[0_18px_60px_rgba(7,23,36,.08)]">
            <div className="grid sm:grid-cols-[12rem_1fr]">
              <a href={path(`/products/${product.slug}`)} className="grid min-h-52 place-items-center overflow-hidden bg-[radial-gradient(circle_at_45%_25%,rgba(45,212,191,.22),transparent_38%),linear-gradient(145deg,#f7fbfa,#e8efed)] p-4">
                <ProductImage product={product} alt={t('researchMatchesProductAlt', { product: product.name })} width={420} height={420} className="h-48 w-full object-contain drop-shadow-[0_16px_25px_rgba(7,23,36,.15)] transition duration-500 group-hover:scale-[1.04]" />
              </a>
              <div className="flex flex-col p-5 sm:p-6">
                <div className="flex flex-wrap items-center gap-2"><Badge tone="info">{matchLabel}</Badge><span className="text-xs font-semibold text-slate-500">{localizedCategoryLabel(product.category, locale)}</span></div>
                <h2 className="mt-3 text-2xl font-semibold tracking-[-.035em] text-[#071724]">{product.name}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">{research?.primaryFocus ?? product.catalogTagline}</p>
                <div className="mt-4 grid gap-2 text-xs font-semibold text-slate-700 sm:grid-cols-2">
                  <span className="flex items-center gap-2"><FlaskConical size={15} className="text-teal-700" />{research?.evidenceProfile ?? t('researchMatchesEvidenceVaries')}</span>
                  <span className="flex items-center gap-2"><PackageCheck size={15} className="text-teal-700" />{product.purchaseRules.kitEligible ? t('researchMatchesKitIncluded') : t('researchMatchesFormatReview')}</span>
                  <span className="flex items-center gap-2"><BadgeCheck size={15} className="text-teal-700" />{t('researchMatchesDocs')}</span>
                </div>
                <div className="mt-auto flex flex-wrap items-end justify-between gap-4 pt-5"><div><p className="text-xs font-bold uppercase tracking-[.12em] text-slate-500">{t('researchMatchesFrom')}</p><p className="text-2xl font-semibold text-[#071724]">{new Intl.NumberFormat(locale === 'es' ? 'es-MX' : 'en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(fromPrice)}</p></div><a href={path(`/products/${product.slug}`)} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#071724] px-5 text-sm font-semibold text-white transition hover:bg-teal-700">{t('researchMatchesCta')}<ArrowRight size={15} /></a></div>
              </div>
            </div>
          </article>
        })}
      </div>
    </LoadState>
    <p className="mt-6 text-xs leading-5 text-slate-500">{t('researchMatchesDisclaimer')}</p>
  </>
}
