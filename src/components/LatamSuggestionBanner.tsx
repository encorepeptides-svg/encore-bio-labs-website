import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { LATAM_BANNER_DISMISSED_KEY } from '../i18n/config'
import { browserPrefersSpanish, looksLikeLatamVisitor, readSavedLocale } from '../i18n/detectLocale'
import { useLocale, useTranslation } from '../i18n/LocaleContext'

function readDismissed() {
  if (typeof window === 'undefined') return true
  try {
    return window.localStorage.getItem(LATAM_BANNER_DISMISSED_KEY) === 'true'
  } catch {
    return true
  }
}

function markDismissed() {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(LATAM_BANNER_DISMISSED_KEY, 'true')
  } catch {
    // Storage unavailable — banner just won't persist dismissal for this visitor, which is a safe failure mode.
  }
}

/**
 * Tasteful, dismissible suggestion shown only when: we're rendering English,
 * the visitor's browser isn't already set to Spanish (they'd have been
 * auto-served /es already), a coarse timezone signal suggests LATAM, and
 * they haven't dismissed it before. Never auto-switches on its own.
 */
export function LatamSuggestionBanner() {
  const { locale, setLocale } = useLocale()
  const { t } = useTranslation('languageSwitcher')
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (locale !== 'en') return
    if (readDismissed()) return
    if (readSavedLocale()) return
    if (browserPrefersSpanish()) return
    if (!looksLikeLatamVisitor()) return
    setVisible(true)
  }, [locale])

  function dismiss() {
    markDismissed()
    setVisible(false)
  }

  function switchToSpanish() {
    markDismissed()
    setLocale('es')
  }

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          role="region"
          aria-label={t('latamQuestion')}
          className="relative z-40 border-b border-teal-700/15 bg-[#eefaf7] px-5 py-3 sm:px-8"
        >
          <div className="mx-auto flex max-w-[88rem] flex-col items-center justify-center gap-3 text-center sm:flex-row sm:text-left">
            <p className="text-sm font-medium text-[#071724]">{t('latamQuestion')}</p>
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={switchToSpanish}
                className="inline-flex min-h-9 items-center justify-center rounded-full bg-[#071724] px-4 text-xs font-semibold text-white transition hover:bg-teal-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-1"
              >
                {t('latamSwitchButton')}
              </button>
              <button
                type="button"
                onClick={dismiss}
                className="inline-flex min-h-9 items-center justify-center rounded-full border border-slate-900/15 bg-white px-4 text-xs font-semibold text-slate-600 transition hover:text-[#071724] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-1"
              >
                {t('latamContinueButton')}
              </button>
              <button
                type="button"
                onClick={dismiss}
                aria-label={t('latamDismiss')}
                className="inline-flex size-9 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-white hover:text-[#071724] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-1"
              >
                <X size={16} aria-hidden="true" />
              </button>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
