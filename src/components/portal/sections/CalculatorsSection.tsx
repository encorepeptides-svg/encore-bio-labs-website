import { AlertTriangle } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from '../../../i18n/LocaleContext'
import { GuidedAliquotCalculator } from '../../calculators/GuidedAliquotCalculator'
import { Card, FieldLabel, SectionIntro } from './shared'

export function CalculatorsSection() {
  const { t } = useTranslation('portal')
  return <>
    <SectionIntro title={t('calculatorsTitle')} copy={t('calculatorsIntro')} />
    <div className="mt-6 flex items-start gap-3 rounded-[1.25rem] border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
      <AlertTriangle size={19} className="mt-0.5 shrink-0" aria-hidden="true" />
      <p><strong>{t('labCalculatorBoundaryTitle')}</strong> {t('labCalculatorBoundaryCopy')}</p>
    </div>
    <GuidedAliquotCalculator className="mt-6" />
    <div className="mt-5 grid gap-4 lg:grid-cols-2">
      <BmiCalculator />
      <ChangeCalculator />
    </div>
    <p className="mt-6 text-xs leading-5 text-slate-500">{t('calculatorsDisclaimer')}</p>
  </>
}

function BmiCalculator() {
  const { t } = useTranslation('portal')
  const [height, setHeight] = useState('')
  const [weight, setWeight] = useState('')
  const heightIn = Number(height)
  const weightLb = Number(weight)
  const bmi = heightIn > 0 && weightLb > 0 ? (703 * weightLb) / (heightIn * heightIn) : null
  return <Card>
    <h2 className="text-lg font-semibold">{t('bmiTitle')}</h2>
    <div className="mt-4 grid gap-4 sm:grid-cols-2">
      <FieldLabel label={t('bmiHeightIn')}><input type="number" min="0" step="0.5" value={height} onChange={(e) => setHeight(e.target.value)} className="portal-input" /></FieldLabel>
      <FieldLabel label={t('progressWeightLb')}><input type="number" min="0" step="0.1" value={weight} onChange={(e) => setWeight(e.target.value)} className="portal-input" /></FieldLabel>
    </div>
    <div className="mt-5 rounded-[1.1rem] bg-white p-5"><p className="text-xs font-bold uppercase tracking-wide text-slate-500">{t('bmiResult')}</p><p className="mt-2 text-3xl font-semibold">{bmi ? bmi.toFixed(1) : '—'}</p></div>
  </Card>
}

function ChangeCalculator() {
  const { t } = useTranslation('portal')
  const [start, setStart] = useState('')
  const [current, setCurrent] = useState('')
  const startLb = Number(start)
  const currentLb = Number(current)
  const change = startLb > 0 && currentLb > 0 ? currentLb - startLb : null
  const percent = change != null && startLb > 0 ? (change / startLb) * 100 : null
  return <Card>
    <h2 className="text-lg font-semibold">{t('changeTitle')}</h2>
    <div className="mt-4 grid gap-4 sm:grid-cols-2">
      <FieldLabel label={t('intakeStartingWeight')}><input type="number" min="0" step="0.1" value={start} onChange={(e) => setStart(e.target.value)} className="portal-input" /></FieldLabel>
      <FieldLabel label={t('intakeCurrentWeight')}><input type="number" min="0" step="0.1" value={current} onChange={(e) => setCurrent(e.target.value)} className="portal-input" /></FieldLabel>
    </div>
    <div className="mt-5 grid gap-3 sm:grid-cols-2">
      <div className="rounded-[1.1rem] bg-white p-5"><p className="text-xs font-bold uppercase tracking-wide text-slate-500">{t('changeNet')}</p><p className="mt-2 text-3xl font-semibold">{change != null ? `${change > 0 ? '+' : ''}${change.toFixed(1)} lb` : '—'}</p></div>
      <div className="rounded-[1.1rem] bg-white p-5"><p className="text-xs font-bold uppercase tracking-wide text-slate-500">{t('changePercent')}</p><p className="mt-2 text-3xl font-semibold">{percent != null ? `${percent > 0 ? '+' : ''}${percent.toFixed(1)}%` : '—'}</p></div>
    </div>
  </Card>
}
