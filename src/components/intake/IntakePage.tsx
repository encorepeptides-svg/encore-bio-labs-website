import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  FileCheck2,
  FlaskConical,
  LoaderCircle,
  LockKeyhole,
  Microscope,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import { useLocale, useTranslation } from '../../i18n/LocaleContext'
import { usePortalAuth } from '../../context/usePortalAuth'
import { products } from '../../data/products'
import {
  createLeadFromIntake,
  defaultIntakeFormData,
  generateRecommendation,
  getStoredLeads,
  isIntakeStepComplete,
  mainGoalOptions,
  saveStoredLeads,
  updateIntakeStringField,
  type CustomerLead,
  type IntakeFormData,
  type IntakeStringField,
} from '../../data/intake'
import { createCRMLeadFromIntake } from '../../lib/crmStorage'
import { track } from '../../lib/analytics'
import { buildWhatsAppUrl, getGeneralInquiryMessage } from '../../lib/whatsapp'
import {
  claimPublicIntakeHandoff,
  createIntakeHandoffToken,
  INTAKE_SESSION_KEY,
  normalizeHelpNeeded,
  submitPublicIntake,
} from '../../lib/portal/intakeHandoff'

const stepKeys = ['stepGoal', 'stepSituation', 'stepReview'] as const
const sexOptions = ['Female', 'Male', 'Intersex', 'Prefer not to say']
const activityOptions = ['Sedentary', 'Light', 'Moderate', 'Very active', 'Athletic']
const sleepOptions = ['Excellent', 'Good', 'Inconsistent', 'Poor']
const energyOptions = ['Steady', 'Afternoon dips', 'Low most days', 'Variable']
const peptideExperienceOptions = ['New to this', 'Some experience', 'Very experienced', 'I want guidance']
const priorityOptions = ['Best product fit', 'Simple next steps', 'Clear pricing', 'Fast turnaround', 'Personal support', 'Compare options']
const timelineOptions = ['Ready now', 'Within 1 month', 'Within 1–3 months', 'Just exploring']
const helpOptions = ['Recommend a starting point', 'Compare a few options', 'Confirm a product I have in mind', 'Answer questions first']
const concernOptions = ['Weight or body composition', 'Energy', 'Recovery', 'Sleep', 'Focus or performance', 'Healthy aging', 'General wellness']
const biometricsOptions = ['I can share them now', "I don't have them yet", 'I prefer to discuss them']
const ageRangeOptions = ['18–29', '30–39', '40–49', '50–59', '60+', 'Prefer not to say']
const contactOptions = ['Email', 'SMS', 'WhatsApp']

type TranslationFunction = (key: string, vars?: Record<string, string | number>) => string

const intakeValueKeys: Record<string, string> = {
  'Metabolic Signaling': 'goalMetabolic',
  'Cellular Resilience / Aging Biology': 'goalCellularResilience',
  'Repair & Regeneration Models': 'goalRepair',
  'Endocrine Signaling': 'goalEndocrine',
  'Neurobiology & Performance Models': 'goalNeurobiology',
  'General Research Review': 'goalGeneral',
  'Best product fit': 'priorityProductFit',
  'Simple next steps': 'prioritySimpleSteps',
  'Clear pricing': 'priorityClearPricing',
  'Fast turnaround': 'priorityFastTurnaround',
  'Personal support': 'priorityPersonalSupport',
  'Compare options': 'priorityCompareOptions',
  'Ready now': 'timelineReadyNow',
  'Within 1 month': 'timelineWithinMonth',
  'Within 1–3 months': 'timelineOneToThreeMonths',
  'Just exploring': 'timelineExploring',
  'Recommend a starting point': 'helpStartingPoint',
  'Compare a few options': 'helpCompareOptions',
  'Confirm a product I have in mind': 'helpConfirmProduct',
  'Answer questions first': 'helpAnswerQuestions',
  'Weight or body composition': 'concernWeight',
  Energy: 'concernEnergy',
  Recovery: 'concernRecovery',
  Sleep: 'concernSleep',
  'Focus or performance': 'concernFocus',
  'Healthy aging': 'concernHealthyAging',
  'General wellness': 'concernGeneralWellness',
  'I can share them now': 'biometricsReady',
  "I don't have them yet": 'biometricsNotReady',
  'I prefer to discuss them': 'biometricsDiscuss',
  'New to this': 'experienceNew',
  'Some experience': 'experienceSome',
  'Very experienced': 'experienceVery',
  'I want guidance': 'experienceGuidance',
  '18–29': 'age18To29',
  '30–39': 'age30To39',
  '40–49': 'age40To49',
  '50–59': 'age50To59',
  '60+': 'age60Plus',
  Female: 'optionFemale',
  Male: 'optionMale',
  Intersex: 'optionIntersex',
  'Prefer not to say': 'optionPreferNotToSay',
  Sedentary: 'optionSedentary',
  Light: 'optionLight',
  Moderate: 'optionModerate',
  'Very active': 'optionVeryActive',
  Athletic: 'optionAthletic',
  'Mostly seated': 'optionMostlySeated',
  'Mixed movement': 'optionMixedMovement',
  'Physically demanding': 'optionPhysicallyDemanding',
  'Training-focused': 'optionTrainingFocused',
  Excellent: 'optionExcellent',
  Good: 'optionGood',
  Inconsistent: 'optionInconsistent',
  Poor: 'optionPoor',
  Steady: 'optionSteady',
  'Afternoon dips': 'optionAfternoonDips',
  'Low most days': 'optionLowMostDays',
  Variable: 'optionVariable',
  'Very consistent': 'optionVeryConsistent',
  'Mostly consistent': 'optionMostlyConsistent',
  'Needs structure': 'optionNeedsStructure',
  No: 'optionNo',
  'Some research': 'optionSomeResearch',
  'Experienced researcher': 'optionExperiencedResearcher',
  'Prefer to discuss': 'optionPreferToDiscuss',
  Yes: 'optionYes',
  'Related category research': 'optionRelatedCategoryResearch',
  Email: 'contactEmail',
  SMS: 'contactSms',
  WhatsApp: 'contactWhatsapp',
  'Metabolic & Weight Management': 'categoryMetabolic',
  'Recovery & Regeneration': 'categoryRecovery',
  'Longevity & Cellular Health': 'categoryLongevity',
  'Cognitive & Performance': 'categoryCognitive',
  'Hormone & Wellness': 'categoryHormone',
}

