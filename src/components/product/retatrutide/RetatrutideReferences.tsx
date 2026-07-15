import { ChevronDown, ExternalLink } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { useTranslation } from '../../../i18n/LocaleContext'
import { researchReferences } from './retatrutideResearchData'

const referenceKeys = [
  { titleKey: 'reference1Title', descriptionKey: 'referenceTrialDescription' },
  { titleKey: 'reference2Title', descriptionKey: 'referenceTrialDescription' },
  { titleKey: 'reference3Title', descriptionKey: 'referenceTrialDescription' },
  { titleKey: 'reference4Title', descriptionKey: 'referencePipelineDescription' },
  { titleKey: 'reference5Title', descriptionKey: 'referenceLiteratureDescription' },
]

export function RetatrutideReferences() {
  const [open, setOpen] = useState(false)
  const { t } = useTranslation('retatrutideResearch')
  return <div id="retatrutide-references" className="mt-5 rounded-[1.5rem] border border-slate-900/8 bg-white"><button type="button" aria-expanded={open} onClick={() => setOpen((value) => !value)} className="flex min-h-16 w-full items-center justify-between gap-4 px-5 py-4 text-left font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"><span>{t('clinicalResearchSources')}</span><ChevronDown size={18} className={`shrink-0 text-teal-700 transition ${open ? 'rotate-180' : ''}`} /></button><AnimatePresence initial={false}>{open ? <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><ul className="grid gap-2 border-t border-slate-900/8 p-5">{researchReferences.map((source, index) => <li key={source.title}><a href={source.href} target="_blank" rel="noopener noreferrer" className="flex min-h-12 items-start justify-between gap-4 rounded-xl p-3 transition hover:bg-teal-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-700"><span><strong className="block text-sm text-slate-800">{t(referenceKeys[index].titleKey)}</strong><span className="mt-1 block text-xs leading-5 text-slate-500">{t(referenceKeys[index].descriptionKey)}</span></span><ExternalLink size={15} className="mt-1 shrink-0 text-teal-700" aria-hidden="true" /></a></li>)}</ul></motion.div> : null}</AnimatePresence></div>
}
