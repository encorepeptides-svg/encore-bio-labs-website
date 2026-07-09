import type { IntakeSubmission, Lead, LeadScore, ProductInterest } from '../types/crm'

function hasRetatrutideInterest(products: ProductInterest[]) {
  return products.some((product) => product.productName.toLowerCase().includes('retatrutide'))
}

function hasHighBudget(value: string) {
  const normalized = value.toLowerCase()
  return (
    normalized.includes('high') ||
    normalized.includes('premium') ||
    normalized.includes('$500') ||
    normalized.includes('500+') ||
    normalized.includes('750') ||
    normalized.includes('1000')
  )
}

function isElPaso(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, ' ') === 'el paso'
}

function completedFullIntake(intake?: IntakeSubmission) {
  if (!intake) {
    return false
  }

  const requiredValues = [
    intake.age,
    intake.sex,
    intake.weight,
    intake.height,
    intake.mainGoal,
    intake.sleepQuality,
    intake.energy,
    intake.budget,
    intake.deliveryCity,
    intake.preferredContactMethod,
  ]

  return requiredValues.every((value) => value.trim().length > 0) && intake.researchUseAcknowledgment
}

export function calculateLeadScore(input: Pick<Lead, 'phone' | 'city' | 'budgetRange' | 'interestedProducts'> & {
  intakeSubmission?: IntakeSubmission
}): LeadScore {
  const explanation: string[] = []
  let score = 0

  if (input.phone.trim()) {
    score += 20
    explanation.push('+20 phone provided')
  }

  if (input.intakeSubmission?.consentToContact) {
    score += 20
    explanation.push('+20 consent to contact')
  }

  if (hasRetatrutideInterest(input.interestedProducts)) {
    score += 15
    explanation.push('+15 Retatrutide research interest')
  }

  if (hasHighBudget(input.budgetRange) || hasHighBudget(input.intakeSubmission?.budget ?? '')) {
    score += 10
    explanation.push('+10 high budget range')
  }

  if (isElPaso(input.city) || isElPaso(input.intakeSubmission?.deliveryCity ?? '')) {
    score += 10
    explanation.push('+10 local El Paso delivery city')
  }

  if (completedFullIntake(input.intakeSubmission)) {
    score += 10
    explanation.push('+10 completed full intake')
  }

  if (input.intakeSubmission?.preferredContactMethod.toLowerCase() === 'whatsapp') {
    score += 5
    explanation.push('+5 WhatsApp preferred')
  }

  if (explanation.length === 0) {
    explanation.push('No scoring signals captured yet')
  }

  return {
    score: Math.min(100, score),
    explanation,
  }
}
