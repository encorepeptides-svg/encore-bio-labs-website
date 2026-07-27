import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, Menu, Search, UserRound, X } from 'lucide-react'
import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
  type FocusEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent,
} from 'react'
import logo from '../assets/images/logo/encore-logo.png'
import { stripLocalePrefix } from '../i18n/config'
import { useLocale, useTranslation } from '../i18n/LocaleContext'
import { CartNavButton } from './cart/CartDrawer'
import { LanguageSelector } from './LanguageSelector'

const ProductSearch = lazy(() => import('./search/ProductSearch').then((module) => ({ default: module.ProductSearch })))

const PREMIUM_EASE = [0.16, 1, 0.3, 1] as const

type NavLinkItem = { key: string; label: string; href: string }

type DropdownId = 'shop' | 'research'

/**
 * Desktop disclosure dropdown (APG disclosure-navigation pattern: button with
 * aria-expanded/aria-controls over a plain list of links — no menu roles).
 * Opens on click/Enter/Space/ArrowDown, optionally on hover for fine pointers,
 * and closes on Escape, outside click, link selection, or focus leaving.
 */
function DesktopDropdown({
  id,
  label,
  items,
  active,
  isOpen,
  onOpen,
  onClose,
  isItemActive,
  toHref,
}: {
  id: DropdownId
  label: string
  items: NavLinkItem[]
  active: boolean
  isOpen: boolean
  onOpen: () => void
  onClose: () => void
  isItemActive: (href: string) => boolean
  toHref: (href: string) => string
}) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const hoverTimerRef = useRef<number | undefined>(undefined)
  const focusFirstOnOpenRef = useRef(false)
  // Hover-open only makes sense on devices with a real pointer; touch and
  // keyboard users go through click/Enter.
  const supportsHoverRef = useRef(
    typeof window !== 'undefined'
      && typeof window.matchMedia === 'function'
      && window.matchMedia('(hover: hover) and (pointer: fine)').matches,
  )
  const panelId = `${id}-nav-panel`

  useEffect(() => () => window.clearTimeout(hoverTimerRef.current), [])

  useEffect(() => {
    if (!isOpen) return

    if (focusFirstOnOpenRef.current) {
      focusFirstOnOpenRef.current = false
      wrapperRef.current?.querySelector<HTMLElement>(`#${panelId} a[href]`)?.focus()
    }

    function handlePointerDown(event: PointerEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) onClose()
    }
    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [isOpen, onClose, panelId])

  function handleWrapperKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Escape') {
      if (!isOpen) return
      event.stopPropagation()
      onClose()
      buttonRef.current?.focus()
      return
    }
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return
    event.preventDefault()
    if (!isOpen) {
      focusFirstOnOpenRef.current = true
      onOpen()
      return
    }
    const links = Array.from(
      wrapperRef.current?.querySelectorAll<HTMLElement>(`#${panelId} a[href]`) ?? [],
    )
    if (!links.length) return
    const index = links.indexOf(document.activeElement as HTMLElement)
    const nextIndex = event.key === 'ArrowDown'
      ? (index + 1) % links.length
      : index <= 0
        ? links.length - 1
        : index - 1
    links[nextIndex]?.focus()
  }

  function handleBlur(event: FocusEvent<HTMLDivElement>) {
    // relatedTarget is null both when focus leaves the document entirely (e.g.
    // the user switches windows) and on some programmatic blurs — only close
    // when focus actually moved to another element outside the dropdown.
    if (event.relatedTarget && !wrapperRef.current?.contains(event.relatedTarget as Node)) onClose()
  }

  function handleMouseEnter() {
    if (!supportsHoverRef.current) return
    window.clearTimeout(hoverTimerRef.current)
    onOpen()
  }

  function handleMouseLeave() {
    if (!supportsHoverRef.current) return
    window.clearTimeout(hoverTimerRef.current)
    hoverTimerRef.current = window.setTimeout(onClose, 140)
  }

  return (
    <div
      ref={wrapperRef}
      className="relative"
      onKeyDown={handleWrapperKeyDown}
      onBlur={handleBlur}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={() => (isOpen ? onClose() : onOpen())}
        className={`group relative inline-flex items-center gap-1 whitespace-nowrap rounded-md py-1.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 ${active || isOpen ? 'text-[#071724]' : 'text-slate-600 hover:text-[#071724]'}`}
      >
        {label}
        <ChevronDown
          size={14}
          aria-hidden="true"
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180 text-teal-700' : 'text-slate-400 group-hover:text-slate-600'}`}
        />
        <span
          aria-hidden="true"
          className={`pointer-events-none absolute -bottom-0.5 left-1/2 h-[2px] w-5 -translate-x-1/2 rounded-full bg-teal-700 transition-opacity duration-200 ${active ? 'opacity-100' : 'opacity-0 group-hover:opacity-40'}`}
        />
      </button>
      {isOpen ? (
          <div
            id={panelId}
            className="absolute left-1/2 top-[calc(100%+0.75rem)] z-50 w-64 -translate-x-1/2 rounded-2xl border border-white/80 bg-[#f7f7f4] p-2 shadow-[0_24px_60px_rgba(7,23,36,0.16)]"
          >
            <ul className="grid gap-0.5">
              {items.map((item) => {
                const itemActive = isItemActive(item.href)
                return (
                  <li key={item.key}>
                    <a
                      href={toHref(item.href)}
                      onClick={onClose}
                      aria-current={itemActive ? 'page' : undefined}
                      className={`block rounded-xl px-3.5 py-2 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 ${itemActive ? 'bg-teal-50 text-teal-900' : 'text-[#071724]/85 hover:bg-white hover:text-[#071724]'}`}
                    >
                      {item.label}
                    </a>
                  </li>
                )
              })}
            </ul>
          </div>
      ) : null}
    </div>
  )
}

