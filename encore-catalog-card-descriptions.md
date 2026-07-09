# Encore Bio Labs — Catalog Card Descriptions (All 24 Products)

Short catalog-card descriptions for every product currently in `catalogProducts`, each assigned to one of the seven catalog filter categories already coded in `CatalogPage.tsx`'s `getCatalogFilter()` function. Category assignments match that existing logic exactly (including the two special cases: GHK-Cu/AHK-Cu are pulled into Skin & Regenerative Research despite their underlying data category being Recovery & Regeneration, and KLOW is pulled into Essentials despite its underlying data category also being Recovery & Regeneration) — so this list is consistent with what the site already does, not a new categorization scheme.

Each description is 1–2 sentences, grounded in the compound's real research mechanism already established in `productFacts`. Multi-variant products (Retatrutide, CJC-1295 + Ipamorelin, NAD+, HCG, HGH 191AA, PT-141) get exactly one description each, covering the grouped product rather than each strength.

---

## Weight Management

**Retatrutide** — Studied as a triple agonist that engages GLP-1, GIP, and glucagon receptors simultaneously. Research in this area focuses on incretin-pathway signaling and metabolic marker response, not individual outcomes.

**Tesamorelin** — A synthetic GHRH analog studied for its effect on GH-axis signaling and downstream IGF-1 response. Commonly reviewed in visceral-adiposity and metabolic-marker research models.

**CJC-1295 + Ipamorelin** — A combination entry pairing a GHRH analog with a ghrelin-receptor secretagogue for dual-pathway GH-axis research. Grouped as one product since the two are almost always studied together.

**MOTS-C** — A mitochondria-derived peptide studied for its connection to AMPK-linked energy sensing and metabolic-stress research. Distinct in mechanism from the incretin- and GHRH-based compounds in this category.

## Recovery & Regeneration

**Wolverine Stack** — A packaged combination of BPC-157 and TB-500 research themes for studies that look at both compounds together. Organized as one kit rather than two separate research entries.

**BPC-157** — A gastric-derived peptide fragment studied in preclinical models of repair signaling, angiogenesis, and gut-barrier biology. One of the most frequently referenced compounds in tissue-repair research literature.

**TB-500** — A synthetic peptide related to thymosin beta-4, studied for its role in actin regulation and cell-migration research. Often reviewed alongside BPC-157 in recovery-focused study design.

## Cognitive & Performance

**IGF-1 LR3** — A long-acting IGF-1 analog studied for receptor-binding characteristics and downstream cellular-growth signaling. Reviewed in performance-oriented and growth-pathway research contexts.

**Cerebrolysin** — A neurotrophic peptide mixture studied for neuronal-survival models and synaptic-plasticity research. Reviewed as a compound mixture rather than a single-sequence peptide.

**Semax** — A synthetic ACTH-fragment analog studied for neuropeptide signaling and BDNF-related expression. Frequently reviewed alongside Selank in cognitive-research planning.

**Selank** — A synthetic tuftsin analog studied for stress-response and neuroimmune signaling research. Distinguished from Semax by its serotonin-adjacent research angle.

## Longevity

**NAD+** — A central cellular cofactor studied for its role in redox biology, mitochondrial energy metabolism, and sirtuin-linked aging research. One of the most foundational compounds in longevity research literature.

**Glutathione** — An endogenous tripeptide antioxidant studied for redox balance and detoxification enzyme systems. Frequently referenced as the primary intracellular antioxidant buffer in cellular-defense research.

**Epithalon** — A synthetic tetrapeptide studied in telomere-associated, pineal-peptide, and circadian-rhythm research contexts. Positioned in aging-biology literature without any lifespan or outcome claims.

**SS-31** — A mitochondria-targeted peptide studied for its interaction with cardiolipin and inner-membrane stability. One of the most mechanism-specific entries in mitochondrial research literature.

**Thymosin Alpha-1** — An immune-signaling peptide studied for T-cell function and cellular-defense research relevance. Included in longevity research for its overlap with immune-resilience biology.

## Hormone & Wellness

**DSIP** — A neuropeptide studied for sleep-architecture models and neuroendocrine signaling research. Reviewed in the context of stress-response and rest-related biology, not sleep treatment.

**Kisspeptin** — A neuropeptide studied for reproductive-axis signaling and GnRH pulse regulation. Sits upstream in the hormonal-axis research picture relative to downstream gonadotropins like HCG.

**HCG** — A glycoprotein hormone studied for LH/CG receptor signaling and gonadal steroidogenesis research. Acts further downstream in the reproductive axis than upstream regulators like Kisspeptin.

**HGH 191AA** — The 191-amino-acid human growth hormone sequence, studied for GH receptor signaling and IGF-1 axis response. Reviewed in research contexts around growth-hormone-axis biology.

**PT-141** — A melanocortin receptor agonist studied for central nervous system signaling relevant to sexual-wellness research models. Commonly associated with bremelanotide in research literature.

## Skin & Regenerative Research

**GHK-Cu** — A copper tripeptide complex studied for extracellular-matrix remodeling, collagen signaling, and wound-response research. Broader in research scope than its follicle-focused counterpart, AHK-Cu.

**AHK-Cu** — A related copper peptide studied more specifically in follicle and dermal-signaling research contexts. Shares copper-peptide biology with GHK-Cu but with a narrower research focus.

## Essentials

**KLOW** — A research-support kit entry focused on handling, documentation, and companion-component logistics rather than a single biological pathway. Built to keep supporting materials organized for a research order.

---

## Implementation notes

- These descriptions are meant to populate a new `catalogTagline`-style field per product (or replace the existing 1-line taglines from `encore-catalog-page-content.md` if a fuller 1–2 sentence card description is preferred over a single punchy line — this set is the fuller version of that same idea).
- Category assignment source of truth is the existing `getCatalogFilter()` function in `src/components/catalog/CatalogPage.tsx` — if that function's logic ever changes, this grouping should be updated to match rather than the other way around.
- No new compound facts were invented; every mechanism reference matches what's already documented in `productFacts` in `src/data/products.ts`.
