# Propuesta de portal de distribuidores / Distributor portal proposal

## Español

### Objetivo

Crear un canal conjunto y medible donde cada distribuidor pueda generar demanda con un enlace propio, Encore conserve el control del cliente y la aprobación final de cada pedido, y ambas partes vean el mismo registro de atribución, ventas verificadas, comisiones y pagos.

### Modelo recomendado

1. Cada distribuidor recibe una cuenta protegida, un código único e inmutable para auditoría y enlaces con el formato `encorebiolabs.com/catalog?ref=CODIGO`.
2. El website guarda una cookie propia de atribución durante 30 días. Un enlace válido nuevo reemplaza la atribución anterior; un código inválido no la reemplaza.
3. Los enlaces por canal agregan UTM (`whatsapp`, `instagram`, campaña) para conservar contexto de origen. El portal actual no mide clics, visitantes únicos ni un funnel por canal. Si el pedido termina en WhatsApp, el resumen incluye el código del distribuidor.
4. El checkout crea un pedido atribuido en `storefront_orders`. Esto todavía no genera comisión.
5. Operaciones confirma el pago en el panel existente. Esa transición crea automáticamente la venta comisionable y guarda la tasa aplicable.
6. La comisión se calcula sobre ingreso neto elegible: productos menos descuentos, devoluciones, impuestos y envío.
7. La comisión permanece pendiente durante la ventana de devolución. Después pasa a aprobada y puede incluirse en el siguiente lote de pago.
8. El portal registra el lote, monto, periodo y referencia del pago externo. Las transferencias bancarias nunca se ejecutan desde el navegador.

### Política inicial sugerida para el piloto

- Atribución: último enlace válido, ventana de 30 días.
- Comisión base: 25% del ingreso neto elegible.
- Retención por devoluciones: 30 días desde el pago confirmado.
- Pago mínimo: USD 100.
- Frecuencia: lote mensual, con corte el último día del mes.
- Cancelaciones, contracargos, pedidos de prueba, impuestos y envío: no generan comisión.
- Disputas de atribución: se resuelven con el pedido y el registro de auditoría del website; cualquier ajuste requiere motivo documentado.

Estos valores están configurados por distribuidor y deben aprobarse en el contrato comercial antes del lanzamiento.

### Incentivo al cliente y reglas de atribución

- El comprador recibe **5% de descuento, con máximo de USD 25**, en su primera compra pagada elegible atribuida al distribuidor.
- El beneficio se calcula únicamente sobre productos. No reduce envío, impuestos, importación ni procesamiento.
- No se acumula con promociones por volumen: el servidor aplica automáticamente el descuento de mayor valor. Si la promoción por volumen gana, la atribución del distribuidor se conserva y el beneficio de primera compra no se consume.
- El distribuidor mantiene **25% de comisión** sobre el ingreso neto elegible después del descuento ganador y excluyendo devoluciones, impuestos y envío.
- El enlace `?ref=CODIGO` y el campo manual del carrito/checkout se validan contra una cuenta activa. Un código nuevo reemplaza el anterior solo después de una validación exitosa; un código inválido o suspendido nunca borra uno válido.
- La atribución dura 30 días. El cliente puede quitarla manualmente en el carrito o checkout.
- La redención se consume únicamente cuando el pedido cambia a pagado. Pedidos pendientes o cancelados no bloquean una compra futura. Una anulación posterior revierte la redención y anula la comisión elegible.
- El servidor usa la identidad autenticada cuando existe; en caso contrario guarda un identificador privado de una sola vía derivado de contacto normalizado. El distribuidor nunca recibe datos personales ni ese identificador.
- Dos pagos concurrentes no pueden consumir el mismo beneficio: la restricción única del libro de redenciones permite que una sola transacción se confirme.
- El portal del distribuidor muestra tipo de descuento, promoción ganadora, descuento total, ingreso neto elegible y comisión; no muestra información personal del comprador.

