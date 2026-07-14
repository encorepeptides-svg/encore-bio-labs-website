import { LOCALE_PREFIX, SITE_ORIGIN, type Locale } from './config'

type PageMeta = { title: string; description: string }

function getOrCreateLink(rel: string, hreflang?: string): HTMLLinkElement {
  const selector = hreflang ? `link[rel="${rel}"][hreflang="${hreflang}"]` : `link[rel="${rel}"]`
  let link = document.querySelector<HTMLLinkElement>(selector)
  if (!link) {
    link = document.createElement('link')
    link.rel = rel
    if (hreflang) link.hreflang = hreflang
    document.head.appendChild(link)
  }
  return link
}

function setMetaByName(name: string, content: string) {
  const el = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`)
  if (el) el.content = content
}

function setMetaByProperty(property: string, content: string) {
  let el = document.querySelector<HTMLMetaElement>(`meta[property="${property}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute('property', property)
    document.head.appendChild(el)
  }
  el.content = content
}

/**
 * Applies title, description, canonical, hreflang (en/es/x-default), and
 * Open Graph / Twitter tags for the current logical path + locale. Every
 * indexable page gets both an English and a Spanish alternate link so
 * crawlers can discover both versions without duplicate-content ambiguity.
 */
export function applyDocumentMetadata(logicalPath: string, locale: Locale, meta: PageMeta) {
  document.documentElement.lang = locale

  document.title = meta.title
  setMetaByName('description', meta.description)

  const normalizedLogical = logicalPath === '/' ? '' : logicalPath
  const enUrl = `${SITE_ORIGIN}${normalizedLogical || '/'}`
  const esUrl = `${SITE_ORIGIN}${LOCALE_PREFIX.es}${normalizedLogical}${normalizedLogical ? '' : '/'}`
  const currentUrl = locale === 'en' ? enUrl : esUrl

  getOrCreateLink('canonical').href = currentUrl
  getOrCreateLink('alternate', 'en').href = enUrl
  getOrCreateLink('alternate', 'es').href = esUrl
  getOrCreateLink('alternate', 'x-default').href = enUrl

  setMetaByProperty('og:title', meta.title)
  setMetaByProperty('og:description', meta.description)
  setMetaByProperty('og:url', currentUrl)
  setMetaByProperty('og:locale', locale === 'es' ? 'es_MX' : 'en_US')
  setMetaByProperty('og:locale:alternate', locale === 'es' ? 'en_US' : 'es_MX')

  setMetaByName('twitter:title', meta.title)
  setMetaByName('twitter:description', meta.description)
}
