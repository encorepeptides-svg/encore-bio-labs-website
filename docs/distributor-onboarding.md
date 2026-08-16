# Distributor onboarding / Alta de distribuidores

## Español

### Causa original

El endpoint anterior `communications: distributor_invite` ejecutaba `inviteUserByEmail` antes de insertar `distributor_accounts` y su auditoría. Supabase Auth podía crear el usuario y enviar el correo, pero un conflicto de código, error de RLS/base de datos o fallo de auditoría posterior dejaba un usuario de Auth sin perfil de distribuidor. El endpoint legado ahora rechaza esa acción y dirige al procesador recuperable.

### Fuente de verdad y estados

`distributor_accounts.onboarding_status` es el estado operativo canónico:

`draft → invite_pending → invited → email_accepted → documents_complete → payment_configured → approved → active`

Estados terminales o administrativos: `expired`, `revoked`, `rejected`, `suspended`; la reactivación permitida es `suspended → active`. El estado comercial legado de la cuenta se deriva de este flujo. No existe transición directa de pago a activo ni autoaprobación.

El significado es estricto:

- `invited`: el correo fue entregado, no sólo generado.
- `email_accepted`: Auth confirmó el correo y la sesión pertenece al usuario vinculado.
- `password_configured_at`: sólo se registra después de `auth.updateUser({ password })` y la función verifica que Auth tenga contraseña; el backend nunca recibe la contraseña.
- `documents_complete`: formulario fiscal y acuerdo de distribución existen en el bucket privado, cumplen tipo/tamaño/ruta y están completos. `submitted`, `complete`, `approved` y `rejected` son estados separados por documento.
- `payment_configured`: un administrador confirma el proveedor externo, su referencia y opcionalmente los últimos cuatro caracteres. No se guarda cuenta bancaria, routing number o tarjeta.
- `approved`: acción explícita de administrador; exige ambos documentos aprobados y proveedor configurado.
- `active`: acción explícita posterior. Sólo aquí se habilitan enlaces, ventas, comisiones y pagos.

### Outbox y recuperación

`admin_begin_distributor_invitation` es una sola transacción SQL que crea perfil, invitación, evento inmutable y trabajo de outbox. Después del commit, `distributor-onboarding`:

1. reclama trabajo con `FOR UPDATE SKIP LOCKED`;
2. localiza o crea/vincula el usuario de Auth por correo verificado;
3. usa `auth.admin.generateLink` sin enviar por el SMTP de Auth;
4. guarda sólo SHA-256 de una referencia del token;
5. envía el enlace por Zoho;
6. cambia a `invited` sólo después de entrega exitosa.

Fallos de Auth o correo conservan perfil, invitación y auditoría. El trabajo se reintenta con backoff exponencial, máximo de ocho intentos y resultado `completed`, `already_completed`, `pending`, `blocked` o `failed`. El administrador puede usar **Retry pending work / Reintentar trabajo pendiente**. Reenvíos tienen enfriamiento de diez minutos y límite de veinte.

Revocar o suspender elimina las sesiones de `auth.sessions`; un access token ya emitido puede sobrevivir hasta su expiración, por lo que RLS además exige estado `active` en cada acceso protegido. Borrar el usuario no se usa como mecanismo de revocación.

### Seguridad y RLS

- Las vistas nuevas usan `security_invoker = true`.
- Las tablas nuevas tienen RLS y grants explícitos.
- Distribuidores sólo leen su cuenta, invitación, eventos, documentos y estado mínimo del proveedor.
- El bucket `distributor-onboarding-private` es privado, limita a 10 MB y permite PDF/JPEG/PNG.
- La carga se autoriza por `auth.uid()` vinculado y estado de onboarding; no por `user_metadata`.
- Las tablas de ventas, comisiones, ajustes y pagos continúan resolviendo el distribuidor mediante `portal_distributor_id()`, que ahora devuelve una cuenta únicamente si ambos estados son `active`.
- Los campos protegidos no tienen `UPDATE` directo para `authenticated`; cambian mediante funciones validadas.
- Los eventos de onboarding son append-only; un trigger rechaza `UPDATE` y `DELETE`.
- Las funciones privilegiadas de servicio revocan ejecución de `public`, `anon` y `authenticated`; las funciones de usuario validan propiedad o rol de administrador.
- `SUPABASE_SERVICE_ROLE_KEY`, enlaces y tokens nunca entran en el bundle del navegador, tablas o logs.

