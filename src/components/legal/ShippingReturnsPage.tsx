import { LegalPageLayout, type LegalSection } from './LegalPageLayout'

const sections: LegalSection[] = [
  {
    heading: '1. Shipping areas',
    body: (
      <ul className="ml-5 list-disc">
        <li>Same-day local delivery is available in the El Paso area for approved research inquiries, subject to order timing and availability.</li>
        <li>Nationwide U.S. shipping is available for research catalog fulfillment.</li>
        <li>Mexico shipping is available and adds $20 USD to standard shipping.</li>
      </ul>
    ),
  },
  {
    heading: '2. Processing time',
    body: (
      <p>
        Orders are processed after an inquiry is approved and product availability is confirmed.
        Same-day El Paso delivery is subject to order cutoff time and courier availability.
      </p>
    ),
  },
  {
    heading: '3. Shipping costs',
    body: (
      <p>
        Standard U.S. shipping costs are calculated at checkout or provided during the approved
        inquiry process. Mexico shipping adds a flat $20 USD to the standard shipping cost.
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
