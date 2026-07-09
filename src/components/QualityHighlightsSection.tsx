import { Eye, FileText, PackageCheck, ShieldCheck, Snowflake } from 'lucide-react'
import { CTA } from './CTA'
import { Reveal } from './Reveal'
import { SectionHeader } from './SectionHeader'

const qualityPillars = [
  {
    icon: FileText,
    title: 'Documentation',
    body: 'Identity, purity, storage, and batch documentation can be requested through the intake process — nothing hidden behind a sales call.',
  },
  {
    icon: ShieldCheck,
    title: 'Quality Standards',
    body: 'The same handling and presentation standard applied across every catalog entry, not just the popular ones.',
  },
  {
    icon: Snowflake,
    title: 'Cold Chain Practices',
    body: 'Temperature-aware handling from dispatch to delivery, with storage guidance included on every product page.',
  },
  {
    icon: PackageCheck,
    title: 'Professional Packaging',
    body: 'Careful packaging and labeling as part of the catalog experience, not an afterthought.',
  },
  {
    icon: Eye,
    title: 'Research Transparency',
    body: "We publish what we can actually stand behind — no invented purity percentages or manufactured statistics.",
  },
]

export function QualityHighlightsSection() {
  return (
    <section className="px-5 py-14 sm:px-8 lg:py-20">
      <div className="mx-auto max-w-[88rem]">
        <SectionHeader
          eyebrow="Quality & Documentation"
          title="Built like a lab you'd actually trust."
          description="Premium presentation is table stakes. What matters is what's underneath it — documented, temperature-aware, and honest about what's available on request."
        />

        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {qualityPillars.map((pillar, index) => (
            <Reveal
              as="article"
              key={pillar.title}
              delay={index * 0.05}
              className="rounded-[1.5rem] border border-slate-900/10 bg-white p-5 shadow-[0_18px_48px_rgba(7,23,36,0.06)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_24px_64px_rgba(7,23,36,0.1)]"
            >
              <span className="flex size-11 items-center justify-center rounded-2xl bg-teal-50 text-teal-800">
                <pillar.icon size={19} aria-hidden="true" />
              </span>
              <h3 className="mt-4 text-lg font-semibold tracking-[-0.03em] text-[#071724]">
                {pillar.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{pillar.body}</p>
            </Reveal>
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <CTA href="/quality" tone="ghost" className="border-slate-900/10 bg-white text-[#071724] hover:bg-teal-50">
            Learn About Quality
          </CTA>
        </div>
      </div>
    </section>
  )
}
