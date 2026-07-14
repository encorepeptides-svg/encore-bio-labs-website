import { useLocale, useTranslation } from '../../i18n/LocaleContext'
import { EncoreCompleteKit } from '../EncoreCompleteKit'

export function KitsPage() {
  const { path } = useLocale()
  const { t } = useTranslation('kit')

  return (
    <main id="main-content" className="bg-[#f5f5f2]">
      <div className="px-5 pt-6 sm:px-8">
        <div className="mx-auto flex max-w-[88rem] items-center gap-2 text-sm text-slate-500">
          <a href={path('/')} className="font-medium transition hover:text-[#071724]">
            {t('home')}
          </a>
          <span aria-hidden="true">/</span>
          <span className="font-semibold text-[#071724]">{t('breadcrumb')}</span>
        </div>
      </div>

      <div className="px-5 py-10 sm:px-8 lg:py-14">
        <div className="mx-auto max-w-[88rem]">
          <EncoreCompleteKit variant="full" />
        </div>
      </div>
    </main>
  )
}
