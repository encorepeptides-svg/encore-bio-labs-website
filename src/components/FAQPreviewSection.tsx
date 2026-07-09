import { faqLibrary } from '../data/faq'
import { FAQAccordion } from './content/EditorialModules'

const previewItems = faqLibrary.flatMap((group) => group.items).slice(0, 5)

export function FAQPreviewSection() {
  return (
    <FAQAccordion
      eyebrow="Common Questions"
      title="Answers before you ask."
      items={previewItems}
      cta={{ label: 'View All FAQs', href: '/faq' }}
    />
  )
}
