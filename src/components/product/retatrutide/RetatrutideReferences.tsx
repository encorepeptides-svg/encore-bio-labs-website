import { ChevronDown, ExternalLink } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { researchReferences } from './retatrutideResearchData'

export function RetatrutideReferences() {
  const [open, setOpen] = useState(false)
  return <div id="retatrutide-references" className="mt-5 rounded-[1.5rem] border border-slate-900/8 bg-white"><button type="button" aria-expanded={open} onClick={()=>setOpen((value)=>!value)} className="flex min-h-16 w-full items-center justify-between gap-4 px-5 py-4 text-left font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"><span>Clinical research sources</span><ChevronDown size={18} className={`shrink-0 text-teal-700 transition ${open?'rotate-180':''}`} /></button><AnimatePresence initial={false}>{open?<motion.div initial={{height:0,opacity:0}} animate={{height:'auto',opacity:1}} exit={{height:0,opacity:0}} className="overflow-hidden"><ul className="grid gap-2 border-t border-slate-900/8 p-5">{researchReferences.map((source)=><li key={source.title}><a href={source.href} target="_blank" rel="noopener noreferrer" className="flex min-h-12 items-start justify-between gap-4 rounded-xl p-3 transition hover:bg-teal-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-700"><span><strong className="block text-sm text-slate-800">{source.title}</strong><span className="mt-1 block text-xs leading-5 text-slate-500">{source.description}</span></span><ExternalLink size={15} className="mt-1 shrink-0 text-teal-700" aria-hidden="true" /></a></li>)}</ul></motion.div>:null}</AnimatePresence></div>
}
