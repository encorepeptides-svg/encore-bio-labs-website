# Encore Bio Labs production conversion audit

Scope: production `main` branch, current homepage direction preserved. This report records the pre-fix behavior and the recommended disposition. Only Priority 0 and Priority 1 items are implemented in this pass.

## Priority 0 — Broken purchase flow

| File or component | Current behavior | Why it hurts conversions | Recommended fix | Risk | Complexity |
|---|---|---|---|---|---|
| `src/App.tsx` (`/cart`) | `/cart` is not routed and silently renders the homepage fallback. | A customer or campaign link to a standard cart URL loses the cart context and appears broken. | Route `/cart` to the existing cart/checkout review experience. | Low | Low |
| `src/components/checkout/CheckoutPage.tsx` | “Submit cart review” immediately clears the cart and shows success without saving an order or inquiry. | The business receives nothing while the customer believes the request was submitted. | Persist a CRM inquiry before clearing the cart; retain the cart and show an error if persistence fails. | High | Medium |
| `src/components/checkout/CheckoutPage.tsx` | Submission has no loading or failure state. | Double submission and silent failure are possible; the customer cannot recover confidently. | Add submitting, error, validation, and success states. | Medium | Low |
| `src/components/cart/CartDrawer.tsx` | Empty cart still renders an anchor to checkout with only `aria-disabled`; anchors remain keyboard/navigational targets. | Customers can reach a dead-end checkout with no items. | Do not render checkout CTA when empty; provide a real catalog recovery action. | Low | Low |

## Priority 1 — Conversion blockers

| File or component | Current behavior | Why it hurts conversions | Recommended fix | Risk | Complexity |
|---|---|---|---|---|---|
| `src/data/products.ts` + `AddToCartButton` | AOD-9604 has preserved price `$0`, but generic purchase controls add it to cart and create a zero-dollar order context. | “$0” reads as free or erroneous and creates an unusable cart. | Preserve source data but turn non-priced variants into a clearly labeled availability/intake path. | Medium | Low |
| Checkout form | The submit control is simply disabled until valid, with no explanation, field semantics, or invalid-state feedback. | Customers cannot tell what is missing and may abandon. | Allow validation attempts, identify invalid required fields, add autocomplete/input hints, and show one concise error summary. | Low | Low |
| Cart/checkout copy | “Review Cart,” “checkout,” and intake-first copy compete; payment is only clarified late. | Customers cannot tell whether they are buying, requesting a quote, or completing intake. | Label the path consistently as an order inquiry and state before submission that payment is not collected. | Medium | Low |
| Checkout success | Success does not provide a durable submission reference or explain the next response channel/timing. | The customer lacks confidence that follow-up will occur. | Save the inquiry first; in a backend-enabled follow-up, expose a reference and response SLA. | Medium | Medium |

## Priority 2 — Mobile and usability issues

| File or component | Current behavior | Why it hurts conversions | Recommended fix | Risk | Complexity |
|---|---|---|---|---|---|
| `AlternateHomePage`, assistant widgets, WhatsApp | Three floating actions compete near the bottom edges on small screens. | Controls obscure content and split attention at the moment of action. | Consolidate mobile sticky actions into one purchase/intake bar plus one support entry. | Medium | Medium |
| Product pages | Long product pages place the main purchase panel near the top with no persistent mobile purchase summary. | High-intent visitors lose the selected option after scrolling. | Add one compact mobile sticky product action tied to the selected variant. | Medium | Medium |
| Catalog filters | Horizontal filter row depends on swipe discovery. | Some categories are effectively hidden on narrow screens. | Add edge fade/“Filter” affordance and preserve selected state visibly. | Low | Low |
| Checkout | Order summary follows the form on small screens and can be far from the submit decision. | Customers cannot easily recheck items while entering details. | Add a compact collapsible order summary above the mobile form. | Low | Medium |

## Priority 3 — Trust and content improvements

| File or component | Current behavior | Why it hurts conversions | Recommended fix | Risk | Complexity |
|---|---|---|---|---|---|
| Product/cart/checkout decision areas | Shipping, returns, payment timing, support, and documentation are distributed across legal/FAQ pages. | Critical reassurance is absent where customers decide. | Add concise links and a four-item trust summary beside cart/checkout CTAs. | Low | Low |
| Homepage/footer/product content | Research-use disclaimer and brand promise repeat frequently while concrete purchase expectations remain vague. | Repetition adds cognitive load without resolving customer questions. | Keep one concise disclaimer per decision area and use freed space for fulfillment/payment expectations. | Low | Medium |
| Product copy | Mechanism-heavy terminology precedes plain-language selection guidance. | Qualified buyers still need faster product/format differentiation. | Lead with “what this listing is / format / documentation / next step,” then retain technical detail below. | Medium | Medium |
| Intake vs purchase | “Start Your Research,” “Research Match,” contact, and ordering share destinations but not a consistent explanation. | Visitors cannot predict which path fits their intent. | Define “Order inquiry” for selected products and “Research Match” for help choosing. | Medium | Medium |

## Priority 4 — Performance and cleanup

| File or component | Current behavior | Why it hurts conversions | Recommended fix | Risk | Complexity |
|---|---|---|---|---|---|
| Homepage media | Several below-fold images remain unloaded during the initial mobile observation; hero video/image variants add asset weight and complexity. | Slow media can delay visual confidence on mobile connections. | Measure production LCP/transfer size, preload only the actual LCP asset, and confirm poster/video codec sizing. | Medium | Medium |
| `App.tsx` | Legacy alternate homepage paths still resolve to the production homepage and the component retains “Alternate” naming. | It increases routing ambiguity and maintenance risk, though it is not a visible redesign issue. | After analytics/link review, remove obsolete aliases and rename in a separate cleanup change. | Medium | Low |
| Footer | The compliance disclaimer is rendered twice in the same footer. | Repetition lengthens the page and weakens hierarchy. | Keep the stronger contextual instance after legal review. | Low | Low |
| CTA inventory | Many repeated catalog/intake CTAs are valid but lack a shared intent taxonomy or analytics contract. | Funnel attribution and copy consistency are difficult to manage. | Add shared CTA intent names and analytics events after conversion tracking requirements are defined. | Low | Medium |

## Production backend dependency

The application-level checkout fix now saves through the existing CRM storage service before clearing the cart. However, this repository intentionally uses browser-local storage unless `VITE_PUBLIC_CRM_DEV_MODE=true`; the included Supabase policies are explicitly development-only and unsafe for production. A secure server-side submission endpoint (or production-safe insert-only policy plus authenticated administration) is still required before checkout and intake submissions can be considered durably delivered to the business in production. Until that deployment dependency is completed, this remains a Priority 0 operational blocker even though the UI no longer silently clears a cart on a failed save.
