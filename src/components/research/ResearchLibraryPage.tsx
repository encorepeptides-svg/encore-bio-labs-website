import { ArrowRight, BookOpen, GitCompare, GraduationCap, Waypoints } from 'lucide-react'
import { products, researchAreas } from '../../data/products'
import { localizeResearchArea } from '../../data/categoryTranslations'
import {
  researchArticles,
  type ResearchContentType,
} from '../../data/research'
import {
  getLocalizedGlossaryTerms,
  getLocalizedResearchArticle,
  localizedContentTypeLabel,
} from '../../data/researchTranslations'
import { CTA } from '../CTA'
import { Reveal } from '../Reveal'
import { SectionHeader } from '../SectionHeader'
import { useLocale, useTranslation } from '../../i18n/LocaleContext'

const contentTypeIcons: Record<ResearchContentType, typeof BookOpen> = {
  'deep-dive': BookOpen,
  mechanism: Waypoints,
  comparison: GitCompare,
  beginner: GraduationCap,
}

const contentTypeOrder: ResearchContentType[] = ['beginner', 'deep-dive', 'mechanism', 'comparison']

function ArticleCard({ article }: { article: (typeof researchArticles)[number] }) {
  const { path, locale } = useLocale()
  const { t } = useTranslation('researchLibrary')
  const Icon = contentTypeIcons[article.contentType]
  const productSlug = article.href.match(/^\/products\/([^/]+)/)?.[1]
  const productName = products.find((product) => product.slug === productSlug)?.name
  const area = researchAreas.find((entry) => entry.slug === article.categorySlug)
  const categoryName = area ? localizeResearchArea(area, locale).name : undefined
  const displayArticle = getLocalizedResearchArticle(article, locale, { productName, categoryName })

  return (
    <a
      href={path(article.href)}
      className="group flex h-full flex-col rounded-[1.5rem] border border-slate-900/10 bg-white p-5 shadow-[0_18px_48px_rgba(7,23,36,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(20,184,166,0.14)]"
    >
      <span className="flex size-10 items-center justify-center rounded-2xl bg-teal-50 text-teal-800">
        <Icon size={17} aria-hidden="true" />
      </span>
      <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-teal-700">
        {localizedContentTypeLabel(article.contentType, locale)}
      </p>
      <h3 className="mt-2 text-lg font-semibold tracking-[-0.02em] text-[#071724]">
        {displayArticle.title}
      </h3>
      <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">{displayArticle.description}</p>
      <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-teal-800">
        {t('explore')}
        <ArrowRight size={14} aria-hidden="true" className="transition group-hover:translate-x-1" />
      </span>
    </a>
  )
}

