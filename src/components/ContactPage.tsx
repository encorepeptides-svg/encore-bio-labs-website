import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { motion } from 'framer-motion'
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  Headphones,
  Instagram,
  MapPin,
  MessageCircle,
  PackageSearch,
  Send,
  ShieldCheck,
} from 'lucide-react'
import { useLocale, useTranslation } from '../i18n/LocaleContext'
import { createCRMLeadFromIntake, saveLead } from '../lib/crmStorage'
import { submitContactMessage } from '../lib/communications'
import { SUPPORT_EMAIL, supportMailto } from '../lib/email'
import { buildWhatsAppUrl, getGeneralInquiryMessage } from '../lib/whatsapp'
import { CTA } from './CTA'
import { Reveal } from './Reveal'

type InquiryType = 'product' | 'order' | 'shipping' | 'account' | 'partnership' | 'website' | 'other'
type ContactMethod = 'email' | 'phone' | 'whatsapp'

type ContactForm = {
  fullName: string
  email: string
  phone: string
  inquiryType: InquiryType | ''
  message: string
  preferredContact: ContactMethod | ''
  website: string
}

type FormErrors = Partial<Record<keyof Omit<ContactForm, 'website'>, string>>

const inquiryTypes: Array<{ value: InquiryType; key: string }> = [
  { value: 'product', key: 'inquiryProduct' },
  { value: 'order', key: 'inquiryOrder' },
  { value: 'shipping', key: 'inquiryShipping' },
  { value: 'account', key: 'inquiryAccount' },
  { value: 'partnership', key: 'inquiryPartnership' },
  { value: 'website', key: 'inquiryWebsite' },
  { value: 'other', key: 'inquiryOther' },
]

const contactMethods: Array<{ value: ContactMethod; key: string }> = [
  { value: 'email', key: 'contactEmail' },
  { value: 'phone', key: 'contactPhone' },
  { value: 'whatsapp', key: 'contactWhatsapp' },
]

const initialForm: ContactForm = {
  fullName: '',
  email: '',
  phone: '',
  inquiryType: '',
  message: '',
  preferredContact: '',
  website: '',
}

function inputClass(hasError = false) {
  return `min-h-12 w-full rounded-2xl border bg-white/85 px-4 text-sm text-[#071724] outline-none transition placeholder:text-slate-400 focus:border-teal-600/70 focus:ring-4 focus:ring-teal-100 ${hasError ? 'border-rose-400' : 'border-slate-900/10'}`
}

function validateForm(form: ContactForm, t: (key: string) => string): FormErrors {
  const errors: FormErrors = {}
  if (!form.fullName.trim()) errors.fullName = t('validationName')
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) errors.email = t('validationEmail')
  if ((form.preferredContact === 'phone' || form.preferredContact === 'whatsapp') && !form.phone.trim()) errors.phone = t('validationPhone')
  if (!form.inquiryType) errors.inquiryType = t('validationInquiry')
  if (form.message.trim().length < 20) errors.message = t('validationMessage')
  if (!form.preferredContact) errors.preferredContact = t('validationContact')
  return errors
}

function fieldError(id: string, error?: string) {
  return error ? <p id={`${id}-error`} className="text-xs font-medium text-rose-700" role="alert">{error}</p> : null
}

