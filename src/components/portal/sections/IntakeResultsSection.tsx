import { ClipboardCheck } from 'lucide-react'
import { products } from '../../../data/products'
import { getLocalizedProduct } from '../../../data/productTranslations'
import { useLocale, useTranslation } from '../../../i18n/LocaleContext'
import { usePortalAuth } from '../../../context/usePortalAuth'
import { fetchMyIntake } from '../../../lib/portal/portalData'
import { Badge, Card, EmptyCard, LoadState, SectionIntro, statusTone, useAsync, useDateFormatter } from './shared'

export function IntakeResultsSection() {
  const { t } = useTranslation('portal')
  const { t: tIntake } = useTranslation('intake')
  const { path, locale } = useLocale()
  const { identity } = usePortalAuth()
  const formatDate = useDateFormatter()
  const { data, loading, error, reload } = useAsync(() => identity ? fetchMyIntake(identity.user.id) : Promise.resolve(null), [identity?.user.id])
  const decisionKey = data ? ({ pending: 'intakeDecisionPending', approved: 'intakeDecisionApproved', rejected: 'intakeDecisionRejected', corrections_requested: 'intakeDecisionCorrections' } as const)[data.decision] : null
  const metric = data?.preferred_units === 'metric'
  const weight = (kg: number | null) => kg == null ? '—' : metric ? `${kg.toFixed(1)} kg` : `${(kg / 0.453592).toFixed(1)} lb`
  const length = (cm: number | null) => cm == null ? '—' : metric ? `${cm.toFixed(1)} cm` : `${(cm / 2.54).toFixed(1)} in`
  const selectedProducts = (data?.interested_products ?? []).map((slug) => products.find((product) => product.slug === slug)).filter(Boolean).map((product) => getLocalizedProduct(product!, locale))
  const goalLabel = (goal: string) => ({ 'weight-management': t('goalWeight'), 'body-composition': t('goalBodyComp'), recovery: t('goalRecovery'), energy: t('goalEnergy'), wellness: t('goalWellness'), 'research-documentation': t('goalDocuments') } as Record<string, string>)[goal] ?? goal
  const intakeAnswerKeys: Record<string, string> = { 'Best product fit': 'priorityProductFit', 'Simple next steps': 'prioritySimpleSteps', 'Clear pricing': 'priorityClearPricing', 'Fast turnaround': 'priorityFastTurnaround', 'Personal support': 'priorityPersonalSupport', 'Compare options': 'priorityCompareOptions', 'Recommend a starting point': 'helpStartingPoint', 'Compare a few options': 'helpCompareOptions', 'Confirm a product I have in mind': 'helpConfirmProduct', 'Answer questions first': 'helpAnswerQuestions', 'Weight or body composition': 'concernWeight', Energy: 'concernEnergy', Recovery: 'concernRecovery', Sleep: 'concernSleep', 'Focus or performance': 'concernFocus', 'Healthy aging': 'concernHealthyAging', 'General wellness': 'concernGeneralWellness' }
  const answerLabel = (value: string) => intakeAnswerKeys[value] ? tIntake(intakeAnswerKeys[value]) : value
  const publicAnswers = data?.public_intake_answers
  const helpNeeded = Array.isArray(publicAnswers?.helpNeeded) ? publicAnswers.helpNeeded : typeof publicAnswers?.helpNeeded === 'string' ? [publicAnswers.helpNeeded] : []
  return <>
    <SectionIntro title={t('intakeTitle')} copy={t('intakeIntro')} />
    <LoadState loading={loading} error={error} onRetry={reload}>
      {data ? <>
        <Card className="mt-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3"><span className="flex size-10 items-center justify-center rounded-2xl bg-teal-50 text-teal-700"><ClipboardCheck size={18} /></span><div><p className="font-semibold">{t('intakeSubmissionLabel')}</p><p className="text-sm text-slate-500">{data.submitted_at ? t('intakeSubmittedOn', { date: formatDate(data.submitted_at) }) : t('intakeNotSubmitted')}</p></div></div>
            {decisionKey ? <Badge tone={statusTone(data.decision === 'corrections_requested' ? 'pending' : data.decision)}>{t(decisionKey)}</Badge> : null}
          </div>
          {data.decision === 'corrections_requested' ? <p className="mt-4 rounded-xl bg-amber-50 p-4 text-sm leading-6 text-amber-950">{t('intakeCorrectionsNote')} <a href={path('/portal/intake')} className="font-semibold underline">{t('intakeCorrectionsAction')}</a></p> : null}
        </Card>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Metric label={t('intakeStartingWeight')} value={weight(data.starting_weight_kg)} />
          <Metric label={t('intakeCurrentWeight')} value={weight(data.current_weight_kg)} />
          <Metric label={t('intakeHeight')} value={length(data.height_cm)} />
          <Metric label={t('intakeWaist')} value={length(data.waist_cm)} />
          <Metric label={t('intakeActivity')} value={data.activity_level || '—'} />
          <Metric label={t('intakeSleep')} value={data.average_sleep_hours != null ? `${data.average_sleep_hours} h` : '—'} />
        </div>
        <Card className="mt-4">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{t('intakeGoals')}</p>
          {data.goals.length ? <div className="mt-3 flex flex-wrap gap-2">{data.goals.map((goal) => <Badge key={goal} tone="info">{goalLabel(goal)}</Badge>)}</div> : <p className="mt-2 text-sm text-slate-500">{t('reviewGoalsNone')}</p>}
          <p className="mt-6 text-xs font-bold uppercase tracking-wide text-slate-500">{t('intakeResearchInterests')}</p>
          {data.research_interests?.length ? <div className="mt-3 flex flex-wrap gap-2">{data.research_interests.map((interest) => <Badge key={interest} tone="neutral">{t(`researchInterest${interest.split('-').map((part) => `${part[0].toUpperCase()}${part.slice(1)}`).join('')}`)}</Badge>)}</div> : <p className="mt-2 text-sm text-slate-500">{t('intakeInterestsEmpty')}</p>}
          <p className="mt-6 text-xs font-bold uppercase tracking-wide text-slate-500">{t('intakeProductsOfInterest')}</p>
          {selectedProducts.length ? <div className="mt-3 flex flex-wrap gap-2">{selectedProducts.map((product) => <a key={product.slug} href={path(`/products/${product.slug}`)} className="rounded-full bg-[#071724] px-3 py-1 text-xs font-semibold text-white">{product.name}</a>)}</div> : <p className="mt-2 text-sm text-slate-500">{t('intakeInterestsEmpty')}</p>}
          {publicAnswers ? <div className="mt-6 grid gap-5 sm:grid-cols-3"><AnswerList title={t('intakePriorities')} answers={publicAnswers.topPriorities ?? []} label={answerLabel} /><AnswerList title={t('intakeSupportNeeded')} answers={helpNeeded} label={answerLabel} /><AnswerList title={t('intakeCurrentFocus')} answers={publicAnswers.currentConcerns ?? []} label={answerLabel} /></div> : null}
          <p className="mt-6 text-xs font-bold uppercase tracking-wide text-slate-500">{t('intakeBaselineRatings')}</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-5">{([[t('waterRatingLabel'), data.water_consistency], [t('appetiteRatingLabel'), data.appetite_rating], [t('energyRatingLabel'), data.energy_rating], [t('stressRatingLabel'), data.stress_rating], [t('wellnessRatingLabel'), data.wellness_rating]] as const).map(([label, value]) => <div key={label} className="rounded-[1.1rem] bg-white p-4 text-center"><p className="text-2xl font-semibold">{value ?? '—'}<span className="text-sm text-slate-400">/5</span></p><p className="mt-1 text-xs font-semibold text-slate-500">{label}</p></div>)}</div>
        </Card>
        <p className="mt-6 text-xs leading-5 text-slate-500">{t('intakeDisclaimer')}</p>
      </> : <EmptyCard title={t('intakeEmptyTitle')} copy={t('intakeEmptyCopy')} />}
    </LoadState>
  </>
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-[1.25rem] bg-white p-5 shadow-[0_14px_45px_rgba(7,23,36,.06)]"><p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p><p className="mt-2 text-xl font-semibold">{value}</p></div>
}

function AnswerList({ title, answers, label }: { title: string; answers: string[]; label: (value: string) => string }) {
  return <div><p className="text-xs font-bold uppercase tracking-wide text-slate-500">{title}</p><ul className="mt-2 grid gap-1.5 text-sm text-slate-700">{answers.map((answer) => <li key={answer}>• {label(answer)}</li>)}</ul></div>
}