### Cómo maximizar el esfuerzo conjunto

- Dar a cada distribuidor tres enlaces listos: catálogo general, WhatsApp e Instagram.
- Proveer una biblioteca aprobada de mensajes, imágenes y respuestas frecuentes para evitar información imprecisa o afirmaciones no permitidas.
- Revisar las órdenes atribuidas, ventas con pago verificado, ingreso neto elegible y comisiones confirmadas.
- No interpretar las órdenes atribuidas como visitantes, prospectos o clics. Las decisiones por canal requieren la instrumentación analítica descrita en `docs/distributor-funnel-instrumentation.md`.
- Después del piloto, considerar niveles de comisión por ingreso neto trimestral, siempre hacia adelante y sin recalcular ventas anteriores.
- Mantener los datos de contacto del comprador únicamente con Encore. El distribuidor ve estado comercial, montos y comisiones, no información personal del cliente.

### Flujo operativo

`Enlace compartido → cookie de atribución → pedido en checkout/WhatsApp → revisión de Encore → estado pagado → comisión automática → retención → lote de pago → referencia externa confirmada`

### Implementación dentro del website

#### Fase 1 — Base funcional (implementada en esta entrega)

- Captura bilingüe del parámetro `ref` y cookie propia de 30 días.
- Validación pública limitada del código, campo manual para aplicar/quitar y estimación bilingüe del beneficio.
- Incentivo 5% / máximo USD 25, resolución sin acumulación contra promociones por volumen y libro privado de redenciones al pagar.
- Preservación del código en checkout y mensajes asistidos por WhatsApp.
- Esquema Supabase conectado con `storefront_orders` para cuentas, referencias, ventas, comisiones, lotes, partidas de pago y auditoría.
- Seguridad por fila: cada distribuidor solo puede leer sus propios registros; los administradores conservan el control operativo.
- Portal bilingüe en `/distributor` con órdenes atribuidas, ventas, comisiones, pagos y enlaces por canal, sin presentar un funnel de tráfico todavía no instrumentado.
- Panel protegido en `/admin/distributors` para crear cuentas, conciliar excepciones, crear lotes y registrar pagos.
- Política de privacidad actualizada en inglés y español.

#### Fase 2 — Preparación de producción (1 semana)

- Aplicar las migraciones en un proyecto Supabase de staging y ejecutar pruebas de acceso anónimo, distribuidor y administrador.
- Completar el intercambio de sesión seguro del portal para que la autenticación persista sin depender del almacenamiento del navegador.
- Importar distribuidores piloto, validar códigos y firmar la política de comisión.
- Probar un pedido completo desde cada canal y confirmar que el pedido conserva la atribución y crea la comisión al marcarse pagado.

#### Fase 3 — Confirmación automática de pagos y ajustes (1–2 semanas)

- Conectar el proveedor de pago o el sistema final de pedidos mediante webhook firmado en servidor.
- Sustituir la confirmación administrativa actual por el evento firmado del proveedor de pagos, manteniendo la misma transición segura a venta comisionable.
- Registrar reembolsos, contracargos y cancelaciones para ajustar el ingreso elegible antes del pago.
- Agregar alertas operativas para atribuciones rechazadas, ventas retenidas y lotes fallidos.

#### Fase 4 — Pagos externos (1 semana después de elegir proveedor)

- Elegir Stripe Connect, Wise Business u otro proveedor aprobado según países, monedas, impuestos y costos.
- Guardar solo el identificador externo de la cuenta; no guardar números bancarios en el website.
- Exigir confirmación administrativa para crear el lote y confirmación del proveedor antes de marcarlo como pagado.
- Conciliar semanalmente el total del lote contra el proveedor y el libro de comisiones.

#### Fase 5 — Optimización continua

