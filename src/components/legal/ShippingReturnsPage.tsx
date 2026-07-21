import { AlertTriangle, Clock3, Globe2, MapPin, PackageCheck, ShieldCheck } from 'lucide-react'
import { useLocale } from '../../i18n/LocaleContext'
import { LegalPageLayout, type LegalSection } from './LegalPageLayout'

const copy = {
  en: {
    title: 'Shipping & Delivery',
    intro: 'Review destination rules, Mexico charges, local-delivery coverage, address verification, and the timing information that must be confirmed before payment.',
    mexicoTitle: '1. Shipping to Mexico',
    mexicoIntro: 'The import fee applies to shipped Mexico orders and local delivery in Ciudad Juárez or Chihuahua. It is based on the total number of kits and is recalculated whenever quantity changes.',
    mexicoLocalNote: 'For local orders in Ciudad Juárez or Chihuahua, the same $25 or $50 import fee applies to both distribution-point pickup and home delivery. The $15 carrier-shipping charge does not apply. Pickup is free; eligible home delivery adds $10.',
    kits: 'Kits', import: 'Import fee', shipping: 'Shipping', additional: 'Total additional charges',
    oneFour: '1–4 kits', fivePlus: '5+ kits',
    timing: 'Estimated total time = up to 48 hours of processing or dispatch + the confirmed carrier transport or local-delivery time.',
    timingNote: 'The 48 hours refer only to processing or dispatch when inventory is available. They are not a promise that the order will arrive within 48 hours.',
    internationalTitle: '2. Other international destinations',
    internationalBody: 'Product availability, carrier service, current international rates, and destination taxes, duties, or customs charges must be reviewed. Checkout requests a shipping quote and does not confirm payment until the cost is approved.',
    localTitle: '3. Local delivery',
    localBody: 'For a local order in El Paso, Ciudad Juárez, or Chihuahua, choose free pickup at the configured distribution point or $10 home delivery. Home delivery is offered only when server verification confirms that the address is within 10 miles of the corresponding distribution point. The pickup location and schedule are shown after confirmation. Ciudad Juárez and Chihuahua also include the applicable Mexico import fee. If the location, radius, or timing cannot be confirmed, checkout requests manual review and does not invent availability.',
    validationTitle: '4. Address and coverage verification',
    validationBody: 'Checkout uses U.S.-standard fields for street address, apartment or suite, city, state, and ZIP. Mexico uses street, exterior and interior number, colonia, postal code, city or municipality, and state. The carrier checks the normalized address; if a standardized version is returned, you can use it, keep the original, or edit it.',
    safeguardsTitle: '5. Payment safeguards',
    safeguardsBody: 'The server repeats address, coverage, and service validation before creating an order. Payment remains blocked for missing essentials or a carrier-confirmed undeliverable address. If the provider is unavailable, no service, rate, or timing is invented; the request is marked for manual review.',
    returnsTitle: '6. Returns, damaged, lost, or incorrect shipments',
    returnsBody: 'Because research products may have specific handling and storage requirements, returns are reviewed case by case. Contact Encore before returning an item. Report damaged, lost, or incorrect shipments promptly so the team can investigate.',
  },
  es: {
    title: 'Envíos y entregas',
    intro: 'Consulta las reglas por destino, los cargos para México, la cobertura local, la verificación de direcciones y los tiempos que deben confirmarse antes del pago.',
    mexicoTitle: '1. Envíos a México',
    mexicoIntro: 'La tarifa de importación aplica a los pedidos enviados a México y a la entrega local en Ciudad Juárez o Chihuahua. Depende de la cantidad total de kits y se vuelve a calcular cada vez que cambia la cantidad.',
    mexicoLocalNote: 'Para pedidos locales en Ciudad Juárez o Chihuahua aplica la misma tarifa de importación de $25 o $50, tanto para recoger en punto de distribución como para entrega a domicilio. No se cobran los $15 de paquetería. Recoger es gratis; la entrega a domicilio elegible agrega $10.',
    kits: 'Kits', import: 'Tarifa de importación', shipping: 'Envío', additional: 'Cargos adicionales totales',
    oneFour: '1–4 kits', fivePlus: '5 kits o más',
    timing: 'Tiempo estimado total = hasta 48 horas de procesamiento o despacho + el tiempo confirmado de transporte o entrega local.',
    timingNote: 'Las 48 horas corresponden únicamente al procesamiento o despacho cuando hay inventario. No son una promesa de que el pedido llegará en 48 horas.',
    internationalTitle: '2. Otros destinos internacionales',
    internationalBody: 'Se deben revisar la disponibilidad del producto, el servicio del transportista, las tarifas internacionales vigentes y los impuestos, aranceles o cargos aduanales del destino. El checkout solicita una cotización y no confirma el pago hasta que el costo sea aprobado.',
    localTitle: '3. Entregas locales',
    localBody: 'Para un pedido local en El Paso, Ciudad Juárez o Chihuahua, elige recoger gratis en el punto de distribución configurado o entrega a domicilio por $10. La entrega a domicilio se ofrece únicamente cuando la verificación del servidor confirma que la dirección está dentro de un radio de 10 millas del punto correspondiente. El lugar y horario de recogida se muestran después de confirmarlos. Ciudad Juárez y Chihuahua también incluyen la tarifa de importación aplicable a México. Si no se pueden confirmar el punto, el radio o el horario, el checkout solicita revisión manual y no inventa disponibilidad.',
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
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="w-full min-w-[34rem] text-left text-sm">
            <thead className="bg-[#071724] text-white"><tr><th className="px-4 py-3">{page.kits}</th><th className="px-4 py-3">{page.import}</th><th className="px-4 py-3">{page.shipping}</th><th className="px-4 py-3">{page.additional}</th></tr></thead>
            <tbody><tr className="border-b border-slate-200"><td className="px-4 py-3 font-semibold">{page.oneFour}</td><td className="px-4 py-3">$25 USD</td><td className="px-4 py-3">$15 USD</td><td className="px-4 py-3 font-semibold">$40 USD</td></tr><tr><td className="px-4 py-3 font-semibold">{page.fivePlus}</td><td className="px-4 py-3">$50 USD</td><td className="px-4 py-3">$15 USD</td><td className="px-4 py-3 font-semibold">$65 USD</td></tr></tbody>
          </table>
        </div>
        <p className="rounded-2xl border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-700">{page.mexicoLocalNote}</p>
        <div className="flex items-start gap-3 rounded-2xl border border-teal-200 bg-teal-50 p-4"><Clock3 size={18} className="mt-1 shrink-0 text-teal-800" aria-hidden="true" /><div><p className="font-semibold text-teal-950">{page.timing}</p><p className="mt-1 text-xs leading-5 text-teal-900">{page.timingNote}</p></div></div>
      </>,
    },
    { heading: page.internationalTitle, body: <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-5"><Globe2 size={20} className="mt-1 shrink-0 text-teal-700" aria-hidden="true" /><p>{page.internationalBody}</p></div> },
    { heading: page.localTitle, body: <><div className="grid gap-3 sm:grid-cols-3">{['El Paso, Texas', 'Ciudad Juárez, Chihuahua', 'Chihuahua, Chihuahua'].map((city) => <div key={city} className="rounded-2xl border border-slate-200 bg-white p-4"><MapPin size={18} className="text-teal-700" aria-hidden="true" /><p className="mt-3 font-semibold text-[#071724]">{city}</p></div>)}</div><p>{page.localBody}</p></> },
    { heading: page.validationTitle, body: <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-5"><ShieldCheck size={20} className="mt-1 shrink-0 text-teal-700" aria-hidden="true" /><p>{page.validationBody}</p></div> },
    { heading: page.safeguardsTitle, body: <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5"><AlertTriangle size={20} className="mt-1 shrink-0 text-amber-700" aria-hidden="true" /><p>{page.safeguardsBody}</p></div> },
    { heading: page.returnsTitle, body: <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-5"><PackageCheck size={20} className="mt-1 shrink-0 text-teal-700" aria-hidden="true" /><p>{page.returnsBody}</p></div> },
  ]
  return <LegalPageLayout title={page.title} effectiveDate={locale === 'es' ? '20 de julio de 2026' : 'July 20, 2026'} intro={page.intro} sections={sections} />
}
