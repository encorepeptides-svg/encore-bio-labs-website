# Encore Bio Labs catalog purchase audit

Audit date: 2026-07-12

## Runtime architecture

- `src/data/products.ts` is the sole runtime product, variation, SKU, base-price, eligibility, and unit source.
- `src/lib/purchaseOptions.ts` is the sole kit-premium and multipack calculation source.
- `encore-catalog-products.json` is an archival content export. It is not imported and contains no pricing.
- All 23 active products appear once. Their 27 variations are nested under the canonical product records.

## Catalog coverage

| Product | Active variation(s) | Purchase options | Kit | Multipack | Data note |
| --- | --- | --- | --- | --- | --- |
| Retatrutide | 10, 15, 20, 25, 30 mg | Vial, Complete Kit, 3/5 pack | Yes | Yes | All five prices and SKUs explicit at runtime |
| Tesamorelin | 10 mg | Vial, Complete Kit, 3/5 pack | Yes | Yes | — |
| Wolverine Stack | BPC-157 + TB-500 | Vial, Complete Kit, 3/5 pack | Yes | Yes | Blend amount is not published; no price-per-mg shown |
| KLOW | 80 mg supply format | Product Only | No—accessory/supply entry | No—quantity breaks not defined | Accessory, not treated as a peptide vial |
| IGF-1 LR3 | 1 mg | Vial, Complete Kit, 3/5 pack | Yes | Yes | — |
| CJC-1295 + Ipamorelin | 5 mg + 5 mg | Vial, Complete Kit, 3/5 pack | Yes | Yes | Combined 10 mg measurement is explicit |
| MOTS-C | 10 mg | Vial, Complete Kit, 3/5 pack | Yes | Yes | — |
| AOD-9604 | 5 mg | Vial, Complete Kit, 3/5 pack | Yes | Yes | — |
| NAD+ | Published vial format | Vial, Complete Kit, 3/5 pack | Yes | Yes | Strength/volume not published; no price-per-unit shown |
| Glutathione | 1500 mg | Vial, Complete Kit, 3/5 pack | Yes | Yes | — |
| GHK-Cu | 50 mg | Vial, Complete Kit, 3/5 pack | Yes | Yes | — |
| AHK-Cu | 50 mg | Vial, Complete Kit, 3/5 pack | Yes | Yes | — |
| Epithalon | 10 mg | Vial, Complete Kit, 3/5 pack | Yes | Yes | — |
| Cerebrolysin | Published ampoule format | Product Only, 3/5 pack | No—ready-to-use ampoule | Yes | Volume/count not published; no price-per-mL shown |
| SS-31 | 10 mg | Vial, Complete Kit, 3/5 pack | Yes | Yes | — |
| DSIP | 5 mg | Vial, Complete Kit, 3/5 pack | Yes | Yes | — |
| Kisspeptin | 10 mg | Vial, Complete Kit, 3/5 pack | Yes | Yes | — |
| HCG | 10,000 IU | Vial, Complete Kit, 3/5 pack | Yes | Yes | Thousands-separated IU parsing verified |
| HGH 191AA | 4 × 15 IU vials | Product Only, Complete Kit | Yes | No—base SKU already contains four vials | Total 60 IU measurement is explicit |
| Thymosin Alpha-1 | 10 mg | Vial, Complete Kit, 3/5 pack | Yes | Yes | — |
| PT-141 | Published vial format | Vial, Complete Kit, 3/5 pack | Yes | Yes | Strength not published; no price-per-unit shown |
| Semax | 10 mg | Vial, Complete Kit, 3/5 pack | Yes | Yes | — |
| Selank | 10 mg | Vial, Complete Kit, 3/5 pack | Yes | Yes | — |

## Pricing rules

- Vial/Product Only: explicit variation base price.
- Complete Kit: base price + centralized `$10` premium, unless a product-specific override is added to its purchase rules.
- Three-vial pack: base price × 3 × 0.92 (8% savings).
- Five-vial pack: base price × 5 × 0.88 (12% savings).
- Optional pack kit: exactly one centralized kit premium per cart line, never one kit per vial.
- Price per mg/IU/mL: selected line total ÷ total measured units. Product-only effective unit price excludes no selected charge; kit-inclusive unit pricing includes the one selected kit premium.

## Flow and limitations

- Catalog, category, homepage, product page, cart, checkout summary, assistant summaries, and stored-cart rehydration all read the canonical runtime data.
- Cart lines persist SKU, option ID, display type, variation, pack size, optional-kit state, effective unit price, savings, line price, and quantity.
- Checkout remains the existing CRM/WhatsApp order-request workflow; no payment is collected.
- Inventory is currently represented as “Availability by request”; no active product is explicitly marked unavailable.
- No active catalog variation currently has a verified mL quantity. mL calculation behavior is covered by a focused calculation test, but an active product should not display price per mL until its volume is supplied.
- Product-specific documentation URLs are not populated in purchase data. Existing COA/documentation modules remain available where already configured.
