import logo from '../assets/images/logo/encore-logo.png'
import { useLocale } from '../i18n/LocaleContext'
import { cn } from '../lib/utils'

export function BrandLogoLink({ className, imageClassName }: { className?: string; imageClassName?: string }) {
  const { path, locale } = useLocale()

  return (
    <a href={path('/')} aria-label={locale === 'es' ? 'Encore Bio Labs — Inicio' : 'Encore Bio Labs — Home'} className={cn('inline-flex w-fit items-center', className)}>
      <img
        src={logo}
        alt="Encore Bio Labs"
        width="900"
        height="264"
        decoding="async"
        className={cn('h-10 w-auto max-w-full object-contain sm:h-12', imageClassName)}
      />
    </a>
  )
}
