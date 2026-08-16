# Instrumentación futura del funnel de distribuidores / Future distributor funnel instrumentation

## Español

### Estado actual

El portal no mide clics, visitantes únicos ni inicios de checkout. Un registro en
`distributor_referrals` se crea únicamente después de insertar una orden en
`storefront_orders` con un código de distribuidor válido. Por eso esos registros
se presentan como **órdenes atribuidas**.

El funnel retirado calculaba aproximadamente:

```text
órdenes atribuidas con stage=converted ÷ total de órdenes atribuidas × 100
```

Esa fórmula era una tasa de pago de órdenes aproximada, no una conversión de
visitantes. El valor interno `qualified` se conserva solamente por compatibilidad
histórica. Actualmente puede asignarse cuando una orden previamente pagada se
cancela; no representa una calificación comercial definida y no debe mostrarse
como etapa del funnel.

### Eventos requeridos

| Evento | Momento de captura |
| --- | --- |
| `referral_link_clicked` | Al abrir un enlace válido de distribuidor. |
| `unique_visitor_recorded` | Primera sesión elegible deduplicada dentro de la ventana acordada. |
| `product_viewed` | Vista real de un producto atribuible. |
| `checkout_started` | Primera acción inequívoca que inicia el checkout. |
| `checkout_completed` | Creación confirmada de la orden. |
| `order_paid` | Confirmación confiable del pago por backend o webhook firmado. |
| `order_cancelled` | Cancelación confirmada de la orden. |
| `order_refunded` | Reembolso parcial o total confirmado. |

Cada evento debe incluir: ID del distribuidor; ID anónimo y rotatorio de visitante
o sesión; ID de orden cuando exista; timestamp UTC; fuente, medio y campaña; URL
de entrada normalizada; clave de idempotencia; versión de la regla y ventana de
atribución; y metadatos mínimos de consentimiento.

La deduplicación debe definir el alcance por evento y ventana. El identificador
anónimo no puede derivarse de datos personales reversibles. Deben respetarse el
consentimiento, la retención mínima y las solicitudes de privacidad. El tráfico
interno, previsualizaciones, monitores y bots conocidos debe excluirse antes de
agregar métricas. La identidad entre dispositivos no debe fusionarse sin una
señal autenticada o consentimiento explícito.

El funnel no debe volver a la interfaz hasta validar clics reales, visitantes
únicos, inicio de checkout, orden completada o pagada, reglas consistentes de
atribución y una fórmula basada en visitantes reales.

## English

### Current state

The portal does not measure clicks, unique visitors, or checkout starts. A row
in `distributor_referrals` is created only after an order is inserted into
`storefront_orders` with a valid distributor code. Those rows are therefore
presented as **attributed orders**.

The removed funnel approximately calculated:

```text
attributed orders with stage=converted ÷ total attributed orders × 100
```

That formula approximated an order payment rate, not visitor conversion. The
internal `qualified` value remains only for historical compatibility. It can
currently be assigned when a previously paid order is cancelled; it is not a
defined commercial qualification and must not be presented as a funnel stage.

### Required events

| Event | Capture point |
| --- | --- |
| `referral_link_clicked` | A valid distributor link is opened. |
| `unique_visitor_recorded` | The first eligible deduplicated session inside the agreed window. |
| `product_viewed` | A real attributable product view. |
| `checkout_started` | The first unambiguous action that starts checkout. |
| `checkout_completed` | Confirmed order creation. |
| `order_paid` | Reliable backend or signed-webhook payment confirmation. |
| `order_cancelled` | Confirmed order cancellation. |
| `order_refunded` | Confirmed partial or full refund. |

Every event must include the distributor ID; a rotating anonymous visitor or
session ID; order ID when available; UTC timestamp; source, medium, and campaign;
normalized entry URL; idempotency key; attribution rule and window version; and
the minimum required consent metadata.

Deduplication must define its scope per event and time window. Anonymous IDs
must not be derived from reversible personal data. Consent, minimum retention,
and privacy requests must be honored. Internal traffic, previews, monitors, and
known bots must be removed before metrics are aggregated. Cross-device identity
must not be merged without an authenticated signal or explicit consent.

The funnel must not return to the interface until real clicks, unique visitors,
checkout starts, completed or paid orders, consistent attribution rules, and a
visitor-based conversion formula have all been validated.
