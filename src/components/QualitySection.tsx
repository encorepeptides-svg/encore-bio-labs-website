import { FileText, ShieldCheck, Snowflake, TestTube2 } from 'lucide-react'
import { useTranslation } from '../i18n/LocaleContext'
import { SectionHeader } from './SectionHeader'

export function QualitySection() {
  const { t } = useTranslation('quality')
  const { t: tBrand } = useTranslation('brand')

  const workflow = [
    {
      icon: TestTube2,
      title: t('workflowIdentityTitle'),
      copy: tBrand('documentationPromise'),
    },
    {
      icon: Snowflake,
      title: t('workflowStorageTitle'),
      copy: t('workflowStorageCopy'),
    },
    {
      icon: FileText,
      title: t('workflowBatchTitle'),
      copy: t('workflowBatchCopy'),
    },
  ]

  return (
    <section id="quality" className="px-5 py-14 sm:px-8 lg:py-20">
      <div className="mx-auto max-w-[88rem]">
        <div className="grid gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-center">
          <div>
            <SectionHeader
              align="left"
              eyebrow={t('workflowEyebrow')}
              title={t('workflowTitle')}
              description={t('workflowDescription')}
            />
            <p className="mt-5 max-w-xl text-sm leading-6 text-slate-500">
              {t('workflowNote')}
            </p>
          </div>

          <div className="relative overflow-hidden rounded-[1.75rem] border border-slate-900/10 bg-[#071724] p-5 shadow-[0_30px_100px_rgba(7,23,36,0.22)] sm:p-6">
            <div className="absolute right-[-8rem] top-[-8rem] h-80 w-80 rounded-full bg-teal-300/14 blur-3xl" />
            <div className="relative grid gap-4 md:grid-cols-[1fr_0.85fr]">
              <div className="rounded-2xl border border-white/10 bg-white/8 p-5 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]">
                <div className="mb-8 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-200">
                      {t('availableOnRequest')}
                    </p>
                    <h3 className="mt-2 text-3xl font-semibold tracking-[-0.04em]">
                      {t('documentationHeading')}
                    </h3>
                  </div>
                  <FileText className="text-teal-200" size={30} />
                </div>

                <div className="grid gap-3">
                  {[t('checklistIdentity'), t('checklistPurity'), t('checklistStorage'), t('checklistBatch')].map((item) => (
                    <div
                      key={item}
                      className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/7 px-4 py-3 text-sm text-slate-200"
                    >
                      <span>{item}</span>
                      <span className="h-2 w-14 rounded-full bg-teal-300/70" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-3">
                {workflow.map((item) => (
                  <article
                    key={item.title}
                    className="rounded-2xl border border-white/10 bg-white/7 p-4 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]"
                  >
                    <div className="mb-4 flex size-10 items-center justify-center rounded-2xl bg-teal-300/14 text-teal-200">
                      <item.icon size={19} />
                    </div>
                    <h3 className="text-lg font-semibold">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-400">{item.copy}</p>
                  </article>
                ))}
              </div>
            </div>

            <div className="relative mt-4 flex flex-wrap gap-2 rounded-2xl border border-white/10 bg-white/7 p-3 text-xs font-semibold uppercase tracking-[0.14em] text-slate-300">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/8 px-3 py-2">
                <ShieldCheck size={14} className="text-teal-200" />
                {tBrand('researchUseLabel')}
              </span>
              <span className="rounded-full bg-white/8 px-3 py-2">{tBrand('documentationLabel')}</span>
              <span className="rounded-full bg-white/8 px-3 py-2">{tBrand('notMedicalAdviceLabel')}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
