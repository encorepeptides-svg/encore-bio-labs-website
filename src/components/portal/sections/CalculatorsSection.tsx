import { AlertTriangle, ArrowRight, Beaker, Droplets, PackageSearch, Pipette, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { products } from '../../../data/products'
import { getLocalizedProduct } from '../../../data/productTranslations'
import { useLocale, useTranslation } from '../../../i18n/LocaleContext'
import { calculateAliquotPlan } from '../../../lib/portal/labCalculators'
import { Card, FieldLabel, SectionIntro } from './shared'

export function CalculatorsSection() {
  const { t } = useTranslation('portal')
  return <>
    <SectionIntro title={t('calculatorsTitle')} copy={t('calculatorsIntro')} />
    <div className="mt-6 flex items-start gap-3 rounded-[1.25rem] border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
      <AlertTriangle size={19} className="mt-0.5 shrink-0" aria-hidden="true" />
      <p><strong>{t('labCalculatorBoundaryTitle')}</strong> {t('labCalculatorBoundaryCopy')}</p>
    </div>
    <GuidedAliquotCalculator />
    <div className="mt-5 grid gap-4 lg:grid-cols-2">
      <BmiCalculator />
      <ChangeCalculator />
    </div>
    <p className="mt-6 text-xs leading-5 text-slate-500">{t('calculatorsDisclaimer')}</p>
  </>
}

const aliquotPresets = ['50', '100', '250', '500', '1000', '2000']
const vialPresets = ['1', '5', '10', '15', '20', '50']
const diluentPresets = ['0.5', '1', '1.5', '2', '2.5', '3']

function GuidedAliquotCalculator() {
  const { t } = useTranslation('portal')
  const { locale, path } = useLocale()
  const [target, setTarget] = useState('250')
  const [mass, setMass] = useState('5')
  const [diluent, setDiluent] = useState('2')
  const [productSlug, setProductSlug] = useState('')
  const eligibleProducts = products
    .filter((product) => product.purchaseRules.productType === 'research-vial' && product.variants.some((variant) => variant.unitType === 'mg' && variant.strength))
    .map((product) => getLocalizedProduct(product, locale))
  const selectedProduct = eligibleProducts.find((product) => product.slug === productSlug)
  const result = calculateAliquotPlan(Number(mass), Number(diluent), Number(target))
  const invalidTarget = Number(target) > 0 && Number(mass) > 0 && Number(target) > Number(mass) * 1000
  // Show the draw amount in U-100 insulin-syringe units (1 unit = 10 µL) rather
  // than microliters, which is what this audience actually reads off a syringe.
  const drawUnits = result ? result.transferVolumeMicroliters / 10 : null
  const microgramsPerUnit = result ? result.concentrationMicrogramsPerMicroliter * 10 : null
  const meterMaximum = drawUnits != null ? Math.max(100, Math.ceil(drawUnits / 25) * 25) : 100
  const meterFill = drawUnits != null ? Math.max(2, Math.min(100, (drawUnits / meterMaximum) * 100)) : 0

  function chooseProduct(slug: string) {
    setProductSlug(slug)
    const product = eligibleProducts.find((entry) => entry.slug === slug)
    const firstStrength = product?.variants.find((variant) => variant.unitType === 'mg' && variant.strength)?.strength
    if (firstStrength) setMass(String(firstStrength))
  }

  return <Card className="mt-6 overflow-hidden border border-teal-900/10 bg-[radial-gradient(circle_at_85%_8%,rgba(45,212,191,.18),transparent_28%),linear-gradient(145deg,#f1fbf8,#ffffff_52%,#eef3f2)] p-0">
    <div className="border-b border-teal-900/10 p-5 sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-5"><div className="flex max-w-2xl items-start gap-3"><span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[#071724] text-teal-200"><Pipette size={22} /></span><div><p className="text-xs font-bold uppercase tracking-[.14em] text-teal-700">{t('labCalculatorEyebrow')}</p><h2 className="mt-1 text-2xl font-semibold tracking-[-.03em] text-[#071724]">{t('aliquotCalculatorTitle')}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t('aliquotCalculatorCopy')}</p></div></div>
        <label className="min-w-64 text-xs font-bold uppercase tracking-[.12em] text-slate-500">{t('aliquotProductPreset')}<select className="portal-input mt-2 normal-case tracking-normal" value={productSlug} onChange={(event) => chooseProduct(event.target.value)}><option value="">{t('aliquotChooseProduct')}</option>{eligibleProducts.map((product) => <option key={product.slug} value={product.slug}>{product.name}</option>)}</select><span className="mt-2 block text-[.7rem] font-normal normal-case leading-5 tracking-normal text-slate-500">{t('aliquotProductPresetHelp')}</span></label></div>
    </div>
    <div className="grid lg:grid-cols-[1.12fr_.88fr]">
      <div className="grid gap-6 p-5 sm:p-7">
        <ChoiceStep step="1" icon={Sparkles} label={t('aliquotStepTarget')} unit="µg" value={target} presets={aliquotPresets} onChange={setTarget} customLabel={t('aliquotCustomValue')} />
        <ChoiceStep step="2" icon={Beaker} label={t('aliquotStepVial')} unit="mg" value={mass} presets={vialPresets} onChange={setMass} customLabel={t('aliquotCustomValue')} />
        <ChoiceStep step="3" icon={Droplets} label={t('aliquotStepDiluent')} unit="mL" value={diluent} presets={diluentPresets} onChange={setDiluent} customLabel={t('aliquotCustomValue')} />
        {invalidTarget ? <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-800">{t('aliquotInvalid')}</p> : null}
      </div>
      <div className="bg-[#071724] p-5 text-white sm:p-7" aria-live="polite">
        <p className="text-xs font-bold uppercase tracking-[.16em] text-teal-200">{t('aliquotResultsTitle')}</p>
        <p className="mt-5 text-sm font-semibold text-slate-300">{t('aliquotTransferVolume')}</p>
        <p className="mt-1 text-5xl font-semibold tracking-[-.06em]">{drawUnits != null ? formatResult(drawUnits) : '—'}<span className="ml-2 text-xl tracking-normal text-teal-200">{t('aliquotUnitsLabel')}</span></p>
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4"><div className="flex items-center justify-between gap-3 text-xs font-semibold text-slate-300"><span>{t('aliquotMeterLabel')}</span><span>{formatResult(meterMaximum)} {t('aliquotUnitsLabel')}</span></div><div className="relative mt-3 h-7 overflow-hidden rounded-full border border-white/15 bg-white/8"><div className="absolute inset-y-0 left-0 rounded-full bg-[linear-gradient(90deg,#2dd4bf,#99f6e4)] transition-[width] duration-500" style={{ width: `${meterFill}%` }} /><div className="absolute inset-0 flex justify-evenly">{[1,2,3].map((mark) => <span key={mark} className="h-full w-px bg-white/15" />)}</div></div><div className="mt-2 flex justify-between text-[.65rem] text-slate-400"><span>0 {t('aliquotUnitsLabel')}</span><span>{formatResult(meterMaximum / 2)} {t('aliquotUnitsLabel')}</span><span>{formatResult(meterMaximum)} {t('aliquotUnitsLabel')}</span></div></div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <ResultDark label={t('aliquotConcentration')} value={result ? `${formatResult(result.concentrationMgPerMl)} mg/mL` : '—'} />
          <ResultDark label={t('aliquotCount')} value={result ? formatResult(result.aliquotsPerVial) : '—'} />
          <ResultDark label={t('aliquotMicroConcentration')} value={microgramsPerUnit != null ? t('aliquotMicrogramsPerUnit', { value: formatResult(microgramsPerUnit) }) : '—'} />
          <ResultDark label={t('aliquotTotalVolume')} value={Number(diluent) > 0 ? `${formatResult(Number(diluent))} mL` : '—'} />
        </div>
        <p className="mt-5 rounded-xl bg-white/5 p-3 text-xs leading-5 text-slate-300">{result && drawUnits != null && microgramsPerUnit != null ? t('aliquotFormula', { target: formatResult(Number(target)), concentration: formatResult(microgramsPerUnit), volume: formatResult(drawUnits) }) : t('aliquotFormulaEmpty')}</p>
        <div className="mt-5 flex flex-wrap gap-2">{selectedProduct ? <a href={path(`/products/${selectedProduct.slug}`)} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-teal-300 px-5 text-sm font-semibold text-[#071724]">{t('aliquotProductCta', { product: selectedProduct.name })}<ArrowRight size={15} /></a> : null}<a href={path('/portal/research-matches')} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/15 px-5 text-sm font-semibold text-white"><PackageSearch size={16} />{t('aliquotResearchMatchesCta')}</a></div>
      </div>
    </div>
  </Card>
}

function ChoiceStep({ step, icon: Icon, label, unit, value, presets, onChange, customLabel }: { step: string; icon: typeof Sparkles; label: string; unit: string; value: string; presets: string[]; onChange: (value: string) => void; customLabel: string }) {
  return <fieldset><legend className="flex items-center gap-3 text-sm font-semibold text-[#071724]"><span className="grid size-8 place-items-center rounded-xl bg-teal-50 text-teal-800"><Icon size={16} /></span><span className="text-xs font-bold uppercase tracking-[.14em] text-teal-700">{step}</span>{label}</legend><div className="mt-3 flex flex-wrap gap-2">{presets.map((preset) => <button key={preset} type="button" aria-pressed={value === preset} onClick={() => onChange(preset)} className={`min-h-10 rounded-full border px-4 text-sm font-semibold transition ${value === preset ? 'border-[#071724] bg-[#071724] text-white shadow-md' : 'border-slate-200 bg-white text-slate-700 hover:border-teal-500'}`}>{Number(preset).toLocaleString()} {unit}</button>)}<label className="flex min-h-10 items-center gap-2 rounded-full border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-500"><span>{customLabel}</span><input type="number" min="0" step="0.01" value={value} onChange={(event) => onChange(event.target.value)} className="w-20 bg-transparent text-right text-sm font-semibold text-[#071724] outline-none" aria-label={`${label} (${unit})`} /><span>{unit}</span></label></div></fieldset>
}

function ResultDark({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl border border-white/10 bg-white/5 p-3"><p className="text-[.65rem] font-bold uppercase tracking-[.1em] text-slate-400">{label}</p><p className="mt-1 text-lg font-semibold text-white">{value}</p></div>
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
