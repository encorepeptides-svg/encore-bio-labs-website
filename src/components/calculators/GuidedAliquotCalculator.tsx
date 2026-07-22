import { ArrowRight, Beaker, Droplets, PackageSearch, Pipette, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { products } from '../../data/products'
import { getLocalizedProduct } from '../../data/productTranslations'
import { useLocale, useTranslation } from '../../i18n/LocaleContext'
import { calculateAliquotPlan } from '../../lib/portal/labCalculators'
import { cn } from '../../lib/utils'

const aliquotPresets = ['50', '100', '250', '500', '1000', '2000']
const vialPresets = ['1', '5', '10', '15', '20', '50']
const diluentPresets = ['0.5', '1', '1.5', '2', '2.5', '3']

type GuidedAliquotCalculatorProps = {
  productSlugs?: string[]
  defaultProductSlug?: string
  secondaryHref?: string
  className?: string
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
  const initialStrength = initialProduct?.variants.find((variant) => variant.unitType === 'mg' && variant.strength)?.strength
  const [target, setTarget] = useState('250')
  const [mass, setMass] = useState(initialStrength ? String(initialStrength) : '5')
  const [diluent, setDiluent] = useState('2')
  const [productSlug, setProductSlug] = useState(initialProduct?.slug ?? '')
  const selectedProduct = eligibleProducts.find((product) => product.slug === productSlug)
  const result = calculateAliquotPlan(Number(mass), Number(diluent), Number(target))
  const invalidTarget = Number(target) > 0 && Number(mass) > 0 && Number(target) > Number(mass) * 1000
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

  return (
    <div className={cn('overflow-hidden rounded-[1.5rem] border border-teal-900/10 bg-[radial-gradient(circle_at_85%_8%,rgba(45,212,191,.18),transparent_28%),linear-gradient(145deg,#f1fbf8,#ffffff_52%,#eef3f2)] shadow-[0_18px_50px_rgba(7,23,36,.06)]', className)}>
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
            <label className="min-w-64 text-xs font-bold uppercase tracking-[.12em] text-slate-500">
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
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between gap-3 text-xs font-semibold text-slate-300"><span>{t('aliquotMeterLabel')}</span><span>{formatResult(meterMaximum)} {t('aliquotUnitsLabel')}</span></div>
            <div className="relative mt-3 h-7 overflow-hidden rounded-full border border-white/15 bg-white/8"><div className="absolute inset-y-0 left-0 rounded-full bg-[linear-gradient(90deg,#2dd4bf,#99f6e4)] transition-[width] duration-500" style={{ width: `${meterFill}%` }} /><div className="absolute inset-0 flex justify-evenly">{[1, 2, 3].map((mark) => <span key={mark} className="h-full w-px bg-white/15" />)}</div></div>
            <div className="mt-2 flex justify-between text-[.65rem] text-slate-400"><span>0 {t('aliquotUnitsLabel')}</span><span>{formatResult(meterMaximum / 2)} {t('aliquotUnitsLabel')}</span><span>{formatResult(meterMaximum)} {t('aliquotUnitsLabel')}</span></div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <ResultDark label={t('aliquotConcentration')} value={result ? `${formatResult(result.concentrationMgPerMl)} mg/mL` : '—'} />
            <ResultDark label={t('aliquotCount')} value={result ? formatResult(result.aliquotsPerVial) : '—'} />
            <ResultDark label={t('aliquotMicroConcentration')} value={microgramsPerUnit != null ? t('aliquotMicrogramsPerUnit', { value: formatResult(microgramsPerUnit) }) : '—'} />
            <ResultDark label={t('aliquotTotalVolume')} value={Number(diluent) > 0 ? `${formatResult(Number(diluent))} mL` : '—'} />
          </div>
          <p className="mt-5 rounded-xl bg-white/5 p-3 text-xs leading-5 text-slate-300">{result && drawUnits != null && microgramsPerUnit != null ? t('aliquotFormula', { target: formatResult(Number(target)), concentration: formatResult(microgramsPerUnit), volume: formatResult(drawUnits) }) : t('aliquotFormulaEmpty')}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {selectedProduct ? <a href={path(`/products/${selectedProduct.slug}`)} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-teal-300 px-5 text-sm font-semibold text-[#071724]">{t('aliquotProductCta', { product: selectedProduct.name })}<ArrowRight size={15} aria-hidden="true" /></a> : null}
            <a href={path(secondaryHref)} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/15 px-5 text-sm font-semibold text-white"><PackageSearch size={16} aria-hidden="true" />{t('aliquotResearchMatchesCta')}</a>
          </div>
        </div>
      </div>
    </div>
  )
}

function ChoiceStep({ step, icon: Icon, label, unit, value, presets, onChange, customLabel }: { step: string; icon: typeof Sparkles; label: string; unit: string; value: string; presets: string[]; onChange: (value: string) => void; customLabel: string }) {
  return <fieldset><legend className="flex items-center gap-3 text-sm font-semibold text-[#071724]"><span className="grid size-8 place-items-center rounded-xl bg-teal-50 text-teal-800"><Icon size={16} aria-hidden="true" /></span><span className="text-xs font-bold uppercase tracking-[.14em] text-teal-700">{step}</span>{label}</legend><div className="mt-3 flex flex-wrap gap-2">{presets.map((preset) => <button key={preset} type="button" aria-pressed={value === preset} onClick={() => onChange(preset)} className={`min-h-10 rounded-full border px-4 text-sm font-semibold transition ${value === preset ? 'border-[#071724] bg-[#071724] text-white shadow-md' : 'border-slate-200 bg-white text-slate-700 hover:border-teal-500'}`}>{Number(preset).toLocaleString()} {unit}</button>)}<label className="flex min-h-10 items-center gap-2 rounded-full border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-500"><span>{customLabel}</span><input type="number" min="0" step="0.01" value={value} onChange={(event) => onChange(event.target.value)} className="w-20 bg-transparent text-right text-sm font-semibold text-[#071724] outline-none" aria-label={`${label} (${unit})`} /><span>{unit}</span></label></div></fieldset>
}

function ResultDark({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl border border-white/10 bg-white/5 p-3"><p className="text-[.65rem] font-bold uppercase tracking-[.1em] text-slate-400">{label}</p><p className="mt-1 text-lg font-semibold text-white">{value}</p></div>
}

function formatResult(value: number) {
  return value.toLocaleString(undefined, { maximumFractionDigits: 4 })
}
