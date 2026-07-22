import { products, type Product } from './products'
import { brandText } from '../../config/brandText'

export type MainGoal =
  | 'Metabolic Signaling'
  | 'Cellular Resilience / Aging Biology'
  | 'Repair & Regeneration Models'
  | 'Endocrine Signaling'
  | 'Neurobiology & Performance Models'
  | 'General Research Review'

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'converted' | 'lost'
export type ProtocolStatus = 'pending_review' | 'needs_more_info' | 'approved' | 'sent'

export type IntakeFormData = {
  mainGoal: MainGoal | ''
  topPriorities: string[]
  timeline: string
  helpNeeded: string
  currentConcerns: string[]
  biometricsStatus: string
  age: string
  sex: string
  height: string
  currentWeight: string
  goalWeight: string
  bodyFat: string
  activityLevel: string
  waist: string
  medicationsOrCompounds: string
  sensitivities: string
  lifestyleActivity: string
  exerciseDays: string
  sleepQuality: string
  energyLevels: string
  nutritionConsistency: string
  mainObstacle: string
  peptideExperience: string
  glpExperience: string
  interestedProducts: string[]
  desiredResearchResult: string
  firstName: string
  lastName: string
  email: string
  phone: string
  city: string
  preferredContactMethod: string
  consentResearchUseOnly: boolean
  consentNoMedicalAdvice: boolean
  consentAccuracy: boolean
  consentContact: boolean
  consentInternalReview: boolean
}

export type Recommendation = {
  primaryCategory: string
  secondaryCategory: string
  recommendedProducts: Product[]
  explanation: string
  confidenceScore: number
  disclaimer: string
}

export type CustomerLead = {
  id: string
  createdAt: string
  firstName: string
  lastName: string
  email: string
  phone: string
  city: string
  preferredContactMethod: string
  consentAccepted: boolean
  consentTimestamp: string
  age: string
  sex: string
  height: string
  currentWeight: string
  goalWeight: string
  bodyFat: string
  waist: string
  activityLevel: string
  medicationsOrCompounds: string
  sensitivities: string
  mainGoal: MainGoal
  lifestyleAnswers: {
    topPriorities?: string[]
    timeline?: string
    helpNeeded?: string
    currentConcerns?: string[]
    biometricsStatus?: string
    lifestyleActivity: string
    exerciseDays: string
    sleepQuality: string
    energyLevels: string
    nutritionConsistency: string
    mainObstacle: string
  }
  experienceAnswers: {
    peptideExperience: string
    glpExperience: string
    interestedProducts: string[]
    desiredResearchResult: string
  }
  recommendedProducts: Array<{ slug: string; name: string; category: string }>
  recommendationSummary: RecommendationSummary
  internalRecommendationNotes: string
  protocolStatus: ProtocolStatus
  reviewStatus: ProtocolStatus
  sendChannel: string
  recommendationProtocol: {
    recommendedProducts: string
    internalNotes: string
    internalSafetyNotes: string
    internalProtocolNotes: string
    suggestedResearchProtocol: string
    suggestedDuration: string
    safetyNotes: string
    status: ProtocolStatus
    lastSentBy?: 'Email' | 'SMS' | 'WhatsApp'
    lastSentAt?: string
  }
  status: LeadStatus
  notes: string
}

export type RecommendationSummary = {
  primaryCategory: string
  secondaryCategory: string
  explanation: string
  confidenceScore: number
  disclaimer: string
}

export const LEADS_STORAGE_KEY = 'encore_ai_intake_leads'

export const defaultIntakeFormData: IntakeFormData = {
  mainGoal: '',
  topPriorities: [],
  timeline: '',
  helpNeeded: '',
  currentConcerns: [],
  biometricsStatus: '',
  age: '',
  sex: '',
  height: '',
  currentWeight: '',
  goalWeight: '',
  bodyFat: '',
  activityLevel: '',
  waist: '',
  medicationsOrCompounds: '',
  sensitivities: '',
  lifestyleActivity: '',
  exerciseDays: '',
  sleepQuality: '',
  energyLevels: '',
  nutritionConsistency: '',
  mainObstacle: '',
  peptideExperience: '',
  glpExperience: '',
  interestedProducts: [],
  desiredResearchResult: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  city: '',
  preferredContactMethod: '',
  consentResearchUseOnly: false,
  consentNoMedicalAdvice: false,
  consentAccuracy: false,
  consentContact: false,
  consentInternalReview: false,
}

