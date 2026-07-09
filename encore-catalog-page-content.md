# Encore Bio Labs — Catalog Page Final Content

Final written content for the `/catalog` page. A working `CatalogPage.tsx` already exists in the codebase with a functional hero, filter tabs, search, product cards, a Research Use/Quality section, and a closing CTA — this document is the polished, final copy for each of those pieces, plus two things the current implementation is missing: written descriptions for each category filter, and hand-tuned catalog-card taglines (the current cards auto-derive their description by truncating each product's full `shortDescription`, which reads fine but isn't written *for* a scannable card).

**Compliance applied throughout:** research-use-only positioning stated plainly; no treatment/dosing/use-instruction language; no promised outcomes; no invented certifications or lab names; no fabricated statistics — the only numbers on this page (product count, multi-option count) are real, computed from the catalog data itself, not invented.

---

## 1. Catalog Hero

**Eyebrow:** Research-Use-Only Catalog

**Headline:** One catalog. Every compound, organized by research question.

**Subheadline:** Browse the full Encore Bio Labs catalog with variants grouped under the product they belong to — built for scanning quickly, not scrolling past duplicate listings.

**Body copy:** This catalog is documentation-forward and educational by design. It does not provide dosing guidance, treatment instructions, or outcome promises — just a clear way to see what's available and where to go deeper.

**Stat panel (real, computed — not invented):** Products (live count) · Multi-option entries (live count) · Use classification: RUO

**CTA:** "Browse Products" (→ `#catalog-products`) · "Start Research Intake" (→ `/intake`)

**Implementation note:** Matches the existing hero structure in `CatalogPage.tsx` — copy-only refinement. The stat panel should stay data-driven (`products.length`, multi-variant count) exactly as already implemented; do not replace with static numbers.

---

## 2. Why Encore Section

**Content:** Reuse the existing sitewide `<WhyEncore />` component verbatim — do not write catalog-specific alternate copy for this section. It already reads:

> **Why Encore** — "We built the catalog we wished existed." Most research-chemical sites make you choose between polish and substance. We didn't think that should be a choice. Encore Bio Labs exists because research-use catalogs shouldn't feel like either a spreadsheet or a supplement funnel...

**Why reuse rather than rewrite:** This section already appears on the homepage. Giving the catalog page a *slightly different* version of the same message would read as inconsistent brand voice to anyone who visits both pages back to back — reuse is the correct choice here, not a shortcut.

---

## 3. Product Catalog Intro

**Eyebrow:** Product Catalog

**Headline:** Every product, once. Every option, grouped underneath it.

**Description:** Use the filters or search to scan the catalog. Strengths and format options stay inside one product card, so the same compound never appears twice.

**Search placeholder:** "Search products or research areas"

**Implementation note:** Matches the existing `SectionHeader` + search input in `CatalogPage.tsx` — copy-only refinement.

---

## 4. Category Filter Descriptions

The catalog currently groups products into eight filter tabs — the five main research categories plus two catalog-specific groupings (Skin & Regenerative Research, Essentials). Each needs a one-line description for use as a tooltip, subtext under the active filter, or alt text — the tabs themselves currently show only a label with no description anywhere.

- **All** — Every product in one place, no research area left out.
- **Weight Management** — Incretin-receptor and GH-axis compounds studied in metabolic research.
- **Recovery & Regeneration** — Repair-signaling and matrix-remodeling peptides, reviewed together.
- **Cognitive & Performance** — Neurobiology and human-performance-adjacent research compounds.
- **Longevity** — Cellular resilience, redox biology, and healthy-aging research.
- **Hormone & Wellness** — Endocrine-axis compounds spanning reproductive and sleep-related signaling.
- **Skin & Regenerative Research** — Copper-peptide compounds studied for matrix and dermal research.
- **Essentials** — Supporting kit and logistics entries that round out a research order.

**Implementation note:** Maps to the `filterTabs` constant and `getCatalogFilter()` function in `CatalogPage.tsx`. These descriptions aren't rendered anywhere yet — add them as a small subtext line under the filter row when a tab is active, or as a `title` attribute on each button, rather than leaving the filter row unexplained.

---

## 5. Product Card Descriptions

Short, catalog-card-specific taglines — distinct from each product's full `shortDescription` (which is written for the product page, not a scannable grid card). These are meant to replace the current `getCatalogDescription()` truncation hack with copy actually written for this context.

