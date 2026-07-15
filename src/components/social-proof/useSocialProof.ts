import { useEffect, useState } from 'react'
import { getPublishedTestimonials, getPublishedTransformations } from '../../lib/socialProof/provider'
import type { PagePlacement, PublishedTestimonial, PublishedTransformation } from '../../data/socialProof/types'

/**
 * Loads publishable records for a section. Returns an empty array both while
 * loading and when there is nothing approved, so a section can simply render
 * nothing (no skeletons, no "coming soon", no reserved space) until real,
 * approved content exists.
 */
export function useTestimonials(): PublishedTestimonial[] {
  const [items, setItems] = useState<PublishedTestimonial[]>([])
  useEffect(() => {
    let active = true
    getPublishedTestimonials().then((records) => {
      if (active) setItems(records)
    })
    return () => {
      active = false
    }
  }, [])
  return items
}

export function useTransformations(placement: PagePlacement): PublishedTransformation[] {
  const [items, setItems] = useState<PublishedTransformation[]>([])
  useEffect(() => {
    let active = true
    getPublishedTransformations(placement).then((records) => {
      if (active) setItems(records)
    })
    return () => {
      active = false
    }
  }, [placement])
  return items
}