export function isIntakeStepComplete(step: number, data: IntakeFormData) {
  const requiredFields: Array<Array<keyof IntakeFormData>> = [
    ['mainGoal', 'timeline', 'helpNeeded'],
    ['lifestyleActivity', 'sleepQuality', 'energyLevels', 'peptideExperience', 'biometricsStatus'],
    ['firstName', 'lastName', 'email', 'phone', 'city', 'preferredContactMethod'],
  ]

  if (step < 0 || step >= requiredFields.length) return false

  const fieldsComplete = requiredFields[step].every((field) => {
    const value = data[field]
    return typeof value === 'string' && value.trim().length > 0
  })

  if (step === 0) {
    return fieldsComplete && data.topPriorities.length > 0
  }

  if (step === 1) {
    const sharedBiometricsComplete = data.biometricsStatus !== 'I can share them now' ||
      [data.age, data.sex, data.height, data.currentWeight, data.goalWeight].every((value) => value.trim().length > 0)

    return fieldsComplete && data.currentConcerns.length > 0 && data.interestedProducts.length > 0 && sharedBiometricsComplete
  }

  if (step === 2) {
    const hasConsent =
      data.consentResearchUseOnly &&
      data.consentNoMedicalAdvice &&
      data.consentAccuracy &&
      data.consentContact &&
      data.consentInternalReview

    return fieldsComplete && hasConsent
  }

  return fieldsComplete
}

const recommendationMap: Record<
  MainGoal,
  {
    primaryCategory: string
    secondaryCategory: string
    productSlugs: string[]
    explanation: string
  }
> = {
  'Metabolic Signaling': {
    primaryCategory: 'Metabolic & Weight Management',
    secondaryCategory: 'Longevity & Cellular Health',
    productSlugs: ['retatrutide', 'tesamorelin', 'nad-plus', 'glutathione'],
    explanation:
      'Your research interest points toward metabolic signaling, energy regulation, and oxidative-balance categories commonly reviewed in body-composition research models.',
  },
  'Cellular Resilience / Aging Biology': {
    primaryCategory: 'Longevity & Cellular Health',
    secondaryCategory: 'Recovery & Regeneration',
    productSlugs: ['nad-plus', 'epithalon', 'ss31', 'glutathione'],
    explanation:
      'Your answers align with cellular resilience, mitochondrial function, oxidative-stress models, and aging-biology research categories.',
  },
  'Repair & Regeneration Models': {
    primaryCategory: 'Recovery & Regeneration',
    secondaryCategory: 'Longevity & Cellular Health',
    productSlugs: ['wolverine-stack', 'klow', 'ghk-cu', 'ahk-cu'],
    explanation:
      'Your profile emphasizes repair signaling, regenerative models, collagen-associated pathways, and preclinical peptide science.',
  },
  'Endocrine Signaling': {
    primaryCategory: 'Hormone & Wellness',
    secondaryCategory: 'Metabolic & Weight Management',
    productSlugs: ['kisspeptin', 'cjc1295-ipamorelin', 'hcg', 'hgh-191aa'],
    explanation:
      'Your research interest maps to hormonal signaling, endocrine-axis categories, and pathway-level review.',
  },
  'Neurobiology & Performance Models': {
    primaryCategory: 'Cognitive & Performance',
    secondaryCategory: 'Longevity & Cellular Health',
    productSlugs: ['semax', 'dsip', 'cerebrolysin', 'nad-plus'],
    explanation:
      'Your profile is centered on neurobiology, cognitive-performance models, sleep-architecture context, and cellular energy research.',
  },
  'General Research Review': {
    primaryCategory: 'Longevity & Cellular Health',
    secondaryCategory: 'Hormone & Wellness',
    productSlugs: ['nad-plus', 'glutathione', 'ghk-cu', 'ss31'],
    explanation:
      'Your answers fit a broad educational review across foundational cellular signaling, oxidative-balance, and endocrine-adjacent research categories.',
  },
}

