import { AnimatePresence, motion } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import logo from '../assets/images/logo/encore-logo.png'
import { CartNavButton } from './cart/CartDrawer'

const navItems = [
  { label: 'Catalog', href: '/catalog' },
  { label: 'Categories', href: '/#products' },
  { label: 'Research', href: '/research' },
  { label: 'About', href: '/about' },
  { label: 'Kits', href: '/kits' },
  { label: 'Quality', href: '/quality' },
  { label: 'How It Works', href: '/#how-it-works' },
  { label: 'FAQ', href: '/faq' },
]

const PREMIUM_EASE = [0.16, 1, 0.3, 1] as const

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    if (!isMenuOpen) return

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsMenuOpen(false)
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isMenuOpen])

  return (
    <header className="sticky top-0 z-50 border-b border-slate-900/10 bg-[#f5f5f2]/78 backdrop-blur-2xl">
      <nav className="relative z-50 mx-auto flex max-w-[88rem] items-center justify-between gap-4 px-5 py-3 sm:px-8">
        <a href="/" className="flex items-center gap-3" aria-label="Encore Bio Labs home">
          <img
            src={logo}
            alt="Encore Bio Labs"
            width="900"
            height="264"
            className="h-9 w-auto sm:h-10"
          />
        </a>

        <div className="hidden items-center gap-7 lg:flex">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="rounded-full px-2 py-1 text-sm font-medium text-slate-600 transition hover:text-[#071724]"
            >
              {item.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <CartNavButton />
          <a
            href="/intake"
            className="inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-full bg-[#071724] px-6 py-3 text-sm font-bold text-white shadow-[0_18px_40px_rgba(7,23,36,0.22)] transition duration-[220ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 hover:scale-[1.03] hover:bg-[#102a3d] hover:shadow-[0_22px_48px_rgba(7,23,36,0.28)] active:translate-y-0 active:scale-[0.98]"
          >
            Start Your Research
          </a>
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <CartNavButton />
          <button
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
              id="mobile-menu"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: PREMIUM_EASE }}
              className="absolute inset-x-0 top-full z-50 border-t border-slate-900/10 bg-[#f5f5f2] px-5 pb-6 pt-4 shadow-[0_28px_70px_rgba(7,23,36,0.16)] sm:px-8 lg:hidden"
            >
              <div className="grid gap-1">
                {navItems.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="rounded-2xl px-4 py-3.5 text-base font-semibold text-[#071724] transition hover:bg-white"
                  >
                    {item.label}
                  </a>
                ))}
              </div>
              <a
                href="/intake"
                className="mt-4 flex min-h-14 w-full items-center justify-center whitespace-nowrap rounded-full bg-[#071724] px-8 py-4 text-base font-bold text-white shadow-[0_18px_40px_rgba(7,23,36,0.22)] transition duration-[220ms] ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.98]"
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
