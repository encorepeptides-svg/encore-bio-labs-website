/**
 * Public social profiles.
 *
 * Every entry here is rendered in the footer AND published in the site's
 * schema.org `sameAs` list, which is what tells search engines these accounts
 * and encorebiolabs.com are one entity. Only add a profile that is genuinely
 * active — a link to a stale profile costs more trust than it earns, and
 * `sameAs` pointing at a dead account weakens the entity signal rather than
 * strengthening it.
 */
export type SocialProfile = {
  id: 'instagram' | 'facebook' | 'tiktok'
  href: string
  handle: string
}

export const SOCIAL_PROFILES: readonly SocialProfile[] = [
  { id: 'instagram', href: 'https://www.instagram.com/encorebiolabs', handle: '@encorebiolabs' },
  { id: 'facebook', href: 'https://www.facebook.com/EncoreBioLabs', handle: 'EncoreBioLabs' },
  { id: 'tiktok', href: 'https://www.tiktok.com/@encore_peptidos', handle: '@encore_peptidos' },
] as const
