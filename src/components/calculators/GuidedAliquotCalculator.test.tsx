import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { LocaleProvider } from '../../i18n/LocaleContext'
import { GuidedAliquotCalculator } from './GuidedAliquotCalculator'

function renderCalculator(locale: 'en' | 'es' = 'en') {
  return renderToStaticMarkup(
    <LocaleProvider locale={locale} logicalPath="/protocols/cellular-energy-research">
      <GuidedAliquotCalculator />
    </LocaleProvider>,
  )
}

describe('GuidedAliquotCalculator', () => {
  it('renders the requested English labels, bench units, and defaults', () => {
    const html = renderCalculator()
    expect(html).toContain('Mass per aliquot')
    expect(html).toContain('Material in the vial')
    expect(html).toContain('Total diluent volume')
    expect(html).toContain('µg/µL')
    expect(html).toContain('data-testid="target-preset-1"')
    expect(html).toContain('data-testid="target-preset-1" type="button" aria-pressed="true"')
    expect(html).toContain('data-testid="mass-preset-10" type="button" aria-pressed="true"')
    expect(html).toContain('data-testid="diluent-preset-2" type="button" aria-pressed="true"')
    expect(html).toContain('data-testid="aliquot-transfer-volume"')
    expect(html).toContain('200<span')
    expect((html.match(/data-testid="target-preset-/g) ?? [])).toHaveLength(5)
    expect((html.match(/data-testid="mass-preset-/g) ?? [])).toHaveLength(5)
    expect((html.match(/data-testid="diluent-preset-/g) ?? [])).toHaveLength(5)
    expect(html).toContain('data-testid="target-preset-4"')
    expect(html).toContain('data-testid="mass-preset-30"')
    expect(html).toContain('data-testid="diluent-preset-10"')
  })

  it('renders the Spanish labels and the bench-unit formula', () => {
    const html = renderCalculator('es')
    expect(html).toContain('Masa por alícuota')
    expect(html).toContain('Material en el vial')
    expect(html).toContain('Volumen total de diluyente')
    expect(html).toContain('µg/µL')
    expect(html).toContain('por alícuota')
  })

  it('states no transfer in U-100 syringe units in either locale', () => {
    for (const html of [renderCalculator(), renderCalculator('es')]) {
      expect(html).not.toContain('U-100')
      expect(html).not.toContain('syringe')
      expect(html).not.toContain('jeringa')
    }
  })
})