- Tablero mensual por distribuidor y canal.
- Metas conjuntas, biblioteca de campañas y pruebas de mensajes.
- Reglas de niveles o bonos aprobadas, con fechas de vigencia y auditoría.
- Revisión trimestral de márgenes, devoluciones, calidad de demanda y cumplimiento de contenido.

### Criterios de lanzamiento

- Ningún visitante anónimo puede leer datos del CRM o del portal.
- Un distribuidor no puede leer registros de otro distribuidor ni información personal del cliente.
- La tasa y el monto de una venta histórica no cambian cuando cambia la tasa futura del distribuidor.
- Ninguna orden atribuida genera comisión hasta que el pago final se confirme.
- Toda comisión pagada pertenece a un lote con periodo, partidas y referencia externa.
- Reembolsos y anulaciones se concilian antes del pago.
- Inglés y español muestran el mismo flujo y significado.

### Decisiones pendientes antes de producción

1. Tasa base, periodo de atribución, retención, mínimo y frecuencia definitivos.
2. Países y monedas de los distribuidores piloto.
3. Sistema que confirmará el pago final y enviará los webhooks.
4. Proveedor de transferencias y responsable interno de aprobar cada lote.
5. Contrato, documentación fiscal y reglas de contenido aprobadas por asesoría legal y contable.

---

## English

### Objective

Create a measurable joint channel where every distributor generates demand with a unique link, Encore retains control of the customer and final order approval, and both parties see the same record of attribution, verified sales, commissions, and payouts.

### Recommended model

1. Each distributor receives a protected account, a unique audit code, and links such as `encorebiolabs.com/catalog?ref=CODE`.
2. The website retains attribution in a first-party cookie for 30 days. A new valid link replaces the previous attribution; an invalid code does not.
3. Channel links add UTM context for WhatsApp, Instagram, and campaigns. The current portal does not measure clicks, unique visitors, or a channel funnel. WhatsApp-assisted orders include the distributor code.
4. Checkout creates an attributed order in `storefront_orders`; that order does not create a commission yet.
5. Operations confirms payment in the existing order workspace. That paid transition automatically creates the commissionable sale and snapshots the applicable rate.
6. Commission is calculated on eligible net revenue: product revenue less discounts, refunds, tax, and shipping.
7. Commission remains pending through the return window, then becomes eligible for a payout batch.
8. The portal records the batch, amount, period, and external payment reference. Bank transfers are never initiated in the browser.

### Suggested pilot policy

- Attribution: last valid link within 30 days.
- Base commission: 25% of eligible net revenue.
- Return hold: 30 days after confirmed payment.
- Minimum payout: USD 100.
- Frequency: monthly batch at month-end.
- Cancellations, chargebacks, test orders, tax, and shipping: non-commissionable.
- Attribution disputes: the website order and audit record control; adjustments require a documented reason.

These values are configurable by distributor and must be approved in the commercial agreement before launch.

### Customer incentive and attribution rules

- The buyer receives **5% off, capped at USD 25**, on the first eligible paid purchase attributed to the distributor.
- The benefit applies to product revenue only. Shipping, tax, import, and processing charges are excluded.
- It does not stack with volume promotions: the server applies whichever discount is greater. If the volume promotion wins, distributor attribution remains and the first-purchase benefit is not consumed.
- The distributor retains a **25% commission** on eligible net revenue after the winning discount and excluding refunds, tax, and shipping.
- Both `?ref=CODE` links and the manual cart/checkout field are validated against an active account. A new code replaces an existing one only after successful validation; an invalid or suspended code never clears a valid one.
- Attribution lasts 30 days, and the shopper can remove it in the cart or checkout.
- Redemption is consumed only when the order becomes paid. Pending or cancelled orders do not block a future purchase. A later void reverses the redemption and voids the eligible commission.
- The server uses authenticated identity when available; otherwise it stores a private one-way identifier derived from normalized contact details. Distributors never receive personal data or that identifier.
- Two concurrent payments cannot consume the same benefit: the redemption ledger’s unique constraint permits only one transaction to commit.
- The distributor portal shows discount type, winning promotion, total discount, eligible net revenue, and commission without customer personal information.

