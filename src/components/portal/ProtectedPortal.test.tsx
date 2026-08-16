// @vitest-environment jsdom
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { PortalAuthContext, type PortalAuthValue } from '../../context/portalAuthStore'
import { LocaleProvider } from '../../i18n/LocaleContext'
import type { DistributorAccountStatus, DistributorOnboardingState, PortalIdentity } from '../../lib/portal/portalAuth'
import { ProtectedPortal } from './ProtectedPortal'

const baseAuth: PortalAuthValue = {
  identity: null,
  loading: false,
  configured: true,
  refresh: async () => {},
  logout: async () => {},
}

function distributorIdentity(status: DistributorAccountStatus, onboardingStatus: DistributorOnboardingState = status === 'active' ? 'active' : status === 'suspended' ? 'suspended' : 'email_accepted'): PortalIdentity {
  return {
    user: { id: '00000000-0000-4000-8000-000000000051' } as PortalIdentity['user'],
    roles: ['distributor'],
    status: 'active',
    distributorStatus: status,
    distributorOnboardingStatus: onboardingStatus,
    profile: { legal_name: 'Encore Partner', preferred_name: 'Partner', email: 'partner@example.com' },
  }
}

function renderGate(auth: PortalAuthValue) {
  return renderToStaticMarkup(
    <LocaleProvider locale="es" logicalPath="/distributor">
      <PortalAuthContext.Provider value={auth}>
        <ProtectedPortal distributor><p>Contenido privado</p></ProtectedPortal>
      </PortalAuthContext.Provider>
    </LocaleProvider>,
  )
}

describe('protected distributor portal', () => {
  it('sends signed-out partners to the dedicated Spanish login with a safe return path', () => {
    window.history.replaceState({}, '', '/es/distributor')
    const html = renderGate(baseAuth)

    expect(html).toContain('Portal de socios Encore')
    expect(html).toContain('href="/es/distributor/login?next=%2Fdistributor"')
    expect(html).not.toContain('/client-login')
  })

  it('shows a partner-specific review state before activation', () => {
    const html = renderGate({ ...baseAuth, identity: distributorIdentity('pending') })

    expect(html).toContain('Cuenta de socio en revisión')
    expect(html).toContain('href="/es/contact"')
    expect(html).not.toContain('Contenido privado')
  })

  it('allows only active distributors into the workspace', () => {
    const html = renderGate({ ...baseAuth, identity: distributorIdentity('active') })
    expect(html).toContain('Contenido privado')
  })
})
