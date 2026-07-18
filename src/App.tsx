import { lazy, Suspense, useEffect } from 'react'
import { AnnouncementBar } from './components/AnnouncementBar'
import { CartDrawer } from './components/cart/CartDrawer'
import { Footer } from './components/Footer'
import { Navbar } from './components/Navbar'
import { RouteLoadingFallback } from './components/RouteLoadingFallback'
import { CartProvider } from './context/CartContext'
import { PortalAuthProvider } from './context/PortalAuthContext'
import { ProtectedPortal } from './components/portal/ProtectedPortal'
import { LocaleProvider, useTranslation } from './i18n/LocaleContext'
import { LatamSuggestionBanner } from './components/LatamSuggestionBanner'
import { stripLocalePrefix } from './i18n/config'
import { applyDocumentMetadata } from './i18n/applyMetadata'
import { getCategoryMetadata, notFoundMetadata, pageMetadata } from './i18n/metadata'
import {
  draftReviewPreviewPath,
  isDraftReviewPreviewPath,
} from './components/social-proof/draftReviewPreviewRoute'

// Route pages are code-split so each experience only loads when it renders.
const AboutPage = lazy(() => import('./components/AboutPage').then((m) => ({ default: m.AboutPage })))
const HomePage = lazy(() =>
  import('./components/HomePage').then((m) => ({ default: m.HomePage })),
)
const CRMAdmin = lazy(() => import('./pages/CRMAdmin').then((m) => ({ default: m.CRMAdmin })))
const CatalogPage = lazy(() => import('./components/catalog/CatalogPage').then((m) => ({ default: m.CatalogPage })))
const CategoryPage = lazy(() => import('./components/category/CategoryPage').then((m) => ({ default: m.CategoryPage })))
const CartPage = lazy(() => import('./components/cart/CartPage').then((m) => ({ default: m.CartPage })))
const CheckoutPage = lazy(() => import('./components/checkout/CheckoutPage').then((m) => ({ default: m.CheckoutPage })))
const ContactPage = lazy(() => import('./components/ContactPage').then((m) => ({ default: m.ContactPage })))
const FAQLibraryPage = lazy(() => import('./components/faq/FAQLibraryPage').then((m) => ({ default: m.FAQLibraryPage })))
const IntakePage = lazy(() => import('./components/intake/IntakePage').then((m) => ({ default: m.IntakePage })))
const KitsPage = lazy(() => import('./components/kits/KitsPage').then((m) => ({ default: m.KitsPage })))
const PrivacyPage = lazy(() => import('./components/legal/PrivacyPage').then((m) => ({ default: m.PrivacyPage })))
const ShippingReturnsPage = lazy(() =>
  import('./components/legal/ShippingReturnsPage').then((m) => ({ default: m.ShippingReturnsPage })),
)
const TermsPage = lazy(() => import('./components/legal/TermsPage').then((m) => ({ default: m.TermsPage })))
const ProductPage = lazy(() => import('./components/product/ProductPage').then((m) => ({ default: m.ProductPage })))
const QualityPage = lazy(() => import('./components/quality/QualityPage').then((m) => ({ default: m.QualityPage })))
const ResearchLibraryPage = lazy(() =>
  import('./components/research/ResearchLibraryPage').then((m) => ({ default: m.ResearchLibraryPage })),
)
const NotFoundPage = lazy(() => import('./components/NotFoundPage').then((m) => ({ default: m.NotFoundPage })))
const PortalAuthPage = lazy(() => import('./components/portal/PortalAuthPages').then((m) => ({ default: m.PortalAuthPage })))
const OnboardingPage = lazy(() => import('./components/portal/OnboardingPage').then((m) => ({ default: m.OnboardingPage })))
const ClientPortalPage = lazy(() => import('./components/portal/ClientPortalPage').then((m) => ({ default: m.ClientPortalPage })))
const AdminPortalPage = lazy(() => import('./components/portal/AdminPortalPage').then((m) => ({ default: m.AdminPortalPage })))
const DraftReviewPreviewPage = import.meta.env.DEV
  ? lazy(() => import('./components/social-proof/DraftReviewPreviewPage').then((m) => ({ default: m.DraftReviewPreviewPage })))
  : null

const AssistantWidget = lazy(() =>
  import('./components/assistant/AssistantWidget').then((module) => ({ default: module.AssistantWidget })),
)

const knownCategorySlugs = new Set([
  'metabolic-weight-management',
  'recovery-regeneration',
  'longevity-cellular-health',
  'cognitive-performance',
  'hormone-wellness',
])

function getRouteParam(path: string, pattern: RegExp) {
  const match = path.match(pattern)
  const value = match?.[1]

  if (!value) {
    return undefined
  }

  try {
    return decodeURIComponent(value)
  } catch {
    return undefined
  }
}

function getProductSlugFromPath(path: string) {
  return getRouteParam(path, /^\/products\/([^/]+)\/?$/)
}

function getCategorySlugFromPath(path: string) {
  return getRouteParam(path, /^\/categories\/([^/]+)\/?$/)
}

function SkipToMainLink() {
  const { t } = useTranslation('common')
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-[#071724] focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
    >
      {t('skipToMain')}
    </a>
  )
}

