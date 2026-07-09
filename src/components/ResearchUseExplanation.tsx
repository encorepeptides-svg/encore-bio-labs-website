import { ArrowRight, ShieldCheck } from 'lucide-react'
import { Reveal } from './Reveal'

const complianceChips = ['Research use only', 'Documentation by request', 'Not medical advice']

export function ResearchUseExplanation() {
  return (
    <section id="research-use-only" className="px-5 py-10 sm:px-8 lg:py-14">
      <Reveal className="mx-auto max-w-4xl">
        <div className="flex flex-col items-start gap-5 rounded-[1.75rem] border border-slate-900/10 bg-white p-6 shadow-[0_18px_48px_rgba(7,23,36,0.06)] sm:flex-row sm:items-center sm:p-8">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-teal-800">
            <ShieldCheck size={22} aria-hidden="true" />
          </span>
          <div>
            <p className="text-base leading-7 text-slate-600">
              Everything in this catalog is sold for laboratory research use only — not for human
              or animal consumption, and nothing here is medical advice, dosing guidance, or a
              treatment recommendation.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {complianceChips.map((chip) => (
                <span
                  key={chip}
                  className="rounded-full border border-slate-900/10 bg-[#f5f5f2] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-slate-600"
                >
                  {chip}
                </span>
              ))}
            </div>
            <a
              href="/about#research-use-only"
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-teal-800 transition hover:gap-3"
            >
              Read the full explanation
              <ArrowRight size={16} aria-hidden="true" />
            </a>
          </div>
        </div>
      </Reveal>
    </section>
  )
}
