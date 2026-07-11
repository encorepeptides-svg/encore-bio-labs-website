export type EncoreCompleteKitConfig = {
  peptideIncluded: boolean
  bacWaterLabel: string
  syringeCount: number
  syringeGauge: string
  prepPadCount: number
  premiumPackaging: boolean
}

export const encoreCompleteKitDefaults: EncoreCompleteKitConfig = {
  peptideIncluded: true,
  bacWaterLabel: 'Product-specific pre-measured BAC water',
  syringeCount: 4,
  syringeGauge: '30G',
  prepPadCount: 6,
  premiumPackaging: true,
}

export type EncoreCompleteKitConfigInput = {
  productName?: string
  bacWaterAmount?: string
  syringeCount?: number
  syringeGauge?: string
  prepPadCount?: number
}

export function getBacWaterLabel(bacWaterAmount?: string) {
  return bacWaterAmount
    ? `Pre-measured BAC water (${bacWaterAmount})`
    : encoreCompleteKitDefaults.bacWaterLabel
}

export function getEncoreCompleteKitConfig({
  bacWaterAmount,
  syringeCount = encoreCompleteKitDefaults.syringeCount,
  syringeGauge = encoreCompleteKitDefaults.syringeGauge,
  prepPadCount = encoreCompleteKitDefaults.prepPadCount,
}: EncoreCompleteKitConfigInput = {}): EncoreCompleteKitConfig {
  return {
    peptideIncluded: true,
    bacWaterLabel: getBacWaterLabel(bacWaterAmount),
    syringeCount,
    syringeGauge,
    prepPadCount,
    premiumPackaging: true,
  }
}

export type EncoreCompleteKitItem = {
  key: 'peptide' | 'bac-water' | 'syringes' | 'prep-pads' | 'packaging'
  title: string
  description: string
}

export function getEncoreCompleteKitItems(input: EncoreCompleteKitConfigInput = {}): EncoreCompleteKitItem[] {
  const { productName } = input
  const config = getEncoreCompleteKitConfig(input)

  return [
    {
      key: 'peptide',
      title: 'Research peptide',
      description: productName
        ? `The ${productName} vial included with your order.`
        : 'The research compound included with your order.',
    },
    {
      key: 'bac-water',
      title: config.bacWaterLabel,
      description: 'Measured for this product where applicable, so nothing needs to be sourced separately.',
    },
    {
      key: 'syringes',
      title: `${config.syringeCount} sterile ${config.syringeGauge} insulin syringes`,
      description: 'Individually wrapped and ready for research preparation.',
    },
    {
      key: 'prep-pads',
      title: `${config.prepPadCount} alcohol prep pads`,
      description: 'Included for clean, consistent preparation.',
    },
    {
      key: 'packaging',
      title: 'Premium protective packaging',
      description: 'Every order ships in discreet, protective packaging built for careful transit.',
    },
  ]
}

export function getEncoreCompleteKitCompactSummary({
  syringeCount = encoreCompleteKitDefaults.syringeCount,
}: { syringeCount?: number; prepPadCount?: number } = {}) {
  return `BAC water, ${syringeCount} sterile syringes, prep pads and premium protective packaging are included.`
}

export const encoreCompleteKitCopy = {
  fullEyebrow: 'Complete Kit Included',
  fullHeading: 'Encore Complete Kit',
  fullDescription: 'Everything needed for your research arrives together in one professionally prepared package.',
  closingMessage: 'No need to purchase essential preparation supplies separately.',
  compactHeading: 'Complete Kit Included',
  cartHeading: 'Included with this product',
  checkoutHeading: "What's Included",
}

export type EncoreCompleteKitFaqInput = {
  productName: string
  bacWaterAmount?: string
  syringeCount?: number
  syringeGauge?: string
  prepPadCount?: number
}

export function getEncoreCompleteKitFaqItems({ productName, ...configInput }: EncoreCompleteKitFaqInput) {
  const config = getEncoreCompleteKitConfig(configInput)

  return [
    {
      question: `What is included with ${productName}?`,
      answer: `Every ${productName} order ships as an Encore Complete Kit: the research peptide, ${config.bacWaterLabel.toLowerCase()}, ${config.syringeCount} sterile ${config.syringeGauge} insulin syringes, ${config.prepPadCount} alcohol prep pads, and premium protective packaging.`,
    },
    {
      question: `Is BAC water included with ${productName}?`,
      answer: `Yes. ${config.bacWaterLabel} is included as part of the Encore Complete Kit that ships with every order.`,
    },
    {
      question: 'What preparation supplies are included?',
      answer: `${config.syringeCount} sterile ${config.syringeGauge} insulin syringes and ${config.prepPadCount} alcohol prep pads are included with every order, so there's no need to source preparation supplies separately.`,
    },
    {
      question: 'How is the order packaged?',
      answer: 'Every order ships in premium protective packaging designed for careful, discreet transit.',
    },
    {
      question: 'When should I expect shipping confirmation?',
      answer:
        'Shipping confirmation is sent once your order inquiry is reviewed and approved through the Encore Bio Labs process. Local El Paso, nationwide U.S., and Mexico shipping options are available depending on your location.',
    },
  ]
}