const recommendationKeys: Record<string, string> = {
  'Metabolic Signaling': 'recommendationMetabolic',
  'Cellular Resilience / Aging Biology': 'recommendationCellularResilience',
  'Repair & Regeneration Models': 'recommendationRepair',
  'Endocrine Signaling': 'recommendationEndocrine',
  'Neurobiology & Performance Models': 'recommendationNeurobiology',
  'General Research Review': 'recommendationGeneral',
}

export { INTAKE_SESSION_KEY }

type IntakeDraft = {
  formData: IntakeFormData
  step: number
  phase: 'form' | 'loading' | 'results'
  lead: CustomerLead | null
  handoffToken: string
  locale: 'en' | 'es'
}

export function readIntakeDraft(): IntakeDraft {
  const emptyDraft = (): IntakeDraft => ({ formData: defaultIntakeFormData, step: 0, phase: 'form', lead: null, handoffToken: createIntakeHandoffToken(), locale: 'en' })
  if (typeof window === 'undefined') return emptyDraft()
  try {
    const saved = window.sessionStorage.getItem(INTAKE_SESSION_KEY)
    if (!saved) return emptyDraft()
    const parsed = JSON.parse(saved) as Partial<IntakeDraft>
    return {
      formData: {
        ...defaultIntakeFormData,
        ...(parsed.formData ?? {}),
        helpNeeded: normalizeHelpNeeded(parsed.formData?.helpNeeded),
      },
      step: Math.min(Math.max(Number(parsed.step) || 0, 0), stepKeys.length - 1),
      phase: parsed.phase === 'results' && parsed.lead ? 'results' : 'form',
      lead: parsed.lead ?? null,
      handoffToken: parsed.handoffToken ?? createIntakeHandoffToken(),
      locale: parsed.locale === 'es' ? 'es' : 'en',
    }
  } catch {
    return emptyDraft()
  }
}

function getIntakeValueLabel(t: TranslationFunction, value: string) {
  const key = intakeValueKeys[value]
  return key ? t(key) : value
}

const categorySlugs: Record<string, string> = {
  'Metabolic & Weight Management': 'metabolic-weight-management',
  'Recovery & Regeneration': 'recovery-regeneration',
  'Longevity & Cellular Health': 'longevity-cellular-health',
  'Cognitive & Performance': 'cognitive-performance',
  'Hormone & Wellness': 'hormone-wellness',
}

function inputClass() {
  return 'h-12 w-full rounded-2xl border border-slate-900/10 bg-white/82 px-4 text-sm text-[#071724] outline-none transition placeholder:text-slate-400 focus:border-teal-600/70 focus:ring-4 focus:ring-teal-100'
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-[#071724]">
      {label}
      {children}
    </label>
  )
}

function QuestionGroup({
  id,
  legend,
  hint,
  children,
}: {
  id?: string
  legend: string
  hint?: string
  children: ReactNode
}) {
  return (
    <fieldset id={id} tabIndex={id ? -1 : undefined} className="grid scroll-mt-32 gap-3 focus:outline-none focus-visible:ring-4 focus-visible:ring-teal-100">
      <legend className="text-sm font-semibold text-[#071724]">{legend}</legend>
      {hint ? <p className="text-xs leading-5 text-slate-500">{hint}</p> : null}
      {children}
    </fieldset>
  )
}

function TextInput({
  name,
  value,
  onChange,
  type = 'text',
  placeholder,
  autoComplete,
  required = true,
}: {
  name: IntakeStringField
  value: string
  onChange: (name: IntakeStringField, value: string) => void
  type?: string
  placeholder?: string
  autoComplete?: string
  required?: boolean
}) {
  return (
    <input
      name={name}
      value={value}
      type={type}
      required={required}
      autoComplete={autoComplete}
      placeholder={placeholder}
      onChange={(event) => onChange(name, event.target.value)}
      className={inputClass()}
    />
  )
}

function SelectField({
  name,
  value,
  onChange,
  options,
  placeholder,
  required = true,
}: {
  name: IntakeStringField
  value: string
  onChange: (name: IntakeStringField, value: string) => void
  options: string[]
  placeholder?: string
  required?: boolean
}) {
  const { t } = useTranslation('intake')
  return (
    <select
      name={name}
      value={value}
      required={required}
      onChange={(event) => onChange(name, event.target.value)}
      className={inputClass()}
    >
      <option value="">{placeholder ?? t('selectOne')}</option>
      {options.map((option) => (
        <option key={option} value={option}>
          {getIntakeValueLabel(t, option)}
        </option>
      ))}
    </select>
  )
}

