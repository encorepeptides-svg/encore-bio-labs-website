import { ArrowRight, Layers3 } from 'lucide-react'
import { useState } from 'react'
import {
  getLocalizedProtocol,
  getProtocolCategoryName,
  getProtocolsByCategory,
  protocolCategorySlugs,
  protocols,
  resolveProtocolComponents,
  type ProtocolCategorySlug,
  type ProtocolConfig,
} from '../../data/protocols'
import { getLocalizedProduct } from '../../data/productTranslations'
import { useLocale, useTranslation } from '../../i18n/LocaleContext'
import { formatCartCurrency } from '../../lib/cart'
import { ProtocolBundleVisual } from './ProtocolBundleVisual'

type CategoryFilter = 'all' | ProtocolCategorySlug

export function ProtocolsHubPage() {
  const { locale } = useLocale()
  const { t } = useTranslation('protocols')
  const [filter, setFilter] = useState<CategoryFilter>('all')
  const featured = protocols[0]
  const visibleCategories = filter === 'all' ? protocolCategorySlugs : [filter]

  return (
    <main id="main-content" className="bg-[#f8fafc]">
      <section className="relative isolate overflow-hidden bg-[#071724] px-5 pb-14 pt-10 text-white sm:px-8 lg:pb-20 lg:pt-16">
        <div className="molecule-field -z-20 opacity-[0.16]" aria-hidden="true" />
        <div className="absolute -right-40 -top-40 -z-10 size-[34rem] rounded-full bg-teal-300/15 blur-3xl" aria-hidden="true" />
        <div className="mx-auto grid max-w-[88rem] items-center gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-14">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-teal-100/15 bg-white/[0.06] px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-teal-200"><Layers3 size={15} aria-hidden="true" />{t('eyebrow')}</p>
            <h1 className="mt-6 max-w-3xl text-[clamp(2.9rem,6vw,5.8rem)] font-semibold leading-[0.92] tracking-[-0.065em]">{t('heroTitle')}</h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">{t('heroIntro')}</p>
            <p className="mt-7 border-l-2 border-teal-300/70 pl-4 text-sm font-semibold leading-6 text-teal-100">{t('heroNote')}</p>
          </div>
          <ProtocolBundleVisual protocol={featured} alt={t('visualAlt', { protocol: getLocalizedProtocol(featured, locale).title, count: featured.components.length })} priority className="border border-white/15 shadow-[0_44px_120px_rgba(0,0,0,.38)]" />
        </div>
      </section>

      <nav aria-label={t('categoryNavigation')} className="sticky top-[5.4rem] z-30 border-y border-slate-900/10 bg-[#f8fafc]/92 px-5 py-3 shadow-[0_12px_28px_rgba(7,23,36,.06)] backdrop-blur-xl sm:px-8">
        <div className="mx-auto flex max-w-[88rem] gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
          <FilterButton active={filter === 'all'} onClick={() => setFilter('all')}>{t('allCategories')} <span>{protocols.length}</span></FilterButton>
          {protocolCategorySlugs.map((categorySlug) => (
            <FilterButton key={categorySlug} active={filter === categorySlug} onClick={() => setFilter(categorySlug)}>
              {getProtocolCategoryName(categorySlug, locale)} <span>{getProtocolsByCategory(categorySlug).length}</span>
            </FilterButton>
          ))}
        </div>
      </nav>

      <div className="px-5 py-14 sm:px-8 lg:py-20">
        <div className="mx-auto max-w-[88rem] space-y-20">
          {visibleCategories.map((categorySlug) => {
            const categoryProtocols = getProtocolsByCategory(categorySlug)
            return (
              <section key={categorySlug} id={`protocol-category-${categorySlug}`} className="scroll-mt-40">
                <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-900/10 pb-5">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-700">{getProtocolCategoryName(categorySlug, locale)}</p>
                    <h2 className="mt-3 text-3xl font-semibold tracking-[-0.045em] text-[#071724] sm:text-4xl">{getProtocolCategoryName(categorySlug, locale)}</h2>
                  </div>
                  <span className="rounded-full border border-slate-900/10 bg-white px-4 py-2 text-sm font-semibold text-slate-600">{t('protocolCount', { count: categoryProtocols.length })}</span>
                </div>
                <div className="mt-7 grid gap-6 lg:grid-cols-2">
                  {categoryProtocols.map((protocol) => <ProtocolCard key={protocol.slug} protocol={protocol} />)}
                </div>
              </section>
            )
          })}
        </div>
      </div>
    </main>
  )
}

function FilterButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return <button type="button" aria-pressed={active} onClick={onClick} className={`inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition ${active ? 'border-[#071724] bg-[#071724] text-white' : 'border-slate-900/10 bg-white text-slate-600 hover:border-teal-700/30 hover:text-[#071724]'}`}>{children}</button>
}

function ProtocolCard({ protocol }: { protocol: ProtocolConfig }) {
  const { locale, path } = useLocale()
  const { t } = useTranslation('protocols')
  const localized = getLocalizedProtocol(protocol, locale)
  const components = resolveProtocolComponents(protocol).map((entry) => ({ ...entry, product: getLocalizedProduct(entry.product, locale) }))
  const subtotal = components.reduce((sum, component) => sum + component.defaultVariant.price * component.config.quantity, 0)

  return (
    <article className="group overflow-hidden rounded-[2rem] border border-slate-900/10 bg-white shadow-[0_24px_70px_rgba(7,23,36,.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_34px_90px_rgba(7,23,36,.13)]">
      <ProtocolBundleVisual protocol={protocol} alt={t('visualAlt', { protocol: localized.title, count: components.length })} compact />
      <div className="p-6 sm:p-7">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-700">{localized.tagline}</p>
        <h3 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-[#071724] sm:text-3xl">{localized.title}</h3>
        <p className="mt-4 text-sm leading-6 text-slate-600">{localized.description}</p>
        <div className="mt-6 rounded-[1.25rem] bg-[#f4f7f6] p-4">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">{t('included')}</p>
          <ul className="mt-3 grid gap-2">
            {components.map(({ config, product, defaultVariant }) => <li key={product.slug} className="flex items-start justify-between gap-4 text-sm"><span className="font-semibold text-[#071724]">{product.name}</span><span className="text-right text-slate-500">{defaultVariant.label} · {t('quantity', { count: config.quantity })}</span></li>)}
          </ul>
        </div>
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <div><p className="text-xs font-semibold text-slate-500">{t('currentSubtotal')}</p><p className="mt-1 text-2xl font-semibold tracking-[-0.04em] text-[#071724]">{formatCartCurrency(subtotal)}</p></div>
          <a href={path(`/protocols/${protocol.slug}`)} className="inline-flex min-h-12 items-center gap-2 rounded-full bg-[#071724] px-6 text-sm font-bold text-white transition hover:bg-teal-800">{t('viewProtocol')}<ArrowRight size={16} aria-hidden="true" /></a>
        </div>
      </div>
    </article>
  )
}
