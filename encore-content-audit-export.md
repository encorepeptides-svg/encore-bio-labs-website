# Encore Bio Labs Current Website Content Export

Purpose: structured export of the current website content for content strategy and rewriting.

Instruction followed: this file inventories the current content only. It does not rewrite website copy.

## Source Map

- App routes and page assembly: `src/App.tsx`
- Homepage hero: `src/components/Hero.tsx`
- Homepage research intake: `src/components/RequestInformation.tsx`
- Category grid: `src/components/CategoryGrid.tsx`
- Featured products/cards: `src/components/FeaturedProducts.tsx`
- Complete kit section: `src/components/CompleteKitDifferentiator.tsx`
- Quality section: `src/components/QualitySection.tsx`
- How it works: `src/components/HowItWorks.tsx`
- Homepage FAQ: `src/components/FAQ.tsx`
- Trust badges: `src/components/TrustBadges.tsx`
- Navigation: `src/components/Navbar.tsx`
- Footer: `src/components/Footer.tsx`
- Shared CTA component: `src/components/CTA.tsx`
- Mobile sticky CTA: `src/components/MobileStickyCTA.tsx`
- Product page route/template: `src/components/product/ProductPage.tsx`
- Product page sections: `src/components/product/ProductPageSections.tsx`
- Product/category data: `src/data/products.ts`
- Standalone AI intake page: `src/components/intake/IntakePage.tsx`
- Intake data and recommendation logic: `src/data/intake.ts`
- Admin lead pages: `src/components/admin/AdminLeadsPage.tsx`
- Global metadata: `index.html`

## Global Navigation

Appears in: `src/components/Navbar.tsx`

- Logo: `/`
- Catalog: `/#featured-products`
- Categories: `/#products`
- Kits: `/#kits`
- AI Intake: `/intake`
- Quality: `/#quality`
- How It Works: `/#how-it-works`
- FAQ: `/#faq`
- Start AI Intake: `/intake`
- Mobile button: `Intake` -> `/intake`

## Global Footer

Appears in: `src/components/Footer.tsx`

Footer description:

> Encore Bio Labs is a premium research-use-only catalog brand built around documentation, quality control, complete research kits, and modern biotech presentation.

Footer compliance language:

> All products and information are intended for research purposes only. They are not medical advice, not intended for human consumption, and final decisions should be reviewed by a qualified professional.

Footer bottom language:

> Research Use Only. Not medical advice. Qualified professional review recommended.

Footer links:

- Catalog: `/#featured-products`
- Categories: `/#products`
- Kits: `/#kits`
- Quality: `/#quality`
- FAQ: `/#faq`
- Website: `https://encorebiolabs.com`
- Instagram: `https://instagram.com/encorebiolabs`
- WhatsApp: `https://wa.me/19153595448`
- Contact: `/#request-information`
- Terms: `/#request-information`
- Privacy: `/#request-information`

## Page: Homepage

Route: `/`

Appears in: `src/App.tsx`, `src/components/Hero.tsx`, `src/components/RequestInformation.tsx`, `src/components/CategoryGrid.tsx`, `src/components/FeaturedProducts.tsx`, `src/components/CompleteKitDifferentiator.tsx`, `src/components/QualitySection.tsx`, `src/components/HowItWorks.tsx`, `src/components/FAQ.tsx`, `src/components/TrustBadges.tsx`

### Current Hero Headline

> Premium research compounds. Organized with clinical precision.

### Current Hero Subheadline

> Encore Bio Labs delivers a premium research catalog experience with COA availability, documentation-led review, complete kit organization, and U.S. / Mexico shipping support.

### Hero Badge

> Research-use-only biotech catalog

### Hero Stats

- COA Available
- Complete Kits
- U.S. Shipping
- Mexico Shipping +$20

### Hero Proof Artifacts

- COA review: Lot-level documentation
- Batch label: Organized product records
- Kit insert: Packaging and handling context

### Hero CTAs

- View Catalog -> `#featured-products`
- Request Catalog Access -> `#request-information`

### Hero Compliance Language

> For research use only. Not medical advice. Qualified professional review recommended.

## Homepage Section: Research Intake

Anchor: `#request-information`

Appears in: `src/components/RequestInformation.tsx`

### Current Section Headline

> Build your Encore Bio Labs research interest profile.

### Current Section Subheadline

> Share contact details, biometrics, goals, and research experience to receive an educational protocol suggestion for qualified professional review.

### Sidebar Headline

> Premium intake with responsible boundaries.

### Sidebar Body

> This flow creates a local customer record, calculates BMI, flags answers for professional review, and produces a research-use-only educational pathway.

### Sidebar Trust/Compliance Bullets

- Not medical advice
- For research-use-only products
- Final decisions should be reviewed by a qualified professional
- Local development database: customers

### Sidebar Contact

> WhatsApp: 9153595448. Research-use-only inquiries only.

### Form Steps

- Contact
- Biometrics
- Goal
- Status
- Experience
- Timeline
- Budget
- Consent

### Form Submit CTA

> Submit for Encore Bio Labs Review

### Consent Language

- I understand Encore Bio Labs products are for research use only.
- I understand this intake does not provide medical advice.
- I agree to be contacted by Encore Bio Labs.
- I confirm the information provided is accurate.

