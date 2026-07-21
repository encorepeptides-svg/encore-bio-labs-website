import retatrutideCutout from '../../assets/images/products/hero-demo/retatrutide-demo.webp'
import ghkCutout from '../../assets/images/products/hero-demo/ghk-cu-demo.webp'
import igfCutout from '../../assets/images/products/hero-demo/igf1-lr3-demo.webp'
import { ProductHero } from './ProductHero'

/**
 * Development-only preview for the reusable ProductHero environment. Renders the
 * same component with different accents/densities against the freshly isolated
 * cutouts, so the seamless product-to-scene blending can be reviewed before the
 * masters are promoted and the hero is rolled out across product pages.
 */
export function ProductHeroPreviewPage() {
  return (
    <main id="main-content" className="min-h-screen bg-[#04101a] px-5 py-12 text-white sm:px-8">
      <div className="mx-auto max-w-[92rem]">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-300">Development preview</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em]">ProductHero environment</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
          One reusable component, three products, three accents — each product is a transparent cutout
          dropped into a fully CSS/SVG-generated lit scene. No baked backgrounds, no hard container edge.
        </p>
        <div className="mt-10 grid gap-8 lg:grid-cols-3">
          <div>
            <ProductHero imageSrc={retatrutideCutout} imageAlt="Retatrutide research vial" accent="#28e0c1" density="high" priority />
            <p className="mt-3 text-sm font-semibold text-slate-300">Retatrutide · teal · high density</p>
          </div>
          <div>
            <ProductHero imageSrc={ghkCutout} imageAlt="GHK-Cu research vial" accent="#2fb4a6" density="medium" />
            <p className="mt-3 text-sm font-semibold text-slate-300">GHK-Cu · green-teal · medium</p>
          </div>
          <div>
            <ProductHero imageSrc={igfCutout} imageAlt="IGF1-LR3 research vial" accent="#4f83d6" density="low" />
            <p className="mt-3 text-sm font-semibold text-slate-300">IGF1-LR3 · blue · low</p>
          </div>
        </div>
      </div>
    </main>
  )
}
