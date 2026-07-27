import type { Locale } from '../i18n/config'

export const SITE_ENTRY_ACKNOWLEDGMENT_VERSION = 'site-entry-ruo-v1'
export const CHECKOUT_ACKNOWLEDGMENT_VERSION = 'checkout-ruo-v1'

export const ACKNOWLEDGMENT_POLICY_VERSIONS = {
  terms: 'terms-2026-07-07',
  privacy: 'privacy-2026-07-07',
  researchUseOnly: 'research-use-only-2026-07-26',
  shippingReturns: 'shipping-returns-2026-07-20',
} as const

export type AcknowledgmentPolicyId = keyof typeof ACKNOWLEDGMENT_POLICY_VERSIONS

export const acknowledgmentPolicies: ReadonlyArray<{
  id: AcknowledgmentPolicyId
  href: string
  label: Record<Locale, string>
  agreementLabel: Record<Locale, string>
}> = [
  {
    id: 'terms',
    href: '/legal/terms',
    label: { en: 'Terms', es: 'Términos' },
    agreementLabel: { en: 'Terms', es: 'los Términos' },
  },
  {
    id: 'privacy',
    href: '/legal/privacy',
    label: { en: 'Privacy Policy', es: 'Política de Privacidad' },
    agreementLabel: { en: 'Privacy Policy', es: 'la Política de Privacidad' },
  },
  {
    id: 'researchUseOnly',
    href: '/legal/research-use-only',
    label: {
      en: 'Research Use Only Policy',
      es: 'Política de Uso Exclusivo para Investigación',
    },
    agreementLabel: {
      en: 'Research Use Only Policy',
      es: 'la Política de Uso Exclusivo para Investigación',
    },
  },
  {
    id: 'shippingReturns',
    href: '/legal/shipping-returns',
    label: {
      en: 'Shipping and Returns Policy',
      es: 'Política de Envíos y Devoluciones',
    },
    agreementLabel: {
      en: 'Shipping and Returns Policy',
      es: 'la Política de Envíos y Devoluciones',
    },
  },
]

export const CHECKOUT_STATEMENT_IDS = [
  'age',
  'researchOnly',
  'noConsumption',
  'noAdvice',
] as const

export const CHECKOUT_ACKNOWLEDGMENT_IDS = [
  ...CHECKOUT_STATEMENT_IDS,
  'policies',
] as const

export type CheckoutAcknowledgmentId = typeof CHECKOUT_ACKNOWLEDGMENT_IDS[number]
export type CheckoutAcknowledgmentState = Record<CheckoutAcknowledgmentId, boolean>

type LocalizedAcknowledgmentContent = {
  entry: {
    eyebrow: string
    title: string
    ageBody: string
    researchBody: string
    confirmationLead: string
    confirmations: readonly [string, string, string]
    policyLead: string
    policyJoiner: string
    enterButton: string
    exitButton: string
    retentionNote: string
    opensNewTab: string
  }
  checkout: {
    eyebrow: string
    title: string
    body: string
    statements: Readonly<Record<Exclude<CheckoutAcknowledgmentId, 'policies'>, string>>
    policyLead: string
    policyJoiner: string
    incomplete: string
    complete: string
  }
  denied: {
    eyebrow: string
    title: string
    body: string
    policyLink: string
  }
}

