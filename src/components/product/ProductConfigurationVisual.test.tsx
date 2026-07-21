import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { products } from '../../data/products'
import { getLocalizedProduct } from '../../data/productTranslations'
import type { Locale } from '../../i18n/config'
import { LocaleProvider } from '../../i18n/LocaleContext'
import type { PurchaseSelection } from '../../lib/purchaseOptions'
import { ProductConfigurationVisual } from './ProductConfigurationVisual'
import { getPurchaseVisualDetails } from './productConfigurationVisualState'

function getNadProduct(locale: Locale) {
  const product = products.find((entry) => entry.slug === 'nad-plus')
  if (!product) throw new Error('NAD+ is missing')
  return getLocalizedProduct(product, locale)
}

function renderVisual(locale: Locale, selection: PurchaseSelection, strength = '500 mg') {
  const product = getNadProduct(locale)
  const variant = product.variants.find((entry) => entry.label === strength)
  if (!variant) throw new Error(`${strength} NAD+ is missing`)

  return renderToStaticMarkup(
    <LocaleProvider locale={locale} logicalPath="/products/nad-plus">
      <ProductConfigurationVisual product={product} variant={variant} selection={selection} />
    </LocaleProvider>,
  )
}

describe('ProductConfigurationVisual', () => {
  it.each([2, 3, 5])('matches a %i-vial pack without implying accessories', (packSize) => {
    const selection: PurchaseSelection = { optionId: 'multipack', packSize, includeKit: false }
    expect(getPurchaseVisualDetails(selection)).toEqual({ vialCount: packSize, includesKit: false })
    const html = renderVisual('en', selection, '1000 mg')
    expect(html).toContain(`NAD+ 1000 mg, ${packSize}-vial pack: ${packSize} product vials with no accessories.`)
    expect(html).not.toContain('complete-kit-product-hero')
    expect(html).not.toContain('Protective packaging')
  })

  it('shows the exact Complete Kit contents for the selected strength', () => {
    const selection: PurchaseSelection = { optionId: 'complete-kit', packSize: 1, includeKit: true }
    expect(getPurchaseVisualDetails(selection)).toEqual({ vialCount: 1, includesKit: true })
    const html = renderVisual('en', selection)
    expect(html).toContain('complete-kit-product-hero')
    expect(html).toContain('NAD+ 500 mg Complete Kit: one product vial')
    expect(html).toContain('4 sterile 30G syringes')
    expect(html).toContain('6 alcohol prep pads')
    expect(html).toContain('protective packaging')

    const thousandMgHtml = renderVisual('en', selection, '1000 mg')
    expect(thousandMgHtml).toContain('NAD+ · 1000 mg · 1 × vial')
    expect(thousandMgHtml).toContain('complete-kit-product-hero')
  })

  it('provides an accurate Spanish accessible description', () => {
    const html = renderVisual('es', { optionId: 'multipack', packSize: 3, includeKit: true })
    expect(html).toContain('NAD+ 500 mg, paquete de 3 viales más un kit completo')
    expect(html).toContain('4 jeringas estériles 30G')
    expect(html).toContain('6 toallitas con alcohol')
    expect(html).toContain('empaque protector')
  })
})
