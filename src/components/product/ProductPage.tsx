import { useEffect } from 'react'
import { products } from '../../data/products'
import {
  FAQSection,
  FinalPurchaseCTA,
  ProductBreadcrumb,
  ProductHero,
  ProductBenefits,
  ProductHowItWorksFlow,
  ProductCompleteKitCallout,
  ProductQualityFocus,
  ProductSpecs,
  RelatedProducts,
  ResearchUseDisclaimer,
} from './ProductPageSections'

function findProductBySlug(slug: string) {
  try {
    return products.find((productEntry) => productEntry.slug === slug) ?? null
  } catch {
    return null
  }
}

export function ProductPage({ slug }: { slug: string }) {
  const product = findProductBySlug(slug)

  useEffect(() => {
    const title = product ? `${product.name} Research Product | Encore Bio Labs` : 'Product Not Found | Encore Bio Labs'
    const description = product
      ? product.shortDescription || product.description
      : 'The requested Encore Bio Labs research product is not available.'
    const previousTitle = document.title
    const descriptionMeta = document.querySelector<HTMLMetaElement>('meta[name="description"]')
    const previousDescription = descriptionMeta?.content
    let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    const createdCanonical = !canonical

    document.title = title
    if (descriptionMeta) descriptionMeta.content = description

    if (!canonical) {
      canonical = document.createElement('link')
      canonical.rel = 'canonical'
      document.head.appendChild(canonical)
    }
    canonical.href = `https://encorebiolabs.com/products/${product?.slug ?? slug}`

    return () => {
      document.title = previousTitle
      if (descriptionMeta && previousDescription !== undefined) descriptionMeta.content = previousDescription
      if (createdCanonical) canonical?.remove()
    }
  }, [product, slug])

  if (!product) {
    return (
      <main id="main-content" className="bg-[#F8FAFC] px-5 py-20 sm:px-8">
        <div className="mx-auto max-w-3xl rounded-[2rem] border border-slate-900/10 bg-white p-8 text-center shadow-[0_24px_80px_rgba(7,23,36,0.08)]">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-700">
            Product not found
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-[#071724]">
            This product page is not available.
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-600">
            Return to the Encore Bio Labs catalog to continue exploring research-use entries.
          </p>
          <a
            href="/catalog"
            className="mt-7 inline-flex rounded-full bg-[#071724] px-5 py-3 text-sm font-semibold text-white"
          >
            Back to catalog
          </a>
        </div>
      </main>
    )
  }

  return (
    <main id="main-content" className="bg-[#F8FAFC]">
      <ProductBreadcrumb product={product} />
      <ProductHero product={product} />
      <ProductCompleteKitCallout product={product} />
      <ProductBenefits product={product} />
      <ProductHowItWorksFlow product={product} />
      <ProductSpecs product={product} />
      <ProductQualityFocus product={product} />
      <FAQSection product={product} />
      <RelatedProducts product={product} />
      <FinalPurchaseCTA product={product} />
      <ResearchUseDisclaimer product={product} />
    </main>
  )
}
