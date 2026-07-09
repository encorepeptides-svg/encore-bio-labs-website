import { CTA } from './CTA'

export function FinalCTA() {
  return (
    <section className="px-5 py-12 sm:px-8 lg:py-16">
      <div className="relative mx-auto max-w-[88rem] overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,#071724,#0d3144)] px-6 py-14 text-center text-white shadow-[0_34px_110px_rgba(7,23,36,0.22)] sm:px-10 sm:py-16">
        <div className="molecule-field opacity-[0.1]" aria-hidden="true" />
        <div className="pointer-events-none absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 rounded-full bg-teal-300/16 blur-3xl" />

        <div className="relative mx-auto max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-teal-200">
            Ready When You Are
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-[-0.045em] sm:text-4xl lg:text-5xl">
            Let's find what you're looking for.
          </h2>
          <p className="mt-5 text-base leading-7 text-slate-300">
            Start a research profile, or go straight to the catalog — either way, a real person on
            our team is on the other end. No pressure, no countdown clock.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <CTA href="/intake" tone="light">
              Start Your Research Profile
            </CTA>
            <CTA
              href="/catalog"
              tone="ghost"
              className="border-white/20 bg-white/10 text-white hover:bg-white/15"
            >
              Browse the Catalog
            </CTA>
          </div>
        </div>
      </div>
    </section>
  )
}
