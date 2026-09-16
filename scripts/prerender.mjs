import { copyFile, mkdir, readFile, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { createServer } from 'vite'

const SITE_ORIGIN = 'https://www.encorebiolabs.com'
const HOMEPAGE_OG_IMAGE = `${SITE_ORIGIN}/og-homepage.png`

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
}

function escapeXml(value) {
  return escapeHtml(value).replaceAll("'", '&apos;')
}

function replaceOrInsertHead(html, pattern, replacement) {
  if (pattern.test(html)) return html.replace(pattern, replacement)
  return html.replace('</head>', `    ${replacement}\n  </head>`)
}

function metaTag(attribute, key, content) {
  return `<meta ${attribute}="${key}" content="${escapeHtml(content)}" />`
}

function canonicalUrls(logicalPath) {
  const suffix = logicalPath === '/' ? '' : logicalPath
  return {
    en: `${SITE_ORIGIN}${suffix || '/'}`,
    es: `${SITE_ORIGIN}/es${suffix}`,
  }
}

export function renderDocument(baseHtml, { logicalPath, locale, meta, imageUrl = HOMEPAGE_OG_IMAGE, imageAlt, noindex = false }) {
  const urls = canonicalUrls(logicalPath)
  const currentUrl = locale === 'es' ? urls.es : urls.en
  const alternateLocale = locale === 'es' ? 'en_US' : 'es_MX'
  const robots = noindex ? 'noindex, nofollow' : 'index, follow'
  let html = baseHtml.replace(/<html\s+lang="[^"]*"/i, `<html lang="${locale}"`)

  html = replaceOrInsertHead(html, /<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(meta.title)}</title>`)
  html = replaceOrInsertHead(html, /<meta\s+name="description"[^>]*>/i, metaTag('name', 'description', meta.description))
  html = replaceOrInsertHead(html, /<meta\s+name="robots"[^>]*>/i, metaTag('name', 'robots', robots))
  html = replaceOrInsertHead(html, /<meta\s+property="og:title"[^>]*>/i, metaTag('property', 'og:title', meta.title))
  html = replaceOrInsertHead(html, /<meta\s+property="og:description"[^>]*>/i, metaTag('property', 'og:description', meta.description))
  html = replaceOrInsertHead(html, /<meta\s+property="og:image"[^>]*>/i, metaTag('property', 'og:image', imageUrl))
  html = replaceOrInsertHead(html, /<meta\s+property="og:image:alt"[^>]*>/i, metaTag('property', 'og:image:alt', imageAlt ?? meta.title))
  html = replaceOrInsertHead(html, /<meta\s+property="og:url"[^>]*>/i, metaTag('property', 'og:url', currentUrl))
  html = replaceOrInsertHead(html, /<meta\s+property="og:locale"[^>]*>/i, metaTag('property', 'og:locale', locale === 'es' ? 'es_MX' : 'en_US'))
  html = replaceOrInsertHead(html, /<meta\s+property="og:locale:alternate"[^>]*>/i, metaTag('property', 'og:locale:alternate', alternateLocale))
  html = replaceOrInsertHead(html, /<meta\s+name="twitter:title"[^>]*>/i, metaTag('name', 'twitter:title', meta.title))
  html = replaceOrInsertHead(html, /<meta\s+name="twitter:description"[^>]*>/i, metaTag('name', 'twitter:description', meta.description))
  html = replaceOrInsertHead(html, /<meta\s+name="twitter:image"[^>]*>/i, metaTag('name', 'twitter:image', imageUrl))
  html = replaceOrInsertHead(html, /<meta\s+name="twitter:image:alt"[^>]*>/i, metaTag('name', 'twitter:image:alt', imageAlt ?? meta.title))

  // Product assets do not share the homepage image dimensions. Let scrapers
  // inspect the image instead of publishing incorrect width/height metadata.
  if (imageUrl !== HOMEPAGE_OG_IMAGE) {
    html = html.replace(/\s*<meta\s+property="og:image:(?:width|height)"[^>]*>\s*/gi, '\n')
  }

  html = replaceOrInsertHead(html, /<link\s+rel="canonical"[^>]*>/i, `<link rel="canonical" href="${currentUrl}" />`)
  for (const [hreflang, href] of [['en', urls.en], ['es', urls.es], ['x-default', urls.en]]) {
    html = replaceOrInsertHead(
      html,
      new RegExp(`<link\\s+rel="alternate"\\s+hreflang="${hreflang}"[^>]*>`, 'i'),
      `<link rel="alternate" hreflang="${hreflang}" href="${href}" />`,
    )
  }

  return html
}

function localizedPath(logicalPath, locale) {
  if (locale === 'en') return logicalPath
  return logicalPath === '/' ? '/es' : `/es${logicalPath}`
}

function outputPathForRoute(distDir, route) {
  if (route === '/') return path.join(distDir, 'index.html')
  return path.join(distDir, route.replace(/^\//, ''), 'index.html')
}

async function fileExists(filePath) {
  try {
    return (await stat(filePath)).isFile()
  } catch {
    return false
  }
}

function fallback404Markup(locale) {
  const spanish = locale === 'es'
  const catalogHref = spanish ? '/es/catalog' : '/catalog'
  const homeHref = spanish ? '/es' : '/'
  return `<main id="main-content" style="font-family:system-ui,sans-serif;max-width:48rem;margin:5rem auto;padding:2rem;text-align:center"><h1>${spanish ? 'Página no encontrada' : 'Page not found'}</h1><p>${spanish ? 'La página que buscas no está disponible.' : 'The requested page is not available.'}</p><p><a href="${catalogHref}">${spanish ? 'Explorar el catálogo' : 'Browse catalog'}</a> · <a href="${homeHref}">${spanish ? 'Volver al inicio' : 'Return home'}</a></p></main>`
}

export function renderSitemap(routes) {
  const entries = routes.flatMap((logicalPath) => ['en', 'es'].map((locale) => {
    const route = localizedPath(logicalPath, locale)
    const loc = `${SITE_ORIGIN}${route === '/' ? '/' : route}`
    return `  <url><loc>${escapeXml(loc)}</loc></url>`
  }))
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join('\n')}\n</urlset>\n`
}

