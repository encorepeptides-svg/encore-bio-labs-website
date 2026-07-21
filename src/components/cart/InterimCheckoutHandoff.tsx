import { CheckCircle2, ClipboardCopy, Instagram, MessageCircle, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { getEnabledPaymentMethods, type InterimPaymentMethod, type InterimPaymentMethodId } from '../../config/interimCheckout'
import { useLocale, useTranslation } from '../../i18n/LocaleContext'
import type { CartItem } from '../../lib/cart'
import {
  buildHandoffMessage,
  buildInstagramDmUrl,
  buildWhatsAppHandoffUrl,
  createPendingOrder,
  type HandoffChannel,
} from '../../lib/storefront/interimCheckout'

const methodLabelKeys: Record<InterimPaymentMethodId, string> = {
  bank_transfer: 'payBankTransfer',
  paypal: 'payPaypal',
  venmo: 'payVenmo',
  cashapp: 'payCashapp',
  zelle: 'payZelle',
  apple_pay: 'payApplePay',
  cash_on_delivery: 'payCod',
}

// Same key the checkout page uses to remember contact info in this session.
const CHECKOUT_SESSION_KEY = 'encore-checkout-information-v1'
function readKnownContact() {
  try {
    const stored = JSON.parse(window.sessionStorage.getItem(CHECKOUT_SESSION_KEY) || '{}') as {
      fullName?: string
      phone?: string
      email?: string
      address?: string
      address2?: string
      city?: string
      state?: string
      zip?: string
      country?: string
      preferredContact?: string
      notes?: string
    }
    return {
      name: stored.fullName || '',
      phone: stored.phone || '',
      email: stored.email || '',
      address: stored.address || '',
      address2: stored.address2 || '',
      city: stored.city || '',
      state: stored.state || '',
      zip: stored.zip || '',
      country: stored.country || '',
      preferredContact: stored.preferredContact || '',
      notes: stored.notes || '',
    }
  } catch {
    return { name: '', phone: '', email: '', address: '', address2: '', city: '', state: '', zip: '', country: '', preferredContact: '', notes: '' }
  }
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    try {
      const area = document.createElement('textarea')
      area.value = text
      area.setAttribute('readonly', '')
      area.style.position = 'fixed'
      area.style.opacity = '0'
      document.body.appendChild(area)
      area.select()
      const copied = document.execCommand('copy')
      area.remove()
      return copied
    } catch {
      return false
    }
  }
}

type HandoffState =
  | { step: 'choose'; channel: HandoffChannel }
  | { step: 'done'; channel: HandoffChannel; reference: string; message: string; method: InterimPaymentMethod; recorded: boolean; copied: boolean }

