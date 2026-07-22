import { Globe } from 'lucide-react'
import { useLocale, useTranslation } from '../i18n/LocaleContext'
import { cn } from '../lib/utils'

type LanguageSelectorProps = {
  variant?: 'nav' | 'mobile' | 'footer' | 'compact'
  className?: string
}

/**
 * Visible EN | ES selector. Text-based (not flag icons), keyboard accessible,
 * with a clear focus ring and a non-color-only "current language" signal
 * (aria-current + font weight).
 */
export function LanguageSelector({ variant = 'nav', className }: LanguageSelectorProps) {
  const { locale, setLocale } = useLocale()
  const { t } = useTranslation('languageSwitcher')

  // Compact single-tap toggle for the persistent mobile header: a globe + the
  // current language code that flips to the other locale (only two languages).
  if (variant === 'compact') {
    const nextLocale = locale === 'en' ? 'es' : 'en'
    return (
      <button
        type="button"
        onClick={() => setLocale(nextLocale)}
        aria-label={t(locale === 'en' ? 'switchToSpanish' : 'switchToEnglish')}
        className={cn(
          'inline-flex h-11 shrink-0 items-center gap-1.5 rounded-full border border-slate-900/10 bg-white/70 px-3 text-[#071724] shadow-sm backdrop-blur-xl transition hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500',
          className,
        )}
      >
        <Globe size={17} aria-hidden="true" />
        <span className="text-xs font-bold uppercase tracking-wide">{locale}</span>
      </button>
    )
  }

  const sizeClasses = variant === 'nav'
    ? 'text-sm'
    : variant === 'footer'
      ? 'text-sm'
      : 'text-base'

  return (
    <div
      role="group"
      aria-label={t('currentLanguage')}
      className={cn('inline-flex items-center gap-1 rounded-full border border-slate-900/10 bg-white/70 p-1', sizeClasses, className)}
    >
      <button
        type="button"
        onClick={() => setLocale('en')}
        aria-current={locale === 'en' ? 'true' : undefined}
        aria-label={t('switchToEnglish')}
        className={cn(
          'rounded-full px-3 py-1.5 font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-1',
          locale === 'en' ? 'bg-[#071724] text-white' : 'text-slate-500 hover:text-[#071724]',
        )}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLocale('es')}
        aria-current={locale === 'es' ? 'true' : undefined}
        aria-label={t('switchToSpanish')}
        className={cn(
          'rounded-full px-3 py-1.5 font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-1',
          locale === 'es' ? 'bg-[#071724] text-white' : 'text-slate-500 hover:text-[#071724]',
        )}
      >
        ES
      </button>
    </div>
  )
}
