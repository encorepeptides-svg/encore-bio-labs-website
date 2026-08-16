# Métricas históricas y paginación del portal de distribuidores

## Auditoría del defecto anterior

`src/lib/distributorPortal.ts` descargaba primero una muestra y después calculaba las tarjetas en el navegador:

| Fuente | Límite anterior (socio / admin) | Métrica afectada |
| --- | ---: | --- |
| `distributor_referrals` | 250 / 500 | Órdenes atribuidas |
| `distributor_sales` | 250 / 500 | Ingreso atribuible y cualquier total de ventas |
| `distributor_payouts` | 100 / 250 | Pagado históricamente |
| `distributor_adjustments_public` | 250 / 500 | Comisión neta mostrada por venta |

Las fórmulas anteriores eran:

- Órdenes atribuidas: `dashboard.attributedOrders.length`.
- Ingreso atribuible: suma de `original_commissionable_revenue_cents` de las ventas visibles no anuladas.
- Pagado históricamente: suma de `amount_cents` de los payouts visibles con estado `paid`.
- Comisión pendiente: `max(balance.net_commission_cents - paid_visible, 0)`.
- Lista para pago y recuperación pendiente: vista `distributor_commission_balances` (estas dos ya usaban el conjunto contable completo).
- Comisión neta por venta: comisión original más los ajustes visibles con la misma referencia de pedido.

La nueva implementación conserva las consultas limitadas únicamente para listados. Ninguna tarjeta usa `items.length`, `filter()` o `reduce()` sobre una página.

## Fuentes de verdad y definiciones

La función `get_distributor_dashboard_metrics` devuelve una sola instantánea coherente y respeta RLS.

| Métrica | Fórmula PostgreSQL | Fecha para periodo |
| --- | --- | --- |
| Órdenes atribuidas | Conteo exacto de `distributor_referrals` | `referral.created_at` |
| Órdenes atribuidas pagadas | Referrals para los que existe una fila única en `distributor_sales` | Cohorte por `referral.created_at` |
| Órdenes reembolsadas | Referrals con una venta y un movimiento `partial_refund_reversal` o `full_refund_reversal` | Cohorte por `referral.created_at` |
| Ventas totales | Conteo exacto de `distributor_sales` en la moneda solicitada | `sale.paid_at` |
| Ingreso bruto atribuible | Suma de `original_commissionable_revenue_cents` | `sale.paid_at` |
| Reembolsos | Suma de `refunded_commissionable_revenue_cents` | `sale.paid_at` |
| Ingreso neto atribuible | Suma de `max(original_commissionable - refunded_commissionable, 0)` | `sale.paid_at` |
| Comisión original | Ledger: `commission_earned` + `legacy_balance` | `ledger.created_at` |
| Ajustes positivos | Ledger: `manual_positive_adjustment` + `chargeback_reversal` | `ledger.created_at` |
| Ajustes negativos | Valor absoluto de `manual_negative_adjustment` + `chargeback` | `ledger.created_at` |
| Comisión neta | Suma firmada de todo el ledger | `ledger.created_at` |
| Comisión pendiente | Neto completo del ledger ligado a ventas `pending`, menos créditos ya asignados a payouts | Saldo actual, todo el historial |
| Comisión aprobada | Neto completo del ledger ligado a ventas `approved`, menos créditos ya asignados a payouts | Saldo actual, todo el historial |
| En payouts | Suma neta de payouts `draft` o `processing` | `payout.created_at` |
| Pagado históricamente | Suma de `distributor_payouts.amount_cents` sólo con `status = paid` | `payout.paid_at` |
| Recuperación pendiente / pagable | `distributor_commission_balances` | Saldo actual, todo el historial |
| Tasa de pago | `órdenes atribuidas pagadas / órdenes atribuidas × 10,000` basis points | Cohorte por `referral.created_at` |

Los ingresos son ingresos comisionables de producto después de descuentos. Impuestos y envío no forman parte del ingreso atribuible. Todos los importes son enteros en centavos. La moneda predeterminada y actualmente usada por el portal es USD; una consulta no mezcla monedas.

No se expone “órdenes canceladas” como métrica exacta porque el modelo público del distribuidor no conserva una clasificación histórica confiable que diferencie cancelación antes y después de pago. Usar `referral.stage = rejected` habría inventado equivalencia. Los reembolsos y contracargos sí tienen fuentes contables inmutables y se muestran.

## Periodos y zona horaria

Todos los filtros SQL son rangos semiabiertos: `created_at >= start_at AND created_at < end_at`. Los valores se almacenan y comparan como `timestamptz` UTC. La presentación usa `America/Denver` (MST/MDT), que maneja automáticamente cambios de horario de verano. El portal actual consulta todo el historial; los parámetros `start_at` y `end_at` ya permiten agregar un selector de periodo sin filtrar páginas en el cliente.

Los saldos “pagable actualmente”, “recuperación pendiente”, “pendiente” y “aprobada” son fotografías contables actuales y permanecen de todo el historial aun cuando se consulte actividad de un periodo. Esta excepción es intencional y evita presentar un saldo parcial como si fuera pagable.

## Seguridad

Las seis funciones nuevas son `SECURITY INVOKER`, usan `search_path = ''`, requieren sesión autenticada y vuelven a validar el alcance solicitado:

