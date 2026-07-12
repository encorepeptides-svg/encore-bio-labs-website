export function NotFoundPage() {
  return (
    <main id="main-content" className="px-5 py-20 sm:px-8">
      <div className="mx-auto max-w-3xl rounded-[2rem] border border-slate-900/10 bg-white p-8 text-center shadow-[0_24px_80px_rgba(7,23,36,0.08)] sm:p-12">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-700">Page not found</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-[#071724] sm:text-5xl">This page is not available.</h1>
        <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-slate-600">The address may be outdated or incorrect. Continue with the active research catalog or return home.</p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <a href="/catalog" className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#071724] px-6 text-sm font-semibold text-white transition hover:bg-teal-700">Browse Catalog</a>
          <a href="/" className="inline-flex min-h-12 items-center justify-center rounded-full border border-slate-900/10 bg-white px-6 text-sm font-semibold text-[#071724] transition hover:bg-teal-50">Return Home</a>
        </div>
      </div>
    </main>
  )
}
