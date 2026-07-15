import {
  ArrowRight,
  BookOpen,
  Boxes,
  ClipboardCheck,
  FileText,
  FlaskConical,
  Layers3,
  Link2,
  PackageCheck,
  ShieldCheck,
  Snowflake,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { useLocale, useTranslation } from '../../i18n/LocaleContext'
import { CTA } from '../CTA'
import { Reveal } from '../Reveal'
import { SectionHeader } from '../SectionHeader'

type EditorialShellProps = {
  id?: string
  eyebrow: string
  title: string
  description?: string
  children: ReactNode
  tone?: 'light' | 'dark'
}

function EditorialShell({
  id,
  eyebrow,
  title,
  description = '',
  children,
  tone = 'light',
}: EditorialShellProps) {
  return (
    <section
      id={id}
      className={`px-5 py-10 sm:px-8 lg:py-14 ${tone === 'dark' ? 'bg-[#0d1018] text-white' : ''}`}
    >
      <div className="mx-auto max-w-[88rem]">
        <SectionHeader align="left" eyebrow={eyebrow} title={title} description={description} />
        <div className="mt-8">{children}</div>
      </div>
    </section>
  )
}

export type QuickFact = {
  label: string
  value: string
  note?: string
}

export function QuickFactsCard({
  eyebrow = 'Quick facts',
  title,
  facts,
}: {
  eyebrow?: string
  title: string
  facts: QuickFact[]
}) {
  return (
    <div className="rounded-[1.75rem] border border-teal-900/10 bg-[linear-gradient(135deg,#ffffff,#eefafa)] p-6 shadow-[0_22px_70px_rgba(20,184,166,0.1)] sm:p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-700">{eyebrow}</p>
      <h3 className="mt-4 text-2xl font-semibold tracking-[-0.04em] text-[#071724]">{title}</h3>
      <div className="mt-6 grid gap-3">
        {facts.map((fact) => (
          <div key={`${fact.label}-${fact.value}`} className="rounded-2xl border border-slate-900/10 bg-white/76 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{fact.label}</p>
            <p className="mt-2 text-lg font-semibold leading-6 tracking-[-0.025em] text-[#071724]">
              {fact.value}
            </p>
            {fact.note ? <p className="mt-2 text-xs leading-5 text-slate-500">{fact.note}</p> : null}
          </div>
        ))}
      </div>
    </div>
  )
}

export function ResearchOverviewSection({
  eyebrow = 'Overview',
  title,
  body,
  secondaryBody,
  facts,
  factTitle,
}: {
  eyebrow?: string
  title: string
  body: string
  secondaryBody?: string
  facts?: QuickFact[]
  factTitle?: string
}) {
  return (
    <EditorialShell eyebrow={eyebrow} title={title}>
      <div className={`grid gap-5 ${facts?.length ? 'lg:grid-cols-[1.15fr_0.85fr]' : ''}`}>
        <div className="rounded-[1.75rem] border border-slate-900/10 bg-white p-6 shadow-[0_22px_70px_rgba(7,23,36,0.07)] sm:p-8">
          <p className="max-w-4xl text-lg leading-8 text-slate-600">{body}</p>
          {secondaryBody ? <p className="mt-5 max-w-4xl text-base leading-7 text-slate-600">{secondaryBody}</p> : null}
        </div>
        {facts?.length ? <QuickFactsCard title={factTitle ?? 'Catalog snapshot'} facts={facts} /> : null}
      </div>
    </EditorialShell>
  )
}

export function MechanismOfActionSection({
  eyebrow = 'Mechanism of action',
  title,
  steps,
  description = 'Modeled as research stages for documentation, observation, and qualified review.',
}: {
  eyebrow?: string
  title: string
  steps: string[]
  description?: string
}) {
  return (
    <section className="relative overflow-hidden bg-[#0d1018] px-5 py-16 text-white sm:px-8 lg:py-24">
      <div className="molecule-field opacity-[0.08]" aria-hidden="true" />
      <div className="pointer-events-none absolute left-[6%] top-16 size-72 rounded-full bg-[#2ec4a5]/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-12 right-[8%] size-80 rounded-full bg-cyan-300/10 blur-3xl" />

      <div className="relative mx-auto max-w-[88rem]">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#2ec4a5]">{eyebrow}</p>
          <h2 className="mt-4 text-4xl font-semibold tracking-[-0.055em] sm:text-5xl lg:text-6xl">
            {title}
          </h2>
        </div>

        <div className="mt-10 grid gap-4 lg:grid-cols-4">
          {steps.map((step, index) => (
            <Reveal
              key={step}
              className="relative rounded-[1.5rem] border border-white/10 bg-white/[0.05] p-5 shadow-[0_22px_70px_rgba(0,0,0,0.22)] backdrop-blur-xl"
              delay={index * 0.06}
            >
              {index < steps.length - 1 ? (
                <ArrowRight
                  size={22}
                  aria-hidden="true"
                  className="absolute -right-5 top-1/2 hidden -translate-y-1/2 text-[#2ec4a5] lg:block"
                />
              ) : null}
              <span className="flex size-11 items-center justify-center rounded-full bg-[#2ec4a5] text-sm font-semibold text-[#0d1018]">
                {index + 1}
              </span>
              <h3 className="mt-5 text-xl font-semibold tracking-[-0.035em]">{step}</h3>
              <p className="mt-3 text-sm leading-6 text-white/58">{description}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

export type ProductComparisonRow = {
  product: string
  href?: string
  focus?: string
  format: string
  price?: string
  note: string
}

export function ProductComparisonTable({
  eyebrow = 'Comparison',
  title,
  description,
  rows,
  showFocus = false,
}: {
  eyebrow?: string
  title: string
  description?: string
  rows: ProductComparisonRow[]
  showFocus?: boolean
}) {
  const { path } = useLocale()
  const { t } = useTranslation('editorial')

  return (
    <EditorialShell eyebrow={eyebrow} title={title} description={description}>
      <div className="overflow-x-auto rounded-[1.75rem] border border-slate-900/10 bg-white shadow-[0_24px_72px_rgba(7,23,36,0.08)]">
        <table className="w-full min-w-[46rem] border-separate border-spacing-0 text-left text-sm">
          <thead>
            <tr className="text-xs uppercase tracking-[0.14em] text-slate-400">
              {['Product', ...(showFocus ? ['Research Focus'] : []), 'Format', 'Starting Price', 'Distinguishing Note'].map((heading) => (
                <th key={heading} className="border-b border-slate-900/10 px-5 py-3 font-semibold">
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.product} className="align-top">
                <td className="border-b border-slate-900/10 px-5 py-4 font-semibold text-[#071724]">
                  {row.href ? (
                    <a href={path(row.href)} className="hover:text-teal-700">
                      {row.product}
                    </a>
                  ) : (
                    row.product
                  )}
                </td>
                {showFocus ? <td className="border-b border-slate-900/10 px-5 py-4 text-slate-600">{row.focus}</td> : null}
                <td className="border-b border-slate-900/10 px-5 py-4 text-slate-600">{row.format}</td>
                <td className="border-b border-slate-900/10 px-5 py-4 text-slate-600">{row.price ?? t('byReview')}</td>
                <td className="border-b border-slate-900/10 px-5 py-4 text-slate-600">{row.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </EditorialShell>
  )
}

export type RelatedProductCard = {
  category: string
  name: string
  href: string
  description?: string
}

export function RelatedProductsSection({
  title,
  products,
}: {
  title?: string
  products: RelatedProductCard[]
}) {
  const { path } = useLocale()
  const { t } = useTranslation('editorial')
  if (!products.length) return null

  return (
    <EditorialShell eyebrow={t('relatedProductsEyebrow')} title={title ?? t('relatedProductsTitle')}>
      <div className="grid gap-4 md:grid-cols-3">
        {products.map((product) => (
          <a
            key={product.href}
            href={path(product.href)}
            className="group rounded-[1.5rem] border border-slate-900/10 bg-white p-5 shadow-[0_18px_48px_rgba(7,23,36,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(20,184,166,0.14)]"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">{product.category}</p>
            <h3 className="mt-3 text-xl font-semibold tracking-[-0.035em] text-[#071724]">{product.name}</h3>
            {product.description ? <p className="mt-3 text-sm leading-6 text-slate-600 line-clamp-3">{product.description}</p> : null}
            <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-teal-800">
              {t('viewProduct')}
              <ArrowRight size={15} aria-hidden="true" className="transition group-hover:translate-x-1" />
            </span>
          </a>
        ))}
      </div>
      <p className="mt-6 text-center text-sm font-medium text-slate-500">
        {t('stillComparing')}{' '}
        <a href={path('/intake')} className="font-semibold text-teal-700 transition hover:text-teal-800">
          {t('findMyMatch')}
        </a>
      </p>
    </EditorialShell>
  )
}

export type RelatedArticleCard = {
  label: string
  title: string
  href: string
  description?: string
}

export function RelatedArticlesSection({
  title,
  articles,
}: {
  title?: string
  articles: RelatedArticleCard[]
}) {
  const { path } = useLocale()
  const { t } = useTranslation('editorial')
  if (!articles.length) return null

  return (
    <EditorialShell
      eyebrow={t('fromResearchLibrary')}
      title={title ?? t('goDeeperTitle')}
      description={t('goDeeperDescription')}
    >
      <div className="grid gap-4 md:grid-cols-3">
        {articles.map((article, index) => (
          <a
            key={`${article.href}-${article.title}-${index}`}
            href={path(article.href)}
            className="group rounded-[1.5rem] border border-slate-900/10 bg-white p-5 shadow-[0_18px_48px_rgba(7,23,36,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(20,184,166,0.14)]"
          >
            <BookOpen size={18} aria-hidden="true" className="text-teal-700" />
            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">{article.label}</p>
            <h3 className="mt-3 text-lg font-semibold tracking-[-0.03em] text-[#071724]">{article.title}</h3>
            {article.description ? <p className="mt-2 text-sm leading-6 text-slate-600 line-clamp-3">{article.description}</p> : null}
            <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-teal-800">
              {t('readMore')}
              <ArrowRight size={14} aria-hidden="true" className="transition group-hover:translate-x-1" />
            </span>
          </a>
        ))}
      </div>
      <div className="mt-6">
        <a href={path('/research')} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-[#071724]">
          {t('visitResearchLibrary')}
          <ArrowRight size={16} aria-hidden="true" />
        </a>
      </div>
    </EditorialShell>
  )
}

export function ResearchUseOnlyBanner({
  title = 'Research-Use-Only Reminder',
  body,
}: {
  title?: string
  body: string
}) {
  return (
    <section className="px-5 py-6 sm:px-8">
      <div className="mx-auto max-w-[88rem] rounded-[1.75rem] border border-teal-900/10 bg-[#071724] p-6 text-white shadow-[0_26px_80px_rgba(7,23,36,0.16)] sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-teal-200">{title}</p>
        <p className="mt-4 max-w-5xl text-lg leading-8 text-slate-100">{body}</p>
      </div>
    </section>
  )
}

export type FAQAccordionItem = {
  question: string
  answer: string
}

export function FAQAccordion({
  eyebrow = 'FAQ',
  title,
  items,
  cta,
  secondaryCta,
}: {
  eyebrow?: string
  title: string
  items: FAQAccordionItem[]
  cta?: { label: string; href: string }
  secondaryCta?: { label: string; href: string }
}) {
  const { path } = useLocale()

  return (
    <EditorialShell id="faq" eyebrow={eyebrow} title={title}>
      <div className="grid gap-3">
        {items.map((item, index) => (
          <details
            key={`${item.question}-${index}`}
            className="group rounded-[1.25rem] border border-slate-900/10 bg-white p-5 shadow-[0_14px_34px_rgba(7,23,36,0.05)]"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-5 text-base font-semibold text-[#071724]">
              {item.question}
              <ArrowRight size={16} aria-hidden="true" className="shrink-0 text-teal-700 transition group-open:rotate-90" />
            </summary>
            <p className="mt-4 text-sm leading-6 text-slate-600">{item.answer}</p>
          </details>
        ))}
      </div>
      {cta || secondaryCta ? (
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
          {cta ? (
            <a
              href={path(cta.href)}
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-[#071724]"
            >
              {cta.label}
              <ArrowRight size={16} aria-hidden="true" />
            </a>
          ) : null}
          {secondaryCta ? (
            <a
              href={path(secondaryCta.href)}
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-[#071724]"
            >
              {secondaryCta.label}
              <ArrowRight size={16} aria-hidden="true" />
            </a>
          ) : null}
        </div>
      ) : null}
    </EditorialShell>
  )
}

export type EducationItem = {
  title: string
  description: string
}

export function CategoryEducationSection({
  eyebrow = 'Education',
  title,
  description,
  items,
}: {
  eyebrow?: string
  title: string
  description?: string
  items: EducationItem[]
}) {
  return (
    <EditorialShell eyebrow={eyebrow} title={title} description={description}>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item, index) => (
          <Reveal
            key={item.title}
            delay={index * 0.05}
            className="rounded-[1.5rem] border border-slate-900/10 bg-white p-5 shadow-[0_18px_48px_rgba(7,23,36,0.06)]"
          >
            <Layers3 size={20} aria-hidden="true" className="text-teal-700" />
            <h3 className="mt-4 text-lg font-semibold tracking-[-0.03em] text-[#071724]">{item.title}</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">{item.description}</p>
          </Reveal>
        ))}
      </div>
    </EditorialShell>
  )
}

export function TrustAndHandlingSection({
  title = 'Documentation-first standards, applied per product.',
  items,
  footnote,
}: {
  title?: string
  items: EducationItem[]
  footnote?: string
}) {
  const icons = [FlaskConical, ShieldCheck, FileText, Snowflake, PackageCheck, Boxes]

  return (
    <EditorialShell eyebrow="Trust & handling" title={title}>
      <div className="grid gap-4 md:grid-cols-2">
        {items.map((item, index) => {
          const Icon = icons[index] ?? ClipboardCheck

          return (
            <Reveal
              key={item.title}
              delay={index * 0.05}
              className="rounded-[1.5rem] border border-slate-900/10 bg-white p-5 shadow-[0_18px_48px_rgba(7,23,36,0.06)]"
            >
              <span className="flex size-11 items-center justify-center rounded-2xl bg-teal-50 text-teal-800">
                <Icon size={19} aria-hidden="true" />
              </span>
              <h3 className="mt-4 text-lg font-semibold tracking-[-0.03em] text-[#071724]">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
            </Reveal>
          )
        })}
      </div>
      {footnote ? <p className="mt-5 max-w-4xl text-xs leading-5 text-slate-500">{footnote}</p> : null}
    </EditorialShell>
  )
}

export function ProductDiscoveryCTA({
  title,
  body,
  primaryLabel = 'Find My Match',
  primaryHref = '/intake',
  secondaryLabel = 'Browse Research Library',
  secondaryHref = '/research',
  secondaryTarget,
  secondaryRel,
}: {
  title: string
  body: string
  primaryLabel?: string
  primaryHref?: string
  secondaryLabel?: string
  secondaryHref?: string
  secondaryTarget?: string
  secondaryRel?: string
}) {
  const { t: tBrand } = useTranslation('brand')

  return (
    <section className="px-5 py-12 sm:px-8 lg:py-16">
      <div className="mx-auto grid max-w-[88rem] gap-6 rounded-[2rem] border border-white/70 bg-[linear-gradient(135deg,#071724,#0d3144)] p-6 text-white shadow-[0_34px_110px_rgba(7,23,36,0.22)] sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-200">Research discovery</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">{title}</h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-200">{body}</p>
          <p className="mt-4 max-w-2xl text-xs leading-5 text-slate-300">
            {tBrand('researchUseLabel')}. {tBrand('educationalDisclaimer')}
          </p>
        </div>
        <div className="flex flex-wrap gap-3 lg:justify-end">
          <CTA href={primaryHref} tone="light">
            {primaryLabel}
          </CTA>
          <CTA
            href={secondaryHref}
            target={secondaryTarget}
            rel={secondaryRel}
            tone="ghost"
            className="border-white/20 bg-white/10 text-white hover:bg-white/15"
          >
            {secondaryLabel}
          </CTA>
        </div>
      </div>
    </section>
  )
}

export type InternalLink = {
  label: string
  title: string
  href: string
  description?: string
}

export function InternalLinkGrid({
  eyebrow = 'Internal links',
  title,
  links,
}: {
  eyebrow?: string
  title: string
  links: InternalLink[]
}) {
  const { path } = useLocale()
  const { t: tCommon } = useTranslation('common')
  if (!links.length) return null

  return (
    <EditorialShell eyebrow={eyebrow} title={title}>
      <div className="grid gap-4 md:grid-cols-3">
        {links.map((link) => (
          <a
            key={link.href}
            href={path(link.href)}
            className="group rounded-[1.5rem] border border-slate-900/10 bg-white p-5 shadow-[0_18px_48px_rgba(7,23,36,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(20,184,166,0.14)]"
          >
            <Link2 size={18} aria-hidden="true" className="text-teal-700" />
            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">{link.label}</p>
            <h3 className="mt-3 text-xl font-semibold tracking-[-0.035em] text-[#071724]">{link.title}</h3>
            {link.description ? <p className="mt-3 text-sm leading-6 text-slate-600">{link.description}</p> : null}
            <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-teal-800">
              {tCommon('explore')}
              <ArrowRight size={15} aria-hidden="true" className="transition group-hover:translate-x-1" />
            </span>
          </a>
        ))}
      </div>
    </EditorialShell>
  )
}
