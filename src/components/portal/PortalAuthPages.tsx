import { CheckCircle2, Eye, EyeOff, LockKeyhole, Sparkles } from 'lucide-react'
import { useState, type FormEvent, type ReactNode } from 'react'
import { useLocale, useTranslation } from '../../i18n/LocaleContext'
import { LanguageSelector } from '../LanguageSelector'
import { registerPortalAccount, requestPasswordReset, signInPortal, updatePortalPassword } from '../../lib/portal/portalAuth'
import { isSupabaseConfigured } from '../../lib/supabaseClient'

type AuthMode = 'login' | 'register' | 'forgot' | 'reset'

export function PortalAuthPage({ mode }: { mode: AuthMode }) {
  const { path } = useLocale()
  const { t } = useTranslation('portal')
  const trustPoints = [t('trustPoint1'), t('trustPoint2'), t('trustPoint3')]
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({ legalName: '', email: '', mobile: '', language: 'English', password: '', confirmPassword: '', terms: false, privacy: false, ruo: false, electronic: false })

  function update(name: keyof typeof form, value: string | boolean) { setForm((current) => ({ ...current, [name]: value })) }

  async function submit(event: FormEvent) {
    event.preventDefault(); setError(''); setSuccess('')
    if (!isSupabaseConfigured) { setError(t('errorNotConfigured')); return }
    if (mode === 'register' && step === 1) {
      if (form.password.length < 12 || form.password !== form.confirmPassword || !form.legalName || !form.mobile) { setError(t('errorRegisterStep1')); return }
      setStep(2); return
    }
    if (mode === 'register' && step === 2 && !(form.terms && form.privacy && form.ruo && form.electronic)) { setError(t('errorRegisterStep2')); return }
    setLoading(true)
    try {
      if (mode === 'login') {
        const { error: authError } = await signInPortal(form.email, form.password)
        if (authError) throw authError
        window.location.assign(path('/portal'))
      } else if (mode === 'register') {
        const { error: authError } = await registerPortalAccount({ legalName: form.legalName, email: form.email, mobile: form.mobile, preferredLanguage: form.language, password: form.password })
        if (authError) throw authError
        setStep(3)
      } else if (mode === 'forgot') {
        await requestPasswordReset(form.email)
        setSuccess(t('successForgot'))
      } else {
        if (form.password.length < 12 || form.password !== form.confirmPassword) throw new Error('invalid password')
        const { error: authError } = await updatePortalPassword(form.password)
        if (authError) throw authError
        setSuccess(t('successReset'))
      }
    } catch { setError(t('genericAuthError')) } finally { setLoading(false) }
  }

  const title = mode === 'login' ? t('titleLogin') : mode === 'register' ? t('titleRegister') : mode === 'forgot' ? t('titleForgot') : t('titleReset')
  return (
    <main id="main-content" className="min-h-[calc(100vh-7rem)] bg-[#f5f6f3] px-5 py-10 sm:px-8 lg:py-16"><div className="mx-auto mb-4 flex max-w-6xl justify-end"><LanguageSelector variant="nav" /></div>
      <div className="mx-auto grid max-w-6xl overflow-hidden rounded-[2.25rem] border border-slate-900/8 bg-white shadow-[0_35px_110px_rgba(7,23,36,.12)] lg:grid-cols-[.9fr_1.1fr]">
        <section className="relative overflow-hidden bg-[linear-gradient(145deg,#071724,#0b3a3e)] p-8 text-white sm:p-12 lg:p-14">
          <div aria-hidden="true" className="absolute -right-28 -top-20 size-80 rounded-full bg-teal-400/15 blur-3xl" />
          <a href={path('/')} className="relative text-xl font-semibold tracking-[-.03em]">encore <span className="text-teal-300">bio labs</span></a>
          <p className="relative mt-16 text-xs font-bold uppercase tracking-[.2em] text-teal-200">{t('brandTagline')}</p>
          <h1 className="relative mt-4 text-5xl font-semibold tracking-[-.06em]">{t('heroTitle')}</h1>
          <p className="relative mt-6 max-w-md text-base leading-7 text-slate-300">{t('heroBody')}</p>
          <div className="relative mt-10 grid gap-4">{trustPoints.map((point)=><div key={point} className="flex items-center gap-3 text-sm font-semibold"><CheckCircle2 size={18} className="text-teal-300" aria-hidden="true" />{point}</div>)}</div>
          <p className="relative mt-14 text-xs leading-5 text-slate-400">{t('heroDisclaimer')}</p>
        </section>

        <section className="p-7 sm:p-12 lg:p-14" aria-labelledby="auth-title">
          <div className="flex items-center gap-3"><span className="flex size-10 items-center justify-center rounded-2xl bg-teal-50 text-teal-700"><LockKeyhole size={18} /></span><p className="text-xs font-bold uppercase tracking-[.16em] text-teal-700">{t('secureAccess')}</p></div>
          <h2 id="auth-title" className="mt-6 text-4xl font-semibold tracking-[-.055em]">{title}</h2>
          {mode === 'register' ? <p className="mt-2 text-sm text-slate-500">{t('stepOf', { step })}</p> : null}
          {mode === 'register' && step === 3 ? <div className="mt-8 rounded-[1.5rem] bg-emerald-50 p-6"><Sparkles className="text-emerald-700" /><h3 className="mt-4 text-2xl font-semibold">{t('verifyEmailHeading')}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t('verifyEmailBody')}</p><a href={path('/client-login')} className="mt-6 inline-flex min-h-12 items-center rounded-full bg-[#071724] px-6 text-sm font-semibold text-white">{t('returnToSignIn')}</a></div> : (
          <form onSubmit={submit} className="mt-8 grid gap-5" noValidate>
            {mode === 'register' && step === 1 ? <>
              <Field label={t('legalNameLabel')}><input value={form.legalName} onChange={(e)=>update('legalName',e.target.value)} autoComplete="name" required className="portal-input" /></Field>
              <Field label={t('emailLabel')}><input type="email" value={form.email} onChange={(e)=>update('email',e.target.value)} autoComplete="email" required className="portal-input" /></Field>
              <Field label={t('mobileLabel')}><input value={form.mobile} onChange={(e)=>update('mobile',e.target.value)} autoComplete="tel" required className="portal-input" /></Field>
              <Field label={t('preferredLanguageLabel')}><select value={form.language} onChange={(e)=>update('language',e.target.value)} className="portal-input"><option>English</option><option>Spanish</option></select></Field>
            </> : null}
            {(mode === 'login' || mode === 'forgot') ? <Field label={t('emailLabel')}><input type="email" value={form.email} onChange={(e)=>update('email',e.target.value)} autoComplete="email" required className="portal-input" /></Field> : null}
            {(mode === 'login' || mode === 'reset' || mode === 'register' && step === 1) ? <PasswordField label={mode === 'reset' ? t('newPasswordLabel') : t('passwordLabel')} value={form.password} onChange={(value)=>update('password',value)} show={showPassword} toggle={()=>setShowPassword((v)=>!v)} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} showLabel={t('showPassword')} hideLabel={t('hidePassword')} /> : null}
            {(mode === 'reset' || mode === 'register' && step === 1) ? <PasswordField label={t('confirmPasswordLabel')} value={form.confirmPassword} onChange={(value)=>update('confirmPassword',value)} show={showPassword} toggle={()=>setShowPassword((v)=>!v)} autoComplete="new-password" showLabel={t('showPassword')} hideLabel={t('hidePassword')} /> : null}
            {mode === 'register' && step === 2 ? <div className="grid gap-3">{([['terms',t('ackTerms')],['privacy',t('ackPrivacy')],['ruo',t('ackRuo')],['electronic',t('ackElectronic')]] as const).map(([key,label])=><label key={key} className="flex min-h-12 items-start gap-3 rounded-xl border border-slate-900/8 p-3 text-sm"><input type="checkbox" checked={form[key]} onChange={(e)=>update(key,e.target.checked)} className="mt-1 size-4 accent-teal-700" />{label}</label>)}</div> : null}
            {error ? <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">{error}</p> : null}
            {success ? <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">{success}</p> : null}
            <button disabled={loading} className="min-h-13 rounded-full bg-[#071724] px-6 text-sm font-semibold text-white disabled:opacity-60">{loading ? t('pleaseWait') : mode === 'login' ? t('signIn') : mode === 'register' ? step === 1 ? t('continueButton') : t('createAccount') : mode === 'forgot' ? t('sendResetInstructions') : t('updatePassword')}</button>
            {mode === 'register' && step === 2 ? <button type="button" onClick={()=>setStep(1)} className="min-h-11 text-sm font-semibold text-slate-600">{t('back')}</button> : null}
          </form>)}
          <div className="mt-7 flex flex-wrap justify-between gap-3 text-sm">{mode === 'login' ? <><a href={path('/client-forgot-password')} className="font-semibold text-teal-800">{t('forgotPassword')}</a><a href={path('/client-register')} className="font-semibold text-teal-800">{t('createAccountLink')}</a></> : <a href={path('/client-login')} className="font-semibold text-teal-800">{t('backToSignIn')}</a>}</div>
        </section>
      </div>
    </main>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) { return <label className="grid gap-2 text-sm font-semibold text-slate-700"><span>{label}</span>{children}</label> }
function PasswordField({ label, value, onChange, show, toggle, autoComplete, showLabel, hideLabel }: { label:string; value:string; onChange:(value:string)=>void; show:boolean; toggle:()=>void; autoComplete:string; showLabel:string; hideLabel:string }) { return <Field label={label}><span className="relative"><input type={show?'text':'password'} value={value} onChange={(e)=>onChange(e.target.value)} autoComplete={autoComplete} required className="portal-input pr-12" /><button type="button" onClick={toggle} aria-label={show?hideLabel:showLabel} className="absolute right-2 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full text-slate-500">{show?<EyeOff size={18}/>:<Eye size={18}/>}</button></span></Field> }
