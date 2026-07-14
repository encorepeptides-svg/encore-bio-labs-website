// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest'
import { readIntakeDraft, INTAKE_SESSION_KEY } from '../components/intake/IntakePage'
import { purchaseTypeLabel } from './displayLabels'
import { localizePath } from './config'
import { translate } from './translate'

const bilingualRoutes = ['/catalog', '/intake', '/research', '/categories/metabolic-weight-management', '/products/retatrutide', '/legal/terms', '/checkout', '/client-login']

describe('bilingual route contracts', () => {
  beforeEach(() => window.sessionStorage.clear())

  it('keeps stable intake values and draft state across a locale reload', () => {
    window.sessionStorage.setItem(INTAKE_SESSION_KEY, JSON.stringify({ formData: { mainGoal: 'Metabolic Signaling', preferredContactMethod: 'Email' }, step: 2, phase: 'form' }))
    const draft = readIntakeDraft()
    expect(draft.formData.mainGoal).toBe('Metabolic Signaling')
    expect(draft.formData.preferredContactMethod).toBe('Email')
    expect(localizePath('/intake', 'es')).toBe('/es/intake')
  })

  it('localizes stored purchase values without changing their storage contract', () => {
    const t = (key: string) => ({ purchaseTypeVialOnly: 'Solo vial', purchaseTypeCompleteKit: 'Kit completo Encore' }[key] ?? key)
    expect(purchaseTypeLabel(t, 'Vial Only')).toBe('Solo vial')
    expect(purchaseTypeLabel(t, 'Encore Complete Kit')).toBe('Kit completo Encore')
    expect(purchaseTypeLabel(t, 'Vial Only')).not.toBe('Vial Only')
  })

  it('prefixes every audited route in Spanish and never emits an unprefixed internal path', () => {
    for (const route of bilingualRoutes) {
      expect(localizePath(route, 'es')).toBe(`/es${route}`)
      expect(localizePath(route, 'es')).not.toMatch(/^\/(?:catalog|intake|research|categories|products|legal|checkout|client-login)/)
    }
  })

  it('keeps Spanish route content free of the most common untranslated shell labels', () => {
    expect(translate('es', 'researchLibrary', 'title')).not.toBe(translate('en', 'researchLibrary', 'title'))
    expect(translate('es', 'productResearch', 'researchSnapshot')).not.toBe(translate('en', 'productResearch', 'researchSnapshot'))
    expect(translate('es', 'categoryPage', 'findMatch')).not.toBe(translate('en', 'categoryPage', 'findMatch'))
    expect(translate('es', 'intake', 'stepGoal')).not.toBe('Goal')
    expect(translate('es', 'assistant', 'buttonLabel')).not.toBe('Ask Encore AI')
    expect(translate('es', 'common', 'purchaseTypeCompleteKit')).not.toBe('Encore Complete Kit')
  })
})
