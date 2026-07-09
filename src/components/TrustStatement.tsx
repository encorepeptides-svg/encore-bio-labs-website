import { FileText, LayoutGrid, UserCheck } from 'lucide-react'
import { Reveal } from './Reveal'

const items = [
  { icon: FileText, label: 'Documentation-ready sourcing' },
  { icon: LayoutGrid, label: 'Enterprise catalog structure' },
  { icon: UserCheck, label: 'Human procurement support' },
]

export function TrustStatement() {
  return (
    <section className="px-5 py-6 sm:px-8">
      <Reveal
        as="div"
        className="mx-auto flex max-w-[70rem] flex-col items-center gap-3 divide-y divide-slate-900/8 text-center sm:flex-row sm:justify-center sm:gap-6 sm:divide-x sm:divide-y-0 sm:text-left"
      >
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-2.5 px-2 pt-3 first:pt-0 sm:px-6 sm:pt-0">
            <item.icon size={15} aria-hidden="true" className="shrink-0 text-teal-700" />
            <span className="text-sm font-medium text-slate-600">{item.label}</span>
          </div>
        ))}
      </Reveal>
    </section>
  )
}
