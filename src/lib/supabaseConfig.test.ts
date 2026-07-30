// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { resolveSupabaseBrowserConfig } from './supabaseConfig'

describe('Supabase browser configuration', () => {
  afterEach(() => { delete window.__ENCORE_RUNTIME_CONFIG__ })

  it('uses the hosted runtime configuration when it is available', () => {
    window.__ENCORE_RUNTIME_CONFIG__ = {
      supabaseUrl: 'https://runtime.example.supabase.co',
      supabaseAnonKey: 'runtime-publishable-key',
    }
    expect(resolveSupabaseBrowserConfig({
      supabaseUrl: 'https://build.example.supabase.co',
      supabaseAnonKey: 'build-publishable-key',
    })).toEqual({
      supabaseUrl: 'https://runtime.example.supabase.co',
      supabaseAnonKey: 'runtime-publishable-key',
    })
  })

  it('falls back to Vite build values for local development', () => {
    expect(resolveSupabaseBrowserConfig({
      supabaseUrl: 'http://127.0.0.1:54321',
      supabaseAnonKey: 'local-publishable-key',
    })).toEqual({
      supabaseUrl: 'http://127.0.0.1:54321',
      supabaseAnonKey: 'local-publishable-key',
    })
  })
})