function ChoiceGrid({
  name,
  value,
  options,
  onChange,
  required = true,
}: {
  name: IntakeStringField
  value: string
  options: string[]
  onChange: (name: IntakeStringField, value: string) => void
  required?: boolean
}) {
  const { t } = useTranslation('intake')
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {options.map((option) => (
        <label
          key={option}
          className={`flex min-h-14 cursor-pointer items-center rounded-2xl border px-4 py-3 text-sm font-semibold transition has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-teal-100 has-[:focus-visible]:border-teal-500 ${
            value === option
              ? 'border-teal-500 bg-teal-50 text-[#071724] shadow-[0_16px_36px_rgba(45,212,191,0.14)]'
              : 'border-slate-900/10 bg-white/74 text-slate-600 hover:border-slate-900/20'
          }`}
        >
          <input
            type="radio"
            name={name}
            value={option}
            checked={value === option}
            required={required}
            onChange={(event) => onChange(name, event.target.value)}
            className="sr-only"
          />
          {getIntakeValueLabel(t, option)}
        </label>
      ))}
    </div>
  )
}

function MultiChoiceGrid({
  name,
  selected,
  options,
  onToggle,
  maxSelections,
}: {
  name: 'topPriorities' | 'currentConcerns' | 'helpNeeded'
  selected: string[]
  options: string[]
  onToggle: (name: 'topPriorities' | 'currentConcerns' | 'helpNeeded', value: string, maxSelections?: number) => void
  maxSelections?: number
}) {
  const { t } = useTranslation('intake')

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {options.map((option) => {
        const isSelected = selected.includes(option)
        const isDisabled = !isSelected && Boolean(maxSelections && selected.length >= maxSelections)

        return (
          <label
            key={option}
            className={`flex min-h-14 items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold transition has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-teal-100 has-[:focus-visible]:border-teal-500 ${
              isSelected
                ? 'cursor-pointer border-teal-500 bg-teal-50 text-[#071724] shadow-[0_16px_36px_rgba(45,212,191,0.14)]'
                : isDisabled
                  ? 'cursor-not-allowed border-slate-900/5 bg-slate-50 text-slate-400'
                  : 'cursor-pointer border-slate-900/10 bg-white/74 text-slate-600 hover:border-slate-900/20'
            }`}
          >
            <input
              type="checkbox"
              name={name}
              value={option}
              checked={isSelected}
              disabled={isDisabled}
              onChange={() => onToggle(name, option, maxSelections)}
              className="size-4 shrink-0 accent-teal-600"
            />
            {getIntakeValueLabel(t, option)}
          </label>
        )
      })}
    </div>
  )
}

function ProductChoiceGrid({
  selected,
  onToggle,
  items = products.slice(0, 18),
}: {
  selected: string[]
  onToggle: (productName: string) => void
  items?: typeof products
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((product) => {
        const isSelected = selected.includes(product.name)

        return (
          <button
            key={product.slug}
            type="button"
            aria-pressed={isSelected}
            onClick={() => onToggle(product.name)}
            className={`min-h-12 rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition focus:outline-none focus-visible:ring-4 focus-visible:ring-teal-100 ${
              isSelected
                ? 'border-teal-500 bg-teal-50 text-[#071724] shadow-[0_16px_36px_rgba(45,212,191,0.14)]'
                : 'border-slate-900/10 bg-white/74 text-slate-600 hover:border-slate-900/20'
            }`}
          >
            {product.name}
          </button>
        )
      })}
    </div>
  )
}

