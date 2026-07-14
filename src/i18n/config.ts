export type Locale = 'en' | 'es'

export const LOCALES: Locale[] = ['en', 'es']
export const DEFAULT_LOCALE: Locale = 'en'
export const LOCALE_PREFIX: Record<Locale, string> = { en: '', es: '/es' }

export const LOCALE_STORAGE_KEY = 'encore.locale'
export const LATAM_BANNER_DISMISSED_KEY = 'encore.latamSuggestionDismissed'

export const SITE_ORIGIN = 'https://encorebiolabs.com'

/**
 * ISO 3166-1 alpha-2 codes for Latin America + Spanish-relevant Caribbean
 * territories. Used only to decide whether to *suggest* Spanish, never to
 * force it — geolocation here is the coarse, privacy-safe Accept-Language /
 * Intl.DateTimeFormat timezone signal, not an IP lookup service.
 */
export const LATAM_COUNTRY_CODES = new Set([
  'MX', 'GT', 'BZ', 'SV', 'HN', 'NI', 'CR', 'PA',
  'CO', 'VE', 'EC', 'PE', 'BO', 'CL', 'AR', 'PY', 'UY',
  'BR', 'CU', 'DO', 'PR', 'HT',
])

/** IANA timezones that map to a LATAM country, used as a geolocation-API-free proxy signal. */
export const LATAM_TIMEZONES = new Set([
  'America/Mexico_City', 'America/Tijuana', 'America/Monterrey', 'America/Merida', 'America/Chihuahua',
  'America/Ciudad_Juarez', 'America/Cancun', 'America/Hermosillo', 'America/Matamoros', 'America/Mazatlan',
  'America/Guatemala', 'America/Belize', 'America/El_Salvador', 'America/Tegucigalpa', 'America/Managua',
  'America/Costa_Rica', 'America/Panama', 'America/Bogota', 'America/Caracas', 'America/Guayaquil',
  'America/Lima', 'America/La_Paz', 'America/Santiago', 'America/Argentina/Buenos_Aires', 'America/Asuncion',
  'America/Montevideo', 'America/Sao_Paulo', 'America/Havana', 'America/Santo_Domingo', 'America/Puerto_Rico',
  'America/Port-au-Prince',
])

export function isSpanishLanguageTag(tag: string) {
  return /^es(-|$)/i.test(tag)
}

/** Strips a leading /es prefix, returning the "logical" (locale-agnostic) path used by App.tsx's router. */
export function stripLocalePrefix(pathname: string): { locale: Locale; path: string } {
  if (pathname === '/es' || pathname.startsWith('/es/')) {
    const rest = pathname.slice(3)
    return { locale: 'es', path: rest === '' ? '/' : rest }
  }
  return { locale: 'en', path: pathname }
}

/** Builds the correct href for a logical path under the given locale. Leaves external/hash/mailto/tel links untouched. */
export function localizePath(path: string, locale: Locale): string {
  if (/^([a-z]+:)?\/\//i.test(path) || path.startsWith('#') || path.startsWith('mailto:') || path.startsWith('tel:')) {
    return path
  }
  const [logicalPath, hash] = path.split('#')
  const normalized = logicalPath === '' ? '/' : logicalPath
  const base = locale === 'en' ? normalized : normalized === '/' ? '/es' : `/es${normalized}`
  return hash ? `${base}#${hash}` : base
}
