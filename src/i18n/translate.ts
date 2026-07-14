import { en } from '../locales/en'
import { es } from '../locales/es'
import type { Locale } from './config'

const catalogs = { en, es } as const

type Vars = Record<string, string | number>

function interpolate(template: string, vars?: Vars) {
  if (!vars) return template
  return template.replace(/\{(\w+)\}/g, (_, key: string) => (key in vars ? String(vars[key]) : `{${key}}`))
}

const warnedKeys = new Set<string>()

export function translate(locale: Locale, namespace: string, key: string, vars?: Vars): string {
  const enNamespace = (en as Record<string, Record<string, string>>)[namespace]
  const activeNamespace = (catalogs[locale] as Record<string, Record<string, string>>)[namespace]

  const activeValue = activeNamespace?.[key]
  const fallbackValue = enNamespace?.[key]
  const value = activeValue ?? fallbackValue

  if (import.meta.env.DEV) {
    const warnKey = `${locale}.${namespace}.${key}`
    if (value === undefined && !warnedKeys.has(warnKey)) {
      warnedKeys.add(warnKey)
      console.warn(`[i18n] Missing translation key "${namespace}.${key}" (locale: ${locale})`)
    } else if (locale !== 'en' && activeValue === undefined && fallbackValue !== undefined && !warnedKeys.has(warnKey)) {
      warnedKeys.add(warnKey)
      console.warn(`[i18n] Missing "${locale}" translation for "${namespace}.${key}" — using English fallback`)
    }
  }

  return interpolate(value ?? key, vars)
}