export function IntakePage() {
  const { path, locale } = useLocale()
  const { identity, refresh } = usePortalAuth()
  const { t } = useTranslation('intake')
  const [initialDraft] = useState(readIntakeDraft)
  const [formData, setFormData] = useState(initialDraft.formData)
  const [step, setStep] = useState(initialDraft.step)
  const [phase, setPhase] = useState<'form' | 'loading' | 'results'>(initialDraft.phase)
  const [lead, setLead] = useState<CustomerLead | null>(initialDraft.lead)
  const [handoffToken] = useState(initialDraft.handoffToken)
  const [submitError, setSubmitError] = useState('')
  const submissionInFlightRef = useRef(false)
  const recommendation = useMemo(() => generateRecommendation(formData), [formData])
  const canContinue = isIntakeStepComplete(step, formData)
  const progress = Math.round(((step + 1) / stepKeys.length) * 100)

  useEffect(() => {
    try {
      window.sessionStorage.setItem(INTAKE_SESSION_KEY, JSON.stringify({ formData, step, phase, lead, handoffToken, locale, submitted: phase === 'results' }))
    } catch {
      // Draft persistence is best-effort; a private browsing policy must not block intake.
    }
  }, [formData, handoffToken, lead, locale, phase, step])

  useEffect(() => {
    if (phase !== 'form' || step !== 0 || !window.location.hash) return
    const targetId = window.location.hash.slice(1)
    if (!['research-goal', 'research-priorities', 'research-support'].includes(targetId)) return
    const frame = window.requestAnimationFrame(() => {
      const target = document.getElementById(targetId)
      target?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      target?.focus({ preventScroll: true })
    })
    return () => window.cancelAnimationFrame(frame)
  }, [phase, step])

  function updateField(name: IntakeStringField, value: string) {
    setFormData((current) => updateIntakeStringField(current, name, value))
    setSubmitError('')
  }

  function updateConsent(name: keyof IntakeFormData, value: boolean) {
    setFormData((current) => ({ ...current, [name]: value }))
  }

  function toggleProduct(productName: string) {
    setFormData((current) => ({
      ...current,
      interestedProducts: current.interestedProducts.includes(productName)
        ? current.interestedProducts.filter((name) => name !== productName)
        : [...current.interestedProducts, productName],
    }))
  }

  function toggleMultiValue(
    name: 'topPriorities' | 'currentConcerns' | 'helpNeeded',
    value: string,
    maxSelections?: number,
  ) {
    setFormData((current) => {
      const selected = current[name]
      const nextSelected = selected.includes(value)
        ? selected.filter((item) => item !== value)
        : maxSelections && selected.length >= maxSelections
          ? selected
          : [...selected, value]

      return { ...current, [name]: nextSelected }
    })
    setSubmitError('')
  }

  async function submitIntake(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submissionInFlightRef.current || phase === 'loading' || !isIntakeStepComplete(stepKeys.length - 1, formData)) return

    submissionInFlightRef.current = true
    setSubmitError('')
    setPhase('loading')
    const nextLead = { ...createLeadFromIntake(formData, recommendation), id: handoffToken }
    const crmLead = createCRMLeadFromIntake({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        city: formData.city,
        preferredLanguage: locale === 'es' ? 'Spanish' : 'English',
        source: 'Website intake',
        campaignSource: 'Website Intake',
        interestedProducts: formData.interestedProducts.map((productName) => ({
          productName,
          priority: 'primary',
        })),
        primaryGoal: formData.mainGoal || 'General Research Review',
        intakeSubmission: {
          id: crypto.randomUUID(),
          submittedAt: nextLead.createdAt,
          age: formData.age,
          sex: formData.sex,
          weight: formData.currentWeight,
          height: formData.height,
          mainGoal: formData.mainGoal || 'General Research Review',
          currentRoutine: [
            formData.topPriorities.length ? `Priorities: ${formData.topPriorities.join(', ')}` : '',
            formData.timeline ? `Timeline: ${formData.timeline}` : '',
            formData.helpNeeded.length ? `Support needed: ${formData.helpNeeded.join(', ')}` : '',
            formData.currentConcerns.length ? `Current focus: ${formData.currentConcerns.join(', ')}` : '',
            formData.lifestyleActivity,
            `Measurements: ${formData.biometricsStatus}`,
          ]
            .filter(Boolean)
            .join(' · '),
          sleepQuality: formData.sleepQuality,
          appetite: formData.currentConcerns.join(', '),
          energy: formData.energyLevels,
          previousProductsUsed: formData.peptideExperience,
          medicalConditions: formData.sensitivities,
          medications: formData.medicationsOrCompounds,
          budget: '',
          deliveryCity: formData.city,
          preferredContactMethod: formData.preferredContactMethod,
          consentToContact: formData.consentContact,
          researchUseAcknowledgment: formData.consentResearchUseOnly,
        },
      })

    try {
      await submitPublicIntake({
        lead: {
          ...crmLead,
          id: handoffToken,
          intakeSubmission: crmLead.intakeSubmission ? { ...crmLead.intakeSubmission, id: handoffToken } : undefined,
        },
        formData,
        handoffToken,
        locale,
      })
      const storedLeads = getStoredLeads().filter((storedLead) => storedLead.id !== nextLead.id)
      saveStoredLeads([nextLead, ...storedLeads])
      if (identity) {
        await claimPublicIntakeHandoff(handoffToken)
        await refresh()
      }
      setLead(nextLead)
      setPhase('results')
      track('intake_submitted', { locale, authenticated: Boolean(identity) })
    } catch {
      submissionInFlightRef.current = false
      setPhase('form')
      setSubmitError(t('submissionError'))
    }
  }

  return (
    <main id="main-content" className="relative bg-[#f5f5f2] px-5 py-10 sm:px-8 lg:py-16">
      <div className="molecule-field" aria-hidden="true" />
      <div className="relative mx-auto grid max-w-[88rem] gap-6 xl:grid-cols-[0.72fr_1.28fr] xl:items-start">
        <motion.aside
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
          className="order-2 overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#071724] p-6 text-white shadow-[0_32px_100px_rgba(7,23,36,0.22)] sm:p-8 xl:order-1"
        >
          <div className="relative">
            <div className="absolute right-[-8rem] top-[-8rem] h-72 w-72 rounded-full bg-teal-300/10 blur-3xl" />
            <span className="relative flex size-12 items-center justify-center rounded-2xl bg-white text-[#071724]">
              <Microscope size={21} aria-hidden="true" />
            </span>
            <p className="relative mt-8 text-xs font-semibold uppercase tracking-[0.22em] text-teal-200">
              {t('sidebarEyebrow')}
            </p>
            <h1 className="relative mt-4 text-4xl font-semibold tracking-[-0.055em] sm:text-5xl">
              {t('sidebarTitle')}
            </h1>
            <p className="relative mt-5 max-w-xl text-sm leading-7 text-slate-300">
              {t('sidebarBody')}
            </p>

            <div className="relative mt-8 grid gap-3">
              {[t('sidebarPoint1'), t('sidebarPoint2'), t('sidebarPoint3'), t('sidebarPoint4')].map((item) => (
                <div key={item} className="flex items-start gap-3 text-sm text-slate-300">
                  <CheckCircle2 size={17} aria-hidden="true" className="mt-0.5 shrink-0 text-teal-300" />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <div className="relative mt-8 rounded-2xl border border-white/10 bg-white/7 p-4 text-sm leading-6 text-slate-300">
              <div className="mb-2 flex items-center gap-2 font-semibold text-white">
                <ShieldCheck size={16} aria-hidden="true" className="text-teal-300" />
                {t('complianceBoundaryTitle')}
              </div>
              {t('complianceBoundaryBody')}
            </div>

            <div className="relative mt-5 rounded-2xl border border-white/10 bg-white/7 p-4 text-sm leading-6 text-slate-300">
              <div className="mb-1 flex items-center gap-2 font-semibold text-white">
                <LockKeyhole size={16} aria-hidden="true" className="text-teal-300" />
                {t('reachDirectlyTitle')}
              </div>
              {t('reachDirectlyBody')}
            </div>

            <div className="relative mt-5 grid gap-2 text-sm">
              <a href={path('/#products')} className="inline-flex items-center gap-2 font-semibold text-teal-200 transition hover:text-white">
                {t('browseCategoriesLink')}
                <ArrowRight size={15} aria-hidden="true" />
              </a>
              <a href={path('/research')} className="inline-flex items-center gap-2 font-semibold text-teal-200 transition hover:text-white">
                {t('readResearchLibraryLink')}
                <ArrowRight size={15} aria-hidden="true" />
              </a>
              <a href={path('/faq#ordering')} className="inline-flex items-center gap-2 font-semibold text-teal-200 transition hover:text-white">
                {t('reviewFaqsLink')}
                <ArrowRight size={15} aria-hidden="true" />
              </a>
            </div>
          </div>
        </motion.aside>

        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: 'easeOut', delay: 0.08 }}
          className="order-1 rounded-[1.75rem] border border-slate-900/10 bg-white/74 p-4 shadow-[0_24px_80px_rgba(7,23,36,0.1),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-2xl sm:p-7 xl:order-2"
        >
          {phase === 'loading' ? <LoadingScreen /> : null}
          {phase === 'results' && lead ? <ResultsPage lead={lead} authenticated={Boolean(identity)} /> : null}
          {phase === 'form' ? (
            <form onSubmit={submitIntake} className="grid gap-6">
              <div className="grid gap-3 rounded-2xl border border-slate-900/10 bg-[#f5f5f2] p-4" aria-live="polite">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">
                      {t('stepOf', { current: step + 1, total: stepKeys.length })}
                    </p>
                    <h2 className="mt-1 text-xl font-semibold tracking-[-0.03em] text-[#071724]">
                      {t(stepKeys[step])}
                    </h2>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-500 shadow-sm">
                    {progress}%
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-900/10">
                  <div
                    role="progressbar"
                    aria-label={t('stepOf', { current: step + 1, total: stepKeys.length })}
                    aria-valuemin={1}
                    aria-valuemax={stepKeys.length}
                    aria-valuenow={step + 1}
                    className="h-full rounded-full bg-teal-500 transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <div>
                {step === 0 ? (
                  <div className="grid gap-5">
                    <div className="rounded-2xl border border-teal-700/20 bg-teal-50 p-4 text-sm leading-6 text-teal-950">
                      <p className="font-semibold">{t('goalStepTitle')}</p>
                      <p className="mt-1">{t('goalStepBody')}</p>
                    </div>
                    <QuestionGroup id="research-goal" legend={t('mainGoalQuestion')} hint={t('mainGoalHelp')}>
                      <ChoiceGrid name="mainGoal" value={formData.mainGoal} options={mainGoalOptions} onChange={updateField} />
                    </QuestionGroup>
                    <QuestionGroup id="research-priorities" legend={t('prioritiesQuestion')} hint={t('chooseUpToThree')}>
                      <MultiChoiceGrid
                        name="topPriorities"
                        selected={formData.topPriorities}
                        options={priorityOptions}
                        onToggle={toggleMultiValue}
                        maxSelections={3}
                      />
                    </QuestionGroup>
                    <QuestionGroup legend={t('timelineQuestion')} hint={t('timelineHelp')}>
                      <ChoiceGrid name="timeline" value={formData.timeline} options={timelineOptions} onChange={updateField} />
                    </QuestionGroup>
                    <QuestionGroup id="research-support" legend={t('helpQuestion')} hint={t('helpQuestionHelp')}>
                      <MultiChoiceGrid name="helpNeeded" selected={formData.helpNeeded} options={helpOptions} onToggle={toggleMultiValue} />
                    </QuestionGroup>
                  </div>
                ) : null}

                {step === 1 ? (
                  <div className="grid gap-5">
                    <div className="rounded-2xl border border-teal-700/20 bg-teal-50 p-4 text-sm leading-6 text-teal-950">
                      <p className="font-semibold">{t('situationStepTitle')}</p>
                      <p className="mt-1">{t('situationStepBody')}</p>
                    </div>
                    <QuestionGroup legend={t('currentConcernsQuestion')} hint={t('selectAllThatApply')}>
                      <MultiChoiceGrid
                        name="currentConcerns"
                        selected={formData.currentConcerns}
                        options={concernOptions}
                        onToggle={toggleMultiValue}
                      />
                    </QuestionGroup>
                    <div className="grid gap-5 md:grid-cols-2">
                      <Field label={t('activityQuestion')}>
                        <SelectField name="lifestyleActivity" value={formData.lifestyleActivity} options={activityOptions} onChange={updateField} />
                      </Field>
                      <Field label={t('sleepQuestion')}>
                        <SelectField name="sleepQuality" value={formData.sleepQuality} options={sleepOptions} onChange={updateField} />
                      </Field>
                      <Field label={t('energyQuestion')}>
                        <SelectField name="energyLevels" value={formData.energyLevels} options={energyOptions} onChange={updateField} />
                      </Field>
                      <Field label={t('experienceQuestion')}>
                        <SelectField name="peptideExperience" value={formData.peptideExperience} options={peptideExperienceOptions} onChange={updateField} />
                      </Field>
                    </div>
                    <QuestionGroup legend={t('biometricsQuestion')} hint={t('biometricsHelp')}>
                      <ChoiceGrid name="biometricsStatus" value={formData.biometricsStatus} options={biometricsOptions} onChange={updateField} />
                    </QuestionGroup>

                    {formData.biometricsStatus === 'I can share them now' ? (
                      <div className="grid gap-4 rounded-[1.5rem] border border-slate-900/10 bg-[#f5f5f2]/70 p-4 md:grid-cols-2 sm:p-5">
                        <Field label={`${t('ageRange')} (${t('required')})`}>
                          <SelectField name="age" value={formData.age} options={ageRangeOptions} onChange={updateField} />
                        </Field>
                        <Field label={`${t('biologicalSex')} (${t('required')})`}>
                          <SelectField name="sex" value={formData.sex} options={sexOptions} onChange={updateField} />
                        </Field>
                        <Field label={`${t('height')} (${t('required')})`}>
                          <TextInput name="height" value={formData.height} onChange={updateField} placeholder={t('heightPlaceholder')} />
                        </Field>
                        <Field label={`${t('currentWeight')} (${t('required')})`}>
                          <TextInput name="currentWeight" value={formData.currentWeight} onChange={updateField} placeholder={t('weightPlaceholder')} />
                        </Field>
                        <Field label={`${t('goalWeight')} (${t('required')})`}>
                          <TextInput name="goalWeight" value={formData.goalWeight} onChange={updateField} placeholder={t('weightPlaceholder')} />
                        </Field>
                      </div>
                    ) : null}

                    {formData.peptideExperience === 'New to this' ? (
                      <div role="status" className="rounded-2xl border border-teal-700/20 bg-teal-50 p-4 text-sm leading-6 text-teal-950">
                        {t('newExperienceReassurance')}
                      </div>
                    ) : (
                      <QuestionGroup legend={`${t('interestedProductsQuestion')} (${t('required')})`} hint={t('recommendedProductsHelp')}>
                        <ProductChoiceGrid selected={formData.interestedProducts} onToggle={toggleProduct} items={recommendation.recommendedProducts} />
                      </QuestionGroup>
                    )}
                  </div>
                ) : null}

                {step === 2 ? (
                  <div className="grid gap-5">
                    <IntakeAnswerReview data={formData} />
                    <NextStepsCard />
                    <NotMedicalAdviceCard />
                    <div className="grid gap-4 md:grid-cols-2">
                      <Field label={`${t('firstName')} (${t('required')})`}>
                        <TextInput name="firstName" value={formData.firstName} onChange={updateField} autoComplete="given-name" />
                      </Field>
                      <Field label={`${t('lastName')} (${t('required')})`}>
                        <TextInput name="lastName" value={formData.lastName} onChange={updateField} autoComplete="family-name" />
                      </Field>
                      <Field label={`${t('email')} (${t('required')})`}>
                        <TextInput
                          name="email"
                          value={formData.email}
                          type="email"
                          onChange={updateField}
                          autoComplete="email"
                        />
                      </Field>
                      <Field label={`${t('phoneNumber')} (${t('required')})`}>
                        <TextInput
                          name="phone"
                          value={formData.phone}
                          type="tel"
                          onChange={updateField}
                          autoComplete="tel"
                        />
                      </Field>
                      <Field label={`${t('city')} (${t('required')})`}>
                        <TextInput name="city" value={formData.city} onChange={updateField} autoComplete="address-level2" />
                      </Field>
                      <Field label={`${t('preferredContactMethod')} (${t('required')})`}>
                        <SelectField name="preferredContactMethod" value={formData.preferredContactMethod} options={contactOptions} onChange={updateField} />
                      </Field>
                    </div>
                    <ResponseTimelineCard />
                    <ConsentChecklist data={formData} onChange={updateConsent} />
                    <div className="rounded-2xl border border-teal-700/20 bg-teal-50 p-4 text-sm leading-6 text-teal-950">
                      {t('formUnlocksNote')}
                    </div>
                  </div>
                ) : null}
              </div>

              {submitError ? (
                <p role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold leading-6 text-red-800">
                  {submitError}
                </p>
              ) : null}

              <div className="flex flex-col gap-3 border-t border-slate-900/10 pt-5 sm:flex-row sm:justify-between">
                <button
                  type="button"
                  disabled={step === 0}
                  onClick={() => setStep((current) => Math.max(current - 1, 0))}
                  className="inline-flex h-12 items-center justify-center gap-3 rounded-full border border-slate-900/10 bg-white px-6 text-sm font-semibold text-[#071724] transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ArrowLeft size={16} aria-hidden="true" />
                  {t('back')}
                </button>

                {step === stepKeys.length - 1 ? (
                  <button
                    type="submit"
                    disabled={!canContinue}
                    className="inline-flex h-12 items-center justify-center gap-3 rounded-full bg-[#071724] px-6 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(7,23,36,0.18)] transition hover:bg-[#102a3d] disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    {submitError ? t('retrySubmission') : t('submitForReview')}
                    <Sparkles size={16} aria-hidden="true" />
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={!canContinue}
                    onClick={() => setStep((current) => Math.min(current + 1, stepKeys.length - 1))}
                    className="inline-flex h-12 items-center justify-center gap-3 rounded-full bg-[#071724] px-6 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(7,23,36,0.18)] transition hover:bg-[#102a3d] disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    {t('continue')}
                    <ArrowRight size={16} aria-hidden="true" />
                  </button>
                )}
              </div>
            </form>
          ) : null}
        </motion.section>
      </div>
    </main>
  )
}

