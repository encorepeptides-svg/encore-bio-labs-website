import { products } from '../../data/products'
import {
  CTASection,
  FAQSection,
  PremiumVisualBreak,
  ProductHero,
  ProductBenefits,
  ProductDifferentiator,
  ProductGallery,
  ProductHowItWorksFlow,
  ProductMechanism,
  ProductHighlights,
  ProductOverview,
  ProductQualityFocus,
  ProductResearchLinks,
  ProductInternalLinks,
  ProductScience,
  ProductSpecs,
  ProductTrustStrip,
  RetatrutideClinicalResearchSection,
  RetatrutideHeroSection,
  ReconstitutionGuide,
  RelatedProducts,
  ResearchUseDisclaimer,
  SuggestedResearchProtocol,
  VisualBiology,
  WhatIsProduct,
  WhatsIncluded,
  WhoMayBenefit,
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
      {product.slug === 'retatrutide' ? (
        <>
          <RetatrutideHeroSection product={product} />
          <RetatrutideClinicalResearchSection product={product} />
          <ProductOverview product={product} />
          <ProductHighlights product={product} />
          <ResearchUseDisclaimer product={product} />
          <ProductSpecs product={product} />
          <SuggestedResearchProtocol product={product} />
          <ReconstitutionGuide product={product} />
          <FAQSection product={product} />
          <ProductInternalLinks product={product} />
          <RelatedProducts product={product} />
          <CTASection product={product} />
        </>
      ) : (
        <>
          <ProductHero product={product} />
          <ProductTrustStrip />
          <WhatIsProduct product={product} />
          <ProductBenefits product={product} />
          <PremiumVisualBreak product={product} />
          <ProductMechanism product={product} />
          <WhatsIncluded product={product} />
          <ProductQualityFocus product={product} />
          <ProductHowItWorksFlow />
          <ProductSpecs product={product} />
          <ProductScience product={product} />
          <VisualBiology product={product} />
          <WhoMayBenefit product={product} />
          <ProductDifferentiator product={product} />
          <ProductGallery product={product} />
          <ResearchUseDisclaimer product={product} />
          <FAQSection product={product} />
          <ProductResearchLinks product={product} />
          <ProductInternalLinks product={product} />
          <RelatedProducts product={product} />
          <CTASection product={product} />
        </>
      )}
    </main>
  )
}
