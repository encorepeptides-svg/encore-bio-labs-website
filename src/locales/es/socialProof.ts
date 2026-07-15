import type { socialProof as socialProofEn } from '../en/socialProof'

export const socialProof = {
  testimonialsEyebrow: 'Opiniones verificadas',
  testimonialsTitle: 'Lo que dicen los investigadores sobre trabajar con Encore.',
  disclosureLabel: 'Divulgación',
  transformationsEyebrow: 'Resultados documentados',
  transformationsTitle: 'Antes y después: revisados y documentados.',
  beforeLabel: 'Antes',
  afterLabel: 'Después',
  capturedLabel: 'Capturado',
  editsLabel: 'Ediciones de imagen',
  claimLabel: 'Afirmación revisada',
  typicalOutcomeLabel: 'Resultados típicos',
  concurrentFactorsLabel: 'Otros factores contribuyentes',
} satisfies Record<keyof typeof socialProofEn, string>
