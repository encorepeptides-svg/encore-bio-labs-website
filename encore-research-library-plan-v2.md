# Encore Bio Labs — Research Library Plan (v2)

A refreshed content plan for the Research Library, building on what's already live (`/research`, `src/data/research.ts` — 20 compound deep dives, 10 comparisons, 10 glossary terms, 10 mechanism explainers, 10 beginner topics). This version expands the article list to 25 by closing real catalog gaps, and adds an explicit priority order the earlier plan didn't have.

**Compliance applied throughout:** every title is mechanism- or comparison-first, never outcome-first. Nothing here describes treatment, diagnosis, personal outcomes, or dosing.

---

## 1. Twenty-Five Article Titles

The first 20 match what's already live. The last 5 are new — they close the only real gaps in catalog coverage: **CJC-1295/Ipamorelin, HGH 191AA, TB-500, AHK-Cu, and Selank** currently only appear inside a *combined* article (paired with another compound) and have never had a dedicated title of their own.

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
21. **CJC-1295 and Ipamorelin: Why Two GH-Axis Peptides Are Studied as One** *(new)*
22. **HGH 191AA: The Full-Length Growth Hormone Sequence in Research Context** *(new)*
23. **TB-500 on Its Own: Actin Regulation Beyond the BPC-157 Pairing** *(new)*
24. **AHK-Cu and Follicle-Focused Copper Peptide Research** *(new)*
25. **Selank on Its Own: Tuftsin-Analog Research Beyond the Semax Pairing** *(new)*

**Why these 5 matter:** every one of the 24 real catalog products now has at least one article that names it directly, rather than five products only ever appearing as a supporting mention inside someone else's title.

---

## 2. Ten Comparison Guides

Unchanged from the version already live — these hold up and don't need revision.

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

## 3. Ten Glossary Entries

Also unchanged — short, foundational, and already the most-referenced content type from every other article.

1. **Research Use Only (RUO)** — A classification meaning a product is intended solely for laboratory or institutional research, not for human or animal consumption, diagnosis, or treatment.
2. **Peptide** — A short chain of amino acids linked together, smaller than a full protein.
3. **Lyophilization** — A freeze-drying process that removes water from a compound to stabilize it for storage.
4. **Reconstitution** — The process of dissolving a lyophilized compound into a liquid diluent before research use.
5. **Bacteriostatic Water** — A diluent containing a small amount of preservative, commonly referenced in peptide-research literature.
6. **Receptor Agonist / Antagonist** — An agonist activates a receptor to produce a signaling response; an antagonist blocks or dampens it.
7. **Certificate of Analysis (COA)** — A document from testing showing a batch's measured identity, purity, and other quality attributes.
8. **Half-Life (Research Context)** — The time it takes for half of a compound to be cleared or broken down in a research model.
9. **Peptide Analog** — A modified version of a naturally occurring peptide, designed to alter binding affinity, stability, or duration.
10. **Secretagogue** — A substance that triggers another substance to be secreted (e.g., a compound that prompts growth-hormone release).

## 4. Ten Mechanism Explainers

Also unchanged — these are compound-independent pathway explanations, which is what makes them reusable across multiple deep dives.

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

**Compliance note:** these carry the highest risk of drifting into medical territory, since pathway explanations naturally invite "and that's why it helps with X." Every explainer should end with an explicit research-context boundary line rather than a soft fade-out.

---

## 5. Suggested Internal Links

- **Every article links to at least one real product page** — the 25 article titles above map directly to `/products/:slug`, either one-to-one (e.g., title 20 → Retatrutide) or one-to-many for the combined titles (e.g., title 4 → both BPC-157 and TB-500).
- **Every article links to its category page** (`/categories/:slug`) — the research area the compound belongs to.
- **Deep dives link sideways to comparison guides** that include the same compound (e.g., title 21, CJC-1295/Ipamorelin, links to comparison guide 6).
- **Deep dives and mechanism explainers cross-link** — a deep dive names its mechanism explainer by title, and the explainer links back to every deep dive that relies on it (e.g., mechanism explainer 1 ↔ deep dives 1 and 20, both incretin-related).
- **Glossary terms are hub pages** — every article that uses a glossary term on first mention should link to that term's entry, and the glossary page itself should list which articles reference each term.
- **Category pages link back** — the "From the Research Library" section already built on each category page (`CategoryResearchLinks` in `CategoryPageSections.tsx`) should surface the new 5 titles for their respective categories once written.
- **Cross-taxonomy rule stays in place:** every article links to at least one item from a different content type, so visitors go deeper into the library instead of sideways across similar content.

---

## 6. Priority Order

Recommended build order, highest-value first:

1. **Glossary (all 10)** — shortest to write, referenced by nearly everything else, so writing these first means every later article has something real to link to on first use.
2. **The 5 new gap-filling titles (21–25)** — CJC-1295/Ipamorelin, HGH 191AA, TB-500, AHK-Cu, Selank. These close the only real coverage gaps in the catalog; every other product already has an article.
3. **Mechanism explainers tied to best-seller products** — GLP-1 receptor signaling (#1) and the GH axis (#2) first, since Retatrutide, Tesamorelin, and CJC-1295/Ipamorelin are among the most-viewed product pages; NAD+ redox mechanism (#4) next, since NAD+ is a featured/best-seller product.
4. **Remaining deep dives for best-seller and flagship products** — Retatrutide (#20), GHK-Cu (within #5), Wolverine Stack (#18), NAD+ (#6) — these four map to the current homepage "Frequently Explored" products, so they carry the most traffic of any article.
5. **Remaining deep dives (the rest of 1–19)** — in any order; no single one is materially higher-traffic than another.
6. **Remaining mechanism explainers (#3, #5–10)** — write once their associated deep dives exist, so they have something to link to.
7. **Comparison guides (all 10)** — intentionally last, since every comparison guide depends on at least two deep dives already existing to link to and build on.

---

## Note on scope

This plan doesn't repeat the 10 beginner-education topics from the original Research Library plan (`encore-research-library-plan.md`) — those are still valid and still worth writing, just outside what was asked for this time. If a combined, final reference is useful, the four lists in that earlier document (beginner topics, article categories/taxonomy, landing-page structure) and this one together are the complete plan.
