// @vitest-environment jsdom
import { renderToStaticMarkup } from 'react-dom/server'
import { beforeEach, describe, expect, it } from 'vitest'
import { defaultIntakeFormData, isIntakeStepComplete, type IntakeFormData } from '../../data/intake'
import { LocaleProvider } from '../../i18n/LocaleContext'
import { translate } from '../../i18n/translate'
import { INTAKE_SESSION_KEY, IntakePage } from './IntakePage'

function completeContact(overrides: Partial<IntakeFormData> = {}): IntakeFormData {
  return {
    ...defaultIntakeFormData,
    firstName: 'Research',
    lastName: 'Client',
    preferredContactMethod: 'Email',
    email: 'client@example.com',
    consentResearchUseOnly: true,
    consentNoMedicalAdvice: true,
    consentAccuracy: true,
    consentContact: true,
    consentInternalReview: true,
    ...overrides,
  }
}

function renderOptionalStep(locale: 'en' | 'es') {
  window.sessionStorage.setItem(
    INTAKE_SESSION_KEY,
    JSON.stringify({
      formData: { ...defaultIntakeFormData, mainGoal: 'Metabolic Signaling' },
      step: 1,
      phase: 'form',
    }),
  )

  return renderToStaticMarkup(
    <LocaleProvider locale={locale} logicalPath="/intake">
      <IntakePage />
    </LocaleProvider>,
  )
}

describe('simplified research intake', () => {
  beforeEach(() => window.sessionStorage.clear())

  it('requires a goal but allows the optional-details step to be skipped', () => {
    expect(isIntakeStepComplete(0, defaultIntakeFormData)).toBe(false)
    expect(isIntakeStepComplete(0, { ...defaultIntakeFormData, mainGoal: 'Metabolic Signaling' })).toBe(true)
    expect(isIntakeStepComplete(1, defaultIntakeFormData)).toBe(true)
  })

  it('keeps contact and all compliance acknowledgments required without requiring biometrics or city', () => {
    const complete = completeContact()
    expect(isIntakeStepComplete(2, complete)).toBe(true)
    expect(complete.age).toBe('')
    expect(complete.currentWeight).toBe('')
    expect(complete.city).toBe('')
    expect(isIntakeStepComplete(2, { ...complete, consentResearchUseOnly: false })).toBe(false)
    expect(isIntakeStepComplete(2, { ...complete, email: '' })).toBe(false)
    expect(isIntakeStepComplete(2, { ...complete, preferredContactMethod: 'WhatsApp', email: '', phone: '9155550100' })).toBe(true)
  })

  it('renders the optional context collapsed and removes browser-required validation from optional fields', () => {
    const container = document.createElement('div')
    container.innerHTML = renderOptionalStep('en')

    expect(container.textContent).toContain('Step 2 of 3')
    expect(container.textContent).toContain('This entire step is optional.')
    expect(container.textContent).toContain('Skip for now')
    expect(container.querySelectorAll('details')).toHaveLength(2)
    expect(container.querySelector<HTMLInputElement>('input[name="age"]')?.required).toBe(false)
    expect(container.querySelector<HTMLSelectElement>('select[name="sex"]')?.required).toBe(false)
  })

  it('provides equivalent Spanish interface copy for the simplified flow', () => {
    const html = renderOptionalStep('es')

    expect(html).toContain('Paso 2 de 3')
    expect(html).toContain('Todo este paso es opcional.')
    expect(html).toContain('Omitir por ahora')
    expect(translate('es', 'intake', 'stepDetails')).not.toBe(translate('en', 'intake', 'stepDetails'))
    expect(translate('es', 'intake', 'optionalContextHelp')).not.toBe(translate('en', 'intake', 'optionalContextHelp'))
  })
})
