import { useLocale } from '../../i18n/LocaleContext'
import { LegalPageLayout, type LegalSection } from './LegalPageLayout'

const copy = {
  en: {
    title: 'Research Use Only Policy',
    intro: 'This policy explains the laboratory-research-only conditions that apply to Encore Bio Labs products, website information, and order requests.',
    sections: [
      ['1. Laboratory research only', 'Encore Bio Labs products are intended exclusively for legitimate laboratory research. They are not intended for human or animal consumption, diagnosis, treatment, prevention, or therapeutic use.'],
      ['2. Age and purchaser responsibility', 'You must be at least 18 years old to access the commercial portions of this website or submit an order request. Purchasers are responsible for ensuring their proposed research and handling practices comply with applicable law and institutional requirements.'],
      ['3. Prohibited uses', 'Products may not be purchased, represented, prepared, or used for human or animal consumption. Encore may refuse or cancel a request when the available information suggests a prohibited use or non-research intent.'],
      ['4. No medical or administration guidance', 'Encore Bio Labs does not provide medical advice, diagnosis, treatment recommendations, dosing instructions, reconstitution instructions, injection guidance, or other administration directions. Website content does not create a practitioner-patient relationship.'],
      ['5. Website research information', 'Product pages may summarize published research interests and public discussion for informational context. That material does not establish safety, efficacy, suitability, or outcomes for an Encore Bio Labs product.'],
      ['6. Acknowledgment records', 'The site-entry acknowledgment is stored locally for up to 30 days. Each order requires a separate acknowledgment, and the order record stores the version, acceptance time, exact displayed language, locale, and applicable policy versions.'],
      ['7. Policy updates', 'Encore Bio Labs may update this policy as its catalog, processes, or legal requirements change. A new acknowledgment version requires visitors to review and accept the updated language again.'],
    ],
  },
  es: {
    title: 'Política de Uso Exclusivo para Investigación',
    intro: 'Esta política explica las condiciones de uso exclusivo para investigación de laboratorio que se aplican a los productos, la información del sitio y las solicitudes de pedido de Encore Bio Labs.',
    sections: [
      ['1. Solo para investigación de laboratorio', 'Los productos de Encore Bio Labs están destinados exclusivamente a la investigación legítima de laboratorio. No están destinados al consumo humano o animal, diagnóstico, tratamiento, prevención ni uso terapéutico.'],
      ['2. Edad y responsabilidad de quien compra', 'Debes tener al menos 18 años para acceder a las secciones comerciales de este sitio o enviar una solicitud de pedido. Quien compra es responsable de comprobar que la investigación propuesta y las prácticas de manejo cumplan con la legislación y los requisitos institucionales aplicables.'],
      ['3. Usos prohibidos', 'Los productos no pueden comprarse, presentarse, prepararse ni utilizarse para consumo humano o animal. Encore puede rechazar o cancelar una solicitud cuando la información disponible indique un uso prohibido o una finalidad ajena a la investigación.'],
      ['4. Sin consejo médico ni instrucciones de administración', 'Encore Bio Labs no proporciona consejos médicos, diagnósticos, recomendaciones de tratamiento, dosis, instrucciones de reconstitución, orientación sobre inyecciones ni otras instrucciones de administración. El contenido del sitio no crea una relación profesional-paciente.'],
      ['5. Información de investigación del sitio', 'Las páginas de productos pueden resumir intereses de investigación publicados y conversaciones públicas como contexto informativo. Ese material no demuestra seguridad, eficacia, idoneidad ni resultados para un producto de Encore Bio Labs.'],
      ['6. Registros de reconocimiento', 'El reconocimiento de entrada se guarda localmente durante un máximo de 30 días. Cada pedido exige un reconocimiento independiente, y el registro del pedido conserva la versión, la hora de aceptación, el texto exacto mostrado, el idioma y las versiones de las políticas aplicables.'],
      ['7. Actualizaciones de la política', 'Encore Bio Labs puede actualizar esta política cuando cambien su catálogo, sus procesos o los requisitos legales. Una nueva versión del reconocimiento obliga a revisar y aceptar nuevamente el texto actualizado.'],
    ],
  },
} as const

export function ResearchUseOnlyPolicyPage() {
  const { locale } = useLocale()
  const page = copy[locale]
  const sections: LegalSection[] = page.sections.map(([heading, body]) => ({
    heading,
    body: <p>{body}</p>,
  }))

  return (
    <LegalPageLayout
      title={page.title}
      effectiveDate={locale === 'es' ? '26 de julio de 2026' : 'July 26, 2026'}
      intro={page.intro}
      sections={sections}
    />
  )
}
