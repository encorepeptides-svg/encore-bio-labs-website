import { AnimatePresence, motion } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import logo from '../assets/images/logo/encore-logo.png'
import { CartNavButton } from './cart/CartDrawer'

const primaryNavItems = [
  { label: 'Home', href: '/' },
  { label: 'Catalog', href: '/catalog' },
  { label: 'About', href: '/about' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Contact', href: '/#contact' },
]

const mobileNavItems = [
  ...primaryNavItems,
  { label: 'How It Works', href: '/#how-it-works' },
]

const PREMIUM_EASE = [0.16, 1, 0.3, 1] as const

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [location, setLocation] = useState(() => ({ pathname: window.location.pathname, hash: window.location.hash }))
  const menuRef = useRef<HTMLDivElement>(null)
  const menuButtonRef = useRef<HTMLButtonElement>(null)

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
    if (location.pathname !== '/' || !['#how-it-works', '#contact'].includes(location.hash)) return
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

  function isActive(label: string) {
    if (label === 'Home') return location.pathname === '/' && !location.hash
    if (label === 'Catalog') return ['/catalog', '/products/', '/categories/'].some((path) => location.pathname === path || location.pathname.startsWith(path))
    if (label === 'About') return location.pathname === '/about' || location.pathname === '/about/'
    if (label === 'FAQ') return location.pathname === '/faq' || location.pathname === '/faq/'
    if (label === 'Contact') return location.hash === '#contact'
    return false
  }

  return (
    <header className="sticky top-2 z-50 px-3 sm:px-5">
      <nav className="relative z-50 mx-auto flex max-w-[88rem] items-center justify-between gap-3 rounded-2xl border border-white/75 bg-[#f5f5f2]/88 px-4 py-2.5 shadow-[0_16px_50px_rgba(7,23,36,0.13)] backdrop-blur-2xl sm:px-5 lg:gap-5 lg:px-6">
        <a href="/" className="flex items-center gap-3" aria-label="Encore Bio Labs home">
          <img
            src={logo}
            alt="Encore Bio Labs"
            width="900"
            height="264"
            className="h-9 w-auto sm:h-10"
          />
        </a>

        <div className="hidden items-center gap-3 lg:flex xl:gap-5">
          {primaryNavItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              aria-current={isActive(item.label) ? 'page' : undefined}
              className={`whitespace-nowrap border-b py-1.5 text-sm font-medium transition ${isActive(item.label) ? 'border-teal-700 text-[#071724]' : 'border-transparent text-slate-600 hover:border-teal-700/35 hover:text-[#071724]'}`}
            >
              {item.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <CartNavButton />
          <a
            href="/intake"
            className="inline-flex min-h-11 shrink-0 items-center justify-center whitespace-nowrap rounded-full bg-[#071724] px-5 text-sm font-bold text-white shadow-[0_14px_34px_rgba(7,23,36,0.2)] transition duration-[220ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 hover:bg-[#102a3d] hover:shadow-[0_18px_42px_rgba(7,23,36,0.25)] active:translate-y-0"
          >
            Start Your Research
          </a>
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <CartNavButton />
          <button
            ref={menuButtonRef}
            type="button"
            onClick={() => setIsMenuOpen((open) => !open)}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            className="inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-slate-900/10 bg-white/70 text-[#071724] shadow-sm backdrop-blur-xl transition hover:bg-white"
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
              aria-label="Close menu"
              onClick={() => setIsMenuOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-[#071724]/25 backdrop-blur-sm lg:hidden"
            />
            <motion.div
              ref={menuRef}
              id="mobile-menu"
              role="dialog"
              aria-modal="true"
              aria-label="Main navigation"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: PREMIUM_EASE }}
              className="absolute inset-x-0 top-[calc(100%+0.5rem)] z-50 rounded-2xl border border-white/80 bg-[#f5f5f2]/96 px-4 pb-5 pt-4 shadow-[0_28px_70px_rgba(7,23,36,0.18)] backdrop-blur-2xl sm:px-5 lg:hidden"
            >
              <div className="grid gap-1">
                {mobileNavItems.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    aria-current={isActive(item.label) ? 'page' : undefined}
                    className={`rounded-xl px-4 py-3 text-base font-semibold transition ${isActive(item.label) ? 'bg-teal-50 text-teal-900' : 'text-[#071724] hover:bg-white'}`}
                  >
                    {item.label}
                  </a>
                ))}
              </div>
              <a
                href="/intake"
                onClick={() => setIsMenuOpen(false)}
                className="mt-4 flex min-h-12 w-full items-center justify-center whitespace-nowrap rounded-full bg-[#071724] px-7 text-base font-bold text-white shadow-[0_16px_36px_rgba(7,23,36,0.22)] transition duration-[220ms] ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.98]"
              >
                Start Your Research
              </a>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </header>
  )
}
