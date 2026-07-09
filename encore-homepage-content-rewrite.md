# Encore Bio Labs — Homepage Content Rewrite

Full homepage copy, rewritten from scratch. Written to read like a real premium healthcare/biotech brand — not a templated research-chemical catalog. Every section below is self-contained: eyebrow, headline, subheadline, body copy, CTA, visual direction, and implementation notes.

## Voice applied throughout

Clear, educational, warm, precise, credible, modern, premium. Short sentences do the confident work; longer sentences do the explaining. No exclamation points. No stacked adjectives ("premium organized documentation-first catalog"). Every claim is either true today, framed as "by request," or framed as research-context language — nothing is asserted that the business can't back up.

## Compliance guardrails applied to every section

- Research-use-only positioning stated plainly, not defensively.
- No treat/cure/prevent/diagnose language, anywhere.
- No dosing, protocols, or "how to use" instructions.
- No promised or implied individual outcomes (no percentages, no before/after framing, no "results").
- No "buy now," no urgency/scarcity pressure, no e-commerce hype language.
- "Studied for," "research interest," "commonly reviewed in research contexts" used instead of benefit claims.

---

## 1. Hero Section

**Eyebrow:** Research-Use-Only Peptide & Compound Catalog

**Headline:** Careful research starts with a careful source.

**Subheadline:** Encore Bio Labs is a research-use-only catalog spanning metabolic, recovery, longevity, cognitive, and hormonal research — organized so you can actually find what you're looking for.

**Body copy:** Every product page is written to inform, not to sell. Identity and purity documentation is available on request, categories are organized around real research questions instead of marketing categories, and every intake is read by a person on our team before anything moves forward.

**CTA:** Primary — "Explore the Catalog" (→ `#featured-products`). Secondary — "Start a Research Profile" (→ `/intake`)

**Visual direction:** Calm, editorial — not a stark clinical white-and-blue lab. Warm neutral background, soft teal/emerald glow, a single hero product vial rendered with real light and shadow rather than a flat product photo. If a person appears at all, it should read as a researcher at a bench (hands, notebook, pipette) rather than a fitness model. Motion should be slow and confident: a gentle parallax drift, a soft breathing glow behind the vial — nothing that feels like a slot machine or a countdown timer.

**Notes for Codex implementation:** Reuse the existing `Hero.tsx` shell (video/poster asset, particle background, `CTA` component) — only the copy, not the structure, needs to change. Replace the current hero stats row (`COA Available / Complete Kits / U.S. Shipping / Mexico Shipping +$20`) with either (a) the short trust statement from Section 2 below, or (b) a smaller, quieter version of the same four chips placed *under* the fold rather than competing with the headline. Primary CTA should point to `#featured-products`; secondary CTA should point to `/intake` (the canonical intake flow already consolidated in this codebase — do not resurrect the old homepage form).

---

## 2. Short Trust Statement

**Eyebrow:** (none — this section is a single confident line, not a full section header)

**Headline:** Documentation on request. Real categories. A person reviews every inquiry.

**Subheadline:** (not used in this section)

**Body copy:** Not used — this section is intentionally one line, sitting directly under the hero as a confidence bridge before the visitor scrolls further.

**CTA:** None. This is a statement, not a conversion point.

**Visual direction:** A thin, quiet horizontal bar — no icons required, or at most three small inline glyphs (document, category grid, person) separated by hairline dividers. Should feel like a museum wall label: understated, confident, no motion beyond a gentle fade-in on scroll.

**Notes for Codex implementation:** This can live as a slim strip component between `Hero` and `CategoryGrid` in `App.tsx`, or be absorbed into the bottom of the Hero component if a new component feels like overkill. Keep it to one visual row, no card treatment, no shadows — the restraint here is the point.

---

## 3. Category Overview

**Eyebrow:** Explore by Research Area

**Headline:** Five research categories. One clear catalog.

**Subheadline:** Every product on Encore Bio Labs sits inside a category built around a real area of research interest — not a marketing label.

**Body copy (per category, replacing the current one-line descriptions):**

