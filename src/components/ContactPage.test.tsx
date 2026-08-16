// @vitest-environment jsdom
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { LocaleProvider } from '../i18n/LocaleContext'
import { ContactPage } from './ContactPage'

describe('contact distributor entry point', () => {
  it.each([
    ['en', '/distributor/login', 'Already an approved distributor?', 'Open Partner Portal'],
    ['es', '/es/distributor/login', '¿Ya eres distribuidor aprobado?', 'Entrar al portal de socios'],
  ] as const)('renders the dedicated partner login in %s', (locale, href, title, action) => {
    const html = renderToStaticMarkup(
      <LocaleProvider locale={locale} logicalPath="/contact">
        <ContactPage />
      </LocaleProvider>,
    )

    expect(html).toContain(title)
    expect(html).toContain(action)
    expect(html).toContain(`href="${href}"`)
    expect(html).not.toContain('href="/client-login"')
    expect(html).not.toContain('href="/es/client-login"')
  })
})
