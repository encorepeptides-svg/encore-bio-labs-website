import { lazy, Suspense } from 'react'
import { AnnouncementBar } from './components/AnnouncementBar'
import { CategoryGrid } from './components/CategoryGrid'
import { FAQPreviewSection } from './components/FAQPreviewSection'
import { FeaturedProducts } from './components/FeaturedProducts'
import { FinalCTA } from './components/FinalCTA'
import { Footer } from './components/Footer'
import { Hero } from './components/Hero'
import { HowItWorks } from './components/HowItWorks'
import { Navbar } from './components/Navbar'
import { MobileStickyCTA } from './components/MobileStickyCTA'
import { QualityHighlightsSection } from './components/QualityHighlightsSection'
import { ResearchUseExplanation } from './components/ResearchUseExplanation'
import { RouteLoadingFallback } from './components/RouteLoadingFallback'
import { TrustStatement } from './components/TrustStatement'

// Non-home routes are code-split: each only loads when a user actually
// navigates there, keeping the homepage's initial bundle lean.
const AboutPage = lazy(() => import('./components/AboutPage').then((m) => ({ default: m.AboutPage })))
const AdminLeadsPage = lazy(() =>
  import('./components/admin/AdminLeadsPage').then((m) => ({ default: m.AdminLeadsPage })),
)
const CRMAdmin = lazy(() => import('./pages/CRMAdmin').then((m) => ({ default: m.CRMAdmin })))
const CatalogPage = lazy(() => import('./components/catalog/CatalogPage').then((m) => ({ default: m.CatalogPage })))
const CategoryPage = lazy(() => import('./components/category/CategoryPage').then((m) => ({ default: m.CategoryPage })))
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

function HomePage() {
  return (
    <main id="main-content">
      <Hero />
      <TrustStatement />
      <CategoryGrid />
      <FeaturedProducts />
      <QualityHighlightsSection />
      <HowItWorks />
      <ResearchUseExplanation />
      <FAQPreviewSection />
      <FinalCTA />
    </main>
  )
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

    if (pathname === '/catalog' || pathname === '/catalog/') {
      return <CatalogPage />
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

    return <HomePage />
  })()
  const isInternalAdminRoute = pathname.startsWith('/admin/')

  return (
    <div className="min-h-screen overflow-hidden bg-[#f5f5f2] text-[#071724]">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-[#071724] focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Skip to main content
      </a>
      {isInternalAdminRoute ? null : <AnnouncementBar />}
      {isInternalAdminRoute ? null : <Navbar />}
      <Suspense fallback={<RouteLoadingFallback />}>{page}</Suspense>
      {isInternalAdminRoute ? null : <Footer />}
      {isInternalAdminRoute ? null : <MobileStickyCTA />}
      {isInternalAdminRoute ? null : (
        <Suspense fallback={null}>
          <AssistantWidget />
        </Suspense>
      )}
    </div>
  )
}

export default App
