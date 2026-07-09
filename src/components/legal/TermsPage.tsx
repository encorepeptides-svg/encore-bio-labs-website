import { LegalPageLayout, type LegalSection } from './LegalPageLayout'

const sections: LegalSection[] = [
  {
    heading: '1. Acceptance of terms',
    body: (
      <p>
        By accessing or using the Encore Bio Labs website (the "Site"), you agree to these Terms
        of Service. If you do not agree, do not use the Site.
      </p>
    ),
  },
  {
    heading: '2. Research-use-only products',
    body: (
      <>
        <p>
          All products offered on the Site are sold for research use only. They are not intended
          for human or animal consumption, are not drugs, dietary supplements, or cosmetics, and
          are not approved by the FDA or any other regulatory body for diagnostic, therapeutic, or
          any other use in humans or animals.
        </p>
        <p>
          By purchasing, you represent that you are a qualified researcher or institution
          acquiring products solely for laboratory research purposes, and that you will handle,
          store, and dispose of all products in compliance with applicable laws and safety
          standards.
        </p>
      </>
    ),
  },
  {
    heading: '3. Eligibility',
    body: (
      <p>
        You must be at least 18 years old and legally capable of entering into a binding contract
        to use this Site. You are responsible for ensuring your use of any product complies with
        the laws of your jurisdiction.
      </p>
    ),
  },
  {
    heading: '4. Ordering, pricing, and payment',
    body: (
      <p>
        Product availability, pricing, payment options, and order acceptance are subject to
        change without notice. Encore Bio Labs reserves the right to refuse or cancel any order at
        its discretion, including orders that appear to involve resale, human/animal use, or
        non-research intent.
      </p>
    ),
  },
  {
    heading: '5. Shipping',
    body: (
      <p>
        Shipping terms, timelines, and regional availability (including local delivery and
        international shipping) are described in our{' '}
        <a href="/legal/shipping-returns" className="font-semibold text-teal-700 hover:underline">
          Shipping & Returns
        </a>{' '}
        policy, which is incorporated into these Terms by reference.
      </p>
    ),
  },
  {
    heading: '6. Intellectual property',
    body: (
      <p>
        All content on the Site, including text, graphics, logos, and product imagery, is the
        property of Encore Bio Labs or its licensors and may not be reproduced without written
        permission.
      </p>
    ),
  },
  {
    heading: '7. Disclaimers',
    body: (
      <p>
        The Site and all content are provided "as is" without warranties of any kind. Encore Bio
        Labs makes no representation that any product is fit for a particular research purpose.
        Nothing on this Site constitutes medical advice, diagnosis, or treatment, and no
        practitioner-patient relationship is created by using the Site.
      </p>
    ),
  },
  {
    heading: '8. Limitation of liability',
    body: (
      <p>
        To the maximum extent permitted by law, Encore Bio Labs will not be liable for any
        indirect, incidental, special, or consequential damages arising from your use of the Site
        or any product, including any use inconsistent with the research-use-only restriction in
        Section 2.
      </p>
    ),
  },
  {
    heading: '9. Governing law',
    body: (
      <p>
        These Terms are governed by applicable law, without regard to conflict-of-law principles.
      </p>
    ),
  },
  {
    heading: '10. Changes to these terms',
    body: (
      <p>
        We may update these Terms from time to time. Continued use of the Site after changes are
        posted constitutes acceptance of the revised Terms.
      </p>
    ),
  },
  {
    heading: '11. Contact',
    body: (
      <p>
        Questions about these Terms can be sent through the research intake process or WhatsApp.
      </p>
    ),
  },
]

export function TermsPage() {
  return (
    <LegalPageLayout
      title="Terms of Service"
      effectiveDate="July 7, 2026"
      intro="These Terms of Service govern your access to and use of the Encore Bio Labs website and the purchase of any research-use-only products through it."
      sections={sections}
    />
  )
}
