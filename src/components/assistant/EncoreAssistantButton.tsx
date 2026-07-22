import { Sparkles } from 'lucide-react'
import { useTranslation } from '../../i18n/LocaleContext'

export function EncoreAssistantButton({ onClick }: { onClick: () => void }) {
  const { t } = useTranslation('assistant')
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={t('buttonLabel')}
      className="group fixed bottom-[8.75rem] right-4 z-[70] flex size-14 items-center justify-center rounded-full border border-white/60 bg-white/75 p-2 text-sm font-semibold text-[var(--navy)] shadow-[0_18px_50px_rgba(26,35,64,0.18)] backdrop-blur-2xl transition duration-300 hover:-translate-y-1 hover:bg-white md:right-6 xl:bottom-24 xl:h-14 xl:w-auto xl:gap-2.5 xl:py-2 xl:pl-2.5 xl:pr-5"
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-[0_8px_20px_rgba(46,196,165,0.4)] transition duration-300 group-hover:scale-105">
        <Sparkles size={16} aria-hidden="true" />
      </span>
      <span className="hidden xl:inline">{t('buttonLabel')}</span>
    </button>
  )
}