### Maximizing joint effort

- Give each distributor ready-to-use catalog, WhatsApp, and Instagram links.
- Provide an approved library of messages, imagery, and FAQs to prevent inaccurate or prohibited claims.
- Review attributed orders, verified paid sales, eligible net revenue, and confirmed commissions.
- Do not interpret attributed orders as visitors, leads, or clicks. Channel decisions require the analytics instrumentation described in `docs/distributor-funnel-instrumentation.md`.
- After the pilot, consider forward-looking commission tiers based on quarterly net revenue; never recalculate historical sales.
- Keep buyer contact information with Encore. Distributors see commercial status, amounts, and commissions—not customer personal data.

### Operating flow

`Shared link → attribution cookie → checkout/WhatsApp order → Encore review → paid status → automatic commission → return hold → payout batch → confirmed external reference`

### Website implementation

#### Phase 1 — Functional foundation (implemented in this delivery)

- Bilingual `ref` capture and a 30-day first-party cookie.
- Limited public code validation, a bilingual apply/remove field, and benefit estimation.
- The 5% / USD 25 customer incentive, non-stacking volume-promotion resolution, and a private paid-order redemption ledger.
- Code preservation through checkout and assisted WhatsApp messages.
- Supabase schema connected to `storefront_orders` for accounts, referrals, sales, commissions, payout batches, payout items, and audit events.
- Row-level isolation for distributors and administrative control for Encore.
- Bilingual `/distributor` portal with attributed orders, sales, commissions, payouts, and channel links, without presenting a traffic funnel that is not yet instrumented.
- Protected `/admin/distributors` workspace for accounts, exception reconciliation, payout batches, and payment records.
- Bilingual privacy-policy update.

#### Phase 2 — Production readiness (1 week)

- Apply migrations to staging and test anonymous, distributor, and administrator access.
- Complete the secure server/Edge session exchange so portal authentication persists without browser storage.
- Import pilot distributors, validate codes, and sign the commission policy.
- Test one full order per channel and verify that order attribution creates a commission when the order is marked paid.

#### Phase 3 — Automated payment confirmation and adjustments (1–2 weeks)

- Connect the final payment or order system through a signed server webhook.
- Replace the current administrator confirmation with the payment provider’s signed event while preserving the same safe commissionable-sale transition.
- Reconcile refunds, chargebacks, and cancellations before payout.
- Add operational alerts for rejected attribution, held sales, and failed batches.

#### Phase 4 — External payouts (1 week after provider selection)

- Select Stripe Connect, Wise Business, or another approved provider based on countries, currencies, taxes, and fees.
- Store only the provider account identifier; never store bank numbers in the website.
- Require administrative batch approval and provider confirmation before marking a payout paid.
- Reconcile batches weekly against the provider and commission ledger.

#### Phase 5 — Continuous optimization

- Monthly distributor and channel scorecards.
- Joint targets, campaign library, and messaging tests.
- Effective-dated, audited tier and bonus rules.
- Quarterly review of margin, returns, demand quality, and content compliance.

### Launch criteria

- Anonymous visitors cannot read CRM or portal data.
- A distributor cannot read another distributor’s records or customer personal information.
- Historical sale rates and amounts do not change with future rate changes.
- No attributed order earns commission until final payment is confirmed.
- Every paid commission belongs to a batch with a period, line items, and external reference.
- Refunds and voids are reconciled before payout.
- English and Spanish provide equivalent meaning and functionality.

### Decisions required before production

1. Final base rate, attribution window, hold, minimum, and frequency.
2. Pilot distributor countries and currencies.
3. The system that confirms final payment and sends webhooks.
4. Transfer provider and internal batch approver.
5. Contract, tax documentation, and content rules approved by legal and accounting counsel.
