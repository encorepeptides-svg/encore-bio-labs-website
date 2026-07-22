import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react'
import { localizePath, type Locale } from './config'
import { saveLocale } from './detectLocale'
import { translate } from './translate'

type LocaleContextValue = {
  locale: Locale
  setLocale: (next: Locale) => void
  /** Builds a locale-correct href for an internal path (e.g. "/catalog" -> "/es/catalog" in Spanish). */
  path: (logicalPath: string) => string
}

const LocaleContext = createContext<LocaleContextValue | null>(null)

type LocaleProviderProps = {
  locale: Locale
  /** The current logical (locale-agnostic) path, e.g. "/products/retatrutide". */
  logicalPath: string
  children: ReactNode
}

export function LocaleProvider({ locale, logicalPath, children }: LocaleProviderProps) {
  const setLocale = useCallback(
    (next: Locale) => {
      if (next === locale) return
      saveLocale(next)
      if (typeof window === 'undefined') return
      // Preserve the reader's place across the reload that a locale change triggers:
      // stash the current scroll so App can restore it once the new-language page paints.
      try {
        window.sessionStorage.setItem(
          'encore:locale-switch-scroll',
          JSON.stringify({ path: logicalPath, y: window.scrollY }),
        )
      } catch {
        // sessionStorage unavailable — fall back to a normal (top-of-page) load.
      }
      const targetPath = localizePath(logicalPath, next)
      window.location.assign(`${targetPath}${window.location.search}${window.location.hash}`)
    },
    [locale, logicalPath],
  )

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      setLocale,
      path: (p: string) => localizePath(p, locale),
    }),
    [locale, setLocale],
  )

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
}

export function useLocale() {
  const ctx = useContext(LocaleContext)
  if (!ctx) throw new Error('useLocale must be used within a LocaleProvider')
  return ctx
}

export function useTranslation(namespace: string) {
  const { locale } = useLocale()
  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => translate(locale, namespace, key, vars),
    [locale, namespace],
  )
  return { t, locale }
}
