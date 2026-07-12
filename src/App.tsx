import { lazy, Suspense, useEffect } from 'react'
import { AnnouncementBar } from './components/AnnouncementBar'
import { CartDrawer } from './components/cart/CartDrawer'
import { Footer } from './components/Footer'
import { Navbar } from './components/Navbar'
import { RouteLoadingFallback } from './components/RouteLoadingFallback'
import { CartProvider } from './context/CartContext'
import { PortalAuthProvider } from './context/PortalAuthContext'
import { ProtectedPortal } from './components/portal/ProtectedPortal'

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

function getPathname() {
  return typeof window === 'undefined' ? '/' : window.location.pathname
}

function getRouteParam(pattern: RegExp) {
  const match = getPathname().match(pattern)
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

function getProductSlugFromPath() {
  return getRouteParam(/^\/products\/([^/]+)\/?$/)
}

function getCategorySlugFromPath() {
  return getRouteParam(/^\/categories\/([^/]+)\/?$/)
}

function App() {
  const productSlug = getProductSlugFromPath()
  const categorySlug = getCategorySlugFromPath()
  const pathname = getPathname()

  useEffect(() => {
    if (productSlug) return

    const pageMetadata: Record<string, { title: string; description: string }> = {
      '/': { title: 'Encore Bio Labs | Research-grade compounds', description: 'Explore Encore Bio Labs research-use-only products, documentation, complete kits, and inquiry support.' },
      '/catalog': { title: 'Research Product Catalog | Encore Bio Labs', description: 'Browse Encore Bio Labs research products, available formats, catalog pricing, and documentation pathways.' },
      '/cart': { title: 'Research Cart | Encore Bio Labs', description: 'Review selected research products, strengths, quantities, and catalog subtotal.' },
      '/checkout': { title: 'Order Information | Encore Bio Labs', description: 'Review an Encore Bio Labs research order inquiry and provide contact and shipping information.' },
      '/faq': { title: 'Research Product FAQ | Encore Bio Labs', description: 'Read answers about research-use classification, products, documentation, ordering, shipping, and support.' },
      '/about': { title: 'About Encore Bio Labs', description: 'Learn about Encore Bio Labs, its research catalog, documentation-first approach, and responsible product positioning.' },
      '/intake': { title: 'Research Intake | Encore Bio Labs', description: 'Share your research interests for a qualified Encore Bio Labs catalog review.' },
      '/quality': { title: 'Quality and Documentation | Encore Bio Labs', description: 'Review Encore Bio Labs quality, documentation, handling, and research-use standards.' },
      '/kits': { title: 'Encore Complete Kit', description: 'Review the shared components included with eligible Encore Bio Labs research products.' },
      '/research': { title: 'Research Library | Encore Bio Labs', description: 'Explore research-use educational material and product-category context from Encore Bio Labs.' },
      '/research/retatrutide': { title: 'Retatrutide Research | Encore Bio Labs', description: 'Review educational Retatrutide research context, evidence status, and research-use limitations.' },
      '/legal/terms': { title: 'Terms of Service | Encore Bio Labs', description: 'Read the Encore Bio Labs terms governing site access and research catalog inquiries.' },
      '/legal/privacy': { title: 'Privacy Policy | Encore Bio Labs', description: 'Read how Encore Bio Labs handles information submitted through the website.' },
      '/legal/shipping-returns': { title: 'Shipping and Returns | Encore Bio Labs', description: 'Review Encore Bio Labs shipping, delivery, return, and support policies.' },
    }
    const normalizedPath = pathname.length > 1 ? pathname.replace(/\/$/, '') : pathname
    const categoryName = categorySlug && knownCategorySlugs.has(categorySlug)
      ? categorySlug.split('-').map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`).join(' ')
      : undefined
    const metadata = pageMetadata[normalizedPath] ?? (categoryName
      ? { title: `${categoryName} Research | Encore Bio Labs`, description: `Explore Encore Bio Labs ${categoryName.toLowerCase()} research products and educational context.` }
      : { title: 'Page Not Found | Encore Bio Labs', description: 'The requested Encore Bio Labs page is not available.' })
    const descriptionMeta = document.querySelector<HTMLMetaElement>('meta[name="description"]')
    let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')

    document.title = metadata.title
    if (descriptionMeta) descriptionMeta.content = metadata.description
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.rel = 'canonical'
      document.head.appendChild(canonical)
    }
    canonical.href = `https://encorebiolabs.com${normalizedPath}`
  }, [categorySlug, pathname, productSlug])

  const page = (() => {
    const authMode = pathname === '/client-login' ? 'login' : pathname === '/client-register' ? 'register' : pathname === '/client-forgot-password' ? 'forgot' : pathname === '/client-reset-password' ? 'reset' : undefined
    if (authMode) return <PortalAuthPage mode={authMode} />
    if (pathname === '/portal/onboarding') return <ProtectedPortal allowOnboarding><OnboardingPage /></ProtectedPortal>
    if (pathname === '/portal' || pathname.startsWith('/portal/')) {
      const section = pathname === '/portal' ? 'overview' : pathname.slice('/portal/'.length)
      const allowPending = section === 'security'
      return <ProtectedPortal allowOnboarding={allowPending}><ClientPortalPage section={section} /></ProtectedPortal>
    }
    if (pathname === '/admin' || pathname.startsWith('/admin/')) {
      if (pathname === '/admin/crm' || pathname.startsWith('/admin/crm/')) return <CRMAdmin />
      const section = pathname === '/admin' ? 'overview' : pathname.slice('/admin/'.length)
      return <ProtectedPortal admin><AdminPortalPage section={section} /></ProtectedPortal>
    }
    if (pathname === '/intake' || pathname === '/intake/') {
      return <IntakePage />
    }

    if (pathname === '/about' || pathname === '/about/') {
      return <AboutPage />
    }

    if (pathname === '/') {
      return <HomePage />
    }

    if (pathname === '/catalog' || pathname === '/catalog/') {
      return <CatalogPage />
    }

    if (pathname === '/cart' || pathname === '/cart/') {
      return <CartPage />
    }

    if (pathname === '/checkout' || pathname === '/checkout/') {
      return <CheckoutPage />
    }

    if (pathname === '/kits' || pathname === '/kits/') {
      return <KitsPage />
    }

    if (pathname === '/quality' || pathname === '/quality/') {
      return <QualityPage />
    }

    if (categorySlug) {
      return <CategoryPage slug={categorySlug} />
    }

    if (pathname === '/legal/terms' || pathname === '/legal/terms/') {
      return <TermsPage />
    }

    if (pathname === '/legal/privacy' || pathname === '/legal/privacy/') {
      return <PrivacyPage />
    }

    if (pathname === '/legal/shipping-returns' || pathname === '/legal/shipping-returns/') {
      return <ShippingReturnsPage />
    }

    if (pathname === '/faq' || pathname === '/faq/') {
      return <FAQLibraryPage />
    }

    if (pathname === '/research' || pathname === '/research/' || pathname === '/research/retatrutide' || pathname === '/research/retatrutide/') {
      return <ResearchLibraryPage />
    }

    if (productSlug) {
      return <ProductPage slug={productSlug} />
    }

    return <NotFoundPage />
  })()
  const isPortalRoute = pathname === '/portal' || pathname.startsWith('/portal/') || pathname === '/admin' || pathname.startsWith('/admin/')
  const isPortalAuthRoute = ['/client-login','/client-register','/client-forgot-password','/client-reset-password'].includes(pathname)
  const isInternalAdminRoute = pathname === '/admin/crm' || pathname.startsWith('/admin/crm/')
  const isCheckoutRoute =
    pathname === '/checkout' ||
    pathname === '/checkout/'
  const hideGlobalChrome = isInternalAdminRoute || isCheckoutRoute || isPortalRoute || isPortalAuthRoute

  return (
    <PortalAuthProvider>
      <CartProvider>
        <div className="min-h-screen overflow-x-clip bg-[#f5f5f2] text-[#071724]">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-[#071724] focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
        >
          Skip to main content
        </a>
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
  )
}

export default App
