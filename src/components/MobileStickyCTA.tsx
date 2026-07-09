import { ArrowRight } from 'lucide-react'

export function MobileStickyCTA() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-900/10 bg-[#f5f5f2]/88 px-4 py-3 shadow-[0_-18px_44px_rgba(7,23,36,0.08)] backdrop-blur-2xl md:hidden">
      <a
        href="/intake"
        className="mx-auto flex h-12 max-w-sm items-center justify-center gap-3 rounded-full bg-[#071724] px-5 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(7,23,36,0.22)]"
      >
        Start Your Research Profile
        <span className="flex size-8 items-center justify-center rounded-full bg-white text-[#071724]">
          <ArrowRight size={16} aria-hidden="true" />
        </span>
      </a>
    </div>
  )
}
