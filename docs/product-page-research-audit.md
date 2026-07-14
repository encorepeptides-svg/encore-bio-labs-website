# Encore Bio Labs product-page research audit

Audit date: 2026-07-12  
Scope: every active public product route except Retatrutide. Retatrutide was inspected only as the design benchmark and regression control.

## Architecture and implementation

- `src/data/products.ts` remains the only catalog source for product identity, variants, price, imagery, purchase rules, specifications, and relationships.
- `productResearchContent.ts` owns the typed, slug-keyed research registry. `productResearchContentAdditional.ts` is the isolated migration data module composed into that registry; it does not duplicate catalog or pricing records.
- `ProductPage.tsx` renders every non-Retatrutide route and selects the research experience by canonical product slug.
- `ProductResearchExperience.tsx` supplies the evidence badges, snapshot, compound overview, study method, mechanism pathway, research-area grid, source cards, limitations, FAQ, and references.
- Retatrutide continues to branch to its dedicated page before the shared research experience is rendered.
- BAC Water is handled as an accessory with no peptide mechanism. KLOW receives an identity/documentation page because the current catalog does not establish its molecular composition.
- Existing title, meta description, and canonical behavior remains. The project does not currently provide global Open Graph product tags or product structured data; this remains an SEO limitation outside the research-content migration.

## Final route audit

Rendered word counts were measured from each final `<main>` at the local review server. All 23 routes had product imagery, unique research content, RUO language, shared purchase behavior, and zero horizontal overflow at the 1280 px browser check.

| Product | Route | Words | Mechanism | Research areas | Sourced studies | Citations | Unique content | Generic scientific copy | Image | Final status |
|---|---|---:|---|---|---:|---|---|---|---|---|
| Tesamorelin | `/products/tesamorelin` | 1,353 | Yes | Yes | 3 | Yes | Yes | No | Yes | Populated |
| Wolverine Stack | `/products/wolverine-stack` | 1,240 | Yes, separated by component | Yes | 3 | Yes | Yes | No | Yes | Populated |
| KLOW | `/products/klow` | 851 | No biological mechanism assigned | Documentation areas | 0 | Not applicable | Yes | No | Yes | Populated; identity verification required |
| IGF-1 LR3 | `/products/igf1-lr3` | 1,119 | Yes | Yes | 2 | Yes | Yes | No | Yes | Populated |
| CJC-1295 + Ipamorelin | `/products/cjc1295-ipamorelin` | 1,124 | Yes, separated by component | Yes | 2 | Yes | Yes | No | Yes | Populated |
| MOTS-C | `/products/mots-c` | 1,249 | Yes | Yes | 3 | Yes | Yes | No | Yes | Populated |
| AOD-9604 | `/products/aod-9604` | 1,103 | Proposed, uncertainty labeled | Yes | 2 | Yes | Yes | No | Yes | Populated |
| NAD+ | `/products/nad-plus` | 1,166 | Yes | Yes | 2 | Yes | Yes | No | Yes | Populated |
| Glutathione | `/products/glutathione` | 1,072 | Yes | Yes | 2 | Yes | Yes | No | Yes | Populated |
| GHK-Cu | `/products/ghk-cu` | 1,073 | Proposed | Yes | 2 | Yes | Yes | No | Yes | Populated |
| AHK-Cu | `/products/ahk-cu` | 974 | Proposed | Yes | 1 | Yes | Yes | No | Yes | Populated; limited evidence |
| Epithalon | `/products/epithalon` | 993 | Proposed | Yes | 1 | Yes | Yes | No | Yes | Populated; limited evidence |
| Cerebrolysin | `/products/cerebrolysin` | 933 | Multi-target hypothesis | Yes | 2 | Yes | Yes | No | Yes | Populated |
| SS-31 | `/products/ss31` | 1,057 | Yes | Yes | 2 | Yes | Yes | No | Yes | Populated |
| DSIP | `/products/dsip` | 1,063 | Uncertain, labeled | Yes | 2 | Yes | Yes | No | Yes | Populated; weak evidence |
| Kisspeptin | `/products/kisspeptin` | 1,049 | Yes | Yes | 2 | Yes | Yes | No | Yes | Populated |
| HCG | `/products/hcg` | 1,039 | Yes | Yes | 2 | Yes | Yes | No | Yes | Populated |
| HGH 191AA | `/products/hgh-191aa` | 1,085 | Yes | Yes | 2 | Yes | Yes | No | Yes | Populated |
| Thymosin Alpha-1 | `/products/thymosin-alpha-1` | 1,076 | Multi-pathway hypothesis | Yes | 2 | Yes | Yes | No | Yes | Populated |
| PT-141 | `/products/pt-141` | 1,000 | Proposed | Yes | 1 | Yes | Yes | No | Yes | Populated |
| Semax | `/products/semax` | 1,054 | Proposed | Yes | 2 | Yes | Yes | No | Yes | Populated |
| Selank | `/products/selank` | 1,043 | Proposed | Yes | 2 | Yes | Yes | No | Yes | Populated |
| BAC Water | `/products/bac-water` | 707 | Not applicable | Specification areas | 0 | Not applicable | Yes | No | Yes | Populated accessory page |

## Evidence coverage

- Human clinical or endocrine evidence: Tesamorelin, CJC-1295, Ipamorelin, Cerebrolysin, SS-31/elamipretide, DSIP, Kisspeptin, HCG, HGH/somatropin, Thymosin Alpha-1, and PT-141/bremelanotide.
- Human observational/physiology context: MOTS-C and NAD+.
- Primarily animal, cell, ex-vivo, or mechanistic evidence: Wolverine Stack components, IGF-1 LR3, AOD-9604, GHK-Cu, AHK-Cu, Epithalon, Semax, and Selank.
- Biochemical role with mixed route-specific human findings: Glutathione.
- No compound literature attached: KLOW, because composition is unverified; BAC Water, because it is an accessory.

Primary or authoritative records link directly to PubMed, FDA review material, or the primary journal page. Every study card includes its model, year, finding, and an explicit limitation. No dose or administration guidance was added.

## Scientific verification notes

- KLOW needs supplier composition and identity documentation before any biological pathway can be attributed to it.
- CJC-1295 + Ipamorelin and Wolverine Stack have separate component evidence streams; no direct combination effect or synergy is claimed.
- AOD-9604 includes FDA's limited-information and characterization warning alongside the mouse study.
- SS-31 includes the neutral MMPOWER-3 primary endpoints.
- DSIP includes the authors' weak/incidental-effect interpretation from the later small controlled study.
- AHK-Cu and Epithalon are intentionally limited to one directly relevant modern source each rather than borrowing evidence from related compounds.
- Pharmaceutical trials do not verify Encore RUO material identity, purity, bioactivity, or expected outcomes; this limitation appears throughout the system.

## Validation record

- Registry coverage test: every active non-Retatrutide slug is present; Retatrutide is absent; 36/36 unit tests passed.
- Browser route sweep: all 23 enriched routes rendered the research system; zero horizontal overflow at 1280 px.
- Catalog regression: rendered successfully with zero horizontal overflow.
- Retatrutide regression: retained the dedicated page and did not render the shared research snapshot.
- Shared component responsive behavior was previously verified at 1440, 1280, 1024, 768, 430, and 375 px during the three-page pilot; Phase 5 uses the same layout and adds data only.
- Lint: passed with two Fast Refresh warnings in `src/i18n/LocaleContext.tsx`, outside the research-page files.
- Production build: passed. Vite reported the existing large-chunk advisory for the main bundle.
