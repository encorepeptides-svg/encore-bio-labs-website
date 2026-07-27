import logo from '../../assets/images/logo/encore-logo.png'
import { acknowledgmentContent } from '../../data/acknowledgmentContent'
import { useLocale } from '../../i18n/LocaleContext'
import { LanguageSelector } from '../LanguageSelector'

export function AccessDeniedPage() {
  const { locale, path } = useLocale()
  const copy = acknowledgmentContent[locale].denied

  return (
    <main id="main-content" className="flex min-h-screen items-center justify-center bg-[#071724] px-5 py-12 text-center">
      <section className="w-full max-w-lg rounded-[2rem] border border-white/15 bg-white p-7 shadow-[0_35px_120px_rgba(0,0,0,0.35)] sm:p-10">
        <div className="flex items-center justify-between gap-4">
          <img src={logo} alt="Encore Bio Labs" className="h-9 w-auto" />
          <LanguageSelector variant="mobile" />
        </div>
        <p className="mt-10 text-xs font-bold uppercase tracking-[0.2em] text-teal-700">{copy.eyebrow}</p>
        <h1 className="mt-4 text-3xl font-semibold tracking-[-0.045em] text-[#071724]">{copy.title}</h1>
        <p className="mt-4 text-sm leading-7 text-slate-600">{copy.body}</p>
        <a
          href={path('/legal/research-use-only')}
          className="mt-7 inline-flex min-h-11 items-center justify-center rounded-full border border-slate-900/15 px-5 text-sm font-semibold text-[#071724] transition hover:border-teal-700/40 hover:bg-teal-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
        >
          {copy.policyLink}
        </a>
      </section>
    </main>
  )
}
