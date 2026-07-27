import { ArrowRight, FileCheck2, FileSearch, ShieldCheck } from 'lucide-react'
import { EncoreCompleteKit } from '../EncoreCompleteKit'
import type { Product } from '../../data/products'
import type { ProductConversionLocaleContent } from '../../data/productConversionContent'
import { useLocale, useTranslation } from '../../i18n/LocaleContext'
import { getKitPremium, money } from '../../lib/purchaseOptions'

export function ProductCompleteKitValue({
  product,
  copy,
}: {
  product: Product
  copy: ProductConversionLocaleContent
}) {
  if (!product.purchaseRules.kitEligible) return null

  return (
    <section className="bg-[#f4f7f6] px-5 py-12 sm:px-8 sm:py-16 lg:py-20" aria-labelledby="product-complete-kit-heading">
      <div className="mx-auto max-w-[88rem]">
        <div className="mb-7 max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-teal-700">{copy.kit.eyebrow}</p>
          <h2 id="product-complete-kit-heading" className="mt-3 text-3xl font-semibold tracking-[-0.045em] text-[#071724] sm:text-4xl">{copy.kit.heading}</h2>
          <p className="mt-4 text-base leading-7 text-slate-600">{copy.kit.body}</p>
        </div>
        <EncoreCompleteKit productName={product.name} bacWaterAmount={product.bacWaterAmount} />
      </div>
    </section>
  )
}

export function ProductFormatsSection({
  product,
  copy,
}: {
  product: Product
  copy: ProductConversionLocaleContent
}) {
  const kitPremium = getKitPremium(product)

  return (
    <section className="bg-[#f4f7f6] px-5 py-12 sm:px-8 sm:py-16 lg:py-20" aria-labelledby="product-formats-heading">
      <div className="mx-auto max-w-[88rem]">
        <div className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-teal-700">{copy.formats.eyebrow}</p>
          <h2 id="product-formats-heading" className="mt-3 text-3xl font-semibold tracking-[-0.045em] text-[#071724] sm:text-4xl">{copy.formats.heading}</h2>
          <p className="mt-4 text-base leading-7 text-slate-600">{copy.formats.body}</p>
        </div>

        <div className="mt-7 overflow-hidden rounded-[1.6rem] border border-slate-900/10 bg-white shadow-[0_20px_60px_rgba(7,23,36,0.07)]">
          <div className="hidden grid-cols-[1fr_0.65fr_0.65fr] border-b border-slate-900/10 bg-[#071724] px-6 py-4 text-xs font-bold uppercase tracking-[0.14em] text-slate-300 sm:grid">
            <span>{copy.formats.strengthLabel}</span>
            <span>{copy.formats.vialLabel}</span>
            <span>{copy.formats.kitLabel}</span>
          </div>
          <ul>
            {product.variants.map((variant) => (
              <li key={variant.sku ?? variant.label} className="border-b border-slate-900/10 p-5 last:border-b-0 sm:grid sm:grid-cols-[1fr_0.65fr_0.65fr] sm:items-center sm:px-6">
                <p className="text-base font-semibold text-[#071724]">{variant.label}</p>
                <dl className="mt-4 grid grid-cols-2 gap-4 sm:contents">
                  <div>
                    <dt className="text-[0.68rem] font-bold uppercase tracking-[0.12em] text-slate-400 sm:sr-only">{copy.formats.vialLabel}</dt>
                    <dd className="mt-1 text-base font-semibold text-[#071724] sm:mt-0">{money(variant.price)}</dd>
                  </div>
                  <div>
                    <dt className="text-[0.68rem] font-bold uppercase tracking-[0.12em] text-slate-400 sm:sr-only">{copy.formats.kitLabel}</dt>
                    <dd className="mt-1 text-base font-semibold text-teal-800 sm:mt-0">
                      {product.purchaseRules.kitEligible ? money(variant.price + kitPremium) : copy.formats.kitUnavailableLabel}
                    </dd>
                  </div>
                </dl>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

export function ProductDocumentationAndTrust({ copy }: { copy: ProductConversionLocaleContent }) {
  const { path } = useLocale()
  const { t } = useTranslation('product')

  const links = [
    { href: path('/quality'), label: t('viewDocumentation'), icon: ShieldCheck },
    { href: path('/contact'), label: t('requestBatchInformation'), icon: FileSearch },
  ]

  return (
    <section className="bg-white px-5 py-12 sm:px-8 sm:py-16 lg:py-20" aria-labelledby="product-documentation-heading">
      <div className="mx-auto max-w-[88rem] rounded-[1.8rem] border border-slate-900/10 bg-[linear-gradient(135deg,#f8fcfb,#eef5f4)] p-6 shadow-[0_22px_66px_rgba(7,23,36,0.07)] sm:p-8 lg:p-10">
        <div className="grid gap-7 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="max-w-3xl">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-teal-700"><FileCheck2 size={16} aria-hidden="true" />{copy.documentation.eyebrow}</p>
            <h2 id="product-documentation-heading" className="mt-3 text-3xl font-semibold tracking-[-0.045em] text-[#071724] sm:text-4xl">{copy.documentation.heading}</h2>
            <p className="mt-4 text-base leading-7 text-slate-600">{copy.documentation.body}</p>
            <p className="mt-4 text-sm font-semibold text-teal-900">{t('documentationTrustLine')}</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
            {links.map(({ href, label, icon: Icon }, index) => (
              <a key={href} href={href} className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-teal-700 ${index === 0 ? 'bg-[#071724] text-white hover:bg-teal-800' : 'border border-slate-900/12 bg-white text-[#071724] hover:border-teal-300 hover:bg-teal-50'}`}>
                <Icon size={16} aria-hidden="true" />
                {label}
                <ArrowRight size={15} aria-hidden="true" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
