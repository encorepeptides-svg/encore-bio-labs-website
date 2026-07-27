import { SITE_ENTRY_ACKNOWLEDGMENT_VERSION } from '../data/acknowledgmentContent'
import type { Locale } from '../i18n/config'

export const SITE_ENTRY_ACKNOWLEDGMENT_STORAGE_KEY = 'encore.site-entry-acknowledgment'
export const SITE_ENTRY_ACKNOWLEDGMENT_DURATION_MS = 30 * 24 * 60 * 60 * 1000

export type SiteEntryAcknowledgmentRecord = {
  accepted: true
  version: typeof SITE_ENTRY_ACKNOWLEDGMENT_VERSION
  acceptedAt: string
  locale: Locale
}

type StorageTarget = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

function getBrowserStorage(kind: 'localStorage' | 'sessionStorage'): StorageTarget | undefined {
  if (typeof window === 'undefined') return undefined
  try {
    return window[kind]
  } catch {
    return undefined
  }
}

export function createSiteEntryAcknowledgmentRecord(
  locale: Locale,
  acceptedAt = new Date().toISOString(),
): SiteEntryAcknowledgmentRecord {
  return {
    accepted: true,
    version: SITE_ENTRY_ACKNOWLEDGMENT_VERSION,
    acceptedAt,
    locale,
  }
}

export function isSiteEntryAcknowledgmentValid(
  value: unknown,
  now = Date.now(),
): value is SiteEntryAcknowledgmentRecord {
  if (!value || typeof value !== 'object') return false
  const record = value as Partial<SiteEntryAcknowledgmentRecord>
  const acceptedAt = typeof record.acceptedAt === 'string' ? Date.parse(record.acceptedAt) : Number.NaN
  return record.accepted === true
    && record.version === SITE_ENTRY_ACKNOWLEDGMENT_VERSION
    && (record.locale === 'en' || record.locale === 'es')
    && Number.isFinite(acceptedAt)
    && acceptedAt <= now
    && now - acceptedAt < SITE_ENTRY_ACKNOWLEDGMENT_DURATION_MS
}

function readFromStorage(storage: StorageTarget | undefined, now: number) {
  if (!storage) return null
  try {
    const raw = storage.getItem(SITE_ENTRY_ACKNOWLEDGMENT_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as unknown
    if (isSiteEntryAcknowledgmentValid(parsed, now)) return parsed
    storage.removeItem(SITE_ENTRY_ACKNOWLEDGMENT_STORAGE_KEY)
  } catch {
    // Storage can be blocked by browser privacy settings.
  }
  return null
}

export function readSiteEntryAcknowledgment(
  now = Date.now(),
  localStorageTarget = getBrowserStorage('localStorage'),
  sessionStorageTarget = getBrowserStorage('sessionStorage'),
) {
  return readFromStorage(localStorageTarget, now) ?? readFromStorage(sessionStorageTarget, now)
}

export function storeSiteEntryAcknowledgment(
  record: SiteEntryAcknowledgmentRecord,
  localStorageTarget = getBrowserStorage('localStorage'),
  sessionStorageTarget = getBrowserStorage('sessionStorage'),
): 'local' | 'session' | 'memory' {
  const serialized = JSON.stringify(record)
  if (localStorageTarget) {
    try {
      localStorageTarget.setItem(SITE_ENTRY_ACKNOWLEDGMENT_STORAGE_KEY, serialized)
      if (localStorageTarget.getItem(SITE_ENTRY_ACKNOWLEDGMENT_STORAGE_KEY) === serialized) return 'local'
    } catch {
      // Fall through to session-only storage.
    }
  }
  if (sessionStorageTarget) {
    try {
      sessionStorageTarget.setItem(SITE_ENTRY_ACKNOWLEDGMENT_STORAGE_KEY, serialized)
      if (sessionStorageTarget.getItem(SITE_ENTRY_ACKNOWLEDGMENT_STORAGE_KEY) === serialized) return 'session'
    } catch {
      // React state still grants access for the current page lifetime.
    }
  }
  return 'memory'
}
