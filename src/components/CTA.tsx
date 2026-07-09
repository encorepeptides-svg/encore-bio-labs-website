import { ArrowRight } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '../lib/utils'

type CTAProps = {
  children: ReactNode
  href: string
  tone?: 'dark' | 'light' | 'ghost'
  className?: string
  target?: string
  rel?: string
}

const tones = {
  dark: 'bg-[#071724] text-white shadow-[0_18px_44px_rgba(7,23,36,0.18)] hover:bg-[#102a3d]',
  light: 'bg-white text-[#071724] shadow-[0_24px_70px_rgba(255,255,255,0.16)] hover:bg-teal-100',
  ghost: 'border border-slate-900/10 bg-white/55 text-[#071724] shadow-[0_14px_34px_rgba(7,23,36,0.08)] backdrop-blur-xl hover:bg-white',
}

export function CTA({ children, href, tone = 'dark', className, target, rel }: CTAProps) {
  return (
    <a
      href={href}
      target={target}
      rel={rel}
      className={cn(
        'inline-flex items-center justify-center gap-3 rounded-full px-5 py-3 text-sm font-semibold transition duration-300 hover:-translate-y-0.5 active:translate-y-0',
        tones[tone],
        className,
      )}
    >
      {children}
      <ArrowRight size={16} aria-hidden="true" />
    </a>
  )
}