export function InterimCheckoutHandoff({ items }: { items: CartItem[] }) {
  const { t } = useTranslation('cart')
  const { locale } = useLocale()
  const [state, setState] = useState<HandoffState | null>(null)
  const [method, setMethod] = useState<InterimPaymentMethodId | ''>('')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState(false)
  const enabledMethods = useMemo(() => getEnabledPaymentMethods(), [])

  if (!items.length || !enabledMethods.length) return null

  function open(channel: HandoffChannel) {
    setError(false)
    setMethod(enabledMethods.length === 1 ? enabledMethods[0].id : '')
    setState({ step: 'choose', channel })
  }

  function close() {
    setState(null)
    setCreating(false)
  }

  async function confirm() {
    if (!state || state.step !== 'choose' || !method || creating) return
    const chosenMethod = enabledMethods.find((entry) => entry.id === method)
    if (!chosenMethod) return
    setError(false)
    setCreating(true)
    const contact = readKnownContact()
    // Pre-open the tab inside the click gesture so popup blockers allow it.
    const handoffWindow = window.open('', '_blank', 'noopener')
    try {
      const order = await createPendingOrder({
        items,
        channel: state.channel,
        paymentMethod: chosenMethod.id,
        locale,
        contact,
      })
      const message = buildHandoffMessage({ reference: order.reference, items, paymentMethod: chosenMethod.id, locale, contact })
      let copied = false
      if (state.channel === 'instagram') copied = await copyText(message)
      const url = state.channel === 'whatsapp' ? buildWhatsAppHandoffUrl(message) : buildInstagramDmUrl()
      if (handoffWindow) handoffWindow.location.href = url
      else window.open(url, '_blank', 'noopener')
      setState({ step: 'done', channel: state.channel, reference: order.reference, message, method: chosenMethod, recorded: order.recorded, copied })
    } catch {
      handoffWindow?.close()
      setError(true)
    } finally {
      setCreating(false)
    }
  }

  async function recopy() {
    if (!state || state.step !== 'done') return
    const copied = await copyText(state.message)
    setState({ ...state, copied })
  }

  return (
    <>
      <div className="mt-3 grid gap-2">
        <button
          type="button"
          onClick={() => open('whatsapp')}
          className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#1faa59] px-5 text-sm font-semibold text-white transition hover:bg-[#178a48]"
        >
          <MessageCircle size={16} aria-hidden="true" />
          {t('orderViaWhatsapp')}
        </button>
        <button
          type="button"
          onClick={() => open('instagram')}
          className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-slate-900/15 bg-white px-5 text-sm font-semibold text-[#071724] transition hover:border-teal-700/40 hover:bg-teal-50"
        >
          <Instagram size={16} aria-hidden="true" />
          {t('orderViaInstagram')}
        </button>
        <p className="text-xs leading-5 text-slate-500">{t('handoffHint')}</p>
      </div>

      {state ? (
        <div className="fixed inset-0 z-[80] grid place-items-center bg-[#071724]/45 px-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={t('handoffModalTitle')}>
          <div className="max-h-[88vh] w-full max-w-lg overflow-y-auto rounded-[1.75rem] bg-white p-6 shadow-[0_35px_110px_rgba(7,23,36,.3)] sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-2xl font-semibold tracking-[-0.04em] text-[#071724]">
                {state.step === 'choose' ? t('handoffModalTitle') : t('handoffOrderCreatedTitle')}
              </h2>
              <button type="button" onClick={close} aria-label={t('handoffClose')} className="grid size-11 shrink-0 place-items-center rounded-full border border-slate-200 text-slate-500 transition hover:bg-slate-50">
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            {state.step === 'choose' ? (
              <>
                <p className="mt-2 text-sm leading-6 text-slate-600">{t('handoffChoosePayment')}</p>
                <div className="mt-5 grid gap-2">
                  {enabledMethods.map((entry) => (
                    <label key={entry.id} className={`flex min-h-12 cursor-pointer items-start gap-3 rounded-2xl border p-4 text-sm font-semibold transition ${method === entry.id ? 'border-teal-700 bg-teal-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                      <input
                        type="radio"
                        name="interim-payment-method"
                        value={entry.id}
                        checked={method === entry.id}
                        onChange={() => setMethod(entry.id)}
                        className="mt-0.5 size-4 accent-teal-700"
                      />
                      <span>
                        {t(methodLabelKeys[entry.id])}
                        {entry.id === 'cash_on_delivery' ? <span className="mt-1 block text-xs font-normal leading-5 text-slate-500">{t('handoffCodNote')}</span> : null}
                      </span>
                    </label>
                  ))}
                </div>
                {state.channel === 'instagram' ? (
                  <p className="mt-4 rounded-2xl bg-slate-50 p-3 text-xs leading-5 text-slate-600">{t('handoffInstagramExplainer')}</p>
                ) : null}
                {error ? <p role="alert" className="mt-4 rounded-2xl bg-red-50 p-3 text-sm text-red-800">{t('handoffError')}</p> : null}
                <button
                  type="button"
                  disabled={!method || creating}
                  onClick={() => void confirm()}
                  className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#071724] px-5 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-45"
                >
                  {creating ? t('handoffCreating') : state.channel === 'whatsapp' ? t('handoffContinueWhatsapp') : t('handoffContinueInstagram')}
                </button>
              </>
            ) : (
              <>
                <div className="mt-4 rounded-2xl bg-[#071724] p-5 text-white">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-200">{t('handoffReferenceLabel')}</p>
                  <p className="mt-1 text-3xl font-semibold tracking-[-0.03em]">{state.reference}</p>
                </div>

                {state.channel === 'instagram' ? (
                  <div role="status" className={`mt-4 flex items-start gap-3 rounded-2xl p-4 text-sm leading-6 ${state.copied ? 'bg-emerald-50 text-emerald-900' : 'bg-amber-50 text-amber-950'}`}>
                    {state.copied ? <CheckCircle2 size={18} className="mt-0.5 shrink-0" aria-hidden="true" /> : <ClipboardCopy size={18} className="mt-0.5 shrink-0" aria-hidden="true" />}
                    <span>{state.copied ? t('handoffInstagramCopied') : t('handoffInstagramCopyFailed')}</span>
                  </div>
                ) : null}

                <div className="mt-4 rounded-2xl border border-slate-200 p-4">
                  <h3 className="text-sm font-semibold text-[#071724]">{t('handoffInstructionsTitle', { method: t(methodLabelKeys[state.method.id]) })}</h3>
                  {state.method.details.length ? (
                    <ul className="mt-2 grid gap-1 text-sm text-slate-700">
                      {state.method.details.map((detail) => <li key={detail} className="font-mono text-[0.8rem]">{detail}</li>)}
                    </ul>
                  ) : null}
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {state.method.id === 'cash_on_delivery' ? t('handoffCodConfirmNote') : t('handoffReferenceNote', { reference: state.reference })}
                  </p>
                </div>

                {!state.recorded ? <p className="mt-3 text-xs leading-5 text-amber-800">{t('handoffNotRecordedNote')}</p> : null}

                <div className="mt-5 grid gap-2">
                  <button type="button" onClick={() => void recopy()} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-slate-900/15 bg-white px-5 text-sm font-semibold text-[#071724] transition hover:bg-slate-50">
                    <ClipboardCopy size={15} aria-hidden="true" />
                    {t('handoffCopySummary')}
                  </button>
                  <a
                    href={state.channel === 'whatsapp' ? buildWhatsAppHandoffUrl(state.message) : buildInstagramDmUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-[#071724] px-5 text-sm font-semibold text-white transition hover:bg-teal-700"
                  >
                    {state.channel === 'whatsapp' ? <MessageCircle size={15} aria-hidden="true" /> : <Instagram size={15} aria-hidden="true" />}
                    {state.channel === 'whatsapp' ? t('handoffReopenWhatsapp') : t('handoffReopenInstagram')}
                  </a>
                  <button type="button" onClick={close} className="min-h-11 text-sm font-semibold text-slate-500 transition hover:text-[#071724]">{t('handoffClose')}</button>
                </div>
              </>
            )}
          </div>
        </div>
      ) : null}
    </>
  )
}