### Consent Panel Language

> Your output is an educational protocol suggestion for research-use-only products. Final decisions should be reviewed by a qualified professional.

### Results/Notes Language

Generated notes include:

- Educational protocol suggestion only. Suggested categories: `[dynamic categories]`.
- Professional review recommended before any research protocol is considered.
- Final decisions should still be reviewed by a qualified professional.
- Not medical advice. For research-use-only products.

## Homepage Section: Category Grid

Anchor: `#products`

Appears in: `src/components/CategoryGrid.tsx`, category data in `src/data/products.ts`

### Current Section Headline

> A premium catalog built around research intent.

### Current Section Subheadline

> Explore Encore Bio Labs products by focused biotechnology programs, then request documentation, availability, or kit details through the approved process.

### Current CTA

- View Products -> `#featured-products`

### Current Category Descriptions

Appears in: `researchAreas` in `src/data/products.ts`

- Metabolic & Weight Management: Research focused on metabolic pathways, body composition, and energy regulation.
- Recovery & Regeneration: Research involving tissue repair, recovery, and regenerative peptide science.
- Longevity & Cellular Health: Advanced research into cellular resilience, mitochondrial function, and healthy aging.
- Cognitive & Performance: Research supporting cognition, neurobiology, and human performance.
- Hormone & Wellness: Hormonal signaling and wellness-related research compounds.

### Current Category Product Labels

- Metabolic & Weight Management: Retatrutide, Tesamorelin, MOTS-c, AOD-9604, CJC-1295 / Ipamorelin
- Recovery & Regeneration: BPC-157, TB-500, Wolverine Stack, KLOW, GHK-Cu
- Longevity & Cellular Health: NAD+, SS-31, Epithalon, Glutathione, Thymosin Alpha-1
- Cognitive & Performance: Cerebrolysin, Semax, Selank, Dihexa, IGF-1 LR3
- Hormone & Wellness: Kisspeptin, HCG, HGH, DSIP

Note: AOD-9604 and Dihexa appear in category labels but are not present in the current `catalogProducts` export.

## Homepage Section: Featured Products

Anchor: `#featured-products`

Appears in: `src/components/FeaturedProducts.tsx`, product data in `src/data/products.ts`

### Current Section Headline

> Best Sellers, Organized With Clarity.

### Current Section Subheadline

> Explore our most requested research catalog entries, grouped for easier review and cleaner comparison.

### Current Product Card CTAs

- View Product -> `/products/:slug`

### Featured/Best Seller Product Slugs

Appears in: `bestSellers` in `src/data/products.ts`

- retatrutide
- ghk-cu
- wolverine-stack
- nad-plus

### Product Card Labels

- Best seller
- Flagship program entry
- Variants grouped
- Records by request
- Kit context

## Homepage Section: Complete Research Kits

Anchor: `#kits`

Appears in: `src/components/CompleteKitDifferentiator.tsx`

### Current Section Headline

> Everything organized in one complete research kit.

### Current Section Subheadline

> Encore Bio Labs packages key supporting components together where applicable, including measured BAC water, documentation, and premium packaging, so the research kit arrives organized from the start.

### Current Tags

- Convenience
- Consistency
- Organization

### Current CTAs

- View Catalog -> `#featured-products`
- Browse Product Catalog -> `#featured-products`

### Current Feature Cards

- Measured BAC Water: Included where applicable to support a more organized kit experience.
- Complete Kit Packaging: Supporting components are grouped together instead of sourced separately.
- Research Documentation: Product context and documentation requests stay connected to the catalog workflow.
- Premium Fulfillment: Packaging, labeling, and fulfillment details are part of the premium brand experience.

### Current Image Overlay Labels

- Compound
- BAC water
- Docs
- Packaging

## Homepage Section: Quality

Anchor: `#quality`

Appears in: `src/components/QualitySection.tsx`

### Current Section Headline

> Documentation-first standards for research catalog review.

### Current Section Subheadline

> Encore Bio Labs presents quality through COA availability, organized records, transparent sourcing language, and clear research-use-only boundaries.

### Current Internal Card Heading

> Quality record

### Current Quality Record Items

- COA availability
- Organized product records
- Transparent sourcing language
- Research-use-only positioning

### Current Workflow Cards

- COA availability: Certificate availability can be reviewed through the documentation request process.
- Organized product records: Entries are structured by product, format, variant, and documentation context.
- Research-use-only positioning: Copy stays focused on research documentation, responsible boundaries, and qualified professional review.

### Current Compliance Pills

- Research use only
- Documentation by request
- Not medical advice

## Homepage Section: How It Works

Anchor: `#how-it-works`

Appears in: `src/components/HowItWorks.tsx`

### Current Section Headline

> From catalog review to organized fulfillment.

### Current Section Subheadline

> A simple path for reviewing research products, requesting documentation, and receiving organized kit fulfillment.

### Current Steps

1. Browse the research catalog: Explore products by category, format, and availability.
2. Review product documentation: Request COA availability, product records, and supporting catalog context.
3. Request information: Submit catalog, kit, shipping, or documentation questions through the approved process.
4. Receive organized fulfillment: Approved orders are fulfilled with premium packaging and kit documentation context.

