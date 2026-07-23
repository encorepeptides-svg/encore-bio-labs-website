// @vitest-environment jsdom
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { PortalAuthContext } from '../../context/portalAuthStore'
import { LocaleProvider } from '../../i18n/LocaleContext'
import { PortalAuthPage } from './PortalAuthPages'

const authMocks = vi.hoisted(() => ({
  updatePassword: vi.fn(),
  loadIdentity: vi.fn(),
}))

vi.mock('../../lib/portal/portalAuth', async (importOriginal) => {
  const original = await importOriginal<typeof import('../../lib/portal/portalAuth')>()
  return {
    ...original,
    updatePortalPassword: authMocks.updatePassword,
    loadPortalIdentity: authMocks.loadIdentity,
  }
})

function setInputValue(input: HTMLInputElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set
  setter?.call(input, value)
  input.dispatchEvent(new Event('input', { bubbles: true }))
}

describe('password update completion', () => {
  let root: Root | null = null

  beforeEach(() => {
    authMocks.updatePassword.mockReset().mockResolvedValue({ error: null })
    authMocks.loadIdentity.mockReset().mockResolvedValue({
      user: { id: '00000000-0000-4000-8000-000000000041' },
      roles: ['client'],
      status: 'onboarding_incomplete',
      profile: { legal_name: 'Test Client', preferred_name: 'Test', email: 'test@example.com' },
    })
    window.sessionStorage.clear()
  })

  afterEach(() => {
    if (root) act(() => root?.unmount())
    root = null
    document.body.innerHTML = ''
  })

  it.each(['en', 'es'] as const)('shows success and a correct onboarding destination in %s', async (locale) => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
    await act(async () => {
      root?.render(
        <LocaleProvider locale={locale} logicalPath="/client-reset-password">
          <PortalAuthContext.Provider value={{ identity: null, loading: false, configured: true, refresh: async () => {}, logout: async () => {} }}>
            <PortalAuthPage mode="reset" />
          </PortalAuthContext.Provider>
        </LocaleProvider>,
      )
    })

    const inputs = Array.from(container.querySelectorAll<HTMLInputElement>('input[type="password"]'))
    expect(inputs).toHaveLength(2)
    act(() => {
      setInputValue(inputs[0], 'long-secure-password')
      setInputValue(inputs[1], 'long-secure-password')
    })
    await act(async () => {
      const form = container.querySelector('form')
      form?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
      form?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
    })

    expect(authMocks.updatePassword).toHaveBeenCalledTimes(1)
    expect(container.querySelector('[role="status"]')?.textContent).toContain(locale === 'es' ? 'Contraseña actualizada' : 'Password updated')
    const portalLink = Array.from(container.querySelectorAll('a')).find((link) => link.textContent?.includes(locale === 'es' ? 'Continuar al portal' : 'Continue to portal'))
    expect(portalLink?.getAttribute('href')).toBe(locale === 'es' ? '/es/portal/intake' : '/portal/intake')
    expect(container.textContent).toContain(locale === 'es' ? 'Volver a iniciar sesión' : 'Return to sign in')
  })
})
