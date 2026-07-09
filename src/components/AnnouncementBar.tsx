import { FlaskConical } from 'lucide-react'
import { motion } from 'framer-motion'

export function AnnouncementBar() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: 'easeOut' }}
      className="relative z-50 border-b border-slate-900/10 bg-[#f5f5f2]/90 px-5 py-2.5 text-center backdrop-blur-xl sm:px-8"
    >
      <div className="mx-auto flex max-w-[88rem] items-center justify-center gap-2 text-xs font-medium tracking-wide text-slate-600 sm:text-sm">
        <FlaskConical size={14} aria-hidden="true" className="shrink-0 text-teal-700" />
        <span>Research-use-only catalog with COA availability, complete kits, and U.S. / Mexico shipping support.</span>
      </div>
    </motion.div>
  )
}
