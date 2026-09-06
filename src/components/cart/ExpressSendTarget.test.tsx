import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'

const source = readFileSync(new URL('./ExpressOrderDialog.tsx', import.meta.url), 'utf8')

/**
 * The hand-off to WhatsApp has to survive an in-app browser.
 *
 * Instagram, Facebook and TikTok open links in a webview that blocks
 * `window.open` outright, and pop-up blockers do the same elsewhere. When it is
 * blocked nothing happens and there is no error for the shopper to react to —
 * they just tap Send and sit there. A user-initiated anchor navigation is never
 * blocked, so the send control must stay an anchor.
 *
 * This reads the source rather than rendering because what matters is the
 * element type and the absence of a call, neither of which is observable from
 * the rendered output in a way that would fail if someone swapped it back.
 */
describe('the WhatsApp hand-off', () => {
  it('never reaches WhatsApp through window.open', () => {
    // Matches a call specifically. The prose above the handler names the API in
    // backticks to explain why it is not used, and that must not trip this.
    expect(source).not.toMatch(/window\.open\s*\(/)
  })

  it('sends through an anchor carrying the order URL', () => {
    expect(source).toMatch(/<a\s+href=\{readyToSend \? buildExpressOrderUrl\(orderInput\) : '#'\}/)
  })

  it('cancels the navigation instead of sending an incomplete order', () => {
    expect(source).toMatch(/if \(!readyToSend\) \{\s*event\.preventDefault\(\)/)
  })

  it('offers the copy-out before sending, not only after', () => {
    // The fallback panel must not be gated behind `sent`: a shopper whose
    // hand-off was swallowed never reaches that state.
    expect(source).not.toContain('{sent ? (\n                      <div className="rounded-2xl border border-[#25d366]/40')
    expect(source).toContain("t(sent ? 'expressSentTitle' : 'expressFallbackTitle')")
  })
})
