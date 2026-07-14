import type { AnchorHTMLAttributes } from 'react'
import { useLocale } from '../i18n/LocaleContext'

type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }

/** A plain <a> that automatically localizes internal hrefs (e.g. "/catalog" -> "/es/catalog" in Spanish). */
export function Link({ href, ...props }: LinkProps) {
  const { path } = useLocale()
  return <a href={path(href)} {...props} />
}
