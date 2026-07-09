# Encore Bio Labs — About Page Content

Full written content for `/about`. A working `AboutPage.tsx` already exists in the codebase (hero, a 3-card "Operating Principles" section, two internal-link grids, and a closing CTA) — this is fuller, warmer content for that same page, covering the eight sections requested, including two (What We Believe, and Local El Paso Support & Nationwide Shipping) that aren't on the page yet at all.

**On "founder-led but not fake":** this is written in first-person-plural ("we") voice — direct, plainspoken, a little opinionated — without inventing a named founder, a backstory, a title, or credentials. That's the honest version of "founder-led" available here: a real point of view, without a fabricated person behind it.

**Compliance applied throughout:** no invented team members, advisors, lab ownership, certifications, or statistics anywhere in this document. Every operational claim (categories, documentation-on-request, El Paso delivery, Mexico shipping +$20) is something already true and already stated elsewhere on the site — nothing new is asserted here that the business can't back up.

---

## 1. Hero

**Eyebrow:** About Encore Bio Labs

**Headline:** We built the catalog we wished we could find.

**Subheadline:** Encore Bio Labs supports research teams sourcing peptides and compounds across metabolic, recovery, longevity, cognitive, and hormonal research. We built the catalog to replace sterile spreadsheets and hype-driven storefronts with clear science, practical documentation pathways, and human procurement support.

**CTA:** "Browse Research Categories" (→ `/#products`) · "Start a Research Profile" (→ `/intake`)

**Side card (compliance callout, keep from existing page):** "Compliance is part of the product experience." For Research Use Only (RUO). Not for use in diagnostic or therapeutic procedures. Encore Bio Labs does not provide medical advice, treatment recommendations, dosing protocols, or outcome promises. Links to Terms of Service and the Safety & Compliance FAQ section.

**Implementation note:** Keep the existing two-column hero layout and the RUO side card as-is — just swap in the headline/subheadline above. No structural change needed here.

## 2. Why Encore Exists

**Eyebrow:** Why Encore Exists

**Headline:** Because "trust me" isn't documentation.

**Body copy:** Many research-use catalogs ask you to trust vague categories, thin product pages, and generic order forms. We take a different path. We put research context on the page, organize compounds around biology instead of search keywords, and review every inquiry with a person who can help clarify sourcing, documentation, and fulfillment needs.

**Implementation note:** Net-new prose section — this is the gap between the existing hero (which gestures at "clarity" as an abstract value) and an actual explanation of the problem being solved. Place directly after the hero.

## 3. What We Believe

**Eyebrow:** What We Believe

**Headline:** A few things we don't compromise on.

**Belief statements:**
- **You should be able to ask for documentation directly, not chase a vague claim.** When identity, purity, or batch records are available, we help route that request clearly.
- **Categories should reflect real biology, not search-engine keywords.** If a compound doesn't fit cleanly into one research area, we say so, rather than forcing it into a category for SEO reasons.
- **"Research use only" is a real boundary, not a loophole.** We'd rather lose a sale than blur that line.
- **You shouldn't need to already be an expert to find the right part of the catalog.** Plain language and clear organization aren't the same as dumbing anything down.
- **We read every inquiry before anything ships.** Context matters in research procurement.

**Implementation note:** Net-new section. A simple five-item list (icon + short statement, no long body copy needed per item) reads better here than another three-card grid, to visually distinguish it from the existing "Operating Principles" cards elsewhere on the page.

## 4. How the Catalog Is Organized

**Eyebrow:** How the Catalog Is Organized

**Headline:** Five research areas. No duplicate product cards.

**Body copy:** Every product on Encore Bio Labs sits inside one of five research categories: Metabolic & Weight Management, Recovery & Regeneration, Longevity & Cellular Health, Cognitive & Performance, and Hormone & Wellness. Where a product comes in multiple strengths or formats, those live inside one product page as variants — not as separate, duplicated catalog entries. Each category page explains the shared biology behind the products in it before you ever get to a "buy" decision, and every product page includes format options, research context, and documentation availability in one place.

**CTA:** "Explore Categories" (→ `/#products`)

**Implementation note:** This can absorb and reframe the existing `InternalLinkGrid` of the five categories already on the page — add this paragraph as the intro copy above that grid rather than leaving the grid to stand alone with just a heading.

## 5. Quality and Documentation Philosophy

**Eyebrow:** Quality & Documentation

**Headline:** We'd rather tell you what's available than dress up the page.

**Body copy:** We coordinate identity and purity documentation, storage guidance, and batch-level records through the intake process, product by product. We don't publish purity percentages or testing statistics on product pages if we can't stand behind them for a specific batch. A clear documentation pathway serves research teams better than an impressive-looking number nobody can verify.

**Implementation note:** This can replace or sit alongside the existing "Operating Principles" 3-card section — the current copy ("Documentation on request," "Categories built around research questions," "A person reviews every inquiry") already covers similar ground well; this version adds the explicit "why we don't publish invented statistics" reasoning, which is the part currently missing.

## 6. Research-Use-Only Positioning

**Eyebrow:** Research Use Only

**Headline:** What this page won't do.

**Body copy:** We keep every page inside a research-use boundary. We do not provide medical advice, personal outcome predictions, dosing protocols, or treatment claims. If your team is evaluating these compounds for a qualified research question, we built this catalog for you. If you need medical guidance, speak with a licensed healthcare provider.

**CTA:** "Read the Full Research-Use-Only Explanation" (→ `/#research-use-only`)

**Implementation note:** The existing hero side-card already covers a condensed version of this; this fuller version can live as its own section further down the page rather than duplicating the hero card, with a link back to the homepage's dedicated Research-Use-Only Explanation section for the complete version.

## 7. Local El Paso Support and Nationwide Shipping

**Eyebrow:** Delivery & Shipping

**Headline:** A real place, not just a website.

**Body copy:** Encore Bio Labs supports same-day local courier delivery in the El Paso area and nationwide U.S. shipping for research catalog fulfillment. We also support Mexico shipping for a flat $20 USD addition to standard shipping. We mention this here on purpose: a catalog with a real, locatable delivery footprint gives procurement teams more confidence than a site that could be anywhere.

**CTA:** "See Shipping & Delivery FAQs" (→ `/faq#shipping`)

**Implementation note:** Entirely new section — nothing about El Paso or shipping currently appears anywhere on `/about`. This is a real, low-risk trust signal (specific, verifiable, already true elsewhere on the site) that's currently being left out of the one page most likely to be read by someone deciding whether to trust the business at all.

## 8. Final CTA

**Eyebrow:** Research Discovery

**Headline:** Ready to see where your research question fits?

**Body copy:** Start with the categories, browse the research library, or submit a research profile for human-reviewed follow-up. However you get there, we help connect your research question to a clear next step.

**CTA:** "Start Research Intake" (→ `/intake`) · "Visit Research Library" (→ `/research`)

**Implementation note:** Matches the existing closing CTA on `/about` almost exactly — copy-only refinement, keep the dark gradient closing pattern already in place.

---

## Section order for implementation

Hero → Why Encore Exists → What We Believe → How the Catalog Is Organized (absorbing the existing category link grid) → Quality and Documentation Philosophy (replacing/merging with the existing "Operating Principles" cards) → Research-Use-Only Positioning → Local El Paso Support and Nationwide Shipping (new) → the existing "Trust & Compliance" internal link grid (keep as-is, it's still useful) → Final CTA.
