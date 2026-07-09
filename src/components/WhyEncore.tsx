import { ArrowRight, FileSearch, LayoutGrid, MessageCircle } from 'lucide-react'
import { Reveal } from './Reveal'
import { ResponsiveImage } from './ResponsiveImage'
import kitImage from '../assets/images/hero/encore-kit-hero.png'
import kitImage720Avif from '../assets/images/hero/encore-kit-hero-720.avif'
import kitImage1000Avif from '../assets/images/hero/encore-kit-hero-1000.avif'
import kitImage1400Avif from '../assets/images/hero/encore-kit-hero-1400.avif'
import kitImage720Webp from '../assets/images/hero/encore-kit-hero-720.webp'
import kitImage1000Webp from '../assets/images/hero/encore-kit-hero-1000.webp'
import kitImage1400Webp from '../assets/images/hero/encore-kit-hero-1400.webp'

const kitImageAvifSrcSet = `${kitImage720Avif} 720w, ${kitImage1000Avif} 1000w, ${kitImage1400Avif} 1400w`
const kitImageWebpSrcSet = `${kitImage720Webp} 720w, ${kitImage1000Webp} 1000w, ${kitImage1400Webp} 1400w`
const kitImageSizes = '(min-width: 1024px) 55vw, 100vw'

const reasons = [
  {
    icon: LayoutGrid,
    text: 'Categories organized around real research questions instead of SEO keywords.',
  },
  {
    icon: FileSearch,
    text: 'Documentation you can actually ask for, not documentation you\'re told exists somewhere.',
  },
  {
    icon: MessageCircle,
    text: 'An intake process reviewed by a person, so a request for information gets an answer.',
  },
]

export function WhyEncore() {
  return (
    <section id="why-encore" className="px-5 py-14 sm:px-8 lg:py-20">
      <div className="mx-auto max-w-[88rem]">
        <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-700">
              Why Encore
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em] text-[#071724] sm:text-4xl lg:text-5xl">
              We built the catalog we wished existed.
            </h2>
            <p className="mt-5 text-lg leading-8 text-slate-600">
              Most research-chemical sites make you choose between polish and substance. We
              didn't think that should be a choice.
            </p>
            <p className="mt-4 text-base leading-7 text-slate-600">
              Encore Bio Labs exists because research-use catalogs shouldn't feel like either a
              spreadsheet or a supplement funnel.
            </p>

            <div className="mt-7 grid gap-4">
              {reasons.map((reason) => (
                <div key={reason.text} className="flex items-start gap-3">
                  <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-800">
                    <reason.icon size={16} aria-hidden="true" />
                  </span>
                  <p className="text-sm leading-6 text-slate-600">{reason.text}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href="/quality"
                className="inline-flex items-center gap-2 text-sm font-semibold text-teal-800 transition hover:gap-3"
              >
                See our quality standards
                <ArrowRight size={16} aria-hidden="true" />
              </a>
              <a
                href="/about"
                className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:gap-3 hover:text-[#071724]"
              >
                About Encore Bio Labs
                <ArrowRight size={16} aria-hidden="true" />
              </a>
            </div>
          </Reveal>

          <Reveal delay={0.08} className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-white shadow-[0_28px_90px_rgba(7,23,36,0.1)]">
            <ResponsiveImage
              avifSrcSet={kitImageAvifSrcSet}
              webpSrcSet={kitImageWebpSrcSet}
              sizes={kitImageSizes}
              src={kitImage}
              alt="Encore Bio Labs vial, documentation, and packaging presentation"
              width="1280"
              height="960"
              loading="lazy"
              decoding="async"
              className="aspect-[4/3] w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#071724]/25 to-transparent" />
          </Reveal>
        </div>
      </div>
    </section>
  )
}