- **Metabolic & Weight Management** — Research into metabolic signaling, energy regulation, and body-composition pathways, including GLP-1/GIP-adjacent and growth-hormone-axis compounds.
- **Recovery & Regeneration** — Research into tissue repair, connective-tissue signaling, and regenerative peptide science, often reviewed together as recovery-focused research stacks.
- **Longevity & Cellular Health** — Research into cellular resilience, mitochondrial function, oxidative balance, and the biology commonly associated with healthy aging.
- **Cognitive & Performance** — Research into neurobiology, synaptic signaling, and the compounds studied in relation to focus, cognition, and human performance.
- **Hormone & Wellness** — Research into hormonal signaling and the endocrine-adjacent compounds studied across wellness-focused research programs.

**CTA:** "View All Categories" (→ `/#products` today; ideally `/categories` once dedicated category pages exist — see the content-strategy roadmap)

**Visual direction:** A five-card grid, one real category image per card (the existing category imagery is fine as a base, but consider re-shooting or re-rendering with warmer, less sterile lighting). Icon or accent color per category, consistent with the existing teal/emerald/cyan system. Hover state: gentle lift, no bounce.

**Notes for Codex implementation:** Update the `researchAreas` descriptions in `src/data/products.ts` with the five body-copy lines above — they replace the current single generic sentence per category. No change needed to `CategoryGrid.tsx` structure itself, just the underlying copy and category card labels.

---

## 4. Why Encore Bio Labs

**Eyebrow:** Why Encore

**Headline:** We built the catalog we wished existed.

**Subheadline:** Most research-chemical sites make you choose between polish and substance. We didn't think that should be a choice.

**Body copy:** Encore Bio Labs exists because research-use catalogs shouldn't feel like either a spreadsheet or a supplement funnel. That means categories organized around real research questions instead of SEO keywords. It means documentation you can actually ask for, not documentation you're told exists somewhere. And it means an intake process reviewed by a person, so a request for information is met with an answer — not an autoresponder.

**CTA:** "See Our Standards" (→ `/quality` or `#quality`)

**Visual direction:** A two-column editorial layout: text on one side, a single strong image on the other — a real (or convincingly real) documentation moment: a hand reviewing a printed COA, a labeled vial next to a notebook, something that shows care rather than tells about it. Avoid stock-photo energy entirely here; this section lives or dies on feeling specific.

**Notes for Codex implementation:** This is a net-new section — there isn't a direct equivalent today. It can sit between `CategoryGrid` and `FeaturedProducts` in `App.tsx`. If no real team/founder content exists yet, do not invent names or photos; keep the copy focused on standards and process (as written above) rather than people, and flag in a code comment that a team/founder section can be added later if the business wants one (see the About Page plan in `encore-content-strategy-plan.md`).

---

## 5. Research-Use-Only Explanation

**Eyebrow:** Research Use Only

**Headline:** What "research use only" actually means.

**Subheadline:** Not a disclaimer buried in fine print — a plain explanation of what you're buying and why it's positioned this way.

**Body copy:** Every product on this site is sold for laboratory research use only. That means it's not intended for human or animal consumption, it isn't a supplement or a drug, and nothing on this site should be read as medical advice, a treatment recommendation, or a suggestion of what any compound will do for you personally. If you're a qualified researcher or institution evaluating these compounds for a real research question, this catalog is built for you. If you're looking for medical guidance, please talk to a licensed healthcare provider instead — we mean that sincerely, not as a liability shield.

**CTA:** "Read the Full Policy" (→ `/legal/terms`)

**Visual direction:** Simple, calm, almost documentary — a two-column "what this means / what this doesn't mean" layout works well here, or a single centered block of text with generous whitespace. No warning-sign iconography, no red or amber alarm colors — this should read as clarity, not liability CYA.

**Notes for Codex implementation:** This can reuse the visual language of the existing `ResearchUseDisclaimer` component pattern from the product pages, promoted to a full homepage section rather than a dark callout box. Link out to the real `/legal/terms` page built in the prior compliance pass.

---

## 6. Product Discovery Section

