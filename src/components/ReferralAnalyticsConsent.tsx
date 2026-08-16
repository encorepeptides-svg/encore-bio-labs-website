import { useEffect, useState } from 'react'
import { useLocale } from '../i18n/LocaleContext'
import { getAnalyticsConsent, setAnalyticsConsent, type AnalyticsConsent } from '../lib/distributorAnalytics'
import { trackDistributorEvent } from '../lib/distributorAnalytics'
import { readReferralAttribution } from '../lib/referralAttribution'

export function ReferralAnalyticsConsent() {
  const { locale, path } = useLocale()
  const [consent, setConsent] = useState<AnalyticsConsent>(() => getAnalyticsConsent())
  const attribution = readReferralAttribution()
  useEffect(() => {
    const update = () => setConsent(getAnalyticsConsent())
    window.addEventListener('encore:analytics-consent', update)
    return () => window.removeEventListener('encore:analytics-consent', update)
  }, [])
  useEffect(() => {
    if (consent === 'accepted' && attribution) void trackDistributorEvent('unique_visitor_recorded', attribution)
  }, [attribution, consent])
  if (!attribution || consent !== 'unknown') return null
  const es = locale === 'es'
  return <aside className="fixed inset-x-4 bottom-4 z-[80] mx-auto max-w-3xl rounded-[1.4rem] border border-white/10 bg-[#071724] p-5 text-white shadow-[0_24px_80px_rgba(7,23,36,.35)]" role="dialog" aria-label={es ? 'Preferencias de analítica' : 'Analytics preferences'}>
    <p className="text-sm font-semibold">{es ? 'Ayúdanos a medir correctamente la recomendación' : 'Help us measure this recommendation correctly'}</p>
    <p className="mt-2 text-xs leading-5 text-slate-300">{es ? 'Con tu permiso registramos visitas y pasos del proceso usando identificadores anónimos. Tu código y descuento funcionan aunque rechaces.' : 'With permission, we record visits and journey steps using anonymous identifiers. Your code and discount work even if you decline.'} <a className="underline" href={path('/legal/privacy')}>{es ? 'Privacidad' : 'Privacy'}</a></p>
    <div className="mt-4 flex flex-wrap gap-2">
      <button className="min-h-11 rounded-full bg-teal-300 px-5 text-sm font-semibold text-[#071724]" onClick={() => setAnalyticsConsent('accepted')}>{es ? 'Permitir analítica' : 'Allow analytics'}</button>
      <button className="min-h-11 rounded-full border border-white/20 px-5 text-sm font-semibold" onClick={() => setAnalyticsConsent('declined')}>{es ? 'Solo lo esencial' : 'Essential only'}</button>
    </div>
  </aside>
}
