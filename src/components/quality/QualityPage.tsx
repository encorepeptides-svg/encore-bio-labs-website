import { ArrowRight, ShieldCheck } from 'lucide-react'
import { QualitySection } from '../QualitySection'
import { Reveal } from '../Reveal'
import { InternalLinkGrid } from '../content/EditorialModules'

export function QualityPage() {
  return (
    <main id="main-content" className="bg-[#F8FAFC]">
      <div className="px-5 pt-6 sm:px-8">
        <div className="mx-auto flex max-w-[88rem] items-center gap-2 text-sm text-slate-500">
          <a href="/" className="font-medium transition hover:text-[#071724]">
            Home
          </a>
          <span aria-hidden="true">/</span>
          <span className="font-semibold text-[#071724]">Quality &amp; Documentation</span>
        </div>
      </div>

      {/* Hero */}
      <section className="px-5 pb-8 pt-8 sm:px-8 lg:pb-10">
        <Reveal className="mx-auto max-w-[88rem]">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-700">
            Quality &amp; Documentation
          </p>
          <h1 className="mt-4 max-w-4xl text-4xl font-semibold leading-[1.02] tracking-[-0.05em] text-[#071724] sm:text-5xl lg:text-6xl">
            What we make available, and how we handle it.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            This page exists so you can see, in one place, exactly what Encore Bio Labs makes
            available on request and how we handle storage, batch records, and identity or purity
            documentation — before you ever start a research intake.
          </p>
        </Reveal>
      </section>

      {/* Existing documentation / quality-handling section, relocated as-is */}
      <QualitySection />

      {/* Research-use-only reminder */}
      <section className="px-5 py-10 sm:px-8 lg:py-14">
        <Reveal className="mx-auto max-w-[88rem]">
          <div className="rounded-[2rem] border border-slate-900/10 bg-white p-6 shadow-[0_24px_80px_rgba(7,23,36,0.08)] sm:p-8">
            <ShieldCheck size={26} aria-hidden="true" className="text-teal-700" />
            <h2 className="mt-5 text-2xl font-semibold tracking-[-0.035em] text-[#071724] sm:text-3xl">
              This page is documentation context, not medical advice.
            </h2>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-600">
              Everything above describes what documentation is available and how it's handled —
              not what a compound will do for you personally. All Encore Bio Labs products are
              sold for laboratory research use only. They are not intended for human or animal
              consumption, and nothing on this page is medical advice, dosing guidance, a use
              instruction, or a treatment recommendation.
            </p>
            <a
              href="/about#research-use-only"
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-teal-800 transition hover:gap-3"
            >
              Read the full research-use-only explanation
              <ArrowRight size={16} aria-hidden="true" />
            </a>
          </div>
        </Reveal>
      </section>

      <InternalLinkGrid
        eyebrow="Related Pages"
        title="More context before you start an intake"
        links={[
          {
            label: 'Questions',
            title: 'Documentation FAQs',
            href: '/faq#documentation',
            description: 'Common questions about identity, purity, and batch documentation requests.',
          },
          {
            label: 'About',
            title: 'About Encore Bio Labs',
            href: '/about',
            description: 'Why the catalog is organized this way, and what we believe about documentation.',
          },
          {
            label: 'Policy',
            title: 'Shipping & Returns',
            href: '/legal/shipping-returns',
            description: 'Local El Paso delivery, nationwide shipping, and Mexico shipping details.',
          },
        ]}
      />
    </main>
  )
}
