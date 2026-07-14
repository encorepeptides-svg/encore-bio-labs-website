export type ResearchContentType = 'deep-dive' | 'mechanism' | 'comparison' | 'beginner'

export type ResearchArticle = {
  slug: string
  title: string
  description: string
  contentType: ResearchContentType
  categorySlug: string
  href: string
}

export const contentTypeLabels: Record<ResearchContentType, string> = {
  'deep-dive': 'Compound Deep Dive',
  mechanism: 'Mechanism Explainer',
  comparison: 'Comparison Guide',
  beginner: 'Beginner Education',
}

export const researchArticles: ResearchArticle[] = [
  // Compound Deep Dives
  { slug: 'glp1-gip-glucagon-primer', title: 'Understanding GLP-1, GIP, and Glucagon Receptor Signaling', description: 'A research primer on the incretin-receptor family behind Retatrutide.', contentType: 'deep-dive', categorySlug: 'metabolic-weight-management', href: '/products/retatrutide' },
  { slug: 'gh-axis-explained', title: 'The GH Axis Explained: GHRH, Ghrelin Receptors, and IGF-1', description: 'How growth-hormone-releasing hormone and ghrelin-receptor signaling connect to IGF-1 research.', contentType: 'deep-dive', categorySlug: 'metabolic-weight-management', href: '/products/tesamorelin' },
  { slug: 'mots-c-difference', title: 'What Makes MOTS-C Different From Other Metabolic Research Peptides?', description: 'A mitochondria-derived peptide with a distinct AMPK-linked research profile.', contentType: 'deep-dive', categorySlug: 'metabolic-weight-management', href: '/products/mots-c' },
  { slug: 'bpc157-tb500-together', title: 'BPC-157 and TB-500: How Two Repair Peptides Are Studied Together', description: 'Why these two research peptides are so often reviewed as a pair.', contentType: 'deep-dive', categorySlug: 'recovery-regeneration', href: '/products/wolverine-stack' },
  { slug: 'copper-peptides-101', title: 'Copper Peptides 101: GHK-Cu, AHK-Cu, and Matrix-Remodeling Research', description: 'The shared and distinct research context behind two copper-peptide compounds.', contentType: 'deep-dive', categorySlug: 'recovery-regeneration', href: '/products/ghk-cu' },
  { slug: 'nad-plus-research', title: 'Inside NAD+ Research: Redox Biology, Sirtuins, and Cellular Energy', description: 'How a central metabolic cofactor connects to healthy-aging research.', contentType: 'deep-dive', categorySlug: 'longevity-cellular-health', href: '/products/nad-plus' },
  { slug: 'glutathione-master-antioxidant', title: 'Why Glutathione Is Called the "Master Antioxidant" in Research Literature', description: 'Redox balance, detoxification enzymes, and cellular defense research.', contentType: 'deep-dive', categorySlug: 'longevity-cellular-health', href: '/products/glutathione' },
  { slug: 'ss31-mitochondrial-membrane', title: 'SS-31 and the Mitochondrial Membrane: A Cardiolipin Research Primer', description: 'How SS-31 is studied for inner-membrane stability research.', contentType: 'deep-dive', categorySlug: 'longevity-cellular-health', href: '/products/ss31' },
  { slug: 'epithalon-telomere-connection', title: "Epithalon and the Telomere Research Connection", description: 'What the pineal-peptide and circadian research literature actually says.', contentType: 'deep-dive', categorySlug: 'longevity-cellular-health', href: '/products/epithalon' },
  { slug: 'thymosin-alpha1-immune', title: 'Thymosin Alpha-1 and the Immune System: A Research Overview', description: 'T-cell function and cellular-defense research context.', contentType: 'deep-dive', categorySlug: 'longevity-cellular-health', href: '/products/thymosin-alpha-1' },
  { slug: 'semax-selank-cognitive', title: 'Semax and Selank: Two Neuropeptides in Cognitive Research', description: 'Structurally distinct compounds commonly reviewed together in cognitive research.', contentType: 'deep-dive', categorySlug: 'cognitive-performance', href: '/products/semax' },
  { slug: 'igf1-lr3-explained', title: 'IGF1-LR3 Explained: Receptor Binding and Research Applications', description: 'A long-acting IGF-1 analog and its receptor-signaling research context.', contentType: 'deep-dive', categorySlug: 'hormone-wellness', href: '/products/igf1-lr3' },
  { slug: 'what-is-cerebrolysin', title: 'What Is Cerebrolysin? A Look at Neurotrophic Peptide Mixtures', description: 'Neuronal-survival models and cognitive-research relevance.', contentType: 'deep-dive', categorySlug: 'cognitive-performance', href: '/products/cerebrolysin' },
  { slug: 'kisspeptin-reproductive-axis', title: 'Kisspeptin and the Reproductive Axis: How GnRH Signaling Works', description: 'An upstream regulator of the reproductive-axis research picture.', contentType: 'deep-dive', categorySlug: 'hormone-wellness', href: '/products/kisspeptin' },
  { slug: 'hcg-gonadotropin-story', title: 'HCG and the Gonadotropin Research Story', description: 'LH/CG receptor signaling and gonadal steroidogenesis research.', contentType: 'deep-dive', categorySlug: 'hormone-wellness', href: '/products/hcg' },
  { slug: 'understanding-dsip', title: 'Understanding DSIP: Sleep, Neuroendocrine Signaling, and Research Context', description: 'Sleep-architecture models and neuroendocrine research relevance.', contentType: 'deep-dive', categorySlug: 'hormone-wellness', href: '/products/dsip' },
  { slug: 'pt141-melanocortin-system', title: 'PT-141 and the Melanocortin System: A Research Primer', description: 'Central nervous system signaling research context.', contentType: 'deep-dive', categorySlug: 'hormone-wellness', href: '/products/pt-141' },
  { slug: 'wolverine-stack-why-together', title: 'The Wolverine Stack: Why Two Recovery Peptides Are Packaged Together', description: 'The research logic behind pairing BPC-157 and TB-500 in one kit.', contentType: 'deep-dive', categorySlug: 'recovery-regeneration', href: '/products/wolverine-stack' },
  { slug: 'klow-kit-logistics', title: 'KLOW and the Logistics of Kit-Based Research', description: 'Why a support/kit entry belongs in a research-focused catalog at all.', contentType: 'deep-dive', categorySlug: 'recovery-regeneration', href: '/products/klow' },
  { slug: 'retatrutide-triple-receptor', title: "Retatrutide's Triple-Receptor Design: What Sets It Apart", description: 'The research context behind a triple GLP-1/GIP/glucagon agonist.', contentType: 'deep-dive', categorySlug: 'metabolic-weight-management', href: '/products/retatrutide' },
  { slug: 'cjc1295-ipamorelin-studied-as-one', title: 'CJC-1295 and Ipamorelin: Why Two GH-Axis Peptides Are Studied as One', description: 'The GHRH-plus-secretagogue research logic behind pairing these two compounds.', contentType: 'deep-dive', categorySlug: 'metabolic-weight-management', href: '/products/cjc1295-ipamorelin' },
  { slug: 'hgh-191aa-full-length-sequence', title: 'HGH 191AA: The Full-Length Growth Hormone Sequence in Research Context', description: 'How the 191-amino-acid GH sequence is studied for receptor signaling and IGF-1 axis response.', contentType: 'deep-dive', categorySlug: 'hormone-wellness', href: '/products/hgh-191aa' },
  { slug: 'ahk-cu-follicle-research', title: 'AHK-Cu and Follicle-Focused Copper Peptide Research', description: "How AHK-Cu's research context narrows in on follicle and dermal signaling.", contentType: 'deep-dive', categorySlug: 'recovery-regeneration', href: '/products/ahk-cu' },
  { slug: 'selank-on-its-own', title: 'Selank on Its Own: Tuftsin-Analog Research Beyond the Semax Pairing', description: "A closer look at Selank's standalone stress-response and neuroimmune research context.", contentType: 'deep-dive', categorySlug: 'cognitive-performance', href: '/products/selank' },

  // Comparison Guides
  { slug: 'retatrutide-vs-tesamorelin', title: 'Retatrutide vs. Tesamorelin: Two Different Metabolic Research Pathways', description: 'Incretin-receptor biology compared with GH-axis biology.', contentType: 'comparison', categorySlug: 'metabolic-weight-management', href: '/categories/metabolic-weight-management' },
  { slug: 'bpc157-vs-tb500', title: 'BPC-157 vs. TB-500: Repair Signaling, Compared', description: 'Two mechanisms, one shared research theme.', contentType: 'comparison', categorySlug: 'recovery-regeneration', href: '/categories/recovery-regeneration' },
  { slug: 'ghkcu-vs-ahkcu', title: 'GHK-Cu vs. AHK-Cu: Which Research Question Each One Answers', description: 'Broad matrix research vs. follicle-focused research.', contentType: 'comparison', categorySlug: 'recovery-regeneration', href: '/categories/recovery-regeneration' },
  { slug: 'nad-plus-vs-glutathione', title: 'NAD+ vs. Glutathione: Two Approaches to Cellular Defense Research', description: 'Redox cofactor biology compared with antioxidant buffer biology.', contentType: 'comparison', categorySlug: 'longevity-cellular-health', href: '/categories/longevity-cellular-health' },
  { slug: 'semax-vs-selank', title: 'Semax vs. Selank: Comparing Cognitive Neuropeptide Research', description: 'An ACTH-fragment analog compared with a tuftsin analog.', contentType: 'comparison', categorySlug: 'cognitive-performance', href: '/categories/cognitive-performance' },
  { slug: 'cjc-ipamorelin-vs-tesamorelin', title: 'CJC-1295/Ipamorelin vs. Tesamorelin: Comparing GH-Axis Research Approaches', description: 'A dual-signal combination compared with a single-compound approach.', contentType: 'comparison', categorySlug: 'metabolic-weight-management', href: '/categories/metabolic-weight-management' },
  { slug: 'ss31-vs-nad-plus', title: 'SS-31 vs. NAD+: Mitochondrial Research From Two Angles', description: 'Membrane-targeted biology compared with redox-cofactor biology.', contentType: 'comparison', categorySlug: 'longevity-cellular-health', href: '/categories/longevity-cellular-health' },
  { slug: 'kisspeptin-vs-hcg', title: 'Kisspeptin vs. HCG: Two Points on the Same Reproductive Axis', description: 'Upstream regulation compared with downstream receptor signaling.', contentType: 'comparison', categorySlug: 'hormone-wellness', href: '/categories/hormone-wellness' },
  { slug: 'vial-vs-kit-formats', title: 'Vial vs. Kit Formats: Comparing Research Formats Across the Catalog', description: 'What changes between a single-vial product and a packaged kit.', contentType: 'comparison', categorySlug: 'general', href: '/faq#product-handling' },

  // Mechanism Explainers
  { slug: 'how-glp1-signaling-works', title: 'How GLP-1 Receptor Signaling Works', description: 'The receptor biology behind incretin-focused metabolic research.', contentType: 'mechanism', categorySlug: 'metabolic-weight-management', href: '/categories/metabolic-weight-management' },
  { slug: 'how-ghrh-ghrelin-regulate-gh', title: 'How GHRH and Ghrelin Receptors Regulate Growth Hormone Release', description: 'The dual-pathway model behind GH-axis research.', contentType: 'mechanism', categorySlug: 'metabolic-weight-management', href: '/categories/metabolic-weight-management' },
  { slug: 'how-copper-peptides-interact-ecm', title: 'How Copper Peptides Interact With the Extracellular Matrix', description: 'Matrix-remodeling biology behind GHK-Cu and AHK-Cu research.', contentType: 'mechanism', categorySlug: 'recovery-regeneration', href: '/categories/recovery-regeneration' },
  { slug: 'how-nad-powers-redox', title: 'How NAD+ Powers Redox Reactions and Mitochondrial Energy Production', description: 'The cellular-energy biology behind longevity research.', contentType: 'mechanism', categorySlug: 'longevity-cellular-health', href: '/categories/longevity-cellular-health' },
  { slug: 'how-cardiolipin-relates-to-membrane', title: 'How Cardiolipin Relates to Mitochondrial Inner-Membrane Stability', description: 'The membrane biology behind SS-31 research.', contentType: 'mechanism', categorySlug: 'longevity-cellular-health', href: '/categories/longevity-cellular-health' },
  { slug: 'how-angiogenesis-relates-to-repair', title: 'How Angiogenesis and Nitric-Oxide Signaling Relate to Tissue-Repair Research', description: 'The vascular-signaling research behind BPC-157.', contentType: 'mechanism', categorySlug: 'recovery-regeneration', href: '/categories/recovery-regeneration' },
  { slug: 'how-actin-remodeling-relates-to-migration', title: 'How Actin and Cytoskeletal Remodeling Relate to Cell-Migration Research', description: 'The cytoskeletal biology behind TB-500 research.', contentType: 'mechanism', categorySlug: 'recovery-regeneration', href: '/categories/recovery-regeneration' },
  { slug: 'how-bdnf-neurotrophic-signaling-studied', title: 'How BDNF and Neurotrophic Signaling Are Studied in Cognitive Research', description: 'The signaling research behind Semax and Cerebrolysin.', contentType: 'mechanism', categorySlug: 'cognitive-performance', href: '/categories/cognitive-performance' },
  { slug: 'how-kisspeptin-gnrh-lh-axis-works', title: 'How the Kisspeptin–GnRH–LH Axis Regulates Reproductive Signaling', description: 'The reproductive-axis research picture from top to bottom.', contentType: 'mechanism', categorySlug: 'hormone-wellness', href: '/categories/hormone-wellness' },
  { slug: 'how-melanocortin-receptors-influence-cns', title: 'How Melanocortin Receptors Influence Central Nervous System Signaling', description: 'The receptor biology behind PT-141 research.', contentType: 'mechanism', categorySlug: 'hormone-wellness', href: '/categories/hormone-wellness' },

  // Beginner Education
  { slug: 'what-does-ruo-mean', title: 'What Does "Research Use Only" Actually Mean?', description: 'The plain-language explanation behind the label on every product.', contentType: 'beginner', categorySlug: 'general', href: '/faq#research-use-only' },
  { slug: 'how-to-read-a-product-page', title: 'How to Read a Peptide Product Page Like a Researcher', description: 'What to look for beyond the headline claims.', contentType: 'beginner', categorySlug: 'general', href: '/products/glutathione' },
  { slug: 'peptides-vs-small-molecules', title: 'Peptides vs. Small-Molecule Compounds: What\'s the Difference?', description: 'A foundational distinction for anyone new to this catalog.', contentType: 'beginner', categorySlug: 'general', href: '/faq#product-categories' },
  { slug: 'understanding-vial-ampoule-kit', title: 'Understanding Vial, Ampoule, and Kit Formats', description: 'What the format options on a product page actually mean.', contentType: 'beginner', categorySlug: 'general', href: '/faq#product-handling' },
  { slug: 'why-documentation-matters', title: 'Why Documentation Matters More Than Marketing Claims', description: 'What to actually ask for before trusting a research-use catalog.', contentType: 'beginner', categorySlug: 'general', href: '/quality' },
  { slug: 'how-to-ask-better-research-questions', title: 'How to Ask Better Research Questions Before You Order', description: 'A short framework for scoping a research question before you buy.', contentType: 'beginner', categorySlug: 'general', href: '/intake' },
  { slug: 'what-studied-for-means', title: 'What "Studied For" Really Means (and What It Doesn\'t Mean)', description: 'How to read research-context language without over- or under-reading it.', contentType: 'beginner', categorySlug: 'general', href: '/faq#research-use-only' },
  { slug: 'storage-handling-basics', title: 'Storage and Handling Basics for Research Compounds', description: 'A conceptual starting point before you dig into product-specific guidance.', contentType: 'beginner', categorySlug: 'general', href: '/faq#storage' },
  { slug: 'how-categories-are-organized', title: 'How Encore Bio Labs Organizes Its Research Categories (and Why)', description: 'The logic behind the five-category structure.', contentType: 'beginner', categorySlug: 'general', href: '/#products' },
  { slug: 'common-misconceptions', title: 'Common Misconceptions About Peptide Research', description: 'A few things worth unlearning before you go further.', contentType: 'beginner', categorySlug: 'general', href: '/faq#research-use-only' },
]

