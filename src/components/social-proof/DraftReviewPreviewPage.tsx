import { CircleAlert } from 'lucide-react'
import sourceReviews from '../../data/socialProof/research_peptide_mock_reviews.json'
import { normalizeResearchPeptideReviews } from '../../data/socialProof/importReviews'
import { useTranslation } from '../../i18n/LocaleContext'
import { EditorialReviewRail, type EditorialReviewItem } from './EditorialReviewRail'

const normalizedDrafts = normalizeResearchPeptideReviews(sourceReviews)
const draftReviews: EditorialReviewItem[] = normalizedDrafts.records.map((record) => ({
  id: record.id,
  category: record.category,
  quote: record.quote,
  displayName: record.displayName,
  reviewTitle: record.reviewTitle,
  productName: record.productName,
  rating: record.rating,
  verifiedPurchase: record.verifiedPurchase,
  reviewDate: record.submissionDate,
  approvedPhoto: null,
  altText: '',
  incentiveDisclosure: '',
  relationshipToBusiness: '',
  sortOrder: record.sortOrder,
}))

export function DraftReviewPreviewPage() {
  const { t } = useTranslation('socialProof')

  return (
    <main id="main-content" className="bg-[#eef3f1]">
      <section className="relative isolate overflow-hidden bg-[#071724] px-5 py-[clamp(64px,8vw,108px)] text-white sm:px-8">
        <div aria-hidden="true" className="pointer-events-none absolute -right-32 -top-40 -z-10 size-[32rem] rounded-full bg-teal-400/20 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-52 left-1/4 -z-10 size-[30rem] rounded-full bg-sky-400/10 blur-3xl" />
        <div className="mx-auto max-w-[88rem]">
          <span className="inline-flex items-center gap-2 rounded-full border border-amber-300/35 bg-amber-300/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-amber-200">
            <CircleAlert size={15} aria-hidden="true" />
            {t('draftPreviewBadge')}
          </span>
          <p className="mt-8 text-xs font-semibold uppercase tracking-[0.22em] text-teal-300">{t('draftPreviewEyebrow')}</p>
          <h1 className="mt-4 max-w-4xl text-4xl font-semibold leading-[1.02] tracking-[-0.055em] sm:text-6xl">
            {t('draftPreviewTitle')}
          </h1>
          <p className="mt-6 max-w-3xl text-base leading-8 text-slate-300 sm:text-lg">{t('draftPreviewIntro')}</p>
        </div>
      </section>

      <section className="px-5 pt-[clamp(48px,7vw,80px)] sm:px-8" aria-labelledby="draft-review-heading">
        <div className="mx-auto max-w-[88rem] rounded-[1.5rem] border border-amber-700/20 bg-amber-50 p-5 text-amber-950 shadow-[0_14px_45px_rgba(120,53,15,0.08)] sm:p-6">
          <div className="flex items-start gap-3">
            <CircleAlert className="mt-0.5 shrink-0 text-amber-700" size={20} aria-hidden="true" />
            <div>
              <h2 id="draft-review-heading" className="font-semibold">{t('draftPreviewComplianceTitle')}</h2>
              <p className="mt-1 text-sm leading-6 text-amber-900/80">{t('draftPreviewComplianceBody')}</p>
            </div>
          </div>
        </div>
      </section>

      <EditorialReviewRail items={draftReviews} mode="draft" />
    </main>
  )
}
