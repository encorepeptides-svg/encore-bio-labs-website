import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { stripLocalePrefix } from './i18n/config'
import { resolveBarePathLocale } from './i18n/detectLocale'

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

const redirectTarget = resolveRedirectTarget()

if (redirectTarget) {
  window.location.replace(redirectTarget)
} else {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}
