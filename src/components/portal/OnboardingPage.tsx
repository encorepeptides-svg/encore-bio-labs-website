import { CheckCircle2, ChevronLeft, ChevronRight, LoaderCircle } from 'lucide-react'
import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { usePortalAuth } from '../../context/usePortalAuth'
import { PORTAL_RESEARCH_INTERESTS, productsForInterestSelection } from '../../data/portalRecommendations'
import { getLocalizedProduct } from '../../data/productTranslations'
import { useLocale, useTranslation } from '../../i18n/LocaleContext'
import { loadPortalOnboardingDraft, restorePortalOnboardingForm, savePortalOnboardingDraft } from '../../lib/portal/onboardingDraft'
import {
  firstIncompleteOnboardingStep,
  isPortalOnboardingComplete,
  isPortalOnboardingStepComplete,
  type PortalOnboardingForm,
} from '../../lib/portal/onboardingValidation'
import { supabase } from '../../lib/supabaseClient'
import { ConsentChecklist, type ConsentChecklistItem } from './ConsentChecklist'
import { PortalShell } from './PortalShell'

type AgreementKey = 'terms' | 'privacy' | 'ruo' | 'noMedical' | 'electronic' | 'progressData' | 'photos'
type SaveStatus = 'idle' | 'saving' | 'saved' | 'error' | 'stale'

function initialForm(identity: ReturnType<typeof usePortalAuth>['identity'], locale: 'en' | 'es'): PortalOnboardingForm {
  return {
    legalName: identity?.profile.legal_name ?? '',
    preferredName: identity?.profile.preferred_name ?? '',
    mobile: identity?.profile.mobile ?? '',
    language: identity?.profile.preferred_language ?? (locale === 'es' ? 'Spanish' : 'English'),
    timeZone: identity?.profile.time_zone ?? Intl.DateTimeFormat().resolvedOptions().timeZone,
    dateOfBirth: '', height: '', startingWeight: '', currentWeight: '', waist: '', units: 'imperial',
    goals: [], researchInterests: [], interestedProducts: [], activity: '', exercise: '', sleep: '',
    water: '3', appetite: '3', energy: '3', stress: '3', wellness: '3',
    emailNotifications: true, portalNotifications: true, orderUpdates: true, checkinReminders: true,
    documentNotifications: true, supportNotifications: true, signature: '', terms: false, privacy: false,
    ruo: false, noMedical: false, electronic: false, progressData: false, photos: false,
  }
}