### Current CTA

- Browse Product Catalog -> `#featured-products`

## Homepage Section: FAQ

Anchor: `#faq`

Appears in: `src/components/FAQ.tsx`

### Current Section Headline

> Common research catalog questions.

### Current Section Subheadline

> Clear answers about research-use-only positioning, documentation, shipping, complete kits, and contact options.

### Current FAQs

#### What does Research Use Only mean?

Research Use Only means products and information are intended for qualified research purposes only. They are not medical advice, not intended for human consumption, and final decisions should be reviewed by a qualified professional.

#### Are COAs available?

COA availability is part of the Encore Bio Labs documentation workflow. Product documentation can be requested through the approved information process.

#### Do you ship in the United States?

Yes. Encore Bio Labs supports U.S. shipping for research catalog fulfillment through the approved process.

#### Do you ship to Mexico?

Yes. Mexico shipping is available and adds $20 USD to standard shipping.

#### What is included in a complete research kit?

Complete research kits are organized to include key supporting components where applicable, including measured BAC water, documentation, and premium packaging.

#### Can I request product documentation?

Yes. Product documentation, COA availability, and organized product records can be requested through the information request process.

#### How do I contact Encore Bio Labs?

Use the request information form, visit encorebiolabs.com, Instagram @encorebiolabs, or WhatsApp 9153595448 for business contact.

## Homepage Section: Trust Badges

Appears in: `src/components/TrustBadges.tsx`

### Current Section Headline

> Documentation, packaging, and fulfillment built for serious research buyers.

### Current Section Subheadline

> Encore Bio Labs gives qualified customers a clearer way to review catalog options, documentation availability, kit components, and fulfillment details before inquiry.

### Current Badges

- COA Available: Certificate availability can be reviewed through the approved documentation request process.
- Research Documentation: Product records, format context, and catalog notes are organized for easier review.
- Premium Packaging: A polished kit experience with consistent presentation and fulfillment cues.
- Fast U.S. Shipping: Domestic fulfillment is organized for efficient research kit delivery.
- Mexico Shipping Available: Mexico shipping is available with a $20 USD addition to standard shipping.
- Complete Research Kits: Supporting kit components are packaged together where applicable.

## Page: Product Detail Pages

Route: `/products/:slug`

Appears in: `src/components/product/ProductPage.tsx`, `src/components/product/ProductPageSections.tsx`, product data in `src/data/products.ts`

### Current Product Page Routing

- If product slug is `retatrutide`, the page uses the Retatrutide-specific layout.
- All other product slugs use the standard product layout.
- If a product is not found, the page renders the product-not-found state.

## Product Page: Retatrutide

Route: `/products/retatrutide`

Appears in: `src/components/product/ProductPageSections.tsx`, base product data in `src/data/products.ts`

### Current Hero Headline

> The most advanced peptide in its class. Delivered.

### Current Hero Subheadline

> Encore Bio Labs supplies pharmaceutical-grade Retatrutide - the only triple agonist targeting GLP-1, GIP, and glucagon receptors simultaneously. COA verified. Cold-chain guaranteed.

### Current Hero Badge

> Triple GLP-1 agonist · Research grade

### Current Hero Bullets

- GLP-1 + GIP + Glucagon receptor triple agonist
- Independent COA - 99%+ purity, every batch
- Same-day dispatch · Cold-chain packaging included

### Current Hero Stats

- 99.2%: Avg. purity
- 2,400+: Orders shipped
- 24hr: Same-day dispatch

### Current Hero CTAs

- Order Retatrutide -> `/#request-information`
- View lab reports -> `#product-specs`

### Current Retatrutide Sections

- Retatrutide hero
- Phase 2 clinical data
- Research projection tool
- Product overview
- Highlights
- Research-use disclaimer
- Product specs
- Research protocol
- Reconstitution
- Product FAQ
- Related products
- CTA section

### Current Phase 2 Section Headline

> Retatrutide outperforms earlier GLP-1 research.

### Current Phase 2 Subheadline

> Phase 2 research demonstrated up to 24.2% average body weight reduction over 48 weeks.

### Current Phase 2 Labels

- Phase 2 Research
- Research Use Only
- Triple Agonist: GLP-1 • GIP • Glucagon

### Current Projection Tool Headline

> See what's possible with Retatrutide

### Current Projection Tool Subheadline

> Based on Phase 2 clinical data showing ~28% average body weight reduction over 48 weeks.

### Current Projection Tool Disclaimer

> For research and development use only. Projection is based on published Phase 2 data and is not a prediction of individual results. Not intended for human consumption. Not evaluated by the FDA.

### Current Retatrutide Base Product Description

Appears in: `catalogProducts` in `src/data/products.ts`

> A research catalog entry organized for variant comparison, COA request routing, and documentation-first review.

## Product Page: Standard Product Template

Route: `/products/:slug` for all non-Retatrutide products

Appears in: `src/components/product/ProductPageSections.tsx`, generated from `createPageContent` in `src/data/products.ts`

### Current Standard Product Hero Headline

Dynamic:

> `{product.name}`

### Current Standard Product Hero Subheadline

Dynamic:

> `{product.headline}`

Secondary body:

> `{product.shortDescription}`

### Current Standard Hero Bullets

