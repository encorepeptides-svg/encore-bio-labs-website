/**
 * Vitest's jsdom environment doesn't reliably expose window.localStorage in this
 * Node version — Node's own experimental global `localStorage` (which requires
 * `--localstorage-file` to function) shadows it, leaving `window.localStorage`
 * undefined. This in-memory Storage stand-in, installed via `vi.stubGlobal`,
 * sidesteps that without depending on Node flags. sessionStorage is unaffected.
 */
export function createMemoryStorage(): Storage {
  const store = new Map<string, string>()
  return {
    getItem: (key: string) => (store.has(key) ? store.get(key)! : null),
    setItem: (key: string, value: string) => {
      store.set(key, String(value))
    },
    removeItem: (key: string) => {
      store.delete(key)
    },
    clear: () => {
      store.clear()
    },
    key: (index: number) => Array.from(store.keys())[index] ?? null,
    get length() {
      return store.size
    },
  } as Storage
}
