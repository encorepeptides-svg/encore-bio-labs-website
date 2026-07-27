// @vitest-environment jsdom
import { act, useState } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
import {
  createEmptyCheckoutAcknowledgmentState,
  isCheckoutAcknowledgmentComplete,
  type CheckoutAcknowledgmentState,
} from '../../data/acknowledgmentContent'
import { LocaleProvider } from '../../i18n/LocaleContext'
import { CheckoutAcknowledgment } from './CheckoutAcknowledgment'

function Harness() {
  const [value, setValue] = useState<CheckoutAcknowledgmentState>(
    createEmptyCheckoutAcknowledgmentState,
  )
  return (
    <>
      <CheckoutAcknowledgment value={value} onChange={setValue} />
      <button type="button" data-final-order="" disabled={!isCheckoutAcknowledgmentComplete(value)}>
        Final order
      </button>
    </>
  )
}

describe('checkout acknowledgment', () => {
  let root: Root | null = null
  let container: HTMLDivElement

  afterEach(() => {
    if (root) act(() => root?.unmount())
    root = null
    document.body.innerHTML = ''
  })

  function render(locale: 'en' | 'es') {
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
    act(() => {
      root?.render(
        <LocaleProvider locale={locale} logicalPath="/checkout">
          <Harness />
        </LocaleProvider>,
      )
    })
  }

  it('starts with five unchecked boxes and keeps the final action disabled', () => {
    render('en')
    const boxes = Array.from(container.querySelectorAll<HTMLInputElement>('input[type="checkbox"]'))
    expect(boxes).toHaveLength(5)
    expect(boxes.every((box) => !box.checked)).toBe(true)
    expect(container.querySelector<HTMLButtonElement>('[data-final-order]')?.disabled).toBe(true)
    expect(container.querySelector('[role="status"]')?.textContent).toContain('Complete all five')
  })

  it('enables the final action only after every independent checkbox is selected', () => {
    render('en')
    const boxes = Array.from(container.querySelectorAll<HTMLInputElement>('input[type="checkbox"]'))
    for (const [index, box] of boxes.entries()) {
      act(() => box.click())
      expect(container.querySelector<HTMLButtonElement>('[data-final-order]')?.disabled)
        .toBe(index < boxes.length - 1)
    }
    expect(container.querySelector('[role="status"]')?.textContent).toContain('All required')
  })

  it('uses working locale-correct legal links and equivalent Spanish wording', () => {
    render('es')
    expect(container.textContent).toContain('Confirma el uso responsable para investigación')
    expect(container.textContent).toContain('Confirmo que tengo al menos 18 años.')
    expect(container.querySelector('a[href="/es/legal/terms"]')).toBeTruthy()
    expect(container.querySelector('a[href="/es/legal/privacy"]')).toBeTruthy()
    expect(container.querySelector('a[href="/es/legal/research-use-only"]')).toBeTruthy()
    expect(container.querySelector('a[href="/es/legal/shipping-returns"]')).toBeTruthy()
  })

  it('keeps policy links independent from the policy checkbox', () => {
    render('en')
    const policyCheckbox = container.querySelector<HTMLInputElement>(
      '#checkout-acknowledgment-policies',
    )!
    const termsLink = container.querySelector<HTMLAnchorElement>('a[href="/legal/terms"]')!

    expect(policyCheckbox.checked).toBe(false)
    expect(policyCheckbox.closest('div')?.querySelector(':scope > span')?.textContent).toBe(
      'I agree to the Terms, Privacy Policy, Research Use Only Policy, and Shipping and Returns Policy.',
    )
    act(() => termsLink.click())
    expect(policyCheckbox.checked).toBe(false)
    expect(termsLink.target).toBe('_blank')
  })

  it('returns to five unchecked boxes when the checkout is remounted', () => {
    render('en')
    for (const box of container.querySelectorAll<HTMLInputElement>('input[type="checkbox"]')) {
      act(() => box.click())
    }
    expect(container.querySelector<HTMLButtonElement>('[data-final-order]')?.disabled).toBe(false)

    act(() => root?.unmount())
    root = null
    container.remove()
    render('en')
    expect(Array.from(container.querySelectorAll<HTMLInputElement>('input[type="checkbox"]'))
      .every((box) => !box.checked)).toBe(true)
  })
})
