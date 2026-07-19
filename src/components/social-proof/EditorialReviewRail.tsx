import { ArrowLeft, ArrowRight, CircleAlert, CircleCheck, Quote, Star } from 'lucide-react'
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type FocusEvent,
  type KeyboardEvent,
} from 'react'
import type { PublishedTestimonial, TestimonialCategory } from '../../data/socialProof/types'
import { useTranslation } from '../../i18n/LocaleContext'
import {
  filterTestimonials,
  getAvailableTestimonialFilters,
  type TestimonialFilter,
} from './testimonialFilters'
import {
  getReviewRailBoundaries,
  getReviewRailTargetIndex,
  reviewRailAutoAdvanceMs,
  reviewRailInteractionPauseMs,
  shouldAutoAdvanceReviewRail,
} from './reviewRailState'

export type EditorialReviewItem = Pick<
  PublishedTestimonial,
  | 'id'
  | 'category'
  | 'quote'
  | 'displayName'
  | 'reviewTitle'
  | 'productName'
  | 'rating'
  | 'verifiedPurchase'
  | 'reviewDate'
  | 'approvedPhoto'
  | 'altText'
  | 'incentiveDisclosure'
  | 'relationshipToBusiness'
  | 'sortOrder'
>

type EditorialReviewRailProps = {
  items: EditorialReviewItem[]
  mode: 'published' | 'draft'
}

const filterLabelKeys: Record<TestimonialFilter, string> = {
  all: 'filterAll',
  service: 'filterService',
  documentation: 'filterDocumentation',
  fulfillment: 'filterFulfillment',
  support: 'filterSupport',
}

const categoryAccent: Record<TestimonialCategory, string> = {
  service: 'bg-sky-50 text-sky-800',
  documentation: 'bg-violet-50 text-violet-800',
  fulfillment: 'bg-teal-50 text-teal-800',
  support: 'bg-amber-50 text-amber-800',
}

function formatReviewDate(value: string, locale: 'en' | 'es') {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return value
  const [, year, month, day] = match
  return new Intl.DateTimeFormat(locale === 'es' ? 'es-US' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(Number(year), Number(month) - 1, Number(day))))
}

function getPurchaseStatusKey(item: EditorialReviewItem) {
  if (item.verifiedPurchase === true) return 'verifiedPurchaseLabel'
  if (item.verifiedPurchase === false) return 'unverifiedPurchaseLabel'
  return 'purchaseStatusUnavailableLabel'
}

