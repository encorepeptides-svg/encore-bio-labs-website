import { useId, useState } from 'react'
import { MessageCircle } from 'lucide-react'
import { useLocale, useTranslation } from '../../i18n/LocaleContext'
import { purchaseTypeLabel } from '../../i18n/displayLabels'
import type { CartItem } from '../../lib/cart'
import {
  buildExpressOrderUrl,
  createExpressOrderReference,
  expressAcknowledgment,
  type ExpressDestination,
} from '../../lib/storefront/expressCheckout'
import { useReferralAttribution } from '../../lib/useReferralAttribution'

/**
 * The short order path, offered from the cart.
 *
 * It asks for a name and one acknowledgment, then opens WhatsApp with the cart
 * already written out. The phone number is deliberately not a field: the
 * shopper is about to message from their own WhatsApp account, so asking for it
 * would collect something the conversation hands over for free.
 *
 * The full checkout stays one tap away for anyone who wants a verified address,
 * a quoted carrier service, and a stored order record.
 */

const destinationOptions: readonly Exclude<ExpressDestination, 'unspecified'>[] = ['us', 'mexico', 'local']

export function ExpressWhatsAppCheckout({ items }: { items: CartItem[] }) {
  const { locale, path } = useLocale()
  const { t } = useTranslation('cart')
  const { t: tCommon } = useTranslation('common')
  const referralAttribution = useReferralAttribution()
  const fieldId = useId()

  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [destination, setDestination] = useState<ExpressDestination>('unspecified')
  const [notes, setNotes] = useState('')
  const [accepted, setAccepted] = useState(false)
  const [showValidation, setShowValidation] = useState(false)

  const nameMissing = !name.trim()
  const ready = !nameMissing && accepted

  function send() {
    setShowValidation(true)
    if (!ready || !items.length) return
    const url = buildExpressOrderUrl({
      reference: createExpressOrderReference(),
      items,
      locale,
      name,
      destination,
      notes,
      referralCode: referralAttribution?.code ?? null,
      translatePurchaseType: (value) => purchaseTypeLabel(tCommon, value),
    })
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  if (!open) {
    return (
      <div className="mt-6">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#25d366] px-5 text-sm font-semibold text-[#071724] transition hover:bg-[#1eb855]"
        >
          <MessageCircle size={16} aria-hidden="true" />
          {t('expressStart')}
        </button>
        <p className="mt-2 text-center text-xs leading-5 text-slate-500">{t('expressFootnote')}</p>
      </div>
    )
  }

  const inputClass = (invalid: boolean) =>
    `min-h-11 w-full rounded-xl border bg-white px-3 text-sm text-[#071724] outline-none transition focus:ring-4 focus:ring-teal-100 ${invalid ? 'border-rose-400' : 'border-slate-900/12 focus:border-teal-600'}`

  return (
    <section className="mt-6 rounded-2xl border border-[#25d366]/40 bg-[#f6fdf8] p-4" aria-labelledby={`${fieldId}-title`}>
      <h3 id={`${fieldId}-title`} className="flex items-center gap-2 text-base font-semibold text-[#071724]">
        <MessageCircle size={16} aria-hidden="true" className="text-[#128c7e]" />
        {t('expressTitle')}
      </h3>
      <p className="mt-1.5 text-xs leading-5 text-slate-600">{t('expressBody')}</p>

      <label className="mt-4 grid gap-1.5 text-sm font-semibold text-[#071724]" htmlFor={`${fieldId}-name`}>
        {t('expressName')}
        <input
          id={`${fieldId}-name`}
          className={inputClass(showValidation && nameMissing)}
          autoComplete="name"
          value={name}
          aria-invalid={showValidation && nameMissing}
          onChange={(event) => setName(event.target.value)}
        />
        {showValidation && nameMissing ? <span className="text-xs font-medium text-rose-700">{t('expressNameError')}</span> : null}
      </label>

      <fieldset className="mt-4">
        <legend className="text-sm font-semibold text-[#071724]">
          {t('expressDestination')} <span className="font-normal text-slate-400">{t('expressOptional')}</span>
        </legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {destinationOptions.map((option) => {
            const selected = destination === option
            return (
              <button
                key={option}
                type="button"
                aria-pressed={selected}
                onClick={() => setDestination(selected ? 'unspecified' : option)}
                className={`min-h-11 rounded-full border px-3.5 text-xs font-semibold transition ${selected ? 'border-teal-700 bg-teal-50 text-teal-900' : 'border-slate-900/12 bg-white text-slate-600 hover:border-teal-500'}`}
              >
                {t(`expressDestination_${option}`)}
              </button>
            )
          })}
        </div>
      </fieldset>

      <label className="mt-4 grid gap-1.5 text-sm font-semibold text-[#071724]" htmlFor={`${fieldId}-notes`}>
        <span>{t('expressNotes')} <span className="font-normal text-slate-400">{t('expressOptional')}</span></span>
        <input
          id={`${fieldId}-notes`}
          className={inputClass(false)}
          placeholder={t('expressNotesPlaceholder')}
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
        />
      </label>

      <label className="mt-4 flex items-start gap-3 rounded-xl border border-slate-900/10 bg-white p-3 text-xs leading-5 text-slate-600">
        <input
          type="checkbox"
          checked={accepted}
          aria-invalid={showValidation && !accepted}
          onChange={(event) => setAccepted(event.target.checked)}
          className="mt-0.5 size-4 shrink-0 accent-teal-700"
        />
        <span>{expressAcknowledgment[locale]}</span>
      </label>
      {showValidation && !accepted ? <p className="mt-1.5 text-xs font-medium text-rose-700" role="alert">{t('expressAcknowledgmentError')}</p> : null}

      <button
        type="button"
        onClick={send}
        className="mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#25d366] px-5 text-sm font-semibold text-[#071724] transition hover:bg-[#1eb855]"
      >
        <MessageCircle size={16} aria-hidden="true" />
        {t('expressSubmit')}
      </button>
      <p className="mt-2 text-center text-xs leading-5 text-slate-500">{t('expressFootnote')}</p>
      <a href={path('/checkout')} className="mt-3 inline-flex min-h-11 w-full items-center justify-center text-xs font-semibold text-teal-800 transition hover:text-[#071724]">
        {t('expressFullCheckout')}
      </a>
    </section>
  )
}