- Research-use only
- Lab-tested quality focus
- Same-day El Paso delivery available
- Nationwide shipping available
- Mexico shipping available +$20

### Current Standard Product CTAs

- View Research Details -> `#product-specs`
- Start Intake -> `/#request-information`
- Contact Encore -> `https://wa.me/19153595448`

### Current Trust Strip Items

- Same-day local El Paso delivery
- Nationwide shipping
- Research-use-only products
- Premium biotech quality standards
- Secure checkout · discreet packaging

### Current Standard Product Sections

- Product hero
- Product trust strip
- What is product?
- Product benefits
- Premium visual break
- Product mechanism
- What's included
- Product quality focus
- Product how it works flow
- Product specs
- Product science
- Research highlights
- Product statistics
- Visual biology
- Who may benefit
- Product differentiator
- Product gallery
- Research-use disclaimer
- FAQ
- Related products
- CTA section

### Current Standard Product Compliance Language

Overview disclaimer:

> Presented for research-use context only. This page does not describe treatment use, therapeutic outcomes, diagnosis, or patient-specific recommendations.

Global product disclaimer:

> For research use only. Not for human consumption. This information is for educational and research-product guidance only and is not medical advice, diagnosis, or treatment.

Product page protocol note pattern:

> This page intentionally avoids treatment, diagnostic, dosing, or outcome claims.

### Current Standard Product CTA Section

Headline:

> Start a compliant review for `{product.name}`.

Body:

> Request screening, product documentation, and catalog guidance through the approved Encore Bio Labs process.

CTAs:

- Start Wellness Screening -> `/#request-information`
- Contact Encore Bio Labs -> `/#request-information`

## Current Product Descriptions

Appears in: `catalogProducts` and final `products` export in `src/data/products.ts`

Note: when a product has `productFacts`, the final exported `products` description is replaced with the product fact overview. Retatrutide uses the base catalog description.

### Base Catalog Product Descriptions

- Retatrutide (`retatrutide`): A research catalog entry organized for variant comparison, COA request routing, and documentation-first review.
- Tesamorelin (`tesamorelin`): A metabolic research entry presented once with supporting documentation and format context.
- Wolverine Stack (`wolverine-stack`): A recovery and repair research entry prepared for complete kit organization and record review.
- BPC-157 (`bpc-157`): A recovery research entry organized for documentation review, study planning, and compliant inquiry routing.
- TB-500 (`tb-500`): A regenerative peptide research entry structured for format clarity and documentation-led review.
- KLOW (`klow`): A research supplies entry for catalog planning, kit context, and documentation-led follow-up.
- IGF-1 LR3 (`igf1-lr3`): A performance research entry structured for concise review, format clarity, and record requests.
- CJC-1295 + Ipamorelin (`cjc1295-ipamorelin`): A combination research entry presented once, with variants grouped for cleaner catalog comparison.
- MOTS-C (`mots-c`): A mitochondrial peptide research entry structured for metabolic signaling review, cellular energy context, and documentation requests.
- NAD+ (`nad-plus`): A longevity research entry built for premium presentation, complete kit context, and documentation review.
- Glutathione (`glutathione`): A research catalog entry with variant visibility and room for supporting documentation requests.
- GHK-Cu (`ghk-cu`): An aesthetic research entry with available options kept together for easier catalog review.
- AHK-Cu (`ahk-cu`): An aesthetic research entry structured for clean display, kit review, and premium positioning.
- Epithalon (`epithalon`): A longevity research entry prepared for premium education, filtering, and record requests.
- Cerebrolysin (`cerebrolysin`): A cognitive research entry prepared for premium presentation and documentation-led follow-up.
- SS-31 (`ss31`): A longevity research entry organized for program conversations and future record detail.
- DSIP (`dsip`): A research entry designed for concise review and documentation-ready follow-up.
- Kisspeptin (`kisspeptin`): A sexual wellness research entry designed to keep product review concise, organized, and inquiry-ready.
- HCG (`hcg`): A sexual wellness research entry structured for clear review, variant visibility, and documentation discussion.
- HGH 191AA (`hgh-191aa`): A performance research entry organized for format review, availability discussion, and documentation routing.
- Thymosin Alpha-1 (`thymosin-alpha-1`): A cellular health research entry organized for education-led review and responsible documentation requests.
- PT-141 (`pt-141`): A sexual wellness research entry with available formats grouped for fast scanning and responsible catalog access.
- Semax (`semax`): A cognitive research entry prepared for premium presentation and responsible documentation review.
- Selank (`selank`): A cognitive research entry with product options grouped inside one clear, reusable card.

### Product Fact Overviews Used As Final Descriptions

