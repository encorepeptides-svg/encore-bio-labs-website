import { useLocale, useTranslation } from '../i18n/LocaleContext'

export function NotFoundPage() {
  const { path } = useLocale()
  const { t } = useTranslation('notFound')

  return (
    <main id="main-content" className="px-5 py-20 sm:px-8">
      <div className="mx-auto max-w-3xl rounded-[2rem] border border-slate-900/10 bg-white p-8 text-center shadow-[0_24px_80px_rgba(7,23,36,0.08)] sm:p-12">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-700">{t('eyebrow')}</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-[#071724] sm:text-5xl">{t('title')}</h1>
        <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-slate-600">{t('body')}</p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <a href={path('/catalog')} className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#071724] px-6 text-sm font-semibold text-white transition hover:bg-teal-700">{t('browseCatalog')}</a>
          <a href={path('/')} className="inline-flex min-h-12 items-center justify-center rounded-full border border-slate-900/10 bg-white px-6 text-sm font-semibold text-[#071724] transition hover:bg-teal-50">{t('returnHome')}</a>
        </div>
      </div>
    </main>
  )
}
