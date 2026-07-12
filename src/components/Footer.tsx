import { ArrowUpRight } from 'lucide-react'
import logo from '../assets/images/logo/encore-logo.png'
import { brandText } from '../../config/brandText'

const exploreLinks = [
  { label: 'Catalog', href: '/catalog' },
  { label: 'How It Works', href: '/#how-it-works' },
  { label: 'Categories', href: '/#products' },
  { label: 'Research Library', href: '/research' },
  { label: 'About Encore Bio Labs', href: '/about' },
  { label: 'Kits', href: '/kits' },
  { label: 'Documentation', href: '/quality' },
  { label: 'FAQ', href: '/faq' },
]

const contactLinks = [
  { label: 'Website: encorebiolabs.com', href: 'https://encorebiolabs.com' },
  { label: 'Instagram: @encorebiolabs', href: 'https://instagram.com/encorebiolabs' },
  { label: 'WhatsApp: 9153595448', href: 'https://wa.me/19153595448' },
  { label: 'Contact', href: '/intake' },
]

const legalLinks = [
  { label: 'Terms', href: '/legal/terms' },
  { label: 'Privacy Policy', href: '/legal/privacy' },
  { label: 'Shipping & Returns', href: '/legal/shipping-returns' },
]

export function Footer() {
  return (
    <footer id="contact" className="scroll-mt-28 border-t border-slate-900/10 px-5 pb-28 pt-10 sm:px-8 md:pb-10 lg:py-12">
      <div className="mx-auto max-w-[88rem]">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div>
            <img
              src={logo}
              alt="Encore Bio Labs"
              width="900"
              height="264"
              loading="lazy"
              decoding="async"
              className="h-12 w-auto"
            />
            <p className="mt-5 max-w-xl text-sm leading-6 text-slate-600">
              {brandText.brandPromise}
            </p>
            <p className="mt-5 max-w-2xl rounded-2xl border border-slate-900/10 bg-white/70 p-4 text-xs leading-5 text-slate-500">
              {brandText.complianceDisclaimer}
            </p>
          </div>

          <div className="grid gap-7 sm:grid-cols-3">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                Explore
              </h3>
              <div className="mt-4 grid gap-3">
                {exploreLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    className="w-fit text-sm font-medium text-slate-600 transition hover:text-[#071724]"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                Contact
              </h3>
              <div className="mt-4 grid gap-3">
                {contactLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    className="inline-flex w-fit items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-[#071724]"
                  >
                    {link.label}
                    <ArrowUpRight size={15} aria-hidden="true" />
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                Legal
              </h3>
              <div className="mt-4 grid gap-3">
                {legalLinks.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    className="w-fit text-sm font-medium text-slate-600 transition hover:text-[#071724]"
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-4 border-t border-slate-900/10 pt-6 text-xs leading-5 text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Encore Bio Labs. All rights reserved.</p>
          <p>{brandText.complianceDisclaimer}</p>
        </div>
      </div>
    </footer>
  )
}
