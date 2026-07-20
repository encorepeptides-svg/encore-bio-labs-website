import { ArrowUpRight } from 'lucide-react'
import logo from '../assets/images/logo/encore-logo.png'
import { useLocale, useTranslation } from '../i18n/LocaleContext'
import { LanguageSelector } from './LanguageSelector'

export function Footer() {
  const { path } = useLocale()
  const { t } = useTranslation('footer')
  const { t: tBrand } = useTranslation('brand')

  const exploreLinks = [
    { label: t('catalog'), href: '/catalog' },
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
    { label: t('website'), href: 'https://encorebiolabs.com' },
    { label: t('instagram'), href: 'https://instagram.com/encorebiolabs' },
    { label: t('whatsapp'), href: 'https://wa.me/19153595448' },
    { label: t('contactLink'), href: '/contact' },
  ]

  const legalLinks = [
    { label: t('terms'), href: '/legal/terms' },
    { label: t('privacyPolicy'), href: '/legal/privacy' },
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
                    href={link.href.startsWith('http') ? link.href : path(link.href)}
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
      </div>
    </footer>
  )
}