export const acknowledgmentContent: Record<Locale, LocalizedAcknowledgmentContent> = {
  en: {
    entry: {
      eyebrow: 'Encore Bio Labs access',
      title: 'Research Use Only',
      ageBody: 'You must be 18 or older to enter this website.',
      researchBody: 'Encore Bio Labs products are intended exclusively for laboratory research. They are not intended for human or animal consumption, diagnosis, treatment, prevention, or therapeutic use.',
      confirmationLead: 'By entering, I confirm that:',
      confirmations: [
        'I am at least 18 years old.',
        'I understand these products are for laboratory research only.',
        'I will not use or purchase them for human or animal consumption.',
      ],
      policyLead: 'I agree to the',
      policyJoiner: 'and',
      enterButton: 'I Understand — Enter Site',
      exitButton: 'Exit Site',
      retentionNote: 'This acknowledgment is remembered for 30 days on this browser.',
      opensNewTab: 'opens in a new tab',
    },
    checkout: {
      eyebrow: 'Required order acknowledgment',
      title: 'Confirm responsible research use',
      body: 'Each statement must be confirmed for this order. These selections are never saved for a future order.',
      statements: {
        age: 'I confirm that I am at least 18 years old.',
        researchOnly: 'I understand that these products are sold exclusively for laboratory research.',
        noConsumption: 'I confirm that these products will not be used for human or animal consumption.',
        noAdvice: 'I understand that Encore Bio Labs does not provide medical advice, treatment recommendations, dosing instructions, or administration guidance.',
      },
      policyLead: 'I agree to the',
      policyJoiner: 'and',
      incomplete: 'Complete all five acknowledgments to continue.',
      complete: 'All required acknowledgments are complete for this order.',
    },
    denied: {
      eyebrow: 'Access not granted',
      title: 'This site is not available without acknowledgment.',
      body: 'You may close this tab. The Encore Bio Labs legal policies remain available for review.',
      policyLink: 'Review the Research Use Only Policy',
    },
  },
  es: {
    entry: {
      eyebrow: 'Acceso a Encore Bio Labs',
      title: 'Solo para investigación',
      ageBody: 'Debes tener al menos 18 años para entrar a este sitio web.',
      researchBody: 'Los productos de Encore Bio Labs están destinados exclusivamente a la investigación de laboratorio. No están destinados al consumo humano o animal, diagnóstico, tratamiento, prevención ni uso terapéutico.',
      confirmationLead: 'Al entrar, confirmo que:',
      confirmations: [
        'Tengo al menos 18 años.',
        'Entiendo que estos productos son exclusivamente para investigación de laboratorio.',
        'No usaré ni compraré estos productos para consumo humano o animal.',
      ],
      policyLead: 'Acepto',
      policyJoiner: 'y',
      enterButton: 'Entiendo — Entrar al sitio',
      exitButton: 'Salir del sitio',
      retentionNote: 'Este reconocimiento se recuerda durante 30 días en este navegador.',
      opensNewTab: 'se abre en una pestaña nueva',
    },
    checkout: {
      eyebrow: 'Reconocimiento obligatorio para el pedido',
      title: 'Confirma el uso responsable para investigación',
      body: 'Debes confirmar cada declaración para este pedido. Estas selecciones nunca se guardan para un pedido futuro.',
      statements: {
        age: 'Confirmo que tengo al menos 18 años.',
        researchOnly: 'Entiendo que estos productos se venden exclusivamente para investigación de laboratorio.',
        noConsumption: 'Confirmo que estos productos no se utilizarán para consumo humano o animal.',
        noAdvice: 'Entiendo que Encore Bio Labs no proporciona consejos médicos, recomendaciones de tratamiento, dosis ni instrucciones de administración.',
      },
      policyLead: 'Acepto',
      policyJoiner: 'y',
      incomplete: 'Confirma las cinco declaraciones para continuar.',
      complete: 'Completaste todos los reconocimientos obligatorios para este pedido.',
    },
    denied: {
      eyebrow: 'Acceso no autorizado',
      title: 'Este sitio no está disponible sin el reconocimiento.',
      body: 'Puedes cerrar esta pestaña. Las políticas legales de Encore Bio Labs permanecen disponibles para consulta.',
      policyLink: 'Consultar la Política de Uso Exclusivo para Investigación',
    },
  },
}

export function createEmptyCheckoutAcknowledgmentState(): CheckoutAcknowledgmentState {
  return {
    age: false,
    researchOnly: false,
    noConsumption: false,
    noAdvice: false,
    policies: false,
  }
}

export function isCheckoutAcknowledgmentComplete(state: CheckoutAcknowledgmentState) {
  return CHECKOUT_ACKNOWLEDGMENT_IDS.every((id) => state[id])
}

function joinedPolicyNames(locale: Locale, ids: readonly AcknowledgmentPolicyId[]) {
  const names = ids.map((id) => acknowledgmentPolicies.find((policy) => policy.id === id)!.agreementLabel[locale])
  if (locale === 'es') return `${names.slice(0, -1).join(', ')} y ${names.at(-1)}`
  return `${names.slice(0, -1).join(', ')}, and ${names.at(-1)}`
}

export function getCheckoutAcknowledgmentLanguage(locale: Locale) {
  const copy = acknowledgmentContent[locale].checkout
  return [
    copy.statements.age,
    copy.statements.researchOnly,
    copy.statements.noConsumption,
    copy.statements.noAdvice,
    `${copy.policyLead} ${joinedPolicyNames(locale, ['terms', 'privacy', 'researchUseOnly', 'shippingReturns'])}.`,
  ]
}

export type CheckoutAcknowledgmentAudit = {
  version: typeof CHECKOUT_ACKNOWLEDGMENT_VERSION
  acceptedAt: string
  locale: Locale
  confirmedStatementIds: readonly CheckoutAcknowledgmentId[]
  exactLanguage: readonly string[]
  policyVersions: typeof ACKNOWLEDGMENT_POLICY_VERSIONS
}

export function createCheckoutAcknowledgmentAudit(
  locale: Locale,
  acceptedAt = new Date().toISOString(),
): CheckoutAcknowledgmentAudit {
  return {
    version: CHECKOUT_ACKNOWLEDGMENT_VERSION,
    acceptedAt,
    locale,
    confirmedStatementIds: CHECKOUT_ACKNOWLEDGMENT_IDS,
    exactLanguage: getCheckoutAcknowledgmentLanguage(locale),
    policyVersions: ACKNOWLEDGMENT_POLICY_VERSIONS,
  }
}
