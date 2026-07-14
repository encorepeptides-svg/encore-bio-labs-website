import { LegalPageLayout, type LegalSection } from './LegalPageLayout'
import { useLocale } from '../../i18n/LocaleContext'

const copy = {
  en: { title: 'Terms of Service', intro: 'These Terms of Service govern your access to and use of the Encore Bio Labs website and the purchase of research-use-only products through it.', sections: [
    ['1. Acceptance of terms', 'By accessing or using the Encore Bio Labs website (the “Site”), you agree to these Terms of Service. If you do not agree, do not use the Site.'],
    ['2. Research-use-only products', 'All products offered on the Site are sold for research use only. They are not intended for human or animal consumption, are not drugs, dietary supplements, or cosmetics, and are not approved by the FDA or another regulatory body for diagnostic or therapeutic use. By purchasing, you represent that you are a qualified researcher or institution acquiring products solely for laboratory research.'],
    ['3. Eligibility', 'You must be at least 18 years old and legally capable of entering a binding contract. You are responsible for ensuring that your use of any product complies with the laws of your jurisdiction.'],
    ['4. Ordering, pricing, and payment', 'Product availability, pricing, payment options, and order acceptance may change without notice. Encore Bio Labs may refuse or cancel orders that appear to involve resale, human or animal use, or non-research intent.'],
    ['5. Shipping', 'Shipping terms, timelines, and regional availability are described in our Shipping & Returns policy, which is incorporated into these Terms by reference.'],
    ['6. Intellectual property', 'All Site content, including text, graphics, logos, and product imagery, belongs to Encore Bio Labs or its licensors and may not be reproduced without written permission.'],
    ['7. Disclaimers', 'The Site and its content are provided “as is.” Nothing on the Site constitutes medical advice, diagnosis, or treatment, and no practitioner-patient relationship is created.'],
    ['8. Limitation of liability', 'To the maximum extent permitted by law, Encore Bio Labs is not liable for indirect, incidental, special, or consequential damages arising from use of the Site or any product.'],
    ['9. Governing law', 'These Terms are governed by applicable law, without regard to conflict-of-law principles.'],
    ['10. Changes to these terms', 'We may update these Terms. Continued use of the Site after changes are posted constitutes acceptance of the revised Terms.'],
    ['11. Contact', 'Questions about these Terms can be sent through the research intake process or WhatsApp.'],
  ] },
  es: { title: 'Términos de Servicio', intro: 'Estos Términos de Servicio rigen el acceso y uso del sitio de Encore Bio Labs y la compra de productos destinados exclusivamente a investigación.', sections: [
    ['1. Aceptación de los términos', 'Al acceder o usar el sitio de Encore Bio Labs (el “Sitio”), aceptas estos Términos de Servicio. Si no estás de acuerdo, no uses el Sitio.'],
    ['2. Productos exclusivos para investigación', 'Todos los productos se venden exclusivamente para investigación. No están destinados al consumo humano o animal, no son medicamentos, suplementos ni cosméticos, y no cuentan con aprobación de la FDA u otro organismo regulador para uso diagnóstico o terapéutico. Al comprar, declaras ser una persona investigadora o una institución calificada y adquirirlos únicamente para investigación de laboratorio.'],
    ['3. Elegibilidad', 'Debes tener al menos 18 años y capacidad legal para celebrar un contrato vinculante. Eres responsable de que el uso de cualquier producto cumpla las leyes de tu jurisdicción.'],
    ['4. Pedidos, precios y pagos', 'La disponibilidad, los precios, las opciones de pago y la aceptación de pedidos pueden cambiar sin aviso. Encore Bio Labs puede rechazar o cancelar pedidos que parezcan destinados a reventa, uso humano o animal, o fines no relacionados con investigación.'],
    ['5. Envíos', 'Los términos, plazos y disponibilidad regional de los envíos se describen en nuestra política de Envíos y devoluciones, incorporada a estos Términos por referencia.'],
    ['6. Propiedad intelectual', 'Todo el contenido del Sitio, incluidos textos, gráficos, logotipos e imágenes de productos, pertenece a Encore Bio Labs o a sus licenciantes y no puede reproducirse sin permiso escrito.'],
    ['7. Descargos de responsabilidad', 'El Sitio y su contenido se ofrecen “tal cual”. Nada en el Sitio constituye consejo, diagnóstico o tratamiento médico ni crea una relación profesional-paciente.'],
    ['8. Limitación de responsabilidad', 'En la máxima medida permitida por la ley, Encore Bio Labs no responde por daños indirectos, incidentales, especiales o consecuentes derivados del uso del Sitio o de un producto.'],
    ['9. Ley aplicable', 'Estos Términos se rigen por la legislación aplicable, sin considerar principios de conflicto de leyes.'],
    ['10. Cambios a estos términos', 'Podemos actualizar estos Términos. Continuar usando el Sitio después de publicar cambios implica aceptar la versión revisada.'],
    ['11. Contacto', 'Las preguntas sobre estos Términos pueden enviarse mediante el proceso de admisión de investigación o WhatsApp.'],
  ] },
} as const

export function TermsPage() {
  const { locale } = useLocale()
  const page = copy[locale]
  const sections: LegalSection[] = page.sections.map(([heading, body]) => ({ heading, body: <p>{body}</p> }))
  return <LegalPageLayout title={page.title} effectiveDate={locale === 'es' ? '7 de julio de 2026' : 'July 7, 2026'} intro={page.intro} sections={sections} />
}
