import { products } from '../../data/products'
import { stripLocalePrefix } from '../../i18n/config'

export function getCurrentProductName(pathname: string) {
  const { path } = stripLocalePrefix(pathname)
  const match = path.match(/^\/products\/([^/]+)\/?$/)
  if (!match) return undefined
  return products.find((product) => product.slug === match[1])?.name
}