async function loadRouteData(rootDir) {
  const vite = await createServer({ root: rootDir, appType: 'custom', server: { middlewareMode: true }, logLevel: 'silent' })
  try {
    const [metadataModule, productsModule, translationsModule, protocolsModule] = await Promise.all([
      vite.ssrLoadModule('/src/i18n/metadata.ts'),
      vite.ssrLoadModule('/src/data/products.ts'),
      vite.ssrLoadModule('/src/data/productTranslations.ts'),
      vite.ssrLoadModule('/src/data/protocols.ts'),
    ])
    return { ...metadataModule, ...productsModule, ...translationsModule, ...protocolsModule }
  } finally {
    await vite.close()
  }
}

async function main() {
  const rootDir = process.cwd()
  const distDir = path.join(rootDir, 'dist')
  const baseHtml = await readFile(path.join(distDir, 'index.html'), 'utf8')
  const {
    getCategoryMetadata,
    getLocalizedProduct,
    getLocalizedProtocol,
    notFoundMetadata,
    pageMetadata,
    products,
    protocols,
    researchAreas,
  } = await loadRouteData(rootDir)

  const routeMap = new Map()
  for (const [logicalPath, meta] of Object.entries(pageMetadata)) {
    if (logicalPath === '/review-preview' || logicalPath === '/portal') continue
    routeMap.set(logicalPath, { meta })
  }
  for (const area of researchAreas) {
    routeMap.set(`/categories/${area.slug}`, { meta: getCategoryMetadata(area.slug, area.name) })
  }
  for (const product of products) {
    const localized = { en: getLocalizedProduct(product, 'en'), es: getLocalizedProduct(product, 'es') }
    routeMap.set(`/products/${product.slug}`, {
      meta: {
        en: { title: `${localized.en.name} Research Product | Encore Bio Labs`, description: localized.en.shortDescription || localized.en.description },
        es: { title: `${localized.es.name} Producto de Investigación | Encore Bio Labs`, description: localized.es.shortDescription || localized.es.description },
      },
      product,
    })
  }
  for (const protocol of protocols) {
    const localized = { en: getLocalizedProtocol(protocol, 'en'), es: getLocalizedProtocol(protocol, 'es') }
    routeMap.set(`/protocols/${protocol.slug}`, {
      meta: {
        en: { title: `${localized.en.title} | Encore Bio Labs`, description: localized.en.description },
        es: { title: `${localized.es.title} | Encore Bio Labs`, description: localized.es.description },
      },
    })
  }

  const privateRouteMap = new Map([
    ['/portal', { meta: pageMetadata['/portal'] }],
    // Phase 2 owns distinct admin copy. Phase 1 only guarantees private pages
    // are noindex while preserving the current client-side metadata behavior.
    ['/admin', { meta: pageMetadata['/portal'] }],
  ])

  const ogDir = path.join(distDir, 'og', 'products')
  await mkdir(ogDir, { recursive: true })
  for (const [logicalPath, config] of [...routeMap, ...privateRouteMap]) {
    let imageUrl = HOMEPAGE_OG_IMAGE
    if (config.product) {
      const source = path.join(rootDir, 'src', 'assets', 'images', 'products', config.product.image)
      if (await fileExists(source)) {
        const extension = path.extname(source).toLowerCase() || '.png'
        const target = path.join(ogDir, `${config.product.slug}${extension}`)
        await copyFile(source, target)
        imageUrl = `${SITE_ORIGIN}/og/products/${config.product.slug}${extension}`
      }
    }

    for (const locale of ['en', 'es']) {
      const route = localizedPath(logicalPath, locale)
      const outputPath = outputPathForRoute(distDir, route)
      await mkdir(path.dirname(outputPath), { recursive: true })
      await writeFile(outputPath, renderDocument(baseHtml, {
        logicalPath,
        locale,
        meta: config.meta[locale],
        imageUrl,
        imageAlt: config.product ? `${config.meta[locale].title}` : undefined,
        noindex: privateRouteMap.has(logicalPath),
      }))
    }
  }

  const notFoundHtml = renderDocument(baseHtml, {
    logicalPath: '/404',
    locale: 'en',
    meta: notFoundMetadata.en,
    noindex: true,
  }).replace('<div id="root"></div>', `<div id="root">${fallback404Markup('en')}</div>`)
  await writeFile(path.join(distDir, '404.html'), notFoundHtml)
  await writeFile(path.join(distDir, 'sitemap.xml'), renderSitemap([...routeMap.keys()].sort()))

  console.log(`Prerendered ${routeMap.size * 2} public pages, ${privateRouteMap.size * 2} private shells, 404.html, and sitemap.xml.`)
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  await main()
}
