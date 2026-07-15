export type EvidenceLevel = 'phase-3' | 'phase-2' | 'ongoing' | 'not-established'

export type RetatrutideResearchBenefit = {
  id: string
  title: string
  metric?: string
  metricLabel?: string
  description: string
  supportingStats?: string[]
  tags?: string[]
  evidenceLevel: EvidenceLevel
  trial?: string
  duration?: string
  timelinePoints?: string[]
  icon: 'body' | 'glucose' | 'heart' | 'mobility' | 'sleep' | 'pathway'
  featured?: boolean
}

export const phaseThreeStats = [
  { metric: '28.3%', label: 'Average body-weight reduction reported at 80 weeks', note: '12 mg arm, TRIUMPH-1 Phase 3 trial' },
  { metric: '45.3%', label: 'Reached at least 30% body-weight reduction', note: '12 mg arm at 80 weeks' },
  { metric: '30.3%', label: 'Average reduction reported at 104 weeks', note: 'Pre-specified extension subgroup with baseline BMI ≥35' },
] as const

export const researchBenefits: RetatrutideResearchBenefit[] = [
  {
    id: 'body-composition',
    title: 'Waist Reduction Research Journey',
    metric: 'Up to 24.1 cm',
    metricLabel: 'Average waist reduction reported in TRIUMPH-1',
    description: 'Retatrutide research has demonstrated progressive changes in waist circumference and body composition over time. This visual highlights the reported reduction pattern observed through the TRIUMPH-1 study period.',
    tags: ['Body weight', 'Waist circumference', 'Body composition'],
    evidenceLevel: 'phase-3',
    trial: 'TRIUMPH-1 · 80 weeks',
    duration: '80 weeks',
    timelinePoints: ['Baseline', 'Week 24', 'Week 48', 'Week 80'],
    icon: 'body',
    featured: true,
  },
  {
    id: 'glucose-a1c',
    title: 'Glucose & A1C',
    metric: 'Up to 2.0 points',
    metricLabel: 'Average A1C reduction reported',
    description: 'In adults with early type 2 diabetes, Phase 3 research reported improvements in A1C, fasting glucose and the proportion of participants reaching predefined glycemic targets.',
    supportingStats: ['Up to 89% reached A1C below 7%'],
    evidenceLevel: 'phase-3',
    trial: 'TRANSCEND-T2D-1 · 40 weeks',
    icon: 'glucose',
  },
  {
    id: 'cardiometabolic',
    title: 'Cardiometabolic Markers',
    metric: 'Up to 41%',
    metricLabel: 'Reduction reported in triglycerides',
    description: 'Research findings also included changes in triglycerides, non-HDL cholesterol, systolic blood pressure and inflammatory markers. These marker changes do not establish prevention of cardiovascular events.',
    supportingStats: ['Non-HDL cholesterol: up to 24.2% reduction', 'Systolic blood pressure: up to 12.3 mmHg reduction'],
    evidenceLevel: 'phase-3',
    trial: 'TRIUMPH-1 · reported markers',
    icon: 'heart',
  },
  {
    id: 'knee-mobility',
    title: 'Knee Pain & Mobility',
    metric: 'Up to 75.8%',
    metricLabel: 'Average reduction in WOMAC knee-pain score',
    description: 'In adults with obesity or overweight and knee osteoarthritis, TRIUMPH-4 reported changes in knee-pain scores and physical-function measures alongside weight reduction. This does not establish treatment or reversal of arthritis.',
    evidenceLevel: 'phase-3',
    trial: 'TRIUMPH-4 · 68 weeks',
    icon: 'mobility',
  },
  {
    id: 'sleep-apnea',
    title: 'Sleep Apnea Research',
    metric: 'Up to 61%',
    metricLabel: 'Reduction in apnea-hypopnea index',
    description: 'An embedded Phase 3 study evaluated changes in obstructive sleep-apnea severity, reporting fewer breathing-disruption events per hour in trial participants. The findings do not establish a cure or support discontinuing prescribed care.',
    evidenceLevel: 'phase-3',
    trial: 'TRIUMPH-1 sleep-apnea basket',
    icon: 'sleep',
  },
  {
    id: 'appetite-signaling',
    title: 'Appetite & Metabolic Signaling',
    description: 'The combined GLP-1, GIP and glucagon receptor mechanism is being studied for its effects on appetite regulation, satiety, glucose handling and energy metabolism.',
    evidenceLevel: 'ongoing',
    icon: 'pathway',
  },
]

export type RetatrutideResearchOutcome = {
  id: string
  label: string
  metric: string
  evidence: 'Phase 3'
  icon: 'weight' | 'glucose' | 'waist' | 'lipid' | 'pressure' | 'mobility' | 'sleep'
  position: { x: number; y: number }
  size: 'standard' | 'prominent'
}

export const interconnectedOutcomes: RetatrutideResearchOutcome[] = [
  { id: 'weight', label: 'Weight regulation', metric: 'Up to 28.3%', evidence: 'Phase 3', icon: 'weight', position: { x: 50, y: 13 }, size: 'prominent' },
  { id: 'glucose', label: 'Glucose control', metric: 'Up to 2.0 points', evidence: 'Phase 3', icon: 'glucose', position: { x: 81, y: 19 }, size: 'standard' },
  { id: 'waist', label: 'Waist circumference', metric: 'Up to 24.1 cm', evidence: 'Phase 3', icon: 'waist', position: { x: 84, y: 48 }, size: 'prominent' },
  { id: 'lipid', label: 'Lipid markers', metric: 'Up to 41%', evidence: 'Phase 3', icon: 'lipid', position: { x: 78, y: 79 }, size: 'standard' },
  { id: 'pressure', label: 'Blood pressure', metric: 'Up to 12.3 mmHg', evidence: 'Phase 3', icon: 'pressure', position: { x: 50, y: 87 }, size: 'standard' },
  { id: 'mobility', label: 'Joint mobility', metric: 'Up to 75.8%', evidence: 'Phase 3', icon: 'mobility', position: { x: 19, y: 76 }, size: 'prominent' },
  { id: 'sleep', label: 'Sleep apnea severity', metric: 'Up to 61%', evidence: 'Phase 3', icon: 'sleep', position: { x: 15, y: 23 }, size: 'standard' },
]

export const researchReferences = [
  { title: 'TRIUMPH-1 Phase 3 obesity trial', description: 'Trial registry and study-design information', href: 'https://clinicaltrials.gov/search?term=TRIUMPH-1%20retatrutide' },
  { title: 'TRIUMPH-4 Phase 3 knee osteoarthritis trial', description: 'Trial registry and study-design information', href: 'https://clinicaltrials.gov/search?term=TRIUMPH-4%20retatrutide' },
  { title: 'TRANSCEND-T2D-1 Phase 3 diabetes trial', description: 'Trial registry and study-design information', href: 'https://clinicaltrials.gov/search?term=TRANSCEND-T2D-1%20retatrutide' },
  { title: 'Lilly clinical-development pipeline', description: 'Sponsor program and investigational-status information', href: 'https://www.lilly.com/discovery/clinical-development-pipeline' },
  { title: 'Peer-reviewed TRANSCEND-T2D-1 literature', description: 'PubMed-indexed publication search', href: 'https://pubmed.ncbi.nlm.nih.gov/?term=TRANSCEND-T2D-1+retatrutide' },
] as const
