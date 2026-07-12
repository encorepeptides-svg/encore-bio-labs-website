import { LegalPageLayout, type LegalSection } from './LegalPageLayout'

const sections: LegalSection[] = [
  {
    heading: '1. Shipping areas',
    body: (
      <ul className="ml-5 list-disc">
        <li>Available delivery areas and methods are confirmed during order review.</li>
        <li>Shipping timing is provided only after product availability and destination are reviewed.</li>
        <li>Any shipping charge is confirmed before the order proceeds.</li>
      </ul>
    ),
  },
  {
    heading: '2. Processing time',
    body: (
      <p>
        Orders are processed after an inquiry is approved and product availability is confirmed.
        Processing and delivery timing are confirmed during order review.
      </p>
    ),
  },
  {
    heading: '3. Shipping costs',
    body: (
      <p>
        Shipping costs are provided during the approved inquiry process. The website checkout does
        not calculate or promise a shipping charge.
      </p>
    ),
  },
  {
    heading: '4. Returns and refunds',
    body: (
      <p>
        Because products are sold for laboratory research use only and may have handling and
        storage requirements, returns are reviewed case by case. Contact Encore Bio Labs before
        returning any item; unauthorized returns may not be accepted.
      </p>
    ),
  },
  {
    heading: '5. Damaged, lost, or incorrect shipments',
    body: (
      <p>
        If your order arrives damaged, is lost in transit, or does not match what was ordered,
        contact us promptly after delivery (or expected delivery) through the research intake
        process so we can investigate and make it right.
      </p>
    ),
  },
  {
    heading: '6. Storage and handling on arrival',
    body: (
      <p>
        Storage requirements can vary by product and format. Review the product-specific storage
        guidance on each product page and use qualified laboratory handling practices upon
        receipt.
      </p>
    ),
  },
  {
    heading: '7. Contact',
    body: (
      <p>
        Shipping or return questions can be sent through the research intake process or WhatsApp{' '}
        <strong>9153595448</strong>.
      </p>
    ),
  },
]

export function ShippingReturnsPage() {
  return (
    <LegalPageLayout
      title="Shipping & Returns"
      effectiveDate="July 7, 2026"
      intro="This page explains how Encore Bio Labs handles shipping, delivery timing, and returns for research catalog orders."
      sections={sections}
    />
  )
}
