import { AlertTriangle, FlaskConical } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from '../../../i18n/LocaleContext'
import { calculateStockConcentration, calculateWorkingDilution } from '../../../lib/portal/labCalculators'
import { Card, FieldLabel, SectionIntro } from './shared'

export function CalculatorsSection() {
  const { t } = useTranslation('portal')
  return <>
    <SectionIntro title={t('calculatorsTitle')} copy={t('calculatorsIntro')} />
    <div className="mt-6 flex items-start gap-3 rounded-[1.25rem] border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
      <AlertTriangle size={19} className="mt-0.5 shrink-0" aria-hidden="true" />
      <p><strong>{t('labCalculatorBoundaryTitle')}</strong> {t('labCalculatorBoundaryCopy')}</p>
    </div>
    <div className="mt-6 grid gap-4 lg:grid-cols-2">
      <StockConcentrationCalculator />
      <WorkingDilutionCalculator />
      <BmiCalculator />
      <ChangeCalculator />
    </div>
    <p className="mt-6 text-xs leading-5 text-slate-500">{t('calculatorsDisclaimer')}</p>
  </>
}

function StockConcentrationCalculator() {
  const { t } = useTranslation('portal')
  const [mass, setMass] = useState('')
  const [solvent, setSolvent] = useState('')
  const result = calculateStockConcentration(Number(mass), Number(solvent))
  return <Card className="border border-teal-900/10 bg-[linear-gradient(145deg,#edf9f6,#f8faf9)]">
    <div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-2xl bg-teal-700 text-white"><FlaskConical size={18} /></span><div><p className="text-xs font-bold uppercase tracking-[.14em] text-teal-700">{t('labCalculatorEyebrow')}</p><h2 className="text-lg font-semibold">{t('stockCalculatorTitle')}</h2></div></div>
    <p className="mt-3 text-sm leading-6 text-slate-600">{t('stockCalculatorCopy')}</p>
    <div className="mt-4 grid gap-4 sm:grid-cols-2">
      <FieldLabel label={t('stockMassLabel')}><input type="number" min="0" step="0.01" value={mass} onChange={(event) => setMass(event.target.value)} className="portal-input" /></FieldLabel>
      <FieldLabel label={t('stockSolventLabel')}><input type="number" min="0" step="0.01" value={solvent} onChange={(event) => setSolvent(event.target.value)} className="portal-input" /></FieldLabel>
    </div>
    <div className="mt-5 grid gap-3 sm:grid-cols-2">
      <Result label={t('stockConcentrationResult')} value={result ? `${formatResult(result.mgPerMl)} mg/mL` : '—'} />
      <Result label={t('stockMicroResult')} value={result ? `${formatResult(result.microgramsPerMicroliter)} µg/µL` : '—'} />
    </div>
  </Card>
}

function WorkingDilutionCalculator() {
  const { t } = useTranslation('portal')
  const [stock, setStock] = useState('')
  const [target, setTarget] = useState('')
  const [finalVolume, setFinalVolume] = useState('')
  const result = calculateWorkingDilution(Number(stock), Number(target), Number(finalVolume))
  const invalidRange = Number(target) > 0 && Number(stock) > 0 && Number(target) > Number(stock)
  return <Card className="border border-teal-900/10 bg-[linear-gradient(145deg,#edf9f6,#f8faf9)]">
    <div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-2xl bg-[#071724] text-teal-200"><FlaskConical size={18} /></span><div><p className="text-xs font-bold uppercase tracking-[.14em] text-teal-700">{t('labCalculatorEyebrow')}</p><h2 className="text-lg font-semibold">{t('dilutionCalculatorTitle')}</h2></div></div>
    <p className="mt-3 text-sm leading-6 text-slate-600">{t('dilutionCalculatorCopy')}</p>
    <div className="mt-4 grid gap-4 sm:grid-cols-3">
      <FieldLabel label={t('dilutionStockLabel')}><input type="number" min="0" step="0.01" value={stock} onChange={(event) => setStock(event.target.value)} className="portal-input" /></FieldLabel>
      <FieldLabel label={t('dilutionTargetLabel')}><input type="number" min="0" step="0.01" value={target} onChange={(event) => setTarget(event.target.value)} className="portal-input" /></FieldLabel>
      <FieldLabel label={t('dilutionFinalLabel')}><input type="number" min="0" step="0.01" value={finalVolume} onChange={(event) => setFinalVolume(event.target.value)} className="portal-input" /></FieldLabel>
    </div>
    {invalidRange ? <p role="alert" className="mt-3 text-xs font-semibold text-red-700">{t('dilutionRangeError')}</p> : null}
    <div className="mt-5 grid gap-3 sm:grid-cols-2">
      <Result label={t('dilutionStockResult')} value={result ? `${formatResult(result.stockVolumeMl)} mL` : '—'} />
      <Result label={t('dilutionSolventResult')} value={result ? `${formatResult(result.solventVolumeMl)} mL` : '—'} />
    </div>
  </Card>
}

function Result({ label, value }: { label: string; value: string }) {
  return <div className="rounded-[1.1rem] bg-white p-5"><p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p><p className="mt-2 text-2xl font-semibold">{value}</p></div>
}

function formatResult(value: number) {
  return value.toLocaleString(undefined, { maximumFractionDigits: 4 })
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
