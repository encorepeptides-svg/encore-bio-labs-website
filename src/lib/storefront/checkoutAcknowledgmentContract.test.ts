import { describe, expect, it } from 'vitest'
import {
  ACKNOWLEDGMENT_POLICY_VERSIONS,
  CHECKOUT_ACKNOWLEDGMENT_VERSION,
  getCheckoutAcknowledgmentLanguage,
} from '../../data/acknowledgmentContent'
import migration from '../../../supabase/migrations/20260727031812_add_checkout_acknowledgment_audit.sql?raw'
import edgeFunction from '../../../supabase/functions/shipping-checkout/index.ts?raw'

describe('checkout acknowledgment server contract', () => {
  it('adds a complete audit tuple to the existing order record', () => {
    for (const column of [
      'checkout_acknowledgment_version',
      'checkout_acknowledged_at',
      'checkout_acknowledgment_language',
      'checkout_acknowledgment_locale',
      'checkout_policy_versions',
    ]) {
      expect(migration).toContain(`add column if not exists ${column}`)
      expect(edgeFunction).toContain(`${column}:`)
    }
    expect(migration).toContain('jsonb_array_length(checkout_acknowledgment_language) = 5')
    expect(migration).toContain("checkout_acknowledgment_locale in ('en', 'es')")
  })

  it('blocks order creation when the audit is missing or invalid', () => {
    expect(edgeFunction).toContain("checkout_acknowledgment_required")
    expect(edgeFunction).toContain('422')
    expect(edgeFunction).toContain('checkoutAcknowledgment(body.checkoutAcknowledgment, locale)')
  })

  it('keeps frontend and server acknowledgment versions, language, and policies synchronized', () => {
    expect(edgeFunction).toContain(`const CHECKOUT_ACKNOWLEDGMENT_VERSION = '${CHECKOUT_ACKNOWLEDGMENT_VERSION}'`)
    for (const statement of [
      ...getCheckoutAcknowledgmentLanguage('en'),
      ...getCheckoutAcknowledgmentLanguage('es'),
    ]) {
      expect(edgeFunction).toContain(`'${statement.replaceAll("'", "\\'")}'`)
    }
    for (const [id, version] of Object.entries(ACKNOWLEDGMENT_POLICY_VERSIONS)) {
      expect(edgeFunction).toContain(`${id}: '${version}'`)
    }
  })
})
