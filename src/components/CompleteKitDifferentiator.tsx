import { ArrowRight, Boxes, FileText, PackageCheck, Sparkles } from 'lucide-react'
import { Reveal } from './Reveal'
import { ResponsiveImage } from './ResponsiveImage'
import kitHero from '../assets/images/hero/encore-kit-hero.png'
import kitHero720Avif from '../assets/images/hero/encore-kit-hero-720.avif'
import kitHero1000Avif from '../assets/images/hero/encore-kit-hero-1000.avif'
import kitHero1400Avif from '../assets/images/hero/encore-kit-hero-1400.avif'
import kitHero720Webp from '../assets/images/hero/encore-kit-hero-720.webp'
import kitHero1000Webp from '../assets/images/hero/encore-kit-hero-1000.webp'
import kitHero1400Webp from '../assets/images/hero/encore-kit-hero-1400.webp'

const kitHeroAvifSrcSet = `${kitHero720Avif} 720w, ${kitHero1000Avif} 1000w, ${kitHero1400Avif} 1400w`
const kitHeroWebpSrcSet = `${kitHero720Webp} 720w, ${kitHero1000Webp} 1000w, ${kitHero1400Webp} 1400w`
const kitHeroSizes = '(min-width: 1024px) 55vw, 100vw'

const kitFeatures = [
  {
    icon: PackageCheck,
    title: 'Measured BAC Water',
    description: 'Included where applicable to support a more organized kit experience.',
  },
  {
    icon: Boxes,
    title: 'Complete Kit Packaging',
    description: 'Supporting components are grouped together instead of sourced separately.',
  },
  {
    icon: FileText,
    title: 'Research Documentation',
    description: 'Product context and documentation requests stay connected to the catalog workflow.',
  },
  {
    icon: PackageCheck,
    title: 'Premium Fulfillment',
    description: 'Packaging, labeling, and fulfillment details are part of the premium brand experience.',
  },
]

export function CompleteKitDifferentiator() {
  return (
    <section id="kits" className="px-5 py-16 sm:px-8 lg:py-24">
      <div className="mx-auto max-w-[88rem]">
        <Reveal
          className="relative overflow-hidden rounded-[1.75rem] border border-slate-900/10 bg-[#071724] p-6 shadow-[0_30px_100px_rgba(7,23,36,0.22)] sm:p-8 lg:p-10"
        >
          <div className="absolute right-[-8rem] top-[-8rem] h-80 w-80 rounded-full bg-teal-300/10 blur-3xl" />

          <div className="relative grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-3 py-2 text-sm text-slate-200 backdrop-blur-xl">
                <Sparkles size={16} aria-hidden="true" className="text-teal-300" />
                Complete research kits
              </div>

              <h1 className="mt-6 text-3xl font-semibold tracking-[-0.02em] text-white sm:text-4xl lg:text-5xl">
                Some research questions call for more than one compound.
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300">
                Where products are commonly reviewed together, we package the supporting
                components in one kit — including measured BAC water where applicable — so
                you're not sourcing pieces separately.
              </p>
              <div className="mt-6 grid gap-2 text-sm font-medium text-slate-300 sm:grid-cols-3">
                {['Convenience', 'Consistency', 'Organization'].map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-white/10 bg-white/7 px-3 py-2 text-center"
                  >
                    {item}
                  </span>
                ))}
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href="/catalog"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-[#071724] shadow-[0_24px_70px_rgba(255,255,255,0.16)] transition hover:bg-teal-100"
                >
                  View Catalog
                  <ArrowRight size={17} aria-hidden="true" />
                </a>

                <a
                  href="/catalog"
                  className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur-xl transition hover:bg-white/10"
                >
                  Browse Product Catalog
                </a>
              </div>
            </div>

            <div className="grid gap-4">
              <Reveal
                className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/7 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
              >
                <ResponsiveImage
                  avifSrcSet={kitHeroAvifSrcSet}
                  webpSrcSet={kitHeroWebpSrcSet}
                  sizes={kitHeroSizes}
                  src={kitHero}
                  alt="Encore Bio Labs vial, carton, and insert kit presentation"
                  width="1280"
                  height="720"
                  loading="lazy"
                  decoding="async"
                  className="aspect-[16/9] w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#071724]/55 to-transparent" />
                <div className="absolute inset-x-4 bottom-4 grid grid-cols-4 gap-2">
                  {['Compound', 'BAC water', 'Docs', 'Packaging'].map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-white/20 bg-[#071724]/55 px-2.5 py-2 text-center text-[11px] font-semibold uppercase tracking-[0.12em] text-white backdrop-blur-xl"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </Reveal>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {kitFeatures.map((feature, index) => (
                <Reveal
                  as="article"
                  key={feature.title}
                  delay={(index + 1) * 0.06}
                  className="rounded-2xl border border-white/10 bg-white/7 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl transition hover:border-teal-200/30 hover:bg-white/10"
                >
                  <div className="flex h-full flex-col">
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-teal-300/12 text-teal-200">
                      <feature.icon size={20} aria-hidden="true" />
                    </div>
                    <h3 className="mt-5 text-lg font-semibold text-white">{feature.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-400">
                      {feature.description}
                    </p>
                  </div>
                </Reveal>
              ))}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
