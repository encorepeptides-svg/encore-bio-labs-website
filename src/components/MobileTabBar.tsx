import { House, ShoppingCart, Store, Target } from 'lucide-react'
import { useCart } from '../context/useCart'
import { stripLocalePrefix } from '../i18n/config'
import { useLocale, useTranslation } from '../i18n/LocaleContext'
import { cn } from '../lib/utils'

/**
 * Persistent mobile/tablet bottom navigation. Puts the highest-priority
 * destinations — Home, Shop, the intake form ("Start"), and Cart — one tap away
 * from anywhere on the site. Hidden at xl where the full header nav appears.
 * Rendered only alongside the rest of the global chrome (not on portal/checkout).
 */
export function MobileTabBar() {
  const { path } = useLocale()
  const { t } = useTranslation('navigation')
  const { t: tCart } = useTranslation('cart')
  const { itemCount, openCart } = useCart()

  // Every internal navigation is a full page load, so the pathname is current at
  // render — no location listener needed to keep the active state in sync.
  const logicalPath = stripLocalePrefix(window.location.pathname).path
  const isHome = logicalPath === '/'
  const isShop = ['/catalog', '/products/', '/categories/'].some(
    (p) => logicalPath === p || logicalPath.startsWith(p),
  )
  const isStart = logicalPath === '/intake' || logicalPath.startsWith('/intake')

  const linkClass = (active: boolean) =>
    cn(
      'flex min-h-[3.5rem] flex-col items-center justify-center gap-1 py-1.5 text-[0.7rem] font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal-500',
      active ? 'text-teal-800' : 'text-slate-500 hover:text-[#071724]',
    )

  const iconClass = (active: boolean) => (active ? 'text-teal-700' : 'text-slate-500')

  return (
    <nav
      aria-label={t('mobileTabBar')}
      className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-900/10 bg-[#f5f5f2]/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_30px_rgba(7,23,36,0.1)] backdrop-blur-2xl xl:hidden"
    >
      <ul className="mx-auto grid max-w-md grid-cols-4">
        <li>
          <a href={path('/')} aria-current={isHome ? 'page' : undefined} className={linkClass(isHome)}>
            <House size={22} aria-hidden="true" className={iconClass(isHome)} />
            {t('tabHome')}
          </a>
        </li>
        <li>
          <a href={path('/catalog')} aria-current={isShop ? 'page' : undefined} className={linkClass(isShop)}>
            <Store size={22} aria-hidden="true" className={iconClass(isShop)} />
            {t('tabShop')}
          </a>
        </li>
        <li>
          <a href={path('/intake')} aria-current={isStart ? 'page' : undefined} className={linkClass(isStart)}>
            <Target size={22} aria-hidden="true" className={iconClass(isStart)} />
            {t('tabStart')}
          </a>
        </li>
        <li>
          <button
            type="button"
            onClick={openCart}
            aria-label={tCart(itemCount === 1 ? 'cartWithItemsAriaOne' : 'cartWithItemsAriaOther', { count: itemCount })}
            className={cn(linkClass(false), 'relative w-full')}
          >
            <span className="relative">
              <ShoppingCart size={22} aria-hidden="true" className="text-slate-500" />
              {itemCount ? (
                <span className="absolute -right-2 -top-1.5 flex min-w-[1.1rem] items-center justify-center rounded-full bg-teal-700 px-1 py-0.5 text-[0.6rem] font-bold leading-none text-white">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              ) : null}
            </span>
            {t('tabCart')}
          </button>
        </li>
      </ul>
    </nav>
  )
}
