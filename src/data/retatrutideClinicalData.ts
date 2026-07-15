export type RetatrutideSource = {
  id: string
  title: string
  publisher: string
  url: string
  publishedAt: string
  sourceType: 'peer-reviewed-publication' | 'trial-registry' | 'sponsor-topline' | 'regulatory-guidance'
  lastVerified: string
}

export type TriumphArm = {
  id: '4mg' | '9mg' | '12mg' | 'placebo'
  label: string
  averageWeightReduction: number
  reachedThirtyPercent: number
  tolerability: {
    nausea: number
    diarrhea: number
    constipation: number
    vomiting: number
    discontinuedForAdverseEvents: number
  }
}

export type RetatrutideTimelineEntry = {
  date: string
  labelKey: string
  sourceId: RetatrutideSource['id']
}

export type ResearchDocumentationRecord = {
  batchId: string
  testingDate: string
  laboratory: string
  method: string
  purity: string
  hplcResult: string
  massSpectrometryResult: string
  storage: string
  reportUrl: string
  version: string
  lastVerified: string
}

export const retatrutideSources: RetatrutideSource[] = [
  {
    id: 'phase-2-nejm',
    title: 'Triple-Hormone-Receptor Agonist Retatrutide for Obesity — A Phase 2 Trial',
    publisher: 'The New England Journal of Medicine',
    url: 'https://www.nejm.org/doi/full/10.1056/NEJMoa2301972',
    publishedAt: '2023-06-26',
    sourceType: 'peer-reviewed-publication',
    lastVerified: '2026-07-15',
  },
  {
    id: 'triumph-1-registry',
    title: 'TRIUMPH-1 (NCT05929066)',
    publisher: 'ClinicalTrials.gov',
    url: 'https://clinicaltrials.gov/study/NCT05929066',
    publishedAt: '2023-07-10',
    sourceType: 'trial-registry',
    lastVerified: '2026-07-15',
  },
  {
    id: 'transcend-topline',
    title: 'TRANSCEND-T2D-1 Phase 3 topline results',
    publisher: 'Eli Lilly and Company',
    url: 'https://investor.lilly.com/news-releases/news-release-details/lillys-triple-agonist-retatrutide-demonstrated-significant',
    publishedAt: '2026-03-19',
    sourceType: 'sponsor-topline',
    lastVerified: '2026-07-15',
  },
  {
    id: 'triumph-topline',
    title: 'TRIUMPH-1 Phase 3 topline results',
    publisher: 'Eli Lilly and Company',
    url: 'https://investor.lilly.com/news-releases/news-release-details/lillys-triple-agonist-retatrutide-delivered-powerful-weight-loss',
    publishedAt: '2026-05-21',
    sourceType: 'sponsor-topline',
    lastVerified: '2026-07-15',
  },
  {
    id: 'fda-unapproved-glp1',
    title: 'FDA’s Concerns with Unapproved GLP-1 Drugs Used for Weight Loss',
    publisher: 'U.S. Food and Drug Administration',
    url: 'https://www.fda.gov/drugs/drug-alerts-and-statements/fdas-concerns-unapproved-glp-1-drugs-used-weight-loss',
    publishedAt: '2026-06-15',
    sourceType: 'regulatory-guidance',
    lastVerified: '2026-07-15',
  },
]

export const triumphOne = {
  phase: 'Phase 3',
  sponsor: 'Eli Lilly and Company',
  sourceTitle: 'TRIUMPH-1 Phase 3 topline results',
  publicationDate: '2026-05-21',
  trialIdentifier: 'NCT05929066',
  participantsRandomized: 2339,
  durationWeeks: 80,
  population: 'Adults with obesity or overweight and at least one weight-related comorbidity, without diabetes',
  endpoints: {
    averageWeightReduction: 'Percent change in body weight from baseline',
    reachedThirtyPercent: 'Participants achieving at least 30% body-weight reduction',
  },
  timepoint: 'Week 80',
  evidenceStatus: 'Sponsor-reported topline results; detailed peer-reviewed publication pending',
  lastVerified: '2026-07-15',
  sourceId: 'triumph-topline',
  arms: [
    {
      id: '4mg',
      label: 'Retatrutide 4 mg',
      averageWeightReduction: 19.0,
      reachedThirtyPercent: 15.3,
      tolerability: { nausea: 28.6, diarrhea: 25.2, constipation: 23.8, vomiting: 10.6, discontinuedForAdverseEvents: 4.1 },
    },
    {
      id: '9mg',
      label: 'Retatrutide 9 mg',
      averageWeightReduction: 25.9,
      reachedThirtyPercent: 37.9,
      tolerability: { nausea: 38.4, diarrhea: 34.1, constipation: 25.9, vomiting: 22.8, discontinuedForAdverseEvents: 6.9 },
    },
    {
      id: '12mg',
      label: 'Retatrutide 12 mg',
      averageWeightReduction: 28.3,
      reachedThirtyPercent: 45.3,
      tolerability: { nausea: 42.4, diarrhea: 32.0, constipation: 26.1, vomiting: 25.3, discontinuedForAdverseEvents: 11.3 },
    },
    {
      id: 'placebo',
      label: 'Placebo',
      averageWeightReduction: 2.2,
      reachedThirtyPercent: 0.5,
      tolerability: { nausea: 14.8, diarrhea: 13.5, constipation: 10.9, vomiting: 4.8, discontinuedForAdverseEvents: 4.9 },
    },
  ] satisfies TriumphArm[],
} as const

export const retatrutideTimeline: RetatrutideTimelineEntry[] = [
  { date: '2023-06-26', labelKey: 'timelinePhaseTwo', sourceId: 'phase-2-nejm' },
  { date: '2023-07-10', labelKey: 'timelinePhaseThreeLaunch', sourceId: 'triumph-1-registry' },
  { date: '2026-03-19', labelKey: 'timelineTranscend', sourceId: 'transcend-topline' },
  { date: '2026-05-21', labelKey: 'timelineTriumph', sourceId: 'triumph-topline' },
  { date: '2026', labelKey: 'timelineOngoing', sourceId: 'triumph-topline' },
]

/**
 * Intentionally empty until a batch-specific, independently reviewable record
 * is connected. Never seed this with illustrative certificate data.
 */
export const retatrutideDocumentation: ResearchDocumentationRecord[] = []

export function sourceById(id: string) {
  return retatrutideSources.find((source) => source.id === id)
}
