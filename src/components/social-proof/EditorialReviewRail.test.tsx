// @vitest-environment jsdom
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { LocaleProvider } from '../../i18n/LocaleContext'
import type { Locale } from '../../i18n/config'
import { EditorialReviewRail, type EditorialReviewItem } from './EditorialReviewRail'

const reviews: EditorialReviewItem[] = [
  {
    id: 'review-one',
    category: 'service',
    quote: 'Original English review text.',
    displayName: 'A. Reviewer',
    reviewTitle: 'Original English title',
    productName: 'BPC-157',
    rating: 5,
    verifiedPurchase: true,
    reviewDate: '2026-07-01',
    approvedPhoto: null,
    altText: '',
    incentiveDisclosure: '',
    relationshipToBusiness: 'Verified customer',
    sortOrder: 0,
  },
  {
    id: 'review-two',
    category: 'documentation',
    quote: 'The paperwork was easy to locate.',
    displayName: 'B. Reviewer',
    reviewTitle: 'Clear paperwork',
    productName: 'TB-500',
    rating: 4,
    verifiedPurchase: false,
    reviewDate: '2026-07-02',
    approvedPhoto: null,
    altText: '',
    incentiveDisclosure: 'No incentive provided.',
    relationshipToBusiness: 'Verified customer',
    sortOrder: 1,
  },
  {
    id: 'review-three',
    category: 'fulfillment',
    quote: 'The package arrived on schedule.',
    displayName: 'C. Reviewer',
    reviewTitle: 'On-time package',
    productName: 'GHK-Cu',
    rating: 5,
    verifiedPurchase: true,
    reviewDate: '2026-07-03',
    approvedPhoto: null,
    altText: '',
    incentiveDisclosure: '',
    relationshipToBusiness: 'Verified customer',
    sortOrder: 2,
  },
]

function rail(locale: Locale, mode: 'published' | 'draft' = 'published') {
  return (
    <LocaleProvider locale={locale} logicalPath="/">
      <EditorialReviewRail items={reviews} mode={mode} />
    </LocaleProvider>
  )
}

describe('EditorialReviewRail', () => {
  let container: HTMLDivElement
  let root: Root | undefined

  beforeEach(() => {
    container = document.createElement('div')
    document.body.append(container)
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: vi.fn().mockReturnValue({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }),
    })
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      callback(0)
      return 1
    })
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => undefined)
  })

  afterEach(async () => {
    if (root) await act(async () => root?.unmount())
    root = undefined
    container.remove()
    vi.restoreAllMocks()
  })

  it('keeps customer content in its original language on the Spanish interface', () => {
    const html = renderToStaticMarkup(rail('es', 'draft'))

    expect(html).toContain('Original English title')
    expect(html).toContain('Original English review text.')
    expect(html).toContain('Las reseñas se muestran en su idioma original')
    expect(html).toContain('Mostrar la siguiente reseña')
    expect(html).toContain('Borrador · No publicado')
    expect(html.match(/Original English review text\./g)).toHaveLength(1)
  })

  it('renders only populated filters and does not duplicate review cards', () => {
    const html = renderToStaticMarkup(rail('en'))

    expect(html).toContain('All reviews')
    expect(html).toContain('Service')
    expect(html).toContain('Documentation')
    expect(html).toContain('Fulfillment')
    expect(html).not.toContain('>Support<')
    expect(html.match(/data-review-rail-card/g)).toHaveLength(3)
  })

  it('moves with controls and respects the beginning and end boundaries', async () => {
    root = createRoot(container)
    await act(async () => root?.render(rail('en')))

    const scroller = container.querySelector<HTMLElement>('[aria-roledescription="review carousel"]')!
    const cards = Array.from(container.querySelectorAll<HTMLElement>('[data-review-rail-card]'))
    let scrollLeft = 0
    Object.defineProperties(scroller, {
      clientWidth: { configurable: true, value: 300 },
      scrollWidth: { configurable: true, value: 900 },
      scrollLeft: {
        configurable: true,
        get: () => scrollLeft,
        set: (value: number) => { scrollLeft = value },
      },
    })
    cards.forEach((card, index) => Object.defineProperty(card, 'offsetLeft', { configurable: true, value: index * 300 }))
    const scrollTo = vi.fn(({ left }: ScrollToOptions) => {
      scrollLeft = Number(left ?? 0)
      scroller.dispatchEvent(new Event('scroll'))
    })
    Object.defineProperty(scroller, 'scrollTo', { configurable: true, value: scrollTo })

    await act(async () => scroller.dispatchEvent(new Event('scroll')))
    const previous = container.querySelector<HTMLButtonElement>('button[aria-label="Show previous review"]')!
    const next = container.querySelector<HTMLButtonElement>('button[aria-label="Show next review"]')!
    expect(previous.disabled).toBe(true)
    expect(next.disabled).toBe(false)

    await act(async () => next.click())
    expect(scrollTo).toHaveBeenLastCalledWith(expect.objectContaining({ left: 300 }))

    scrollLeft = 600
    await act(async () => scroller.dispatchEvent(new Event('scroll')))
    expect(previous.disabled).toBe(false)
    expect(next.disabled).toBe(true)
  })

  it('supports ArrowLeft and ArrowRight while the rail has focus', async () => {
    root = createRoot(container)
    await act(async () => root?.render(rail('en')))
    const scroller = container.querySelector<HTMLElement>('[aria-roledescription="review carousel"]')!
    const cards = Array.from(container.querySelectorAll<HTMLElement>('[data-review-rail-card]'))
    let scrollLeft = 0
    Object.defineProperties(scroller, {
      clientWidth: { configurable: true, value: 300 },
      scrollWidth: { configurable: true, value: 900 },
      scrollLeft: {
        configurable: true,
        get: () => scrollLeft,
        set: (value: number) => { scrollLeft = value },
      },
    })
    cards.forEach((card, index) => Object.defineProperty(card, 'offsetLeft', { configurable: true, value: index * 300 }))
    const scrollTo = vi.fn(({ left }: ScrollToOptions) => { scrollLeft = Number(left ?? 0) })
    Object.defineProperty(scroller, 'scrollTo', { configurable: true, value: scrollTo })

    scroller.focus()
    await act(async () => scroller.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true })))
    expect(scrollTo).toHaveBeenLastCalledWith(expect.objectContaining({ left: 300 }))
    await act(async () => scroller.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true })))
    expect(scrollTo).toHaveBeenLastCalledWith(expect.objectContaining({ left: 0 }))
  })
})