export function OnboardingPage() {
  const { identity, refresh } = usePortalAuth()
  const { path, locale } = useLocale()
  const { t } = useTranslation('portal')
  const steps = [t('stepContact'), t('stepProfile'), t('stepGoals'), t('stepResearchInterests'), t('stepLifestyle'), t('stepCommunication'), t('stepAgreements'), t('stepReview')]
  const goals = [
    { value: 'weight-management', label: t('goalWeight') }, { value: 'body-composition', label: t('goalBodyComp') },
    { value: 'recovery', label: t('goalRecovery') }, { value: 'energy', label: t('goalEnergy') },
    { value: 'wellness', label: t('goalWellness') }, { value: 'research-documentation', label: t('goalDocuments') },
  ]
  const researchInterests = PORTAL_RESEARCH_INTERESTS.map((value) => ({ value, label: t(`researchInterest${value.split('-').map((part) => `${part[0].toUpperCase()}${part.slice(1)}`).join('')}`) }))
  const productChoices = productsForInterestSelection().map((product) => getLocalizedProduct(product, locale))
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [hydrated, setHydrated] = useState(false)
  const [error, setError] = useState('')
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const [form, setForm] = useState<PortalOnboardingForm>(() => initialForm(identity, locale))
  const serverSavedAtRef = useRef<string | null>(null)

  const agreementItems = useMemo<Array<ConsentChecklistItem<AgreementKey>>>(() => [
    { key: 'terms', title: t('ackTerms'), summary: t('ackTermsSummary'), href: '/legal/terms', required: true, fullDocumentAvailable: true },
    { key: 'privacy', title: t('ackPrivacy'), summary: t('ackPrivacySummary'), href: '/legal/privacy', required: true, fullDocumentAvailable: true },
    { key: 'ruo', title: t('ackRuo'), summary: t('ackRuoSummary'), required: true, fullDocumentAvailable: false },
    { key: 'noMedical', title: t('noMedicalAck'), summary: t('noMedicalAckSummary'), required: true, fullDocumentAvailable: false },
    { key: 'electronic', title: t('electronicConsentAck'), summary: t('ackElectronicSummary'), required: true, fullDocumentAvailable: false },
    { key: 'progressData', title: t('progressDataConsent'), summary: t('progressDataConsentSummary'), required: true, fullDocumentAvailable: false },
    { key: 'photos', title: t('progressPhotoConsent'), summary: t('progressPhotoConsentSummary'), required: false, fullDocumentAvailable: false },
  ], [t])

  useEffect(() => {
    if (!identity) return
    let active = true
    setHydrated(false)
    setSaveStatus('idle')
    void (async () => {
      try {
        const [row, acceptanceResult] = await Promise.all([
          loadPortalOnboardingDraft(identity.user.id),
          supabase?.from('consent_acceptances').select('consent_versions(consent_key)').eq('user_id', identity.user.id).eq('active', true).is('withdrawn_at', null),
        ])
        if (!active) return
        const acceptedKeys = new Set((acceptanceResult?.data ?? []).map((entry) => {
          const version = entry.consent_versions as unknown as { consent_key?: string } | null
          return version?.consent_key
        }).filter(Boolean))
        const restored = restorePortalOnboardingForm(initialForm(identity, locale), row)
        const withAcceptedConsents: PortalOnboardingForm = {
          ...restored,
          terms: restored.terms || acceptedKeys.has('terms'), privacy: restored.privacy || acceptedKeys.has('privacy'),
          ruo: restored.ruo || acceptedKeys.has('research_use_only'), noMedical: restored.noMedical || acceptedKeys.has('no_medical_advice'),
          electronic: restored.electronic || acceptedKeys.has('electronic_communications'), progressData: restored.progressData || acceptedKeys.has('progress_data'),
          photos: restored.photos || acceptedKeys.has('progress_photos'),
        }
        setForm(withAcceptedConsents)
        serverSavedAtRef.current = row?.draft_saved_at ?? null
        const firstIncompleteStep = firstIncompleteOnboardingStep(withAcceptedConsents)
        const restoredStep = row?.draft_data && !row.draft_completed_at && row.draft_current_step != null
          ? Math.min(Math.max(row.draft_current_step, 0), steps.length - 1)
          : firstIncompleteStep >= 0 ? firstIncompleteStep : steps.length - 1
        setStep(restoredStep)
        setHydrated(true)
      } catch {
        if (active) {
          setError(t('onboardingLoadError'))
          setSaveStatus('error')
          setHydrated(true)
        }
      }
    })()
    return () => { active = false }
  }, [identity, locale, steps.length, t])

  useEffect(() => {
    if (!hydrated || !identity || loading) return
    const timer = window.setTimeout(() => {
      setSaveStatus('saving')
      void savePortalOnboardingDraft({ form, step, knownSavedAt: serverSavedAtRef.current })
        .then((result) => {
          if (result.status === 'stale') {
            setSaveStatus('stale')
            return
          }
          serverSavedAtRef.current = result.savedAt
          setSaveStatus(result.status === 'completed' ? 'idle' : 'saved')
        })
        .catch(() => setSaveStatus('error'))
    }, 700)
    return () => window.clearTimeout(timer)
  }, [form, hydrated, identity, loading, step])

  const update = <Key extends keyof PortalOnboardingForm>(name: Key, value: PortalOnboardingForm[Key]) => {
    setForm((current) => ({ ...current, [name]: value }))
    setError('')
  }
  const toggleArray = (name: 'goals' | 'researchInterests' | 'interestedProducts', value: string) => {
    update(name, form[name].includes(value) ? form[name].filter((entry) => entry !== value) : [...form[name], value])
  }
  const next = () => {
    if (!isPortalOnboardingStepComplete(step, form)) { setError(t('onboardingStepError')); return }
    setError('')
    setStep((value) => Math.min(value + 1, steps.length - 1))
  }

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (loading || !supabase || !identity) return
    setError('')
    const incompleteStep = firstIncompleteOnboardingStep(form)
    if (incompleteStep >= 0) {
      setStep(incompleteStep)
      setError(incompleteStep === 6 ? t('errorAcknowledgments') : t('onboardingStepError'))
      return
    }
    setLoading(true)
    try {
      const metric = form.units === 'metric'
      const heightCm = metric ? Number(form.height) : Number(form.height) * 2.54
      const kg = (value: string) => metric ? Number(value) : Number(value) * 0.453592
      const cm = (value: string) => metric ? Number(value) : Number(value) * 2.54
      const { error: profileError } = await supabase.from('profiles').update({ legal_name: form.legalName.trim(), preferred_name: form.preferredName.trim() || null, mobile: form.mobile.trim() || null, preferred_language: form.language, time_zone: form.timeZone }).eq('id', identity.user.id)
      if (profileError) throw profileError
      const { error: onboardingError } = await supabase.from('onboarding_profiles').upsert({
        user_id: identity.user.id, date_of_birth: form.dateOfBirth || null, height_cm: heightCm || null,
        starting_weight_kg: kg(form.startingWeight) || null, current_weight_kg: kg(form.currentWeight) || null,
        waist_cm: cm(form.waist) || null, preferred_units: form.units, goals: form.goals,
        research_interests: form.researchInterests, interested_products: form.interestedProducts,
        activity_level: form.activity, exercise_frequency: form.exercise, average_sleep_hours: Number(form.sleep) || null,
        water_consistency: Number(form.water), appetite_rating: Number(form.appetite), energy_rating: Number(form.energy),
        stress_rating: Number(form.stress), wellness_rating: Number(form.wellness),
        communication_preferences: { email: form.emailNotifications, portal: form.portalNotifications, orders: form.orderUpdates, checkins: form.checkinReminders, documents: form.documentNotifications, support: form.supportNotifications },
      }, { onConflict: 'user_id' })
      if (onboardingError) throw onboardingError

      const { data: versions, error: versionsError } = await supabase.from('consent_versions').select('id,consent_key').eq('active', true)
      if (versionsError) throw versionsError
      const { data: existingAcceptances, error: acceptancesError } = await supabase.from('consent_acceptances').select('consent_version_id').eq('user_id', identity.user.id).eq('active', true).is('withdrawn_at', null)
      if (acceptancesError) throw acceptancesError
      const acceptedVersionIds = new Set((existingAcceptances ?? []).map((entry) => entry.consent_version_id))
      const acceptedKeys = new Set(['terms', 'privacy', 'research_use_only', 'no_medical_advice', 'electronic_communications', 'progress_data', ...(form.photos ? ['progress_photos'] : [])])
      const records = (versions ?? [])
        .filter((entry) => acceptedKeys.has(entry.consent_key) && !acceptedVersionIds.has(entry.id))
        .map((entry) => ({ user_id: identity.user.id, consent_version_id: entry.id, signature_value: form.signature, metadata: { source: 'portal_onboarding' } }))
      if (records.length) {
        const { error: consentError } = await supabase.from('consent_acceptances').insert(records)
        if (consentError) throw consentError
      }
      const { error: submitError } = await supabase.rpc('submit_portal_onboarding')
      if (submitError) throw submitError
      await refresh()
      window.location.assign(path('/portal/security'))
    } catch {
      setError(t('errorSubmission'))
    } finally {
      setLoading(false)
    }
  }

  const unitLabel = (kind: 'height' | 'weight' | 'waist') => kind === 'weight'
    ? form.units === 'metric' ? t('unitKg') : t('unitLb')
    : form.units === 'metric' ? t('unitCm') : t('unitInches')
  const saveMessage = saveStatus === 'saving' ? t('draftSaving') : saveStatus === 'saved' ? t('draftSaved') : saveStatus === 'stale' ? t('draftStale') : saveStatus === 'error' ? t('draftSaveError') : ''

  if (!hydrated) return <PortalShell><div role="status" className="flex min-h-64 items-center justify-center gap-3 text-sm font-semibold text-slate-600"><LoaderCircle className="animate-spin" size={20} />{t('portalLoading')}</div></PortalShell>

  return (
    <PortalShell>
      <form onSubmit={submit} aria-busy={loading}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div><p className="text-xs font-bold uppercase tracking-[.18em] text-teal-700">{t('accountOnboarding')}</p><h1 className="mt-3 text-4xl font-semibold tracking-[-.055em] sm:text-5xl">{steps[step]}</h1></div>
          {saveMessage ? <p role={saveStatus === 'error' || saveStatus === 'stale' ? 'alert' : 'status'} className={`rounded-full px-3 py-1.5 text-xs font-semibold ${saveStatus === 'error' || saveStatus === 'stale' ? 'bg-amber-50 text-amber-900' : 'bg-teal-50 text-teal-800'}`}>{saveMessage}</p> : null}
        </div>
        <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-600">{t('onboardingRequiredNotice')}</p>
        <div className="mt-7 flex gap-2" aria-label={t('stepAriaLabel', { step: step + 1, total: steps.length })}>{steps.map((_, index) => <span key={index} className={`h-1.5 flex-1 rounded-full ${index <= step ? 'bg-teal-600' : 'bg-slate-200'}`} />)}</div>

        <div className="mt-9 min-h-[24rem] rounded-[1.5rem] bg-[#f8faf9] p-5 sm:p-8">
          {step === 0 ? <div className="grid gap-5 sm:grid-cols-2"><Input label={t('legalNameLabel')} value={form.legalName} onChange={(value) => update('legalName', value)} /><Input label={t('preferredNameLabel')} value={form.preferredName} onChange={(value) => update('preferredName', value)} required={false} /><Input label={t('emailLabel')} value={identity?.profile.email ?? ''} disabled /><Input label={t('mobileLabel')} value={form.mobile} onChange={(value) => update('mobile', value)} /><Select label={t('preferredLanguageLabel')} value={form.language} onChange={(value) => update('language', value)} options={[{ value: 'English', label: t('languageEnglish') }, { value: 'Spanish', label: t('languageSpanish') }]} placeholder={t('selectPlaceholder')} /><Input label={t('timeZoneLabel')} value={form.timeZone} onChange={(value) => update('timeZone', value)} /></div> : null}
          {step === 1 ? <div className="grid gap-5 sm:grid-cols-2"><Input label={t('dateOfBirthLabel')} type="date" value={form.dateOfBirth} onChange={(value) => update('dateOfBirth', value)} /><Select label={t('preferredUnitsLabel')} value={form.units} onChange={(value) => update('units', value)} options={[{ value: 'imperial', label: t('unitImperial') }, { value: 'metric', label: t('unitMetric') }]} placeholder={t('selectPlaceholder')} /><Input label={t('heightLabel', { unit: unitLabel('height') })} type="number" min="0.1" step="0.1" value={form.height} onChange={(value) => update('height', value)} /><Input label={t('startingWeightLabel', { unit: unitLabel('weight') })} helper={t('startingWeightHelp')} type="number" min="0.1" step="0.1" value={form.startingWeight} onChange={(value) => update('startingWeight', value)} /><Input label={t('currentWeightLabel', { unit: unitLabel('weight') })} type="number" min="0.1" step="0.1" value={form.currentWeight} onChange={(value) => update('currentWeight', value)} /><Input label={t('waistLabel', { unit: unitLabel('waist') })} type="number" min="0.1" step="0.1" value={form.waist} onChange={(value) => update('waist', value)} /></div> : null}
          {step === 2 ? <ChoiceButtons items={goals} selected={form.goals} onToggle={(value) => toggleArray('goals', value)} /> : null}
          {step === 3 ? <div><p className="max-w-2xl text-sm leading-6 text-slate-600">{t('researchInterestsStepCopy')}</p><h2 className="mt-6 text-lg font-semibold">{t('researchInterestCategories')}</h2><div className="mt-3"><ChoiceButtons items={researchInterests} selected={form.researchInterests} onToggle={(value) => toggleArray('researchInterests', value)} /></div><h2 className="mt-7 text-lg font-semibold">{t('researchInterestProducts')}</h2><p className="mt-1 text-xs leading-5 text-slate-500">{t('researchInterestProductsHelp')}</p><div className="mt-3 flex flex-wrap gap-2">{productChoices.map((product) => <button type="button" key={product.slug} aria-pressed={form.interestedProducts.includes(product.slug)} onClick={() => toggleArray('interestedProducts', product.slug)} className={`min-h-10 rounded-full border px-4 text-sm font-semibold outline-none focus-visible:ring-4 focus-visible:ring-teal-100 ${form.interestedProducts.includes(product.slug) ? 'border-teal-700 bg-teal-700 text-white' : 'border-slate-200 bg-white text-slate-700 hover:border-teal-500'}`}>{product.name}</button>)}</div></div> : null}
          {step === 4 ? <div className="grid gap-5 sm:grid-cols-2"><Select label={t('activityLevelLabel')} value={form.activity} onChange={(value) => update('activity', value)} options={[{ value: 'Low', label: t('activityLow') }, { value: 'Moderate', label: t('activityModerate') }, { value: 'High', label: t('activityHigh') }]} placeholder={t('selectPlaceholder')} /><Input label={t('exerciseSessionsLabel')} type="number" min="0" max="14" step="1" value={form.exercise} onChange={(value) => update('exercise', value)} /><Input label={t('averageSleepLabel')} type="number" min="0.1" max="24" step="0.1" value={form.sleep} onChange={(value) => update('sleep', value)} /><RatingSelect label={t('waterRatingLabel')} helper={t('waterRatingHelp')} value={form.water} onChange={(value) => update('water', value)} /><RatingSelect label={t('appetiteRatingLabel')} helper={t('appetiteRatingHelp')} value={form.appetite} onChange={(value) => update('appetite', value)} /><RatingSelect label={t('energyRatingLabel')} helper={t('energyRatingHelp')} value={form.energy} onChange={(value) => update('energy', value)} /><RatingSelect label={t('stressRatingLabel')} helper={t('stressRatingHelp')} value={form.stress} onChange={(value) => update('stress', value)} /><RatingSelect label={t('wellnessRatingLabel')} helper={t('wellnessRatingHelp')} value={form.wellness} onChange={(value) => update('wellness', value)} /></div> : null}
          {step === 5 ? <div className="grid gap-3 sm:grid-cols-2">{([['emailNotifications', t('emailNotificationsLabel')], ['portalNotifications', t('portalNotificationsLabel')], ['orderUpdates', t('orderUpdatesLabel')], ['checkinReminders', t('checkinRemindersLabel')], ['documentNotifications', t('documentNotificationsLabel')], ['supportNotifications', t('supportNotificationsLabel')]] as const).map(([key, label]) => <Check key={key} label={label} checked={form[key]} onChange={(value) => update(key, value)} />)}</div> : null}
          {step === 6 ? <div className="grid gap-5"><ConsentChecklist items={agreementItems} values={{ terms: form.terms, privacy: form.privacy, ruo: form.ruo, noMedical: form.noMedical, electronic: form.electronic, progressData: form.progressData, photos: form.photos }} onChange={(key, value) => update(key, value)} /><Input label={t('signatureLabel')} value={form.signature} onChange={(value) => update('signature', value)} /></div> : null}
          {step === 7 ? <div><CheckCircle2 size={36} className="text-teal-700" /><h2 className="mt-5 text-2xl font-semibold">{t('reviewSubmission')}</h2><dl className="mt-6 grid gap-3 text-sm sm:grid-cols-2"><Summary label={t('reviewName')} value={form.legalName} /><Summary label={t('reviewUnits')} value={form.units === 'metric' ? t('unitMetric') : t('unitImperial')} /><Summary label={t('reviewGoals')} value={form.goals.map((value) => goals.find((goal) => goal.value === value)?.label ?? value).join(', ') || t('reviewGoalsNone')} /><Summary label={t('reviewResearchInterests')} value={form.researchInterests.map((value) => researchInterests.find((interest) => interest.value === value)?.label ?? value).join(', ')} /><Summary label={t('reviewProductsOfInterest')} value={form.interestedProducts.map((slug) => productChoices.find((product) => product.slug === slug)?.name ?? slug).join(', ')} /><Summary label={t('reviewLanguage')} value={form.language === 'Spanish' ? t('languageSpanish') : t('languageEnglish')} /><Summary label={t('reviewNotifications')} value={form.portalNotifications ? t('reviewNotificationsEnabled') : t('reviewNotificationsDisabled')} /><Summary label={t('reviewSignature')} value={form.signature || t('reviewSignatureRequired')} /></dl><p className="mt-6 text-sm leading-6 text-slate-600">{t('reviewSubmitNote')}</p></div> : null}
        </div>

        {error ? <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-800">{error}</p> : null}
        <div className="mt-6 flex justify-between gap-3"><button type="button" disabled={step === 0 || loading} onClick={() => { setError(''); setStep((value) => Math.max(value - 1, 0)) }} className="inline-flex min-h-12 items-center gap-2 rounded-full border border-slate-200 px-5 text-sm font-semibold disabled:opacity-40"><ChevronLeft size={16} />{t('back')}</button>{step < steps.length - 1 ? <button type="button" disabled={loading} onClick={next} className="inline-flex min-h-12 items-center gap-2 rounded-full bg-[#071724] px-6 text-sm font-semibold text-white disabled:opacity-50">{t('continueButton')}<ChevronRight size={16} /></button> : <button disabled={loading || !isPortalOnboardingComplete(form)} className="min-h-12 rounded-full bg-teal-700 px-7 text-sm font-semibold text-white disabled:opacity-50">{loading ? t('submitting') : t('submitForReview')}</button>}</div>
      </form>
    </PortalShell>
  )
}

