// @vitest-environment jsdom
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { LocaleProvider } from '../../i18n/LocaleContext'
import { ConsentChecklist, type ConsentChecklistItem } from './ConsentChecklist'

type Key = 'terms' | 'privacy' | 'ruo' | 'photos'

const items: Array<ConsentChecklistItem<Key>> = [
  { key: 'terms', title: 'Terms of Service', summary: 'Terms summary', href: '/legal/terms', required: true },
  { key: 'privacy', title: 'Privacy Notice', summary: 'Privacy summary', href: '/legal/privacy', required: true },
  { key: 'ruo', title: 'Research Use Only acknowledgment', summary: 'RUO summary', required: true, fullDocumentAvailable: false },
  { key: 'photos', title: 'Optional Progress Photo Consent', summary: 'Photo summary', required: false, fullDocumentAvailable: false },
]

describe('ConsentChecklist', () => {
  let root: Root | null = null

  afterEach(() => {
    if (root) act(() => root?.unmount())
    root = null
    document.body.innerHTML = ''
  })

  it.each(['en', 'es'] as const)('keeps legal document controls independent from checkboxes in %s', (locale) => {
    const onChange = vi.fn()
    const container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
    act(() => {
      root?.render(
        <LocaleProvider locale={locale} logicalPath="/portal/intake">
          <ConsentChecklist items={items} values={{ terms: false, privacy: false, ruo: false, photos: false }} onChange={onChange} />
        </LocaleProvider>,
      )
    })

    const links = Array.from(container.querySelectorAll('a'))
    expect(links.find((link) => link.textContent?.includes('Terms'))?.getAttribute('href')).toBe(locale === 'es' ? '/es/legal/terms' : '/legal/terms')
    expect(links.find((link) => link.textContent?.includes('Privacy'))?.getAttribute('href')).toBe(locale === 'es' ? '/es/legal/privacy' : '/legal/privacy')

    const ruoButton = Array.from(container.querySelectorAll('button')).find((button) => button.textContent?.includes('Research Use Only'))
    act(() => ruoButton?.click())
    expect(onChange).not.toHaveBeenCalled()
    expect((container.querySelector('#consent-ruo') as HTMLInputElement).checked).toBe(false)
    expect(container.querySelector('[role="dialog"]')).toBeTruthy()
    expect(container.textContent).toContain(locale === 'es' ? 'contenido legal aprobado' : 'approved full copy')

    const photoCard = (container.querySelector('#consent-photos') as HTMLInputElement).closest('div')?.parentElement
    expect(photoCard?.textContent).toContain(locale === 'es' ? 'Opcional' : 'Optional')
  })
})
