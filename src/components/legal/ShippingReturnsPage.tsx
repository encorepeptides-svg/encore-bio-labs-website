import { AlertTriangle, Clock3, Globe2, MapPin, PackageCheck, ShieldCheck } from 'lucide-react'
import { useLocale } from '../../i18n/LocaleContext'
import { LegalPageLayout, type LegalSection } from './LegalPageLayout'

const copy = {
  en: {
    title: 'Shipping & Delivery',
    intro: 'Review destination rules, Mexico shipping, local-delivery coverage, address verification, and the timing information that must be confirmed before payment.',
    mexicoTitle: '1. Shipping to Mexico',
    mexicoIntro: 'A shipped Mexico order is one flat charge anywhere in the country. There is no import fee and no per-kit charge, so the amount does not change with quantity.',
    mexicoRateLabel: 'Flat shipping, anywhere in Mexico', mexicoRateValue: '$20 USD',
    mexicoFreeLabel: 'Orders of $200 or more', mexicoFreeValue: 'Free',
    mexicoLocalNote: 'Local orders in Ciudad Juárez do not pay the $20 carrier charge at all: pickup at the distribution point is free, and eligible home delivery adds $10.',
    timing: 'Estimated total time = up to 48 hours of processing or dispatch + the confirmed carrier transport or local-delivery time.',
    timingNote: 'The 48 hours refer only to processing or dispatch when inventory is available. They are not a promise that the order will arrive within 48 hours.',
    internationalTitle: '2. Other international destinations',
    internationalBody: 'Product availability, carrier service, current international rates, and destination taxes, duties, or customs charges must be reviewed. Checkout requests a shipping quote and does not confirm payment until the cost is approved.',
    localTitle: '3. Local delivery',
    localBody: 'For a local order in El Paso or Ciudad Juárez, choose free pickup at the configured distribution point or $10 home delivery. The 10-mile home-delivery radius is centered on distribution postal code 79912 for El Paso and 32510 for Ciudad Juárez. The server measures the carrier-verified address against the applicable postal-code center. The pickup location and schedule are shown after confirmation. Chihuahua city is served by tracked carrier shipping rather than local stock: choose Mexico at checkout and the same flat rate and order-value benefits apply. If the address, radius, or timing cannot be confirmed, checkout requests manual review and does not invent availability.',
    validationTitle: '4. Address and coverage verification',
    validationBody: 'Checkout uses U.S.-standard fields for street address, apartment or suite, city, state, and ZIP. Mexico uses street, exterior and interior number, colonia, postal code, city or municipality, and state. The carrier checks the normalized address; if a standardized version is returned, you can use it, keep the original, or edit it.',
    safeguardsTitle: '5. Payment safeguards',
    safeguardsBody: 'The server repeats address, coverage, and service validation before creating an order. Payment remains blocked for missing essentials or a carrier-confirmed undeliverable address. If the provider is unavailable, no service, rate, or timing is invented; the request is marked for manual review.',
    returnsTitle: '6. Returns, damaged, lost, or incorrect shipments',
    returnsBody: 'Because research products may have specific handling and storage requirements, returns are reviewed case by case. Contact Encore before returning an item. Report damaged, lost, or incorrect shipments promptly so the team can investigate.',
  },
  es: {
    title: 'Envíos y entregas',
    intro: 'Consulta las reglas por destino, el envío a México, la cobertura local, la verificación de direcciones y los tiempos que deben confirmarse antes del pago.',
    mexicoTitle: '1. Envíos a México',
    mexicoIntro: 'Un pedido enviado a México lleva un solo cargo plano a todo el país. No hay tarifa de importación ni cobro por kit, así que el monto no cambia con la cantidad.',
    mexicoRateLabel: 'Envío plano, a todo México', mexicoRateValue: 'USD $20',
    mexicoFreeLabel: 'Pedidos de USD $200 o más', mexicoFreeValue: 'Gratis',
    mexicoLocalNote: 'Los pedidos locales en Ciudad Juárez no pagan los USD $20 de paquetería: recoger en el punto de distribución es gratis y la entrega a domicilio elegible agrega USD $10.',
    timing: 'Tiempo estimado total = hasta 48 horas de procesamiento o despacho + el tiempo confirmado de transporte o entrega local.',
    timingNote: 'Las 48 horas corresponden únicamente al procesamiento o despacho cuando hay inventario. No son una promesa de que el pedido llegará en 48 horas.',
    internationalTitle: '2. Otros destinos internacionales',
    internationalBody: 'Se deben revisar la disponibilidad del producto, el servicio del transportista, las tarifas internacionales vigentes y los impuestos, aranceles o cargos aduanales del destino. El checkout solicita una cotización y no confirma el pago hasta que el costo sea aprobado.',
    localTitle: '3. Entregas locales',
    localBody: 'Para un pedido local en El Paso o Ciudad Juárez, elige recoger gratis en el punto de distribución configurado o entrega a domicilio por USD $10. El radio de 10 millas se centra en el código postal de distribución 79912 para El Paso y 32510 para Ciudad Juárez. El servidor mide la dirección verificada por el transportista contra el centro del código postal correspondiente. El lugar y horario de recogida se muestran después de confirmarlos. La ciudad de Chihuahua se atiende con envío rastreado por paquetería, no con inventario local: elige México en el checkout y aplican la misma tarifa plana y los mismos beneficios por monto de compra. Si no se pueden confirmar la dirección, el radio o el horario, el checkout solicita revisión manual y no inventa disponibilidad.',
    validationTitle: '4. Verificación de dirección y cobertura',
    validationBody: 'El checkout usa campos estándar de EE. UU. para dirección de calle, apartamento o suite, ciudad, estado y ZIP. Para México usa calle, números exterior e interior, colonia, código postal, ciudad o municipio y estado. El transportista verifica la dirección normalizada; si devuelve una versión estandarizada, puedes usarla, conservar la original o editarla.',
    safeguardsTitle: '5. Protecciones antes del pago',
    safeguardsBody: 'El servidor vuelve a validar la dirección, la cobertura y el servicio antes de crear la orden. El pago permanece bloqueado si faltan datos esenciales o el transportista confirma que la dirección no es entregable. Si el proveedor no está disponible, no se inventan servicios, tarifas ni tiempos; la solicitud se marca para revisión manual.',
    returnsTitle: '6. Devoluciones y envíos dañados, perdidos o incorrectos',
    returnsBody: 'Como los productos de investigación pueden requerir manejo y almacenamiento específicos, las devoluciones se revisan caso por caso. Contacta a Encore antes de devolver un artículo. Reporta pronto cualquier envío dañado, perdido o incorrecto para que el equipo pueda investigarlo.',
  },
} as const

