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

**La calculadora del portal muestra unidades de jeringa U-100** (1 unidad = 10
µL), no microlitros. El dueño lo indicó con el conflicto de cumplimiento
señalado y reconocido: `AGENTS.md` prohíbe enmarcar dosis o inyección, y el texto
de límites del portal decía que la herramienta NO daba unidades de jeringa. Ese
texto se reescribió para coincidir. Es contenido adyacente a dosificación humana
en un sitio RUO y carga riesgo de plataforma — no "restaurar" el texto anterior
sin consultar. También se eliminó la calculadora de dilución C₁V₁=C₂V₂.

---

## Escalera de beneficios por compra

$200 envío gratis · $300 10% · $500 15% · $1,000 20%. El carrito calcula y muestra
cuánto falta para el siguiente escalón. Implementado en `src/lib/promotions.ts` y
duplicado en `supabase/functions/shipping-checkout` — **los dos deben moverse
juntos**, el servidor es la autoridad del total.

---

## Proyecto hermano

El agente conversacional de ventas vive en
`github.com/encorepeptides-svg/encore-closeos` (privado). Su propio `CLAUDE.md`
tiene el contexto de ese lado.