function EditorialReviewCard({
  item,
  index,
  total,
  mode,
}: {
  item: EditorialReviewItem
  index: number
  total: number
  mode: EditorialReviewRailProps['mode']
}) {
  const { t, locale } = useTranslation('socialProof')
  const disclosure = [item.relationshipToBusiness, item.incentiveDisclosure].filter((value) => value.trim()).join(' · ')
  const displayDate = mode === 'draft' ? item.reviewDate : formatReviewDate(item.reviewDate, locale)

  return (
    <div
      className="min-w-0 shrink-0 basis-[86%] snap-start snap-always sm:basis-[calc((100%_-_1.25rem)/2)] lg:basis-[calc((100%_-_2.5rem)/3)]"
      data-review-rail-card
      role="group"
      aria-roledescription={t('slideRoleDescription')}
      aria-label={t('reviewPositionLabel', { current: index + 1, total })}
    >
      <figure className="group flex h-full min-h-[30rem] flex-col rounded-[1.65rem] border border-slate-900/10 bg-white p-6 shadow-[0_18px_50px_rgba(7,23,36,0.06)] transition duration-300 hover:border-teal-700/20 hover:shadow-[0_26px_70px_rgba(20,184,166,0.12)] sm:p-7">
        <div className="flex items-center justify-between gap-4">
          <span className="flex size-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition group-hover:bg-teal-50 group-hover:text-teal-700">
            <Quote size={18} aria-hidden="true" />
          </span>
          <span className={`rounded-full px-3 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.14em] ${categoryAccent[item.category]}`}>
            {t(filterLabelKeys[item.category])}
          </span>
        </div>

        {item.rating !== null ? (
          <span
            className="mt-5 inline-flex w-fit items-center gap-1 text-amber-500"
            role="img"
            aria-label={t('ratingAriaLabel', { rating: item.rating })}
          >
            {Array.from({ length: 5 }, (_, starIndex) => (
              <Star
                key={starIndex}
                size={17}
                aria-hidden="true"
                className={starIndex < item.rating! ? 'fill-current' : 'fill-transparent text-slate-300'}
              />
            ))}
          </span>
        ) : null}

        {item.reviewTitle ? (
          <h3 className="mt-4 text-xl font-semibold tracking-[-0.03em] text-[#071724]">{item.reviewTitle}</h3>
        ) : null}
        <blockquote className="mt-4 flex-1 text-base leading-7 tracking-[-0.01em] text-slate-700">{item.quote}</blockquote>

        {item.productName || displayDate ? (
          <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium text-slate-500">
            {item.productName ? (
              <span>
                <span className="sr-only">{t('reviewedProductLabel')}: </span>
                {item.productName}
              </span>
            ) : null}
            {displayDate ? (
              <time dateTime={item.reviewDate} aria-label={`${t('reviewDateLabel')}: ${displayDate}`}>
                {displayDate}
              </time>
            ) : null}
          </div>
        ) : null}

        <figcaption className="mt-6 flex items-center gap-3 border-t border-slate-900/8 pt-5">
          {mode === 'published' && item.approvedPhoto ? (
            <img
              src={item.approvedPhoto}
              alt={item.altText}
              loading="lazy"
              decoding="async"
              className="size-11 shrink-0 rounded-full object-cover ring-2 ring-teal-100"
            />
          ) : (
            <span
              className={`flex size-11 shrink-0 items-center justify-center rounded-full ${mode === 'draft' ? 'bg-amber-50 text-amber-700' : 'bg-[#071724] text-teal-200'}`}
              aria-hidden="true"
            >
              {mode === 'draft' ? <CircleAlert size={20} /> : <CircleCheck size={20} />}
            </span>
          )}
          <span>
            <span className="block text-sm font-semibold text-[#071724]">{item.displayName}</span>
            <span className={`mt-0.5 block text-xs font-medium ${mode === 'draft' ? 'text-amber-700' : 'text-teal-700'}`}>
              {t(mode === 'draft' ? 'draftCardLabel' : 'verifiedLabel')}
            </span>
            <span className="mt-0.5 block text-xs font-medium text-slate-500">
              {mode === 'draft'
                ? `${t('sourcePurchaseFlagLabel')}: ${t(item.verifiedPurchase ? 'sourcePurchaseFlagYes' : 'sourcePurchaseFlagNo')}`
                : t(getPurchaseStatusKey(item))}
            </span>
          </span>
        </figcaption>

        {disclosure ? (
          <p className="mt-3 text-xs leading-5 text-slate-500">
            <span className="font-semibold">{t('disclosureLabel')}:</span> {disclosure}
          </p>
        ) : null}
      </figure>
    </div>
  )
}

function scrollRailTo(rail: HTMLDivElement, left: number, behavior: ScrollBehavior) {
  if (typeof rail.scrollTo === 'function') {
    rail.scrollTo({ left, behavior })
    return
  }
  rail.scrollLeft = left
  rail.dispatchEvent(new Event('scroll'))
}

