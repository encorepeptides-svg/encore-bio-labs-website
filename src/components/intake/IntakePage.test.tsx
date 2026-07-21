// @vitest-environment jsdom
import { renderToStaticMarkup } from 'react-dom/server'
import { beforeEach, describe, expect, it } from 'vitest'
import {
  createLeadFromIntake,
  defaultIntakeFormData,
  generateRecommendation,
  isIntakeStepComplete,
  type IntakeFormData,
} from '../../data/intake'
import { LocaleProvider } from '../../i18n/LocaleContext'
import { translate } from '../../i18n/translate'
import { INTAKE_SESSION_KEY, IntakePage } from './IntakePage'

function completeGoals(overrides: Partial<IntakeFormData> = {}): IntakeFormData {
  return {
    ...defaultIntakeFormData,
    mainGoal: 'Metabolic Signaling',
    topPriorities: ['Simple next steps'],
    timeline: 'Ready now',
    helpNeeded: 'Recommend a starting point',
    ...overrides,
  }
}

function completeSituation(overrides: Partial<IntakeFormData> = {}): IntakeFormData {
  return {
    ...completeGoals(),
    currentConcerns: ['Energy', 'Sleep'],
    lifestyleActivity: 'Moderate',
    sleepQuality: 'Inconsistent',
    energyLevels: 'Variable',
    peptideExperience: 'New to this',
    biometricsStatus: "I don't have them yet",
    ...overrides,
  }
}

function completeContact(overrides: Partial<IntakeFormData> = {}): IntakeFormData {
  return {
    ...completeSituation(),
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

function renderStep(locale: 'en' | 'es', step: number, formData: IntakeFormData) {
  window.sessionStorage.setItem(
    INTAKE_SESSION_KEY,
    JSON.stringify({ formData, step, phase: 'form' }),
  )

  return renderToStaticMarkup(
    <LocaleProvider locale={locale} logicalPath="/intake">
      <IntakePage />
    </LocaleProvider>,
  )
}

describe('direct client intake flow', () => {
  beforeEach(() => window.sessionStorage.clear())

  it('requires a goal, priority, timeline, and expected help in step 1', () => {
    expect(isIntakeStepComplete(0, defaultIntakeFormData)).toBe(false)
    expect(isIntakeStepComplete(0, completeGoals({ topPriorities: [] }))).toBe(false)
    expect(isIntakeStepComplete(0, completeGoals({ timeline: '' }))).toBe(false)
    expect(isIntakeStepComplete(0, completeGoals({ helpNeeded: '' }))).toBe(false)
    expect(isIntakeStepComplete(0, completeGoals())).toBe(true)
  })

  it('makes guided situation answers expected while accepting unavailable measurements', () => {
    expect(isIntakeStepComplete(1, completeGoals())).toBe(false)
    expect(isIntakeStepComplete(1, completeSituation({ currentConcerns: [] }))).toBe(false)
    expect(isIntakeStepComplete(1, completeSituation({ biometricsStatus: '' }))).toBe(false)
    expect(isIntakeStepComplete(1, completeSituation())).toBe(true)
    expect(completeSituation().age).toBe('')
    expect(completeSituation().currentWeight).toBe('')
  })

  it('keeps contact and all compliance acknowledgments required', () => {
    const complete = completeContact()
    expect(isIntakeStepComplete(2, complete)).toBe(true)
    expect(isIntakeStepComplete(2, { ...complete, consentResearchUseOnly: false })).toBe(false)
    expect(isIntakeStepComplete(2, { ...complete, email: '' })).toBe(false)
    expect(isIntakeStepComplete(2, { ...complete, preferredContactMethod: 'WhatsApp', email: '', phone: '9155550100' })).toBe(true)
  })

  it('renders plain-language selectable questions without open text areas', () => {
    const container = document.createElement('div')
    container.innerHTML = renderStep('en', 0, defaultIntakeFormData)

    expect(container.textContent).toContain('What do you want help with most?')
    expect(container.textContent).toContain('What matters most to you?')
    expect(container.textContent).toContain('When do you want to move forward?')
    expect(container.textContent).not.toContain('Metabolic Signaling')
    expect(container.querySelectorAll('textarea')).toHaveLength(0)
    expect(container.querySelectorAll('input[type="checkbox"][name="topPriorities"]')).toHaveLength(6)
  })

  it('stores the new profile answers in the submitted lead', () => {
    const data = completeContact()
    const lead = createLeadFromIntake(data, generateRecommendation(data))

    expect(lead.lifestyleAnswers.topPriorities).toEqual(['Simple next steps'])
    expect(lead.lifestyleAnswers.timeline).toBe('Ready now')
    expect(lead.lifestyleAnswers.helpNeeded).toBe('Recommend a starting point')
    expect(lead.lifestyleAnswers.currentConcerns).toEqual(['Energy', 'Sleep'])
    expect(lead.lifestyleAnswers.biometricsStatus).toBe("I don't have them yet")
  })

  it('provides equivalent Spanish interface copy for both redesigned steps', () => {
    const goalHtml = renderStep('es', 0, defaultIntakeFormData)
    const situationHtml = renderStep('es', 1, completeGoals())

    expect(goalHtml).toContain('¿En qué necesitas más ayuda?')
    expect(goalHtml).toContain('¿Cuándo quieres avanzar?')
    expect(situationHtml).toContain('Ayúdanos a entender qué está pasando ahora.')
    expect(situationHtml).toContain('Todavía no las tengo')
    expect(translate('es', 'intake', 'stepSituation')).not.toBe(translate('en', 'intake', 'stepSituation'))
    expect(translate('es', 'intake', 'biometricsHelp')).not.toBe(translate('en', 'intake', 'biometricsHelp'))
  })
})
