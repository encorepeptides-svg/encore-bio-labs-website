import { products } from '../data/products'
import { supabase } from './supabaseClient'

export type InventoryMovementType = 'initial_count' | 'receive' | 'manual_sale' | 'reserve' | 'release' | 'fulfillment' | 'damaged' | 'lost' | 'sample' | 'return' | 'correction'
export type PublicStockStatus = 'in_stock' | 'limited' | 'out_of_stock' | 'inactive' | 'unknown'

export type InventoryRow = {
  id: string; sku: string; variation_name_en: string; variation_name_es: string; strength: number | null; unit_type: string | null
  price_cents: number; cost_cents: number | null; on_hand: number; reserved: number; low_stock_threshold: number; reorder_quantity: number
  allow_backorder: boolean; active: boolean; updated_at: string
  inventory_products: { catalog_slug: string; name_en: string; name_es: string; category: string; image_path: string | null; active: boolean }
}

export type InventoryMovement = {
  id: string; created_at: string; variant_id: string; movement_type: InventoryMovementType
  quantity_change_on_hand: number; quantity_change_reserved: number; previous_on_hand: number; new_on_hand: number
  previous_reserved: number; new_reserved: number; balance_available_after: number; reason: string; notes: string | null
  reference_type: string | null; reference_id: string | null; created_by: string; administrator_label: string
  inventory_variants: { sku: string; variation_name_en: string; variation_name_es: string; inventory_products: { name_en: string; name_es: string } }
}

export function availableQuantity(row: Pick<InventoryRow, 'on_hand' | 'reserved'>) { return row.on_hand - row.reserved }

export function inventoryStatus(row: Pick<InventoryRow, 'on_hand' | 'reserved' | 'low_stock_threshold' | 'active'>): PublicStockStatus {
  if (!row.active) return 'inactive'
  const available = availableQuantity(row)
  if (available <= 0) return 'out_of_stock'
  return available <= row.low_stock_threshold ? 'limited' : 'in_stock'
}

export function previewInventory(row: Pick<InventoryRow, 'on_hand' | 'reserved'>, type: InventoryMovementType, quantity: number) {
  let onHand = row.on_hand
  let reserved = row.reserved
  if (type === 'initial_count') onHand = quantity
  else if (type === 'receive' || type === 'return') onHand += quantity
  else if (['manual_sale', 'damaged', 'lost', 'sample'].includes(type)) onHand -= quantity
  else if (type === 'reserve') reserved += quantity
  else if (type === 'release') reserved -= quantity
  else if (type === 'fulfillment') { onHand -= quantity; reserved -= quantity }
  else if (type === 'correction') onHand += quantity
  return { onHand, reserved, available: onHand - reserved }
}

function client() { if (!supabase) throw new Error('inventory_not_configured'); return supabase }

export function inventoryCatalogPayload() {
  return products.map((product) => ({
    slug: product.slug, name_en: product.name, name_es: product.name, category: product.category, image_path: product.image, active: product.stockStatus !== 'Unavailable',
    variants: product.variants.map((variant) => ({ sku: variant.sku!, name_en: variant.label, name_es: variant.label, strength: variant.strength, unit_type: variant.unitType, price_cents: Math.round(variant.price * 100), active: variant.price > 0 })),
  }))
}

export async function syncAndFetchInventory(): Promise<InventoryRow[]> {
  const db = client()
  const { error: syncError } = await db.rpc('sync_inventory_catalog', { p_products: inventoryCatalogPayload() })
  if (syncError) throw syncError
  const { data, error } = await db.from('inventory_variants').select('*,inventory_products!inner(catalog_slug,name_en,name_es,category,image_path,active)').order('sku')
  if (error) throw error
  return (data ?? []) as unknown as InventoryRow[]
}

export async function fetchInventoryMovements(): Promise<InventoryMovement[]> {
  const { data, error } = await client().from('inventory_movements').select('*,inventory_variants!inner(sku,variation_name_en,variation_name_es,inventory_products!inner(name_en,name_es))').order('created_at', { ascending: false }).limit(500)
  if (error) throw error
  return (data ?? []) as unknown as InventoryMovement[]
}

export async function adjustInventory(input: { variantId: string; type: InventoryMovementType; quantity: number; reason: string; notes?: string; referenceType?: string; referenceId?: string; idempotencyKey: string }) {
  const { data, error } = await client().rpc('inventory_adjust', { p_variant_id: input.variantId, p_movement_type: input.type, p_quantity: input.quantity, p_reason: input.reason, p_notes: input.notes || null, p_reference_type: input.referenceType || null, p_reference_id: input.referenceId || null, p_idempotency_key: input.idempotencyKey })
  if (error) throw error
  return data as InventoryRow
}

export async function updateInventorySettings(input: { variantIds: string[]; lowStockThreshold: number; reorderQuantity: number; allowBackorder: boolean; active: boolean }) {
  const { error } = await client().rpc('inventory_update_settings', { p_variant_ids: input.variantIds, p_low_stock_threshold: input.lowStockThreshold, p_reorder_quantity: input.reorderQuantity, p_allow_backorder: input.allowBackorder, p_active: input.active })
  if (error) throw error
}

export async function recordManualOrder(input: { orderNumber: string; customerName: string; salesChannel: string; status: 'confirmed' | 'immediate_sale'; notes: string; items: { variantId: string; quantity: number }[] }) {
  const { data, error } = await client().rpc('inventory_record_manual_order', { p_order_number: input.orderNumber, p_customer_name: input.customerName, p_sales_channel: input.salesChannel, p_status: input.status, p_notes: input.notes, p_items: input.items.map((item) => ({ variant_id: item.variantId, quantity: item.quantity })) })
  if (error) throw error
  return data as string
}

export async function fetchPublicInventoryStatuses(skus: string[]): Promise<Record<string, PublicStockStatus>> {
  if (!supabase || !skus.length) return {}
  const { data, error } = await supabase.rpc('public_inventory_status', { p_skus: skus })
  if (error) throw error
  return Object.fromEntries(((data ?? []) as { sku: string; status: PublicStockStatus }[]).map((entry) => [entry.sku, entry.status]))
}

export function publicStatusLabel(status: PublicStockStatus, locale: 'en' | 'es') {
  const labels = { en: { in_stock: 'In Stock', limited: 'Limited Availability', out_of_stock: 'Out of Stock', inactive: 'Out of Stock', unknown: 'Availability by request' }, es: { in_stock: 'Disponible', limited: 'Disponibilidad limitada', out_of_stock: 'Agotado', inactive: 'Agotado', unknown: 'Disponibilidad bajo solicitud' } } as const
  return labels[locale][status]
}
