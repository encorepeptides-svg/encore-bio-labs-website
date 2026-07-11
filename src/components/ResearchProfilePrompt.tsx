import { FlaskConical, MessageCircle, Target } from 'lucide-react'
import { CTA } from './CTA'
import { Reveal } from './Reveal'

const previewSteps = [
  {
    icon: FlaskConical,
    label: 'What you’re researching',
  },
  {
    icon: Target,
    label: 'Your current priorities',
  },
  {
    icon: MessageCircle,
    label: 'The support you need',
  },
]

const microcopy = [
  'Takes only a few minutes.',
  'No purchase required.',
  'Your answers help us provide more relevant product information.',
]

export function ResearchProfilePrompt() {
  return (
    <section id="research-profile-prompt" className="px-5 py-14 sm:px-8 lg:py-20">
      <div className="mx-auto max-w-[88rem]">
        <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,#071724,#0d3144)] shadow-[0_34px_110px_rgba(7,23,36,0.22)]">
          <div className="molecule-field opacity-[0.1]" aria-hidden="true" />
          <div className="pointer-events-none absolute left-1/2 top-0 size-64 -translate-x-1/2 rounded-full bg-teal-300/16 blur-3xl" />

          <div className="relative grid gap-10 px-6 py-14 sm:px-10 sm:py-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-8">
            <Reveal className="text-center lg:text-left">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-teal-200">
                Personalized Guidance
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.045em] text-white sm:text-4xl lg:text-5xl">
                Not Sure Where to Begin?
              </h2>
              <p className="mx-auto mt-5 max-w-lg text-base leading-7 text-slate-300 lg:mx-0">
                Tell us what you are researching, your priorities, and the type of support you
                need. We&apos;ll help narrow the catalog into a clearer starting point.
              </p>

              <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row lg:items-start">
                <CTA href="/intake" tone="light">
                  Start Your Research
                </CTA>
                <CTA
                  href="/catalog"
                  tone="ghost"
                  className="border-white/20 bg-white/10 text-white hover:bg-white/15"
                >
                  Browse the Full Catalog
                </CTA>
              </div>

              <ul className="mx-auto mt-6 flex max-w-lg flex-col items-center gap-1.5 text-xs leading-5 text-slate-400 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-x-4 lg:mx-0 lg:justify-start lg:text-left">
                {microcopy.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </Reveal>

            <Reveal delay={0.08} className="mx-auto w-full max-w-sm">
              <div className="rounded-[1.5rem] border border-white/10 bg-white/6 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-200">
                  A few minutes, three quick questions
                </p>
                <div className="mt-5 flex flex-col gap-3">
                  {previewSteps.map((step) => (
                    <div
                      key={step.label}
                      className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5"
                    >
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-teal-300/14 text-teal-100">
                        <step.icon size={16} aria-hidden="true" />
                      </span>
                      <span className="text-sm font-semibold text-slate-100">{step.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}