export function ContactPage() {
  const { path, locale } = useLocale()
  const { t } = useTranslation('contact')
  const [form, setForm] = useState<ContactForm>(initialForm)
  const [errors, setErrors] = useState<FormErrors>({})
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const formRef = useRef<HTMLFormElement>(null)
  const successRef = useRef<HTMLDivElement>(null)

  const whatsappUrl = useMemo(() => buildWhatsAppUrl(getGeneralInquiryMessage(locale)), [locale])

  useEffect(() => {
    if (status === 'success') successRef.current?.focus()
  }, [status])

  function updateField<K extends keyof ContactForm>(name: K, value: ContactForm[K]) {
    setForm((current) => ({ ...current, [name]: value }))
    if (name !== 'website') setErrors((current) => ({ ...current, [name]: undefined }))
    if (status !== 'idle') setStatus('idle')
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextErrors = validateForm(form, t)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0 || form.website.trim()) {
      const firstError = Object.keys(nextErrors)[0]
      if (firstError) formRef.current?.querySelector<HTMLElement>(`[name="${firstError}"]`)?.focus()
      return
    }

    setStatus('submitting')
    try {
      const [firstName, ...lastNameParts] = form.fullName.trim().split(/\s+/)
      const inquiryLabel = inquiryTypes.find((item) => item.value === form.inquiryType)
      const contactLabel = contactMethods.find((item) => item.value === form.preferredContact)
      const createdAt = new Date().toISOString()
      await submitContactMessage({ name: form.fullName, email: form.email, phone: form.phone, subject: inquiryLabel ? t(inquiryLabel.key) : t('inquiryOther'), message: form.message, locale, preferredContact: form.preferredContact, website: form.website })
      await saveLead(
        createCRMLeadFromIntake({
          firstName,
          lastName: lastNameParts.join(' '),
          email: form.email.trim(),
          phone: form.phone.trim(),
          city: '',
          preferredLanguage: locale === 'es' ? 'Spanish' : 'English',
          source: 'Website contact page',
          campaignSource: 'Website Intake',
          interestedProducts: [],
          primaryGoal: inquiryLabel ? t(inquiryLabel.key) : t('inquiryOther'),
          notes: `${form.message.trim()}\n\nPreferred contact: ${contactLabel ? t(contactLabel.key) : ''}`,
          intakeSubmission: {
            id: crypto.randomUUID(),
            submittedAt: createdAt,
            age: '',
            sex: '',
            weight: '',
            height: '',
            mainGoal: inquiryLabel ? t(inquiryLabel.key) : t('inquiryOther'),
            currentRoutine: '',
            sleepQuality: '',
            appetite: '',
            energy: '',
            previousProductsUsed: '',
            medicalConditions: '',
            medications: '',
            budget: '',
            deliveryCity: '',
            preferredContactMethod: contactLabel ? t(contactLabel.key) : '',
            consentToContact: true,
            researchUseAcknowledgment: true,
          },
        }),
      )
      setForm(initialForm)
      setErrors({})
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  return (
    <main id="main-content" className="bg-[#f5f5f2]">
      <section className="relative overflow-hidden px-5 pb-12 pt-8 sm:px-8 lg:pb-16 lg:pt-10">
        <div className="molecule-field" aria-hidden="true" />
        <div className="relative mx-auto max-w-[88rem]">
          <div className="mb-8 flex items-center gap-2 text-sm text-slate-500">
            <a href={path('/')} className="font-medium transition hover:text-[#071724]">{t('breadcrumbHome')}</a>
            <span aria-hidden="true">/</span>
            <span className="font-semibold text-[#071724]">{t('breadcrumbContact')}</span>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="max-w-3xl"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-700">{t('eyebrow')}</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-[-0.055em] text-[#071724] sm:text-5xl lg:text-6xl">{t('title')}</h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">{t('subtitle')}</p>
          </motion.div>
        </div>
      </section>

      <section className="px-5 pb-10 sm:px-8 lg:pb-16">
        <div className="mx-auto grid max-w-[88rem] gap-4 lg:grid-cols-3">
          {[
            { icon: PackageSearch, title: t('productGuidanceTitle'), body: t('productGuidanceBody'), cta: t('productGuidanceCta'), href: '/catalog' },
            { icon: MessageCircle, title: t('orderSupportTitle'), body: t('orderSupportBody'), cta: t('orderSupportCta'), href: whatsappUrl, external: true },
            { icon: Headphones, title: t('generalTitle'), body: t('generalBody'), cta: `${t('generalCta')} · ${SUPPORT_EMAIL}`, href: supportMailto(t('generalTitle')) },
          ].map(({ icon: Icon, title, body, cta, href, external }) => (
            <article key={title} className="flex min-h-[17rem] flex-col rounded-[1.75rem] border border-slate-900/10 bg-white/75 p-6 shadow-[0_18px_52px_rgba(7,23,36,0.06)] backdrop-blur-xl sm:p-7">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-700"><Icon size={22} aria-hidden="true" /></span>
              <h2 className="mt-6 text-xl font-semibold tracking-[-0.03em] text-[#071724]">{title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">{body}</p>
              <div className="mt-auto pt-6">
                <CTA href={href} target={external ? '_blank' : undefined} rel={external ? 'noopener noreferrer' : undefined} tone="ghost">{cta}</CTA>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="contact-form" className="scroll-mt-28 px-5 py-10 sm:px-8 lg:py-16">
        <div className="mx-auto grid max-w-[88rem] gap-6 xl:grid-cols-[1.2fr_0.8fr] xl:items-start">
          <Reveal>
            <div className="rounded-[2rem] border border-slate-900/10 bg-white/82 p-6 shadow-[0_24px_70px_rgba(7,23,36,0.08)] sm:p-8 lg:p-10">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-700">{t('formEyebrow')}</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.045em] text-[#071724] sm:text-4xl">{t('formTitle')}</h2>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600">{t('formBody')}</p>

              {status === 'success' ? (
                  <div ref={successRef} className="mt-8 rounded-2xl border border-teal-200 bg-teal-50 p-5" role="status" tabIndex={-1}>
                  <div className="flex items-start gap-3"><CheckCircle2 className="mt-0.5 shrink-0 text-teal-700" size={21} aria-hidden="true" /><div><h3 className="font-semibold text-teal-950">{t('successTitle')}</h3><p className="mt-2 text-sm leading-6 text-teal-900/80">{t('successBody')}</p></div></div>
                  <button type="button" onClick={() => setStatus('idle')} className="mt-4 text-sm font-semibold text-teal-900 underline underline-offset-4">{t('sendAnother')}</button>
                </div>
              ) : (
                <form ref={formRef} onSubmit={submit} noValidate className="mt-8 grid gap-5">
                  <div className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden"><label htmlFor="contact-website">{t('spamLabel')}</label><input id="contact-website" name="website" tabIndex={-1} autoComplete="off" value={form.website} onChange={(event) => updateField('website', event.target.value)} /></div>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <label className="grid gap-2 text-sm font-semibold text-[#071724]" htmlFor="contact-full-name">{t('fullName')} <span className="text-teal-700" aria-hidden="true">*</span><input id="contact-full-name" name="fullName" value={form.fullName} onChange={(event) => updateField('fullName', event.target.value)} autoComplete="name" className={inputClass(Boolean(errors.fullName))} aria-invalid={Boolean(errors.fullName)} aria-describedby={errors.fullName ? 'fullName-error' : undefined} />{fieldError('fullName', errors.fullName)}</label>
                    <label className="grid gap-2 text-sm font-semibold text-[#071724]" htmlFor="contact-email">{t('email')} <span className="text-teal-700" aria-hidden="true">*</span><input id="contact-email" name="email" type="email" value={form.email} onChange={(event) => updateField('email', event.target.value)} autoComplete="email" placeholder={t('emailPlaceholder')} className={inputClass(Boolean(errors.email))} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'email-error' : undefined} />{fieldError('email', errors.email)}</label>
                  </div>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <label className="grid gap-2 text-sm font-semibold text-[#071724]" htmlFor="contact-phone">{t('phone')} <span className="text-xs font-normal text-slate-500">({t('optional')})</span><input id="contact-phone" name="phone" type="tel" value={form.phone} onChange={(event) => updateField('phone', event.target.value)} autoComplete="tel" placeholder={t('phonePlaceholder')} className={inputClass(Boolean(errors.phone))} aria-invalid={Boolean(errors.phone)} aria-describedby={errors.phone ? 'phone-error' : undefined} />{fieldError('phone', errors.phone)}</label>
                    <label className="grid gap-2 text-sm font-semibold text-[#071724]" htmlFor="contact-inquiry">{t('inquiryType')} <span className="text-teal-700" aria-hidden="true">*</span><select id="contact-inquiry" name="inquiryType" value={form.inquiryType} onChange={(event) => updateField('inquiryType', event.target.value as InquiryType)} className={inputClass(Boolean(errors.inquiryType))} aria-invalid={Boolean(errors.inquiryType)} aria-describedby={errors.inquiryType ? 'inquiryType-error' : undefined}><option value="">{t('inquiryPlaceholder')}</option>{inquiryTypes.map((item) => <option key={item.value} value={item.value}>{t(item.key)}</option>)}</select>{fieldError('inquiryType', errors.inquiryType)}</label>
                  </div>
                  <label className="grid gap-2 text-sm font-semibold text-[#071724]" htmlFor="contact-message">{t('message')} <span className="text-teal-700" aria-hidden="true">*</span><textarea id="contact-message" name="message" value={form.message} onChange={(event) => updateField('message', event.target.value)} minLength={20} maxLength={2000} rows={6} placeholder={t('messagePlaceholder')} className={`${inputClass(Boolean(errors.message))} h-auto min-h-36 resize-y py-3 leading-6`} aria-invalid={Boolean(errors.message)} aria-describedby="message-hint message-error" /> <span id="message-hint" className="text-xs font-normal text-slate-500">{t('messageHint')} {form.message.length}/2000</span>{fieldError('message', errors.message)}</label>
                  <fieldset className="grid gap-3"><legend className="text-sm font-semibold text-[#071724]">{t('preferredContact')} <span className="text-teal-700" aria-hidden="true">*</span></legend><div className="grid gap-2 sm:grid-cols-3">{contactMethods.map((item) => <label key={item.value} className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-2xl border px-4 text-sm font-semibold transition has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-teal-100 ${form.preferredContact === item.value ? 'border-teal-500 bg-teal-50 text-[#071724]' : 'border-slate-900/10 bg-white/70 text-slate-600 hover:border-slate-900/20'}`}><input type="radio" name="preferredContact" value={item.value} checked={form.preferredContact === item.value} onChange={() => updateField('preferredContact', item.value)} className="accent-teal-700" />{t(item.key)}</label>)}</div>{fieldError('preferredContact', errors.preferredContact)}</fieldset>
                  {status === 'error' ? <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900" role="alert"><AlertCircle className="mt-0.5 shrink-0" size={18} aria-hidden="true" /><div><p className="font-semibold">{t('errorTitle')}</p><p className="mt-1 leading-6">{t('errorBody')}</p><div className="mt-2 flex flex-wrap gap-4"><button type="button" className="font-semibold underline underline-offset-4" onClick={() => setStatus('idle')}>{t('tryAgain')}</button><a className="font-semibold underline underline-offset-4" href={whatsappUrl} target="_blank" rel="noopener noreferrer">{t('orderSupportCta')}</a></div></div></div> : null}
                  <p className="text-xs leading-5 text-slate-500">{t('privacyNote')}</p>
                  <button type="submit" disabled={status === 'submitting'} className="inline-flex min-h-13 items-center justify-center gap-2 rounded-full bg-[#071724] px-6 text-sm font-semibold text-white shadow-[0_18px_44px_rgba(7,23,36,0.18)] transition hover:-translate-y-0.5 hover:bg-[#102a3d] disabled:cursor-wait disabled:opacity-70 focus:outline-none focus-visible:ring-4 focus-visible:ring-teal-200">{status === 'submitting' ? t('submitting') : t('submit')} {status === 'submitting' ? null : <Send size={16} aria-hidden="true" />}</button>
                </form>
              )}
            </div>
          </Reveal>

          <div className="grid gap-5">
            <Reveal>
              <aside className="rounded-[2rem] border border-slate-900/10 bg-[#071724] p-6 text-white shadow-[0_24px_70px_rgba(7,23,36,0.16)] sm:p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-200">{t('informationEyebrow')}</p>
                <h2 className="mt-3 text-2xl font-semibold tracking-[-0.035em]">{t('informationTitle')}</h2>
                <div className="mt-7 grid gap-5">
                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/7 p-4 transition hover:bg-white/10"><MessageCircle className="mt-0.5 shrink-0 text-teal-200" size={19} aria-hidden="true" /><span><span className="block font-semibold">{t('whatsapp')}</span><span className="mt-1 block text-sm leading-6 text-slate-300">{t('whatsappBody')}<br />9153595448</span></span></a>
                  <a href="https://instagram.com/encorebiolabs" target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/7 p-4 transition hover:bg-white/10"><Instagram className="mt-0.5 shrink-0 text-teal-200" size={19} aria-hidden="true" /><span><span className="block font-semibold">{t('instagram')}</span><span className="mt-1 block text-sm leading-6 text-slate-300">{t('instagramBody')}<br />@encorebiolabs</span></span></a>
                  <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/7 p-4"><MapPin className="mt-0.5 shrink-0 text-teal-200" size={19} aria-hidden="true" /><span><span className="block font-semibold">{t('serviceAreaTitle')}</span><span className="mt-1 block text-sm leading-6 text-slate-300">{t('serviceAreaBody')}</span></span></div>
                </div>
                <div className="mt-6 flex items-start gap-3 rounded-2xl border border-teal-300/20 bg-teal-300/10 p-4 text-sm leading-6 text-teal-50"><ShieldCheck className="mt-0.5 shrink-0 text-teal-200" size={18} aria-hidden="true" />{t('researchOnlyBody')}</div>
              </aside>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="px-5 py-10 sm:px-8 lg:py-16">
        <div className="mx-auto max-w-[88rem]">
          <Reveal>
            <div className="max-w-2xl"><p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-700">{t('faqEyebrow')}</p><h2 className="mt-3 text-3xl font-semibold tracking-[-0.045em] text-[#071724] sm:text-4xl">{t('faqTitle')}</h2></div>
          </Reveal>
          <div className="mt-7 grid gap-3 lg:grid-cols-2">
            {[
              [t('faqResponseQuestion'), t('faqResponseAnswer')],
              [t('faqLocalQuestion'), t('faqLocalAnswer')],
              [t('faqCompareQuestion'), t('faqCompareAnswer')],
              [t('faqOrderQuestion'), t('faqOrderAnswer')],
            ].map(([question, answer]) => <details key={question} className="group rounded-2xl border border-slate-900/10 bg-white/75 p-5 shadow-sm"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left text-base font-semibold text-[#071724]"><span>{question}</span><ChevronDown size={18} aria-hidden="true" className="shrink-0 text-teal-700 transition group-open:rotate-180" /></summary><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">{answer}</p></details>)}
          </div>
          <a href={path('/faq')} className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-teal-800 underline decoration-teal-300 underline-offset-4 transition hover:text-[#071724]">{t('viewFaq')}</a>
        </div>
      </section>
    </main>
  )
}
