# Encore Bio Labs — Content Strategy Audit & Recommended Architecture

Companion document to `encore-content-audit-export.md`. That file is an inventory of what exists. This file is the strategic read: why it feels superficial, what to do about it page by page, and the target content architecture.

Brand target: Function Health / Levels / Ro / Hims / One Medical clarity and trust, with Moderna-level scientific credibility.
Brand risk today: reads closer to a template-generated research-chemical catalog with premium visual styling layered on top of thin, repetitive copy.

---

## 0. Executive Diagnosis — Why It Feels Superficial

1. **The same six words carry the whole site.** "Documentation-first," "organized," "premium," "catalog," "review," and "research-use-only" repeat across nearly every headline, card, and FAQ (e.g. Quality section: "documentation-first standards"; Trust Badges: "organized... documentation... review"; How It Works: "organized fulfillment"). When a brand's entire vocabulary is five adjectives, visitors correctly sense there's no real content behind it — this is the single biggest tell of AI-generated catalog copy, which is exactly the thing the brand direction says to avoid.
2. **The "science" is decorative, not substantive.** Product pages have a "Research Highlights" section with metrics like `92%`, `87%`, `100%` explicitly labeled as "illustrative... not guaranteed outcomes." Fabricated statistics with a disclaimer attached are worse than no statistics — they read as deceptive even when caveated, and they're the opposite of Moderna-level credibility. There isn't a single real citation, study name, DOI, or link to PubMed/ClinicalTrials.gov anywhere on the site.
3. **Nobody is behind the words.** No author, no medical/scientific reviewer, no advisory board, no team page, no company story. Function Health, Levels, and One Medical all lead with credentialed humans. Encore currently reads as an anonymous storefront.
4. **Trust content describes process, not proof.** The Quality section and Trust Badges say documentation "can be requested" and COAs are "available through the approved process" — but nothing is actually shown: no sample COA, no named third-party lab, no testing method (HPLC/MS), no batch/lot lookup. This is the difference between *claiming* rigor and *demonstrating* it.
5. **Legal/compliance scaffolding is missing, not just thin.** Terms and Privacy both link to `#request-information` (the contact form) instead of real policy pages. There's no visible business entity, address, or return/refund policy. This is the fastest way to look "gray-market" to a skeptical visitor, independent of how good the product copy is.
6. **Retatrutide breaks the brand's own rules.** It uses materially stronger claim language than every other page — "pharmaceutical-grade," "cold-chain guaranteed," "COA verified," and a personalized calculator that takes a visitor's height/weight/sex and outputs a projected individual weight-loss curve tied to a specific unapproved research compound. That calculator is the single highest compliance and brand-tone risk on the site (see §5, Retatrutide).
7. **No real information architecture.** There are no category pages, no research library, no about page, no comparison content — everything lives as anchor sections on one homepage plus a repeating product template. This caps SEO ceiling hard (no unique indexable pages per category or topic) and gives visitors nowhere to go to actually learn something.
8. **Two disconnected intake systems.** The homepage `RequestInformation` form and the standalone `/intake` AI page collect overlapping data into different local storage keys with different consent language. A careful visitor going through both will notice the inconsistency, which undercuts "Apple-level clarity."
9. **FAQs answer compliance questions, not buyer questions.** Nearly every FAQ across the site exists to restate "this is not medical advice" in a new sentence. Real buyer questions — *why does this cost what it costs, how do I know this vial is what it says it is, what happens if a batch fails testing, can I actually trust this company* — are unanswered anywhere.

---

## 1. Page-by-Page Audit

### 1.1 Homepage (`/`)

