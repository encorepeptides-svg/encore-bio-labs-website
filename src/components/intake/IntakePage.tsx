import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  FileCheck2,
  FlaskConical,
  LoaderCircle,
  LockKeyhole,
  Microscope,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import { useLocale, useTranslation } from '../../i18n/LocaleContext'
import { products } from '../../data/products'
import {
  createLeadFromIntake,
  defaultIntakeFormData,
  generateRecommendation,
  getStoredLeads,
  mainGoalOptions,
  saveStoredLeads,
  type CustomerLead,
  type IntakeFormData,
} from '../../data/intake'
import { createCRMLeadFromIntake, saveLead } from '../../lib/crmStorage'

const stepKeys = ['stepGoal', 'stepBiometrics', 'stepLifestyle', 'stepExperience', 'stepReview'] as const
const sexOptions = ['Female', 'Male', 'Intersex', 'Prefer not to say']
const activityOptions = ['Sedentary', 'Light', 'Moderate', 'Very active', 'Athletic']
const lifestyleOptions = ['Mostly seated', 'Mixed movement', 'Physically demanding', 'Training-focused']
const sleepOptions = ['Excellent', 'Good', 'Inconsistent', 'Poor']
const energyOptions = ['Steady', 'Afternoon dips', 'Low most days', 'Variable']
const nutritionOptions = ['Very consistent', 'Mostly consistent', 'Inconsistent', 'Needs structure']
const peptideExperienceOptions = ['No', 'Some research', 'Experienced researcher', 'Prefer to discuss']
const glpExperienceOptions = ['No', 'Yes', 'Related category research', 'Prefer to discuss']
const contactOptions = ['Email', 'SMS', 'WhatsApp']

type TranslationFunction = (key: string, vars?: Record<string, string | number>) => string

