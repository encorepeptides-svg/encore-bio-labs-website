import { useEffect } from 'react'
import { LoaderCircle } from 'lucide-react'

/**
 * Legacy route kept for old bookmarks. CRM and WhatsApp sales operations now
 * live inside the authenticated main administration portal.
 */
export function CRMAdmin() {
  useEffect(() => {
    const target = window.location.pathname.replace(/\/admin\/crm(?:\/.*)?$/, '/admin/leads')
    window.location.replace(`${target}${window.location.search}${window.location.hash}`)
  }, [])

  return <main id="main-content" className="grid min-h-screen place-items-center bg-[#071724] text-white">
    <div className="text-center">
      <LoaderCircle className="mx-auto animate-spin text-teal-200" size={30} aria-hidden="true" />
      <p className="mt-4 text-sm font-semibold text-slate-300">Opening the administration and sales portal…</p>
    </div>
  </main>
}