export function ShippingReturnsPage() {
  const { locale } = useLocale()
  const page = copy[locale]
  const sections: LegalSection[] = [
    {
      heading: page.mexicoTitle,
      body: <>
        <p>{page.mexicoIntro}</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {[[page.mexicoRateLabel, page.mexicoRateValue], [page.mexicoFreeLabel, page.mexicoFreeValue]].map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-sm leading-5 text-slate-600">{label}</p>
              <p className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[#071724]">{value}</p>
            </div>
          ))}
        </div>
        <p className="rounded-2xl border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-700">{page.mexicoLocalNote}</p>
        <div className="flex items-start gap-3 rounded-2xl border border-teal-200 bg-teal-50 p-4"><Clock3 size={18} className="mt-1 shrink-0 text-teal-800" aria-hidden="true" /><div><p className="font-semibold text-teal-950">{page.timing}</p><p className="mt-1 text-xs leading-5 text-teal-900">{page.timingNote}</p></div></div>
      </>,
    },
    { heading: page.internationalTitle, body: <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-5"><Globe2 size={20} className="mt-1 shrink-0 text-teal-700" aria-hidden="true" /><p>{page.internationalBody}</p></div> },
    { heading: page.localTitle, body: <><div className="grid gap-3 sm:grid-cols-2">{['El Paso, Texas', 'Ciudad Juárez, Chihuahua'].map((city) => <div key={city} className="rounded-2xl border border-slate-200 bg-white p-4"><MapPin size={18} className="text-teal-700" aria-hidden="true" /><p className="mt-3 font-semibold text-[#071724]">{city}</p></div>)}</div><p>{page.localBody}</p></> },
    { heading: page.validationTitle, body: <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-5"><ShieldCheck size={20} className="mt-1 shrink-0 text-teal-700" aria-hidden="true" /><p>{page.validationBody}</p></div> },
    { heading: page.safeguardsTitle, body: <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5"><AlertTriangle size={20} className="mt-1 shrink-0 text-amber-700" aria-hidden="true" /><p>{page.safeguardsBody}</p></div> },
    { heading: page.returnsTitle, body: <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-5"><PackageCheck size={20} className="mt-1 shrink-0 text-teal-700" aria-hidden="true" /><p>{page.returnsBody}</p></div> },
  ]
  return <LegalPageLayout title={page.title} effectiveDate={locale === 'es' ? '20 de julio de 2026' : 'July 20, 2026'} intro={page.intro} sections={sections} />
}