- Un distribuidor queda forzado a `portal_distributor_id()`.
- Un `target_distributor_id` diferente produce `42501`.
- Sólo `portal_is_admin()` puede consultar un distribuidor específico distinto o el agregado global.
- RLS de las tablas subyacentes sigue aplicándose.
- `PUBLIC` y `anon` no pueden ejecutar las funciones; `authenticated` recibe únicamente `EXECUTE`.
- No se usa `user_metadata` ni `service_role` en el navegador.

## Paginación

RPC independientes:

- `get_distributor_referrals_page`
- `get_distributor_sales_page`
- `get_distributor_commissions_page`
- `get_distributor_adjustments_page`
- `get_distributor_payouts_page`

Cada función acepta `page_size`, cursor compuesto, rango y, donde corresponde, búsqueda. El backend rechaza tamaños fuera de `1..100`. Se solicitan `page_size + 1` filas para derivar `hasMore` sin ejecutar un conteo innecesario.

Orden estable: `created_at DESC, id DESC`.

El cursor de TypeScript es base64url de:

```text
<created_at ISO>|<uuid>
```

PostgreSQL continúa con:

```sql
where (created_at, id) < (cursor_created_at, cursor_id)
order by created_at desc, id desc
```

La interfaz carga 25 filas inicialmente, ofrece “Cargar más”, muestra carga/error/reintento/vacío, conserva la búsqueda y reinicia el cursor cuando la búsqueda cambia. Las tarjetas viven en un estado separado y no cambian al añadir páginas.

## Índices incrementales

La migración `20260816032838_distributor_historical_metrics_and_keyset_pagination.sql` agrega índices alineados con el acceso por propietario y el acceso global administrativo:

- `(distributor_id, created_at DESC, id DESC)` en referrals, ventas, ledger y payouts.
- `(created_at DESC, id DESC)` para las páginas globales administrativas.
- `(distributor_id, paid_at DESC) WHERE status = 'paid'` para la suma histórica de payouts pagados.

No se añadieron vistas materializadas ni cachés: primero se medirán los agregados directos.

## Reconciliación posterior a la migración

La cadena fue validada en el proyecto de staging `urusywsreprdmpxvyrun` y promovida a producción el 15 de agosto de 2026. Para futuras reconciliaciones por distribuidor, ejecutar:

```sql
with limited as (
  select
    (select count(*) from (
      select id from public.distributor_sales
      where distributor_id = :'distributor_id'::uuid
      order by paid_at desc limit 250
    ) rows) as visible_sales,
    (select coalesce(sum(amount_cents), 0) from (
      select amount_cents from public.distributor_payouts
      where distributor_id = :'distributor_id'::uuid and status = 'paid'
      order by created_at desc limit 100
    ) rows) as old_paid_cents
), complete as (
  select
    (select count(*) from public.distributor_sales where distributor_id = :'distributor_id'::uuid) as complete_sales,
    (select coalesce(sum(amount_cents), 0) from public.distributor_payouts where distributor_id = :'distributor_id'::uuid and status = 'paid') as complete_paid_cents
)
select * from limited cross join complete;
```

Y conciliar contabilidad:

```sql
select *
from public.distributor_ledger_reconciliation
where not exactly_one_original_credit
   or not reversal_within_original
   or original_commission_amount_cents <> ledger_original_credit_cents;
```

Resultado esperado: distribuidores con 251+ ventas mostrarán `complete_sales > visible_sales`; distribuidores con 101+ payouts pagados podrán mostrar `complete_paid_cents > old_paid_cents`. La RPC deberá coincidir con los valores completos, no con los limitados.

Resultado de la reconciliación ejecutada en staging con datos transaccionales que terminaron en `ROLLBACK`:

| Comprobación | Límite anterior | Conjunto completo / RPC |
| --- | ---: | ---: |
| Referrals | 250 | 600 |
| Ventas | 250 | 600 |
| Payouts pagados | 10,000 centavos | 10,100 centavos |
| Comisión neta del ledger | — | 1,496,550 centavos |
| Discrepancias del ledger | — | 0 |

Las 32 aserciones pgTAP pasaron en PostgreSQL remoto de staging, incluidas RLS, administrador, periodos semiabiertos, 250/251 ventas, 100/101 payouts y cursores con timestamps iguales.

## Plan de medición

Después de cargar datos representativos en staging:

```sql
explain (analyze, buffers)
select * from public.get_distributor_dashboard_metrics(:'distributor_id'::uuid, null, null, 'USD');

explain (analyze, buffers)
select * from public.get_distributor_sales_page(:'distributor_id'::uuid, 25, null, null, null, null, null);
```

Registrar tiempo de planificación/ejecución, buffers, filas descartadas y si el plan usa los índices `*_keyset_idx`. No se debe crear una tabla resumen hasta que estas mediciones demuestren una necesidad real y exista una estrategia explícita de invalidación.

Mediciones obtenidas en staging con 600 ventas:

| Consulta | Ejecución | Resultado relevante |
| --- | ---: | --- |
| `get_distributor_dashboard_metrics` | 33.664 ms | 1 fila; 9,117 bloques compartidos en caché |
| `get_distributor_sales_page` | 5.306 ms | 26 filas, incluida la fila de look-ahead |
| Acceso keyset subyacente | 0.624 ms | `Index Only Scan` sobre `distributor_sales_keyset_idx` |