- Tesamorelin: Tesamorelin is a synthetic growth-hormone-releasing hormone analog studied for GH-axis signaling, IGF-1 response, visceral-adiposity research models, and metabolic marker review.
- CJC-1295 + Ipamorelin: CJC-1295 plus Ipamorelin is a combination research entry pairing a GHRH analog with a ghrelin-receptor secretagogue for GH-axis pulse, recovery, and body-composition study models.
- MOTS-C: MOTS-C is a mitochondria-derived peptide studied in metabolic stress, AMPK-related signaling, glucose-handling models, and cellular energy adaptation research.
- IGF-1 LR3: IGF-1 LR3 is a long-acting IGF-1 analog studied for IGF-1 receptor signaling, cellular growth models, nutrient uptake, and performance-oriented pathway research.
- BPC-157: BPC-157 is a gastric peptide fragment studied in preclinical repair models, angiogenesis signaling, tendon and ligament research, gut barrier models, and inflammatory stress response.
- TB-500: TB-500 is a synthetic peptide based on a region of thymosin beta-4 studied for actin regulation, cell migration, angiogenesis, and tissue-repair research models.
- Wolverine Stack: Wolverine Stack combines BPC-157 and TB-500 research themes into one recovery-focused kit for repair signaling, cell migration, angiogenesis, and connective-tissue study planning.
- KLOW: KLOW is presented as a research-support kit entry for recovery program organization, handling context, documentation planning, and companion-product workflow clarity.
- NAD+: NAD+ is a central cellular cofactor studied for redox biology, mitochondrial energy metabolism, DNA-repair enzyme activity, sirtuin signaling, and healthy-aging research models.
- Glutathione: Glutathione is a tripeptide antioxidant studied for redox balance, oxidative-stress response, detoxification enzyme systems, and cellular defense research.
- GHK-Cu: GHK-Cu is a copper peptide complex studied for extracellular-matrix remodeling, collagen signaling, wound-response models, skin biology, and aesthetic research.
- AHK-Cu: AHK-Cu is a copper peptide complex studied for follicle biology, dermal signaling, extracellular-matrix context, and aesthetic research models.
- Epithalon: Epithalon is a synthetic tetrapeptide studied in aging biology, pineal peptide research, telomere-associated models, circadian context, and cellular stress-response studies.
- Cerebrolysin: Cerebrolysin is a peptide mixture studied in neurotrophic signaling, neuronal survival models, synaptic plasticity, cognitive research, and neuro-repair pathway context.
- SS-31: SS-31, also known as elamipretide in research literature, is a mitochondria-targeted peptide studied for cardiolipin interaction, inner-membrane stability, oxidative stress, and cellular energy models.
- DSIP: DSIP, or delta sleep-inducing peptide, is a neuropeptide studied for sleep architecture models, neuroendocrine signaling, stress response, and recovery-related research context.
- Kisspeptin: Kisspeptin is a neuropeptide studied for reproductive-axis signaling, GnRH pulse regulation, LH/FSH response, puberty models, and endocrine research context.
- HCG: HCG is a glycoprotein hormone studied for LH-receptor signaling, gonadal steroidogenesis models, fertility research context, and endocrine marker review.
- HGH 191AA: HGH 191AA refers to the 191-amino-acid human growth hormone sequence studied for GH receptor signaling, IGF-1 axis response, protein metabolism, recovery, and body-composition research context.
- Thymosin Alpha-1: Thymosin Alpha-1 is an immune-signaling peptide studied for T-cell function, innate and adaptive immune models, cytokine context, and cellular defense research.
- PT-141: PT-141, also known as bremelanotide in literature, is a melanocortin receptor agonist studied for central nervous system signaling, sexual wellness research models, and neural pathway context.
- Semax: Semax is a synthetic ACTH-fragment analog studied for neuropeptide signaling, BDNF-related expression, cognitive performance models, stress response, and neuroprotection research.
- Selank: Selank is a synthetic tuftsin analog studied for anxiolytic-like research models, immune-neuropeptide signaling, stress response, serotonin system context, and cognitive performance research.

## Current Product FAQs

Appears in: `productFacts` and generated `product.faqs` in `src/data/products.ts`, rendered by `FAQSection` in `src/components/product/ProductPageSections.tsx`

### Generic Product FAQ Patterns Added To Product Pages

These are generated by `createPageContent(product)`.

#### Is `{product.name}` intended for human consumption?

No. For research use only. Not for human consumption. This information is for educational and research-product guidance only and is not medical advice, diagnosis, or treatment.

#### What type of research is `{product.name}` commonly reviewed for?

Dynamic answer based on `productFacts` when available:

> `{product.name}` is commonly reviewed for `{facts.pathway}`. Researchers may also review `{facts.markers}`.

Fallback answer:

> `{product.name}` is reviewed for investigational interest in `{product.category.toLowerCase()}` contexts, where researchers may evaluate pathway-level questions and documentation requirements.

#### Is same-day local El Paso delivery available?

Yes. Same-day local delivery is available in the El Paso area for approved research inquiries, subject to order timing and availability.

#### Do you ship nationwide?

Yes. Nationwide U.S. shipping is available for research catalog fulfillment through the approved inquiry process.

#### Can you ship to Mexico?

Yes. Mexico shipping is available and adds $20 USD to standard shipping.

#### Is BAC water included with `{product.name}`?

Dynamic answer for kit/supply formats:

> `{product.name}` is organized as a complete research kit, so measured BAC water is included where applicable alongside documentation and premium packaging.

Fallback answer:

> `{product.name}` does not include BAC water by default. Measured BAC water is included where applicable on complete research kit formats — ask through the inquiry process if you need it added.

#### Can Encore Bio Labs provide documentation?

Researchers can request available documentation, catalog format details, and product-specific handling context through the approved inquiry process.