export function Navbar() {
  const { path } = useLocale()
  const { t } = useTranslation('navigation')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<DropdownId | null>(null)
  const [location, setLocation] = useState(() => ({ pathname: window.location.pathname, hash: window.location.hash }))
  const menuRef = useRef<HTMLDivElement>(null)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const searchReturnFocusRef = useRef<HTMLElement | null>(null)

  // Shop groups the catalog entry points (all real, existing routes/sections);
  // Research groups the education destinations. Shipping and Contact stay in
  // the footer; the intake CTA ("Start Your Research") owns the conversion path.
  const shopItems: NavLinkItem[] = [
    { key: 'BrowseAll', label: t('browseAll'), href: '/catalog' },
    { key: 'BestSellers', label: t('bestSellers'), href: '/#best-sellers' },
    { key: 'Metabolic', label: t('shopMetabolic'), href: '/categories/metabolic-weight-management' },
    { key: 'Recovery', label: t('shopRecovery'), href: '/categories/recovery-regeneration' },
    { key: 'Hormone', label: t('shopHormone'), href: '/categories/hormone-wellness' },
    { key: 'Longevity', label: t('shopLongevity'), href: '/categories/longevity-cellular-health' },
    { key: 'Cognitive', label: t('shopCognitive'), href: '/categories/cognitive-performance' },
  ]

  const researchItems: NavLinkItem[] = [
    { key: 'Protocols', label: t('protocols'), href: '/protocols' },
    { key: 'ResearchLibrary', label: t('researchLibrary'), href: '/research' },
    { key: 'FAQ', label: t('faq'), href: '/faq' },
    { key: 'Lab paperwork', label: t('documentationCoas'), href: '/quality' },
  ]

  const exploreItems: NavLinkItem[] = [
    { key: 'HowItWorks', label: t('howItWorks'), href: '/#how-it-works' },
    { key: 'About', label: t('about'), href: '/about' },
  ]

  useEffect(() => {
    function updateLocation() {
      setLocation({ pathname: window.location.pathname, hash: window.location.hash })
    }
    window.addEventListener('hashchange', updateLocation)
    window.addEventListener('popstate', updateLocation)
    return () => {
      window.removeEventListener('hashchange', updateLocation)
      window.removeEventListener('popstate', updateLocation)
    }
  }, [])

  useEffect(() => {
    // Compare the locale-stripped path so deferred hash scrolling also works on
    // the Spanish homepage (/es#how-it-works, /es#best-sellers, …).
    if (stripLocalePrefix(location.pathname).path !== '/' || !['#how-it-works', '#contact', '#best-sellers'].includes(location.hash)) return
    const targetId = location.hash.slice(1)
    let observer: MutationObserver | undefined
    const frame = window.requestAnimationFrame(() => {
      const target = document.getElementById(targetId)
      if (target) {
        target.scrollIntoView({ block: 'start' })
        return
      }
      observer = new MutationObserver(() => {
        const deferredTarget = document.getElementById(targetId)
        if (!deferredTarget) return
        deferredTarget.scrollIntoView({ block: 'start' })
        observer?.disconnect()
      })
      observer.observe(document.body, { childList: true, subtree: true })
    })
    return () => {
      window.cancelAnimationFrame(frame)
      observer?.disconnect()
    }
  }, [location.hash, location.pathname])

  useEffect(() => {
    if (!isMenuOpen) return

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsMenuOpen(false)
        return
      }
      if (event.key !== 'Tab' || !menuRef.current) return
      const focusable = Array.from(menuRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled])'))
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (!first || !last) return
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    const previousOverflow = document.body.style.overflow
    const menuButton = menuButtonRef.current
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)
    menuRef.current?.querySelector<HTMLElement>('a[href]')?.focus()

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
      menuButton?.focus()
    }
  }, [isMenuOpen])

  function openSearch(event: MouseEvent<HTMLElement>) {
    searchReturnFocusRef.current = event.currentTarget
    setIsMenuOpen(false)
    setOpenDropdown(null)
    setIsSearchOpen(true)
  }

  function closeSearch() {
    setIsSearchOpen(false)
    window.requestAnimationFrame(() => searchReturnFocusRef.current?.focus())
  }

  const logicalPathname = stripLocalePrefix(location.pathname).path
  const normalizedPathname = logicalPathname.length > 1 ? logicalPathname.replace(/\/$/, '') : logicalPathname

  const isItemActive = useCallback(
    (href: string) => {
      if (href.startsWith('/#')) return normalizedPathname === '/' && location.hash === href.slice(1)
      return normalizedPathname === href || normalizedPathname.startsWith(`${href}/`)
    },
    [normalizedPathname, location.hash],
  )

  const isShopActive = ['/catalog', '/products', '/categories', '/kits'].some(
    (p) => normalizedPathname === p || normalizedPathname.startsWith(`${p}/`),
  )
  const isResearchActive = ['/protocols', '/research', '/faq', '/quality'].some(
    (p) => normalizedPathname === p || normalizedPathname.startsWith(`${p}/`),
  )
  const isLoginActive = normalizedPathname === '/client-login' || normalizedPathname.startsWith('/portal')

  const closeDropdowns = useCallback(() => setOpenDropdown(null), [])

  const desktopLinkClass = (active: boolean) =>
    `group relative whitespace-nowrap rounded-md py-1.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 ${active ? 'text-[#071724]' : 'text-slate-600 hover:text-[#071724]'}`

  const desktopLinkUnderline = (active: boolean) => (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute -bottom-0.5 left-1/2 h-[2px] w-5 -translate-x-1/2 rounded-full bg-teal-700 transition-opacity duration-200 ${active ? 'opacity-100' : 'opacity-0 group-hover:opacity-40'}`}
    />
  )

  const drawerSectionLabelClass = 'px-4 pb-1 pt-3 text-[0.68rem] font-bold uppercase tracking-[0.16em] text-slate-500'

  const drawerLinkClass = (active: boolean) =>
    `flex min-h-11 items-center rounded-xl px-4 py-2.5 text-[0.95rem] font-semibold transition ${active ? 'bg-teal-50 text-teal-900' : 'text-[#071724] hover:bg-white'}`

  return (
    <header className="sticky top-2 z-50 px-3 sm:px-5">
      <nav className="relative z-50 mx-auto flex max-w-[88rem] items-center justify-between gap-3 rounded-2xl border border-white/75 bg-[#f5f5f2]/88 px-4 py-2.5 shadow-[0_16px_50px_rgba(7,23,36,0.13)] backdrop-blur-2xl sm:px-5 lg:gap-5 lg:px-6 xl:grid xl:grid-cols-[1fr_auto_1fr]">
        <a href={path('/')} className="flex items-center gap-3 xl:justify-self-start" aria-label={t('homeAriaLabel')}>
          <img
            src={logo}
            alt="Encore Bio Labs"
            width="900"
            height="264"
            className="h-8 w-auto sm:h-9"
          />
        </a>

        <div className="hidden items-center gap-6 xl:col-start-2 xl:flex xl:justify-self-center">
          <DesktopDropdown
            id="shop"
            label={t('shop')}
            items={shopItems}
            active={isShopActive}
            isOpen={openDropdown === 'shop'}
            onOpen={() => setOpenDropdown('shop')}
            onClose={closeDropdowns}
            isItemActive={isItemActive}
            toHref={path}
          />
          <DesktopDropdown
            id="research"
            label={t('research')}
            items={researchItems}
            active={isResearchActive}
            isOpen={openDropdown === 'research'}
            onOpen={() => setOpenDropdown('research')}
            onClose={closeDropdowns}
            isItemActive={isItemActive}
            toHref={path}
          />
          {exploreItems.map((item) => {
            const active = isItemActive(item.href)
            return (
              <a
                key={item.key}
                href={path(item.href)}
                aria-current={active ? 'page' : undefined}
                className={desktopLinkClass(active)}
              >
                {item.label}
                {desktopLinkUnderline(active)}
              </a>
            )
          })}
        </div>

        <div className="hidden items-center gap-2.5 xl:col-start-3 xl:flex xl:justify-self-end">
          <button
            type="button"
            onClick={openSearch}
            aria-label={t('searchProducts')}
            title={t('searchProducts')}
            className="inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-slate-900/10 bg-white/70 text-[#071724] shadow-sm transition hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
          >
            <Search size={17} aria-hidden="true" />
          </button>
          <LanguageSelector variant="compact" />
          <a
            href={path('/client-login')}
            aria-current={isLoginActive ? 'page' : undefined}
            className="inline-flex h-10 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full border border-teal-900/15 bg-white/75 px-4 text-sm font-bold text-[#071724] shadow-sm transition hover:-translate-y-0.5 hover:border-teal-700/30 hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
          >
            <UserRound size={17} aria-hidden="true" />
            {t('login')}
          </a>
          <CartNavButton />
          <a
            href={path('/intake')}
            className="inline-flex min-h-11 shrink-0 items-center justify-center whitespace-nowrap rounded-full bg-[#071724] px-5 text-sm font-bold text-white shadow-[0_14px_34px_rgba(7,23,36,0.2)] transition duration-[220ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 hover:bg-[#102a3d] hover:shadow-[0_18px_42px_rgba(7,23,36,0.25)] active:translate-y-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
          >
            {t('startYourResearch')}
          </a>
        </div>

        <div className="flex items-center gap-2 xl:hidden">
          <button
            type="button"
            onClick={openSearch}
            aria-label={t('searchProducts')}
            title={t('searchProducts')}
            className="inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-slate-900/10 bg-white/70 text-[#071724] shadow-sm backdrop-blur-xl transition hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
          >
            <Search size={19} aria-hidden="true" />
          </button>
          {/* Cart lives in the persistent bottom tab bar on mobile/tablet; the
              language selector lives in the drawer's labeled Language section. */}
          <button
            ref={menuButtonRef}
            type="button"
            onClick={() => setIsMenuOpen((open) => !open)}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
            aria-label={isMenuOpen ? t('closeMenu') : t('openMenu')}
            className="inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-slate-900/10 bg-white/70 text-[#071724] shadow-sm backdrop-blur-xl transition hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
          >
            {isMenuOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {isMenuOpen ? (
          <>
            <motion.button
              type="button"
              aria-label={t('closeMenu')}
              onClick={() => setIsMenuOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-[#071724]/25 backdrop-blur-sm xl:hidden"
            />
            <motion.div
              ref={menuRef}
              id="mobile-menu"
              role="dialog"
              aria-modal="true"
              aria-label={t('mainNavigation')}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: PREMIUM_EASE }}
              className="absolute inset-x-0 top-[calc(100%+0.5rem)] z-50 max-h-[calc(100dvh-7.5rem)] overflow-y-auto overscroll-contain rounded-2xl border border-white/80 bg-[#f7f7f4]/[0.99] px-4 pb-5 pt-2 shadow-[0_28px_70px_rgba(7,23,36,0.18)] backdrop-blur-2xl sm:px-5 xl:hidden"
            >
              <p className={drawerSectionLabelClass}>{t('shop')}</p>
              <div className="grid gap-0.5">
                {shopItems.map((item) => (
                  <a
                    key={item.key}
                    href={path(item.href)}
                    onClick={() => setIsMenuOpen(false)}
                    aria-current={isItemActive(item.href) ? 'page' : undefined}
                    className={drawerLinkClass(isItemActive(item.href))}
                  >
                    {item.label}
                  </a>
                ))}
              </div>
              <p className={drawerSectionLabelClass}>{t('research')}</p>
              <div className="grid gap-0.5">
                {researchItems.map((item) => (
                  <a
                    key={item.key}
                    href={path(item.href)}
                    onClick={() => setIsMenuOpen(false)}
                    aria-current={isItemActive(item.href) ? 'page' : undefined}
                    className={drawerLinkClass(isItemActive(item.href))}
                  >
                    {item.label}
                  </a>
                ))}
              </div>
              <p className={drawerSectionLabelClass}>{t('menuExplore')}</p>
              <div className="grid gap-0.5">
                {exploreItems.map((item) => (
                  <a
                    key={item.key}
                    href={path(item.href)}
                    onClick={() => setIsMenuOpen(false)}
                    aria-current={isItemActive(item.href) ? 'page' : undefined}
                    className={drawerLinkClass(isItemActive(item.href))}
                  >
                    {item.label}
                  </a>
                ))}
              </div>
              <a
                href={path('/client-login')}
                onClick={() => setIsMenuOpen(false)}
                aria-current={isLoginActive ? 'page' : undefined}
                className="mt-4 flex min-h-12 items-center justify-center gap-3 rounded-full border border-teal-900/15 bg-white px-5 text-base font-bold text-[#071724] shadow-sm transition hover:border-teal-700/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
              >
                <UserRound size={18} aria-hidden="true" className="text-teal-700" />
                {t('login')}
              </a>
              <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-slate-900/5 bg-white/60 px-4 py-2.5">
                <span className="text-sm font-semibold text-slate-600">{t('language')}</span>
                <LanguageSelector variant="mobile" />
              </div>
              <a
                href={path('/intake')}
                onClick={() => setIsMenuOpen(false)}
                className="mt-4 flex min-h-12 w-full items-center justify-center whitespace-nowrap rounded-full bg-[#071724] px-7 text-base font-bold text-white shadow-[0_16px_36px_rgba(7,23,36,0.22)] transition duration-[220ms] ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
              >
                {t('startYourResearch')}
              </a>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
      <Suspense fallback={null}>
        {isSearchOpen ? <ProductSearch open={isSearchOpen} onClose={closeSearch} /> : null}
      </Suspense>
    </header>
  )
}
