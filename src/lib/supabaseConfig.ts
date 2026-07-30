export type SupabaseBrowserConfig = {
  supabaseUrl?: string
  supabaseAnonKey?: string
}

declare global {
  interface Window {
    __ENCORE_RUNTIME_CONFIG__?: SupabaseBrowserConfig
  }
}

export function resolveSupabaseBrowserConfig(buildConfig: SupabaseBrowserConfig) {
  const runtimeConfig = typeof window === 'undefined' ? undefined : window.__ENCORE_RUNTIME_CONFIG__
  return {
    supabaseUrl: runtimeConfig?.supabaseUrl || buildConfig.supabaseUrl,
    supabaseAnonKey: runtimeConfig?.supabaseAnonKey || buildConfig.supabaseAnonKey,
  }
}
