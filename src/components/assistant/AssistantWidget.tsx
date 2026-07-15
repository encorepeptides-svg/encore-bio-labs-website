import { MessageCircle } from 'lucide-react'
import { useMemo } from 'react'
import { products } from '../../data/products'
import { useLocale, useTranslation } from '../../i18n/LocaleContext'
import { track } from '../../lib/analytics'
import { buildWhatsAppUrl, getSupportInquiryMessage } from '../../lib/whatsapp'
import { AssistantProvider } from './AssistantProvider'
import { useAssistant } from './assistantContext'
import { EncoreAssistantButton } from './EncoreAssistantButton'
import { EncoreAssistantPanel } from './EncoreAssistantPanel'

function getCurrentProductName() {
  const match = window.location.pathname.match(/^\/products\/([^/]+)\/?$/)
  if (!match) return undefined
  return products.find((product) => product.slug === match[1])?.name
}

function AssistantWidgetInner() {
  const { isOpen, open, close } = useAssistant()
  const { locale } = useLocale()
  const { t } = useTranslation('assistant')
  const productName = useMemo(() => getCurrentProductName(), [])
  const whatsappHref = useMemo(() => buildWhatsAppUrl(getSupportInquiryMessage(locale)), [locale])

  return (
    <>
      {!isOpen && <EncoreAssistantButton onClick={open} />}
      {!isOpen ? (
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={t('whatsappButtonLabel')}
          onClick={() => track('whatsapp_click', { source: 'floating', locale })}
          className="fixed bottom-6 right-4 z-[70] inline-flex min-h-14 items-center gap-2 rounded-full bg-[#25D366] px-4 text-sm font-bold text-[#071724] shadow-[0_18px_50px_rgba(7,23,36,0.2)] transition hover:-translate-y-1 hover:bg-[#39df77] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-teal-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#F8FAFC] md:bottom-24 md:right-6"
        >
          <MessageCircle size={20} aria-hidden="true" />
          <span className="hidden xl:inline">{t('whatsappButtonLabel')}</span>
        </a>
      ) : null}
      {isOpen && <EncoreAssistantPanel onClose={close} productName={productName} />}
    </>
  )
}

export function AssistantWidget() {
  return (
    <AssistantProvider>
      <AssistantWidgetInner />
    </AssistantProvider>
  )
}