export const mainGoalOptions: MainGoal[] = [
  'Metabolic Signaling',
  'Cellular Resilience / Aging Biology',
  'Repair & Regeneration Models',
  'Endocrine Signaling',
  'Neurobiology & Performance Models',
  'General Research Review',
]

export const leadStatusOptions: LeadStatus[] = ['new', 'contacted', 'qualified', 'converted', 'lost']
export const protocolStatusOptions: ProtocolStatus[] = [
  'pending_review',
  'needs_more_info',
  'approved',
  'sent',
]

function getDefaultInternalNotes(recommendation: Recommendation) {
  const productNames = recommendation.recommendedProducts.map((product) => product.name).join(', ')

  return [
    `Matched categories: ${recommendation.primaryCategory}, ${recommendation.secondaryCategory}.`,
    `Catalog matches for research review: ${productNames}.`,
    recommendation.explanation,
    'Private review required before any follow-up details are sent.',
  ].join(' ')
}

function normalizeLead(lead: CustomerLead): CustomerLead {
  const recommendedProducts = lead.recommendedProducts ?? []
  const internalRecommendationNotes =
    lead.internalRecommendationNotes ||
    [
      `Matched categories: ${lead.recommendationSummary.primaryCategory}, ${lead.recommendationSummary.secondaryCategory}.`,
      `Catalog matches for research review: ${recommendedProducts.map((product) => product.name).join(', ')}.`,
      lead.recommendationSummary.explanation,
      'Private review required before any follow-up details are sent.',
    ].join(' ')
  const protocolStatus = lead.protocolStatus ?? lead.recommendationProtocol?.status ?? 'pending_review'
  const reviewStatus = lead.reviewStatus ?? protocolStatus

  return {
    ...lead,
    consentAccepted: lead.consentAccepted ?? false,
    consentTimestamp: lead.consentTimestamp ?? '',
    internalRecommendationNotes,
    protocolStatus,
    reviewStatus,
    sendChannel: lead.sendChannel ?? lead.preferredContactMethod ?? '',
    recommendationProtocol: {
      recommendedProducts:
        lead.recommendationProtocol?.recommendedProducts ||
        recommendedProducts.map((product) => product.name).join(', '),
      internalNotes: lead.recommendationProtocol?.internalNotes || internalRecommendationNotes,
      internalSafetyNotes:
        lead.recommendationProtocol?.internalSafetyNotes ||
        lead.recommendationProtocol?.safetyNotes ||
        '',
      internalProtocolNotes:
        lead.recommendationProtocol?.internalProtocolNotes ||
        lead.recommendationProtocol?.suggestedResearchProtocol ||
        '',
      suggestedResearchProtocol: lead.recommendationProtocol?.suggestedResearchProtocol || '',
      suggestedDuration: lead.recommendationProtocol?.suggestedDuration || '',
      safetyNotes: lead.recommendationProtocol?.safetyNotes || '',
      status: protocolStatus,
      lastSentBy: lead.recommendationProtocol?.lastSentBy,
      lastSentAt: lead.recommendationProtocol?.lastSentAt,
    },
  }
}

export function getStoredLeads() {
  const storedLeads = window.localStorage.getItem(LEADS_STORAGE_KEY)

  if (!storedLeads) {
    return []
  }

  try {
    return (JSON.parse(storedLeads) as CustomerLead[]).map(normalizeLead)
  } catch {
    return []
  }
}

export function saveStoredLeads(leads: CustomerLead[]) {
  window.localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(leads))
}

