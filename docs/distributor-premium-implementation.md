# Portal premium de distribuidores

## Resultado

El portal separa la experiencia de socios de la experiencia de clientes y convierte atribución, ventas, comisiones, pagos y crecimiento en un único producto operativo bilingüe. La comisión base para nuevas cuentas es 25% (`2500` puntos base); las reglas por producto, colección o socio son versionadas y cada venta conserva el snapshot aplicado.

## Acceso y seguridad

- Entrada exclusiva: `/es/distributor/login` y `/distributor/login`.
- Recuperación y activación exclusivas para socios; no se ofrece crear una cuenta de cliente.
- Autorización por membresía y estado del distribuidor, además de RLS en todas las tablas nuevas.
- MFA TOTP y nivel AAL2 para operaciones administrativas de alto riesgo.
- Cuentas suspendidas o archivadas no pueden operar el portal.
- Recursos privados se entregan mediante URL firmada de duración corta.
- Eventos de seguridad, cambios de reglas, documentos, pagos y aclaraciones quedan auditados.

## Atribución y privacidad

El modelo es `last_valid_touch` dentro de una ventana configurable. Los enlaces contienen código del distribuidor, ID de enlace, campaña, canal, idioma, Sub-ID y UTM. Checkout conserva esos datos y el servidor genera los eventos definitivos de pedido completado, pagado, cancelado, reembolsado o contracargado.

Eventos medidos:

1. `referral_click`
2. `product_viewed`
3. `checkout_started`
4. `checkout_completed`
5. `order_paid`
6. `order_cancelled`
7. `order_refunded`
8. `order_chargeback`

Cada evento usa una llave idempotente. El endpoint público filtra bots, orígenes no aprobados y tráfico interno. Analítica no esencial requiere consentimiento. Se guardan identificadores anónimos de visitante y sesión; no se guarda IP completa ni PII del comprador en la tabla de eventos.

## Métricas

- Visitantes únicos: `count(distinct anonymous_visitor_id)` de eventos consentidos.
- Conversión visitante → checkout: `checkouts / visitantes únicos`.
- Conversión checkout → pago: `pedidos pagados / checkouts`.
- Conversión visitante → pago: `pedidos pagados / visitantes únicos`.
- Ventas netas atribuidas: ventas brutas menos reembolsos reconciliados.
- Comisión neta: libro mayor de comisión ganada menos reversos y ajustes.
- Un denominador igual a cero produce `null`, nunca una cifra inventada.
- Un ganador solo aparece al superar el mínimo de pedidos configurado.
- No se reconstruye tráfico histórico que no fue observado.

## Experiencia del socio

- Dashboard personalizado con periodos de 30/90/365/400 días.
- Estados financieros separados: disponible, pendiente, en pago, ajustes y pagado.
- Progreso al mínimo, próxima fecha o razón verificable por la que aún no existe.
- Embudo, ventas atribuidas, conversión y mejores producto/campaña/canal.
- Recomendación de siguiente acción y responsable de éxito asignado.
- Centro de crecimiento para campañas, enlaces, Sub-ID, UTM, QR, recursos y copy aprobado.
- Reporte completo filtrable con exportación CSV segura y PDF.
- Notificaciones, aclaraciones trazables y comprobantes de pago inmutables.
- Navegación responsive y paridad funcional español/inglés.

## Operación administrativa

- Configuración de mínimo, hold, calendario, ventana, umbral de ganador y feature flags.
- Reglas de comisión efectivas y versionadas, con exclusión explícita y base 25%.
- Costos internos versionados y reporte de rentabilidad solo para administración.
- Biblioteca privada de materiales aprobados.
- Responsables de socios y asignaciones.
- MFA administrativo disponible; el enforcement global permanece apagado hasta que todos los administradores hayan inscrito un factor.

## Validación y despliegue — 16 de agosto de 2026

- Staging: migraciones completas aplicadas.
- SQL: 32/32 pruebas históricas y 30/30 pruebas premium aprobadas.
- Aplicación: 545/545 pruebas aprobadas.
- TypeScript, lint y build de producción aprobados; lint sin errores.
- Atribución E2E: primer evento aceptado, duplicado reconocido y una sola fila persistida; fixture eliminada.
- Reconciliación en staging y producción: cero pedidos, ventas, asientos, recibos o eventos huérfanos.
- `EXPLAIN ANALYZE`: `distributor_events_type_range_idx` y `distributor_links_keyset_idx` seleccionados; ejecución sobre las tablas vacías menor a 1 ms.
- Advisors en el alcance nuevo: cero errores críticos. Los avisos restantes son RPC `security definer` con control interno, índices sin uso por ausencia de datos y políticas permisivas separadas.
- Producción: esquema premium y funciones `distributor-attribution` y `shipping-checkout` promovidos.

## Pendientes operativos reales

- Cargar los primeros recursos y textos aprobados en la biblioteca.
- Asignar responsables de socios.
- Inscribir MFA en las cuentas administrativas y luego habilitar enforcement global.
- Confirmar proveedor externo y referencia de pagos si se automatizan transferencias; mientras tanto el estado se muestra como manual, nunca como pagado sin comprobante.
- Configurar alertas externas si se desea correo además de notificaciones internas.

## Rollback

El frontend conserva feature flags para dashboard premium, analítica, Growth Center, aclaraciones y reglas. Ante un incidente se desactiva primero la función afectada; no se borra el libro mayor ni se reescribe el historial. Las reglas y recibos son append-only para mantener la trazabilidad.