#### What storage context applies to `{product.name}`?

Storage expectations can vary by format, lot, and documentation. Review product-specific records and use qualified laboratory handling procedures.

#### Does this page provide dosing instructions?

No. Encore Bio Labs does not provide dosing protocols, treatment instructions, or patient-specific recommendations on product pages.

#### How are variants organized?

Variants live inside one product object so researchers can review available catalog options without duplicate product cards.

#### Are the statistics guaranteed outcomes?

No. Statistics are illustrative research-planning summaries, internal catalog signals, or study-specific context. They are not guaranteed biological or clinical outcomes.

#### Can this product be used for treatment?

No. Products and educational content are for research use only and are not intended to diagnose, treat, cure, or prevent disease.

#### What information should be reviewed before inquiry?

Researchers should review product identity, format, intended research question, storage context, handling requirements, and documentation needs.

#### How does shipping work?

Shipping and handling details are provided through the approved inquiry process and may depend on product format, destination, and packaging requirements.

#### Who should evaluate research suitability?

Qualified professional or institutional oversight should evaluate study design, compliance requirements, handling, and records before use.

### Product-Specific FAQs From `productFacts`

#### Tesamorelin

Q: What is Tesamorelin?

A: Tesamorelin is a synthetic analog of growth-hormone-releasing hormone studied for GH-axis and IGF-1 pathway signaling.

Q: What pathway is most relevant?

A: The main pathway is GHRH receptor activation, pituitary GH signaling, and downstream IGF-1 marker review.

#### CJC-1295 + Ipamorelin

Q: Why are CJC-1295 and Ipamorelin paired?

A: They are commonly paired in research because they act on complementary GH-axis signaling pathways: GHRH receptor and ghrelin receptor models.

Q: Is this one product or two duplicate cards?

A: It is intentionally organized as one combination product with variants inside the product object.

#### MOTS-C

Q: What makes MOTS-C different?

A: MOTS-C is discussed as a mitochondria-derived peptide, so its research context is centered on cellular energy and metabolic stress signaling.

Q: What markers are commonly reviewed?

A: Researchers often review glucose-handling markers, AMPK pathway context, mitochondrial stress response, and exercise-adaptation observations.

#### IGF-1 LR3

Q: What does LR3 mean?

A: LR3 refers to long arginine 3, an IGF-1 analog design discussed in research for altered binding characteristics.

Q: What is the primary research pathway?

A: The primary pathway is IGF-1 receptor signaling with downstream AKT and MAPK pathway context.

#### BPC-157

Q: Is BPC-157 human-approved?

A: No. This catalog page presents BPC-157 for research-use-only context and does not describe approved treatment use.

Q: What research models are most common?

A: Common research contexts include soft-tissue repair, tendon and ligament models, angiogenesis, and gastrointestinal barrier research.

#### TB-500

Q: How is TB-500 different from BPC-157?

A: TB-500 is usually framed around thymosin beta-4, actin regulation, and cell migration, while BPC-157 is often framed around repair signaling and gut-tissue models.

Q: What is the main research theme?

A: The main research theme is tissue remodeling through cell migration, cytoskeletal dynamics, and angiogenesis context.

#### Wolverine Stack

Q: What is in the Wolverine Stack?

A: It is organized around BPC-157 and TB-500 research themes in one recovery-focused catalog entry.

Q: Does the stack provide instructions for use?

A: No. The page provides research context only and does not include dosing or treatment instructions.

#### KLOW

Q: Is KLOW a single peptide mechanism page?

A: No. KLOW is positioned as a support or kit-context entry, so its page emphasizes organization, handling, and documentation.

Q: What should researchers request?

A: Researchers should request the exact component list, lot details, storage context, and handling documentation.

#### NAD+

Q: What is NAD+?

A: NAD+ is a cofactor involved in redox metabolism, mitochondrial energy production, and NAD-dependent enzyme activity.

Q: Why is NAD+ associated with longevity research?

A: Longevity research often studies NAD+ because it intersects with mitochondrial function, sirtuins, PARP enzymes, and cellular stress response.

#### Glutathione

Q: What is glutathione?

A: Glutathione is an endogenous tripeptide involved in redox balance, antioxidant defense, and detoxification enzyme systems.

Q: What markers are relevant?

A: Common research markers include GSH/GSSG ratio, oxidative-stress markers, liver enzyme context, and inflammation panels.

#### GHK-Cu

Q: What is GHK-Cu?

A: GHK-Cu is a copper tripeptide complex studied for extracellular-matrix, collagen, skin, and repair-biology research.

Q: Is GHK-Cu only for aesthetics?

A: Its research context is often aesthetic, but the underlying biology includes matrix remodeling and wound-response pathways.

#### AHK-Cu

Q: How is AHK-Cu positioned?

A: AHK-Cu is positioned for copper peptide and follicle-focused aesthetic research context.

Q: How is it different from GHK-Cu?

A: GHK-Cu is often framed broadly around skin and matrix remodeling, while AHK-Cu is more commonly framed around follicle and dermal signaling research.

#### Epithalon

Q: What is Epithalon studied for?

A: Epithalon is studied in aging biology, telomere-associated models, pineal peptide context, and circadian research.