| Product | Card Tagline |
|---|---|
| Retatrutide | Triple-receptor incretin biology, in one research entry. |
| Tesamorelin | GH-axis signaling research, in a single clean format. |
| CJC-1295 / Ipamorelin | Two GH-axis mechanisms, paired for combination research. |
| MOTS-C | Mitochondrial energy signaling, studied at the AMPK level. |
| BPC-157 | The most-referenced repair peptide in preclinical literature. |
| TB-500 | Actin biology and cell-migration research, one peptide deep. |
| Wolverine Stack | BPC-157 and TB-500, packaged for combined research review. |
| KLOW | Kit logistics and documentation, organized before it ships. |
| GHK-Cu | Copper-peptide matrix research, from collagen to wound response. |
| AHK-Cu | A follicle-focused copper peptide, distinct from GHK-Cu. |
| NAD+ | The cofactor at the center of redox and aging research. |
| Glutathione | Research literature's most-cited intracellular antioxidant. |
| Epithalon | Telomere-adjacent, circadian-linked peptide research. |
| SS-31 | Mitochondrial membrane research, one cardiolipin interaction at a time. |
| Thymosin Alpha-1 | Immune-signaling research with a cellular-defense focus. |
| IGF-1 LR3 | Long-acting IGF-1 receptor research, built for duration studies. |
| Cerebrolysin | A neurotrophic peptide mixture, studied for neuronal survival. |
| Semax | ACTH-fragment biology behind BDNF-linked cognitive research. |
| Selank | Tuftsin-analog research into stress response and neuroimmune signaling. |
| Kisspeptin | The upstream signal in reproductive-axis research. |
| HCG | Downstream gonadotropin research, one receptor pathway at a time. |
| HGH 191AA | The full-length GH sequence, studied for axis-level signaling. |
| DSIP | Sleep-architecture research from a neuroendocrine angle. |
| PT-141 | Central melanocortin-receptor research, not a wellness promise. |

**Implementation note:** Add a `catalogTagline` field to each product in `productFacts` (`src/data/products.ts`) and use it in `ProductCard` in place of `getCatalogDescription(product)`. Keep the existing `shortDescription` untouched — it's still the right copy for the product page itself; this is a second, shorter field for the card context only.

---

## 6. Research Use, Quality & Documentation Section

**Eyebrow:** Research Use Only

**Headline:** Research Use, Quality & Documentation

**Subheadline:** A plain explanation of how Encore Bio Labs positions its catalog, documentation, and product information.

### Card 1 — What "research use only" actually means

**What this means:**
- Sold for laboratory research use only
- Not intended for human or animal consumption
- Not a supplement, drug, or cosmetic product

**What this doesn't mean:**
- This is not medical advice, dosing guidance, use instructions, or a treatment recommendation
- Nothing here suggests what a compound will do for you personally
- It does not replace a conversation with a licensed healthcare provider

**Closing line:** If you're a qualified researcher or institution evaluating these compounds for a real research question, this catalog is built for you. If you're looking for medical guidance, please speak with a licensed healthcare provider.

### Card 2 — Documentation isn't an afterthought here

**Intro:** Identity and purity documentation, storage guidance, and batch-level records are available when requested, not hidden behind vague claims.

- **Identity & purity documentation** — Certificate of analysis availability can be requested through the intake process, product by product.
- **Storage guidance** — Format-specific storage and handling expectations are noted on each product page.
- **Batch records** — Batch-level documentation is organized and available when requested.

**Badge row:** Research Use Only · Documentation by Request · Not Medical Advice

**Implementation note:** Matches `ResearchUseQualitySection` in `CatalogPage.tsx` almost exactly as already built — this section was already written well and needs no structural change, only confirmation. No new certifications, lab names, or testing statistics should be added here; "documentation by request" stays true to what the business can actually deliver today.

---

## 7. Final CTA

**Eyebrow:** Need help narrowing the catalog?

**Headline:** Start with a product page, or let a person help you narrow it down.

**Body copy:** Product pages explain identity, format, research context, and documentation pathways without turning the catalog into a treatment or dosing guide.

**CTA:** "Start Research Intake" (→ `/intake`) · "Visit Research Library" (→ `/research`)

**Implementation note:** Matches the existing closing CTA in `CatalogPage.tsx` — copy-only refinement, dark gradient card consistent with the rest of the site's closing-CTA pattern.
