import type { Product } from '../../data/products'
import type { ProductConversionContent } from '../../data/productConversionContent'
import { ProductConversionFinalCta, ProductFocusedFaq } from './ProductConversionFinish'
import { ProductConversionHero } from './ProductConversionHero'
import { ProductEvidenceSnapshot, ProductInterestSection, ProductResearchOverview } from './ProductEvidenceExperience'
import { ProductCompleteKitValue, ProductDocumentationAndTrust, ProductFormatsSection } from './ProductFormatsAndDocumentation'
import { ProductBreadcrumb, RelatedProducts } from './ProductPageSections'
import { ProductPurchaseExperience } from './ProductPurchaseExperience'
import { ProductResearchSpotlight } from './ProductResearchSpotlight'

type LocalizedConversionContent = ProductConversionContent & {
  localeContent: ProductConversionContent['locales']['en']
}

export function ProductConversionPage({
  product,
  content,
}: {
  product: Product
  content: LocalizedConversionContent
}) {
  const copy = content.localeContent

  return (
    <main
      id="main-content"
      className="bg-[#f4f7f6]"
      data-product-visual-system={product.slug === 'retatrutide' ? 'retatrutide-original' : 'nad-clean-pharma'}
    >
      <ProductBreadcrumb product={product} tone={product.slug === 'retatrutide' ? 'dark' : 'light'} />
      <ProductConversionHero product={product} content={content} />
      <ProductPurchaseExperience key={product.slug} product={product} copy={copy} />
      {product.slug === 'retatrutide'
        ? <ProductInterestSection copy={copy} />
        : <ProductResearchSpotlight product={product} copy={copy} />}
      <ProductEvidenceSnapshot copy={copy} tone={content.evidenceTone} />
      <ProductCompleteKitValue product={product} copy={copy} />
      <ProductResearchOverview copy={copy} />
      <ProductFormatsSection product={product} copy={copy} />
      <ProductDocumentationAndTrust copy={copy} />
      <RelatedProducts product={product} />
      <ProductFocusedFaq product={product} copy={copy} />
      <ProductConversionFinalCta product={product} copy={copy} />
    </main>
  )
}