function Input({ label, helper, value, onChange, type = 'text', disabled = false, required = true, min, max, step }: { label: string; helper?: string; value: string; onChange?: (value: string) => void; type?: string; disabled?: boolean; required?: boolean; min?: string; max?: string; step?: string }) {
  return <label className="grid gap-2 text-sm font-semibold text-slate-700"><span>{label}</span>{helper ? <span className="text-xs font-normal leading-5 text-slate-500">{helper}</span> : null}<input className="portal-input outline-none focus:ring-4 focus:ring-teal-100" type={type} value={value} disabled={disabled} required={required && !disabled} min={min} max={max} step={step} onChange={(event) => onChange?.(event.target.value)} /></label>
}
type SelectOption = string | { value: string; label: string }
function Select({ label, helper, value, onChange, options, placeholder }: { label: string; helper?: string; value: string; onChange: (value: string) => void; options: SelectOption[]; placeholder: string }) {
  return <label className="grid gap-2 text-sm font-semibold text-slate-700"><span>{label}</span>{helper ? <span className="text-xs font-normal leading-5 text-slate-500">{helper}</span> : null}<select className="portal-input outline-none focus:ring-4 focus:ring-teal-100" value={value} required onChange={(event) => onChange(event.target.value)}><option value="">{placeholder}</option>{options.map((option) => { const item = typeof option === 'string' ? { value: option, label: option } : option; return <option key={item.value} value={item.value}>{item.label}</option> })}</select></label>
}
function RatingSelect({ label, helper, value, onChange }: { label: string; helper: string; value: string; onChange: (value: string) => void }) {
  return <Select label={label} helper={helper} value={value} onChange={onChange} options={['1', '2', '3', '4', '5']} placeholder="—" />
}
function ChoiceButtons({ items, selected, onToggle }: { items: Array<{ value: string; label: string }>; selected: string[]; onToggle: (value: string) => void }) {
  return <div className="grid gap-3 sm:grid-cols-2">{items.map((item) => <button type="button" key={item.value} aria-pressed={selected.includes(item.value)} onClick={() => onToggle(item.value)} className={`min-h-14 rounded-xl border p-4 text-left text-sm font-semibold outline-none focus-visible:ring-4 focus-visible:ring-teal-100 ${selected.includes(item.value) ? 'border-teal-700 bg-teal-50' : 'border-slate-200 bg-white hover:border-teal-500'}`}>{item.label}</button>)}</div>
}
function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) { return <label className="flex min-h-12 items-start gap-3 rounded-xl border border-slate-200 bg-white p-3 text-sm font-semibold"><input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="mt-1 size-4 accent-teal-700" />{label}</label> }
function Summary({ label, value }: { label: string; value: string }) { return <div className="rounded-xl bg-white p-4"><dt className="text-xs uppercase tracking-wide text-slate-500">{label}</dt><dd className="mt-1 font-semibold text-slate-800">{value}</dd></div> }
