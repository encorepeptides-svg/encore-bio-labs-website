import { motion, useReducedMotion, type Variants } from 'framer-motion'
import type { CSSProperties } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { researchAreas } from '../data/products'
import { buildSrcSet, stemOf } from '../lib/responsiveImages'
import { SectionHeader } from './SectionHeader'

// Narrowed to the category-visual family only: every researchAreas.image
// value is a categoryVisuals[...] entry, never an individual product photo,
// so this never needs to eagerly pull in the other ~24 product images.
const categoryImages = import.meta.glob('../assets/images/products/category-*.{png,webp,avif}', {
  eager: true,
  import: 'default',
  query: '?url',
}) as Record<string, string>

const CATEGORY_IMAGE_BASE_PATH = '../assets/images/products/'
const CATEGORY_IMAGE_WIDTHS = [720, 1000, 1254]
const CATEGORY_IMAGE_SIZES = '(min-width: 1536px) 20vw, (min-width: 1280px) 25vw, (min-width: 768px) 50vw, 100vw'

const containerVariants: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.09,
    },
  },
}

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
  },
}

export function CategoryGrid() {
  const prefersReducedMotion = useReducedMotion()

  return (
    <section
      id="products"
      className="relative overflow-hidden bg-[#F8FAFC] px-5 py-14 sm:px-8 lg:py-20"
    >
      <div className="molecule-field opacity-[0.18]" />
      <div className="pointer-events-none absolute left-[8%] top-16 size-64 rounded-full bg-cyan-200/25 blur-3xl" />
      <div className="pointer-events-none absolute bottom-8 right-[7%] size-72 rounded-full bg-emerald-200/25 blur-3xl" />

      <div className="relative mx-auto max-w-[94rem]">
        <SectionHeader
          eyebrow="Explore by research area"
          title="Five research categories. One clear catalog."
          description="Every product on Encore Bio Labs sits inside a category built around a real area of research interest — not a marketing label."
        />

        <motion.div
          variants={prefersReducedMotion ? undefined : containerVariants}
          initial={prefersReducedMotion ? false : 'hidden'}
          whileInView={prefersReducedMotion ? undefined : 'show'}
          viewport={{ once: true, margin: '-90px' }}
          className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-6 2xl:grid-cols-5"
        >
          {researchAreas.map((area) => {
            const imageSrc = categoryImages[`../assets/images/products/${area.image}`]
            const imageStem = stemOf(area.image)
            const avifSrcSet = buildSrcSet(categoryImages, CATEGORY_IMAGE_BASE_PATH, imageStem, 'avif', CATEGORY_IMAGE_WIDTHS)
            const webpSrcSet = buildSrcSet(categoryImages, CATEGORY_IMAGE_BASE_PATH, imageStem, 'webp', CATEGORY_IMAGE_WIDTHS)

            return (
              <motion.a
                key={area.name}
                variants={prefersReducedMotion ? undefined : cardVariants}
                href={`/categories/${area.slug}`}
                whileHover={prefersReducedMotion ? undefined : { y: -10 }}
                transition={{ duration: 0.38, ease: 'easeOut' }}
                className="group relative isolate flex min-h-[28rem] overflow-hidden rounded-[2rem] border border-white/70 bg-white/75 shadow-[0_24px_80px_rgba(7,23,36,0.08)] backdrop-blur-2xl transition duration-500 hover:border-white hover:shadow-[0_34px_110px_rgba(20,184,166,0.22)] xl:col-span-2 xl:[&:nth-child(4)]:col-start-2 2xl:col-span-1 2xl:[&:nth-child(4)]:col-start-auto"
                style={{ '--area-accent': area.accent } as CSSProperties}
                aria-label={`Explore ${area.name}`}
              >
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.68),rgba(255,255,255,0.9)_58%,rgba(255,255,255,0.98))]" />
                <div className="absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_50%_20%,color-mix(in_srgb,var(--area-accent)_28%,transparent),transparent_58%)]" />
                <div className="absolute -right-20 -top-20 size-48 rounded-full bg-[color-mix(in_srgb,var(--area-accent)_22%,transparent)] blur-3xl transition duration-500 group-hover:bg-[color-mix(in_srgb,var(--area-accent)_36%,transparent)]" />

                <div className="relative flex w-full flex-col">
                  <div className="relative h-56 overflow-hidden bg-[radial-gradient(circle_at_50%_8%,rgba(255,255,255,0.98),rgba(232,244,244,0.82)_46%,rgba(206,222,224,0.58))]">
                    {imageSrc ? (
                      <picture>
                        {avifSrcSet ? (
                          <source type="image/avif" srcSet={avifSrcSet} sizes={CATEGORY_IMAGE_SIZES} />
                        ) : null}
                        {webpSrcSet ? (
                          <source type="image/webp" srcSet={webpSrcSet} sizes={CATEGORY_IMAGE_SIZES} />
                        ) : null}
                        <motion.img
                          src={imageSrc}
                          alt=""
                          width="720"
                          height="720"
                          loading="lazy"
                          decoding="async"
                          className="absolute inset-0 h-full w-full object-cover opacity-95 saturate-[0.92]"
                          style={{
                            maskImage:
                              'linear-gradient(to bottom, black 0%, black 66%, transparent 100%), radial-gradient(circle at 50% 45%, black 0%, black 62%, transparent 96%)',
                            WebkitMaskImage:
                              'linear-gradient(to bottom, black 0%, black 66%, transparent 100%), radial-gradient(circle at 50% 45%, black 0%, black 62%, transparent 96%)',
                          }}
                          whileHover={prefersReducedMotion ? undefined : { scale: 1.045, y: -5 }}
                          transition={{ duration: 0.48, ease: 'easeOut' }}
                        />
                      </picture>
                    ) : null}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(255,255,255,0)_0_42%,rgba(255,255,255,0.36)_76%,rgba(255,255,255,0.9)_100%)]" />
                    <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0)_0_34%,rgba(255,255,255,0.42)_45%,rgba(255,255,255,0)_58%)]" />
                    <div className="absolute left-7 top-7 flex gap-2">
                      <span className="size-2 rounded-full bg-[color-mix(in_srgb,var(--area-accent)_86%,white)] shadow-[0_0_24px_color-mix(in_srgb,var(--area-accent)_70%,transparent)]" />
                      <span className="mt-8 size-1.5 rounded-full bg-slate-300/80" />
                      <span className="mt-4 size-1 rounded-full bg-teal-200" />
                    </div>
                    <motion.div
                      className="absolute inset-x-8 bottom-4 h-16 rounded-full bg-slate-500/18 blur-2xl"
                      whileHover={prefersReducedMotion ? undefined : { scale: 1.08 }}
                    />
                    <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white/95 to-transparent" />
                  </div>

                  <div className="flex flex-1 flex-col p-6 sm:p-7">
                    <div className="mb-5 flex items-center justify-between gap-3">
                      <span className="rounded-full border border-slate-900/10 bg-white/82 px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm backdrop-blur-xl">
                        {area.products.length} products
                      </span>
                      <span className="flex size-10 items-center justify-center rounded-full border border-slate-900/10 bg-[#071724] text-white shadow-[0_16px_34px_rgba(7,23,36,0.18)] transition duration-300 group-hover:rotate-12 group-hover:bg-teal-700">
                        <ArrowUpRight size={18} aria-hidden="true" />
                      </span>
                    </div>

                    <h3 className="text-2xl font-semibold tracking-[-0.04em] text-[#071724]">
                      {area.name}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      {area.description}
                    </p>

                    <div className="mt-5 flex flex-wrap gap-2">
                      {area.products.slice(0, 3).map((product) => (
                        <span
                          key={product}
                          className="rounded-full border border-slate-900/10 bg-white/70 px-3 py-1.5 text-xs font-medium text-slate-600"
                        >
                          {product}
                        </span>
                      ))}
                    </div>

                    <div className="mt-auto pt-6">
                      <span className="inline-flex items-center gap-2 text-sm font-semibold text-teal-800">
                        View Products
                        <ArrowUpRight
                          size={16}
                          aria-hidden="true"
                          className="transition duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
                        />
                      </span>
                    </div>
                  </div>
                </div>
              </motion.a>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
