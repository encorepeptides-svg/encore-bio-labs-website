import { ArrowRight, Check, CheckCircle2, FileText, LayoutGrid, MapPin, ShieldCheck, Truck, UserCheck, XCircle } from 'lucide-react'
import { researchAreas } from '../data/products'
import { CTA } from './CTA'
import { Reveal } from './Reveal'
import { InternalLinkGrid } from './content/EditorialModules'

const whatThisMeans = [
  'Sold for laboratory research use only',
  'Not intended for human or animal consumption',
  'Not a supplement, drug, or cosmetic product',
]

const whatThisDoesnt = [
  'This is not medical advice, dosing guidance, use instructions, or a treatment recommendation',
  'Nothing here suggests what a compound will do for you personally',
  'It does not replace a conversation with a licensed healthcare provider',
]

const standards = [
  {
    icon: FileText,
    title: 'Documentation on request',
    body: 'Identity, purity, storage, and batch documentation can be requested through the intake process where available.',
  },
  {
    icon: LayoutGrid,
    title: 'Categories built around research questions',
    body: 'The catalog is organized by research area so researchers can compare adjacent pathways without duplicate product cards.',
  },
  {
    icon: UserCheck,
    title: 'A person reviews every inquiry',
    body: 'Research intake submissions are reviewed before follow-up, so product discovery stays contextual and compliance-aware.',
  },
]

const beliefs = [
  'Documentation should be something you can ask for — not something you\'re told exists somewhere. If identity, purity, or batch documentation is available, it should be one request away, not a marketing claim.',
  'Categories should reflect real biology, not search-engine keywords. If a compound doesn\'t fit cleanly into one research area, we say so, rather than forcing it into a category for SEO reasons.',
  '"Research use only" is a real boundary, not a loophole. We\'d rather lose a sale than blur that line.',
  'You shouldn\'t need to already be an expert to find the right part of the catalog. Plain language and clear organization aren\'t the same as dumbing anything down.',
  'A person should read every inquiry. Not eventually. Before anything ships.',
]

