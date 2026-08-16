import { CheckCircle2, LoaderCircle, Tag, X } from 'lucide-react'
import { useMemo, useState, type FormEvent } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { formatCartCurrency } from '../../lib/cart'
import { calculateDistributorDiscountCents, validateDistributorCode } from '../../lib/distributorIncentive'
import {
  clearReferralAttribution,
  validateAndStoreReferralCode,
} from '../../lib/referralAttribution'
import { useReferralAttribution } from '../../lib/useReferralAttribution'

const copy = {
  en: {
    label: 'Distributor code', placeholder: 'Enter code', apply: 'Apply', applying: 'Validating…', remove: 'Remove',
    saved: 'Code accepted', potential: 'First eligible paid purchase: up to {discount} off ({rate}%, maximum {max}).', noOffer: 'Code accepted for distributor attribution. No customer discount is currently enabled.',
    invalid: 'This code is invalid, suspended, or unavailable. Your previously accepted code was not changed.',
    unavailable: 'We could not validate the code right now. Please try again.', authority: 'Eligibility and the final discount are verified by the server when the order is created.',
  },
  es: {
    label: 'Código de distribuidor', placeholder: 'Ingresa el código', apply: 'Aplicar', applying: 'Validando…', remove: 'Quitar',
    saved: 'Código aceptado', potential: 'Primera compra pagada elegible: hasta {discount} de descuento ({rate}%, máximo {max}).', noOffer: 'Código aceptado para atribución del distribuidor. Actualmente no hay un descuento habilitado para el cliente.',
    invalid: 'El código no es válido, está suspendido o no está disponible. Tu código aceptado anterior no cambió.',
    unavailable: 'No pudimos validar el código en este momento. Inténtalo de nuevo.', authority: 'El servidor verifica la elegibilidad y el descuento final al crear el pedido.',
  },
} as const

export function DistributorCodeField({ subtotalCents = 0, compact = false }: { subtotalCents?: number; compact?: boolean }) {
  const { locale } = useLocale()
  const language = locale === 'es' ? 'es' : 'en'
  const text = copy[language]
  const attribution = useReferralAttribution()
  const [code, setCode] = useState('')
  const [state, setState] = useState<'idle' | 'loading' | 'invalid' | 'unavailable'>('idle')
  const potentialDiscount = useMemo(() => attribution
    ? calculateDistributorDiscountCents(subtotalCents, attribution.customerDiscountRateBps, attribution.customerDiscountMaxCents)
    : 0, [attribution, subtotalCents])

  async function apply(event: FormEvent) {
    event.preventDefault()
    setState('loading')
    try {
      const validation = await validateDistributorCode(code, locale)
      const result = await validateAndStoreReferralCode(code, async () => validation, { source: 'manual_code' })
      if (!result.valid) {
        setState('invalid')
        return
      }
      setCode('')
      setState('idle')
    } catch {
      setState('unavailable')
    }
  }

  return (
    <section className={compact ? 'mt-5 border-t border-slate-900/10 pt-5' : 'rounded-2xl border border-teal-800/15 bg-teal-50/70 p-4'} aria-labelledby="distributor-code-label">
      <div className="flex items-center gap-2 text-sm font-semibold text-[#071724]"><Tag size={15} className="text-teal-700" aria-hidden="true" /><span id="distributor-code-label">{text.label}</span></div>
      {attribution ? (
        <div className="mt-3 rounded-xl border border-emerald-200 bg-white p-3" role="status">
          <div className="flex items-start justify-between gap-3">
            <div><p className="flex items-center gap-2 text-sm font-semibold text-emerald-800"><CheckCircle2 size={15} aria-hidden="true" />{text.saved} · <span className="font-mono">{attribution.code}</span></p><p className="mt-1 text-xs leading-5 text-slate-600">{attribution.customerDiscountRateBps > 0 ? text.potential.replace('{discount}', formatCartCurrency(potentialDiscount / 100)).replace('{rate}', (attribution.customerDiscountRateBps / 100).toFixed(attribution.customerDiscountRateBps % 100 ? 2 : 0)).replace('{max}', formatCartCurrency(attribution.customerDiscountMaxCents / 100)) : text.noOffer}</p></div>
            <button type="button" onClick={() => { clearReferralAttribution(); setState('idle') }} className="inline-flex min-h-9 shrink-0 items-center gap-1 rounded-full px-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 hover:text-rose-700"><X size={13} aria-hidden="true" />{text.remove}</button>
          </div>
        </div>
      ) : null}
      <form onSubmit={apply} className="mt-3 flex gap-2">
        <input value={code} onChange={(event) => { setCode(event.target.value); setState('idle') }} placeholder={text.placeholder} autoComplete="off" maxLength={32} aria-invalid={state === 'invalid'} className="min-w-0 flex-1 rounded-xl border border-slate-900/10 bg-white px-3 text-sm uppercase text-[#071724] outline-none focus:border-teal-700 focus:ring-4 focus:ring-teal-100" />
        <button type="submit" disabled={!code.trim() || state === 'loading'} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#071724] px-4 text-xs font-semibold text-white disabled:opacity-45">{state === 'loading' ? <LoaderCircle size={14} className="animate-spin" aria-hidden="true" /> : null}{state === 'loading' ? text.applying : text.apply}</button>
      </form>
      {state === 'invalid' ? <p className="mt-2 text-xs leading-5 text-rose-700" role="alert">{text.invalid}</p> : null}
      {state === 'unavailable' ? <p className="mt-2 text-xs leading-5 text-amber-800" role="alert">{text.unavailable}</p> : null}
      <p className="mt-2 text-[11px] leading-4 text-slate-500">{text.authority}</p>
    </section>
  )
}
