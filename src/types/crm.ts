export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'consultation_requested' | 'converted' | 'lost'

export type CampaignSource =
  | 'Instagram'
  | 'WhatsApp'
  | 'Google'
  | 'Referral'
  | 'Website Intake'
  | 'Catalog'
  | 'Direct'
  | 'Other'

export type ProductInterest = {
  productName: string
  category?: string
  priority?: 'primary' | 'secondary'
}

export type LeadScore = {
  score: number
  explanation: string[]
}

export type IntakeSubmission = {
  id: string
  submittedAt: string
  age: string
  sex: string
  weight: string
  height: string
  mainGoal: string
  currentRoutine: string
  sleepQuality: string
  appetite: string
  energy: string
  previousProductsUsed: string
  medicalConditions: string
  medications: string
  budget: string
  deliveryCity: string
  preferredContactMethod: string
  consentToContact: boolean
  researchUseAcknowledgment: boolean
}

export type TimelineEvent = {
  id: string
  createdAt: string
  type: 'intake_submitted' | 'status_changed' | 'note_added' | 'follow_up_copied' | 'lead_created' | 'manual'
  title: string
  description?: string
  metadata?: Record<string, unknown>
}

export type CRMNote = {
  id: string
  leadId: string
  createdAt: string
  note: string
  createdBy: string
}

export type Customer = {
  id: string
  leadId?: string
  createdAt: string
  firstName: string
  lastName: string
  email: string
  phone: string
  city: string
  state: string
  country: string
  preferredLanguage: string
  notes: string
}

export type Lead = {
  id: string
  createdAt: string
  updatedAt: string
  firstName: string
  lastName: string
  email: string
  phone: string
  city: string
  state: string
  country: string
  preferredLanguage: string
  source: string
  campaignSource: CampaignSource
  interestedProducts: ProductInterest[]
  primaryGoal: string
  budgetRange: string
  status: LeadStatus
  leadScore: LeadScore
  notes: string
  lastContactedAt?: string
  intakeSubmission?: IntakeSubmission
  timeline: TimelineEvent[]
}
