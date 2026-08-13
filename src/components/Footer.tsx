import { ArrowUpRight, Facebook, Instagram } from 'lucide-react'
import logo from '../assets/images/logo/encore-logo.png'
import { useLocale, useTranslation } from '../i18n/LocaleContext'
import { LanguageSelector } from './LanguageSelector'
import { SUPPORT_EMAIL } from '../lib/email'
import { SOCIAL_PROFILES } from '../lib/social'

function TikTokIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M16.6 5.82A4.28 4.28 0 0 1 15.54 3h-3.09v12.4a2.59 2.59 0 1 1-1.79-2.46V9.77a5.77 5.77 0 1 0 4.88 5.7V9.01a7.35 7.35 0 0 0 4.29 1.37V7.3a4.29 4.29 0 0 1-3.23-1.48Z" />
    </svg>
  )
}

export function Footer() {
  const { path } = useLocale()
  const { t } = useTranslation('footer')
  const { t: tBrand } = useTranslation('brand')

  const exploreLinks = [
    { label: t('catalog'), href: '/catalog' },
    { label: t('protocols'), href: '/protocols' },
    { label: t('howItWorks'), href: '/#how-it-works' },
    { label: t('categories'), href: '/#products' },
    { label: t('researchLibrary'), href: '/research' },
    { label: t('aboutEncore'), href: '/about' },
    { label: t('kits'), href: '/kits' },
    { label: t('documentation'), href: '/quality' },
    { label: t('faq'), href: '/faq' },
    { label: t('clientPortal'), href: '/client-login' },
  ]

  const contactLinks = [
    { label: t('email'), href: `mailto:${SUPPORT_EMAIL}` },
    { label: t('website'), href: 'https://encorebiolabs.com' },
    { label: t('whatsapp'), href: 'https://wa.me/19153595448' },
    { label: t('contactLink'), href: '/contact' },
  ]

  const legalLinks = [
    { label: t('terms'), href: '/legal/terms' },
    { label: t('privacyPolicy'), href: '/legal/privacy' },
    { label: t('researchUseOnlyPolicy'), href: '/legal/research-use-only' },
    { label: t('shippingReturns'), href: '/legal/shipping-returns' },
  ]

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
              {tBrand('brandPromise')}
            </p>
            <p className="mt-5 max-w-2xl rounded-2xl border border-slate-900/10 bg-white/70 p-4 text-xs leading-5 text-slate-500">
              {tBrand('complianceDisclaimer')}
            </p>
            <div className="mt-6">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">{t('followUs')}</p>
              <div className="mt-3 flex items-center gap-3">
                {SOCIAL_PROFILES.map((profile) => (
                  <a
                    key={profile.id}
                    href={profile.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${t(`${profile.id}Label`)} ${profile.handle}`}
                    title={profile.handle}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-900/10 text-slate-600 transition hover:border-teal-600/40 hover:text-[#071724] focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
                  >
                    {profile.id === 'instagram' ? <Instagram size={18} aria-hidden="true" /> : null}
                    {profile.id === 'facebook' ? <Facebook size={18} aria-hidden="true" /> : null}
                    {profile.id === 'tiktok' ? <TikTokIcon size={18} /> : null}
                  </a>
                ))}
              </div>
            </div>

            <div className="mt-5">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">{t('language')}</p>
              <div className="mt-2">
                <LanguageSelector variant="footer" />
              </div>
            </div>
          </div>

          <div className="grid gap-7 sm:grid-cols-3">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                {t('explore')}
              </h3>
              <div className="mt-4 grid gap-3">
                {exploreLinks.map((link) => (
                  <a
                    key={link.label}
                    href={path(link.href)}
                    className="w-fit text-sm font-medium text-slate-600 transition hover:text-[#071724]"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                {t('contact')}
              </h3>
              <div className="mt-4 grid gap-3">
                {contactLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href.startsWith('http') || link.href.startsWith('mailto:') ? link.href : path(link.href)}
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
                {t('legal')}
              </h3>
              <div className="mt-4 grid gap-3">
                {legalLinks.map((item) => (
                  <a
                    key={item.label}
                    href={path(item.href)}
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
          <p>{t('copyright')}</p>
          <p>{tBrand('complianceDisclaimer')}</p>
        </div>
        <nav
          aria-label={t('portalAccess')}
          className="mt-5 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 border-t border-slate-900/8 pt-4 sm:justify-end sm:pr-16 lg:pr-0"
        >
          <a
            href={path('/distributor')}
            className="text-xs font-medium text-slate-400 transition hover:text-[#071724] focus:outline-none focus-visible:rounded focus-visible:ring-2 focus-visible:ring-teal-500"
          >
            {t('distributorAccess')}
          </a>
          <span className="h-3 w-px bg-slate-300" aria-hidden="true" />
          <a
            href={path('/admin')}
            className="text-xs font-medium text-slate-400 transition hover:text-[#071724] focus:outline-none focus-visible:rounded focus-visible:ring-2 focus-visible:ring-teal-500"
          >
            {t('adminAccess')}
          </a>
        </nav>
      </div>
    </footer>
  )
}
