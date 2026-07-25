import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { LocaleProvider } from '../../i18n/LocaleContext'
import { ProductCardLink } from './ProductCardLink'

describe('ProductCardLink', () => {
  it.each([
    ['en', '/products/retatrutide', 'View Retatrutide product details'],
    ['es', '/es/products/retatrutide', 'Ver detalles del producto Retatrutide'],
  ] as const)('renders one localized semantic card link in %s', (locale, href, label) => {
    const html = renderToStaticMarkup(
      <LocaleProvider locale={locale} logicalPath="/catalog">
        <article className="relative">
          <ProductCardLink href={href} productName="Retatrutide" />
          <button type="button">Add to cart</button>
        </article>
      </LocaleProvider>,
    )

    expect(html.match(/<a /g)).toHaveLength(1)
    expect(html).toContain(`href="${href}"`)
    expect(html).toContain(`aria-label="${label}"`)
    expect(html).toContain('cursor-pointer')
    expect(html).toContain('focus-visible:ring-4')
    expect(html).toContain('<button type="button">Add to cart</button>')
  })
})