export function generateRecommendation(data: IntakeFormData): Recommendation {
  const goal = data.mainGoal || 'General Research Review'
  const matched = recommendationMap[goal]
  const interestedProductBoost = data.interestedProducts.length > 0 ? 4 : 0
  const experienceBoost = data.peptideExperience && data.peptideExperience !== 'No' ? 3 : 0
  const biometricsBoost = data.age && data.height && data.currentWeight ? 4 : 0
  const confidenceScore = Math.min(94, 82 + interestedProductBoost + experienceBoost + biometricsBoost)

  return {
    primaryCategory: matched.primaryCategory,
    secondaryCategory: matched.secondaryCategory,
    recommendedProducts: matched.productSlugs
      .map((slug) => products.find((product) => product.slug === slug))
      .filter((product): product is Product => Boolean(product)),
    explanation: matched.explanation,
    confidenceScore,
    disclaimer: brandText.complianceDisclaimer,
  }
}

export function createLeadFromIntake(data: IntakeFormData, recommendation: Recommendation): CustomerLead {
  const mainGoal = data.mainGoal || 'General Research Review'
  const recommendedProductNames = recommendation.recommendedProducts
    .map((product) => product.name)
    .join(', ')
  const internalRecommendationNotes = getDefaultInternalNotes(recommendation)

  return {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    phone: data.phone,
    city: data.city,
    preferredContactMethod: data.preferredContactMethod,
    consentAccepted: true,
    consentTimestamp: new Date().toISOString(),
    age: data.age,
    sex: data.sex,
    height: data.height,
    currentWeight: data.currentWeight,
    goalWeight: data.goalWeight,
    bodyFat: data.bodyFat,
    waist: data.waist,
    activityLevel: data.activityLevel,
    medicationsOrCompounds: data.medicationsOrCompounds,
    sensitivities: data.sensitivities,
    mainGoal,
    lifestyleAnswers: {
      topPriorities: data.topPriorities,
      timeline: data.timeline,
      helpNeeded: data.helpNeeded,
      currentConcerns: data.currentConcerns,
      biometricsStatus: data.biometricsStatus,
      lifestyleActivity: data.lifestyleActivity,
      exerciseDays: data.exerciseDays,
      sleepQuality: data.sleepQuality,
      energyLevels: data.energyLevels,
      nutritionConsistency: data.nutritionConsistency,
      mainObstacle: data.mainObstacle,
    },
    experienceAnswers: {
      peptideExperience: data.peptideExperience,
      glpExperience: data.glpExperience,
      interestedProducts: data.interestedProducts,
      desiredResearchResult: data.desiredResearchResult,
    },
    recommendedProducts: recommendation.recommendedProducts.map((product) => ({
      slug: product.slug,
      name: product.name,
      category: product.category,
    })),
    recommendationSummary: {
      primaryCategory: recommendation.primaryCategory,
      secondaryCategory: recommendation.secondaryCategory,
      explanation: recommendation.explanation,
      confidenceScore: recommendation.confidenceScore,
      disclaimer: recommendation.disclaimer,
    },
    internalRecommendationNotes,
    protocolStatus: 'pending_review',
    reviewStatus: 'pending_review',
    sendChannel: data.preferredContactMethod,
    recommendationProtocol: {
      recommendedProducts: recommendedProductNames,
      internalNotes: internalRecommendationNotes,
      internalSafetyNotes: '',
      internalProtocolNotes: '',
      suggestedResearchProtocol: '',
      suggestedDuration: '',
      safetyNotes: '',
      status: 'pending_review',
    },
    status: 'new',
    notes: '',
  }
}

export function getPrivateFollowUpTemplate(lead: CustomerLead) {
  const categories = [
    lead.recommendationSummary.primaryCategory,
    lead.recommendationSummary.secondaryCategory,
  ].join(', ')
  const productsList = lead.recommendedProducts.map((product) => `- ${product.name}`).join('\n')

  return `Hi ${lead.firstName}, based on your Research Match, we've matched your research goals with the following Encore Bio Labs categories: ${categories}.

Catalog matches for research review:
${productsList}

Research summary:
${lead.recommendationSummary.explanation}

A specialist can help review product options, documentation needs, quantities, and fulfillment timing.

Important: ${brandText.complianceDisclaimer}`
}
