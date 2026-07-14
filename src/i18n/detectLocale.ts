import { DEFAULT_LOCALE, isSpanishLanguageTag, LATAM_TIMEZONES, LOCALE_STORAGE_KEY, type Locale } from './config'

export function readSavedLocale(): Locale | null {
  if (typeof window === 'undefined') return null
  try {
    const saved = window.localStorage.getItem(LOCALE_STORAGE_KEY)
    return saved === 'en' || saved === 'es' ? saved : null
  } catch {
    return null
  }
}

export function saveLocale(locale: Locale) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale)
  } catch {
    // Storage unavailable (private browsing, etc.) — fail silently, locale still works for this session.
  }
}

export function browserPrefersSpanish(): boolean {
  if (typeof navigator === 'undefined') return false
  const tags = [...(navigator.languages ?? []), navigator.language].filter(Boolean) as string[]
  return tags.some(isSpanishLanguageTag)
}

/** Coarse, privacy-safe LATAM signal from the browser's own timezone — no IP geolocation call. */
export function looksLikeLatamVisitor(): boolean {
  if (typeof Intl === 'undefined') return false
  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    return LATAM_TIMEZONES.has(timezone)
  } catch {
    return false
  }
}

/**
 * Resolves the locale to use for a "bare" (unprefixed) path: saved preference,
 * then Spanish browser language, then English. LATAM timezone detection is
 * intentionally excluded here — it only ever powers a dismissible suggestion,
 * never an automatic switch or redirect.
 */
export function resolveBarePathLocale(): Locale {
  const saved = readSavedLocale()
  if (saved) return saved
  if (browserPrefersSpanish()) return 'es'
  return DEFAULT_LOCALE
}