const intakeValueKeys: Record<string, string> = {
  'Metabolic Signaling': 'goalMetabolic',
  'Cellular Resilience / Aging Biology': 'goalCellularResilience',
  'Repair & Regeneration Models': 'goalRepair',
  'Endocrine Signaling': 'goalEndocrine',
  'Neurobiology & Performance Models': 'goalNeurobiology',
  'General Research Review': 'goalGeneral',
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

export const INTAKE_SESSION_KEY = 'encore-intake-draft-v1'

type IntakeDraft = {
  formData: IntakeFormData
  step: number
  phase: 'form' | 'loading' | 'results'
  lead: CustomerLead | null
}

export function readIntakeDraft(): IntakeDraft {
  if (typeof window === 'undefined') return { formData: defaultIntakeFormData, step: 0, phase: 'form', lead: null }
  try {
    const saved = window.sessionStorage.getItem(INTAKE_SESSION_KEY)
    if (!saved) return { formData: defaultIntakeFormData, step: 0, phase: 'form', lead: null }
    const parsed = JSON.parse(saved) as Partial<IntakeDraft>
    return {
      formData: { ...defaultIntakeFormData, ...(parsed.formData ?? {}) },
      step: Math.min(Math.max(Number(parsed.step) || 0, 0), stepKeys.length - 1),
      phase: parsed.phase === 'loading' || parsed.phase === 'results' ? parsed.phase : 'form',
      lead: parsed.lead ?? null,
    }
  } catch {
    return { formData: defaultIntakeFormData, step: 0, phase: 'form', lead: null }
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

function TextInput({
  name,
  value,
  onChange,
  type = 'text',
  placeholder,
  autoComplete,
  required = true,
}: {
  name: keyof IntakeFormData
  value: string
  onChange: (name: keyof IntakeFormData, value: string) => void
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

function TextArea({
  name,
  value,
  onChange,
  placeholder,
  required = true,
}: {
  name: keyof IntakeFormData
  value: string
  onChange: (name: keyof IntakeFormData, value: string) => void
  placeholder?: string
  required?: boolean
}) {
  return (
    <textarea
      name={name}
      value={value}
      required={required}
      placeholder={placeholder}
      onChange={(event) => onChange(name, event.target.value)}
      className="min-h-28 w-full resize-none rounded-2xl border border-slate-900/10 bg-white/82 p-4 text-sm leading-6 text-[#071724] outline-none transition placeholder:text-slate-400 focus:border-teal-600/70 focus:ring-4 focus:ring-teal-100"
    />
  )
}

function SelectField({
  name,
  value,
  onChange,
  options,
  placeholder,
}: {
  name: keyof IntakeFormData
  value: string
  onChange: (name: keyof IntakeFormData, value: string) => void
  options: string[]
  placeholder?: string
}) {
  const { t } = useTranslation('intake')
  return (
    <select
      name={name}
      value={value}
      required
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
}: {
  name: keyof IntakeFormData
  value: string
  options: string[]
  onChange: (name: keyof IntakeFormData, value: string) => void
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
            required
            onChange={(event) => onChange(name, event.target.value)}
            className="sr-only"
          />
          {getIntakeValueLabel(t, option)}
        </label>
      ))}
    </div>
  )
}

function ProductChoiceGrid({
  selected,
  onToggle,
}: {
  selected: string[]
  onToggle: (productName: string) => void
}) {
  const visibleProducts = products.slice(0, 18)

  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {visibleProducts.map((product) => {
        const isSelected = selected.includes(product.name)

        return (
          <button
            key={product.slug}
            type="button"
            onClick={() => onToggle(product.name)}
            className={`min-h-12 rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition ${
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

function isStepComplete(step: number, data: IntakeFormData) {
  const requiredFields: Array<Array<keyof IntakeFormData>> = [
    ['mainGoal'],
    [
      'age',
      'sex',
      'height',
      'currentWeight',
      'goalWeight',
      'bodyFat',
      'activityLevel',
      'waist',
      'medicationsOrCompounds',
      'sensitivities',
    ],
    [
      'lifestyleActivity',
      'exerciseDays',
      'sleepQuality',
      'energyLevels',
      'nutritionConsistency',
      'mainObstacle',
    ],
    ['peptideExperience', 'glpExperience', 'desiredResearchResult'],
    ['firstName', 'lastName', 'city', 'preferredContactMethod'],
  ]

  const fieldsComplete = requiredFields[step].every((field) => {
    const value = data[field]
    return typeof value === 'string' && value.trim().length > 0
  })

  if (step === 3) {
    return fieldsComplete && data.interestedProducts.length > 0
  }

  if (step === 4) {
    const hasRequiredContact =
      data.preferredContactMethod === 'Email'
        ? data.email.trim().length > 0
        : data.phone.trim().length > 0
    const hasConsent =
      data.consentResearchUseOnly &&
      data.consentNoMedicalAdvice &&
      data.consentAccuracy &&
      data.consentContact &&
      data.consentInternalReview

    return fieldsComplete && hasRequiredContact && hasConsent
  }

  return fieldsComplete
}

export function IntakePage() {
  const { path } = useLocale()
  const { t } = useTranslation('intake')
  const [initialDraft] = useState(readIntakeDraft)
  const [formData, setFormData] = useState(initialDraft.formData)
  const [step, setStep] = useState(initialDraft.step)
  const [phase, setPhase] = useState<'form' | 'loading' | 'results'>(initialDraft.phase)
  const [lead, setLead] = useState<CustomerLead | null>(initialDraft.lead)
  const recommendation = useMemo(() => generateRecommendation(formData), [formData])
  const canContinue = isStepComplete(step, formData)
  const progress = Math.round(((step + 1) / stepKeys.length) * 100)

  useEffect(() => {
    try {
      window.sessionStorage.setItem(INTAKE_SESSION_KEY, JSON.stringify({ formData, step, phase, lead }))
    } catch {
      // Draft persistence is best-effort; a private browsing policy must not block intake.
    }
  }, [formData, lead, phase, step])

  useEffect(() => {
    if (phase !== 'loading') {
      return
    }

    const timer = window.setTimeout(() => setPhase('results'), 1800)
    return () => window.clearTimeout(timer)
  }, [phase])

  function updateField(name: keyof IntakeFormData, value: string) {
    setFormData((current) => ({ ...current, [name]: value }))
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

  async function submitIntake(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const nextLead = createLeadFromIntake(formData, recommendation)
    saveStoredLeads([nextLead, ...getStoredLeads()])
    await saveLead(
      createCRMLeadFromIntake({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        city: formData.city,
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
            formData.lifestyleActivity,
            formData.exerciseDays ? `${formData.exerciseDays} exercise days/week` : '',
            formData.nutritionConsistency,
          ]
            .filter(Boolean)
            .join(' · '),
          sleepQuality: formData.sleepQuality,
          appetite: formData.mainObstacle,
          energy: formData.energyLevels,
          previousProductsUsed: [formData.peptideExperience, formData.glpExperience].filter(Boolean).join(' · '),
          medicalConditions: formData.sensitivities,
          medications: formData.medicationsOrCompounds,
          budget: '',
          deliveryCity: formData.city,
          preferredContactMethod: formData.preferredContactMethod,
          consentToContact: formData.consentContact,
          researchUseAcknowledgment: formData.consentResearchUseOnly,
        },
      }),
    )
    setLead(nextLead)
    setPhase('loading')
    window.history.replaceState(null, '', `/intake?lead=${nextLead.id}`)
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
          {phase === 'results' && lead ? <ResultsPage lead={lead} /> : null}
          {phase === 'form' ? (
            <form onSubmit={submitIntake} className="grid gap-6">
              <div className="grid gap-3 rounded-2xl border border-slate-900/10 bg-[#f5f5f2] p-4">
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
                    className="h-full rounded-full bg-teal-500 transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <div className="min-h-[32rem]">
                {step === 0 ? (
                  <div className="grid gap-5">
                    <TrustCard
                      icon={<LockKeyhole size={18} aria-hidden="true" />}
                      eyebrow={t('yourDataEyebrow')}
                      title={t('yourDataTitle')}
                      body={t('yourDataBody')}
                      bullets={[t('yourDataBullet1'), t('yourDataBullet2'), t('yourDataBullet3'), t('yourDataBullet4')]}
                    />
                    <Field label={t('mainGoalQuestion')}>
                      <ChoiceGrid name="mainGoal" value={formData.mainGoal} options={mainGoalOptions} onChange={updateField} />
                    </Field>
                  </div>
                ) : null}

                {step === 1 ? (
                  <div className="grid gap-5">
                    <ReviewProcessCard />
                    <div className="grid gap-4 md:grid-cols-2">
                      <Field label={t('age')}>
                        <TextInput name="age" value={formData.age} type="number" onChange={updateField} />
                      </Field>
                      <Field label={t('biologicalSex')}>
                        <SelectField name="sex" value={formData.sex} options={sexOptions} onChange={updateField} />
                      </Field>
                      <Field label={t('height')}>
                        <TextInput name="height" value={formData.height} onChange={updateField} placeholder={'5\'10"'} />
                      </Field>
                      <Field label={t('currentWeight')}>
                        <TextInput name="currentWeight" value={formData.currentWeight} type="number" onChange={updateField} />
                      </Field>
                      <Field label={t('goalWeight')}>
                        <TextInput name="goalWeight" value={formData.goalWeight} type="number" onChange={updateField} />
                      </Field>
                      <Field label={t('bodyFatEstimate')}>
                        <TextInput name="bodyFat" value={formData.bodyFat} onChange={updateField} placeholder={t('bodyFatPlaceholder')} />
                      </Field>
                      <Field label={t('activityLevel')}>
                        <SelectField name="activityLevel" value={formData.activityLevel} options={activityOptions} onChange={updateField} />
                      </Field>
                      <Field label={t('waistMeasurement')}>
                        <TextInput name="waist" value={formData.waist} onChange={updateField} placeholder={t('waistPlaceholder')} />
                      </Field>
                      <div className="md:col-span-2">
                        <Field label={t('currentCompounds')}>
                          <TextArea name="medicationsOrCompounds" value={formData.medicationsOrCompounds} onChange={updateField} placeholder={t('noneUnknownPlaceholder')} />
                        </Field>
                      </div>
                      <div className="md:col-span-2">
                        <Field label={t('sensitivities')}>
                          <TextArea name="sensitivities" value={formData.sensitivities} onChange={updateField} placeholder={t('noneUnknownPlaceholder')} />
                        </Field>
                      </div>
                    </div>
                  </div>
                ) : null}

                {step === 2 ? (
                  <div className="grid gap-5">
                    <Field label={t('lifestyleQuestion')}>
                      <ChoiceGrid name="lifestyleActivity" value={formData.lifestyleActivity} options={lifestyleOptions} onChange={updateField} />
                    </Field>
                    <div className="grid gap-4 md:grid-cols-2">
                      <Field label={t('exerciseDaysQuestion')}>
                        <TextInput name="exerciseDays" value={formData.exerciseDays} type="number" onChange={updateField} placeholder={t('exerciseDaysPlaceholder')} />
                      </Field>
                      <Field label={t('sleepQualityQuestion')}>
                        <SelectField name="sleepQuality" value={formData.sleepQuality} options={sleepOptions} onChange={updateField} />
                      </Field>
                      <Field label={t('energyLevelsQuestion')}>
                        <SelectField name="energyLevels" value={formData.energyLevels} options={energyOptions} onChange={updateField} />
                      </Field>
                      <Field label={t('nutritionQuestion')}>
                        <SelectField name="nutritionConsistency" value={formData.nutritionConsistency} options={nutritionOptions} onChange={updateField} />
                      </Field>
                    </div>
                    <Field label={t('mainObstacle')}>
                      <TextArea name="mainObstacle" value={formData.mainObstacle} onChange={updateField} />
                    </Field>
                  </div>
                ) : null}

                {step === 3 ? (
                  <div className="grid gap-5">
                    <Field label={t('peptideExperienceQuestion')}>
                      <ChoiceGrid name="peptideExperience" value={formData.peptideExperience} options={peptideExperienceOptions} onChange={updateField} />
                    </Field>
                    <Field label={t('glpExperienceQuestion')}>
                      <ChoiceGrid name="glpExperience" value={formData.glpExperience} options={glpExperienceOptions} onChange={updateField} />
                    </Field>
                    <div className="grid gap-2">
                      <p className="text-sm font-semibold text-[#071724]">{t('interestedProductsQuestion')}</p>
                      <ProductChoiceGrid selected={formData.interestedProducts} onToggle={toggleProduct} />
                    </div>
                    <Field label={t('desiredResultQuestion')}>
                      <TextArea name="desiredResearchResult" value={formData.desiredResearchResult} onChange={updateField} />
                    </Field>
                  </div>
                ) : null}

                {step === 4 ? (
                  <div className="grid gap-5">
                    <NextStepsCard />
                    <NotMedicalAdviceCard />
                    <div className="grid gap-4 md:grid-cols-2">
                      <Field label={t('firstName')}>
                        <TextInput name="firstName" value={formData.firstName} onChange={updateField} autoComplete="given-name" />
                      </Field>
                      <Field label={t('lastName')}>
                        <TextInput name="lastName" value={formData.lastName} onChange={updateField} autoComplete="family-name" />
                      </Field>
                      <Field label={t('email')}>
                        <TextInput
                          name="email"
                          value={formData.email}
                          type="email"
                          onChange={updateField}
                          autoComplete="email"
                          required={formData.preferredContactMethod === 'Email'}
                        />
                      </Field>
                      <Field label={t('phoneNumber')}>
                        <TextInput
                          name="phone"
                          value={formData.phone}
                          type="tel"
                          onChange={updateField}
                          autoComplete="tel"
                          required={formData.preferredContactMethod === 'SMS' || formData.preferredContactMethod === 'WhatsApp'}
                        />
                      </Field>
                      <Field label={t('city')}>
                        <TextInput name="city" value={formData.city} onChange={updateField} autoComplete="address-level2" />
                      </Field>
                      <Field label={t('preferredContactMethod')}>
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
                    {t('submitForReview')}
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
    <div className="grid min-h-[36rem] place-items-center text-center">
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

function ReviewProcessCard() {
  const { t } = useTranslation('intake')
  const steps = [t('reviewStep1'), t('reviewStep2'), t('reviewStep3')]

  return (
    <div className="rounded-[1.5rem] border border-slate-900/10 bg-white/82 p-5 shadow-[0_18px_50px_rgba(7,23,36,0.06)]">
      <div className="flex items-start gap-4">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
          <ClipboardCheck size={18} aria-hidden="true" />
        </span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">{t('reviewProcessEyebrow')}</p>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            {t('reviewProcessBody')}
          </p>
        </div>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {steps.map((item, index) => (
          <div key={item} className="rounded-2xl border border-slate-900/10 bg-[#f5f5f2]/70 p-4">
            <div className="flex size-8 items-center justify-center rounded-full bg-[#071724] text-sm font-semibold text-white">
              {index + 1}
            </div>
            <p className="mt-3 text-sm font-semibold leading-6 text-[#071724]">{item}</p>
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
}: {
  lead: CustomerLead
}) {
  const { path } = useLocale()
  const { t } = useTranslation('intake')
  const categories = [
    lead.recommendationSummary.primaryCategory,
    lead.recommendationSummary.secondaryCategory,
  ]

  return (
    <div className="grid gap-6">
      <div className="rounded-[1.5rem] border border-teal-700/20 bg-teal-50 p-5">
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

      <div className="grid gap-3 sm:grid-cols-2">
        {lead.recommendedProducts.map((product) => (
          <a
            key={product.slug}
            href={path(`/products/${product.slug}`)}
            className="rounded-2xl border border-slate-900/10 bg-white/82 p-4 transition hover:-translate-y-0.5 hover:border-teal-500/50 hover:shadow-[0_18px_44px_rgba(7,23,36,0.09)]"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-700">{getIntakeValueLabel(t, product.category)}</p>
            <h3 className="mt-2 text-lg font-semibold tracking-[-0.03em] text-[#071724]">{product.name}</h3>
            <p className="mt-3 text-sm font-semibold text-slate-500">{t('viewProductPage')}</p>
          </a>
        ))}
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
        <a href={path('/catalog')} className="inline-flex h-12 items-center justify-center rounded-full bg-[#071724] px-6 text-sm font-semibold text-white">
          {t('browseProducts')}
        </a>
        <a href={path('/research')} className="inline-flex h-12 items-center justify-center rounded-full border border-slate-900/10 bg-white px-6 text-sm font-semibold text-[#071724]">
          {t('researchLibrary')}
        </a>
        <a href={path('/')} className="inline-flex h-12 items-center justify-center rounded-full border border-slate-900/10 bg-white px-6 text-sm font-semibold text-[#071724]">
          {t('returnHome')}
        </a>
        <a
          href="https://wa.me/19153595448"
          target="_blank"
          rel="noopener noreferrer"
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
