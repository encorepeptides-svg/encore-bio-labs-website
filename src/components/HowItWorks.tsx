import { ClipboardCheck, Search, Truck } from 'lucide-react'
import { SectionHeader } from './SectionHeader'

const steps = [
  {
    icon: Search,
    title: 'Browse',
    copy: 'Explore the catalog by category and read the real research context behind each entry.',
  },
  {
    icon: ClipboardCheck,
    title: 'Request',
    copy: 'Send a quick intake or message us directly — a person on our team reads every one.',
  },
  {
    icon: Truck,
    title: 'Receive',
    copy: 'Same-day local delivery in El Paso, or shipping nationwide and to Mexico.',
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="px-5 py-14 sm:px-8 lg:py-20">
      <div className="mx-auto max-w-[88rem]">
        <SectionHeader
          eyebrow="How It Works"
          title="Simple, from browse to delivery."
          description="No dosing guidance, no use instructions — just a clear path from question to catalog to your door."
        />

        <div className="mt-9 grid gap-4 md:grid-cols-3">
          {steps.map((step, index) => (
            <article
              key={step.title}
              className="rounded-2xl border border-slate-900/10 bg-white/72 p-5 shadow-[0_18px_44px_rgba(7,23,36,0.06),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-white"
            >
              <div className="flex items-center justify-between">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-[#071724] text-white">
                  <step.icon size={21} aria-hidden="true" />
                </div>
                <span className="text-sm font-semibold text-slate-400">0{index + 1}</span>
              </div>
              <h3 className="mt-6 text-xl font-semibold text-[#071724]">{step.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{step.copy}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
