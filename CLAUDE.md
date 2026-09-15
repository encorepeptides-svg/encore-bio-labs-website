# Contexto de Encore Bio Labs — leer antes de trabajar

Este archivo, y no la memoria local de ninguna herramienta, es la fuente de
verdad. Héctor trabaja desde varias computadoras y con Claude, Codex y ChatGPT
indistintamente. Cualquier decisión que solo viva en la memoria de una máquina se
pierde en cuanto cambia de equipo o de herramienta.

**Regla operativa:** si aprendes algo duradero sobre este negocio —una decisión,
una preferencia, una restricción, un dato de infraestructura— escríbelo aquí y
haz commit. No lo guardes solo en memoria local.

---

## Cómo trabajar con Héctor

**Da siempre los pasos exactos.** Nunca "despliega como siempre" ni "agrégalo en
tu panel de DNS". Da la URL literal, el menú, el botón, el comando y cómo se ve
el resultado correcto. Verifica el setup real antes de escribir los pasos —revisa
el remoto de git, los nameservers, la ruta del dashboard— en vez de adivinar.
Numera los pasos, una acción por paso. Una instrucción vaga le cuesta una vuelta
completa de ida y vuelta.

**Todo cambio va en inglés y español.** Un cambio no está terminado hasta que
existe en los dos idiomas, con equivalencia en significado (español natural de
LATAM, no traducción literal), formato, enlaces (`path()`) y metadatos por
locale.

**Hay otro colaborador en la misma cuenta de git.** `encorepeptides-svg` /
`encorepeptides@gmail.com` lo usan dos personas, y editan los mismos archivos.
Haz `git pull --rebase` antes de cambios grandes, espera conflictos, y prefiere
su trabajo ya commiteado cuando cumple lo pedido en vez de sobrescribirlo.

---

## Infraestructura

Cuatro proveedores que no se conocen entre sí:

- **Hosting:** Vercel, proyecto `prj_Hx5vz5bPzufq2A1NhLe4sDvmXL9z`. El apex
  redirige 308 a `www`.
- **DNS:** **Wix** (`ns6/ns7.wixdns.net`). No es Vercel ni Cloudflare. Todo
  registro SPF/DKIM/DMARC o de verificación se agrega en el panel de Wix.
- **Correo:** Zoho (`mx.zoho.com`), remitente `support@encorebiolabs.com`, SMTP
  `smtppro.zoho.com:587` — endpoint solo de plan pago; el plan gratis bloquea SMTP.
- **Backend:** Supabase, ref `rrrkjohvxbsahxxevzcg`, plan Free, us-west-2.

**Trampa del CRM:** `/admin/crm` exige `app_metadata.role === 'crm_admin'` tanto
en la UI como en la política RLS `is_crm_admin()`. Ningún flujo de registro pone
ese claim — hay que aplicarlo por SQL, usuario por usuario.

**Trampa de los secretos:** `supabase secrets set --env-file` acepta valores
vacíos sin avisar, y en las funciones `Deno.env.get('X') || ''` hace que un
secreto vacío se comporte exactamente igual que uno ausente. Un archivo con
líneas en blanco deja los secretos "puestos" y la función igual de rota, sin
ningún error que lo delate. Para ver cuáles están vacíos, compara el digest
que imprime `supabase secrets list` contra el SHA-256 de la cadena vacía
(`e3b0c44298fc1c14...`).

### El historial de migraciones está desincronizado en las dos direcciones

**La carpeta `supabase/migrations/` NO describe el esquema de producción.** Al
15-sep-2026: 28 migraciones coinciden, **16 locales nunca se aplicaron** —son
de julio y agosto— y **38 se aplicaron en la base sin archivo local**, entre el
30-jul-2026 y el 06-sep-2026 (2 de julio, 31 de agosto, 5 de septiembre). Ese
segundo número es el que importa: alguien estuvo aplicando cambios de esquema
desde el panel de Supabase, así que el repo dejó de ser la fuente de verdad del
esquema de la base.

**Nunca corras `supabase db push` a secas.** Dispara las 16 pendientes —viejas
y sin revisar— contra un esquema que lleva dos meses derivando por su cuenta.
Cualquiera de ellas puede chocar con un cambio hecho desde el panel, o
deshacerlo en silencio.

**Para aplicar UNA sola migración**, córrela por la API de administración y
registra su versión a mano. Así se aplicó
`20260904120000_drop_body_composition_intake_requirements.sql`:

