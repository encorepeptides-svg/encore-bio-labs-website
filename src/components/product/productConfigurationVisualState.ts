import type { PurchaseSelection } from '../../lib/purchaseOptions'

export function getPurchaseVisualDetails(selection: PurchaseSelection) {
  return {
    vialCount: selection.optionId === 'multipack' ? Math.max(1, selection.packSize) : 1,
    includesKit: selection.optionId === 'complete-kit' || (selection.optionId === 'multipack' && selection.includeKit),
  }
}