function LoadingScreen() {
  const { t } = useTranslation('intake')
  return (
    <div role="status" aria-live="polite" aria-busy="true" className="grid min-h-[36rem] place-items-center text-center">
      <div className="max-w-xl">
        <div className="mx-auto flex size-16 items-center justify-center rounded-3xl bg-[#071724] text-white shadow-[0_18px_48px_rgba(7,23,36,0.2)]">
          <LoaderCircle size={26} aria-hidden="true" className="animate-spin text-teal-300" />
        </div>
        <h2 className="mt-7 text-3xl font-semibold tracking-[-0.045em] text-[#071724]">
          {t('loadingTitle')}
        </h2>
        <div className="mt-6 grid gap-3 text-sm font-semibold text-slate-600">
          <p>{t('loadingLine1')}</p>
          <p>{t('loadingLine2')}</p>
        </div>
      </div>
    </div>
  )
}

function TrustCard({
  icon,
  eyebrow,
  title,
  body,
  bullets,
}: {
  icon: ReactNode
  eyebrow: string
  title: string
  body: string
  bullets: string[]
}) {
  return (
    <div className="rounded-[1.5rem] border border-teal-700/20 bg-gradient-to-br from-white via-teal-50/70 to-cyan-50/50 p-5 shadow-[0_18px_50px_rgba(7,23,36,0.07)]">
      <div className="flex items-start gap-4">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[#071724] text-teal-300">
          {icon}
        </span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">{eyebrow}</p>
          <h3 className="mt-2 text-xl font-semibold tracking-[-0.035em] text-[#071724]">{title}</h3>
          <p className="mt-3 text-sm leading-6 text-slate-600">{body}</p>
        </div>
      </div>
      <div className="mt-5 grid gap-2 sm:grid-cols-2">
        {bullets.map((bullet) => (
          <div key={bullet} className="flex items-start gap-2 text-sm font-semibold text-slate-600">
            <CheckCircle2 size={16} aria-hidden="true" className="mt-0.5 shrink-0 text-teal-600" />
            <span>{bullet}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function NextStepsCard() {
  const { t } = useTranslation('intake')
  return (
    <TrustCard
      icon={<FileCheck2 size={18} aria-hidden="true" />}
      eyebrow={t('nextStepsEyebrow')}
      title={t('nextStepsTitle')}
      body={t('nextStepsBody')}
      bullets={[t('nextStepsBullet1'), t('nextStepsBullet2'), t('nextStepsBullet3'), t('nextStepsBullet4')]}
    />
  )
}

function NotMedicalAdviceCard() {
  const { t: tBrand } = useTranslation('brand')
  return (
    <div className="rounded-[1.5rem] border border-slate-900/10 bg-white/82 p-5 shadow-[0_18px_50px_rgba(7,23,36,0.06)]">
      <div className="flex items-start gap-4">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[#071724] text-teal-300">
          <ShieldCheck size={18} aria-hidden="true" />
        </span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">
            {tBrand('notMedicalAdviceLabel')}
          </p>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            {tBrand('intakeDisclaimer')}
          </p>
        </div>
      </div>
    </div>
  )
}

function ResponseTimelineCard() {
  const { t } = useTranslation('intake')
  return (
    <div className="rounded-[1.5rem] border border-slate-900/10 bg-[#f5f5f2]/80 p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">{t('responseTimelineEyebrow')}</p>
      <p className="mt-3 text-sm leading-6 text-slate-600">
        {t('responseTimelineBody')}
      </p>
    </div>
  )
}

function IntakeAnswerReview({ data }: { data: IntakeFormData }) {
  const { t } = useTranslation('intake')
  const rows = [
    [t('reviewGoalLabel'), data.mainGoal ? [getIntakeValueLabel(t, data.mainGoal)] : []],
    [t('reviewPrioritiesLabel'), data.topPriorities.map((value) => getIntakeValueLabel(t, value))],
    [t('reviewSupportLabel'), data.helpNeeded.map((value) => getIntakeValueLabel(t, value))],
    [t('reviewFocusLabel'), data.currentConcerns.map((value) => getIntakeValueLabel(t, value))],
    [t('reviewProductsLabel'), data.interestedProducts],
  ] as const

  return (
    <div className="rounded-[1.5rem] border border-slate-900/10 bg-[#f5f5f2]/80 p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">{t('reviewAnswersTitle')}</p>
      <dl className="mt-4 grid gap-4 sm:grid-cols-2">
        {rows.map(([label, values]) => <div key={label}><dt className="text-xs font-semibold text-slate-500">{label}</dt><dd className="mt-1 text-sm font-semibold leading-6 text-[#071724]">{values.length ? values.join(', ') : t('notSelected')}</dd></div>)}
      </dl>
    </div>
  )
}

function ConsentChecklist({
  data,
  onChange,
}: {
  data: IntakeFormData
  onChange: (name: keyof IntakeFormData, value: boolean) => void
}) {
  const { t } = useTranslation('intake')
  const consentItems: Array<[keyof IntakeFormData, string]> = [
    ['consentResearchUseOnly', t('consent1')],
    ['consentNoMedicalAdvice', t('consent2')],
    ['consentAccuracy', t('consent3')],
    ['consentContact', t('consent4')],
    ['consentInternalReview', t('consent5')],
  ]

  return (
    <div className="grid gap-3 rounded-[1.5rem] border border-slate-900/10 bg-white/82 p-5">
      <p className="text-sm font-semibold text-[#071724]">{t('consentEligibilityTitle')}</p>
      {consentItems.map(([name, label]) => (
        <label
          key={name}
          className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-900/10 bg-[#f5f5f2]/70 p-4 text-sm font-semibold leading-6 text-[#071724]"
        >
          <input
            type="checkbox"
            required
            checked={Boolean(data[name])}
            onChange={(event) => onChange(name, event.target.checked)}
            className="mt-1 size-4 accent-teal-600"
          />
          {label}
        </label>
      ))}
    </div>
  )
}

function ResultsPage({
  lead,
  authenticated,
}: {
  lead: CustomerLead
  authenticated: boolean
}) {
  const { path, locale } = useLocale()
  const { t } = useTranslation('intake')
  const categories = [
    lead.recommendationSummary.primaryCategory,
    lead.recommendationSummary.secondaryCategory,
  ]

  return (
    <div className="grid gap-6">
      <div role="status" aria-live="polite" className="rounded-[1.5rem] border border-teal-700/20 bg-teal-50 p-5">
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-[#071724] text-white">
            <Sparkles size={19} aria-hidden="true" />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">{t('resultsPendingEyebrow')}</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-[-0.035em] text-[#071724]">
              {t('resultsSubmittedTitle')}
            </h2>
          </div>
        </div>
        <p className="mt-4 text-sm leading-6 text-slate-600">
          {t('resultsSubmittedBody')}
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <SummaryTile label={t('selectedContactMethod')} value={getIntakeValueLabel(t, lead.preferredContactMethod)} />
        <SummaryTile label={t('mainResearchCategory')} value={getIntakeValueLabel(t, lead.recommendationSummary.primaryCategory)} />
        <SummaryTile label={t('status')} value={t('pendingReview')} />
      </div>

      <div className="rounded-[1.5rem] border border-slate-900/10 bg-white/82 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-700">{t('matchedCategories')}</p>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {categories.map((category) => (
            <a
              key={category}
              href={path(`/categories/${categorySlugs[category] ?? ''}`)}
              className="rounded-2xl border border-slate-900/10 bg-[#f5f5f2]/70 p-4 text-sm font-semibold text-[#071724] transition hover:-translate-y-0.5 hover:border-teal-500/50 hover:bg-white"
            >
              {getIntakeValueLabel(t, category)}
              <span className="mt-2 block text-xs font-semibold text-teal-700">{t('viewCategoryPage')}</span>
            </a>
          ))}
        </div>
      </div>

      <div className="rounded-[1.5rem] border border-slate-900/10 bg-white/82 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-700">{t('resultsNextStepsEyebrow')}</p>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          {t('resultsNextStepsBody')}
        </p>
      </div>

      <div className="rounded-[1.5rem] border border-slate-900/10 bg-[#071724] p-5 text-white">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <FlaskConical size={17} aria-hidden="true" className="text-teal-300" />
          {t('researchUseExplanationTitle')}
        </div>
        <p className="mt-4 text-sm leading-7 text-slate-300">
          {t(recommendationKeys[lead.mainGoal] ?? 'recommendationGeneral')}
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <a href={path(authenticated ? '/portal/intake' : '/client-register')} className="inline-flex h-12 items-center justify-center rounded-full bg-[#071724] px-6 text-sm font-semibold text-white">
          {authenticated ? t('continueToPortal') : t('createClientAccount')}
        </a>
        <a href={path('/')} className="inline-flex h-12 items-center justify-center rounded-full border border-slate-900/10 bg-white px-6 text-sm font-semibold text-[#071724]">
          {t('returnHome')}
        </a>
        {!authenticated ? (
          <a href={path('/client-login')} className="inline-flex h-12 items-center justify-center rounded-full border border-slate-900/10 bg-white px-6 text-sm font-semibold text-[#071724]">
            {t('signInToClientAccount')}
          </a>
        ) : null}
        <a
          href={buildWhatsAppUrl(getGeneralInquiryMessage(locale))}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track('whatsapp_click', { source: 'intake_success', locale })}
          className="inline-flex h-12 items-center justify-center rounded-full border border-slate-900/10 bg-white px-6 text-sm font-semibold text-[#071724]"
        >
          {t('contactSupport')}
        </a>
      </div>
    </div>
  )
}

function SummaryTile({ label, value }: { label: string; value: string }) {
  const { t } = useTranslation('intake')
  return (
    <div className="rounded-2xl border border-slate-900/10 bg-white/82 p-4">
      <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{label}</div>
      <div className="mt-2 text-sm font-semibold leading-6 text-[#071724]">{value || t('notSelected')}</div>
    </div>
  )
}