```bash
supabase db query --linked -f supabase/migrations/<archivo>.sql
supabase db query --linked "insert into supabase_migrations.schema_migrations (version, name) values ('<version>', '<nombre>') on conflict (version) do nothing"
```

Sin el segundo paso, `supabase migration list --linked` la sigue reportando
pendiente y el próximo `db push` la repite.

**El CLI no necesita la contraseña de Postgres.** `supabase link --project-ref
rrrkjohvxbsahxxevzcg --yes` enlaza sin pedirla, y `db query --linked` se
autentica con el access token contra la API de administración, no con
credenciales de la base. Si el CLI responde "Cannot find project ref", vuelve a
correr `link`: el archivo `supabase/.temp/linked-project.json` existe pero esta
versión del CLI no lo lee.

**Reconciliar sigue pendiente**, y es trabajo aparte: revisar las 16 locales una
por una —aplicar, borrar, o marcar como obsoletas— y bajar a archivos las 38
remotas con `supabase db pull`. Mientras tanto, cada `db push` es una trampa y
los comandos de arriba son la única vía segura.

---

## Tono y mensajería

**Embudo de dos niveles**, con tono deliberadamente distinto según la superficie.

**Sitio principal = agresivo.** Seguro, orientado a venta, guiado por beneficio,
directo. Titulares fuertes, CTAs prominentes, diferenciación por Complete Kit,
precios visibles, manejo de objeciones. Quita jerga de laboratorio que no ayuda a
decidir. Es el destino principal de conversión. Incluye home, catálogo,
categoría, producto, kits e intake.

**Pre-landers = suave.** Educativo, calmado, creíble, consistente con RUO y
consciente de la política de Google Ads. Titulares neutros, CTAs suaves,
contenido educativo real, sin presión de compra. Cada pre-lander enlaza a su
destino más relevante del sitio principal, nunca genéricamente al home. Cuando la
seguridad publicitaria y la conversión agresiva chocan, gana la seguridad.
**Todavía no existe ningún pre-lander.**

**Límites duros en ambos niveles** — agresivo no significa falso: nada de
resultados garantizados, testimonios o estudios inventados, escasez falsa,
estatus regulatorio tergiversado, afirmaciones de tratar o curar enfermedades, ni
dosificación personalizada pública.

---

## Decisiones tomadas

**KLOW es una mezcla de cuatro compuestos** (GHK-Cu, BPC-157, TB-500, KPV) en
todo el sitio — resuelto por el dueño. La mecánica de compra sigue siendo
`accessory` / Product Only, sin kit ni multipack; convertirlo en vial normal es
una decisión comercial separada que no se ha tomado.

**El hero del home es video a sangre completa**, no un elemento multimedia en
caja. Clases canónicas: `.home-hero-video-canvas`, `.home-hero-scrim`,
`.home-hero-atmosphere`. No reintroducir las variantes en caja
(`home-hero-video-stage`/`-media`) ni el naming paralelo `hero-bleed-*`.

**La calculadora reporta unidades de banco —µL, mL, mg/mL, µg/µL— y nunca
unidades de jeringa U-100** (decisión del dueño, 02-sep-2026; **revierte** la
decisión anterior de mostrar U-100). U-100 es una escala de jeringa de insulina
humana: reportar la transferencia ahí convierte matemática de preparación en
instrucción de administración dentro de un catálogo RUO, y era el activo de
mayor riesgo del sitio frente a un banco adquirente o a la FDA. El microlitro
lleva la misma información con más resolución, así que en el laboratorio no se
pierde nada.

`syringeUnits` y `massMgPerUnit` se eliminaron de `calculateAliquotPlan` en
`src/lib/portal/labCalculators.ts`; en su lugar está `microgramsPerMicroliter`.
Hay pruebas de regresión que fallan si esas llaves regresan, y otras que fallan
si aparece "U-100", "syringe" o "jeringa" en el render. No las quites.

El vocabulario de la interfaz también pasó de administración ("cuánto extraer",
"unidades", "fuerza") a laboratorio ("volumen de alícuota", "µL",
"concentración") en los dos idiomas, y el texto de límites ya no dice "sigue la
orientación de un profesional calificado" —eso presuponía uso humano.

**La calculadora NO es solo del portal.** También se renderiza en
`/protocols/<slug>`, que es una ruta pública sin sesión (`src/App.tsx`). Cualquier
cambio de cumplimiento aquí es cambio de cara pública, no interno.

