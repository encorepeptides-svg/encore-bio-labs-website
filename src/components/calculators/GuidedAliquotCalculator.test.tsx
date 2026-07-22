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
  it('renders the requested English labels, units, and defaults', () => {
    const html = renderCalculator()
    expect(html).toContain('Amount per draw')
    expect(html).toContain('Material in the vial')
    expect(html).toContain('Total diluent volume')
    expect(html).not.toContain('µg')
    expect(html).toContain('data-testid="target-preset-1"')
    expect(html).toContain('data-testid="target-preset-1" type="button" aria-pressed="true"')
    expect(html).toContain('data-testid="mass-preset-10" type="button" aria-pressed="true"')
    expect(html).toContain('data-testid="diluent-preset-2" type="button" aria-pressed="true"')
    expect(html).toContain('data-testid="aliquot-draw-units"')
    expect(html).toContain('20<span')
    expect((html.match(/data-testid="target-preset-/g) ?? [])).toHaveLength(5)
    expect((html.match(/data-testid="mass-preset-/g) ?? [])).toHaveLength(5)
    expect((html.match(/data-testid="diluent-preset-/g) ?? [])).toHaveLength(5)
    expect(html).toContain('data-testid="target-preset-4"')
    expect(html).toContain('data-testid="mass-preset-30"')
    expect(html).toContain('data-testid="diluent-preset-10"')
  })

  it('renders the updated Spanish labels and milligram formula', () => {
    const html = renderCalculator('es')
    expect(html).toContain('Cantidad por extracción')
    expect(html).toContain('Material en el vial')
    expect(html).toContain('Volumen total de diluyente')
    expect(html).toContain('mg por unidad')
    expect(html).not.toContain('µg')
  })
})
