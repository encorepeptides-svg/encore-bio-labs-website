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
import { brandText } from '../../../config/brandText'
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

const steps = ['Goal', 'Biometrics', 'Lifestyle', 'Experience', 'Review']
const sexOptions = ['Female', 'Male', 'Intersex', 'Prefer not to say']
const activityOptions = ['Sedentary', 'Light', 'Moderate', 'Very active', 'Athletic']
const lifestyleOptions = ['Mostly seated', 'Mixed movement', 'Physically demanding', 'Training-focused']
const sleepOptions = ['Excellent', 'Good', 'Inconsistent', 'Poor']
const energyOptions = ['Steady', 'Afternoon dips', 'Low most days', 'Variable']
const nutritionOptions = ['Very consistent', 'Mostly consistent', 'Inconsistent', 'Needs structure']
const peptideExperienceOptions = ['No', 'Some research', 'Experienced researcher', 'Prefer to discuss']
const glpExperienceOptions = ['No', 'Yes', 'Related category research', 'Prefer to discuss']
const contactOptions = ['Email', 'SMS', 'WhatsApp']

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
  placeholder = 'Select one',
}: {
  name: keyof IntakeFormData
  value: string
  onChange: (name: keyof IntakeFormData, value: string) => void
  options: string[]
  placeholder?: string
}) {
  return (
    <select
      name={name}
      value={value}
      required
      onChange={(event) => onChange(name, event.target.value)}
      className={inputClass()}
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
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
          {option}
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
  const [formData, setFormData] = useState(defaultIntakeFormData)
  const [step, setStep] = useState(0)
  const [phase, setPhase] = useState<'form' | 'loading' | 'results'>('form')
  const [lead, setLead] = useState<CustomerLead | null>(null)
  const recommendation = useMemo(() => generateRecommendation(formData), [formData])
  const canContinue = isStepComplete(step, formData)
  const progress = Math.round(((step + 1) / steps.length) * 100)

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
              Research Match
            </p>
            <h1 className="relative mt-4 text-4xl font-semibold tracking-[-0.055em] sm:text-5xl">
              Find your research match in minutes.
            </h1>
            <p className="relative mt-5 max-w-xl text-sm leading-7 text-slate-300">
              Tell us what you're researching — metabolic pathways, regeneration models, cellular
              resilience, neurobiology, or hormonal signaling — plus a few basics about your
              research context. We'll map it to relevant categories and catalog entries.
            </p>

            <div className="relative mt-8 grid gap-3">
              {[
                'Reviewed by a real person, not auto-generated',
                'Research-use-only language throughout',
                'We do not sell your personal information',
                'No dosing guidance or protocols, ever',
              ].map((item) => (
                <div key={item} className="flex items-start gap-3 text-sm text-slate-300">
                  <CheckCircle2 size={17} aria-hidden="true" className="mt-0.5 shrink-0 text-teal-300" />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <div className="relative mt-8 rounded-2xl border border-white/10 bg-white/7 p-4 text-sm leading-6 text-slate-300">
              <div className="mb-2 flex items-center gap-2 font-semibold text-white">
                <ShieldCheck size={16} aria-hidden="true" className="text-teal-300" />
                Compliance boundary
              </div>
              Outputs are educational research summaries only. The intake does not provide use instructions, personal health direction, dosing guidance, or promised outcomes.
            </div>

            <div className="relative mt-5 rounded-2xl border border-white/10 bg-white/7 p-4 text-sm leading-6 text-slate-300">
              <div className="mb-1 flex items-center gap-2 font-semibold text-white">
                <LockKeyhole size={16} aria-hidden="true" className="text-teal-300" />
                Prefer to reach us directly?
              </div>
              WhatsApp: 9153595448. Research-use-only inquiries only.
            </div>

            <div className="relative mt-5 grid gap-2 text-sm">
              <a href="/#products" className="inline-flex items-center gap-2 font-semibold text-teal-200 transition hover:text-white">
                Browse research categories before intake
                <ArrowRight size={15} aria-hidden="true" />
              </a>
              <a href="/research" className="inline-flex items-center gap-2 font-semibold text-teal-200 transition hover:text-white">
                Read the research library
                <ArrowRight size={15} aria-hidden="true" />
              </a>
              <a href="/faq#ordering" className="inline-flex items-center gap-2 font-semibold text-teal-200 transition hover:text-white">
                Review ordering FAQs
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
                      Step {step + 1} of {steps.length}
                    </p>
                    <h2 className="mt-1 text-xl font-semibold tracking-[-0.03em] text-[#071724]">
                      {steps[step]}
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
                      eyebrow="Your data"
                      title="Your information helps us create a more relevant research match."
                      body="Your intake responses are stored securely and used only to review your research interests, product fit, and follow-up preferences. We do not sell your personal information."
                      bullets={[
                        'Secure intake submission',
                        'Used only for research-support review',
                        'Contact preference respected',
                        'Stored for lead follow-up and support',
                      ]}
                    />
                    <Field label="What are you most interested in researching?">
                      <ChoiceGrid name="mainGoal" value={formData.mainGoal} options={mainGoalOptions} onChange={updateField} />
                    </Field>
                  </div>
                ) : null}

                {step === 1 ? (
                  <div className="grid gap-5">
                    <ReviewProcessCard />
                    <div className="grid gap-4 md:grid-cols-2">
                      <Field label="Age">
                        <TextInput name="age" value={formData.age} type="number" onChange={updateField} />
                      </Field>
                      <Field label="Biological sex">
                        <SelectField name="sex" value={formData.sex} options={sexOptions} onChange={updateField} />
                      </Field>
                      <Field label="Height">
                        <TextInput name="height" value={formData.height} onChange={updateField} placeholder={'5\'10"'} />
                      </Field>
                      <Field label="Current weight">
                        <TextInput name="currentWeight" value={formData.currentWeight} type="number" onChange={updateField} />
                      </Field>
                      <Field label="Goal weight">
                        <TextInput name="goalWeight" value={formData.goalWeight} type="number" onChange={updateField} />
                      </Field>
                      <Field label="Body fat estimate if known">
                        <TextInput name="bodyFat" value={formData.bodyFat} onChange={updateField} placeholder="Unknown or percentage" />
                      </Field>
                      <Field label="Activity level">
                        <SelectField name="activityLevel" value={formData.activityLevel} options={activityOptions} onChange={updateField} />
                      </Field>
                      <Field label="Waist measurement if known">
                        <TextInput name="waist" value={formData.waist} onChange={updateField} placeholder="Unknown or inches" />
                      </Field>
                      <div className="md:col-span-2">
                        <Field label="Current compounds or study materials being reviewed">
                          <TextArea name="medicationsOrCompounds" value={formData.medicationsOrCompounds} onChange={updateField} placeholder="Enter none, unknown, or relevant details." />
                        </Field>
                      </div>
                      <div className="md:col-span-2">
                        <Field label="Any known sensitivities or concerns">
                          <TextArea name="sensitivities" value={formData.sensitivities} onChange={updateField} placeholder="Enter none, unknown, or relevant details." />
                        </Field>
                      </div>
                    </div>
                  </div>
                ) : null}

                {step === 2 ? (
                  <div className="grid gap-5">
                    <Field label="How active is your lifestyle?">
                      <ChoiceGrid name="lifestyleActivity" value={formData.lifestyleActivity} options={lifestyleOptions} onChange={updateField} />
                    </Field>
                    <div className="grid gap-4 md:grid-cols-2">
                      <Field label="How many days per week do you exercise?">
                        <TextInput name="exerciseDays" value={formData.exerciseDays} type="number" onChange={updateField} placeholder="0-7" />
                      </Field>
                      <Field label="How is your sleep quality?">
                        <SelectField name="sleepQuality" value={formData.sleepQuality} options={sleepOptions} onChange={updateField} />
                      </Field>
                      <Field label="How would you describe your energy levels?">
                        <SelectField name="energyLevels" value={formData.energyLevels} options={energyOptions} onChange={updateField} />
                      </Field>
                      <Field label="How consistent is your nutrition?">
                        <SelectField name="nutritionConsistency" value={formData.nutritionConsistency} options={nutritionOptions} onChange={updateField} />
                      </Field>
                    </div>
                    <Field label="Main obstacle right now">
                      <TextArea name="mainObstacle" value={formData.mainObstacle} onChange={updateField} />
                    </Field>
                  </div>
                ) : null}

                {step === 3 ? (
                  <div className="grid gap-5">
                    <Field label="Have you researched peptides before?">
                      <ChoiceGrid name="peptideExperience" value={formData.peptideExperience} options={peptideExperienceOptions} onChange={updateField} />
                    </Field>
                    <Field label="Have you previously reviewed GLP-1 / GIP / glucagon-based research compounds?">
                      <ChoiceGrid name="glpExperience" value={formData.glpExperience} options={glpExperienceOptions} onChange={updateField} />
                    </Field>
                    <div className="grid gap-2">
                      <p className="text-sm font-semibold text-[#071724]">Which products are you interested in?</p>
                      <ProductChoiceGrid selected={formData.interestedProducts} onToggle={toggleProduct} />
                    </div>
                    <Field label="What research question are you trying to understand?">
                      <TextArea name="desiredResearchResult" value={formData.desiredResearchResult} onChange={updateField} />
                    </Field>
                  </div>
                ) : null}

                {step === 4 ? (
                  <div className="grid gap-5">
                    <NextStepsCard />
                    <NotMedicalAdviceCard />
                    <div className="grid gap-4 md:grid-cols-2">
                      <Field label="First name">
                        <TextInput name="firstName" value={formData.firstName} onChange={updateField} autoComplete="given-name" />
                      </Field>
                      <Field label="Last name">
                        <TextInput name="lastName" value={formData.lastName} onChange={updateField} autoComplete="family-name" />
                      </Field>
                      <Field label="Email">
                        <TextInput
                          name="email"
                          value={formData.email}
                          type="email"
                          onChange={updateField}
                          autoComplete="email"
                          required={formData.preferredContactMethod === 'Email'}
                        />
                      </Field>
                      <Field label="Phone number">
                        <TextInput
                          name="phone"
                          value={formData.phone}
                          type="tel"
                          onChange={updateField}
                          autoComplete="tel"
                          required={formData.preferredContactMethod === 'SMS' || formData.preferredContactMethod === 'WhatsApp'}
                        />
                      </Field>
                      <Field label="City">
                        <TextInput name="city" value={formData.city} onChange={updateField} autoComplete="address-level2" />
                      </Field>
                      <Field label="Preferred contact method">
                        <SelectField name="preferredContactMethod" value={formData.preferredContactMethod} options={contactOptions} onChange={updateField} />
                      </Field>
                    </div>
                    <ResponseTimelineCard />
                    <ConsentChecklist data={formData} onChange={updateConsent} />
                    <div className="rounded-2xl border border-teal-700/20 bg-teal-50 p-4 text-sm leading-6 text-teal-950">
                      Form submission unlocks a public confirmation only. Any product-specific catalog match is subject to internal review and sent through your selected contact method.
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
                  Back
                </button>

                {step === steps.length - 1 ? (
                  <button
                    type="submit"
                    disabled={!canContinue}
                    className="inline-flex h-12 items-center justify-center gap-3 rounded-full bg-[#071724] px-6 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(7,23,36,0.18)] transition hover:bg-[#102a3d] disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    Submit for Review
                    <Sparkles size={16} aria-hidden="true" />
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={!canContinue}
                    onClick={() => setStep((current) => Math.min(current + 1, steps.length - 1))}
                    className="inline-flex h-12 items-center justify-center gap-3 rounded-full bg-[#071724] px-6 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(7,23,36,0.18)] transition hover:bg-[#102a3d] disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    Continue
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
  return (
    <div className="grid min-h-[36rem] place-items-center text-center">
      <div className="max-w-xl">
        <div className="mx-auto flex size-16 items-center justify-center rounded-3xl bg-[#071724] text-white shadow-[0_18px_48px_rgba(7,23,36,0.2)]">
          <LoaderCircle size={26} aria-hidden="true" className="animate-spin text-teal-300" />
        </div>
        <h2 className="mt-7 text-3xl font-semibold tracking-[-0.045em] text-[#071724]">
          Finding your research match...
        </h2>
        <div className="mt-6 grid gap-3 text-sm font-semibold text-slate-600">
          <p>Matching your answers with Encore Bio Labs research categories...</p>
          <p>Preparing a personalized research summary...</p>
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
  const steps = [
    'You complete the intake',
    'AI organizes your research match',
    'Encore Bio Labs reviews and follows up privately',
  ]

  return (
    <div className="rounded-[1.5rem] border border-slate-900/10 bg-white/82 p-5 shadow-[0_18px_50px_rgba(7,23,36,0.06)]">
      <div className="flex items-start gap-4">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
          <ClipboardCheck size={18} aria-hidden="true" />
        </span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">Review process</p>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            After submission, your intake is reviewed internally by the Encore Bio Labs support team. The profile system helps organize your research interests and catalog matches, but product-specific follow-up is reviewed before it is sent.
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
  return (
    <TrustCard
      icon={<FileCheck2 size={18} aria-hidden="true" />}
      eyebrow="Next steps"
      title="Your profile moves into internal review after submission."
      body="After you submit, we will review your profile and send any product-specific catalog match through your preferred contact method: email, SMS, or WhatsApp. Public results on the website will only show product categories and general research information."
      bullets={[
        'Intake submitted instantly',
        'Internal review begins after submission',
        'Follow-up sent after review',
        'Complex profiles may require additional questions',
      ]}
    />
  )
}

function NotMedicalAdviceCard() {
  return (
    <div className="rounded-[1.5rem] border border-slate-900/10 bg-white/82 p-5 shadow-[0_18px_50px_rgba(7,23,36,0.06)]">
      <div className="flex items-start gap-4">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[#071724] text-teal-300">
          <ShieldCheck size={18} aria-hidden="true" />
        </span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">
            {brandText.notMedicalAdviceLabel}
          </p>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            {brandText.intakeDisclaimer}
          </p>
        </div>
      </div>
    </div>
  )
}

function ResponseTimelineCard() {
  return (
    <div className="rounded-[1.5rem] border border-slate-900/10 bg-[#f5f5f2]/80 p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">Response timeline</p>
      <p className="mt-3 text-sm leading-6 text-slate-600">
        Typical follow-up timing depends on review volume and profile complexity. Most profiles are reviewed in order received. If more information is needed, our team may contact you before sending product-specific follow-up.
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
  const consentItems: Array<[keyof IntakeFormData, string]> = [
    ['consentResearchUseOnly', 'I understand Encore Bio Labs products are for research-use-only.'],
    ['consentNoMedicalAdvice', 'I understand this intake does not provide medical advice, diagnosis, treatment, prescriptions, dosing guidance, or use instructions.'],
    ['consentAccuracy', 'I confirm the information I provided is accurate to the best of my knowledge.'],
    ['consentContact', 'I agree to be contacted through my selected method: email, SMS, or WhatsApp.'],
    ['consentInternalReview', 'I understand any product-specific follow-up is subject to internal review.'],
  ]

  return (
    <div className="grid gap-3 rounded-[1.5rem] border border-slate-900/10 bg-white/82 p-5">
      <p className="text-sm font-semibold text-[#071724]">Eligibility & safety review</p>
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
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">Pending review</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-[-0.035em] text-[#071724]">
              Your research match has been submitted.
            </h2>
          </div>
        </div>
        <p className="mt-4 text-sm leading-6 text-slate-600">
          Thank you. Your intake has been received and will be reviewed by the Encore Bio Labs team. Your public results page may show general product categories, but any product-specific catalog match will only be sent after review through your selected contact method.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <SummaryTile label="Selected contact method" value={lead.preferredContactMethod} />
        <SummaryTile label="Main research category" value={lead.recommendationSummary.primaryCategory} />
        <SummaryTile label="Status" value="Pending Review" />
      </div>

      <div className="rounded-[1.5rem] border border-slate-900/10 bg-white/82 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-700">Matched research categories</p>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {categories.map((category) => (
            <a
              key={category}
              href={`/categories/${categorySlugs[category] ?? ''}`}
              className="rounded-2xl border border-slate-900/10 bg-[#f5f5f2]/70 p-4 text-sm font-semibold text-[#071724] transition hover:-translate-y-0.5 hover:border-teal-500/50 hover:bg-white"
            >
              {category}
              <span className="mt-2 block text-xs font-semibold text-teal-700">View category page</span>
            </a>
          ))}
        </div>
      </div>

      <div className="rounded-[1.5rem] border border-slate-900/10 bg-white/82 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-700">Next steps</p>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          After submission, internal review begins and follow-up is sent after review through your selected contact method. Complex profiles may require additional questions before product-specific follow-up is sent.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {lead.recommendedProducts.map((product) => (
          <a
            key={product.slug}
            href={`/products/${product.slug}`}
            className="rounded-2xl border border-slate-900/10 bg-white/82 p-4 transition hover:-translate-y-0.5 hover:border-teal-500/50 hover:shadow-[0_18px_44px_rgba(7,23,36,0.09)]"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-700">{product.category}</p>
            <h3 className="mt-2 text-lg font-semibold tracking-[-0.03em] text-[#071724]">{product.name}</h3>
            <p className="mt-3 text-sm font-semibold text-slate-500">View product page</p>
          </a>
        ))}
      </div>

      <div className="rounded-[1.5rem] border border-slate-900/10 bg-[#071724] p-5 text-white">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <FlaskConical size={17} aria-hidden="true" className="text-teal-300" />
          Research-use-only explanation
        </div>
        <p className="mt-4 text-sm leading-7 text-slate-300">{lead.recommendationSummary.explanation}</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <a href="/catalog" className="inline-flex h-12 items-center justify-center rounded-full bg-[#071724] px-6 text-sm font-semibold text-white">
          Browse Products
        </a>
        <a href="/research" className="inline-flex h-12 items-center justify-center rounded-full border border-slate-900/10 bg-white px-6 text-sm font-semibold text-[#071724]">
          Research Library
        </a>
        <a href="/" className="inline-flex h-12 items-center justify-center rounded-full border border-slate-900/10 bg-white px-6 text-sm font-semibold text-[#071724]">
          Return Home
        </a>
        <a
          href="https://wa.me/19153595448"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-12 items-center justify-center rounded-full border border-slate-900/10 bg-white px-6 text-sm font-semibold text-[#071724]"
        >
          Contact Support
        </a>
      </div>
    </div>
  )
}

function SummaryTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-900/10 bg-white/82 p-4">
      <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{label}</div>
      <div className="mt-2 text-sm font-semibold leading-6 text-[#071724]">{value || 'Not selected'}</div>
    </div>
  )
}