La calculadora de dilución C₁V₁=C₂V₂ sigue fuera de la interfaz;
`calculateWorkingDilution` y `calculateStockConcentration` permanecen en el
archivo sin ningún consumidor en la UI.

**Se eliminaron las calculadoras de IMC y de cambio de peso** del portal
(decisión del dueño, 04-sep-2026). Vivían en
`src/components/portal/sections/CalculatorsSection.tsx` junto a la calculadora de
alícuotas. Calcular el IMC de una persona, o su cambio porcentual de peso, es
seguimiento de desenlace humano y no trabajo de laboratorio —y el cambio
porcentual de peso es exactamente el endpoint que reportan los ensayos de GLP-1,
así que en un catálogo RUO era la herramienta más difícil de defender del portal.
La sección ahora solo contiene la calculadora de alícuotas. **No devuelvas
herramientas de composición corporal al portal.**

Se borraron sus llaves exclusivas (`bmiTitle`, `bmiHeightIn`, `bmiResult`,
`changeTitle`, `changeNet`, `changePercent`) en los dos idiomas.

**El portal ya no registra composición corporal ni apetito** (decisión del
dueño, 04-sep-2026). Se quitaron de la interfaz: estatura, peso inicial, peso
actual y cintura del onboarding; peso y cintura de `ProgressSection` y
`CheckInsSection`; la calificación de apetito del onboarding y del check-in
semanal; y los cuatro mosaicos de medidas más el apetito de
`IntakeResultsSection`. El apetito era el peor de todos: la supresión del
apetito es el efecto farmacológico principal de un GLP-1, así que registrarlo
por cliente y a lo largo del tiempo documenta consumo humano.

Quedan energía, sueño, estrés, bienestar, agua y notas —son bienestar genérico,
no composición corporal.

**El paso 1 del onboarding ahora es solo fecha de nacimiento.** La verificación
de edad (18+) sí es un requisito RUO legítimo y se queda. También desapareció el
selector de unidades imperial/métrico: solo existía para estatura, peso y
cintura.

**Esto obligó a una migración.** `portal_client_intake_is_complete` exigía
`starting_weight_kg`, `current_weight_kg`, `waist_cm`, `height_cm` y
`appetite_rating`, y esa función bloquea tanto `submit_portal_onboarding` como
el trigger `require_complete_intake_before_activation`. Quitar los campos sin
tocar la función habría dejado a **todo registro nuevo permanentemente
incompleto**, sin auto-aprobación y sin mensaje de error útil. La migración es
`20260904120000_drop_body_composition_intake_requirements.sql`.

**Las columnas NO se borran** —misma lógica que `local_chihuahua` y
`import_fee_cents`. `onboarding_profiles.height_cm/starting_weight_kg/`
`current_weight_kg/waist_cm/appetite_rating` y las llaves `weight_kg`/`waist_cm`
dentro del JSONB `measurements` de `progress_entries` y `weekly_checkins` siguen
existiendo con los valores históricos. El portal ya no las lee ni las escribe.
**Purgar esa información guardada es una decisión aparte que el dueño no ha
tomado** —y es irreversible, así que no la tomes tú.

**Se eliminó el campo "Peso objetivo" (`goalWeight`) del intake público**
(decisión del dueño, 04-sep-2026). Era el peor elemento del sitio: no existe
lectura de investigación para preguntarle a un cliente su peso objetivo —un
laboratorio que compra un estándar de referencia no tiene uno—, así que ese
campo solo convertía la tienda en una consulta de pérdida de peso sin clínico.

Se quitó de `IntakeFormData` y de `CustomerLead` en `src/data/intake.ts`, del
estado inicial, de la validación del paso 1, de `createLeadFromIntake`, del
campo en `IntakePage.tsx`, de la columna y del detalle en `AdminLeadsPage.tsx`,
y de las llaves de los dos idiomas. **Nunca se guardó en la base**: `leadToRow`
en `src/lib/crmStorage.ts` no lo mapeaba y no hay columna `goal_weight`, así
que no hubo migración ni datos históricos que conservar.

**Se eliminó el bloque completo de biometría del intake público** (decisión del
dueño, 04-sep-2026). Ya no existe la pregunta "¿tienes tus medidas?"
(`biometricsStatus`) ni los campos que revelaba: edad, sexo, estatura y peso
actual. También se borraron `bodyFat`, `waist` y `activityLevel`, que estaban en
los tipos pero nunca se mostraron. El paso 2 del intake ahora pregunta solo por
enfoque actual, actividad, sueño, energía y experiencia.

