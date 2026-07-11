import { EncoreCompleteKit } from '../EncoreCompleteKit'

export function KitsPage() {
  return (
    <main id="main-content" className="bg-[#f5f5f2]">
      <div className="px-5 pt-6 sm:px-8">
        <div className="mx-auto flex max-w-[88rem] items-center gap-2 text-sm text-slate-500">
          <a href="/" className="font-medium transition hover:text-[#071724]">
            Home
          </a>
          <span aria-hidden="true">/</span>
          <span className="font-semibold text-[#071724]">Encore Complete Kit</span>
        </div>
      </div>

      <div className="px-5 py-10 sm:px-8 lg:py-14">
        <div className="mx-auto max-w-[88rem]">
          <EncoreCompleteKit variant="full" />
        </div>
      </div>
    </main>
  )
}
