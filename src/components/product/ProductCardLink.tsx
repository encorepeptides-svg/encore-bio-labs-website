import { useTranslation } from '../../i18n/LocaleContext'
import { cn } from '../../lib/utils'

type ProductCardLinkProps = {
  href: string
  productName: string
  className?: string
}

/**
 * A semantic, locale-aware stretched link for product cards.
 *
 * Keep embedded controls positioned above this link with `relative z-20` so
 * buttons and selectors retain their own behavior without nested interactives.
 */
export function ProductCardLink({ href, productName, className }: ProductCardLinkProps) {
  const { t } = useTranslation('common')

  return (
    <a
      href={href}
      aria-label={t('viewProductDetails', { product: productName })}
      className={cn(
        'absolute inset-0 z-10 cursor-pointer rounded-[inherit] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-teal-500',
        className,
      )}
    />
  )
}
