/** @vitest-environment jsdom */

import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ProductHero } from './ProductHero'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('ProductHero reduced motion', () => {
  it('does not register scroll or pointer animation work when reduced motion is requested', async () => {
    vi.stubGlobal('matchMedia', vi.fn().mockImplementation((query: string) => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })))
    const addWindowListener = vi.spyOn(window, 'addEventListener')
    const container = document.createElement('div')
    const root = createRoot(container)

    await act(async () => {
      root.render(<ProductHero imageSrc="/test-vial.png" imageAlt="Test vial" />)
    })

    expect(addWindowListener.mock.calls.some(([eventName]) => eventName === 'scroll')).toBe(false)
    expect(addWindowListener.mock.calls.some(([eventName]) => eventName === 'pointermove')).toBe(false)

    await act(async () => root.unmount())
  })
})