### Conciliación histórica

La migración conserva cuentas existentes:

- `active`, `suspended` y `archived` conservan evidencia equivalente.
- cuentas `pending` se mapean con evidencia de confirmación de Auth y se agregan a revisión manual; no se activan automáticamente;
- usuarios Auth marcados históricamente como invitaciones de distribuidor sin perfil se registran como `auth_orphan`;
- perfiles sin usuario se registran como `profile_orphan`;
- no se elimina automáticamente ningún usuario histórico.

Use `distributor_onboarding_reconciliation_v` para el reporte de revisión. La resolución de incidencias históricas es manual y debe quedar auditada antes de aprobar o activar.

### Despliegue seguro y configuración manual

No se desplegó producción desde esta tarea. El proyecto Supabase conectado todavía no contiene la cadena base de distribuidores, así que aplicar sólo esta migración fallaría y sería inseguro. Orden requerido:

1. aplicar `20260812203548_distributor_portal_phase1.sql`;
2. aplicar `20260815185000_add_distributor_sale_reversed_status.sql`;
3. aplicar `20260815185425_distributor_commission_accounting_ledger.sql`;
4. aplicar `20260815200011_distributor_onboarding_outbox.sql`;
5. desplegar `distributor-onboarding` con `verify_jwt = true`;
6. configurar `PORTAL_SITE_URL`, `ZOHO_MAIL_ACCOUNT_ID`, `ZOHO_FROM_EMAIL`, `ZOHO_OAUTH_CLIENT_ID`, `ZOHO_OAUTH_CLIENT_SECRET`, `ZOHO_OAUTH_REFRESH_TOKEN` y, si aplica, `ZOHO_ACCOUNTS_HOST` como secretos del servidor;
7. registrar `/distributor/reset-password` y `/es/distributor/reset-password` como redirect URLs autorizadas de Supabase Auth;
8. verificar las plantillas bilingües del correo de recuperación existente en Supabase Auth/custom SMTP;
9. ejecutar Security y Performance Advisors después de aplicar toda la cadena y resolver cualquier aviso nuevo antes del lanzamiento;
10. ejecutar pruebas reales en staging de correo entregado, enlace usado/expirado, subida privada, confirmación de proveedor, revocación y reactivación.

La CLI local no pudo levantar Supabase porque Docker no estaba activo. Los asesores remotos sólo representan el esquema anterior: reportaron problemas existentes, incluidos dos errores de vistas `SECURITY DEFINER`, que no pertenecen a estas migraciones nuevas y deben corregirse por separado.

### Verificación incluida

`src/lib/distributorOnboarding.test.ts` contiene 34 regresiones del contrato, incluyendo fallos parciales, duplicados, reintentos, expiración, documentos, pago, aprobación, RLS, conciliación y ausencia de secretos. La suite completa y el build deben pasar antes de despliegue.

## English

The former communications endpoint created/sent the Supabase Auth invitation before inserting the distributor profile and audit row, which caused Auth orphans when later database work failed. The new SQL transaction commits profile, invitation, immutable event, and outbox first; the server worker then links Auth, generates an in-memory action link, sends bilingual branded email, and marks `invited` only after delivery.

The canonical sequence is `draft → invite_pending → invited → email_accepted → documents_complete → payment_configured → approved → active`, with audited `expired`, `revoked`, `rejected`, and `suspended` states. Sales tools and financial data require `active` in both UI routing and RLS.

Failures preserve durable state and retry safely. Documents use a private bucket and separate submitted/complete/approved statuses. Payout setup stores only a provider reference, status, and optional last four characters. Approval and activation are separate administrator actions; revocation/suspension queue session removal while state-aware RLS provides immediate data blocking.

Production was not changed. Apply all distributor migrations in timestamp order, deploy the JWT-protected Edge Function, configure the server-only Zoho and portal URL secrets, authorize both locale callback URLs, verify bilingual Auth recovery templates, rerun Supabase Security/Performance Advisors, review reconciliation issues, and complete staging end-to-end tests before launch.

Official references: [generateLink](https://supabase.com/docs/reference/javascript/auth-admin-generatelink), [password updates](https://supabase.com/docs/guides/auth/passwords), [sessions and JWT revocation behavior](https://supabase.com/docs/guides/auth/sessions), [RLS](https://supabase.com/docs/guides/database/postgres/row-level-security), and [database advisors](https://supabase.com/docs/guides/database/database-advisors).