Q: Does this page claim lifespan extension?

A: No. It presents research context only and does not claim lifespan extension or therapeutic benefit.

#### Cerebrolysin

Q: What is Cerebrolysin?

A: Cerebrolysin is a peptide mixture studied for neurotrophic signaling, neuronal survival, and cognitive-research models.

Q: Is this page making neurological treatment claims?

A: No. The page is research-use-only and does not describe treatment, diagnosis, or guaranteed cognitive outcomes.

#### SS-31

Q: What is SS-31?

A: SS-31 is a mitochondria-targeted tetrapeptide studied for cardiolipin-associated mitochondrial membrane biology.

Q: Is SS-31 the same as elamipretide?

A: SS-31 is commonly associated with elamipretide in research literature, but this catalog page is research-use-only and not a treatment page.

#### DSIP

Q: What does DSIP stand for?

A: DSIP stands for delta sleep-inducing peptide, a neuropeptide studied in sleep and neuroendocrine research contexts.

Q: Does this page provide sleep treatment advice?

A: No. It provides research context only and does not provide treatment advice or dosing protocols.

#### Kisspeptin

Q: What is Kisspeptin?

A: Kisspeptin is a neuropeptide studied as a regulator of reproductive-axis and GnRH signaling.

Q: What markers are commonly reviewed?

A: Common research markers include LH, FSH, GnRH-axis context, and sex-steroid marker panels where appropriate.

#### HCG

Q: What is HCG?

A: HCG is human chorionic gonadotropin, a glycoprotein hormone studied for LH/CG receptor signaling and reproductive biology.

Q: Does this page provide fertility treatment instructions?

A: No. It is research-use-only and does not provide treatment instructions or dosing protocols.

#### HGH 191AA

Q: What does 191AA mean?

A: 191AA refers to the 191-amino-acid human growth hormone sequence commonly discussed in somatropin research.

Q: What markers are relevant?

A: IGF-1, glucose markers, lipid markers, and body-composition context are commonly reviewed in GH-axis research.

#### Thymosin Alpha-1

Q: What is Thymosin Alpha-1?

A: Thymosin Alpha-1 is a peptide studied for immune signaling, T-cell context, and innate/adaptive immune response models.

Q: Does this page claim immune treatment effects?

A: No. It presents research context only and does not claim to treat or prevent disease.

#### PT-141

Q: What is PT-141?

A: PT-141 is a melanocortin receptor agonist studied for central nervous system signaling and sexual wellness research models.

Q: Is this a prescription or treatment page?

A: No. This is a research-use-only catalog page and does not provide treatment claims or instructions.

#### Semax

Q: What is Semax?

A: Semax is a synthetic ACTH-fragment analog studied for neuropeptide signaling, cognitive models, and neurotrophic marker context.

Q: Does Semax guarantee focus benefits?

A: No. The page presents research context only and does not guarantee cognitive outcomes.

#### Selank

Q: What is Selank?

A: Selank is a synthetic tuftsin analog studied for stress-response, neuroimmune, and cognitive wellness research models.

Q: Does Selank treat anxiety?

A: No. This page is research-use-only and does not claim to diagnose, treat, cure, or prevent anxiety or any condition.

## Page: Standalone AI Intake

Route: `/intake`

Appears in: `src/components/intake/IntakePage.tsx`, data/recommendation logic in `src/data/intake.ts`

### Current Hero Headline

> Build a research profile in minutes.

### Current Hero Subheadline

> A premium educational intake that matches research interests with Encore Bio Labs categories and product pages.

### Current Sidebar Bullets

- Research-use-only language throughout
- All biometrics grouped on one page
- Local lead database ready for backend connection
- Product recommendations link to catalog pages

### Current Compliance Boundary

> Outputs are educational research summaries only. The intake does not provide private review instructions, personal health direction, or promised outcomes.

### Current Form Steps

- Goal
- Biometrics
- Lifestyle
- Experience
- Contact

### Current Form Cards

Trust card:

> Your information helps us create a more relevant research profile.

Trust card body:

> Your intake responses are stored securely and used only to review your research interests, product fit, and follow-up preferences. We do not sell your personal information.

Review process body:

> After submission, your intake is reviewed internally by the Encore Bio Labs support team. The AI intake system helps organize your research profile and product matches, but final recommendations are reviewed before any private follow-up is sent.

Review process steps:

- You complete the intake
- AI organizes your research profile
- Encore Bio Labs reviews and follows up privately

Next steps title:

> Your profile moves into internal review after submission.

Next steps body:

> After you submit, we will review your profile and send your product recommendation through your preferred contact method: email, SMS, or WhatsApp. Public results on the website will only show product categories and general research information.

Not medical advice body:

> Encore Bio Labs provides research-use-only educational information. The intake does not provide medical advice, diagnosis, treatment, prescription guidance, or clinical care. Any health-related decisions should be discussed with a licensed medical professional.

Response timeline body:

> Typical follow-up timing depends on review volume and profile complexity. Most profiles are reviewed in order received. If more information is needed, our team may contact you before sending a recommendation.

### Current Submit CTA

> Submit for Review

### Current Consent Language

