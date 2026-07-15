import { useTranslation } from '../../i18n/LocaleContext'
import type { PagePlacement, PublishedTransformation } from '../../data/socialProof/types'
import { useTransformations } from './useSocialProof'

function TransformationCard({ item }: { item: PublishedTransformation }) {
  const { t } = useTranslation('socialProof')

  const frames: Array<{ label: string; src: string; alt: string; date: string }> = [
    { label: t('beforeLabel'), src: item.beforeImage, alt: item.beforeAltText, date: item.beforeCaptureDate },
    { label: t('afterLabel'), src: item.afterImage, alt: item.afterAltText, date: item.afterCaptureDate },
  ]

  const disclosures: Array<{ label: string; value: string }> = [
    { label: t('claimLabel'), value: item.accompanyingClaim },
    { label: t('typicalOutcomeLabel'), value: item.typicalOutcomeDisclosure },
    { label: t('editsLabel'), value: item.editsDisclosure },
    { label: t('concurrentFactorsLabel'), value: item.concurrentFactorsDisclosure },
  ].filter((entry) => entry.value.trim())

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-slate-900/10 bg-white shadow-[0_18px_50px_rgba(7,23,36,0.06)]">
      <div className="grid grid-cols-2">
        {frames.map((frame) => (
          <div key={frame.label} className="relative aspect-[4/5] w-full overflow-hidden bg-[#dfe8e7]">
            <img
              src={frame.src}
              alt={frame.alt}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <span className="absolute left-2 top-2 rounded-full bg-[#071724]/80 px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-white backdrop-blur-sm">
              {frame.label}
            </span>
            {frame.date ? (
              <span className="absolute bottom-2 left-2 rounded-full bg-white/85 px-2.5 py-1 text-[0.65rem] font-medium text-slate-700 backdrop-blur-sm">
                {t('capturedLabel')}: {frame.date}
              </span>
            ) : null}
          </div>
        ))}
      </div>
      <div className="flex flex-1 flex-col gap-2.5 p-5">
        {item.productOrServiceReferenced ? (
          <p className="text-sm font-semibold text-[#071724]">{item.productOrServiceReferenced}</p>
        ) : null}
        <dl className="grid gap-2">
          {disclosures.map((entry) => (
            <div key={entry.label} className="text-xs leading-5 text-slate-500">
              <dt className="inline font-semibold text-slate-600">{entry.label}: </dt>
              <dd className="inline">{entry.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </article>
  )
}

/**
 * Renders nothing until at least one transformation record is approved AND
 * explicitly approved for THIS page placement. Never auto-placed.
 */
export function TransformationSection({ placement }: { placement: PagePlacement }) {
  const items = useTransformations(placement)
  const { t } = useTranslation('socialProof')

  if (items.length === 0) return null

  return (
    <section className="bg-white px-5 py-[clamp(56px,7vw,96px)] sm:px-8">
      <div className="mx-auto max-w-[88rem]">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-700">{t('transformationsEyebrow')}</p>
        <h2 className="mt-3 max-w-3xl text-3xl font-semibold tracking-[-0.04em] text-[#071724] sm:text-4xl">
          {t('transformationsTitle')}
        </h2>
        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <TransformationCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </section>
  )
}
