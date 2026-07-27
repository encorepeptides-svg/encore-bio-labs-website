import { CheckCircle2, ShieldCheck } from 'lucide-react'
import {
  acknowledgmentContent,
  acknowledgmentPolicies,
  CHECKOUT_STATEMENT_IDS,
  getCheckoutAcknowledgmentLanguage,
  isCheckoutAcknowledgmentComplete,
  type CheckoutAcknowledgmentId,
  type CheckoutAcknowledgmentState,
} from '../../data/acknowledgmentContent'
import { useLocale } from '../../i18n/LocaleContext'

type CheckoutAcknowledgmentProps = {
  value: CheckoutAcknowledgmentState
  onChange: (next: CheckoutAcknowledgmentState) => void
}

export function CheckoutAcknowledgment({
  value,
  onChange,
}: CheckoutAcknowledgmentProps) {
  const { locale, path } = useLocale()
  const copy = acknowledgmentContent[locale].checkout
  const complete = isCheckoutAcknowledgmentComplete(value)

  function update(id: CheckoutAcknowledgmentId, checked: boolean) {
    onChange({ ...value, [id]: checked })
  }

  return (
    <section
      className="rounded-[1.75rem] border border-teal-900/15 bg-[#f8fbfa] p-6 shadow-[0_24px_70px_rgba(7,23,36,0.06)] sm:p-8"
      aria-labelledby="checkout-acknowledgment-title"
    >
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-teal-700">
        <ShieldCheck size={16} aria-hidden="true" />
        {copy.eyebrow}
      </div>
      <h2 id="checkout-acknowledgment-title" className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-[#071724]">
        {copy.title}
      </h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">{copy.body}</p>

      <fieldset className="mt-5 grid gap-3" aria-describedby="checkout-acknowledgment-status">
        <legend className="sr-only">{copy.title}</legend>
        {CHECKOUT_STATEMENT_IDS.map((id) => (
          <label
            key={id}
            htmlFor={`checkout-acknowledgment-${id}`}
            className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 text-sm leading-6 transition ${
              value[id]
                ? 'border-teal-700/40 bg-white text-slate-700 shadow-sm'
                : 'border-slate-200 bg-white/80 text-slate-600 hover:border-teal-700/30'
            }`}
          >
            <input
              id={`checkout-acknowledgment-${id}`}
              type="checkbox"
              checked={value[id]}
              onChange={(event) => update(id, event.target.checked)}
              className="mt-1 size-4 shrink-0 accent-teal-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2"
            />
            <span>{copy.statements[id]}</span>
          </label>
        ))}
        <div
          className={`flex items-start gap-3 rounded-2xl border p-4 text-sm leading-6 transition ${
            value.policies
              ? 'border-teal-700/40 bg-white text-slate-700 shadow-sm'
              : 'border-slate-200 bg-white/80 text-slate-600 hover:border-teal-700/30'
          }`}
        >
          <label
            htmlFor="checkout-acknowledgment-policies"
            className="-my-2 flex min-h-11 min-w-8 shrink-0 cursor-pointer items-start justify-center pt-3"
          >
            <span className="sr-only">{getCheckoutAcknowledgmentLanguage(locale).at(-1)}</span>
            <input
              id="checkout-acknowledgment-policies"
              type="checkbox"
              checked={value.policies}
              onChange={(event) => update('policies', event.target.checked)}
              className="size-4 accent-teal-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2"
            />
          </label>
          <span>
            {copy.policyLead}{' '}
            {acknowledgmentPolicies.map((policy, index) => {
              const isLast = index === acknowledgmentPolicies.length - 1
              const separator = index === 0
                ? ''
                : isLast
                  ? locale === 'en' ? `, ${copy.policyJoiner} ` : ` ${copy.policyJoiner} `
                  : ', '
              return (
                <span key={policy.id}>
                  {separator}
                  <a
                    href={path(policy.href)}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${policy.label[locale]} — ${acknowledgmentContent[locale].entry.opensNewTab}`}
                    className="font-semibold text-teal-800 underline decoration-teal-700/35 underline-offset-2 focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
                  >
                    {policy.agreementLabel[locale]}
                  </a>
                </span>
              )
            })}
            .
          </span>
        </div>
      </fieldset>

      <p
        id="checkout-acknowledgment-status"
        role="status"
        aria-live="polite"
        className={`mt-4 flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold ${
          complete ? 'bg-teal-50 text-teal-900' : 'bg-amber-50 text-amber-900'
        }`}
      >
        {complete ? <CheckCircle2 size={15} aria-hidden="true" /> : <ShieldCheck size={15} aria-hidden="true" />}
        {complete ? copy.complete : copy.incomplete}
      </p>
    </section>
  )
}
