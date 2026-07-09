# Encore Bio Labs — Research Library Content Plan

A full plan for the Research Library: the piece of the site that should make Encore feel intelligent and trustworthy rather than just well-designed. Modeled on the depth of Function Health's knowledge hub, Levels' blog, and Ro's condition guides — real explanatory content with a clear information architecture, not a marketing blog with SEO filler.

**Compliance applied throughout:** every title, description, and structural note below is written to stay educational and mechanism-focused. Nothing here describes treatment, diagnosis, personal outcomes, or dosing — see the per-section notes for where that boundary is easiest to accidentally cross (mechanism explainers and beginner topics especially) and how each one is framed to avoid it.

---

## 1. Main Research Library Landing Page

**Route:** `/research`

**Eyebrow:** Research Library

**Headline:** The science behind the catalog.

**Subheadline:** Plain-language explainers, comparisons, and reference material on the research areas Encore Bio Labs covers — written to help you ask better questions, not to replace the primary literature.

**Page structure (top to bottom):**

1. **Hero** — headline/subheadline above, plus a short line reinforcing scope: "Educational content only. Not medical advice. Not a substitute for reading primary research."
2. **Browse by content type** — four entry cards: Compound Deep Dives, Mechanism Explainers, Comparison Guides, Glossary. Each links to a filtered view of the library.
3. **Browse by research category** — five cards mirroring the site's existing categories (Metabolic & Weight Management, Recovery & Regeneration, Longevity & Cellular Health, Cognitive & Performance, Hormone & Wellness), each linking to `/categories/:slug` *and* showing a short list of related articles inline.
4. **Start here (beginner path)** — a small curated shelf of 3–4 beginner topics for first-time visitors, positioned above the full article grid so newcomers aren't dropped straight into deep mechanism content.
5. **Full article grid** — filterable/sortable by content type and category, title + one-line description + reading-time estimate per card.
6. **Research-use-only footer reminder** — same compliance framing as the rest of the site, not a new disclaimer voice.

**CTA:** "Start With the Basics" (→ beginner shelf) · "Browse by Category" (→ category cards)

**Visual direction:** Editorial, not decorative — closer to a well-typeset digital magazine than a marketing page. Generous whitespace, real typographic hierarchy, minimal molecule-background motifs (save those for product pages). Category accent colors (already established per category) can tag article cards for quick visual scanning.

**Notes for Codex implementation:** New route `/research`, new top-level `ResearchLibraryPage` component. Article data should live in a new `src/data/research.ts` file (mirroring the `products.ts` pattern), with each article entry carrying `slug`, `title`, `description`, `contentType`, `relatedCategorySlugs`, `relatedProductSlugs`, and `readingTime`. Do not build full article bodies yet — this phase is information architecture plus landing-page shell; article content is a separate content pass once titles are approved.

---

## 2. Article Categories

The Research Library uses **two independent taxonomies** that cross-link but shouldn't be conflated:

**A. Content type** (how the article teaches):
1. **Compound Deep Dives** — one compound or compound family, explained in depth.
2. **Mechanism Explainers** — one biological pathway or system, explained independent of any single product.
3. **Comparison Guides** — two (occasionally three) products or approaches, compared side by side.
4. **Glossary** — short reference definitions, not full articles.
5. **Beginner Education** — foundational literacy content for visitors new to research-use compounds generally.

