import { CompleteKitDifferentiator } from '../CompleteKitDifferentiator'

export function KitsPage() {
  return (
    <main id="main-content" className="bg-[#f5f5f2]">
      <div className="px-5 pt-6 sm:px-8">
        <div className="mx-auto flex max-w-[88rem] items-center gap-2 text-sm text-slate-500">
          <a href="/" className="font-medium transition hover:text-[#071724]">
            Home
          </a>
          <span aria-hidden="true">/</span>
          <span className="font-semibold text-[#071724]">Complete Research Kits</span>
        </div>
      </div>

      <CompleteKitDifferentiator />
    </main>
  )
}
