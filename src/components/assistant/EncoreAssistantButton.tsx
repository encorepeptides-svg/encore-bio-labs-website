import { Sparkles } from 'lucide-react'
import { useTranslation } from '../../i18n/LocaleContext'

export function EncoreAssistantButton({ onClick }: { onClick: () => void }) {
  const { t } = useTranslation('assistant')
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={t('buttonLabel')}
      className="group fixed bottom-24 right-4 z-[70] flex h-14 items-center gap-2.5 rounded-full border border-white/60 bg-white/75 py-2 pl-2.5 pr-5 text-sm font-semibold text-[var(--navy)] shadow-[0_18px_50px_rgba(26,35,64,0.18)] backdrop-blur-2xl transition duration-300 hover:-translate-y-1 hover:bg-white md:bottom-6 md:right-6"
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-[0_8px_20px_rgba(46,196,165,0.4)] transition duration-300 group-hover:scale-105">
        <Sparkles size={16} aria-hidden="true" />
      </span>
      {t('buttonLabel')}
    </button>
  )
}
