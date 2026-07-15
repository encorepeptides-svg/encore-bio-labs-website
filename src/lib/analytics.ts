/**
 * Lightweight analytics shim. Events are dispatched as DOM CustomEvents under the
 * `encore:` namespace so any listener (a tag manager bridge, a test, etc.) can
 * subscribe without this module taking a hard dependency on a specific provider.
 * This is the single source of truth for the existing `encore:*` event contract
 * that product interactions already emit.
 */
export function track(name: string, detail: Record<string, unknown> = {}) {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(`encore:${name}`, { detail }))
}
