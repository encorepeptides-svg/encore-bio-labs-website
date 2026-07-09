import { LegalPageLayout, type LegalSection } from './LegalPageLayout'

const sections: LegalSection[] = [
  {
    heading: '1. Information we collect',
    body: (
      <>
        <p>When you use our research intake form, contact us, or place an order, we may collect:</p>
        <ul className="ml-5 list-disc">
          <li>Contact details (name, email, phone, city)</li>
          <li>Research-interest and intake responses you choose to provide</li>
          <li>Order and shipping details</li>
          <li>Basic technical data (browser, device, general usage analytics)</li>
        </ul>
      </>
    ),
  },
  {
    heading: '2. How we use information',
    body: (
      <p>
        We use the information you provide to respond to inquiries, process orders, route
        research-interest intake to our support team for internal review, fulfill shipping, and
        improve the Site. We do not use intake information to provide medical advice, diagnosis,
        or treatment.
      </p>
    ),
  },
  {
    heading: '3. Data storage and security',
    body: (
      <p>
        We use reasonable administrative and technical safeguards to protect your information.
        No method of storage or transmission is completely secure, and we cannot guarantee
        absolute security.
      </p>
    ),
  },
  {
    heading: '4. Third-party sharing',
    body: (
      <p>
        We do not sell your personal information. We may share information with service providers
        who help us operate the Site (e.g. shipping carriers, payment processors, hosting
        providers) under confidentiality obligations, or as required by law.
      </p>
    ),
  },
  {
    heading: '5. Your rights',
    body: (
      <p>
        You may request access to, correction of, or deletion of your personal information by
        contacting us through the research intake process. Depending on your location, you may
        have additional rights under applicable privacy law.
      </p>
    ),
  },
  {
    heading: '6. Cookies and analytics',
    body: (
      <p>
        The Site may use cookies or similar technology for basic functionality and analytics. You
        can control cookies through your browser settings.
      </p>
    ),
  },
  {
    heading: "7. Children's privacy",
    body: (
      <p>
        The Site is not directed to individuals under 18, and we do not knowingly collect
        information from children.
      </p>
    ),
  },
  {
    heading: '8. Changes to this policy',
    body: (
      <p>
        We may update this Privacy Policy from time to time. Material changes will be reflected by
        an updated effective date at the top of this page.
      </p>
    ),
  },
  {
    heading: '9. Contact',
    body: (
      <p>
        Privacy questions or requests can be sent through the research intake process.
      </p>
    ),
  },
]

export function PrivacyPage() {
  return (
    <LegalPageLayout
      title="Privacy Policy"
      effectiveDate="July 7, 2026"
      intro="This Privacy Policy explains what information Encore Bio Labs collects, how it is used, and the choices you have."
      sections={sections}
    />
  )
}