export type GlossaryTerm = { term: string; definition: string }

export const glossaryTerms: GlossaryTerm[] = [
  { term: 'Research Use Only (RUO)', definition: 'A classification meaning a product is intended solely for laboratory or institutional research, not for human or animal consumption, diagnosis, or treatment.' },
  { term: 'Peptide', definition: 'A short chain of amino acids linked together — smaller than a full protein, and the structural basis for most compounds in this catalog.' },
  { term: 'Lyophilization', definition: 'A freeze-drying process that removes water from a compound to stabilize it for storage, producing the powder or cake form found in most vials.' },
  { term: 'Reconstitution', definition: 'The process of dissolving a lyophilized compound into a liquid diluent before it can be used in a research setting.' },
  { term: 'Bacteriostatic Water', definition: 'A diluent containing a small amount of preservative, commonly referenced in peptide-research literature as a reconstitution diluent.' },
  { term: 'Receptor Agonist / Antagonist', definition: 'An agonist activates a biological receptor to produce a signaling response; an antagonist blocks or dampens that same response.' },
  { term: 'Certificate of Analysis (COA)', definition: 'A document from testing showing a specific batch\'s measured identity, purity, and other quality attributes.' },
  { term: 'Half-Life (Research Context)', definition: 'The time it takes for half of a compound to be cleared or broken down in a research model — a common comparison point between related compounds.' },
  { term: 'Peptide Analog', definition: 'A modified version of a naturally occurring peptide, designed to alter properties like binding affinity, stability, or duration in research models.' },
  { term: 'Secretagogue', definition: 'A substance that triggers another substance to be secreted — for example, a compound that prompts the release of growth hormone.' },
]
