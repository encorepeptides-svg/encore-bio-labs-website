import { BadgeCheck, FileText, Microscope, PackageCheck, Truck, Waves } from 'lucide-react'
import { Reveal } from './Reveal'

const trustBadges = [
  {
    icon: Microscope,
    title: 'COA Available',
    description: 'Certificate availability can be reviewed through the approved documentation request process.',
  },
  {
    icon: FileText,
    title: 'Research Documentation',
    description: 'Product records, format context, and catalog notes are organized for easier review.',
  },
  {
    icon: PackageCheck,
    title: 'Premium Packaging',
    description: 'A polished kit experience with consistent presentation and fulfillment cues.',
  },
  {
    icon: Truck,
    title: 'Fast U.S. Shipping',
    description: 'Domestic fulfillment is organized for efficient research kit delivery.',
  },
  {
    icon: Waves,
    title: 'Mexico Shipping Available',
    description: 'Mexico shipping is available with a $20 USD addition to standard shipping.',
  },
  {
    icon: BadgeCheck,
    title: 'Complete Research Kits',
    description: 'Supporting kit components are packaged together where applicable.',
  },
]

export function TrustBadges() {
  return (
    <section className="px-5 py-9 sm:px-8 lg:py-14">
      <div className="mx-auto max-w-[88rem]">
        <Reveal
          className="grid overflow-hidden rounded-[1.75rem] border border-slate-900/10 bg-white shadow-[0_28px_90px_rgba(7,23,36,0.1)] lg:grid-cols-[0.62fr_1.38fr]"
        >
          <div className="relative overflow-hidden bg-[#071724] p-6 text-white sm:p-8">
            <div className="absolute right-[-6rem] top-[-6rem] h-64 w-64 rounded-full bg-teal-300/12 blur-3xl" />
            <div className="molecule-field opacity-15" aria-hidden="true" />
            <div className="relative">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-200">
                Confidence Signals
              </p>
              <h2 className="mt-5 max-w-xl text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">
                Documentation, packaging, and fulfillment built for serious research buyers.
              </h2>
              <p className="mt-5 max-w-xl text-sm leading-6 text-slate-300">
                Encore Bio Labs gives qualified customers a clearer way to
                review catalog options, documentation availability, kit
                components, and fulfillment details before inquiry.
              </p>
            </div>
          </div>

          <div className="grid bg-[#fbfbf8] sm:grid-cols-2 lg:grid-cols-3">
          {trustBadges.map((badge, index) => (
            <Reveal
              as="article"
              key={badge.title}
              delay={index * 0.06}
              className="group border-b border-slate-900/10 bg-[#fbfbf8] p-5 transition duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_24px_70px_rgba(7,23,36,0.08)] sm:border-r sm:p-6 lg:[&:nth-child(3n)]:border-r-0"
            >
              <div className="flex h-full flex-col">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-teal-100 text-teal-800 transition group-hover:bg-[#071724] group-hover:text-white group-hover:shadow-[0_16px_34px_rgba(7,23,36,0.16)]">
                  <badge.icon size={19} aria-hidden="true" />
                </div>
                <p className="mt-8 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  0{index + 1}
                </p>
                <h3 className="mt-2 text-lg font-semibold tracking-[-0.02em] text-[#071724]">
                  {badge.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{badge.description}</p>
                <span className="mt-5 h-1 w-12 rounded-full bg-teal-200 transition group-hover:w-20 group-hover:bg-teal-400" />
              </div>
            </Reveal>
          ))}
          </div>
        </Reveal>
        </div>
    </section>
  )
}
