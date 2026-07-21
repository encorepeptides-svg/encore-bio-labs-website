import { useEffect, useState } from 'react'
import { fetchPublicInventoryStatuses, type PublicStockStatus } from '../lib/inventory'

export function usePublicInventory(skus: string[]) {
  const [statuses, setStatuses] = useState<Record<string, PublicStockStatus>>({})
  const [loading, setLoading] = useState(true)
  const key = skus.join('|')
  useEffect(() => {
    let active = true
    setLoading(true)
    fetchPublicInventoryStatuses(skus).then((value) => { if (active) setStatuses(value) }).catch(() => { if (active) setStatuses({}) }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])
  return { statuses, loading }
}
