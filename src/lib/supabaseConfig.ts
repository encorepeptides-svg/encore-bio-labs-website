export type SupabaseBrowserConfig = {
  supabaseUrl?: string
  supabaseAnonKey?: string
}

// Supabase publishable keys are intentionally browser-safe. Keeping the
// production fallback here prevents a static host from disabling the portal
// when build-time environment injection is unavailable.
const productionConfig: Required<SupabaseBrowserConfig> = {
  supabaseUrl: 'https://rrrkjohvxbsahxxevzcg.supabase.co',
  supabaseAnonKey: 'sb_publishable_JgR_u_-_ADV029BOMGjRng_nK2kclR9',
}

declare global {
  interface Window {
    __ENCORE_RUNTIME_CONFIG__?: SupabaseBrowserConfig
  }
}

export function resolveSupabaseBrowserConfig(buildConfig: SupabaseBrowserConfig) {
  const runtimeConfig = typeof window === 'undefined' ? undefined : window.__ENCORE_RUNTIME_CONFIG__
  return {
    supabaseUrl: runtimeConfig?.supabaseUrl || buildConfig.supabaseUrl || productionConfig.supabaseUrl,
    supabaseAnonKey: runtimeConfig?.supabaseAnonKey || buildConfig.supabaseAnonKey || productionConfig.supabaseAnonKey,
  }
}