export function EditorialReviewRail({ items, mode }: EditorialReviewRailProps) {
  const { t, locale } = useTranslation('socialProof')
  const [activeFilter, setActiveFilter] = useState<TestimonialFilter>('all')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [canMovePrevious, setCanMovePrevious] = useState(false)
  const [canMoveNext, setCanMoveNext] = useState(false)
  const [announcement, setAnnouncement] = useState('')
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [isFocusWithin, setIsFocusWithin] = useState(false)
  const [interactionVersion, setInteractionVersion] = useState(0)
  const railRef = useRef<HTMLDivElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const pauseUntilRef = useRef(0)
  const automaticScrollRef = useRef(false)
  const automaticScrollTimerRef = useRef<number | null>(null)
  const railId = useId()
  const headingId = `${railId}-heading`
  const statusId = `${railId}-status`
  const availableFilters = useMemo(() => getAvailableTestimonialFilters(items), [items])
  const visibleItems = useMemo(() => filterTestimonials(items, activeFilter), [activeFilter, items])

  const noteInteraction = useCallback(() => {
    pauseUntilRef.current = Date.now() + reviewRailInteractionPauseMs
    setInteractionVersion((value) => value + 1)
  }, [])

  const updateRailState = useCallback(() => {
    const rail = railRef.current
    if (!rail) return
    const cards = Array.from(rail.querySelectorAll<HTMLElement>('[data-review-rail-card]'))
    const firstCardOffset = cards[0]?.offsetLeft ?? 0
    const nearestIndex = cards.reduce((bestIndex, card, index) => {
      const bestDistance = Math.abs(((cards[bestIndex]?.offsetLeft ?? firstCardOffset) - firstCardOffset) - rail.scrollLeft)
      const distance = Math.abs((card.offsetLeft - firstCardOffset) - rail.scrollLeft)
      return distance < bestDistance ? index : bestIndex
    }, 0)
    const boundaries = getReviewRailBoundaries(rail.scrollLeft, rail.clientWidth, rail.scrollWidth)
    setCurrentIndex(nearestIndex)
    setCanMovePrevious(boundaries.canMovePrevious)
    setCanMoveNext(boundaries.canMoveNext)
  }, [])

  const moveToIndex = useCallback((targetIndex: number, source: 'manual' | 'automatic') => {
    const rail = railRef.current
    if (!rail) return
    const cards = Array.from(rail.querySelectorAll<HTMLElement>('[data-review-rail-card]'))
    const target = cards[targetIndex]
    if (!target) return
    const firstCardOffset = cards[0]?.offsetLeft ?? 0
    const maximumScrollLeft = Math.max(0, rail.scrollWidth - rail.clientWidth)
    const targetLeft = Math.min(maximumScrollLeft, Math.max(0, target.offsetLeft - firstCardOffset))

    if (source === 'manual') {
      noteInteraction()
      const item = visibleItems[targetIndex]
      if (item) setAnnouncement(t('reviewChangedAnnouncement', { current: targetIndex + 1, total: visibleItems.length, title: item.reviewTitle }))
    } else {
      automaticScrollRef.current = true
      if (automaticScrollTimerRef.current !== null) window.clearTimeout(automaticScrollTimerRef.current)
      automaticScrollTimerRef.current = window.setTimeout(() => {
        automaticScrollRef.current = false
      }, 900)
    }

    setCurrentIndex(targetIndex)
    scrollRailTo(rail, targetLeft, prefersReducedMotion ? 'auto' : 'smooth')
  }, [noteInteraction, prefersReducedMotion, t, visibleItems])

  const moveBy = useCallback((direction: -1 | 1, source: 'manual' | 'automatic') => {
    moveToIndex(getReviewRailTargetIndex(currentIndex, direction, visibleItems.length), source)
  }, [currentIndex, moveToIndex, visibleItems.length])

  useEffect(() => {
    if (availableFilters.includes(activeFilter)) return
    setActiveFilter('all')
  }, [activeFilter, availableFilters])

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return undefined
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const updatePreference = () => setPrefersReducedMotion(query.matches)
    updatePreference()
    query.addEventListener?.('change', updatePreference)
    return () => query.removeEventListener?.('change', updatePreference)
  }, [])

  useLayoutEffect(() => {
    const rail = railRef.current
    if (!rail) return undefined
    automaticScrollRef.current = true
    const previousScrollBehavior = rail.style.scrollBehavior
    rail.style.scrollBehavior = 'auto'
    rail.scrollLeft = 0
    rail.style.scrollBehavior = previousScrollBehavior
    setCurrentIndex(0)
    const frame = window.requestAnimationFrame(() => {
      updateRailState()
      automaticScrollRef.current = false
    })
    return () => window.cancelAnimationFrame(frame)
  }, [activeFilter, updateRailState, visibleItems.length])

  useEffect(() => {
    const rail = railRef.current
    if (!rail || typeof ResizeObserver === 'undefined') return undefined
    const observer = new ResizeObserver(updateRailState)
    observer.observe(rail)
    return () => observer.disconnect()
  }, [updateRailState])

  useEffect(() => () => {
    if (automaticScrollTimerRef.current !== null) window.clearTimeout(automaticScrollTimerRef.current)
  }, [])

  useEffect(() => {
    const now = Date.now()
    const ready = shouldAutoAdvanceReviewRail({
      itemCount: visibleItems.length,
      canMoveNext,
      prefersReducedMotion,
      isHovered,
      isFocusWithin,
      pauseUntil: pauseUntilRef.current,
      now,
    })
    const remainingPause = Math.max(0, pauseUntilRef.current - now)
    if (!ready && remainingPause === 0) return undefined
    if (prefersReducedMotion || isHovered || isFocusWithin || !canMoveNext || visibleItems.length <= 1) return undefined

    const timer = window.setTimeout(() => {
      if (Date.now() < pauseUntilRef.current) {
        setInteractionVersion((value) => value + 1)
        return
      }
      moveBy(1, 'automatic')
    }, remainingPause + reviewRailAutoAdvanceMs)

    return () => window.clearTimeout(timer)
  }, [canMoveNext, currentIndex, interactionVersion, isFocusWithin, isHovered, moveBy, prefersReducedMotion, visibleItems.length])

  const handleScroll = () => {
    if (!automaticScrollRef.current) noteInteraction()
    updateRailState()
  }

  const handleFilter = (filter: TestimonialFilter) => {
    noteInteraction()
    setActiveFilter(filter)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
    event.preventDefault()
    moveBy(event.key === 'ArrowRight' ? 1 : -1, 'manual')
  }

  const handleBlurCapture = (event: FocusEvent<HTMLDivElement>) => {
    if (wrapperRef.current?.contains(event.relatedTarget as Node | null)) return
    setIsFocusWithin(false)
  }

  const countKey = mode === 'draft'
    ? (visibleItems.length === 1 ? 'draftCountOne' : 'draftCountOther')
    : (visibleItems.length === 1 ? 'verifiedCountOne' : 'verifiedCountOther')

  return (
    <section className="relative isolate overflow-hidden bg-[#eef3f1] px-5 py-[clamp(64px,8vw,112px)] sm:px-8" aria-labelledby={headingId}>
      <div aria-hidden="true" className="pointer-events-none absolute -right-32 -top-36 -z-10 size-[30rem] rounded-full bg-teal-200/25 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-44 -left-28 -z-10 size-[28rem] rounded-full bg-slate-300/35 blur-3xl" />

      <div className="mx-auto max-w-[88rem]" ref={wrapperRef} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)} onFocusCapture={() => setIsFocusWithin(true)} onBlurCapture={handleBlurCapture}>
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.78fr)_minmax(28rem,1.22fr)] lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-700">
              {mode === 'draft' ? t('draftPreviewListEyebrow', { count: items.length }) : t('testimonialsEyebrow')}
            </p>
            <h2 id={headingId} className="mt-4 max-w-3xl text-4xl font-semibold leading-[1.02] tracking-[-0.055em] text-[#071724] sm:text-5xl">
              {t(mode === 'draft' ? 'draftPreviewRailTitle' : 'testimonialsTitle')}
            </h2>
            {locale === 'es' ? <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600">{t('originalLanguageNotice')}</p> : null}
          </div>

          <div className="min-w-0 lg:justify-self-end">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{t('filterPrompt')}</p>
            <div
              className="flex max-w-full gap-1.5 overflow-x-auto rounded-[1.15rem] border border-slate-900/10 bg-white/70 p-1.5 shadow-[0_12px_35px_rgba(7,23,36,0.06)] backdrop-blur-xl"
              role="group"
              aria-label={t(mode === 'draft' ? 'draftFilterAriaLabel' : 'filterAriaLabel')}
            >
              {availableFilters.map((filter) => {
                const isActive = filter === activeFilter
                return (
                  <button
                    key={filter}
                    type="button"
                    aria-pressed={isActive}
                    aria-controls={railId}
                    onClick={() => handleFilter(filter)}
                    className={`min-h-10 shrink-0 rounded-[0.85rem] px-4 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-teal-600/25 ${
                      isActive
                        ? 'bg-[#071724] text-white shadow-[0_8px_20px_rgba(7,23,36,0.18)]'
                        : 'text-slate-600 hover:bg-white hover:text-[#071724]'
                    }`}
                  >
                    {t(filterLabelKeys[filter])}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <div className="mt-7 flex flex-wrap items-center justify-between gap-4">
          <div id={statusId} className="flex items-center gap-2 text-sm font-medium text-slate-600" role="status" aria-live="polite">
            {mode === 'draft' ? <CircleAlert size={16} aria-hidden="true" className="text-amber-700" /> : <CircleCheck size={16} aria-hidden="true" className="text-teal-700" />}
            {t(countKey, { count: visibleItems.length })}
          </div>

          <div className="flex items-center gap-2" aria-label={t('railNavigationLabel')} role="group">
            <button
              type="button"
              onClick={() => moveBy(-1, 'manual')}
              disabled={!canMovePrevious}
              aria-controls={railId}
              aria-label={t('previousReviewsLabel')}
              className="flex size-11 items-center justify-center rounded-full border border-slate-900/10 bg-white text-[#071724] shadow-[0_10px_28px_rgba(7,23,36,0.08)] transition hover:border-teal-700/25 hover:bg-teal-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-teal-600/25 disabled:cursor-not-allowed disabled:opacity-35"
            >
              <ArrowLeft size={18} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => moveBy(1, 'manual')}
              disabled={!canMoveNext}
              aria-controls={railId}
              aria-label={t('nextReviewsLabel')}
              className="flex size-11 items-center justify-center rounded-full border border-slate-900/10 bg-white text-[#071724] shadow-[0_10px_28px_rgba(7,23,36,0.08)] transition hover:border-teal-700/25 hover:bg-teal-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-teal-600/25 disabled:cursor-not-allowed disabled:opacity-35"
            >
              <ArrowRight size={18} aria-hidden="true" />
            </button>
          </div>
        </div>

        <div
          ref={railRef}
          id={railId}
          className="relative mt-6 flex snap-x snap-mandatory items-start gap-5 overflow-x-auto overscroll-x-contain pb-5 pr-[14%] scroll-smooth scroll-px-0 [scrollbar-width:none] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-teal-600/25 motion-reduce:scroll-auto sm:pr-0 [&::-webkit-scrollbar]:hidden"
          tabIndex={0}
          role="region"
          aria-roledescription={t('carouselRoleDescription')}
          aria-label={t(mode === 'draft' ? 'draftRailAriaLabel' : 'railAriaLabel')}
          aria-describedby={statusId}
          onKeyDown={handleKeyDown}
          onScroll={handleScroll}
          onWheel={noteInteraction}
          onPointerDown={noteInteraction}
          onTouchStart={noteInteraction}
        >
          {visibleItems.map((item, index) => (
            <EditorialReviewCard key={item.id} item={item} index={index} total={visibleItems.length} mode={mode} />
          ))}
        </div>

        <p className="sr-only" aria-live="polite" aria-atomic="true">{announcement}</p>
      </div>
    </section>
  )
}