`IntakeFormData` ya no tiene ninguno de esos campos. En `CustomerLead` **sí se
dejaron como opcionales** (`age?`, `sex?`, `height?`, `currentWeight?`,
`bodyFat?`, `waist?`, `activityLevel?`) porque hay leads viejos guardados en
localStorage que los traen y `mapLegacyLead` en `src/lib/crmStorage.ts` todavía
los migra al CRM. `createLeadFromIntake` nunca los escribe.

`crm_intake_submissions` conserva sus columnas `age/sex/weight/height` y el
cajón de detalle del CRM (`LeadDetailDrawer.tsx`) las sigue leyendo para las
solicitudes históricas; el intake nuevo manda cadenas vacías. No hizo falta
migración: todas esas columnas tienen `default ''` o son nulables.

En `AdminLeadsPage.tsx` se quitó la columna "Current weight" de la tabla y la
sección "Biometrics" pasó a llamarse "Disclosures" con solo medicamentos y
sensibilidades.

El `biometricsBoost` del puntaje de confianza (4 puntos por haber compartido
medidas) se reemplazó por `researchFocusBoost`, que da los mismos 4 puntos por
haber indicado un enfoque de investigación. El rango del puntaje no cambia.

**Las metas del portal ya no dicen "seguimiento"** (05-sep-2026). `goalWeight` y
`goalBodyComp` pasaron a "Metabolic research interest" / "Body-composition
research interest" (y sus equivalentes en español) porque el portal dejó de
rastrear esas dos cosas: seguir prometiendo "tracking" era simplemente falso.
Las otras cuatro metas conservan "tracking" porque energía, bienestar,
recuperación y documentos sí siguen existiendo.

**Solo cambiaron las etiquetas, no los valores.** En la base se siguen guardando
`weight-management` y `body-composition`; renombrar el valor reescribiría lo que
respondieron clientes anteriores. Misma razón por la que las etiquetas nuevas se
mantienen cerca del significado original en vez de convertirse en otra cosa.

Pendiente y sin decidir: en el intake público, la pregunta "¿En qué te estás
enfocando ahora?" sigue ofreciendo estados personales (peso, energía, sueño,
recuperación…) en vez de áreas de investigación. Reformular la pregunta y sus
siete opciones es el cambio de redacción más grande que queda.

**El checkout exprés de WhatsApp cobra 5% por pago contra entrega, y solo a
México.** El cliente elige forma de pago *antes* de abrir WhatsApp: Zelle, Cash
App, PayPal, Apple Pay y transferencia bancaria mexicana (SPEI) van sin recargo;
contra entrega agrega 5% sobre la mercancía después de promociones —nunca sobre
envío ni importación— igual que `calculatePaymentProcessingFeeCents` en el
servidor. Contra entrega se ofrece solo a destinos mexicanos (México y la
ciudad local de Ciudad Juárez), no a Estados Unidos ni a El Paso, y nunca en
pedidos de recolección.

El exprés también junta la dirección completa con formato del país destino, para
poder imprimir la etiqueta sin ida y vuelta. La etiqueta se escribe en el idioma
del **destino**, no del comprador: una etiqueta mexicana dice `Col.`, `C.P.`,
`México` y `Referencias` aunque el cliente navegue en inglés. Va dentro de un
bloque monoespaciado de WhatsApp para copiarla completa. **Este camino no
escribe ninguna fila en `storefront_orders`** —por eso el folio lleva prefijo
`EXP-`, no hay nada que buscar en el portal.

**La CLABE mexicana nunca se publica en el sitio** —decisión del dueño. El riel
va marcado `detailsInChat` en `src/lib/storefront/expressCheckout.ts`: el cliente
lo elige, el mensaje pide la cuenta, y la CLABE con el titular se manda por
WhatsApp pedido por pedido. Deja `details: []` en `bank_transfer` dentro de
`src/config/interimCheckout.ts`; el checkout completo lee la misma entrada y sí
publicaría lo que se agregue ahí.

**Efectivo al recoger no cobra recargo.** El 5% paga la cobranza del repartidor,
y en una recolección no hay repartidor. Contra entrega no se ofrece en pedidos de
recolección, y efectivo al recoger no se ofrece en pedidos con envío.

