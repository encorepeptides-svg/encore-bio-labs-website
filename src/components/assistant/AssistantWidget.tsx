import { useMemo } from 'react'
import { products } from '../../data/products'
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
  const productName = useMemo(() => getCurrentProductName(), [])

  return (
    <>
      {!isOpen && <EncoreAssistantButton onClick={open} />}
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
