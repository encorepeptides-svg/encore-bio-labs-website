import { ArrowRight, Beaker, Droplets, PackageSearch, Pipette, Sparkles } from 'lucide-react'
import { useState, type Dispatch, type SetStateAction } from 'react'
import { products } from '../../data/products'
import { getLocalizedProduct } from '../../data/productTranslations'
import { useLocale, useTranslation } from '../../i18n/LocaleContext'
import { calculateAliquotPlan } from '../../lib/portal/labCalculators'
import { cn } from '../../lib/utils'

const amountPerDrawPresets = ['1', '2', '4', '6', '10']
const materialInVialPresets = ['1', '10', '15', '25', '30']
const totalDiluentVolumePresets = ['1', '2', '3', '5', '10']

type ChoiceValue = {
  value: string
  selectedPreset: string | null
  customValue: string
  error: string | null
}

type GuidedAliquotCalculatorProps = {
  productSlugs?: string[]
  defaultProductSlug?: string
  secondaryHref?: string
  className?: string
}

function createChoice(value: string, presets: string[]): ChoiceValue {
  return presets.includes(value)
    ? { value, selectedPreset: value, customValue: '', error: null }
    : { value, selectedPreset: null, customValue: value, error: null }
}

export function GuidedAliquotCalculator({
  productSlugs,
  defaultProductSlug = '',
  secondaryHref = '/portal/research-matches',
  className,
}: GuidedAliquotCalculatorProps) {
  const { t } = useTranslation('portal')
  const { locale, path } = useLocale()
  const eligibleProducts = products
    .filter((product) => (!productSlugs || productSlugs.includes(product.slug)) && product.purchaseRules.productType === 'research-vial' && product.variants.some((variant) => variant.unitType === 'mg' && variant.strength))
    .map((product) => getLocalizedProduct(product, locale))
  const initialProduct = eligibleProducts.find((product) => product.slug === defaultProductSlug) ?? eligibleProducts[0]
  const [target, setTarget] = useState<ChoiceValue>(() => createChoice('1', amountPerDrawPresets))
  const [mass, setMass] = useState<ChoiceValue>(() => createChoice('10', materialInVialPresets))
  const [diluent, setDiluent] = useState<ChoiceValue>(() => createChoice('2', totalDiluentVolumePresets))
  const [productSlug, setProductSlug] = useState(initialProduct?.slug ?? '')
  const selectedProduct = eligibleProducts.find((product) => product.slug === productSlug)
  const targetMg = Number(target.value)
  const massMg = Number(mass.value)
  const diluentMl = Number(diluent.value)
  const hasFieldError = Boolean(target.error || mass.error || diluent.error)
  const invalidTarget = isPositiveFinite(targetMg) && isPositiveFinite(massMg) && targetMg > massMg
  const result = hasFieldError || invalidTarget ? null : calculateAliquotPlan(massMg, diluentMl, targetMg)
  const drawUnits = result?.syringeUnits ?? null
  const milligramsPerUnit = result?.massMgPerUnit ?? null
  const meterMaximum = drawUnits != null ? Math.max(100, Math.ceil(drawUnits / 25) * 25) : 100
  const meterFill = drawUnits != null ? Math.max(2, Math.min(100, (drawUnits / meterMaximum) * 100)) : 0

  function chooseProduct(slug: string) {
    setProductSlug(slug)
    const product = eligibleProducts.find((entry) => entry.slug === slug)
    const firstStrength = product?.variants.find((variant) => variant.unitType === 'mg' && variant.strength)?.strength
    if (firstStrength) setMass(createChoice(String(firstStrength), materialInVialPresets))
  }

  function choosePreset(setter: Dispatch<SetStateAction<ChoiceValue>>, preset: string) {
    setter({ value: preset, selectedPreset: preset, customValue: '', error: null })
  }

  function updateCustom(setter: Dispatch<SetStateAction<ChoiceValue>>, rawValue: string) {
    if (!/^\d*(?:\.\d*)?$/.test(rawValue)) {
      setter((current) => ({ ...current, selectedPreset: null, error: t('aliquotCustomCharacters') }))
      return
    }

    const numericValue = Number(rawValue)
    setter({
      value: rawValue,
      selectedPreset: null,
      customValue: rawValue,
      error: rawValue.trim() === '' || !isPositiveFinite(numericValue) ? t('aliquotCustomInvalid') : null,
    })
  }

  return (
    <div data-testid="guided-aliquot-calculator" className={cn('overflow-hidden rounded-[1.5rem] border border-teal-900/10 bg-[radial-gradient(circle_at_85%_8%,rgba(45,212,191,.18),transparent_28%),linear-gradient(145deg,#f1fbf8,#ffffff_52%,#eef3f2)] shadow-[0_18px_50px_rgba(7,23,36,.06)]', className)}>
      <div className="border-b border-teal-900/10 p-5 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="flex max-w-2xl items-start gap-3">
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[#071724] text-teal-200"><Pipette size={22} aria-hidden="true" /></span>
            <div>
              <p className="text-xs font-bold uppercase tracking-[.14em] text-teal-700">{t('labCalculatorEyebrow')}</p>
              <h3 className="mt-1 text-2xl font-semibold tracking-[-.03em] text-[#071724]">{t('aliquotCalculatorTitle')}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{t('aliquotCalculatorCopy')}</p>
            </div>
          </div>
          {eligibleProducts.length ? (
            <label className="min-w-0 w-full text-xs font-bold uppercase tracking-[.12em] text-slate-500 sm:w-auto sm:min-w-64">
              {t('aliquotProductPreset')}
              <select className="portal-input mt-2 normal-case tracking-normal" value={productSlug} onChange={(event) => chooseProduct(event.target.value)}>
                <option value="">{t('aliquotChooseProduct')}</option>
                {eligibleProducts.map((product) => <option key={product.slug} value={product.slug}>{product.name}</option>)}
              </select>
              <span className="mt-2 block text-[.7rem] font-normal normal-case leading-5 tracking-normal text-slate-500">{t('aliquotProductPresetHelp')}</span>
            </label>
          ) : null}
        </div>
      </div>
      <div className="grid lg:grid-cols-[1.12fr_.88fr]">
        <div className="grid min-w-0 gap-6 p-5 sm:p-7">
          <ChoiceStep id="target" step="1" icon={Sparkles} label={t('aliquotStepTarget')} unit="mg" state={target} presets={amountPerDrawPresets} onPreset={(preset) => choosePreset(setTarget, preset)} onCustom={(value) => updateCustom(setTarget, value)} customLabel={t('aliquotCustomValue')} />
          <ChoiceStep id="mass" step="2" icon={Beaker} label={t('aliquotStepVial')} unit="mg" state={mass} presets={materialInVialPresets} onPreset={(preset) => choosePreset(setMass, preset)} onCustom={(value) => updateCustom(setMass, value)} customLabel={t('aliquotCustomValue')} />
          <ChoiceStep id="diluent" step="3" icon={Droplets} label={t('aliquotStepDiluent')} unit="mL" state={diluent} presets={totalDiluentVolumePresets} onPreset={(preset) => choosePreset(setDiluent, preset)} onCustom={(value) => updateCustom(setDiluent, value)} customLabel={t('aliquotCustomValue')} />
          {invalidTarget ? <p data-testid="target-range-error" role="alert" className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-800">{t('aliquotInvalid')}</p> : null}
        </div>
        <div className="bg-[#071724] p-5 text-white sm:p-7" aria-live="polite">
          <p className="text-xs font-bold uppercase tracking-[.16em] text-teal-200">{t('aliquotResultsTitle')}</p>
          <p className="mt-5 text-sm font-semibold text-slate-300">{t('aliquotTransferVolume')}</p>
          <p data-testid="aliquot-draw-units" className="mt-1 text-5xl font-semibold tracking-[-.06em]">{drawUnits != null ? formatResult(drawUnits) : '—'}<span className="ml-2 text-xl tracking-normal text-teal-200">{t('aliquotUnitsLabel')}</span></p>
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between gap-3 text-xs font-semibold text-slate-300"><span>{t('aliquotMeterLabel')}</span><span>{formatResult(meterMaximum)} {t('aliquotUnitsLabel')}</span></div>
            <div className="relative mt-3 h-7 overflow-hidden rounded-full border border-white/15 bg-white/8"><div className="absolute inset-y-0 left-0 rounded-full bg-[linear-gradient(90deg,#2dd4bf,#99f6e4)] transition-[width] duration-500" style={{ width: `${meterFill}%` }} /><div className="absolute inset-0 flex justify-evenly">{[1, 2, 3].map((mark) => <span key={mark} className="h-full w-px bg-white/15" />)}</div></div>
            <div className="mt-2 flex justify-between text-[.65rem] text-slate-400"><span>0 {t('aliquotUnitsLabel')}</span><span>{formatResult(meterMaximum / 2)} {t('aliquotUnitsLabel')}</span><span>{formatResult(meterMaximum)} {t('aliquotUnitsLabel')}</span></div>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-3 min-[420px]:grid-cols-2">
            <ResultDark label={t('aliquotConcentration')} value={result ? `${formatResult(result.concentrationMgPerMl)} mg/mL` : '—'} />
            <ResultDark label={t('aliquotCount')} value={result ? formatResult(result.aliquotsPerVial) : '—'} />
            <ResultDark label={t('aliquotMicroConcentration')} value={milligramsPerUnit != null ? t('aliquotMilligramsPerUnit', { value: formatResult(milligramsPerUnit) }) : '—'} />
            <ResultDark label={t('aliquotTotalVolume')} value={result ? `${formatResult(diluentMl)} mL` : '—'} />
          </div>
          <p className="mt-5 rounded-xl bg-white/5 p-3 text-xs leading-5 text-slate-300">{result && drawUnits != null && milligramsPerUnit != null ? t('aliquotFormula', { target: formatResult(targetMg), concentration: formatResult(milligramsPerUnit), volume: formatResult(drawUnits) }) : t('aliquotFormulaEmpty')}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {selectedProduct ? <a href={path(`/products/${selectedProduct.slug}`)} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-teal-300 px-5 text-sm font-semibold text-[#071724]">{t('aliquotProductCta', { product: selectedProduct.name })}<ArrowRight size={15} aria-hidden="true" /></a> : null}
            <a href={path(secondaryHref)} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/15 px-5 text-sm font-semibold text-white"><PackageSearch size={16} aria-hidden="true" />{t('aliquotResearchMatchesCta')}</a>
          </div>
        </div>
      </div>
    </div>
  )
}

type ChoiceStepProps = {
  id: 'target' | 'mass' | 'diluent'
  step: string
  icon: typeof Sparkles
  label: string
  unit: string
  state: ChoiceValue
  presets: string[]
  onPreset: (value: string) => void
  onCustom: (value: string) => void
  customLabel: string
}

function ChoiceStep({ id, step, icon: Icon, label, unit, state, presets, onPreset, onCustom, customLabel }: ChoiceStepProps) {
  const errorId = `${id}-custom-error`

  return (
    <fieldset data-testid={`${id}-step`} className="min-w-0">
      <legend className="flex items-center gap-3 text-sm font-semibold text-[#071724]"><span className="grid size-8 shrink-0 place-items-center rounded-xl bg-teal-50 text-teal-800"><Icon size={16} aria-hidden="true" /></span><span className="text-xs font-bold uppercase tracking-[.14em] text-teal-700">{step}</span>{label}</legend>
      <div className="mt-3 flex min-w-0 flex-wrap gap-2">
        {presets.map((preset) => (
          <button key={preset} data-testid={`${id}-preset-${preset}`} type="button" aria-pressed={state.selectedPreset === preset} onClick={() => onPreset(preset)} className={`min-h-11 rounded-full border px-4 text-sm font-semibold transition ${state.selectedPreset === preset ? 'border-[#071724] bg-[#071724] text-white shadow-md' : 'border-slate-200 bg-white text-slate-700 hover:border-teal-500'}`}>
            {Number(preset).toLocaleString()} {unit}
          </button>
        ))}
        <label className={`flex min-h-11 max-w-full items-center gap-2 rounded-full border bg-white px-3 text-xs font-semibold transition ${state.selectedPreset === null ? 'border-teal-700 ring-1 ring-teal-700/20' : 'border-slate-200'} ${state.error ? 'border-red-500 ring-1 ring-red-500/20' : ''}`}>
          <span className="shrink-0 text-slate-500">{customLabel}</span>
          <input data-testid={`${id}-custom`} type="text" inputMode="decimal" autoComplete="off" value={state.customValue} onChange={(event) => onCustom(event.target.value)} className="min-w-0 w-20 bg-transparent text-right text-sm font-semibold text-[#071724] outline-none" aria-label={`${label} (${unit})`} aria-invalid={Boolean(state.error)} aria-describedby={state.error ? errorId : undefined} />
          <span className="shrink-0 text-slate-500">{unit}</span>
        </label>
      </div>
      {state.error ? <p id={errorId} data-testid={`${id}-error`} role="alert" className="mt-2 text-sm font-semibold text-red-700">{state.error}</p> : null}
    </fieldset>
  )
}

function ResultDark({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl border border-white/10 bg-white/5 p-3"><p className="text-[.65rem] font-bold uppercase tracking-[.1em] text-slate-400">{label}</p><p className="mt-1 text-lg font-semibold text-white">{value}</p></div>
}

function isPositiveFinite(value: number) {
  return Number.isFinite(value) && value > 0
}

function formatResult(value: number) {
  return Number.isFinite(value) ? value.toLocaleString(undefined, { maximumFractionDigits: 4 }) : '—'
}
