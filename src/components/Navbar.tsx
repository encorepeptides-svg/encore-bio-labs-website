import logo from '../assets/images/logo/encore-logo.png'

const navItems = [
  { label: 'Catalog', href: '/catalog' },
  { label: 'Categories', href: '/#products' },
  { label: 'Research', href: '/research' },
  { label: 'About', href: '/about' },
  { label: 'Kits', href: '/kits' },
  { label: 'AI Intake', href: '/intake' },
  { label: 'Quality', href: '/quality' },
  { label: 'How It Works', href: '/#how-it-works' },
  { label: 'FAQ', href: '/faq' },
]

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-900/10 bg-[#f5f5f2]/78 backdrop-blur-2xl">
      <nav className="mx-auto flex max-w-[88rem] items-center justify-between gap-4 px-5 py-3.5 sm:px-8">
        <a href="/" className="flex items-center gap-3" aria-label="Encore Bio Labs home">
          <img
            src={logo}
            alt="Encore Bio Labs"
            width="900"
            height="264"
            className="h-9 w-auto sm:h-10"
          />
        </a>

        <div className="hidden items-center gap-7 lg:flex">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="rounded-full px-2 py-1 text-sm font-medium text-slate-600 transition hover:text-[#071724]"
            >
              {item.label}
            </a>
          ))}
        </div>

        <a
          href="/intake"
          className="hidden shrink-0 whitespace-nowrap rounded-full bg-[#071724] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_16px_34px_rgba(7,23,36,0.18)] transition hover:bg-[#102a3d] md:inline-flex"
        >
          Start Your Research Profile
        </a>

        <a
          href="/intake"
          className="inline-flex shrink-0 rounded-full bg-[#071724] px-4 py-2 text-sm font-semibold text-white shadow-[0_16px_34px_rgba(7,23,36,0.18)] transition hover:bg-[#102a3d] md:hidden"
        >
          Intake
        </a>
      </nav>
    </header>
  )
}
