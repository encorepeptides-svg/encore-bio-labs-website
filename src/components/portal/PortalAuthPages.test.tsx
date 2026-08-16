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
  requestPasswordReset: vi.fn(),
}))

vi.mock('../../lib/portal/portalAuth', async (importOriginal) => {
  const original = await importOriginal<typeof import('../../lib/portal/portalAuth')>()
  return {
    ...original,
    updatePortalPassword: authMocks.updatePassword,
    loadPortalIdentity: authMocks.loadIdentity,
    requestPasswordReset: authMocks.requestPasswordReset,
  }
})

function setInputValue(input: HTMLInputElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set
  setter?.call(input, value)
  input.dispatchEvent(new Event('input', { bubbles: true }))
}

describe('portal authentication pages', () => {
  let root: Root | null = null

  beforeEach(() => {
    authMocks.updatePassword.mockReset().mockResolvedValue({ error: null })
    authMocks.requestPasswordReset.mockReset().mockResolvedValue({ error: null })
    authMocks.loadIdentity.mockReset().mockResolvedValue({
      user: { id: '00000000-0000-4000-8000-000000000041' },
      roles: ['client'],
      status: 'onboarding_incomplete',
      distributorStatus: null,
      profile: { legal_name: 'Test Client', preferred_name: 'Test', email: 'test@example.com' },
    })
    window.sessionStorage.clear()
    window.history.replaceState({}, '', '/')
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

  it('renders a Spanish partner login without client onboarding links', async () => {
    window.history.replaceState({}, '', '/es/distributor/login')
    const container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
    await act(async () => {
      root?.render(
        <LocaleProvider locale="es" logicalPath="/distributor/login">
          <PortalAuthContext.Provider value={{ identity: null, loading: false, configured: true, refresh: async () => {}, logout: async () => {} }}>
            <PortalAuthPage mode="login" audience="distributor" />
          </PortalAuthContext.Provider>
        </LocaleProvider>,
      )
    })

    expect(container.textContent).toContain('Portal de socios Encore')
    expect(container.textContent).toContain('Haz crecer tus ventas con Encore')
    expect(container.textContent).toContain('25%')
    expect(container.textContent).not.toContain('Portal privado para clientes')
    expect(container.querySelector('a[href="/es/distributor/forgot-password"]')).not.toBeNull()
    expect(container.querySelector('a[href="/es/client-register"]')).toBeNull()
  })

  it('uses the distributor audience and a neutral confirmation for password recovery', async () => {
    window.history.replaceState({}, '', '/distributor/forgot-password')
    const container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
    await act(async () => {
      root?.render(
        <LocaleProvider locale="en" logicalPath="/distributor/forgot-password">
          <PortalAuthContext.Provider value={{ identity: null, loading: false, configured: true, refresh: async () => {}, logout: async () => {} }}>
            <PortalAuthPage mode="forgot" audience="distributor" />
          </PortalAuthContext.Provider>
        </LocaleProvider>,
      )
    })

    const emailInput = container.querySelector<HTMLInputElement>('input[type="email"]')
    act(() => setInputValue(emailInput!, 'partner@example.com'))
    await act(async () => {
      container.querySelector('form')?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
    })

    expect(authMocks.requestPasswordReset).toHaveBeenCalledWith('partner@example.com', 'distributor')
    expect(container.querySelector('[role="status"]')?.textContent).toContain('If we found an associated distributor account')
  })

  it('presents invited distributors with an account activation experience', async () => {
    window.history.replaceState({}, '', '/es/distributor/reset-password?invited=1')
    const container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
    await act(async () => {
      root?.render(
        <LocaleProvider locale="es" logicalPath="/distributor/reset-password">
          <PortalAuthContext.Provider value={{ identity: null, loading: false, configured: true, refresh: async () => {}, logout: async () => {} }}>
            <PortalAuthPage mode="reset" audience="distributor" />
          </PortalAuthContext.Provider>
        </LocaleProvider>,
      )
    })

    expect(container.textContent).toContain('Activa tu cuenta de socio')
    expect(container.textContent).toContain('Encore te invitó a participar en su programa de distribuidores')
    const activationButton = Array.from(container.querySelectorAll('button')).find((button) => button.textContent?.includes('Activar portal de socios'))
    expect(activationButton).not.toBeUndefined()
  })
})