- **Missing:** a reason to believe (no named lab, no advisory board, no press/media, no real numbers); a "why Encore vs. generic peptide sites" section; a visible pricing philosophy; a real founder/company story.
- **Unanswered visitor questions:** *Who actually runs this company? Is this legal? Why should I trust a vial that showed up from a website over one from a compounding pharmacy? What does "research use only" actually mean for me practically? How is this different from the hundred other peptide sites?*
- **Sections to add:** Founder/company credibility strip (real names + credentials or clearly-framed "our research standards" if names aren't available yet); "Encore vs. typical peptide sites" comparison table; press/media or advisory mentions; a real testing/COA showcase (not just a promise it exists).
- **Sections to remove:** none outright — the architecture is reasonable — but **Hero Stats** ("COA Available / Complete Kits / U.S. Shipping / Mexico Shipping +$20") should be replaced; these are process facts, not trust signals, and they're logistics dressed up as proof points.
- **Rewrite:** Hero headline/subhead ("Premium research compounds. Organized with clinical precision.") is adjective-stacked with no differentiation — rewrite around a specific, ownable claim (e.g., testing standard, catalog depth, or turnaround). Category descriptions in `researchAreas` are one generic sentence each ("Research focused on metabolic pathways, body composition, and energy regulation.") — expand to 2–3 sentences with real specificity per category.
- **Internal links to add:** link each category card to a real category page (once built, see 1.2), not just an anchor scroll; link Quality section to the new Research Library; link Trust Badges to an About/Quality standards page.
- **FAQs to add:** "How do you verify product identity and purity?" / "What happens if a batch fails testing?" / "Who is Encore Bio Labs, legally?" / "Why is pricing not shown upfront on every card?"
- **Comparison tables to add:** "Encore Bio Labs vs. typical research-chemical sites" (documentation, testing, packaging, support, pricing transparency).
- **Diagrams/visual modules to add:** a real "how a batch gets tested" flow diagram (intake → identity test → purity test → COA issued → ships) — this replaces vague "documentation-first" language with something a visitor can actually see.
- **Trust-building sections to add:** named lab partner (or clear "third-party ISO-certified lab" language if the name can't be disclosed yet), sample COA image, review/rating aggregator if available, transparent legal entity block (company name, state, contact address) in the footer.

### 1.2 Category Pages (do not exist as routes today)

- **Missing:** the entire page type. Categories currently only exist as a homepage grid section (`CategoryGrid.tsx`) and as a `category` field on each product — there is no `/categories/:slug` route.
- **Unanswered visitor questions:** *I know I'm interested in "longevity" — where do I go to compare all longevity products side by side, understand the shared biology, and see which one fits my research question?*
- **Sections to add (net-new page type):** category hero with real educational framing; "how these compounds relate to each other" explainer; full product grid filtered to category; category-specific FAQ; category-specific comparison table; related research-library articles.
- **Sections to remove:** N/A (net-new).
- **Rewrite:** promote the one-sentence `researchAreas` descriptions into full category intros (300–500 words) covering the shared biology, what "research interest" looks like in that category, and how to think about choosing between products in it.
- **Internal links to add:** category → every product in that category; category → relevant research-library articles; category → comparison table; breadcrumb Home → Category → Product on every product page (currently product pages only link "Back to catalog," losing the category context entirely).
- **FAQs to add (per category, category-specific, not generic):** e.g., for Longevity & Cellular Health — "What's the difference between NAD+, SS-31, and Glutathione research interest?" / "Are these compounds studied together or separately?"
- **Comparison tables to add:** in-category product comparison (format, research focus, typical study context, price range) — this is the highest-leverage missing content type: it's genuinely useful, differentiates from a flat catalog, and is very SEO-friendly.
- **Diagrams/visual modules to add:** a shared-pathway diagram per category (e.g., mitochondrial/redox pathway map for Longevity & Cellular Health showing where NAD+, SS-31, and Glutathione each act) — this is where "Moderna-level scientific credibility" actually gets earned.
- **Trust-building sections to add:** "how we select compounds for this category" editorial note; category-specific storage/handling standards.

### 1.3 Product Detail Pages — Standard Template (`/products/:slug`)

- **Missing:** real specifications (molecular formula, sequence, molecular weight, CAS number where applicable), a real COA/testing callout per product, a genuine "who reviews this content" byline, a real comparison table against related products, and second-order/practical answers (interactions with common research protocols, realistic storage/handling specifics rather than "can vary by format, lot, and documentation").
- **Unanswered visitor questions:** *What exactly am I looking at, chemically? How do I know this specific batch is what it claims to be? Why is this priced the way it is? How is this different from the very similar-sounding product three cards over? Is there real published research, and can I read it myself?*
- **Sections to add:** "Verified specifications" block (formula/sequence/purity method/CAS where applicable, sourced from the actual product, not templated filler); "In the published literature" block with 2–4 real, linkable citations (PubMed/DOI) per compound instead of the fabricated "Research Highlights" percentages; a same-category comparison table; breadcrumb navigation (Home → Category → Product).
- **Sections to remove:** **`ResearchHighlightsSection` and `ProductStatistics`** as currently built — both present numeric "metrics" (`92%`, `87%`, `24hr`, `100%`) that are explicitly fabricated placeholders per the product data comments. These should either be replaced with real, sourced data or removed outright; keeping fake stats next to a "not guaranteed outcomes" disclaimer is a credibility net-negative, not neutral. **`ProductDifferentiator`**'s "standard wellness vs. targeted peptide research" comparison is generic boilerplate repeated near-verbatim across all 20+ products — replace with the real product-to-product comparison table recommended above, which is genuinely differentiating content instead of a templated straw-man comparison.
- **Rewrite:** the base catalog descriptions (e.g., Glutathione: "A research catalog entry with variant visibility and room for supporting documentation requests") describe the *page*, not the *product* — every one of the 20+ base descriptions in `catalogProducts` has this problem and should be rewritten to describe what the compound actually is in one sentence, with the deeper educational content living in the "What is [Product]?" section. The reconstitution/storage copy ("Storage expectations can vary by format, lot, and documentation") is a non-answer on every page — replace with real, product-appropriate storage guidance (temperature ranges, light sensitivity, reconstituted-stability windows) sourced from real handling data, framed educationally.
- **Internal links to add:** to the product's category page, to 2–3 related research-library articles (by mechanism, not just "related products"), and breadcrumbs. Note the current `relatedProducts` links only to other product pages — none point to educational content because none exists yet.
- **FAQs to add (real, product-specific, currently missing across all pages):** "Where can I read the published research on this compound?" / "How does Encore verify the identity and purity of this specific product?" / "What does the CAS number / sequence tell me?" / "Why does this cost what it costs compared to similar compounds?"
- **Comparison tables to add:** same-category product comparison (as in 1.2) surfaced again at the bottom of each product page, scoped to that product's closest neighbors.
- **Diagrams/visual modules to add:** a real mechanism/pathway diagram per product (or per shared mechanism family, to control production cost) — replacing the current decorative stock-photo hero imagery (a person running on a beach for Glutathione, a person meditating for Semax) which contributes nothing scientifically and reads more "wellness supplement" than "biotech."
- **Trust-building sections to add:** COA/testing callout with a real or representative lab name and method; batch/lot lookup mention if the business supports it; a visible "reviewed by" line even if that's an internal scientific reviewer rather than an external MD (avoids implying medical review while still signaling someone competent checked the content).

### 1.4 Retatrutide (`/products/retatrutide`) — Special Case

- **Missing:** consistency with the rest of the site's compliance posture.
- **Unanswered visitor questions:** *Why does this one product get a personalized outcome calculator when nothing else on the site does? Is Encore claiming this works like a real weight-loss drug?*
- **Sections to add:** a standard, real "Phase 2 published data" static chart (population-level, sourced, citation-linked) can stay — that's legitimate educational content.
- **Sections to remove:** **`RetatrutideCalculatorSection`** — a tool that takes a visitor's own height, weight, and sex and outputs a personalized projected weight-loss curve ("See what's possible with Retatrutide") tied to a specific compound is functionally a personalized treatment-outcome promise. This is the single highest compliance and brand-tone risk item found in this audit and should be removed or converted to a fully non-personalized, population-level static visualization with no user input. Claim language like "pharmaceutical-grade," "COA verified," "cold-chain guaranteed," and "Delivered" (as in "The most advanced peptide in its class. Delivered.") should also be brought in line with the careful research-use language used everywhere else — right now Retatrutide reads like a DTC weight-loss drug ad dropped into a research catalog.
- **Rewrite:** hero headline/subhead, all hero bullets ("Independent COA - 99%+ purity, every batch" is a strong absolute claim with no source), and the "Real Results. Real You." labeling on the before/after-style image slider — this framing (before/after visual + personal calculator) is standard DTC weight-loss marketing pattern, not research-use educational framing, and is the most likely single element to draw regulatory or platform-policy scrutiny.
- **Internal links to add:** to the Metabolic & Weight Management category page and real published-literature sources.
- **FAQs to add:** "Is this projection based on my own data or published studies?" / "Does Encore make individual outcome guarantees?" (answer: no, explicitly).
- **Comparison tables to add:** Retatrutide vs. other Metabolic & Weight Management catalog entries (Tesamorelin, CJC-1295/Ipamorelin, MOTS-C).
- **Diagrams/visual modules to add:** triple-receptor (GLP-1/GIP/glucagon) mechanism diagram — real scientific value, unlike the calculator.
- **Trust-building sections to add:** same COA/testing callout standard as every other product — Retatrutide should not be a bespoke exception to the trust system, it should be the flagship example of it.

### 1.5 FAQ (currently a homepage section only, no dedicated `/faq` page)

- **Missing:** a standalone, indexable FAQ page; buyer/trust questions (see Executive Diagnosis #9); category- and product-specific FAQ surfacing in one place.
- **Unanswered visitor questions:** legal/legitimacy questions, pricing questions, testing/verification questions, return/refund questions — none of the 7 current homepage FAQs address any of these; they're entirely about what "research use only" means and basic shipping logistics.
- **Sections to add:** grouped FAQ categories (Legitimacy & Compliance, Testing & Quality, Shipping & Delivery, Ordering & Intake, Storage & Handling, Returns/Issues) rather than one flat list.
- **Sections to remove:** none — consolidate, don't delete.
- **Rewrite:** none of the current 7 need rewriting, they just need company (see FAQs to add).
- **Internal links to add:** each FAQ category should deep-link to the relevant page (Quality FAQ → Quality/Research Library, Shipping FAQ → About/Shipping policy).
- **FAQs to add:** "Is Encore Bio Labs a licensed pharmacy?" (answer plainly: no, and explain what that means) / "What happens if my order doesn't pass a spot-check?" / "Do you offer refunds or replacements?" / "How is my personal information handled?" / "Can I speak to someone before ordering?"
- **Comparison tables to add:** N/A for this page type.
- **Diagrams/visual modules to add:** N/A.
- **Trust-building sections to add:** a visible link from the FAQ page to a real Terms of Service and Privacy Policy (today both link to the contact form, which itself is a trust gap worth fixing here).

### 1.6 About Page (does not exist)

- **Missing:** the entire page. There is no `/about` anywhere in the nav, footer, or routes.
- **Unanswered visitor questions:** *Who is behind this? Where are you based? Is this a real, ongoing company? Why should I trust you with my health-adjacent research and my payment information?*
- **Sections to add (net-new):** company story/mission; team or scientific-standards section; legal entity and location; quality/testing philosophy (can share content with Quality section but should have its own authoritative page); press or affiliations if any exist.
- **Trust-building sections to add:** this entire page *is* the trust-building section — see §3 About Page Content Plan below.

### 1.7 Research Library (does not exist)

- **Missing:** the entire page type. This is the biggest gap relative to the Moderna/Levels/Function Health target — all three of those brands invest heavily in owned educational content with real citations.
- **Unanswered visitor questions:** *Where can I actually read about the biology instead of marketing copy? Is there a single real published study I can look at?*
- **Sections to add (net-new):** see §3 Research Library Plan.
- **Internal links to add:** every product page and category page should link out to 2–4 relevant library articles; the library should link back to relevant products.
- **FAQs to add:** N/A (library articles can carry their own FAQ blocks per topic).
- **Comparison tables to add:** "compound family" comparison articles (e.g., all GH-axis secretagogues compared in one article: Tesamorelin, CJC-1295/Ipamorelin, MOTS-C).
- **Diagrams/visual modules to add:** this is where most of the diagram investment should go — mechanism diagrams, pathway maps, and molecule structure visuals belong here first, then get reused/excerpted on product pages.

### 1.8 Intake Flow(s) (`/#request-information` and `/intake`)

- **Missing:** a single, unified system. Two separate forms currently exist with different steps, different consent language, and different local storage keys/data shapes (`RequestInformation.tsx` vs. `IntakePage.tsx` / `src/data/intake.ts`).
- **Unanswered visitor questions:** *Which one am I supposed to use? Why did the homepage form ask different questions than the one linked in the nav?*
- **Sections to add:** N/A — the fix here is consolidation, not addition.
- **Sections to remove:** one of the two intake systems should be retired in favor of the other (recommend keeping the standalone `/intake` page as the canonical flow since it has clearer review-process messaging, and converting the homepage section into a lightweight "start your research profile" teaser that links to `/intake` rather than duplicating the full form).
- **Rewrite:** align consent language between the two so there's one canonical set of consent statements.
- **Internal links to add:** every "Request Access," "Start Intake," and "Request Catalog Access" CTA sitewide should point to the same canonical flow.
- **FAQs to add:** "What happens after I submit the intake form?" (the standalone intake page already answers this well — that language should be reused wherever intake is mentioned, including the homepage version).
- **Trust-building sections to add:** the standalone intake's "Your intake responses are stored securely... We do not sell your personal information" line is good and should be present on *both* forms, not just one.

---

## 2. Recommended Content Architecture (Sitemap)

```
/                          Homepage
/categories/:slug          Category pages (5 — one per research area)
/products/:slug            Product pages (unified template; Retatrutide de-specialized)
/research                  Research Library index
/research/:slug            Research Library articles
/about                     About / Company / Standards
/quality                   Quality & Testing (promoted from homepage-only section)
/faq                       Standalone FAQ (grouped)
/intake                    Canonical intake flow (homepage form retired/simplified)
/legal/terms               Real Terms of Service
/legal/privacy             Real Privacy Policy
/legal/shipping-returns    Shipping & returns policy
```

---

## 3. Content Plans

### Homepage Content Plan
1. Hero — specific, ownable claim (not adjective-stacked); real proof point in place of process-fact "stats."
2. Credibility strip — team/advisory/press or clearly-framed standards statement.
3. Category grid — links to real category pages, expanded descriptions.
4. "Encore vs. typical research sites" comparison table.
5. Featured products (keep, but add category context/breadcrumb-style labeling).
6. Complete Kits (keep, tighten claims to only what's actually included per product, no blanket "where applicable" hedge repeated 3x on one section).
7. Quality & Testing — promote to real proof (sample COA, named method/lab) with a link to full `/quality` page.
8. How It Works (keep, minor copy tightening).
9. Research Library teaser (3 featured articles).
10. FAQ teaser (top 4–5) linking to `/faq`.
11. Trust badges — replace logistics claims with actual verification proof.
12. Footer — real legal entity, address, links to real Terms/Privacy/Shipping pages.

### Category Page Content Plan
1. Category hero (name + one-sentence positioning).
2. Educational intro (300–500 words): shared biology, what "research interest" means in this category.
3. Shared-pathway diagram.
4. Full product grid for the category.
5. In-category comparison table.
6. Category FAQ (3–5 category-specific questions).
7. Related research-library articles.
8. Standard trust/compliance footer block.

### Product Page Content Template (replacing current template)
1. Hero: name, category badge, price, real short description, CTAs (View Research Details / Start Intake / Contact Encore — keep, these work), breadcrumb (Home → Category → Product).
2. Trust strip (keep).
3. "What is [Product]?" (keep — this is genuinely good, keep the real per-product overview copy).
4. Verified specifications block (new) — formula/sequence/CAS/molecular weight where applicable.
5. Research interest / key areas (keep — the benefit-card content is actually well-written per-product; retitle stays as-is from the last update).
6. "In the published literature" (new, replaces fabricated Research Highlights/Statistics) — 2–4 real citations with plain-language takeaways.
7. Mechanism/pathway diagram (new, replaces decorative stock photography).
8. What's included (keep).
9. Quality & testing focus (keep, strengthen with real COA/lab callout).
10. How it works flow (keep).
11. Product specs (keep).
12. Same-category comparison table (new, replaces generic "standard wellness vs. targeted research" differentiator).
13. Gallery (keep, but replace stock lifestyle imagery with product/lab imagery).
14. Research-use disclaimer (keep).
15. FAQ (keep structure, add buyer/trust questions per §1.3).
16. Related products + related research-library articles (expand).
17. CTA section (keep).

### About Page Content Plan
1. Hero: company mission/positioning statement.
2. Founding story / "why Encore exists" (specific, not generic).
3. Standards section: testing philosophy, sourcing philosophy, documentation philosophy (can reuse Quality section content but as the authoritative version).
4. Team or scientific-standards section (real names + credentials if available; if not yet, frame honestly as internal standards rather than implying a team that doesn't exist).
5. Legal entity block: company name, formation state, business address, contact.
6. Press/affiliations (if any).
7. Link to Quality page and Research Library.

### FAQ Page Content Plan
1. Grouped categories: Legitimacy & Compliance, Testing & Quality, Ordering & Intake, Shipping & Delivery, Storage & Handling, Returns & Issues.
2. Each group opens with a 1–2 sentence framing, then 4–6 Q&As.
3. Cross-links from each group to the relevant deeper page (Quality, About, Legal, Intake).
4. Search/filter if the list grows past ~30 questions.

### Research Library Plan
1. Index page grouped by research area (mirrors the 5 categories) plus a "Compound Families" grouping (e.g., GH-axis secretagogues, copper peptides, mitochondrial peptides).
2. Article template: plain-language summary → mechanism/pathway diagram → what's been studied (real citations, linked) → open questions → related products.
3. Minimum viable v1: one article per product family (aim for ~8–10 articles covering all 23 products via shared-mechanism grouping) rather than 23 one-off articles — controls production cost while giving every product at least one real link-out.
4. Every article carries the standard research-use disclaimer and is framed as "current scientific literature," never as an endorsement of use.

### Intake Form Content Plan
1. Consolidate to one canonical flow (`/intake`); retire the duplicate homepage form in favor of a teaser + link.
2. Unify consent language across the one remaining flow (use the standalone intake's stronger version as the base).
3. Keep the existing step structure (Goal → Biometrics → Lifestyle → Experience → Contact) — it's reasonable.
4. Strengthen the "what happens after you submit" messaging (already good on `/intake`) and surface it earlier in the flow, not just in the results state.
5. Add a visible data-handling statement ("we do not sell your personal information") at the *start* of the form, not only after submission.

### Compliance Language Recommendations
1. **Standardize on one disclaimer hierarchy:** a single global disclaimer (the existing `globalResearchDisclaimer` is solid), a single page-level research-use framing sentence, and product-specific caveats only where genuinely needed — right now there are at least 6 slightly different disclaimer variants across the site (global, hero, FAQ, footer, intake x2, Retatrutide projection, product overview). Consolidate to reduce dilution and inconsistency risk.
2. **Remove absolute/quantified claims without sources:** "99%+ purity, every batch," "COA verified," "pharmaceutical-grade" (all Retatrutide-specific) should not appear without a real, checkable source; replace with "purity and identity testing available by request" language consistent with the rest of the site, or with real, sourced figures.
3. **Remove or clearly reframe personalized-outcome tools:** the Retatrutide calculator is the priority fix (see §1.4).
4. **Remove fabricated statistics:** any numeric "metric" that is internally labeled illustrative/not-guaranteed should not be displayed as a metric at all — either source it for real or present it as qualitative text.
5. **Add real legal pages:** Terms of Service, Privacy Policy, and a Shipping/Returns policy should be real pages, not anchors to a contact form — this is as much a legal necessity as a content one.
6. **Keep and reuse consistently:** "research interest," "studied for," "commonly reviewed for," "preclinical/clinical research context," "educational overview" — these are already used well throughout `productFacts` copy; the fix is around them (real specs, real citations, real trust), not the core disclaimer voice itself, which is appropriately careful.

### Internal Linking Strategy
1. **Breadcrumbs everywhere:** Home → Category → Product on every product page (currently absent — products only link back to a flat catalog anchor).
2. **Category as hub:** every product links to its category page; every category page links to all its products plus relevant library articles.
3. **Research Library as connective tissue:** every product links to 2–4 library articles by shared mechanism; every library article links back to the products it covers.
4. **Comparison tables as link surfaces:** every comparison table (homepage, category, product) should link each named product/category.
5. **Fix known broken/implied links:** `AOD-9604` and `Dihexa` are referenced in the category grid's product-label lists but do not exist as real products — either add real product pages for them or remove them from the category copy so visitors don't hit a dead end.
6. **Fix inconsistent product reachability:** `hcg`, `pt-141`, `semax`, and `selank` are real, reachable product pages but are excluded from `productPageSlugs` (used elsewhere for sitemap-style listing) — audit every place `productPageSlugs` drives navigation/sitemap and make sure these four are included, or intentionally document why they're excluded.
7. **One canonical intake CTA target sitewide** (see §1.8) instead of the current mix of homepage-anchor and `/intake` links.

### Priority Implementation Roadmap

**P0 — Compliance & trust risk (do first, highest severity):**
1. Remove or fully de-personalize the Retatrutide calculator; align Retatrutide claim language with the rest of the site.
2. Replace fabricated Research Highlights/Statistics metrics on all product pages with real data or remove them.
3. Build real Terms of Service, Privacy Policy, and Shipping/Returns pages (replace anchor links to the contact form).
4. Consolidate the two intake systems into one canonical flow.

**P1 — Credibility foundation:**
5. Ship the About page (company, standards, legal entity).
6. Ship real COA/testing proof (sample document, named method, ideally named lab) on the Quality page and each product page.
7. Rewrite the 23 base catalog product descriptions to describe the actual compound, not the page.
8. Add breadcrumb navigation and fix the category-page gap (ship `/categories/:slug`).

**P2 — Depth & differentiation:**
9. Launch the Research Library (start with 8–10 compound-family articles covering all products).
10. Add same-category comparison tables to category pages and product pages.
11. Add mechanism/pathway diagrams (library first, then excerpt into product pages), replacing decorative stock photography.
12. Stand up a standalone, grouped `/faq` page with real buyer/trust questions added.

**P3 — Polish & expansion:**
13. Fix `AOD-9604`/`Dihexa` and `productPageSlugs` inconsistencies.
14. Expand FAQ coverage per category and per product with the specific questions identified in §1.
15. Ongoing: expand Research Library, add press/affiliation content as it becomes available, iterate comparison tables as catalog grows.
