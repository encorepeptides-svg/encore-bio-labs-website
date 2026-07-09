import { ArrowRight, BookOpen, GitCompare, GraduationCap, Waypoints } from 'lucide-react'
import { brandText } from '../../../config/brandText'
import { researchAreas } from '../../data/products'
import {
  contentTypeLabels,
  glossaryTerms,
  researchArticles,
  type ResearchContentType,
} from '../../data/research'
import { CTA } from '../CTA'
import { Reveal } from '../Reveal'
import { SectionHeader } from '../SectionHeader'

const contentTypeIcons: Record<ResearchContentType, typeof BookOpen> = {
  'deep-dive': BookOpen,
  mechanism: Waypoints,
  comparison: GitCompare,
  beginner: GraduationCap,
}

const contentTypeOrder: ResearchContentType[] = ['beginner', 'deep-dive', 'mechanism', 'comparison']

function ArticleCard({ article }: { article: (typeof researchArticles)[number] }) {
  const Icon = contentTypeIcons[article.contentType]

  return (
    <a
      href={article.href}
      className="group flex h-full flex-col rounded-[1.5rem] border border-slate-900/10 bg-white p-5 shadow-[0_18px_48px_rgba(7,23,36,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(20,184,166,0.14)]"
    >
      <span className="flex size-10 items-center justify-center rounded-2xl bg-teal-50 text-teal-800">
        <Icon size={17} aria-hidden="true" />
      </span>
      <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-teal-700">
        {contentTypeLabels[article.contentType]}
      </p>
      <h3 className="mt-2 text-lg font-semibold tracking-[-0.02em] text-[#071724]">
        {article.title}
      </h3>
      <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">{article.description}</p>
      <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-teal-800">
        Explore
        <ArrowRight size={14} aria-hidden="true" className="transition group-hover:translate-x-1" />
      </span>
    </a>
  )
}

export function ResearchLibraryPage() {
  const beginnerShelf = researchArticles.filter((article) => article.contentType === 'beginner').slice(0, 4)

  return (
    <main id="main-content" className="bg-[#F8FAFC]">
      <div className="px-5 pt-6 sm:px-8">
        <div className="mx-auto flex max-w-[88rem] items-center gap-2 text-sm text-slate-500">
          <a href="/" className="font-medium transition hover:text-[#071724]">
            Home
          </a>
          <span aria-hidden="true">/</span>
          <span className="font-semibold text-[#071724]">Research Library</span>
        </div>
      </div>

      <section className="px-5 pb-10 pt-8 sm:px-8 lg:pb-14">
        <div className="mx-auto max-w-[88rem]">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-700">
            Research Library
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-[-0.05em] text-[#071724] sm:text-5xl">
            The science behind the catalog.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
            Plain-language explainers, comparisons, and reference material on the research areas
            Encore Bio Labs covers — written to help you ask better questions, not to replace the
            primary literature.
          </p>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
            {brandText.researchLibraryDisclaimer}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <CTA href="#start-here" className="bg-[#071724] hover:bg-[#102a3d]">
              Start With the Basics
            </CTA>
            <CTA href="#by-category" tone="ghost">
              Browse by Category
            </CTA>
          </div>
        </div>
      </section>

      <section className="px-5 py-8 sm:px-8 lg:py-10">
        <div className="mx-auto max-w-[88rem]">
          <SectionHeader
            align="left"
            eyebrow="Browse by Content Type"
            title="Four ways to learn"
            description="Every article in the library is one of these four types — pick the depth that fits what you're looking for."
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
                    {contentTypeLabels[type]}
                  </h3>
                  <p className="mt-2 text-sm text-slate-500">{count} topics</p>
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
            eyebrow="Browse by Research Category"
            title="Start from a research area"
            description="Each category page explains the shared biology before pointing you to individual products."
          />
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {researchAreas.map((area) => {
              const relatedCount = researchArticles.filter((article) => article.categorySlug === area.slug).length

              return (
                <a
                  key={area.slug}
                  href={`/categories/${area.slug}`}
                  className="group rounded-[1.5rem] border border-slate-900/10 bg-white p-5 shadow-[0_18px_48px_rgba(7,23,36,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(20,184,166,0.14)]"
                >
                  <span
                    className="mb-4 h-1.5 w-10 rounded-full"
                    style={{ backgroundColor: area.accent }}
                    aria-hidden="true"
                  />
                  <h3 className="text-lg font-semibold tracking-[-0.02em] text-[#071724]">{area.name}</h3>
                  <p className="mt-2 text-sm text-slate-500">{relatedCount} related topics</p>
                  <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-teal-800">
                    View category
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
            eyebrow="Start Here"
            title="New to research-use compounds?"
            description="A short shelf of foundational topics before you go deeper into any one category."
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
              eyebrow={contentTypeLabels[type]}
              title={
                type === 'beginner'
                  ? 'All beginner education topics'
                  : type === 'deep-dive'
                    ? 'All compound deep dives'
                    : type === 'mechanism'
                      ? 'All mechanism explainers'
                      : 'All comparison guides'
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
            eyebrow="Glossary"
            title="Reference terms"
            description="Short definitions for vocabulary used throughout the catalog and this library."
          />
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {glossaryTerms.map((entry) => (
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
            Research-Use-Only Reminder
          </p>
          <p className="mt-4 max-w-4xl text-lg leading-8 text-slate-100">
            This library is educational content only. It does not diagnose, treat, cure, or
            prevent any condition, and it is not a substitute for reading the primary research
            literature or consulting a qualified professional.
          </p>
        </div>
      </section>

      <section className="px-5 py-12 sm:px-8 lg:py-16">
        <div className="mx-auto max-w-[88rem] rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,#071724,#0d3144)] px-6 py-14 text-center text-white shadow-[0_34px_110px_rgba(7,23,36,0.22)] sm:px-10 sm:py-16">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-teal-200">
            Keep Exploring
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">
            Ready to look at the catalog itself?
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-slate-300">
            Every article here links back to a real product or category page — start with whichever
            research area is closest to your question.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <CTA href="/#products" tone="light">
              Browse Categories
            </CTA>
            <CTA href="/intake" tone="ghost" className="border-white/20 bg-white/10 text-white hover:bg-white/15">
              Start Your Research Profile
            </CTA>
          </div>
        </div>
      </section>
    </main>
  )
}