function App() {
  const rawPathname = typeof window === 'undefined' ? '/' : window.location.pathname
  const { locale, path: logicalPath } = stripLocalePrefix(rawPathname)
  const productSlug = getProductSlugFromPath(logicalPath)
  const categorySlug = getCategorySlugFromPath(logicalPath)

  useEffect(() => {
    if (productSlug) return

    const normalizedPath = logicalPath.length > 1 ? logicalPath.replace(/\/$/, '') : logicalPath
    const categoryName = categorySlug && knownCategorySlugs.has(categorySlug)
      ? categorySlug.split('-').map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`).join(' ')
      : undefined
    const isPortalSubRoute = normalizedPath.startsWith('/portal/') || normalizedPath.startsWith('/admin')
    const metadataKey = isPortalSubRoute ? '/portal' : normalizedPath
    const localizedMeta = metadataKey === draftReviewPreviewPath && !isDraftReviewPreviewPath(normalizedPath, import.meta.env.DEV)
      ? notFoundMetadata
      : pageMetadata[metadataKey] ?? (categoryName ? getCategoryMetadata(categorySlug!, categoryName) : notFoundMetadata)
    applyDocumentMetadata(normalizedPath, locale, localizedMeta[locale])
  }, [categorySlug, locale, logicalPath, productSlug])

  const page = (() => {
    const authMode = logicalPath === '/client-login' ? 'login' : logicalPath === '/client-register' ? 'register' : logicalPath === '/client-forgot-password' ? 'forgot' : logicalPath === '/client-reset-password' ? 'reset' : undefined
    if (authMode) return <PortalAuthPage mode={authMode} />
    if (logicalPath === '/portal/onboarding') return <ProtectedPortal allowOnboarding><OnboardingPage /></ProtectedPortal>
    if (logicalPath === '/portal' || logicalPath.startsWith('/portal/')) {
      const section = logicalPath === '/portal' ? 'overview' : logicalPath.slice('/portal/'.length)
      const allowPending = section === 'security'
      return <ProtectedPortal allowOnboarding={allowPending}><ClientPortalPage section={section} /></ProtectedPortal>
    }
    if (logicalPath === '/admin' || logicalPath.startsWith('/admin/')) {
      if (logicalPath === '/admin/crm' || logicalPath.startsWith('/admin/crm/')) return <CRMAdmin />
      const section = logicalPath === '/admin' ? 'overview' : logicalPath.slice('/admin/'.length)
      return <ProtectedPortal admin><AdminPortalPage section={section} /></ProtectedPortal>
    }
    if (logicalPath === '/intake' || logicalPath === '/intake/') {
      return <IntakePage />
    }

    if (logicalPath === '/about' || logicalPath === '/about/') {
      return <AboutPage />
    }

    if (logicalPath === '/') {
      return <HomePage />
    }

    if (DraftReviewPreviewPage && isDraftReviewPreviewPath(logicalPath, import.meta.env.DEV)) {
      return <DraftReviewPreviewPage />
    }

    if (logicalPath === '/catalog' || logicalPath === '/catalog/') {
      return <CatalogPage />
    }

    if (logicalPath === '/cart' || logicalPath === '/cart/') {
      return <CartPage />
    }

    if (logicalPath === '/checkout' || logicalPath === '/checkout/') {
      return <CheckoutPage />
    }

    if (logicalPath === '/contact' || logicalPath === '/contact/') {
      return <ContactPage />
    }

    if (logicalPath === '/kits' || logicalPath === '/kits/') {
      return <KitsPage />
    }

    if (logicalPath === '/quality' || logicalPath === '/quality/') {
      return <QualityPage />
    }

    if (categorySlug) {
      return <CategoryPage slug={categorySlug} />
    }

    if (logicalPath === '/legal/terms' || logicalPath === '/legal/terms/') {
      return <TermsPage />
    }

    if (logicalPath === '/legal/privacy' || logicalPath === '/legal/privacy/') {
      return <PrivacyPage />
    }

    if (logicalPath === '/legal/shipping-returns' || logicalPath === '/legal/shipping-returns/') {
      return <ShippingReturnsPage />
    }

    if (logicalPath === '/faq' || logicalPath === '/faq/') {
      return <FAQLibraryPage />
    }

    if (logicalPath === '/research' || logicalPath === '/research/' || logicalPath === '/research/retatrutide' || logicalPath === '/research/retatrutide/') {
      return <ResearchLibraryPage />
    }

    if (productSlug) {
      return <ProductPage slug={productSlug} />
    }

    return <NotFoundPage />
  })()
  const isPortalRoute = logicalPath === '/portal' || logicalPath.startsWith('/portal/') || logicalPath === '/admin' || logicalPath.startsWith('/admin/')
  const isPortalAuthRoute = ['/client-login', '/client-register', '/client-forgot-password', '/client-reset-password'].includes(logicalPath)
  const isInternalAdminRoute = logicalPath === '/admin/crm' || logicalPath.startsWith('/admin/crm/')
  const isCheckoutRoute =
    logicalPath === '/checkout' ||
    logicalPath === '/checkout/'
  const hideGlobalChrome = isInternalAdminRoute || isCheckoutRoute || isPortalRoute || isPortalAuthRoute

  return (
    <LocaleProvider locale={locale} logicalPath={logicalPath}>
      <PortalAuthProvider>
        <CartProvider>
          <div className="min-h-screen overflow-x-clip bg-[#f5f5f2] text-[#071724]">
            <SkipToMainLink />
            {hideGlobalChrome ? null : <LatamSuggestionBanner />}
            {hideGlobalChrome ? null : <AnnouncementBar />}
            {hideGlobalChrome ? null : <Navbar />}
            <Suspense fallback={<RouteLoadingFallback />}>{page}</Suspense>
            {hideGlobalChrome ? null : <Footer />}
            {hideGlobalChrome ? null : <CartDrawer />}
            {hideGlobalChrome ? null : (
              <Suspense fallback={null}>
                <AssistantWidget />
              </Suspense>
            )}
          </div>
        </CartProvider>
      </PortalAuthProvider>
    </LocaleProvider>
  )
}

export default App
