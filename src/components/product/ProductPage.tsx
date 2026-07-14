import { useEffect } from 'react'
import { products } from '../../data/products'
import { getLocalizedProduct } from '../../data/productTranslations'
import { useLocale } from '../../i18n/LocaleContext'
import { applyDocumentMetadata } from '../../i18n/applyMetadata'
import {
  FinalPurchaseCTA,
  ProductBreadcrumb,
  ProductHero,
  ProductBenefits,
  ProductHowItWorksFlow,
  ProductDocumentationRow,
  ProductFaqInvitation,
  ProductSpecs,
  RelatedProducts,
  ResearchUseDisclaimer,
} from './ProductPageSections'
import { RetatrutideProductPage } from './RetatrutideProductPage'
import { getProductResearchContent } from '../../data/productResearchContent'
import { ProductResearchExperience } from './ProductResearchExperience'

function findProductBySlug(slug: string) {
  try {
    return products.find((productEntry) => productEntry.slug === slug) ?? null
  } catch {
    return null
  }
}

const titleSuffix = { en: 'Research Product | Encore Bio Labs', es: 'Producto de Investigación | Encore Bio Labs' }
const notFoundTitle = { en: 'Product Not Found | Encore Bio Labs', es: 'Producto no encontrado | Encore Bio Labs' }
const notFoundDescription = { en: 'The requested Encore Bio Labs research product is not available.', es: 'El producto de investigación de Encore Bio Labs solicitado no está disponible.' }

export function ProductPage({ slug }: { slug: string }) {
  const { locale, path } = useLocale()
  const baseProduct = findProductBySlug(slug)
  const product = baseProduct ? getLocalizedProduct(baseProduct, locale) : null
  const researchContent = product ? getProductResearchContent(product.slug) : undefined

  useEffect(() => {
    const title = product ? `${product.name} ${titleSuffix[locale]}` : notFoundTitle[locale]
    const description = product
      ? product.shortDescription || product.description
      : notFoundDescription[locale]
    applyDocumentMetadata(`/products/${product?.slug ?? slug}`, locale, { title, description })
  }, [locale, product, slug])

  if (!product) {
    return (
      <main id="main-content" className="bg-[#F8FAFC] px-5 py-20 sm:px-8">
        <div className="mx-auto max-w-3xl rounded-[2rem] border border-slate-900/10 bg-white p-8 text-center shadow-[0_24px_80px_rgba(7,23,36,0.08)]">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-700">
            {locale === 'es' ? 'Producto no encontrado' : 'Product not found'}
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-[#071724]">
            {locale === 'es' ? 'Esta página de producto no está disponible.' : 'This product page is not available.'}
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-600">
            {locale === 'es'
              ? 'Vuelve al catálogo de Encore Bio Labs para seguir explorando productos de uso exclusivo para investigación.'
              : 'Return to the Encore Bio Labs catalog to continue exploring research-use entries.'}
          </p>
          <a
            href={path('/catalog')}
            className="mt-7 inline-flex rounded-full bg-[#071724] px-5 py-3 text-sm font-semibold text-white"
          >
            {locale === 'es' ? 'Volver al catálogo' : 'Back to catalog'}
          </a>
        </div>
      </main>
    )
  }

  if (product.slug === 'retatrutide') {
    return <RetatrutideProductPage product={product} />
  }

  return (
    <main id="main-content" className="bg-[#F8FAFC]">
      <ProductBreadcrumb product={product} />
      <ProductHero product={product} researchContent={researchContent} />
      {researchContent ? <ProductResearchExperience product={product} content={researchContent} /> : <><ProductBenefits product={product} /><ProductHowItWorksFlow product={product} /></>}
      <ProductDocumentationRow />
      <ProductSpecs product={product} />
      <RelatedProducts product={product} />
      <ProductFaqInvitation product={product} />
      <FinalPurchaseCTA product={product} />
      <ResearchUseDisclaimer product={product} />
    </main>
  )
}