**Eyebrow:** Find What You're Researching

**Headline:** Not sure where to start?

**Subheadline:** A short research-interest intake matches your goals to relevant categories — reviewed by our team, not auto-generated and sent blind.

**Body copy:** Tell us what you're researching — metabolic pathways, recovery, longevity, cognition, or hormonal signaling — along with a few basics about your research context. We'll match you to relevant categories and products, and a real person on our team reviews every submission before any follow-up is sent. This isn't a diagnostic tool and it doesn't replace your own research judgment — it's a faster way to get to the right part of the catalog.

**CTA:** "Start Your Research Profile" (→ `/intake`)

**Visual direction:** A clean product shot of the intake experience itself — a simplified mock of the form's first step, or a close-up of a progress indicator — paired with a short reassurance card: "We don't sell your information" / "Reviewed by a person before follow-up." Feels more like a thoughtful product tour than a lead-gen funnel.

**Notes for Codex implementation:** This section should link directly to the existing `/intake` flow (`IntakePage.tsx`) — do not build a second form. If a visual preview of the form is wanted, a static screenshot or simplified illustrative mock is safer than embedding the live form twice on the homepage (which was exactly the duplication problem fixed in the prior compliance pass).

---

## 7. Best Sellers Section

**Eyebrow:** Most Explored in Research

**Headline:** Where most research starts.

**Subheadline:** The four catalog entries researchers ask about most — across metabolic, recovery, and longevity research.

**Body copy:** These aren't "top sellers" in the retail sense — they're the products that come up most often in research inquiries we receive, across the categories researchers explore most. Each has its own dedicated page with format options, research context, and documentation availability.

**CTA:** "View Full Catalog" (→ `#featured-products`)

**Visual direction:** Reuse the existing best-seller card layout (one larger flagship card, three supporting cards) — but replace any card badge language that reads like a retail sales claim (e.g., avoid "Best seller" framing that implies volume-based sales superiority) with quieter framing like "Frequently Explored" or "Popular in Research Inquiries."

**Notes for Codex implementation:** Maps directly onto the existing `bestSellers` array and `FeaturedProducts.tsx` component in the codebase — copy-only change, no structural change needed. Update the "Best seller" badge label to "Frequently explored" or similar to avoid retail-sales-volume framing that isn't something the business can substantiate.

---

## 8. How the Research Ordering Process Works

**Eyebrow:** How It Works

**Headline:** From curiosity to your research bench.

**Subheadline:** A straightforward path — no dosing guidance, no protocols, just a clear process from browsing to receiving your order.

**Body copy:** Explore the catalog by category or product. When you're ready, complete a short intake or reach out directly — both are reviewed by our team. Approved orders route to same-day local delivery in the El Paso area or nationwide U.S. shipping, with Mexico shipping also available. Every order arrives with research-use-only labeling and handling information, so storage and documentation questions are answered before you need to ask them.

**CTA:** "Start Intake" (→ `/intake`)

**Visual direction:** Four-step horizontal flow with simple line-art icons (magnifying glass / form / shipping box / shield-check) — numbered clearly, consistent with the four-step pattern already used on individual product pages. Keep it literal and calm rather than abstract.

**Notes for Codex implementation:** This is very close to the existing `ProductHowItWorksFlow` component built for product pages (`Explore → Intake/Contact → Delivery/Shipping → RUO handling`) — consider extracting a shared, homepage-scoped version of that same four-step pattern rather than writing an entirely new component, since the underlying steps and voice are consistent.

---

## 9. Quality and Handling Section

**Eyebrow:** Quality & Handling

**Headline:** Documentation isn't an afterthought here.

**Subheadline:** Identity and purity documentation, storage guidance, and batch-level records — available when you ask for them, not hidden behind a sales call.

**Body copy:** Every product page includes what we can tell you about identity, format, and storage expectations. Certificate of analysis availability, batch documentation, and handling guidance can all be requested through the intake process. We'd rather tell you plainly what's available on request than dress up a page with numbers that don't mean anything — so you won't find invented purity percentages or manufactured statistics here, only what we can actually stand behind.

