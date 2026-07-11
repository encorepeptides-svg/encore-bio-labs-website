import { lazy, Suspense } from 'react'
import { AnnouncementBar } from './components/AnnouncementBar'
import { CartDrawer } from './components/cart/CartDrawer'
import { Footer } from './components/Footer'
import { Navbar } from './components/Navbar'
import { RouteLoadingFallback } from './components/RouteLoadingFallback'
import { CartProvider } from './context/CartContext'

// Route pages are code-split so each experience only loads when it renders.
const AboutPage = lazy(() => import('./components/AboutPage').then((m) => ({ default: m.AboutPage })))
const AdminLeadsPage = lazy(() =>
  import('./components/admin/AdminLeadsPage').then((m) => ({ default: m.AdminLeadsPage })),
)
const AlternateHomePage = lazy(() =>
  import('./components/AlternateHomePage').then((m) => ({ default: m.AlternateHomePage })),
)
const CRMAdmin = lazy(() => import('./pages/CRMAdmin').then((m) => ({ default: m.CRMAdmin })))
const CatalogPage = lazy(() => import('./components/catalog/CatalogPage').then((m) => ({ default: m.CatalogPage })))
const CategoryPage = lazy(() => import('./components/category/CategoryPage').then((m) => ({ default: m.CategoryPage })))
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

const AssistantWidget = lazy(() =>
  import('./components/assistant/AssistantWidget').then((module) => ({ default: module.AssistantWidget })),
)

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

function getAdminLeadIdFromPath() {
  return getRouteParam(/^\/admin\/leads\/([^/]+)\/?$/)
}

function App() {
  const productSlug = getProductSlugFromPath()
  const categorySlug = getCategorySlugFromPath()
  const adminLeadId = getAdminLeadIdFromPath()
  const pathname = getPathname()

  const page = (() => {
    if (pathname === '/intake' || pathname === '/intake/') {
      return <IntakePage />
    }

    if (pathname === '/about' || pathname === '/about/') {
      return <AboutPage />
    }

    if (
      pathname === '/' ||
      pathname === '/alternate-homepage' ||
      pathname === '/alternate-homepage/' ||
      pathname === '/home-v2' ||
      pathname === '/home-v2/'
    ) {
      return <AlternateHomePage />
    }

    if (pathname === '/catalog' || pathname === '/catalog/') {
      return <CatalogPage />
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

    if (pathname === '/admin/leads' || pathname === '/admin/leads/' || adminLeadId) {
      return <AdminLeadsPage leadId={adminLeadId} />
    }

    if (pathname === '/admin/crm' || pathname === '/admin/crm/') {
      return <CRMAdmin />
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

    if (pathname === '/research' || pathname === '/research/') {
      return <ResearchLibraryPage />
    }

    if (productSlug) {
      return <ProductPage slug={productSlug} />
    }

    return <AlternateHomePage />
  })()
  const isInternalAdminRoute = pathname.startsWith('/admin/')
  const isCheckoutRoute = pathname === '/checkout' || pathname === '/checkout/'
  const hideGlobalChrome = isInternalAdminRoute || isCheckoutRoute

  return (
    <CartProvider>
      <div className="min-h-screen overflow-hidden bg-[#f5f5f2] text-[#071724]">
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
  )
}

export default App
