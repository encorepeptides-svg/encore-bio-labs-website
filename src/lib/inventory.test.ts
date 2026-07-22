import { describe, expect, it } from 'vitest'
import { inventoryCatalogPayload, inventoryStatus, previewInventory, publicStatusLabel } from './inventory'

const stock = { on_hand: 10, reserved: 3, low_stock_threshold: 4, active: true }

describe('inventory calculations', () => {
  it('receives, sells, reserves, releases, fulfills, and writes off stock', () => {
    expect(previewInventory(stock, 'receive', 5)).toEqual({ onHand: 15, reserved: 3, available: 12 })
    expect(previewInventory(stock, 'manual_sale', 2)).toEqual({ onHand: 8, reserved: 3, available: 5 })
    expect(previewInventory(stock, 'reserve', 2)).toEqual({ onHand: 10, reserved: 5, available: 5 })
    expect(previewInventory(stock, 'release', 2)).toEqual({ onHand: 10, reserved: 1, available: 9 })
    expect(previewInventory(stock, 'fulfillment', 2)).toEqual({ onHand: 8, reserved: 1, available: 7 })
    expect(previewInventory(stock, 'damaged', 2)).toEqual({ onHand: 8, reserved: 3, available: 5 })
  })
  it('calculates public status and bilingual output', () => {
    expect(inventoryStatus(stock)).toBe('in_stock')
    expect(inventoryStatus({ ...stock, reserved: 7 })).toBe('limited')
    expect(inventoryStatus({ ...stock, reserved: 10 })).toBe('out_of_stock')
    expect(publicStatusLabel('limited', 'en')).toBe('Limited Availability')
    expect(publicStatusLabel('limited', 'es')).toBe('Disponibilidad limitada')
  })
  it('exposes invalid projections for server-side rejection', () => {
    expect(previewInventory(stock, 'reserve', 8).available).toBe(-1)
    expect(previewInventory(stock, 'release', 4).reserved).toBe(-1)
  })
  it('sends independently priced GHK-Cu and NAD+ SKUs to the admin inventory portal', () => {
    const payload = inventoryCatalogPayload()
    const ghkCu = payload.find((product) => product.slug === 'ghk-cu')!
    const nad = payload.find((product) => product.slug === 'nad-plus')!
    expect(ghkCu.variants.map(({ sku, price_cents }) => ({ sku, price_cents }))).toEqual([
      { sku: 'GHK-CU-50MG', price_cents: 5000 },
      { sku: 'GHK-CU-100MG', price_cents: 7000 },
    ])
    expect(nad.variants.map(({ sku, price_cents }) => ({ sku, price_cents }))).toEqual([
      { sku: 'NAD-500MG', price_cents: 6500 },
      { sku: 'NAD-1000MG', price_cents: 9500 },
    ])
  })
})
