import { ArrowDown, ArrowRight, MessageCircle, ShoppingCart } from 'lucide-react'
import type { Product } from '../../data/products'
import type { ProductConversionLocaleContent } from '../../data/productConversionContent'
import { useLocale } from '../../i18n/LocaleContext'
import { money } from '../../lib/purchaseOptions'

export function ProductFocusedFaq({
  product,
  copy,
}: {
  product: Product
  copy: ProductConversionLocaleContent
}) {
  return (
    <section className="bg-[#f4f7f6] px-5 py-12 sm:px-8 sm:py-16 lg:py-20" aria-labelledby={`product-faq-${product.slug}`}>
      <div className="mx-auto grid max-w-[88rem] gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:gap-14">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-teal-700">{copy.faq.eyebrow}</p>
          <h2 id={`product-faq-${product.slug}`} className="mt-3 text-3xl font-semibold tracking-[-0.045em] text-[#071724] sm:text-4xl">{copy.faq.heading}</h2>
        </div>
        <div className="overflow-hidden rounded-[1.6rem] border border-slate-900/10 bg-white shadow-[0_20px_60px_rgba(7,23,36,0.06)]">
          {copy.faq.items.map((item) => (
            <details key={item.question} className="group border-b border-slate-900/10 p-5 last:border-b-0 sm:px-6">
              <summary className="cursor-pointer list-none font-semibold leading-6 text-[#071724] outline-none focus-visible:ring-2 focus-visible:ring-teal-600 [&::-webkit-details-marker]:hidden">
                <span className="flex items-center justify-between gap-4">
                  {item.question}
                  <span aria-hidden="true" className="flex size-8 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-800 transition group-open:rotate-45 motion-reduce:transition-none">+</span>
                </span>
              </summary>
              <p className="mt-4 max-w-3xl border-t border-slate-900/8 pt-4 text-sm leading-6 text-slate-600">{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}

export function ProductConversionFinalCta({
  product,
  copy,
}: {
  product: Product
  copy: ProductConversionLocaleContent
}) {
  const { path } = useLocale()
  const prices = product.variants.map((variant) => variant.price).filter((price) => price > 0)
  const startingPrice = prices.length ? money(Math.min(...prices)) : '—'

  return (
    <section className="relative isolate overflow-hidden bg-[#030b18] px-5 py-14 text-white sm:px-8 sm:py-20" aria-labelledby={`product-final-cta-${product.slug}`}>
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_72%_20%,rgba(40,224,193,0.18),transparent_35%),linear-gradient(135deg,#030b18,#071f2b)]" aria-hidden="true" />
      <div className="mx-auto flex max-w-[88rem] flex-col gap-8 rounded-[2rem] border border-white/12 bg-white/[0.045] p-6 shadow-[0_30px_90px_rgba(0,0,0,0.28)] backdrop-blur sm:p-9 lg:flex-row lg:items-end lg:justify-between lg:p-12">
        <div className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#71f0db]">{copy.finalCta.eyebrow}</p>
          <h2 id={`product-final-cta-${product.slug}`} className="mt-3 text-3xl font-semibold leading-[1.02] tracking-[-0.05em] text-white sm:text-4xl lg:text-5xl">{copy.finalCta.heading}</h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">{copy.finalCta.body}</p>
          <p className="mt-5 text-sm font-semibold text-white">{copy.hero.startingAtLabel} {startingPrice}</p>
          <p className="mt-2 text-xs font-semibold uppercase tracking-[0.1em] text-slate-400">{copy.hero.researchUseOnly}</p>
        </div>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row lg:flex-col xl:flex-row">
          <a href="#product-purchase" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#28e0c1] px-6 py-3 text-sm font-bold text-[#071724] transition hover:-translate-y-0.5 hover:bg-[#71f0db] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#71f0db] motion-reduce:transform-none">
            <ShoppingCart size={16} aria-hidden="true" />
            {copy.finalCta.primaryCta}
            <ArrowDown size={15} aria-hidden="true" />
          </a>
          <a href={path('/contact')} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/18 bg-white/[0.06] px-6 py-3 text-sm font-semibold text-white transition hover:border-white/35 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#71f0db]">
            <MessageCircle size={16} aria-hidden="true" />
            {copy.finalCta.secondaryCta}
            <ArrowRight size={15} aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  )
}
