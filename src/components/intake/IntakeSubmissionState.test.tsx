// @vitest-environment jsdom
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { PortalAuthContext } from '../../context/portalAuthStore'
import { defaultIntakeFormData } from '../../data/intake'
import { LocaleProvider } from '../../i18n/LocaleContext'
import { INTAKE_SESSION_KEY } from '../../lib/portal/intakeHandoff'
import { IntakePage } from './IntakePage'
import { createMemoryStorage } from '../../test/memoryStorage'

const handoffMocks = vi.hoisted(() => ({ submit: vi.fn() }))

vi.mock('../../lib/portal/intakeHandoff', async (importOriginal) => {
  const original = await importOriginal<typeof import('../../lib/portal/intakeHandoff')>()
  return { ...original, submitPublicIntake: handoffMocks.submit }
})

const completeForm = {
  ...defaultIntakeFormData,
  mainGoal: 'Metabolic Signaling' as const,
  topPriorities: ['Simple next steps'],
  timeline: 'Ready now',
  helpNeeded: ['Recommend a starting point', 'Answer questions first'],
  currentConcerns: ['Energy'],
  biometricsStatus: "I don't have them yet",
  lifestyleActivity: 'Moderate',
  sleepQuality: 'Good',
  energyLevels: 'Steady',
  peptideExperience: 'New to this',
  firstName: 'Research', lastName: 'Client', email: 'client@example.com', phone: '9155550100', city: 'El Paso',
  preferredContactMethod: 'Email', consentResearchUseOnly: true, consentNoMedicalAdvice: true, consentAccuracy: true,
  consentContact: true, consentInternalReview: true,
}

function seedDraft(locale: 'en' | 'es') {
  window.sessionStorage.setItem(INTAKE_SESSION_KEY, JSON.stringify({
    formData: completeForm,
    step: 2,
    phase: 'form',
    handoffToken: '00000000-0000-4000-8000-000000000051',
    locale,
  }))
}

function renderIntake(locale: 'en' | 'es') {
  const container = document.createElement('div')
  document.body.appendChild(container)
  const root = createRoot(container)
  act(() => {
    root.render(
      <LocaleProvider locale={locale} logicalPath="/intake">
        <PortalAuthContext.Provider value={{ identity: null, loading: false, configured: false, refresh: async () => {}, logout: async () => {} }}>
          <IntakePage />
        </PortalAuthContext.Provider>
      </LocaleProvider>,
    )
  })
  return { container, root }
}

describe('intake submission states', () => {
  let root: Root | null = null

  beforeEach(() => {
    window.sessionStorage.clear()
    vi.stubGlobal('localStorage', createMemoryStorage())
    handoffMocks.submit.mockReset()
  })

  afterEach(() => {
    if (root) act(() => root?.unmount())
    root = null
    document.body.innerHTML = ''
    vi.unstubAllGlobals()
  })

  it.each(['en', 'es'] as const)('shows immediate loading and unmistakable success in %s without duplicate submission', async (locale) => {
    let resolveSubmission: ((value: unknown) => void) | undefined
    handoffMocks.submit.mockImplementation(() => new Promise((resolve) => { resolveSubmission = resolve }))
    seedDraft(locale)
    const rendered = renderIntake(locale)
    root = rendered.root
    const form = rendered.container.querySelector('form')

    act(() => {
      form?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
      form?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
    })
    expect(handoffMocks.submit).toHaveBeenCalledTimes(1)
    expect(rendered.container.querySelector('[role="status"][aria-busy="true"]')).toBeTruthy()

    await act(async () => {
      resolveSubmission?.(completeForm)
      await Promise.resolve()
    })
    expect(rendered.container.querySelector('[role="status"]')?.textContent).toContain(locale === 'es' ? 'Solicitud recibida' : 'Request received')
    expect(rendered.container.textContent).toContain(locale === 'es' ? 'revisión interna' : 'internal review')
  })

  it.each(['en', 'es'] as const)('retains answers and provides an actionable retry after failure in %s', async (locale) => {
    handoffMocks.submit.mockRejectedValue(new Error('network failure'))
    seedDraft(locale)
    const rendered = renderIntake(locale)
    root = rendered.root
    await act(async () => {
      rendered.container.querySelector('form')?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
      await Promise.resolve()
    })

    expect(rendered.container.querySelector('[role="alert"]')).toBeTruthy()
    expect((rendered.container.querySelector('input[name="email"]') as HTMLInputElement).value).toBe('client@example.com')
    expect(Array.from(rendered.container.querySelectorAll('button')).some((button) => button.textContent?.includes(locale === 'es' ? 'Reintentar' : 'Retry'))).toBe(true)
  })
})
