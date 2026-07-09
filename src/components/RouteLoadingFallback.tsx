export function RouteLoadingFallback() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-5" role="status" aria-live="polite">
      <span className="flex items-center gap-3 text-sm font-medium text-slate-500">
        <span className="size-2 animate-pulse rounded-full bg-teal-500" aria-hidden="true" />
        Loading…
      </span>
    </div>
  )
}
