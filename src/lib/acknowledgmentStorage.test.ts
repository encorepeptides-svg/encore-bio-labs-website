import { beforeEach, describe, expect, it } from 'vitest'
import {
  createSiteEntryAcknowledgmentRecord,
  readSiteEntryAcknowledgment,
  SITE_ENTRY_ACKNOWLEDGMENT_DURATION_MS,
  SITE_ENTRY_ACKNOWLEDGMENT_STORAGE_KEY,
  storeSiteEntryAcknowledgment,
} from './acknowledgmentStorage'
import { createMemoryStorage } from '../test/memoryStorage'

const acceptedAt = '2026-07-26T12:00:00.000Z'
const acceptedAtMs = Date.parse(acceptedAt)

describe('site-entry acknowledgment storage', () => {
  let localStorage: Storage
  let sessionStorage: Storage

  beforeEach(() => {
    localStorage = createMemoryStorage()
    sessionStorage = createMemoryStorage()
  })

  it('stores only the minimal acceptance record and reads it for 30 days', () => {
    const record = createSiteEntryAcknowledgmentRecord('en', acceptedAt)

    expect(storeSiteEntryAcknowledgment(record, localStorage, sessionStorage)).toBe('local')
    expect(JSON.parse(localStorage.getItem(SITE_ENTRY_ACKNOWLEDGMENT_STORAGE_KEY)!)).toEqual({
      accepted: true,
      version: 'site-entry-ruo-v1',
      acceptedAt,
      locale: 'en',
    })
    expect(readSiteEntryAcknowledgment(
      acceptedAtMs + SITE_ENTRY_ACKNOWLEDGMENT_DURATION_MS - 1,
      localStorage,
      sessionStorage,
    )).toEqual(record)
  })

  it('expires at 30 days and removes the stale record', () => {
    storeSiteEntryAcknowledgment(
      createSiteEntryAcknowledgmentRecord('es', acceptedAt),
      localStorage,
      sessionStorage,
    )

    expect(readSiteEntryAcknowledgment(
      acceptedAtMs + SITE_ENTRY_ACKNOWLEDGMENT_DURATION_MS,
      localStorage,
      sessionStorage,
    )).toBeNull()
    expect(localStorage.getItem(SITE_ENTRY_ACKNOWLEDGMENT_STORAGE_KEY)).toBeNull()
  })

  it('rejects a record from a previous acknowledgment version', () => {
    localStorage.setItem(SITE_ENTRY_ACKNOWLEDGMENT_STORAGE_KEY, JSON.stringify({
      accepted: true,
      version: 'site-entry-ruo-v0',
      acceptedAt,
      locale: 'en',
    }))

    expect(readSiteEntryAcknowledgment(acceptedAtMs + 1, localStorage, sessionStorage)).toBeNull()
  })

  it('falls back to session storage when local storage is blocked', () => {
    const blockedStorage = {
      getItem: () => {
        throw new Error('blocked')
      },
      setItem: () => {
        throw new Error('blocked')
      },
      removeItem: () => {
        throw new Error('blocked')
      },
    }
    const record = createSiteEntryAcknowledgmentRecord('en', acceptedAt)

    expect(storeSiteEntryAcknowledgment(record, blockedStorage, sessionStorage)).toBe('session')
    expect(readSiteEntryAcknowledgment(acceptedAtMs + 1, blockedStorage, sessionStorage)).toEqual(record)
  })

  it('uses page-memory state only when both browser stores are unavailable', () => {
    const record = createSiteEntryAcknowledgmentRecord('en', acceptedAt)
    expect(storeSiteEntryAcknowledgment(record, undefined, undefined)).toBe('memory')
  })
})
