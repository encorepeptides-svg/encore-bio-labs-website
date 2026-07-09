import { MessageCircle } from 'lucide-react'
import { buildOrderInquiryMessage, buildWhatsAppUrl, GENERAL_INQUIRY_MESSAGE } from '../../lib/whatsapp'

export function FloatingWhatsAppButton({ productName }: { productName?: string }) {
  const message = productName ? buildOrderInquiryMessage({ product: productName }) : GENERAL_INQUIRY_MESSAGE
  const href = buildWhatsAppUrl(message)

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with Encore Bio Labs on WhatsApp"
      className="group fixed bottom-24 right-4 z-[70] flex size-14 items-center justify-center rounded-full border border-white/50 bg-[#25D366]/95 text-white shadow-[0_18px_44px_rgba(37,211,102,0.4)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:bg-[#22c35f] md:bottom-6 md:right-6"
    >
      <MessageCircle size={26} aria-hidden="true" className="transition duration-300 group-hover:scale-110" />
    </a>
  )
}
