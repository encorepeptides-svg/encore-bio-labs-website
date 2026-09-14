// @vitest-environment jsdom
import { renderToStaticMarkup } from 'react-dom/server'
import { beforeEach, describe, expect, it } from 'vitest'
import {
  createLeadFromIntake,
  defaultIntakeFormData,
  generateRecommendation,
  isIntakeStepComplete,
  updateIntakeStringField,
  type IntakeFormData,
} from '../../data/intake'
import { LocaleProvider } from '../../i18n/LocaleContext'
import { translate } from '../../i18n/translate'
import { PortalAuthProvider } from '../../context/PortalAuthContext'
import { INTAKE_SESSION_KEY, IntakePage } from './IntakePage'

function completeGoals(overrides: Partial<IntakeFormData> = {}): IntakeFormData {
  return {
    ...defaultIntakeFormData,
    mainGoal: 'Metabolic Signaling',
    topPriorities: ['Simple next steps'],
    timeline: 'Ready now',
    helpNeeded: ['Recommend a starting point'],
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
    interestedProducts: ['NAD+'],
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
    phone: '9155550100',
  phoneCountry: 'United States',
    city: 'El Paso',
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
      <PortalAuthProvider>
        <IntakePage />
      </PortalAuthProvider>
    </LocaleProvider>,
  )
}

describe('direct client intake flow', () => {
  beforeEach(() => window.sessionStorage.clear())

  it('requires a goal, priority, timeline, and expected help in step 1', () => {
    expect(isIntakeStepComplete(0, defaultIntakeFormData)).toBe(false)
    expect(isIntakeStepComplete(0, completeGoals({ topPriorities: [] }))).toBe(false)
    expect(isIntakeStepComplete(0, completeGoals({ timeline: '' }))).toBe(false)
    expect(isIntakeStepComplete(0, completeGoals({ helpNeeded: [] }))).toBe(false)
    expect(isIntakeStepComplete(0, completeGoals())).toBe(true)
  })

  it('requires all visible situation answers', () => {
    expect(isIntakeStepComplete(1, completeGoals())).toBe(false)
    expect(isIntakeStepComplete(1, completeSituation({ currentConcerns: [] }))).toBe(false)
    expect(isIntakeStepComplete(1, completeSituation({ interestedProducts: [] }))).toBe(true)
    expect(isIntakeStepComplete(1, completeSituation({ peptideExperience: 'Some experience', interestedProducts: [] }))).toBe(true)
    expect(isIntakeStepComplete(1, completeSituation())).toBe(true)
  })

  it('collects no body measurement anywhere in the intake form data', () => {
    const data = completeSituation() as Record<string, unknown>
    for (const key of ['biometricsStatus', 'age', 'sex', 'height', 'currentWeight', 'goalWeight', 'bodyFat', 'waist']) {
      expect(data).not.toHaveProperty(key)
    }
  })

  it('keeps contact and all compliance acknowledgments required', () => {
    const complete = completeContact()
    expect(isIntakeStepComplete(2, complete)).toBe(true)
    expect(isIntakeStepComplete(2, { ...complete, consentResearchUseOnly: false })).toBe(false)
    expect(isIntakeStepComplete(2, { ...complete, email: '' })).toBe(false)
    expect(isIntakeStepComplete(2, { ...complete, phone: '' })).toBe(false)
    expect(isIntakeStepComplete(2, { ...complete, city: '' })).toBe(false)
    expect(isIntakeStepComplete(2, { ...complete, preferredContactMethod: 'WhatsApp' })).toBe(true)
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
    expect(container.querySelectorAll('input[type="checkbox"][name="helpNeeded"]')).toHaveLength(4)
  })

  it('stores the new profile answers in the submitted lead', () => {
    const data = completeContact()
    const lead = createLeadFromIntake(data, generateRecommendation(data))

    expect(lead.lifestyleAnswers.topPriorities).toEqual(['Simple next steps'])
    expect(lead.lifestyleAnswers.timeline).toBe('Ready now')
    expect(lead.lifestyleAnswers.helpNeeded).toEqual(['Recommend a starting point'])
    expect(lead.lifestyleAnswers.currentConcerns).toEqual(['Energy', 'Sleep'])
    expect(lead.lifestyleAnswers.biometricsStatus).toBeUndefined()
  })

  it('clears hidden product interests for first-time clients and keeps them for other experience levels', () => {
    const withProducts = completeSituation({ peptideExperience: 'Some experience', interestedProducts: ['Retatrutide'] })
    expect(updateIntakeStringField(withProducts, 'peptideExperience', 'New to this').interestedProducts).toEqual([])
    expect(updateIntakeStringField(withProducts, 'peptideExperience', 'Very experienced').interestedProducts).toEqual(['Retatrutide'])
  })

  it('renders first-time reassurance plus optional product suggestions in both languages', () => {
    const english = renderStep('en', 1, completeSituation({ interestedProducts: [] }))
    const spanish = renderStep('es', 1, completeSituation({ interestedProducts: [] }))

    expect(english).toContain('help identify relevant research options')
    expect(spanish).toContain('ayudar a identificar opciones de investigación relevantes')
    expect(english).toContain('Which products are you interested in?')
    expect(spanish).toContain('¿Qué productos te interesan?')
    expect(english).toContain('(Optional)')
    expect(spanish).toContain('(Opcional)')
  })

  it('offers products that match the primary goal selected on the previous page', () => {
    const metabolic = renderStep('en', 1, completeSituation({ mainGoal: 'Metabolic Signaling', interestedProducts: [] }))
    const endocrine = renderStep('en', 1, completeSituation({ mainGoal: 'Endocrine Signaling', interestedProducts: [] }))

    expect(metabolic).toContain('Retatrutide')
    expect(metabolic).not.toContain('Kisspeptin')
    expect(endocrine).toContain('Kisspeptin')
    expect(endocrine).not.toContain('Retatrutide')
  })

  it('provides equivalent Spanish interface copy for both redesigned steps', () => {
    const goalHtml = renderStep('es', 0, defaultIntakeFormData)
    const situationHtml = renderStep('es', 1, completeGoals())

    expect(goalHtml).toContain('¿En qué necesitas más ayuda?')
    expect(goalHtml).toContain('¿Cuándo quieres avanzar?')
    expect(situationHtml).toContain('Ayúdanos a entender qué está pasando ahora.')
    expect(situationHtml).toContain('¿Qué tan familiarizado estás con estos productos?')
    expect(translate('es', 'intake', 'stepSituation')).not.toBe(translate('en', 'intake', 'stepSituation'))
    expect(translate('es', 'intake', 'experienceQuestion')).not.toBe(translate('en', 'intake', 'experienceQuestion'))
  })

  it('renders no body-measurement input on the situation step in either language', () => {
    for (const locale of ['en', 'es'] as const) {
      const html = renderStep(locale, 1, completeGoals())
      for (const name of ['biometricsStatus', 'age', 'sex', 'height', 'currentWeight', 'goalWeight']) {
        expect(html).not.toContain(`name="${name}"`)
      }
    }
  })
})
