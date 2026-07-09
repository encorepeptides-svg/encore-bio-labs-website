import { Eye, FileText, PackageCheck, ShieldCheck, Snowflake } from 'lucide-react'
import { CTA } from './CTA'
import { Reveal } from './Reveal'
import { SectionHeader } from './SectionHeader'
import { websiteCopy } from '../data/websiteCopy'

const qualityPillars = [
  {
    icon: FileText,
    title: 'Documentation',
    body: websiteCopy.documentationPromise,
  },
  {
    icon: ShieldCheck,
    title: 'Quality Standards',
    body: 'We apply consistent sourcing, handling, and review standards across the catalog so enterprise teams can compare options quickly.',
  },
  {
    icon: Snowflake,
    title: 'Cold Chain Practices',
    body: 'Temperature-aware fulfillment and storage guidance help teams protect sensitive reagents from dispatch through receipt.',
  },
  {
    icon: PackageCheck,
    title: 'Professional Packaging',
    body: 'Clear packaging and labeling support procurement, receiving, and internal research workflows from the first shipment.',
  },
  {
    icon: Eye,
    title: 'Research Transparency',
    body: 'We keep claims tied to available documentation and research context, so your team can evaluate evidence without marketing fog.',
  },
]

export function QualityHighlightsSection() {
  return (
    <section className="px-5 py-14 sm:px-8 lg:py-20">
      <div className="mx-auto max-w-[88rem]">
        <SectionHeader
          eyebrow="Quality & Documentation"
          title="Built for teams that move from discovery to clinical readiness."
          description={websiteCopy.brandPromise}
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