export function AboutPage() {
  return (
    <main id="main-content" className="bg-[#F8FAFC]">
      <div className="px-5 pt-6 sm:px-8">
        <div className="mx-auto flex max-w-[88rem] items-center gap-2 text-sm text-slate-500">
          <a href="/" className="font-medium transition hover:text-[#071724]">
            Home
          </a>
          <span aria-hidden="true">/</span>
          <span className="font-semibold text-[#071724]">About</span>
        </div>
      </div>

      {/* 1. Hero */}
      <section className="px-5 pb-12 pt-8 sm:px-8 lg:pb-16">
        <div className="mx-auto grid max-w-[88rem] gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-700">
              About Encore Bio Labs
            </p>
            <h1 className="mt-4 max-w-4xl text-4xl font-semibold leading-[1.02] tracking-[-0.05em] text-[#071724] sm:text-5xl lg:text-6xl">
              We built the catalog we wished we could find.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              Encore Bio Labs is a research-use-only catalog for peptides and compounds spanning
              metabolic, recovery, longevity, cognitive, and hormonal research — built because the
              alternative was usually either a sterile spreadsheet of a site or a hype-driven
              storefront, and neither one respected the person actually doing the research.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <CTA href="/#products">Browse Research Categories</CTA>
              <CTA href="#research-use-only" tone="ghost">
                Read RUO Explanation
              </CTA>
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-900/10 bg-white p-6 shadow-[0_28px_90px_rgba(7,23,36,0.1)] sm:p-8">
            <ShieldCheck size={26} aria-hidden="true" className="text-teal-700" />
            <h2 className="mt-5 text-3xl font-semibold tracking-[-0.04em] text-[#071724]">
              Compliance is part of the product experience.
            </h2>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              Products and educational content are for laboratory research use only. Encore Bio
              Labs does not provide medical advice, treatment recommendations, dosing protocols, or
              outcome promises.
            </p>
            <div className="mt-6 grid gap-3">
              <a href="/legal/terms" className="inline-flex items-center gap-2 text-sm font-semibold text-teal-800">
                Review Terms of Service <ArrowRight size={15} aria-hidden="true" />
              </a>
              <a href="/faq#safety-compliance" className="inline-flex items-center gap-2 text-sm font-semibold text-teal-800">
                Read safety and compliance FAQs <ArrowRight size={15} aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Why Encore Exists */}
      <section className="px-5 py-10 sm:px-8 lg:py-14">
        <Reveal className="mx-auto max-w-[88rem]">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-700">
              Why Encore Exists
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em] text-[#071724] sm:text-4xl">
              Because "trust me" isn't documentation.
            </h2>
            <p className="mt-5 text-base leading-7 text-slate-600">
              Most research-use catalogs ask you to take a lot on faith — that the categories mean
              something, that the compound is what the label says, that someone will actually
              answer if you have a question before you order. We didn't think that should be the
              default. Encore Bio Labs exists to put the actual research context on the page instead
              of a sales pitch, to organize the catalog around real biology instead of
              search-engine keywords, and to make sure a real person reads every inquiry instead of
              routing it into a form that goes nowhere. None of that is complicated. It's just easy
              to skip, and we didn't want to skip it.
            </p>
          </div>
        </Reveal>
      </section>

      {/* 3. What We Believe */}
      <section className="px-5 py-10 sm:px-8 lg:py-14">
        <div className="mx-auto max-w-[88rem]">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-700">
              What We Believe
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em] text-[#071724] sm:text-4xl">
              A few things we don't compromise on.
            </h2>
          </div>
          <div className="mt-8 grid gap-3">
            {beliefs.map((belief, index) => (
              <Reveal
                as="div"
                key={belief}
                delay={index * 0.05}
                className="flex items-start gap-4 rounded-[1.5rem] border border-slate-900/10 bg-white p-5 shadow-[0_18px_48px_rgba(7,23,36,0.06)]"
              >
                <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-800">
                  <Check size={16} aria-hidden="true" />
                </span>
                <p className="text-sm leading-6 text-slate-600">{belief}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 4. How the Catalog Is Organized */}
      <section className="px-5 py-10 sm:px-8 lg:py-14">
        <div className="mx-auto max-w-[88rem]">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-700">
              How the Catalog Is Organized
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em] text-[#071724] sm:text-4xl">
              Five research areas. No duplicate product cards.
            </h2>
            <p className="mt-5 text-base leading-7 text-slate-600">
              Every product on Encore Bio Labs sits inside one of five research categories:
              Metabolic & Weight Management, Recovery & Regeneration, Longevity & Cellular Health,
              Cognitive & Performance, and Hormone & Wellness. Where a product comes in multiple
              strengths or formats, those live inside one product page as variants — not as
              separate, duplicated catalog entries. Each category page explains the shared biology
              behind the products in it before you ever get to a "buy" decision, and every product
              page includes format options, research context, and documentation availability in one
              place.
            </p>
          </div>
        </div>

        <InternalLinkGrid
          eyebrow="Explore the Catalog"
          title="Start with the research area closest to your question"
          links={researchAreas.map((area) => ({
            label: 'Research Category',
            title: area.name,
            href: `/categories/${area.slug}`,
            description: area.description,
          }))}
        />
      </section>

      {/* 5. Quality and Documentation Philosophy */}
      <section className="px-5 py-10 sm:px-8 lg:py-14">
        <div className="mx-auto max-w-[88rem]">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-700">
              Quality & Documentation
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em] text-[#071724] sm:text-4xl">
              We'd rather tell you what's available than dress up the page.
            </h2>
            <p className="mt-5 text-base leading-7 text-slate-600">
              Identity and purity documentation, storage guidance, and batch-level records can be
              requested through the intake process, product by product. We don't publish purity
              percentages or testing statistics on product pages — if a number isn't something we
              can actually stand behind for that specific batch, it doesn't belong on the page.
              That's a deliberate choice, not a gap we haven't gotten to yet: a real "documentation
              available on request" is worth more than an impressive-looking number nobody can
              verify.
            </p>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {standards.map((standard) => (
              <article
                key={standard.title}
                className="rounded-[1.5rem] border border-slate-900/10 bg-white p-5 shadow-[0_18px_48px_rgba(7,23,36,0.06)]"
              >
                <span className="flex size-11 items-center justify-center rounded-2xl bg-teal-50 text-teal-800">
                  <standard.icon size={19} aria-hidden="true" />
                </span>
                <h3 className="mt-4 text-lg font-semibold tracking-[-0.03em] text-[#071724]">{standard.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{standard.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Research-Use-Only Positioning */}
      <section id="research-use-only" className="px-5 py-10 sm:px-8 lg:py-14">
        <Reveal className="mx-auto max-w-[88rem]">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-700">
              Research Use Only
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em] text-[#071724] sm:text-4xl">
              What this page won't do.
            </h2>
            <p className="mt-5 text-base leading-7 text-slate-600">
              This site will not give you medical advice, tell you what a compound will do for you
              personally, recommend a dosing protocol, or suggest that any product treats, cures,
              or prevents anything. That's true on every page, not just this one. If you're a
              qualified researcher or institution evaluating these compounds for a real research
              question, that's exactly who this catalog is built for. If you're looking for medical
              guidance, the right next step is a licensed healthcare provider — not a more careful
              reading of this page.
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-[1.5rem] border border-slate-900/10 bg-white p-6 shadow-[0_18px_48px_rgba(7,23,36,0.06)]">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">What this means</p>
              <div className="mt-4 grid gap-3">
                {whatThisMeans.map((item) => (
                  <div key={item} className="flex items-start gap-3 text-sm leading-6 text-slate-600">
                    <CheckCircle2 size={17} aria-hidden="true" className="mt-0.5 shrink-0 text-teal-700" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-slate-900/10 bg-white p-6 shadow-[0_18px_48px_rgba(7,23,36,0.06)]">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">What this doesn't mean</p>
              <div className="mt-4 grid gap-3">
                {whatThisDoesnt.map((item) => (
                  <div key={item} className="flex items-start gap-3 text-sm leading-6 text-slate-600">
                    <XCircle size={17} aria-hidden="true" className="mt-0.5 shrink-0 text-slate-400" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <a
              href="/legal/terms"
              className="inline-flex items-center gap-2 text-sm font-semibold text-teal-800 transition hover:gap-3 sm:col-span-2"
            >
              Read the full Terms of Service
              <ArrowRight size={16} aria-hidden="true" />
            </a>
          </div>
        </Reveal>
      </section>

      {/* 7. Local El Paso Support and Nationwide Shipping */}
      <section className="px-5 py-10 sm:px-8 lg:py-14">
        <div className="mx-auto max-w-[88rem]">
          <div className="grid gap-8 lg:grid-cols-[1fr_0.85fr] lg:items-center">
            <Reveal>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-700">
                Delivery & Shipping
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em] text-[#071724] sm:text-4xl">
                A real place, not just a website.
              </h2>
              <p className="mt-5 text-base leading-7 text-slate-600">
                Encore Bio Labs offers same-day local courier delivery in the El Paso area, alongside
                nationwide U.S. shipping for research catalog fulfillment. Mexico shipping is also
                available, at a flat $20 USD addition to standard shipping. We mention this on the
                About page on purpose: a catalog with a real, locatable delivery footprint is a
                different thing than a site that could be anywhere, run by anyone, shipping from
                nowhere in particular.
              </p>
              <a
                href="/faq#shipping"
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-teal-800 transition hover:gap-3"
              >
                See shipping and delivery FAQs
                <ArrowRight size={16} aria-hidden="true" />
              </a>
            </Reveal>

            <Reveal delay={0.08} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <div className="rounded-[1.5rem] border border-slate-900/10 bg-white p-5 shadow-[0_18px_48px_rgba(7,23,36,0.06)]">
                <span className="flex size-11 items-center justify-center rounded-2xl bg-teal-50 text-teal-800">
                  <MapPin size={19} aria-hidden="true" />
                </span>
                <h3 className="mt-4 text-lg font-semibold tracking-[-0.03em] text-[#071724]">
                  Same-day El Paso delivery
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Local courier delivery for approved research orders in the El Paso area.
                </p>
              </div>
              <div className="rounded-[1.5rem] border border-slate-900/10 bg-white p-5 shadow-[0_18px_48px_rgba(7,23,36,0.06)]">
                <span className="flex size-11 items-center justify-center rounded-2xl bg-teal-50 text-teal-800">
                  <Truck size={19} aria-hidden="true" />
                </span>
                <h3 className="mt-4 text-lg font-semibold tracking-[-0.03em] text-[#071724]">
                  Nationwide U.S. + Mexico shipping
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Nationwide U.S. shipping, plus Mexico shipping for a flat $20 USD addition.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <InternalLinkGrid
        eyebrow="Trust & Compliance"
        title="Useful pages before product review"
        links={[
          {
            label: 'Quality Page',
            title: 'Quality & Documentation',
            href: '/quality',
            description: 'How Encore frames documentation, storage guidance, and batch-level records.',
          },
          {
            label: 'Policy',
            title: 'Research-Use-Only Explanation',
            href: '/#research-use-only',
            description: 'Plain-language context for what research use only means on this site.',
          },
          {
            label: 'Questions',
            title: 'Full FAQ Library',
            href: '/faq',
            description: 'Ordering, shipping, handling, storage, category, and compliance answers.',
          },
        ]}
      />

      {/* 8. Final CTA */}
      <section className="px-5 py-12 sm:px-8 lg:py-16">
        <div className="mx-auto max-w-[88rem] rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,#071724,#0d3144)] px-6 py-12 text-center text-white shadow-[0_34px_110px_rgba(7,23,36,0.22)] sm:px-10">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-teal-200">
            Research Discovery
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">
            Ready to see where your research question fits?
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-300">
            Start with the categories, browse the research library, or submit a research profile
            for a human-reviewed follow-up. However you get there, a real person is on the other
            end.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <CTA href="/intake" tone="light">
              Start Your Research Profile
            </CTA>
            <CTA href="/research" tone="ghost" className="border-white/20 bg-white/10 text-white hover:bg-white/15">
              Visit Research Library
            </CTA>
          </div>
        </div>
      </section>
    </main>
  )
}