**B. Research category** (what it's about) — reuses the site's existing five categories exactly: Metabolic & Weight Management, Recovery & Regeneration, Longevity & Cellular Health, Cognitive & Performance, Hormone & Wellness. A sixth cross-cutting tag, **General Research Practice**, covers content that doesn't belong to a single category (storage, reconstitution science, reading a COA, etc.).

Every article gets exactly one content type and one (or occasionally two) research-category tags. This is what powers both the "browse by type" and "browse by category" entry points on the landing page without duplicating content.

---

## 3. Twenty Article Title Ideas (Compound Deep Dives)

1. Understanding GLP-1, GIP, and Glucagon Receptor Signaling: A Research Primer
2. The GH Axis Explained: GHRH, Ghrelin Receptors, and IGF-1
3. What Makes MOTS-C Different From Other Metabolic Research Peptides?
4. BPC-157 and TB-500: How Two Repair Peptides Are Studied Together
5. Copper Peptides 101: GHK-Cu, AHK-Cu, and the Matrix-Remodeling Research Behind Them
6. Inside NAD+ Research: Redox Biology, Sirtuins, and Cellular Energy
7. Why Glutathione Is Called the "Master Antioxidant" in Research Literature
8. SS-31 and the Mitochondrial Membrane: A Cardiolipin Research Primer
9. Epithalon and the Telomere Research Connection: What's Actually Being Studied
10. Thymosin Alpha-1 and the Immune System: A Research Overview
11. Semax and Selank: Two Neuropeptides in Cognitive Research
12. IGF-1 LR3 Explained: Receptor Binding and Research Applications
13. What Is Cerebrolysin? A Look at Neurotrophic Peptide Mixtures
14. Kisspeptin and the Reproductive Axis: How GnRH Signaling Works
15. HCG and the Gonadotropin Research Story
16. Understanding DSIP: Sleep, Neuroendocrine Signaling, and Research Context
17. PT-141 and the Melanocortin System: A Research Primer
18. The Wolverine Stack: Why Two Recovery Peptides Are Packaged Together
19. KLOW and the Logistics of Kit-Based Research
20. Retatrutide's Triple-Receptor Design: What Sets It Apart

**Framing note:** every title is compound- or mechanism-first ("what is being studied and how"), never outcome-first ("how X helps you"). That distinction is the whole compliance strategy for this content type.

---

## 4. Ten Comparison Guide Ideas

1. Retatrutide vs. Tesamorelin: Two Different Metabolic Research Pathways
2. BPC-157 vs. TB-500: Repair Signaling, Compared
3. GHK-Cu vs. AHK-Cu: Which Research Question Each One Answers
4. NAD+ vs. Glutathione: Two Approaches to Cellular Defense Research
5. Semax vs. Selank: Comparing Cognitive Neuropeptide Research
6. CJC-1295/Ipamorelin vs. Tesamorelin: Comparing GH-Axis Research Approaches
7. SS-31 vs. NAD+: Mitochondrial Research From Two Angles
8. Kisspeptin vs. HCG: Two Points on the Same Reproductive Axis
9. Wolverine Stack vs. Individual BPC-157/TB-500: When Researchers Choose a Combination
10. Vial vs. Kit Formats: Comparing Research Formats Across the Catalog

**Framing note:** comparison guides compare *mechanism, format, and research context* — never "which one works better," which would cross straight into an outcome claim.

---

## 5. Ten Glossary Topics

1. Research Use Only (RUO)
2. Peptide
3. Lyophilization
4. Reconstitution
5. Bacteriostatic Water
6. Receptor Agonist / Antagonist
7. Certificate of Analysis (COA)
8. Half-Life (Research Context)
9. Peptide Analog
10. Secretagogue

**Structure:** each glossary entry is 2–4 sentences, no full article treatment. The glossary page (`/research/glossary`) lists all terms with anchors; every term should also be linkable individually (`/research/glossary#reconstitution`) so other articles can deep-link a definition inline the first time a term is used.

---

## 6. Ten Mechanism-of-Action Explainer Topics

1. How GLP-1 Receptor Signaling Works
2. How GHRH and Ghrelin Receptors Regulate Growth Hormone Release
3. How Copper Peptides Interact With the Extracellular Matrix
4. How NAD+ Powers Redox Reactions and Mitochondrial Energy Production
5. How Cardiolipin Relates to Mitochondrial Inner-Membrane Stability
6. How Angiogenesis and Nitric-Oxide Signaling Relate to Tissue-Repair Research
7. How Actin and Cytoskeletal Remodeling Relate to Cell-Migration Research
8. How BDNF and Neurotrophic Signaling Are Studied in Cognitive Research
9. How the Kisspeptin–GnRH–LH Axis Regulates Reproductive Signaling
10. How Melanocortin Receptors Influence Central Nervous System Signaling

**Framing note:** these are the pieces most at risk of drifting into medical territory, because pathway explanations naturally invite "and that's why it helps with X." Every explainer should end with an explicit research-context boundary line (e.g., "This pathway is an active area of research; it is not a description of any individual health outcome.") rather than a soft fade-out.

---

## 7. Ten Beginner Education Topics

1. What Does "Research Use Only" Actually Mean?
2. How to Read a Peptide Product Page Like a Researcher
3. Peptides vs. Small-Molecule Compounds: What's the Difference?
4. Understanding Vial, Ampoule, and Kit Formats
5. Why Documentation Matters More Than Marketing Claims
6. How to Ask Better Research Questions Before You Order
7. What "Studied For" Really Means (and What It Doesn't Mean)
8. Storage and Handling Basics for Research Compounds
9. How Encore Bio Labs Organizes Its Research Categories (and Why)
10. Common Misconceptions About Peptide Research

**Framing note:** this is the on-ramp for visitors who aren't yet fluent in the vocabulary the rest of the library uses — it should read like a knowledgeable, patient colleague, not a legal disclaimer restated ten times. Each beginner topic should end with a "read next" pointer into either a mechanism explainer or a compound deep dive, building an actual learning path rather than leaving visitors stranded.

---

## 8. Internal Linking Strategy

**From product pages →** each product page links to (a) its compound deep dive if one exists, (b) one relevant mechanism explainer, and (c) its category page. This replaces the placeholder "once built" links noted in the product-template and category-page work already completed.

**From category pages →** each category page's existing "Related Research Topics" section should link to 2–4 Research Library articles tagged with that category, in addition to the related-category cross-links already built. This closes the loop flagged as a to-do in the category-page implementation notes.

**From the homepage →** the existing Educational Resources section should link its five category cards' "Read more" straight through to `/research` filtered by category (or directly to a flagship article per category), rather than only to the category page as it does today.

**Within the library itself:**
- Compound deep dives link to: the product's real page, 1–2 relevant glossary terms (inline, first mention), the relevant mechanism explainer, and any comparison guide that includes that compound.
- Mechanism explainers link to: every compound deep dive whose product relies on that mechanism, and relevant glossary terms.
- Comparison guides link to: both (or all) compared products' pages, both compound deep dives, and the shared category page.
- Glossary terms link to: every article that uses that term meaningfully (glossary acts as a hub page, not a dead end).
- Beginner topics link forward only (never sideways to each other in a closed loop) — each ends with one clear "next" link into deeper content, building a path rather than a maze.

**Cross-taxonomy rule:** every article must link to at least one item from a *different* content type (a deep dive links to a mechanism explainer, not just other deep dives) so visitors are pulled deeper into the library rather than sideways across similar content.

**Notes for Codex implementation:** internal links should be data-driven (`relatedArticleSlugs`, `relatedProductSlugs`, `relatedCategorySlugs`, `relatedGlossaryTerms` fields on each article record) rather than hardcoded in component JSX, so the link graph stays correct as content is added. This mirrors the pattern already used for `relatedProducts` and `relatedCategorySlugs` elsewhere in the codebase.

---

## Sequencing note

This is an information-architecture and title-ideation pass, not finished article copy. Recommended build order: (1) ship the landing page shell and data model with placeholder "coming soon" states, (2) write the 10 glossary entries first since they're short and get referenced everywhere else, (3) write 3–4 beginner topics to give the library an on-ramp, (4) write compound deep dives and mechanism explainers together in pairs (they cross-link heavily), (5) comparison guides last, since they depend on at least two deep dives already existing to link to.
