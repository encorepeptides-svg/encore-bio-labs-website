import { AlertTriangle } from 'lucide-react'
import type { ReactNode } from 'react'

export type LegalSection = {
  heading: string
  body: ReactNode
}

const legalNav = [
  { label: 'Terms of Service', href: '/legal/terms' },
  { label: 'Privacy Policy', href: '/legal/privacy' },
  { label: 'Shipping & Returns', href: '/legal/shipping-returns' },
]

export function LegalPageLayout({
  title,
  effectiveDate,
  intro,
  sections,
}: {
  title: string
  effectiveDate: string
  intro: string
  sections: LegalSection[]
}) {
  return (
    <main id="main-content" className="bg-[#f5f5f2] px-5 py-14 sm:px-8 lg:py-20">
      <div className="mx-auto max-w-4xl">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-700">Legal</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-[-0.045em] text-[#071724] sm:text-5xl">
          {title}
        </h1>
        <p className="mt-3 text-sm font-semibold text-slate-500">Effective date: {effectiveDate}</p>
        <p className="mt-6 text-base leading-7 text-slate-600">{intro}</p>

        <div className="mt-8 flex flex-wrap gap-2">
          {legalNav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-full border border-slate-900/10 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:text-[#071724]"
            >
              {item.label}
            </a>
          ))}
        </div>

        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-amber-400/30 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
          <AlertTriangle size={18} aria-hidden="true" className="mt-0.5 shrink-0 text-amber-600" />
          <p>
            These policies are written for research-use-only website context and should be reviewed
            by qualified legal counsel before they are relied on for a specific transaction or
            jurisdiction.
          </p>
        </div>

        <div className="mt-10 grid gap-8">
          {sections.map((section) => (
            <section key={section.heading}>
              <h2 className="text-xl font-semibold tracking-[-0.03em] text-[#071724]">
                {section.heading}
              </h2>
              <div className="mt-3 grid gap-3 text-sm leading-7 text-slate-600">{section.body}</div>
            </section>
          ))}
        </div>

        <div className="mt-12 rounded-2xl border border-slate-900/10 bg-white p-5 text-sm leading-6 text-slate-600">
          <p className="font-semibold text-[#071724]">Questions about this page?</p>
          <p className="mt-2">
            Contact Encore Bio Labs through the{' '}
            <a href="/intake" className="font-semibold text-teal-700 hover:underline">
              research intake process
            </a>{' '}
            or WhatsApp{' '}
            <a href="https://wa.me/19153595448" className="font-semibold text-teal-700 hover:underline">
              9153595448
            </a>
            .
          </p>
        </div>
      </div>
    </main>
  )
}
