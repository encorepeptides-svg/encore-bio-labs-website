import { motion, useReducedMotion, type Variants } from 'framer-motion'
import {
  Activity,
  ArrowUpRight,
  Brain,
  Dna,
  Flame,
  FlaskConical,
  Infinity as InfinityIcon,
  ShieldCheck,
  Truck,
  type LucideIcon,
} from 'lucide-react'
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
const CATEGORY_IMAGE_SIZES = '(min-width: 1280px) 20vw, (min-width: 640px) 50vw, 100vw'

const categoryIcons: Record<string, LucideIcon> = {
  'metabolic-weight-management': Flame,
  'recovery-regeneration': Activity,
  'longevity-cellular-health': InfinityIcon,
  'cognitive-performance': Brain,
  'hormone-wellness': Dna,
}

const categoryDescriptions: Record<string, string> = {
  'metabolic-weight-management':
    'Research into metabolic signaling, energy regulation, appetite pathways, and body-composition compounds.',
  'recovery-regeneration':
    'Research into tissue repair, connective-tissue signaling, recovery support, and regenerative peptide science.',
  'longevity-cellular-health':
    'Research into cellular resilience, mitochondrial function, oxidative balance, and healthy aging pathways.',
  'cognitive-performance':
    'Research into neurobiology, synaptic signaling, focus, cognition, and performance pathways.',
  'hormone-wellness':
    'Research into hormonal signaling and endocrine-adjacent compounds studied across wellness-focused programs.',
}

const trustStrip = [
  {
    icon: FlaskConical,
    title: 'Research Use Only',
    body: 'Not for human consumption.',
  },
  {
    icon: ShieldCheck,
    title: 'Purity & Documentation',
    body: 'COA verified. Documentation available.',
  },
  {
    icon: Truck,
    title: 'Secure & Discreet Shipping',
    body: 'Cold chain. Fast. Confidential.',
  },
]

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
    <section id="products" className="relative overflow-hidden bg-white px-5 py-14 sm:px-8 lg:py-20">
      <div className="relative mx-auto max-w-[94rem]">
        <SectionHeader
          eyebrow="Explore by research area"
          title="Five Research Categories. One Clear Catalog."
          description="Every product on Encore Bio Labs sits inside a focused research category — simple to browse, easy to compare, and organized for faster ordering."
        />

        <motion.div
          variants={prefersReducedMotion ? undefined : containerVariants}
          initial={prefersReducedMotion ? false : 'hidden'}
          whileInView={prefersReducedMotion ? undefined : 'show'}
          viewport={{ once: true, margin: '-90px' }}
          className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-5"
        >
          {researchAreas.map((area) => {
            const imageSrc = categoryImages[`../assets/images/products/${area.image}`]
            const imageStem = stemOf(area.image)
            const avifSrcSet = buildSrcSet(categoryImages, CATEGORY_IMAGE_BASE_PATH, imageStem, 'avif', CATEGORY_IMAGE_WIDTHS)
            const webpSrcSet = buildSrcSet(categoryImages, CATEGORY_IMAGE_BASE_PATH, imageStem, 'webp', CATEGORY_IMAGE_WIDTHS)
            const Icon = categoryIcons[area.slug] ?? FlaskConical
            const description = categoryDescriptions[area.slug] ?? area.description

            return (
              <motion.a
                key={area.slug}
                variants={prefersReducedMotion ? undefined : cardVariants}
                href={`/categories/${area.slug}`}
                whileHover={prefersReducedMotion ? undefined : { y: -8 }}
                transition={{ duration: 0.38, ease: 'easeOut' }}
                className="group flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-slate-900/10 bg-white shadow-[0_20px_60px_rgba(7,23,36,0.08)] transition duration-500 hover:border-slate-900/15 hover:shadow-[0_30px_90px_rgba(7,23,36,0.16)]"
                aria-label={`Explore ${area.name}`}
              >
                <div className="relative h-48 overflow-hidden bg-[#0b1a20]">
                  {imageSrc ? (
                    <picture>
                      {avifSrcSet ? <source type="image/avif" srcSet={avifSrcSet} sizes={CATEGORY_IMAGE_SIZES} /> : null}
                      {webpSrcSet ? <source type="image/webp" srcSet={webpSrcSet} sizes={CATEGORY_IMAGE_SIZES} /> : null}
                      <motion.img
                        src={imageSrc}
                        alt=""
                        width="720"
                        height="720"
                        loading="lazy"
                        decoding="async"
                        className="absolute inset-0 h-full w-full object-cover opacity-90 saturate-[0.82] contrast-[1.08] brightness-[0.82]"
                        whileHover={prefersReducedMotion ? undefined : { scale: 1.06 }}
                        transition={{ duration: 0.55, ease: 'easeOut' }}
                      />
                    </picture>
                  ) : null}
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,23,36,0.35)_0%,rgba(7,23,36,0.15)_38%,rgba(7,23,36,0.55)_100%)]" />
                  <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white to-transparent" />
                </div>

                <div className="relative flex flex-1 flex-col px-6 pb-6">
                  <span className="relative -mt-7 mb-4 flex size-14 shrink-0 items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-teal-400 to-emerald-600 text-white shadow-[0_12px_28px_rgba(20,184,166,0.35)]">
                    <Icon size={22} aria-hidden="true" />
                  </span>

                  <h3 className="text-2xl font-semibold tracking-[-0.04em] text-[#071724]">{area.name}</h3>
                  <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">{description}</p>

                  <div className="mt-5 flex flex-wrap gap-1.5">
                    {area.products.slice(0, 3).map((product) => (
                      <span
                        key={product}
                        className="rounded-full border border-slate-900/10 bg-[#f5f5f2] px-2.5 py-1 text-[11px] font-medium text-slate-600"
                      >
                        {product}
                      </span>
                    ))}
                  </div>

                  <div className="mt-auto pt-6">
                    <div className="border-t border-slate-900/10 pt-4" />
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-500">{area.products.length} products</span>
                      <span className="flex items-center gap-1.5 text-sm font-semibold text-teal-800">
                        View Products
                        <ArrowUpRight
                          size={15}
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

        <div className="mt-10 grid gap-4 rounded-[1.5rem] border border-slate-900/10 bg-[#f5f5f2]/70 p-3 sm:grid-cols-3">
          {trustStrip.map((item) => (
            <div key={item.title} className="flex items-center gap-3 rounded-[1.1rem] px-4 py-3.5">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white text-teal-700 shadow-sm">
                <item.icon size={18} aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-semibold text-[#071724]">{item.title}</p>
                <p className="text-xs leading-5 text-slate-500">{item.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
