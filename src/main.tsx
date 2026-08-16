import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { stripLocalePrefix } from './i18n/config'
import { resolveBarePathLocale } from './i18n/detectLocale'
import { validateDistributorCode } from './lib/distributorIncentive'
import { referralCandidate, validateAndStoreReferralCode } from './lib/referralAttribution'
import { trackDistributorEvent } from './lib/distributorAnalytics'

/**
 * Decides, before any React render happens, whether this bare (unprefixed)
 * pageview should redirect to its /es equivalent. Running this ahead of the
 * render avoids ever painting an English frame that then flips to Spanish.
 * /es URLs are never redirected away from — the URL is authoritative there.
 */
function resolveRedirectTarget(): string | null {
  const { locale: urlLocale, path } = stripLocalePrefix(window.location.pathname)
  if (urlLocale === 'es') return null
  if (resolveBarePathLocale() !== 'es') return null
  return `/es${path === '/' ? '' : path}${window.location.search}${window.location.hash}`
}

async function bootstrap() {
  const redirectTarget = resolveRedirectTarget()
  if (redirectTarget) {
    window.location.replace(redirectTarget)
    return
  }

  const candidate = referralCandidate()
  if (candidate) {
    const locale = window.location.pathname === '/es' || window.location.pathname.startsWith('/es/') ? 'es' : 'en'
    try {
      const result = await validateAndStoreReferralCode(
        candidate.code,
        (code) => validateDistributorCode(code, locale),
        {
          source: 'referral_link',
          landingPath: candidate.landingPath,
          partnerLinkSlug: candidate.partnerLinkSlug,
          subId: candidate.subId,
          utmSource: candidate.utmSource,
          utmMedium: candidate.utmMedium,
          utmCampaign: candidate.utmCampaign,
          utmTerm: candidate.utmTerm,
          utmContent: candidate.utmContent,
        },
      )
      if (result.valid && result.attribution) {
        void trackDistributorEvent('referral_link_clicked', result.attribution)
        void trackDistributorEvent('unique_visitor_recorded', result.attribution)
      }
    } catch {
      // Keep any existing valid attribution when the validation service is unavailable.
    }
  }

  createRoot(document.getElementById('root')!).render(
    <StrictMode><App /></StrictMode>,
  )
}

void bootstrap()
