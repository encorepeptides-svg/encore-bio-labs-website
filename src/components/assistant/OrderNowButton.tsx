import { MessageCircle } from 'lucide-react'
import { buildOrderInquiryMessage, buildWhatsAppUrl } from '../../lib/whatsapp'
import { cn } from '../../lib/utils'

export function OrderNowButton({ productName, className }: { productName: string; className?: string }) {
  const href = buildWhatsAppUrl(buildOrderInquiryMessage({ product: productName }))

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_44px_rgba(37,211,102,0.32)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#20bd5a] active:translate-y-0',
        className,
      )}
    >
      <MessageCircle size={16} aria-hidden="true" />
      Order Now
    </a>
  )
}