**Se cotiza un total exacto solo cuando todo es determinista** —`expressPayableCents`.
Eso pasa cuando el envío es comprobablemente cero (recolección, o pedido que ganó
envío gratis); ahí el mensaje dice `TOTAL A PAGAR` y los enlaces de Cash App y
PayPal llevan el monto precargado. Si falta una tarifa de paquetería o una cuota
local, devuelve `null` y todo sigue diciendo "se confirma en el chat".

**En Chihuahua se sigue vendiendo; lo que se quitó es el inventario local**
(decisión del dueño, 28-ago-2026). La distribución local —recolección y entrega
a domicilio desde stock propio— queda solo en **El Paso y Ciudad Juárez**. Un
cliente de la ciudad de Chihuahua elige **México** en el checkout y su pedido
sale por paquetería rastreada con la misma cuota de importación y los mismos
beneficios por monto de compra. No es una retirada del mercado: no escribas
copy que sugiera que ya no atendemos Chihuahua. Se quitó la opción local de los
dos checkouts, de la página de envíos y de los destinos aceptados por
`shipping-checkout`.

**Pero `local_chihuahua` NO se borra del código.** Sigue en el tipo
`DeliveryDestination`, en `coverageFor` de la edge function y en el CHECK de
`destination_type`, porque los pedidos anteriores traen ese valor y el portal de
admin tiene que poder leerlos. Quitarlo del CHECK invalidaría filas ya guardadas.

---

## Escalera de beneficios por compra

$200 envío gratis · $300 10% · $500 15% · $1,000 20%. El carrito calcula y muestra
cuánto falta para el siguiente escalón. Implementado en `src/lib/promotions.ts` y
duplicado en `supabase/functions/shipping-checkout` — **los dos deben moverse
juntos**, el servidor es la autoridad del total.

**Envío plano a México: USD $20 a todo el país** (subió de $15 el 28-ago-2026).
Es `MEXICO_FLAT_SHIPPING_CENTS`, y como la escalera, está **duplicado** en
`src/lib/shipping.ts` y en `supabase/functions/shipping-checkout` — muévelos
juntos. La promoción de envío gratis desde $200 lo cancela. Los pedidos locales
no lo pagan: tienen su propia tarifa de entrega (recoger gratis, domicilio $10).

**Todo pedido se envía express de 2 días, salvo pago contra entrega**
(decisión del dueño, 01-sep-2026). Es `shippingServiceFor(cashOnDelivery)` en
`src/lib/shipping.ts`. Contra entrega va en servicio estándar porque el
repartidor cobra en la puerta y esa red no corre express.

**Express es una instrucción de despacho, no un precio.** Debajo de los $200 el
cliente sigue viendo y pagando la tarifa más barata que devolvió la paquetería, y
**Encore absorbe la diferencia** —el dueño lo eligió así explícitamente para que
el envío nunca se le encarezca a nadie. Por eso el checkout solo preselecciona la
tarifa express cuando el envío ya es gratis ($200+), donde no le cuesta nada al
cliente. El mensaje de WhatsApp sí lleva `Servicio: EXPRESS de 2 días` para que
sepas qué contratar.

**El express salió de la escalera de promociones.** Ya no se gana por monto: el
flag `express` de `PROMOTION_TIERS` se eliminó y los niveles de $300/$500/$1,000
son solo descuento. No hace falta guardar nada en la base — contra entrega ya
está en `payment_method`, así que el servicio se deduce de cualquier orden.

**La cuota de importación a México se eliminó** (28-ago-2026). Ya no existe el
cargo de $25/$50 por número de kits: un pedido a México paga flete y nada más.
Se borraron `calculateMexicoImportFeeCents` y `destinationUsesMexicoImportFee`.

**Pero el campo `importFeeCents` / `import_fee_cents` se queda en cero**, no se
borra. Las órdenes creadas mientras la cuota existía traen montos reales ahí y el
portal de admin las muestra. Misma lógica que con `local_chihuahua`: se deja de
cobrar, no se pierde la capacidad de leer el historial.

---

## Proyecto hermano

El agente conversacional de ventas vive en
`github.com/encorepeptides-svg/encore-closeos` (privado). Su propio `CLAUDE.md`
tiene el contexto de ese lado.

---

## Espejo en Google Drive

La carpeta **AI** en el Drive de Encore tiene el contexto maestro legible desde
cualquier dispositivo:
https://drive.google.com/drive/folders/1qe7iMYrfBMHLu72v5DO4HZGMRM8OFmwE

Ese espejo es para consulta humana y para ChatGPT conectado a Drive. **Este repo
sigue siendo la fuente de verdad**: si algo se contradice, gana lo que está aquí.