- I understand Encore Bio Labs products are for research-use-only.
- I understand this intake does not provide medical advice, diagnosis, treatment, or prescriptions.
- I confirm the information I provided is accurate to the best of my knowledge.
- I agree to be contacted through my selected method: email, SMS, or WhatsApp.
- I understand any private recommendation is subject to internal review.

### Current Results Headline

> Your research profile has been submitted.

### Current Results Body

> Thank you. Your intake has been received and will be reviewed by the Encore Bio Labs team. Your public results page may show general product categories, but any product-specific private recommendation will only be sent after review through your selected contact method.

### Current Results CTAs

- Browse Products -> `/#featured-products`
- Return Home -> `/`
- Contact Support -> `/#request-information`

## Page: Admin Leads

Route: `/admin/leads`

Appears in: `src/components/admin/AdminLeadsPage.tsx`, localStorage helpers in `src/data/intake.ts`

### Current Hero/Page Headline

> Lead intake database

### Current Subheadline

> Local placeholder database for AI intake submissions, ready to connect to Supabase, Firebase, Airtable, or PostgreSQL.

### Current Empty State

Headline:

> No leads submitted yet.

Body:

> Completed AI intake forms will appear here.

CTA:

- Open intake -> `/intake`

## Page: Admin Lead Detail

Route: `/admin/leads/:id`

Appears in: `src/components/admin/AdminLeadsPage.tsx`, localStorage helpers in `src/data/intake.ts`

### Current Hero/Page Headline

Dynamic:

> `{firstName} {lastName}`

### Current Page Content

Admin lead detail content includes:

- Contact information
- Status
- Preferred follow-up
- Intake data
- Recommended products
- Protocol/review fields
- Internal notes
- Send/follow-up controls

### Current Not Found State

Headline:

> This lead is not available.

CTA:

- Back to leads -> `/admin/leads`

## Page: Product Not Found

Route: `/products/:slug` when slug does not match a product

Appears in: `src/components/product/ProductPage.tsx`

### Current Hero/Page Headline

> This product page is not available.

### Current Subheadline

> Return to the Encore Bio Labs catalog to continue exploring research-use entries.

### Current CTA

- Back to catalog -> `/#featured-products`

## Current Global Metadata

Appears in: `index.html`

### Current Meta Description

> Premium research-grade compounds, complete kits, COA availability, and documentation-led catalog review from Encore Bio Labs.

### Current Open Graph Title

> Encore Bio Labs | Research-grade compounds

### Current Open Graph Description

> Premium research-use catalog with complete kits, COA availability, and U.S. / Mexico shipping support.

### Current Twitter Title

> Encore Bio Labs | Research-grade compounds

### Current Twitter Description

> Premium research-use catalog with complete kits, COA availability, and U.S. / Mexico shipping support.

## Current Compliance Language Inventory

### Global/Product Disclaimer

Appears in: `globalResearchDisclaimer` in `src/data/products.ts`

> For research use only. Not for human consumption. This information is for educational and research-product guidance only and is not medical advice, diagnosis, or treatment.

### Homepage Hero Compliance

Appears in: `src/components/Hero.tsx`

> For research use only. Not medical advice. Qualified professional review recommended.

### Homepage FAQ RUO Explanation

Appears in: `src/components/FAQ.tsx`

> Research Use Only means products and information are intended for qualified research purposes only. They are not medical advice, not intended for human consumption, and final decisions should be reviewed by a qualified professional.

### Footer Compliance

Appears in: `src/components/Footer.tsx`

> All products and information are intended for research purposes only. They are not medical advice, not intended for human consumption, and final decisions should be reviewed by a qualified professional.

### Intake Compliance Boundary

Appears in: `src/components/intake/IntakePage.tsx`

> Outputs are educational research summaries only. The intake does not provide private review instructions, personal health direction, or promised outcomes.

### Intake Not Medical Advice

Appears in: `src/components/intake/IntakePage.tsx`

> Encore Bio Labs provides research-use-only educational information. The intake does not provide medical advice, diagnosis, treatment, prescription guidance, or clinical care. Any health-related decisions should be discussed with a licensed medical professional.

### Retatrutide Projection Disclaimer

Appears in: `src/components/product/ProductPageSections.tsx`

> For research and development use only. Projection is based on published Phase 2 data and is not a prediction of individual results. Not intended for human consumption. Not evaluated by the FDA.

### Standard Product Overview Disclaimer

Appears in: `src/components/product/ProductPageSections.tsx`

> Presented for research-use context only. This page does not describe treatment use, therapeutic outcomes, diagnosis, or patient-specific recommendations.

## Notes For Content Strategist

- Product content is mostly centralized in `src/data/products.ts`.
- Homepage, FAQ, quality, kit, trust, CTA, and form copy are embedded directly in component files.
- There are no standalone category page routes yet; category copy appears only inside the homepage category grid and product category data.
- Product pages are generated from a shared template, with Retatrutide using a custom template.
- Retatrutide currently contains stronger claim language and calculator/projection copy than the standard product pages.
- The homepage has two intake-related experiences in the codebase: the homepage `RequestInformation` form and the standalone `/intake` page. They use different localStorage keys and data shapes.
- `hcg`, `pt-141`, `semax`, and `selank` exist as product records and are reachable by `/products/:slug`, but are not included in `productPageSlugs`.
