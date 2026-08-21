import type { Product } from '../data/products'
import { formatMoney } from './money'

type PriceTranslator = (key: string, vars?: Record<string, string | number>) => string

export function getProductStartingPrice(product: Product) {
  let startingPrice: number | null = null

  for (const variant of product.variants) {
    if (variant.price > 0 && (startingPrice === null || variant.price < startingPrice)) {
      startingPrice = variant.price
    }
  }

  return startingPrice
}

export function getProductStartingPriceLabel(product: Product, t?: PriceTranslator) {
  const startingPrice = getProductStartingPrice(product)

  if (startingPrice === null) return t ? t('quote') : 'Quote'

  const price = formatMoney(startingPrice)
  return t ? t('startingFrom', { price }) : `Starting from ${price}`
}