**CTA:** "See Our Quality Standards" (→ `/quality` or `#quality`)

**Visual direction:** A sample COA or batch-documentation mockup (clearly marked as a sample/template if a real one can't be shown publicly), paired with simple badge-style callouts: Identity, Purity, Storage, Batch Records. Cool, clean, laboratory-adjacent — but grounded in an actual document rather than an abstract icon set.

**Notes for Codex implementation:** This section should map to the existing `QualitySection.tsx`, rewritten to remove any "documentation-first" repetition and to explicitly avoid resurrecting the fabricated-statistics pattern removed elsewhere in this codebase (see `encore-content-strategy-plan.md`, P0.2). If a real sample COA image exists, use it here; if not, a clearly labeled "Sample COA format" placeholder is preferable to no visual at all.

---

## 10. Educational Resource Section

**Eyebrow:** Understand the Science

**Headline:** Understand the science, not just the SKU.

**Subheadline:** Plain-language context on the research areas behind the catalog — what's being studied, and why it's organized the way it is.

**Body copy:** Every category page includes the research context behind it: what the underlying biology is, what kinds of questions researchers commonly explore, and how the products in that category relate to one another. It's not a substitute for reading the primary literature yourself — it's a starting point that respects your time and your intelligence.

**CTA:** "Browse Research Topics" (→ `/#products` today; `/research` once a dedicated library exists)

**Visual direction:** A simple card grid mirroring the five research categories, each with a short descriptor and a "read more" affordance — editorial and text-forward rather than heavily graphic, closer to a well-designed reading list than a marketing carousel.

**Notes for Codex implementation:** A full Research Library (with real citations per compound family) doesn't exist yet in this codebase — it's on the P2 roadmap in `encore-content-strategy-plan.md`. Until it ships, point this section's CTA at the existing category anchors and FAQ rather than a `/research` route that would 404. Do not invent citations or studies to fill this section early — better to launch it small and real than large and fabricated.

---

## 11. FAQ Preview

**Eyebrow:** Common Questions

**Headline:** Answers before you ask.

**Subheadline:** A few of the questions we hear most — the full list covers legitimacy, testing, shipping, and handling.

**Body copy (preview questions, 3–4 shown, linking to full FAQ):**

- "What does 'research use only' actually mean for me?"
- "Is documentation really available, or is that just a line on the site?"
- "Do you ship nationwide, and to Mexico?"
- "What happens after I submit a research intake?"

**CTA:** "View All FAQs" (→ `#faq` or `/faq`)

**Visual direction:** Simple accordion preview, consistent with the existing FAQ component styling — three or four items expanded/collapsible, with a clear link to the full list rather than repeating all of it here.

**Notes for Codex implementation:** Pull directly from the expanded FAQ set already built (`FAQSection` patterns and the homepage `FAQ.tsx`) — this section is a curated subset, not new content. Prioritize the legitimacy and process questions identified in the content-strategy audit as currently underrepresented, rather than only shipping/logistics questions.

---

## 12. Final CTA

**Eyebrow:** Ready When You Are

**Headline:** Your research question deserves a real answer.

**Subheadline:** Start a research profile, or go straight to the catalog — either way, a person on our team is on the other end.

**Body copy:** There's no pressure and no countdown clock here. Explore at your own pace, ask the questions you actually have, and when you're ready, we're ready.

**CTA:** Primary — "Start Your Research Profile" (→ `/intake`). Secondary — "Browse the Catalog" (→ `#featured-products`)

**Visual direction:** Full-width closing section, calm gradient background (dark navy to soft teal glow, consistent with the existing `#071724` → teal treatment used elsewhere on the site), minimal copy, generous whitespace. This should feel like an exhale, not a final hard sell.

**Notes for Codex implementation:** Maps to the existing dark closing-CTA pattern already used on product pages (`CTASection`) — reuse that visual language for brand consistency rather than introducing a new closing treatment. Both CTAs should point to real, working routes already in place (`/intake`, `#featured-products`); no new destinations needed.