export function ResearchLibraryPage() {
  const { path, locale } = useLocale()
  const { t } = useTranslation('researchLibrary')
  const { t: tBrand } = useTranslation('brand')
  const beginnerShelf = researchArticles.filter((article) => article.contentType === 'beginner').slice(0, 4)
  const localizedGlossaryTerms = getLocalizedGlossaryTerms(locale)

  return (
    <main id="main-content" className="bg-[#F8FAFC]">
      <div className="px-5 pt-6 sm:px-8">
        <div className="mx-auto flex max-w-[88rem] items-center gap-2 text-sm text-slate-500">
          <a href={path('/')} className="font-medium transition hover:text-[#071724]">
            {t('home')}
          </a>
          <span aria-hidden="true">/</span>
          <span className="font-semibold text-[#071724]">{t('library')}</span>
        </div>
      </div>

      <section className="px-5 pb-10 pt-8 sm:px-8 lg:pb-14">
        <div className="mx-auto max-w-[88rem]">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-700">
            {t('eyebrow')}
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-[-0.05em] text-[#071724] sm:text-5xl">
            {t('title')}
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
            {t('body')}
          </p>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
            {tBrand('researchLibraryDisclaimer')}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <CTA href="#start-here" className="bg-[#071724] hover:bg-[#102a3d]">
              {t('startBasics')}
            </CTA>
            <CTA href="#by-category" tone="ghost">
              {t('browseCategory')}
            </CTA>
          </div>
        </div>
      </section>

      <section className="px-5 py-8 sm:px-8 lg:py-10">
        <div className="mx-auto max-w-[88rem]">
          <SectionHeader
            align="left"
            eyebrow={t('browseType')}
            title={t('fourWays')}
            description={t('typeBody')}
          />
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {contentTypeOrder.map((type) => {
              const Icon = contentTypeIcons[type]
              const count = researchArticles.filter((article) => article.contentType === type).length

              return (
                <a
                  key={type}
                  href={`#${type}`}
                  className="group rounded-[1.5rem] border border-slate-900/10 bg-white p-5 shadow-[0_18px_48px_rgba(7,23,36,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(20,184,166,0.14)]"
                >
                  <span className="flex size-11 items-center justify-center rounded-2xl bg-teal-50 text-teal-800">
                    <Icon size={19} aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 text-lg font-semibold tracking-[-0.02em] text-[#071724]">
                    {localizedContentTypeLabel(type, locale)}
                  </h3>
                  <p className="mt-2 text-sm text-slate-500">{t('topics', { count })}</p>
                </a>
              )
            })}
          </div>
        </div>
      </section>

      <section id="by-category" className="px-5 py-8 sm:px-8 lg:py-10">
        <div className="mx-auto max-w-[88rem]">
          <SectionHeader
            align="left"
            eyebrow={t('browseResearchCategory')}
            title={t('startArea')}
            description={t('categoryBody')}
          />
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {researchAreas.map((area) => {
              const relatedCount = researchArticles.filter((article) => article.categorySlug === area.slug).length

              return (
                <a
                  key={area.slug}
                  href={path(`/categories/${area.slug}`)}
                  className="group rounded-[1.5rem] border border-slate-900/10 bg-white p-5 shadow-[0_18px_48px_rgba(7,23,36,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(20,184,166,0.14)]"
                >
                  <span
                    className="mb-4 h-1.5 w-10 rounded-full"
                    style={{ backgroundColor: area.accent }}
                    aria-hidden="true"
                  />
                  <h3 className="text-lg font-semibold tracking-[-0.02em] text-[#071724]">{localizeResearchArea(area, locale).name}</h3>
                  <p className="mt-2 text-sm text-slate-500">{t('relatedTopics', { count: relatedCount })}</p>
                  <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-teal-800">
                    {t('viewCategory')}
                    <ArrowRight size={14} aria-hidden="true" className="transition group-hover:translate-x-1" />
                  </span>
                </a>
              )
            })}
          </div>
        </div>
      </section>

      <section id="start-here" className="px-5 py-8 sm:px-8 lg:py-10">
        <div className="mx-auto max-w-[88rem]">
          <SectionHeader
            align="left"
            eyebrow={t('startHere')}
            title={t('newToResearch')}
            description={t('shelfBody')}
          />
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {beginnerShelf.map((article) => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </div>
        </div>
      </section>

      {contentTypeOrder.map((type) => (
        <section key={type} id={type} className="px-5 py-8 sm:px-8 lg:py-10">
          <div className="mx-auto max-w-[88rem]">
            <SectionHeader
              align="left"
              eyebrow={localizedContentTypeLabel(type, locale)}
              title={
                type === 'beginner'
                  ? t('allBeginner')
                  : type === 'deep-dive'
                    ? t('allDeep')
                    : type === 'mechanism'
                      ? t('allMechanism')
                      : t('allComparison')
              }
              description=""
            />
            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {researchArticles
                .filter((article) => article.contentType === type)
                .map((article, index) => (
                  <Reveal key={article.slug} as="div" delay={index * 0.04}>
                    <ArticleCard article={article} />
                  </Reveal>
                ))}
            </div>
          </div>
        </section>
      ))}

      <section id="glossary" className="px-5 py-8 sm:px-8 lg:py-10">
        <div className="mx-auto max-w-[88rem]">
          <SectionHeader
            align="left"
            eyebrow={t('glossary')}
            title={t('terms')}
            description={t('glossaryBody')}
          />
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {localizedGlossaryTerms.map((entry) => (
              <div
                key={entry.term}
                id={entry.term.toLowerCase().replace(/[^a-z0-9]+/g, '-')}
                className="rounded-[1.25rem] border border-slate-900/10 bg-white p-5 shadow-[0_14px_34px_rgba(7,23,36,0.05)]"
              >
                <h3 className="text-base font-semibold text-[#071724]">{entry.term}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{entry.definition}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-6 sm:px-8">
        <div className="mx-auto max-w-[88rem] rounded-[1.75rem] border border-teal-900/10 bg-[#071724] p-6 text-white shadow-[0_26px_80px_rgba(7,23,36,0.16)] sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-teal-200">
            {t('reminder')}
          </p>
          <p className="mt-4 max-w-4xl text-lg leading-8 text-slate-100">
            {t('reminderBody')}
          </p>
        </div>
      </section>

      <section className="px-5 py-12 sm:px-8 lg:py-16">
        <div className="mx-auto max-w-[88rem] rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,#071724,#0d3144)] px-6 py-14 text-center text-white shadow-[0_34px_110px_rgba(7,23,36,0.22)] sm:px-10 sm:py-16">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-teal-200">
            {t('keepExploring')}
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">
            {t('ready')}
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-slate-300">
            {t('readyBody')}
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <CTA href={path('/#products')} tone="light">
              {t('browseCategories')}
            </CTA>
            <CTA href={path('/intake')} tone="ghost" className="border-white/20 bg-white/10 text-white hover:bg-white/15">
              {t('findMatch')}
            </CTA>
          </div>
        </div>
      </section>
    </main>
  )
}
