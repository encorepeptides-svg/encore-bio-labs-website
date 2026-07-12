import { brandText } from '../../config/brandText'
import { getEncoreCompleteKitFaqItems } from './encoreCompleteKit'

export type ProductVariant = {
  label: string
  format: string
  price: number
}

export type PurityGrade = '>=98%' | 'Analytical Grade' | 'Research Grade' | 'Documentation by request'
export type StockStatus = 'In Stock' | 'Limited Stock' | 'On Request' | 'Availability by request'

type ProductSpec = {
  label: string
  value: string
}

type ProductProtocol = {
  title: string
  steps: string[]
  notes: string
}

type ProductReconstitution = {
  overview: string
  steps: string[]
}

type ProductFAQ = {
  question: string
  answer: string
}

type ProductCardContent = {
  title: string
  description: string
}

type ProductMetric = {
  value: string
  label: string
  note: string
}

type ProductResearchHighlight = {
  title: string
  journal: string
  takeaway: string
  metric: string
}

type ProductComparison = {
  standard: string
  targeted: string
}

type ProductFact = {
  overview: string
  identity: string
  target: string
  pathway: string
  markers: string
  benefits: ProductCardContent[]
  researchHighlights: ProductResearchHighlight[]
  biologyPoints: ProductCardContent[]
  faqs: ProductFAQ[]
}

type ProductPageContent = {
  dosage: string
  shortDescription: string
  catalogTagline: string
  heroImage: string
  badge: string
  headline: string
  keyHighlights: string[]
  benefits: ProductCardContent[]
  mechanismSteps: string[]
  scienceStats: ProductMetric[]
  researchHighlights: ProductResearchHighlight[]
  statistics: ProductMetric[]
  biologyPoints: ProductCardContent[]
  benefitAudiences: ProductCardContent[]
  differentiators: ProductComparison[]
  galleryCaptions: string[]
  specs: ProductSpec[]
  protocol: ProductProtocol
  reconstitution: ProductReconstitution
  disclaimer: string
  faqs: ProductFAQ[]
  relatedProducts: string[]
  bacWaterAmount?: string
}

type CatalogProduct = {
  slug: string
  name: string
  category: string
  image: string
  description: string
  featured: boolean
  variants: ProductVariant[]
}

type ProductCatalogMetadata = {
  casNumber: string
  purityGrade: PurityGrade
  stockStatus: StockStatus
}

export type Product = CatalogProduct & ProductCatalogMetadata & ProductPageContent

export type ResearchArea = {
  slug: string
  name: string
  description: string
  products: string[]
  image: string
  video?: string
  accent: string
}

export const categoryNames = [
  'Metabolic & Weight Management',
  'Recovery & Regeneration',
  'Longevity & Cellular Health',
  'Cognitive & Performance',
  'Hormone & Wellness',
]

export const categoryVisuals: Record<string, string> = {
  'Metabolic & Weight Management': 'category-metabolic-weight-management.png',
  'Recovery & Regeneration': 'category-recovery-regeneration.png',
  'Longevity & Cellular Health': 'category-longevity-cellular-health.png',
  'Cognitive & Performance': 'category-cognitive-performance.png',
  'Hormone & Wellness': 'category-hormone-wellness.png',
}

export const researchAreas: ResearchArea[] = [
  {
    slug: 'metabolic-weight-management',
    name: 'Metabolic & Weight Management',
    description:
      'Research into metabolic signaling, energy regulation, and body-composition pathways, including GLP-1/GIP-adjacent and growth-hormone-axis compounds.',
    products: ['Retatrutide', 'Tesamorelin', 'CJC-1295 / Ipamorelin', 'MOTS-C', 'AOD-9604'],
    image: categoryVisuals['Metabolic & Weight Management'],
    accent: '#2DD4BF',
  },
  {
    slug: 'recovery-regeneration',
    name: 'Recovery & Regeneration',
    description:
      'Research into tissue repair, connective-tissue signaling, and regenerative peptide science, often reviewed together as recovery-focused research stacks.',
    products: ['BPC-157', 'TB-500', 'Wolverine Stack', 'KLOW', 'GHK-Cu', 'AHK-Cu'],
    image: categoryVisuals['Recovery & Regeneration'],
    accent: '#10B981',
  },
  {
    slug: 'longevity-cellular-health',
    name: 'Longevity & Cellular Health',
    description:
      'Research into cellular resilience, mitochondrial function, oxidative balance, and the biology commonly associated with healthy aging.',
    products: ['NAD+', 'SS-31', 'Epithalon', 'Glutathione', 'Thymosin Alpha-1'],
    image: categoryVisuals['Longevity & Cellular Health'],
    accent: '#67E8F9',
  },
  {
    slug: 'cognitive-performance',
    name: 'Cognitive & Performance',
    description:
      'Research into neurobiology, synaptic signaling, and the compounds studied in relation to focus, cognition, and human performance.',
    products: ['IGF-1 LR3', 'Cerebrolysin', 'Semax', 'Selank'],
    image: categoryVisuals['Cognitive & Performance'],
    accent: '#22D3EE',
  },
  {
    slug: 'hormone-wellness',
    name: 'Hormone & Wellness',
    description:
      'Research into hormonal signaling and the endocrine-adjacent compounds studied across wellness-focused research programs.',
    products: ['DSIP', 'Kisspeptin', 'HCG', 'HGH 191AA', 'PT-141'],
    image: categoryVisuals['Hormone & Wellness'],
    accent: '#34D399',
  },
]

export function getResearchAreaBySlug(slug: string) {
  return researchAreas.find((area) => area.slug === slug)
}

export type CategoryTheme = { title: string; description: string }
export type CategoryFAQ = { question: string; answer: string }

export type CategoryContent = {
  eyebrow: string
  headline: string
  subheadline: string
  overview: string
  whyStudied: string
  themes: CategoryTheme[]
  comparisonNotes: Record<string, string>
  faqs: CategoryFAQ[]
  relatedCategorySlugs: string[]
  disclaimer: string
}

export const categoryContent: Record<string, CategoryContent> = {
  'metabolic-weight-management': {
    eyebrow: 'Metabolic & Weight Management Research',
    headline: 'Where metabolic signaling meets serious research.',
    subheadline:
      'From triple-receptor agonism to growth-hormone-axis signaling, this category covers the compounds most often studied in metabolic and body-composition research.',
    overview:
      "Metabolic & Weight Management is Encore Bio Labs' research category for compounds studied in relation to energy regulation, metabolic signaling, and body-composition research models. It spans two related but distinct research lines: incretin-receptor research (GLP-1/GIP/glucagon-adjacent signaling) and growth-hormone-axis research (GHRH and ghrelin-receptor secretagogues). Researchers in this category are typically evaluating pathway-level signaling, marker response, or study design questions — not looking for a weight-loss product recommendation, which this page is not positioned to give.",
    whyStudied:
      'Metabolic research has expanded rapidly alongside interest in incretin-receptor biology (the pathway family behind GLP-1, GIP, and glucagon signaling) and its downstream connections to energy balance, appetite-related signaling, and metabolic markers. In parallel, GH-axis research — how growth-hormone-releasing hormone and ghrelin-receptor signaling influence IGF-1 and downstream metabolic markers — remains an active, separate line of inquiry, particularly around visceral-adiposity and body-composition research models. Both lines share a common thread: researchers want cleaner pathway-level data before drawing conclusions about metabolic regulation.',
    themes: [
      { title: 'Incretin-receptor signaling', description: 'GLP-1, GIP, and glucagon receptor pathways and their role in metabolic and appetite-related research models.' },
      { title: 'GH-axis and IGF-1 signaling', description: 'GHRH receptor activation, pituitary GH pulse response, and IGF-1 as a downstream research marker.' },
      { title: 'Ghrelin-receptor secretagogue research', description: 'How ghrelin-receptor agonism pairs with GHRH signaling in combination research models.' },
      { title: 'Mitochondrial and AMPK-linked energy sensing', description: 'Mitochondria-derived peptide research connected to cellular energy adaptation and metabolic flexibility.' },
      { title: 'Body-composition research models', description: 'How researchers track composition-adjacent markers without treating any compound as a guaranteed outcome driver.' },
    ],
    comparisonNotes: {
      retatrutide: 'The only triple-receptor entry in this category',
      'aod-9604': 'GH-fragment research entry focused on metabolic signaling context',
      tesamorelin: 'Single-compound GH-axis research entry',
      'cjc1295-ipamorelin': 'Combination entry, not a duplicate of Tesamorelin',
      'mots-c': 'Only mitochondria-derived peptide in this category',
    },
    faqs: [
      { question: "What's the difference between Retatrutide and Tesamorelin?", answer: 'Retatrutide is studied through incretin-receptor biology (GLP-1/GIP/glucagon); Tesamorelin is studied through GH-axis biology (GHRH/IGF-1). They are different pathway families, not competing versions of the same research question.' },
      { question: 'Why are CJC-1295 and Ipamorelin sold together?', answer: "They're commonly paired in research because they act on complementary GH-axis pathways — a GHRH analog and a ghrelin-receptor secretagogue — studied together rather than as duplicate catalog entries." },
      { question: 'Is MOTS-C related to the other products here?', answer: "Only loosely — it's grouped in this category for its metabolic and energy-sensing research relevance, but its biology (mitochondria-derived peptide, AMPK) is distinct from incretin or GH-axis signaling." },
      { question: 'Do any of these have published outcome data?', answer: "Where population-level published research exists (e.g., Retatrutide's Phase 2 data), it's presented on that product's page as study-level context, not as a projection of individual results." },
    ],
    relatedCategorySlugs: ['recovery-regeneration', 'longevity-cellular-health', 'hormone-wellness'],
    disclaimer:
      'All products in this category are sold for laboratory research use only. They are not intended for human or animal consumption, are not weight-loss products, and nothing on this page should be read as a treatment recommendation, dosing guidance, or a prediction of individual results.',
  },
  'recovery-regeneration': {
    eyebrow: 'Recovery & Regeneration Research',
    headline: 'Tissue repair, signaling, and structure — studied together.',
    subheadline:
      'From gastric-derived repair peptides to copper-peptide matrix biology, this category covers the compounds most commonly reviewed in recovery-focused research.',
    overview:
      "Recovery & Regeneration is Encore Bio Labs' research category for peptides studied in connective-tissue, repair-signaling, and matrix-remodeling contexts. It includes two peptides frequently reviewed together as a research pair (BPC-157 and TB-500), a packaged combination of the two (Wolverine Stack), a logistics-focused kit entry (KLOW), and two copper-peptide compounds studied for matrix and skin-adjacent biology (GHK-Cu and AHK-Cu). This category is aimed at researchers evaluating tissue-repair signaling models, not at people looking for injury-treatment guidance.",
    whyStudied:
      "Recovery-focused peptide research sits at the intersection of a few active research lines: angiogenesis and repair-signal biology (commonly discussed through BPC-157), cytoskeletal remodeling and cell migration (TB-500's actin-related research context), and copper-peptide-driven extracellular matrix and collagen research (GHK-Cu and AHK-Cu). Researchers are often trying to understand how these signaling pathways interact — which is why several products in this category are commonly reviewed as pairs or kits rather than in isolation.",
    themes: [
      { title: 'Repair-associated signaling', description: 'Angiogenesis, nitric-oxide pathway context, and tissue-stress models studied in relation to BPC-157.' },
      { title: 'Cytoskeletal remodeling and cell migration', description: 'Actin regulation and thymosin beta-4-linked research context studied in relation to TB-500.' },
      { title: 'Copper-peptide matrix biology', description: 'Collagen and elastin research, wound-response models, and extracellular-matrix remodeling studied through GHK-Cu and its follicle-focused counterpart, AHK-Cu.' },
      { title: 'Combination and kit-based research planning', description: 'How researchers organize companion compounds (like BPC-157 + TB-500) and supporting kit components for cleaner study design.' },
    ],
    comparisonNotes: {
      'bpc-157': 'Most-cited standalone repair peptide in this category',
      'tb-500': 'Commonly paired with BPC-157, not a substitute for it',
      'wolverine-stack': 'Packaged pairing, not a third distinct peptide',
      klow: 'Not a single-pathway peptide entry — a support/kit product',
      'ghk-cu': 'Broader matrix/skin research scope',
      'ahk-cu': 'Narrower, follicle-focused counterpart to GHK-Cu',
    },
    faqs: [
      { question: 'Should I look at BPC-157 or TB-500 first?', answer: "They're studied through different mechanisms (repair/angiogenesis vs. actin/cell migration) and are commonly reviewed together rather than as either/or alternatives — the Wolverine Stack exists specifically for that combined research context." },
      { question: "What's actually in the Wolverine Stack?", answer: 'It is organized around BPC-157 and TB-500 research themes packaged together; it does not include dosing or treatment instructions.' },
      { question: 'Is KLOW a peptide like the others?', answer: "No — it's a kit/support entry focused on logistics and documentation, not a standalone research compound with its own pathway." },
      { question: "What's the difference between GHK-Cu and AHK-Cu?", answer: 'GHK-Cu is typically framed around broader skin and matrix-remodeling research; AHK-Cu is more narrowly framed around follicle and dermal-signaling research, though both share copper-peptide biology.' },
    ],
    relatedCategorySlugs: ['longevity-cellular-health', 'metabolic-weight-management', 'hormone-wellness'],
    disclaimer:
      'All products in this category are sold for laboratory research use only. They are not intended for human or animal consumption, are not injury or wound treatments, and nothing on this page should be read as a recovery protocol or treatment recommendation.',
  },
  'longevity-cellular-health': {
    eyebrow: 'Longevity & Cellular Health Research',
    headline: 'The biology behind cellular resilience and healthy aging.',
    subheadline:
      'From redox metabolism to mitochondria-targeted peptides, this category covers the compounds most often studied in cellular-health and aging-biology research.',
    overview:
      "Longevity & Cellular Health is Encore Bio Labs' research category for compounds studied in relation to cellular resilience, mitochondrial function, oxidative balance, and the biology commonly discussed in healthy-aging research. It includes a central metabolic cofactor (NAD+), a core antioxidant (Glutathione), a short synthetic peptide studied in pineal and telomere-associated research contexts (Epithalon), a mitochondria-targeted peptide (SS-31), and an immune-signaling peptide studied for cellular-defense relevance (Thymosin Alpha-1). This page is written for researchers exploring cellular-aging biology, not as an anti-aging product recommendation.",
    whyStudied:
      "Aging-biology research increasingly centers on a small number of interconnected systems: mitochondrial energy production and the redox reactions that depend on it, oxidative-stress buffering, and the cellular signaling that changes as organisms age. NAD+ sits at the center of redox metabolism and sirtuin/PARP-linked research; glutathione is the primary intracellular antioxidant buffer; SS-31 is studied specifically for its interaction with cardiolipin in the mitochondrial inner membrane; and epithalon appears in literature connected to telomere-associated and circadian research themes. Thymosin Alpha-1's immune-signaling research overlaps with cellular-defense questions relevant to aging biology more broadly.",
    themes: [
      { title: 'Redox metabolism and mitochondrial energy', description: 'NAD+/NADH cycling, oxidative phosphorylation, and cellular energy production research.' },
      { title: 'Antioxidant and detoxification biology', description: "Glutathione's role in ROS buffering and phase-II detoxification enzyme systems." },
      { title: 'Mitochondria-targeted membrane biology', description: "SS-31's studied interaction with cardiolipin and inner-membrane stability." },
      { title: 'Telomere-associated and circadian research', description: "Epithalon's research context in pineal-peptide and aging-biology literature." },
      { title: 'Immune-signaling and cellular defense', description: "Thymosin Alpha-1's T-cell and innate-immune research relevance to broader resilience questions." },
    ],
    comparisonNotes: {
      'nad-plus': 'Broadest metabolic-cofactor research scope in this category',
      glutathione: 'Core redox-buffer research entry',
      epithalon: 'Only tetrapeptide in this category tied to circadian biology',
      ss31: 'Most mitochondria-specific mechanism in this category',
      'thymosin-alpha-1': 'The only immune-focused entry in this longevity category',
    },
    faqs: [
      { question: 'Why is NAD+ associated with longevity research?', answer: 'Because it intersects with mitochondrial function, sirtuins, PARP enzymes, and cellular stress response — all frequently studied aging-biology pathways.' },
      { question: 'Is SS-31 the same as elamipretide?', answer: 'SS-31 is commonly associated with elamipretide in research literature, though this catalog page is research-use-only and not a treatment page.' },
      { question: 'Does Epithalon claim to extend lifespan?', answer: "No. It's presented for research context around telomere-associated and pineal-peptide biology only — this page makes no lifespan or anti-aging outcome claims." },
      { question: 'Why is an immune peptide (Thymosin Alpha-1) in a longevity category?', answer: 'Cellular-defense and immune-resilience research overlaps meaningfully with aging biology, which is why it is grouped here rather than in a separate immune-only category.' },
    ],
    relatedCategorySlugs: ['recovery-regeneration', 'metabolic-weight-management', 'cognitive-performance'],
    disclaimer:
      'All products in this category are sold for laboratory research use only. They are not intended for human or animal consumption, are not anti-aging treatments, and nothing on this page should be read as a claim about lifespan, aging outcomes, or individual results.',
  },
  'cognitive-performance': {
    eyebrow: 'Cognitive & Performance Research',
    headline: 'Neurobiology, signaling, and human performance research.',
    subheadline:
      'From growth-factor receptor signaling to neurotrophic peptide research, this category covers the compounds most commonly studied in cognitive and performance-focused research.',
    overview:
      "Cognitive & Performance is Encore Bio Labs' research category for compounds studied in relation to neurobiology, synaptic signaling, and human-performance research questions. It spans growth-factor receptor research (IGF-1 LR3), a neurotrophic peptide mixture studied for neuronal-survival and cognitive research (Cerebrolysin), and two structurally distinct neuropeptides studied for neuropeptide signaling and stress-response research (Semax and Selank). This category is written for researchers evaluating cognitive-pathway biology, not as a study-aid or performance-enhancement recommendation.",
    whyStudied:
      'Cognitive-performance research draws on several distinct but related biological systems: growth-factor receptor signaling and its downstream cellular-growth effects (IGF-1 LR3), neurotrophic and neuronal-survival research relevant to synaptic plasticity (Cerebrolysin), and neuropeptide research connected to BDNF-related expression and stress-response biology (Semax and Selank). Researchers in this space are typically trying to map receptor-level or marker-level research questions rather than looking for a cognitive enhancement product.',
    themes: [
      { title: 'Growth-factor receptor signaling', description: 'IGF-1 receptor activation and downstream PI3K-AKT/MAPK pathway research relevant to cellular growth and performance-adjacent questions.' },
      { title: 'Neurotrophic and neuronal-survival research', description: "Cerebrolysin's studied relevance to synaptic plasticity and neuro-repair pathway context." },
      { title: 'ACTH-fragment and BDNF-linked signaling', description: "Semax's research context around neurotrophic marker expression and cognitive-performance models." },
      { title: 'Neuroimmune and stress-response signaling', description: "Selank's tuftsin-analog research context connecting immune-neuropeptide signaling to stress and mood-related research themes." },
    ],
    comparisonNotes: {
      'igf1-lr3': 'The only growth-factor-receptor entry in this category',
      cerebrolysin: 'Peptide mixture rather than a single-sequence peptide',
      semax: 'Often paired with Selank in cognitive research planning',
      selank: 'Distinguished by its neuroimmune/serotonin-adjacent research angle',
    },
    faqs: [
      { question: 'What does "LR3" mean in IGF-1 LR3?', answer: 'It refers to "long arginine 3," an IGF-1 analog design discussed in research for altered binding characteristics compared to native IGF-1.' },
      { question: 'Are Semax and Selank interchangeable?', answer: 'No — they are structurally distinct (an ACTH-fragment analog vs. a tuftsin analog) and are commonly reviewed together for complementary cognitive-wellness research rather than as substitutes for each other.' },
      { question: 'Does Cerebrolysin make cognitive-treatment claims?', answer: 'No. It is presented for research context around neurotrophic signaling and neuronal-survival models only, with no treatment, diagnosis, or guaranteed cognitive outcome implied.' },
      { question: 'Is this category about performance enhancement?', answer: 'No — "performance" here refers to the research questions being studied (cognitive and physical performance biology), not a claim that any product enhances performance.' },
    ],
    relatedCategorySlugs: ['longevity-cellular-health', 'hormone-wellness', 'metabolic-weight-management'],
    disclaimer:
      'All products in this category are sold for laboratory research use only. They are not intended for human or animal consumption, are not cognitive enhancement or performance products, and nothing on this page should be read as a guarantee of focus, memory, or performance outcomes.',
  },
  'hormone-wellness': {
    eyebrow: 'Hormone & Wellness Research',
    headline: 'Endocrine signaling, mapped for serious research.',
    subheadline:
      'From reproductive-axis signaling to sleep-related neuropeptide research, this category covers the compounds most commonly studied in hormonal and wellness-adjacent research.',
    overview:
      "Hormone & Wellness is Encore Bio Labs' research category for compounds studied in relation to hormonal signaling and endocrine-adjacent research questions. It spans reproductive-axis biology (Kisspeptin, HCG), growth-hormone-axis research (HGH 191AA), sleep and neuroendocrine signaling (DSIP), and central melanocortin-receptor research relevant to sexual-wellness research models (PT-141). This category is written for researchers mapping endocrine pathway questions, not as guidance for hormone therapy or sexual-wellness treatment.",
    whyStudied:
      "Endocrine research spans several axes that researchers often study independently: the reproductive (GnRH/kisspeptin/LH-CG) axis, the growth-hormone axis and its IGF-1-linked downstream effects, sleep-related neuroendocrine signaling, and central melanocortin-receptor pathways relevant to autonomic and sexual-wellness research. What connects these compounds in one category isn't a shared mechanism, but a shared research domain — hormonal signaling and the wellness-adjacent questions researchers ask about it.",
    themes: [
      { title: 'Reproductive-axis signaling', description: 'Kisspeptin-receptor and GnRH-axis research, and downstream LH/FSH marker response.' },
      { title: 'Gonadotropin and steroidogenesis research', description: "HCG's studied relevance to LH/CG receptor signaling and gonadal steroid marker research." },
      { title: 'GH-axis and IGF-1 signaling', description: "HGH 191AA's research context around GH receptor activation, JAK-STAT signaling, and downstream IGF-1 markers." },
      { title: 'Sleep and neuroendocrine signaling', description: "DSIP's research relevance to sleep-architecture models and stress-response biology." },
      { title: 'Central melanocortin-receptor research', description: "PT-141's studied relevance to CNS signaling and sexual-wellness research models." },
    ],
    comparisonNotes: {
      kisspeptin: 'Upstream reproductive-axis regulator',
      hcg: 'Downstream gonadotropin research entry',
      'hgh-191aa': 'Only GH-axis entry in this category',
      dsip: 'Only sleep-focused entry in this category',
      'pt-141': 'Only central-nervous-system-targeted entry here',
    },
    faqs: [
      { question: 'How are Kisspeptin and HCG related?', answer: 'Kisspeptin sits upstream in the reproductive axis (GnRH regulation); HCG acts further downstream on LH/CG receptors — they are studied as different points in the same broader axis, not interchangeable entries.' },
      { question: 'What does "191AA" mean in HGH 191AA?', answer: 'It refers to the 191-amino-acid human growth hormone sequence commonly discussed in somatropin research.' },
      { question: 'Is PT-141 the same as bremelanotide?', answer: 'PT-141 is commonly associated with bremelanotide in research literature, but this catalog page is research-use-only and does not provide treatment claims or instructions.' },
      { question: 'Does DSIP provide sleep-treatment guidance?', answer: 'No. It provides research context only around sleep-architecture and neuroendocrine signaling models, with no treatment advice or dosing protocols.' },
    ],
    relatedCategorySlugs: ['metabolic-weight-management', 'cognitive-performance', 'longevity-cellular-health'],
    disclaimer:
      'All products in this category are sold for laboratory research use only. They are not intended for human or animal consumption, are not hormone therapy or sexual-wellness treatments, and nothing on this page should be read as a treatment recommendation or a promise of any wellness outcome.',
  },
}

const globalResearchDisclaimer =
  brandText.complianceDisclaimer

const categoryPositioning: Record<string, string> = {
  'Metabolic & Weight Management':
    'research may explore metabolic signaling, energy regulation, body-composition models, and pathway-level response markers',
  'Recovery & Regeneration':
    'research may explore tissue-repair signaling, recovery models, collagen-support pathways, and regenerative peptide science',
  'Longevity & Cellular Health':
    'research may explore cellular resilience, mitochondrial function, oxidative-stress models, and healthy-aging pathways',
  'Cognitive & Performance':
    'research may explore neurobiology, cognitive-performance models, cellular signaling, and human-performance research questions',
  'Hormone & Wellness':
    'research may explore hormonal signaling, wellness-adjacent pathway models, and endocrine research markers',
}

const categoryHeadlines: Record<string, string> = {
  'Metabolic & Weight Management': 'Support Metabolic Research. Map Adaptive Signaling. Elevate Review.',
  'Recovery & Regeneration': 'Study Repair Signaling. Support Recovery Models. Clarify Regeneration.',
  'Longevity & Cellular Health': 'Map Cellular Context. Review Resilience Models. Clarify Research Signals.',
  'Cognitive & Performance': 'Explore Neural Signaling. Review Performance Models. Sharpen Research Context.',
  'Hormone & Wellness': 'Map Hormonal Pathways. Review Endocrine Research. Work With Precision.',
}

const categoryBenefits: Record<string, ProductCardContent[]> = {
  'Metabolic & Weight Management': [
    { title: 'Metabolic signaling', description: 'Structured for research into energy-balance and pathway response models.' },
    { title: 'Body composition', description: 'Useful for reviewing investigational body-composition research frameworks.' },
    { title: 'Performance context', description: 'Supports program conversations around adaptive output and recovery demand.' },
    { title: 'Energy regulation', description: 'Frames research questions around fuel utilization and cellular demand.' },
    { title: 'Biomarker review', description: 'Built for documentation-first review of study-specific markers and records.' },
    { title: 'Program planning', description: 'Keeps formats, variants, and inquiry routing organized in one page.' },
  ],
  'Recovery & Regeneration': [
    { title: 'Recovery models', description: 'Designed for research questions around repair, resilience, and return-to-output markers.' },
    { title: 'Tissue signaling', description: 'Frames investigation into extracellular matrix and repair-associated pathways.' },
    { title: 'Collagen context', description: 'Supports review of structure, skin, tendon, and soft-tissue research themes.' },
    { title: 'Training load', description: 'Useful for recovery-focused program discussions and controlled observation records.' },
    { title: 'Inflammation models', description: 'Supports non-therapeutic research into stress response and repair signaling.' },
    { title: 'Kit clarity', description: 'Keeps companion compounds and format decisions easy to compare.' },
  ],
  'Longevity & Cellular Health': [
    { title: 'Cellular resilience', description: 'Frames research into stress tolerance, repair signals, and healthy-aging models.' },
    { title: 'Mitochondrial focus', description: 'Supports investigation into energy-production and organelle-level signaling.' },
    { title: 'Oxidative balance', description: 'Useful for reviewing redox and cellular-defense research questions.' },
    { title: 'Longevity pathways', description: 'Organizes research themes around resilience, renewal, and biological time.' },
    { title: 'Biomarker context', description: 'Pairs catalog review with documentation requests and controlled records.' },
    { title: 'Premium handling', description: 'Designed around quality, storage, and documentation-led review.' },
  ],
  'Cognitive & Performance': [
    { title: 'Neurobiology', description: 'Frames research into signaling, plasticity, and cognitive-performance models.' },
    { title: 'Focus context', description: 'Supports structured review of attention, output, and performance research themes.' },
    { title: 'Cellular signaling', description: 'Connects product review to receptor, peptide, and pathway-level questions.' },
    { title: 'Training output', description: 'Useful for performance optimization research and recovery-demand planning.' },
    { title: 'Documentation review', description: 'Keeps product format and request details in one research-ready view.' },
    { title: 'Planning clarity', description: 'Keeps study review organized without treatment or dosing instructions.' },
  ],
  'Hormone & Wellness': [
    { title: 'Hormonal signaling', description: 'Frames research into endocrine communication and pathway response models.' },
    { title: 'Endocrine context', description: 'Supports qualified review of endocrine-adjacent research questions.' },
    { title: 'Performance markers', description: 'Useful for conversations around output, recovery, and adaptive demand.' },
    { title: 'Axis mapping', description: 'Organizes research around upstream and downstream hormonal pathway signals.' },
    { title: 'Format clarity', description: 'Groups variants on one product page to reduce duplicated catalog cards.' },
    { title: 'Responsible review', description: 'Maintains research-use framing and avoids treatment or use instructions.' },
  ],
}

const productPositioning: Record<string, { headline: string; focus: string; mechanism: string[]; visual: string }> = {
  tesamorelin: {
    headline: 'Refine Metabolic Research. Support GH-Axis Inquiry. Review With Precision.',
    focus: 'growth-hormone-releasing hormone analog research, visceral-adiposity models, and metabolic signaling review',
    mechanism: ['GHRH analog review', 'Pituitary-axis signaling model', 'IGF-1 pathway observation', 'Metabolic-response record'],
    visual: 'GH-axis signaling',
  },
  'cjc1295-ipamorelin': {
    headline: 'Pair Pulsatile Signaling. Study Recovery. Support Composition Research.',
    focus: 'combined GHRH and ghrelin-receptor signaling models, recovery research, and body-composition program planning',
    mechanism: ['Dual peptide review', 'Receptor signaling model', 'Pulse-response observation', 'Recovery-marker mapping'],
    visual: 'dual-axis peptide stack',
  },
  'mots-c': {
    headline: 'Explore Mitochondrial Signaling. Support Metabolic Research. Review Energy Pathways.',
    focus: 'mitochondrial-derived peptide research, metabolic signaling models, and cellular energy review',
    mechanism: ['Mitochondrial peptide review', 'Energy-sensing context', 'Metabolic-response model', 'Cellular-marker mapping'],
    visual: 'mitochondrial peptide map',
  },
  'aod-9604': {
    headline: 'Review GH-Fragment Research. Map Metabolic Signaling. Keep Inquiry Clean.',
    focus: 'growth-hormone-fragment research, metabolic signaling context, and body-composition research models',
    mechanism: ['GH-fragment identity review', 'Metabolic signaling context', 'Body-composition model', 'Documentation-led inquiry'],
    visual: 'GH-fragment metabolic pathway',
  },
  'igf1-lr3': {
    headline: 'Explore Growth Signaling. Support Performance Models. Map Cellular Response.',
    focus: 'IGF pathway signaling, cellular uptake models, and performance-oriented research review',
    mechanism: ['IGF pathway context', 'Receptor interaction model', 'Cellular signaling cascade', 'Performance-marker review'],
    visual: 'growth-factor receptor map',
  },
  'bpc-157': {
    headline: 'Study Repair Signaling. Support Resilience Models. Review Recovery Pathways.',
    focus: 'repair-associated peptide signaling, tissue-resilience models, and recovery research planning',
    mechanism: ['Peptide review', 'Repair pathway signaling', 'Matrix-response observation', 'Recovery-record mapping'],
    visual: 'repair pathway field',
  },
  'tb-500': {
    headline: 'Map Mobility Research. Support Regeneration Models. Clarify Recovery Signals.',
    focus: 'thymosin beta-4 fragment research, actin-related signaling models, and tissue-recovery review',
    mechanism: ['Thymosin-fragment review', 'Cell migration model', 'Repair-signal cascade', 'Mobility-marker review'],
    visual: 'cell migration map',
  },
  'wolverine-stack': {
    headline: 'Combine Recovery Signals. Support Repair Research. Organize Regeneration Review.',
    focus: 'stacked recovery research, complementary repair-signaling models, and kit-based documentation review',
    mechanism: ['Companion peptide review', 'Complementary pathway mapping', 'Recovery-model observation', 'Kit record request'],
    visual: 'stacked recovery matrix',
  },
  klow: {
    headline: 'Support Recovery Logistics. Clarify Kit Context. Elevate Research Readiness.',
    focus: 'research-kit support, recovery program logistics, and structured documentation planning',
    mechanism: ['Kit component review', 'Protocol support mapping', 'Handling-context check', 'Study-record organization'],
    visual: 'research supply array',
  },
  'nad-plus': {
    headline: 'Restore Cellular Context. Support Energy Research. Review Longevity Signals.',
    focus: 'NAD-related cellular energy research, redox context, and healthy-aging study planning',
    mechanism: ['Cofactor review', 'Mitochondrial context', 'Redox-signal observation', 'Cellular-resilience record'],
    visual: 'mitochondrial energy field',
  },
  glutathione: {
    headline: 'Support Redox Research. Map Detox Pathways. Review Cellular Defense.',
    focus: 'glutathione redox biology, oxidative-stress models, and cellular-defense research review',
    mechanism: ['Tripeptide review', 'Redox balance model', 'Oxidative-stress observation', 'Defense-marker mapping'],
    visual: 'redox shield diagram',
  },
  'ghk-cu': {
    headline: 'Study Copper Peptide Signaling. Support Aesthetic Research. Map Matrix Renewal.',
    focus: 'copper peptide signaling, skin and matrix research models, and recovery-adjacent review',
    mechanism: ['Copper-peptide review', 'Matrix signaling context', 'Collagen-research model', 'Aesthetic-marker record'],
    visual: 'copper peptide lattice',
  },
  'ahk-cu': {
    headline: 'Explore Follicle Research. Support Copper Signaling. Review Aesthetic Pathways.',
    focus: 'copper peptide research, follicle-support models, and aesthetic science review',
    mechanism: ['Copper complex review', 'Follicle-pathway context', 'Matrix response model', 'Aesthetic record request'],
    visual: 'follicle signaling field',
  },
  epithalon: {
    headline: 'Study Cellular Time. Support Longevity Models. Map Renewal Signals.',
    focus: 'telomere-adjacent research themes, cellular resilience models, and healthy-aging review',
    mechanism: ['Tetrapeptide review', 'Cellular time model', 'Nuclear signaling context', 'Longevity-marker record'],
    visual: 'telomere research arc',
  },
  cerebrolysin: {
    headline: 'Explore Neurotrophic Research. Support Cognitive Models. Review Neural Resilience.',
    focus: 'neurotrophic peptide research, neural resilience models, and cognitive-performance review',
    mechanism: ['Peptide complex review', 'Neurotrophic signaling model', 'Synaptic context observation', 'Cognitive-marker mapping'],
    visual: 'neural network map',
  },
  ss31: {
    headline: 'Target Mitochondrial Research. Support Cellular Energy. Review Resilience Signals.',
    focus: 'mitochondria-targeted peptide research, cardiolipin context, and cellular-energy models',
    mechanism: ['Mitochondrial peptide review', 'Inner-membrane context', 'Energy-signal observation', 'Resilience-marker record'],
    visual: 'mitochondrial membrane map',
  },
  dsip: {
    headline: 'Study Sleep Signaling. Support Recovery Models. Review Neuroendocrine Context.',
    focus: 'sleep peptide research, neuroendocrine signaling models, and recovery-program review',
    mechanism: ['Sleep-peptide review', 'Neuroendocrine context', 'Recovery-signal model', 'Rest-marker record'],
    visual: 'sleep signaling wave',
  },
  kisspeptin: {
    headline: 'Map Reproductive-Axis Research. Support Hormonal Signaling. Review With Clarity.',
    focus: 'kisspeptin pathway research, GnRH-axis models, and endocrine signaling review',
    mechanism: ['Kisspeptin review', 'GnRH-axis signaling', 'Hormonal-response model', 'Endocrine-marker mapping'],
    visual: 'reproductive-axis map',
  },
  hcg: {
    headline: 'Support Hormone Research. Map LH-Receptor Context. Review Endocrine Signals.',
    focus: 'hormone signaling research, LH receptor models, and endocrine program review',
    mechanism: ['Glycoprotein hormone review', 'LH receptor context', 'Endocrine-response model', 'Wellness-marker record'],
    visual: 'hormone receptor field',
  },
  'hgh-191aa': {
    headline: 'Study Growth Hormone Research. Support Recovery Models. Review Performance Context.',
    focus: 'somatropin research, growth hormone pathway models, and performance-support review',
    mechanism: ['191AA hormone review', 'GH receptor signaling', 'IGF-1 context observation', 'Performance-marker mapping'],
    visual: 'GH receptor cascade',
  },
  'thymosin-alpha-1': {
    headline: 'Explore Immune Signaling. Support Cellular Defense. Review Resilience Models.',
    focus: 'thymosin alpha-1 research, immune signaling models, and cellular defense review',
    mechanism: ['Thymosin review', 'Immune-cell signaling context', 'Defense-response model', 'Resilience-marker record'],
    visual: 'immune signaling array',
  },
  'pt-141': {
    headline: 'Map Melanocortin Research. Support Wellness Models. Review Neural Signaling.',
    focus: 'melanocortin receptor research, sexual-wellness signaling models, and responsible product review',
    mechanism: ['Melanocortin peptide review', 'Receptor signaling context', 'Neural-response model', 'Wellness-marker mapping'],
    visual: 'melanocortin receptor map',
  },
  semax: {
    headline: 'Explore Cognitive Research. Support Focus Models. Review Neuro-Signaling.',
    focus: 'neuropeptide research, cognitive-performance models, and focus-adjacent pathway review',
    mechanism: ['Neuropeptide review', 'Neural signaling context', 'Focus-model observation', 'Cognitive-marker record'],
    visual: 'focus pathway lattice',
  },
  selank: {
    headline: 'Study Stress-Response Research. Support Cognitive Models. Review Calm Signaling.',
    focus: 'neuropeptide research, stress-response models, and cognitive wellness review',
    mechanism: ['Neuropeptide review', 'Stress-response context', 'Neural balance model', 'Cognitive-record mapping'],
    visual: 'neural balance field',
  },
}

const productFacts: Record<string, ProductFact> = {
  tesamorelin: {
    overview:
      'Tesamorelin is a synthetic growth-hormone-releasing hormone analog studied for GH-axis signaling, IGF-1 response, visceral-adiposity research models, and metabolic marker review.',
    identity: 'Synthetic GHRH analog',
    target: 'GHRH receptor and GH-axis signaling',
    pathway: 'Pituitary GH release, downstream IGF-1 signaling, lipolysis-related metabolic models',
    markers: 'IGF-1, fasting lipids, glucose markers, waist or composition endpoints in qualified studies',
    benefits: [
      { title: 'GH-axis research', description: 'Useful for studying growth-hormone-releasing hormone receptor signaling and downstream endocrine markers.' },
      { title: 'IGF-1 response', description: 'Often reviewed through IGF-1 pathway changes in controlled research settings.' },
      { title: 'Visceral-fat models', description: 'Appears in literature around abdominal adiposity and metabolic-risk research contexts.' },
      { title: 'Lipid marker review', description: 'Supports research conversations around triglycerides, cholesterol fractions, and metabolic panels.' },
      { title: 'Body-composition context', description: 'Frames composition research without presenting product outcomes as guaranteed or therapeutic.' },
      { title: 'Endocrine documentation', description: 'Pairs product review with qualified oversight, lab context, and careful record keeping.' },
    ],
    researchHighlights: [
      { title: 'GHRH analog mechanism', journal: 'Endocrine pathway literature', takeaway: 'Tesamorelin is studied as a GHRH analog that can increase pulsatile GH-axis signaling in research contexts.', metric: 'GH' },
      { title: 'IGF-1 marker response', journal: 'Metabolic research summaries', takeaway: 'IGF-1 is commonly used as a downstream marker when reviewing GH-axis activity.', metric: 'IGF' },
      { title: 'Visceral-adiposity research', journal: 'Clinical literature context', takeaway: 'Published work has evaluated tesamorelin in abdominal adiposity models; applicability depends on study design.', metric: 'VAT' },
    ],
    biologyPoints: [
      { title: 'GHRH receptor signaling', description: 'The central research lens is stimulation of the GHRH receptor and downstream pituitary-axis response.' },
      { title: 'IGF-1 downstream marker', description: 'IGF-1 is commonly tracked as a pathway-level signal rather than a guaranteed outcome.' },
      { title: 'Metabolic tissue context', description: 'Research may connect endocrine signaling to adipose-tissue and lipid-marker models.' },
    ],
    faqs: [
      { question: 'What is Tesamorelin?', answer: 'Tesamorelin is a synthetic analog of growth-hormone-releasing hormone studied for GH-axis and IGF-1 pathway signaling.' },
      { question: 'What pathway is most relevant?', answer: 'The main pathway is GHRH receptor activation, pituitary GH signaling, and downstream IGF-1 marker review.' },
    ],
  },
  'cjc1295-ipamorelin': {
    overview:
      'CJC-1295 plus Ipamorelin is a combination research entry pairing a GHRH analog with a ghrelin-receptor secretagogue for GH-axis pulse, recovery, and body-composition study models.',
    identity: 'GHRH analog plus ghrelin-receptor secretagogue',
    target: 'GHRH receptor and growth-hormone secretagogue receptor',
    pathway: 'Dual GH-axis signaling with pituitary pulse-response and IGF-1 marker review',
    markers: 'IGF-1, GH pulse context, recovery logs, composition markers, and sleep or performance observations',
    benefits: [
      { title: 'Dual-axis signaling', description: 'Pairs GHRH and ghrelin-receptor research pathways in one combination entry.' },
      { title: 'Pulse-response model', description: 'Useful for studying GH-axis rhythm and downstream marker response.' },
      { title: 'IGF-1 context', description: 'Supports review of IGF-1 as a downstream marker in qualified research settings.' },
      { title: 'Recovery research', description: 'Often framed around recovery, training load, and tissue-repair research questions.' },
      { title: 'Composition review', description: 'Helps organize body-composition and metabolic research context without outcome guarantees.' },
      { title: 'Combination clarity', description: 'Keeps the companion peptides together so the page does not duplicate product cards.' },
    ],
    researchHighlights: [
      { title: 'GHRH pathway component', journal: 'Peptide signaling literature', takeaway: 'CJC-family peptides are studied for GHRH receptor pathway activity and GH-axis signaling.', metric: 'GHRH' },
      { title: 'Ipamorelin secretagogue component', journal: 'Endocrine research context', takeaway: 'Ipamorelin is studied as a selective ghrelin-receptor agonist in GH-secretagogue models.', metric: 'GHSR' },
      { title: 'Combination research model', journal: 'Protocol planning context', takeaway: 'Researchers often review the pair as a dual-signal model rather than two separate catalog cards.', metric: '2X' },
    ],
    biologyPoints: [
      { title: 'Dual receptor map', description: 'The biology model centers on GHRH receptor and ghrelin-receptor signaling converging on GH-axis output.' },
      { title: 'Pituitary pulse context', description: 'Research discussion commonly tracks pulse-style signaling rather than continuous stimulation.' },
      { title: 'Downstream IGF-1 review', description: 'IGF-1 is commonly reviewed as a downstream pathway marker.' },
    ],
    faqs: [
      { question: 'Why are CJC-1295 and Ipamorelin paired?', answer: 'They are commonly paired in research because they act on complementary GH-axis signaling pathways: GHRH receptor and ghrelin receptor models.' },
      { question: 'Is this one product or two duplicate cards?', answer: 'It is intentionally organized as one combination product with variants inside the product object.' },
    ],
  },
  'mots-c': {
    overview:
      'MOTS-C is a mitochondria-derived peptide studied in metabolic stress, AMPK-related signaling, glucose-handling models, and cellular energy adaptation research.',
    identity: 'Mitochondria-derived peptide',
    target: 'Mitochondrial stress signaling and AMPK-associated metabolic pathways',
    pathway: 'Energy-sensing response, metabolic flexibility, glucose-handling research, and exercise-mimetic models',
    markers: 'AMPK context, glucose and insulin markers, mitochondrial stress response, and exercise-capacity observations',
    benefits: [
      { title: 'Mitochondrial signaling', description: 'Frames research around mitochondria-to-nucleus communication and stress adaptation.' },
      { title: 'AMPK context', description: 'Often reviewed alongside AMPK-related energy-sensing and metabolic flexibility pathways.' },
      { title: 'Glucose models', description: 'Supports study planning around glucose handling and insulin-sensitivity markers.' },
      { title: 'Exercise research', description: 'Appears in literature around exercise-like signaling and metabolic adaptation models.' },
      { title: 'Cellular energy', description: 'Connects product review to ATP demand, mitochondrial resilience, and stress-response biology.' },
      { title: 'Longevity overlap', description: 'Useful for research programs that bridge metabolism, aging, and cellular resilience.' },
    ],
    researchHighlights: [
      { title: 'Mitochondrial-derived peptide discovery', journal: 'Cell metabolism literature', takeaway: 'MOTS-C is described in research as a peptide encoded within mitochondrial DNA with metabolic signaling interest.', metric: 'mtDNA' },
      { title: 'Energy-sensing research', journal: 'Metabolic pathway summaries', takeaway: 'Published models often connect MOTS-C to AMPK-associated cellular energy signaling.', metric: 'AMPK' },
      { title: 'Metabolic-stress model', journal: 'Preclinical research context', takeaway: 'Research commonly focuses on metabolic stress adaptation and glucose-handling markers.', metric: 'GLU' },
    ],
    biologyPoints: [
      { title: 'Mitochondrial peptide map', description: 'The visual model centers on mitochondria-derived signaling and cellular energy adaptation.' },
      { title: 'AMPK energy sensor', description: 'AMPK-related context helps frame energy-balance research without making treatment claims.' },
      { title: 'Metabolic flexibility model', description: 'Researchers may review glucose, insulin, and exercise-adaptation markers.' },
    ],
    faqs: [
      { question: 'What makes MOTS-C different?', answer: 'MOTS-C is discussed as a mitochondria-derived peptide, so its research context is centered on cellular energy and metabolic stress signaling.' },
      { question: 'What markers are commonly reviewed?', answer: 'Researchers often review glucose-handling markers, AMPK pathway context, mitochondrial stress response, and exercise-adaptation observations.' },
    ],
  },
  'igf1-lr3': {
    overview:
      'IGF-1 LR3 is a long-acting IGF-1 analog studied for IGF-1 receptor signaling, cellular growth models, nutrient uptake, and performance-oriented pathway research.',
    identity: 'Long arginine 3 IGF-1 analog',
    target: 'IGF-1 receptor pathway',
    pathway: 'IGF-1R activation, PI3K-AKT and MAPK signaling context, cellular uptake and growth models',
    markers: 'IGF-axis context, glucose markers, cell growth observations, protein-synthesis pathway markers',
    benefits: [
      { title: 'IGF-1 receptor research', description: 'Frames review around IGF-1R signaling and downstream cellular pathway models.' },
      { title: 'Cell growth models', description: 'Relevant to controlled studies of cellular proliferation and tissue-response pathways.' },
      { title: 'Nutrient uptake context', description: 'Supports research conversations around glucose, amino-acid uptake, and anabolic signaling.' },
      { title: 'Performance pathways', description: 'Often reviewed in performance research for pathway context, not guaranteed outcomes.' },
      { title: 'Long analog profile', description: 'LR3 analog structure is commonly discussed for altered binding and duration in research models.' },
      { title: 'Marker-led review', description: 'Encourages qualified oversight around glucose and IGF-axis marker selection.' },
    ],
    researchHighlights: [
      { title: 'IGF-1R pathway model', journal: 'Growth factor research', takeaway: 'IGF-1 LR3 is studied through IGF-1 receptor signaling and downstream cellular pathway activation.', metric: 'IGF1R' },
      { title: 'Binding-protein context', journal: 'Analog design literature', takeaway: 'The LR3 modification is discussed for reduced binding-protein affinity in research settings.', metric: 'LR3' },
      { title: 'Cellular uptake research', journal: 'Performance biology context', takeaway: 'Research may examine nutrient uptake and growth-signaling markers under controlled conditions.', metric: 'AKT' },
    ],
    biologyPoints: [
      { title: 'Growth-factor receptor map', description: 'The primary biology model is IGF-1R engagement and downstream signal transduction.' },
      { title: 'AKT and MAPK context', description: 'Common pathway language includes PI3K-AKT and MAPK signaling in cellular growth models.' },
      { title: 'Glucose marker caution', description: 'Qualified oversight is important because IGF-axis research can intersect with glucose handling.' },
    ],
    faqs: [
      { question: 'What does LR3 mean?', answer: 'LR3 refers to long arginine 3, an IGF-1 analog design discussed in research for altered binding characteristics.' },
      { question: 'What is the primary research pathway?', answer: 'The primary pathway is IGF-1 receptor signaling with downstream AKT and MAPK pathway context.' },
    ],
  },
  'bpc-157': {
    overview:
      'BPC-157 is a gastric peptide fragment studied in preclinical repair models, angiogenesis signaling, tendon and ligament research, gut barrier models, and inflammatory stress response.',
    identity: 'Body protection compound peptide fragment',
    target: 'Repair-associated signaling, angiogenesis context, and tissue-stress models',
    pathway: 'Nitric-oxide pathway context, angiogenic signaling, fibroblast and collagen research models',
    markers: 'Tissue repair observations, collagen markers, inflammatory markers, gut barrier and motility research endpoints',
    benefits: [
      { title: 'Repair signaling', description: 'Frequently reviewed in preclinical models of soft-tissue and connective-tissue response.' },
      { title: 'Angiogenesis context', description: 'Supports research around blood-vessel signaling and local repair biology.' },
      { title: 'Gut barrier models', description: 'Appears in literature around gastric and intestinal protection research models.' },
      { title: 'Collagen research', description: 'Relevant to fibroblast, tendon, ligament, and extracellular-matrix study design.' },
      { title: 'Inflammatory stress', description: 'Can be framed around stress-response markers without therapeutic claims.' },
      { title: 'Recovery stack fit', description: 'Often reviewed alongside TB-500 or GHK-Cu in recovery-focused catalog planning.' },
    ],
    researchHighlights: [
      { title: 'Preclinical repair literature', journal: 'Tissue repair research', takeaway: 'BPC-157 is most often discussed in animal and cell models of tissue repair and injury response.', metric: 'PRE' },
      { title: 'Angiogenesis signaling', journal: 'Vascular biology context', takeaway: 'Research often examines blood-vessel formation and nitric-oxide pathway context.', metric: 'NO' },
      { title: 'Gastrointestinal origin', journal: 'Peptide biology summaries', takeaway: 'BPC-157 is described as a peptide sequence related to body protection compound research from gastric juice.', metric: 'GI' },
    ],
    biologyPoints: [
      { title: 'Repair pathway field', description: 'The biology model centers on tissue stress, vascular signaling, and extracellular-matrix response.' },
      { title: 'Fibroblast and collagen context', description: 'Research may track fibroblast activity and collagen organization in controlled models.' },
      { title: 'Gut-tissue connection', description: 'The peptide is commonly discussed across gastrointestinal and soft-tissue research themes.' },
    ],
    faqs: [
      { question: 'Is BPC-157 human-approved?', answer: 'No. This catalog page presents BPC-157 for research-use-only context and does not describe approved treatment use.' },
      { question: 'What research models are most common?', answer: 'Common research contexts include soft-tissue repair, tendon and ligament models, angiogenesis, and gastrointestinal barrier research.' },
    ],
  },
  'tb-500': {
    overview:
      'TB-500 is a synthetic peptide based on a region of thymosin beta-4 studied for actin regulation, cell migration, angiogenesis, and tissue-repair research models.',
    identity: 'Thymosin beta-4 fragment research peptide',
    target: 'Actin-binding and cell-migration biology',
    pathway: 'Cytoskeletal remodeling, cell migration, angiogenesis context, and repair-signal models',
    markers: 'Cell migration, wound-closure models, angiogenesis markers, inflammatory and tissue-remodeling observations',
    benefits: [
      { title: 'Cell migration', description: 'Frames research around migration and remodeling behavior in tissue-repair models.' },
      { title: 'Actin regulation', description: 'Connects product review to cytoskeletal dynamics and actin-related biology.' },
      { title: 'Angiogenesis context', description: 'Relevant to vascular response and repair-signal research questions.' },
      { title: 'Mobility models', description: 'Useful for tendon, ligament, and soft-tissue recovery research framing.' },
      { title: 'Companion stack review', description: 'Often reviewed alongside BPC-157 in recovery and regeneration programs.' },
      { title: 'Preclinical clarity', description: 'Content stays grounded in research models rather than treatment claims.' },
    ],
    researchHighlights: [
      { title: 'Thymosin beta-4 lineage', journal: 'Cell migration literature', takeaway: 'TB-500 is related to thymosin beta-4 research around cytoskeletal remodeling and cell migration.', metric: 'Tβ4' },
      { title: 'Actin pathway context', journal: 'Repair biology summaries', takeaway: 'The actin system is central to migration, remodeling, and tissue-response research models.', metric: 'ACT' },
      { title: 'Angiogenesis model', journal: 'Preclinical research context', takeaway: 'Research commonly reviews angiogenesis and wound-response markers in controlled models.', metric: 'ANG' },
    ],
    biologyPoints: [
      { title: 'Cell migration map', description: 'The visual model centers on actin, cytoskeletal remodeling, and movement of repair-associated cells.' },
      { title: 'Vascular response context', description: 'Angiogenesis research can be part of tissue-repair study planning.' },
      { title: 'Extracellular matrix remodeling', description: 'Researchers may review matrix organization and repair-stage observations.' },
    ],
    faqs: [
      { question: 'How is TB-500 different from BPC-157?', answer: 'TB-500 is usually framed around thymosin beta-4, actin regulation, and cell migration, while BPC-157 is often framed around repair signaling and gut-tissue models.' },
      { question: 'What is the main research theme?', answer: 'The main research theme is tissue remodeling through cell migration, cytoskeletal dynamics, and angiogenesis context.' },
    ],
  },
  'wolverine-stack': {
    overview:
      'Wolverine Stack combines BPC-157 and TB-500 research themes into one recovery-focused kit for repair signaling, cell migration, angiogenesis, and connective-tissue study planning.',
    identity: 'BPC-157 plus TB-500 recovery research stack',
    target: 'Complementary repair signaling and cell-migration pathways',
    pathway: 'BPC-157 repair context plus TB-500 actin and migration models',
    markers: 'Repair observations, collagen organization, angiogenesis context, inflammatory markers, and recovery logs',
    benefits: [
      { title: 'Complementary pathways', description: 'Combines BPC-157 repair signaling with TB-500 migration and actin biology context.' },
      { title: 'Connective tissue models', description: 'Useful for tendon, ligament, and soft-tissue research program planning.' },
      { title: 'Angiogenesis review', description: 'Both research themes can intersect with vascular response and remodeling context.' },
      { title: 'Kit organization', description: 'Keeps companion compounds grouped together for cleaner catalog review.' },
      { title: 'Recovery research', description: 'Frames recovery science without giving treatment or dosing instructions.' },
      { title: 'Documentation clarity', description: 'Supports lot, format, storage, and handling questions in one page.' },
    ],
    researchHighlights: [
      { title: 'BPC-157 repair component', journal: 'Preclinical repair summaries', takeaway: 'BPC-157 contributes repair-signal and gastrointestinal-tissue research context.', metric: 'BPC' },
      { title: 'TB-500 migration component', journal: 'Cell migration literature', takeaway: 'TB-500 contributes thymosin beta-4, actin, and cell-migration research context.', metric: 'TB' },
      { title: 'Stacked kit logic', journal: 'Catalog planning context', takeaway: 'The stack keeps complementary recovery research themes in one organized kit entry.', metric: '2X' },
    ],
    biologyPoints: [
      { title: 'Stacked recovery matrix', description: 'The model shows repair signaling and cell migration as complementary research layers.' },
      { title: 'Connective tissue context', description: 'Tendon, ligament, collagen, and extracellular-matrix markers can inform study design.' },
      { title: 'Kit-level documentation', description: 'Researchers can review both components through one documentation workflow.' },
    ],
    faqs: [
      { question: 'What is in the Wolverine Stack?', answer: 'It is organized around BPC-157 and TB-500 research themes in one recovery-focused catalog entry.' },
      { question: 'Does the stack provide instructions for use?', answer: 'No. The page provides research context only and does not include dosing or treatment instructions.' },
    ],
  },
  klow: {
    overview:
      'KLOW is presented as a research-support kit entry for recovery program organization, handling context, documentation planning, and companion-product workflow clarity.',
    identity: 'Research-support kit entry',
    target: 'Kit organization, handling workflow, and documentation review',
    pathway: 'Not positioned as a single peptide pathway; used to organize supporting components and research logistics',
    markers: 'Lot records, storage checks, preparation logs, shipping context, and kit component verification',
    benefits: [
      { title: 'Kit workflow', description: 'Organizes supporting components for cleaner research-program review.' },
      { title: 'Handling context', description: 'Keeps storage, preparation, and record questions connected to the catalog process.' },
      { title: 'Documentation planning', description: 'Useful for teams that need lot, format, and component details before review.' },
      { title: 'Recovery program support', description: 'Fits beside recovery products without duplicating peptide claims.' },
      { title: 'Supply clarity', description: 'Makes the product role clear when the item is a support format rather than a standalone pathway peptide.' },
      { title: 'Premium kit experience', description: 'Supports a polished, organized fulfillment conversation.' },
    ],
    researchHighlights: [
      { title: 'Kit support role', journal: 'Catalog workflow context', takeaway: 'KLOW is best described through kit logistics, component review, and documentation readiness.', metric: 'KIT' },
      { title: 'Handling record focus', journal: 'Quality workflow context', takeaway: 'Researchers can track preparation, storage, and component details as part of study records.', metric: 'LOG' },
      { title: 'Recovery catalog fit', journal: 'Program planning context', takeaway: 'The page supports recovery-program planning without making a single-compound mechanism claim.', metric: 'RUO' },
    ],
    biologyPoints: [
      { title: 'Research supply array', description: 'The visual model emphasizes organized supporting components and documentation flow.' },
      { title: 'Handling and storage layer', description: 'Study teams can review storage and preparation context before protocol decisions.' },
      { title: 'Recovery workflow context', description: 'KLOW sits beside recovery products as a logistics and support entry.' },
    ],
    faqs: [
      { question: 'Is KLOW a single peptide mechanism page?', answer: 'No. KLOW is positioned as a support or kit-context entry, so its page emphasizes organization, handling, and documentation.' },
      { question: 'What should researchers request?', answer: 'Researchers should request the exact component list, lot details, storage context, and handling documentation.' },
    ],
  },
  'nad-plus': {
    overview:
      'NAD+ is a central cellular cofactor studied for redox biology, mitochondrial energy metabolism, DNA-repair enzyme activity, sirtuin signaling, and healthy-aging research models.',
    identity: 'Nicotinamide adenine dinucleotide',
    target: 'Redox metabolism, mitochondrial function, PARP and sirtuin-associated pathways',
    pathway: 'NAD+/NADH redox cycling, cellular energy production, DNA-repair context, and stress-response signaling',
    markers: 'NAD+/NADH context, mitochondrial markers, oxidative-stress markers, DNA repair and inflammation panels',
    benefits: [
      { title: 'Cellular energy', description: 'Connects product review to NAD+/NADH redox cycling and mitochondrial energy metabolism.' },
      { title: 'Mitochondrial research', description: 'Supports study planning around oxidative phosphorylation and cellular stress response.' },
      { title: 'Sirtuin context', description: 'Often reviewed through healthy-aging literature around NAD-dependent enzyme systems.' },
      { title: 'DNA repair models', description: 'Relevant to PARP-related research and genomic stress response pathways.' },
      { title: 'Redox balance', description: 'Frames oxidative-stress research without implying guaranteed wellness outcomes.' },
      { title: 'Longevity programs', description: 'Pairs naturally with SS-31, glutathione, and epithalon research themes.' },
    ],
    researchHighlights: [
      { title: 'NAD redox biology', journal: 'Cellular metabolism literature', takeaway: 'NAD+ is fundamental to redox reactions and mitochondrial energy metabolism.', metric: 'NAD' },
      { title: 'Sirtuin pathway context', journal: 'Aging biology summaries', takeaway: 'NAD-dependent sirtuins are commonly discussed in healthy-aging and cellular-stress research.', metric: 'SIRT' },
      { title: 'DNA-repair enzyme context', journal: 'Genomic stress literature', takeaway: 'PARP enzymes use NAD+ in DNA-repair-associated pathways.', metric: 'PARP' },
    ],
    biologyPoints: [
      { title: 'Mitochondrial energy field', description: 'The model centers on NAD+/NADH redox cycling and cellular energy production.' },
      { title: 'Sirtuin and PARP context', description: 'NAD-dependent enzymes provide a research bridge into aging and DNA-repair models.' },
      { title: 'Oxidative-stress markers', description: 'Researchers may review redox and inflammation panels as study-specific context.' },
    ],
    faqs: [
      { question: 'What is NAD+?', answer: 'NAD+ is a cofactor involved in redox metabolism, mitochondrial energy production, and NAD-dependent enzyme activity.' },
      { question: 'Why is NAD+ associated with longevity research?', answer: 'Longevity research often studies NAD+ because it intersects with mitochondrial function, sirtuins, PARP enzymes, and cellular stress response.' },
    ],
  },
  glutathione: {
    overview:
      'Glutathione is a tripeptide antioxidant studied for redox balance, oxidative-stress response, detoxification enzyme systems, and cellular defense research.',
    identity: 'Endogenous tripeptide antioxidant',
    target: 'Redox balance, glutathione peroxidase, detoxification and oxidative-stress pathways',
    pathway: 'Reduced and oxidized glutathione cycling, ROS buffering, phase-II detoxification context',
    markers: 'GSH/GSSG ratio, oxidative-stress markers, liver enzyme context, inflammatory and redox panels',
    benefits: [
      { title: 'Redox research', description: 'Frames product review around reduced and oxidized glutathione balance.' },
      { title: 'Oxidative stress', description: 'Supports research into ROS buffering and cellular defense systems.' },
      { title: 'Detox pathway context', description: 'Connects to glutathione-S-transferase and phase-II detoxification literature.' },
      { title: 'Liver marker review', description: 'Often reviewed alongside liver enzymes and antioxidant-capacity markers.' },
      { title: 'Inflammatory context', description: 'Useful for oxidative-stress and inflammatory-marker study planning.' },
      { title: 'Cellular defense', description: 'Pairs well with NAD+ and SS-31 for broader cellular-resilience research.' },
    ],
    researchHighlights: [
      { title: 'Master antioxidant context', journal: 'Redox biology literature', takeaway: 'Glutathione is widely studied as a core intracellular antioxidant and redox buffer.', metric: 'GSH' },
      { title: 'GSH/GSSG ratio', journal: 'Oxidative-stress summaries', takeaway: 'The reduced-to-oxidized glutathione ratio is commonly used as a redox-state marker.', metric: 'GSSG' },
      { title: 'Detoxification enzyme systems', journal: 'Biochemistry context', takeaway: 'Glutathione participates in conjugation and detoxification enzyme pathways.', metric: 'GST' },
    ],
    biologyPoints: [
      { title: 'Redox shield diagram', description: 'The visual model centers on GSH/GSSG cycling and ROS buffering.' },
      { title: 'Detox enzyme context', description: 'Glutathione supports research into conjugation and phase-II detoxification systems.' },
      { title: 'Cellular defense network', description: 'Researchers may track redox, liver, and inflammatory markers depending on study design.' },
    ],
    faqs: [
      { question: 'What is glutathione?', answer: 'Glutathione is an endogenous tripeptide involved in redox balance, antioxidant defense, and detoxification enzyme systems.' },
      { question: 'What markers are relevant?', answer: 'Common research markers include GSH/GSSG ratio, oxidative-stress markers, liver enzyme context, and inflammation panels.' },
    ],
  },
  'ghk-cu': {
    overview:
      'GHK-Cu is a copper peptide complex studied for extracellular-matrix remodeling, collagen signaling, wound-response models, skin biology, and aesthetic research.',
    identity: 'Copper tripeptide complex',
    target: 'Copper peptide signaling, extracellular matrix, collagen and wound-response pathways',
    pathway: 'Matrix remodeling, collagen and elastin research, metalloproteinase context, skin and repair biology',
    markers: 'Collagen markers, elastin context, MMP/TIMP balance, wound-response observations, skin-model endpoints',
    benefits: [
      { title: 'Copper peptide signaling', description: 'Frames research around GHK bound to copper and matrix-response biology.' },
      { title: 'Collagen context', description: 'Relevant to collagen, elastin, and extracellular-matrix remodeling studies.' },
      { title: 'Skin research', description: 'Often reviewed in aesthetic research involving skin structure and repair models.' },
      { title: 'Wound-response models', description: 'Supports preclinical review of repair signaling and remodeling markers.' },
      { title: 'MMP balance', description: 'Useful for study designs involving matrix metalloproteinase and tissue-remodeling context.' },
      { title: 'Aesthetic positioning', description: 'Keeps skin and matrix research premium while avoiding outcome guarantees.' },
    ],
    researchHighlights: [
      { title: 'Copper tripeptide biology', journal: 'Skin and matrix literature', takeaway: 'GHK-Cu is studied for copper peptide signaling and extracellular-matrix remodeling.', metric: 'Cu' },
      { title: 'Collagen remodeling context', journal: 'Aesthetic research summaries', takeaway: 'Research commonly reviews collagen, elastin, and matrix-organization markers.', metric: 'COL' },
      { title: 'Wound-response models', journal: 'Repair biology context', takeaway: 'GHK-Cu appears in literature around repair signaling and skin-model research.', metric: 'ECM' },
    ],
    biologyPoints: [
      { title: 'Copper peptide lattice', description: 'The visual model centers on copper peptide signaling and extracellular-matrix organization.' },
      { title: 'Collagen and elastin context', description: 'Aesthetic research may review structural proteins and skin-model endpoints.' },
      { title: 'Matrix remodeling layer', description: 'MMP/TIMP balance and tissue remodeling can inform research interpretation.' },
    ],
    faqs: [
      { question: 'What is GHK-Cu?', answer: 'GHK-Cu is a copper tripeptide complex studied for extracellular-matrix, collagen, skin, and repair-biology research.' },
      { question: 'Is GHK-Cu only for aesthetics?', answer: 'Its research context is often aesthetic, but the underlying biology includes matrix remodeling and wound-response pathways.' },
    ],
  },
  'ahk-cu': {
    overview:
      'AHK-Cu is a copper peptide complex studied for follicle biology, dermal signaling, extracellular-matrix context, and aesthetic research models.',
    identity: 'Copper peptide complex',
    target: 'Follicle-support models, dermal signaling, copper peptide and matrix biology',
    pathway: 'Copper-associated peptide signaling, dermal papilla research, matrix remodeling and follicle-cycle context',
    markers: 'Follicle-cycle observations, dermal papilla markers, collagen context, inflammatory and matrix remodeling markers',
    benefits: [
      { title: 'Follicle research', description: 'Frames product review around hair-follicle and dermal papilla research models.' },
      { title: 'Copper signaling', description: 'Connects to copper peptide biology and tissue remodeling context.' },
      { title: 'Dermal matrix', description: 'Relevant to skin structure, matrix remodeling, and local signaling studies.' },
      { title: 'Aesthetic science', description: 'Supports cosmetic research themes without making hair-growth outcome claims.' },
      { title: 'Inflammatory context', description: 'May be reviewed alongside local inflammatory and tissue-stress markers.' },
      { title: 'Companion peptide fit', description: 'Naturally pairs with GHK-Cu in aesthetic catalog review.' },
    ],
    researchHighlights: [
      { title: 'Follicle pathway context', journal: 'Aesthetic biology summaries', takeaway: 'AHK-Cu is commonly discussed in relation to follicle and dermal signaling research.', metric: 'FOL' },
      { title: 'Copper peptide research', journal: 'Peptide chemistry context', takeaway: 'Copper complexing is central to the product identity and research positioning.', metric: 'Cu' },
      { title: 'Dermal matrix model', journal: 'Skin research context', takeaway: 'Matrix remodeling and dermal signaling markers can inform study design.', metric: 'ECM' },
    ],
    biologyPoints: [
      { title: 'Follicle signaling field', description: 'The biology model centers on follicle-cycle and dermal papilla research context.' },
      { title: 'Copper peptide layer', description: 'Copper complexing provides the main product identity and signaling frame.' },
      { title: 'Aesthetic marker review', description: 'Researchers may review local dermal, matrix, and inflammatory observations.' },
    ],
    faqs: [
      { question: 'How is AHK-Cu positioned?', answer: 'AHK-Cu is positioned for copper peptide and follicle-focused aesthetic research context.' },
      { question: 'How is it different from GHK-Cu?', answer: 'GHK-Cu is often framed broadly around skin and matrix remodeling, while AHK-Cu is more commonly framed around follicle and dermal signaling research.' },
    ],
  },
  epithalon: {
    overview:
      'Epithalon is a synthetic tetrapeptide studied in aging biology, pineal peptide research, telomere-associated models, circadian context, and cellular stress-response studies.',
    identity: 'Synthetic tetrapeptide',
    target: 'Aging biology, telomere-associated research, pineal and circadian pathway context',
    pathway: 'Telomerase-associated models, cellular senescence context, circadian and pineal peptide research',
    markers: 'Telomere-associated markers, senescence markers, oxidative-stress panels, circadian observations',
    benefits: [
      { title: 'Aging biology', description: 'Frames research around senescence, cellular resilience, and biological-time models.' },
      { title: 'Telomere context', description: 'Often discussed in relation to telomere and telomerase-associated research.' },
      { title: 'Pineal peptide lineage', description: 'Connects to literature around pineal peptides and aging-associated physiology.' },
      { title: 'Circadian research', description: 'Can be reviewed alongside sleep-wake and circadian observation models.' },
      { title: 'Stress response', description: 'Useful for oxidative-stress and cellular-resilience study planning.' },
      { title: 'Longevity stack fit', description: 'Pairs naturally with NAD+, SS-31, and glutathione research themes.' },
    ],
    researchHighlights: [
      { title: 'Tetrapeptide identity', journal: 'Peptide aging literature', takeaway: 'Epithalon is studied as a short synthetic peptide in aging-biology research.', metric: '4AA' },
      { title: 'Telomere-associated model', journal: 'Longevity research summaries', takeaway: 'Research commonly discusses telomere and telomerase-associated markers in controlled settings.', metric: 'TEL' },
      { title: 'Pineal peptide context', journal: 'Chronobiology context', takeaway: 'Epithalon is often reviewed through pineal and circadian research themes.', metric: 'PIN' },
    ],
    biologyPoints: [
      { title: 'Telomere research arc', description: 'The visual model centers on cellular aging, telomere-associated markers, and resilience.' },
      { title: 'Pineal and circadian context', description: 'Chronobiology themes can inform qualified study design.' },
      { title: 'Senescence marker layer', description: 'Researchers may review oxidative-stress and cellular senescence markers.' },
    ],
    faqs: [
      { question: 'What is Epithalon studied for?', answer: 'Epithalon is studied in aging biology, telomere-associated models, pineal peptide context, and circadian research.' },
      { question: 'Does this page claim lifespan extension?', answer: 'No. It presents research context only and does not claim lifespan extension or therapeutic benefit.' },
    ],
  },
  cerebrolysin: {
    overview:
      'Cerebrolysin is a peptide mixture studied in neurotrophic signaling, neuronal survival models, synaptic plasticity, cognitive research, and neuro-repair pathway context.',
    identity: 'Neurotrophic peptide mixture',
    target: 'Neurotrophic signaling, neuronal survival, synaptic plasticity and repair-associated pathways',
    pathway: 'BDNF/NGF-like activity context, neuronal stress response, synaptic remodeling, and neuroinflammation models',
    markers: 'Cognitive task models, neuroinflammatory markers, synaptic plasticity markers, neuronal survival observations',
    benefits: [
      { title: 'Neurotrophic context', description: 'Frames research around growth-factor-like neuronal signaling and survival models.' },
      { title: 'Synaptic plasticity', description: 'Relevant to learning, memory, and neural adaptation research questions.' },
      { title: 'Neuro-repair models', description: 'Supports study planning around injury-response and neuronal resilience pathways.' },
      { title: 'Cognitive research', description: 'Often reviewed in relation to cognitive-performance and neurobiology markers.' },
      { title: 'Inflammation context', description: 'Can be paired with neuroinflammatory marker review in qualified study designs.' },
      { title: 'Ampoule format clarity', description: 'Keeps format, handling, and documentation questions clear for review.' },
    ],
    researchHighlights: [
      { title: 'Neurotrophic peptide mixture', journal: 'Neurobiology literature', takeaway: 'Cerebrolysin is studied as a peptide mixture with neurotrophic and neuronal-survival research interest.', metric: 'NTF' },
      { title: 'Synaptic plasticity context', journal: 'Cognitive research summaries', takeaway: 'Research commonly reviews synaptic and cognitive-model endpoints.', metric: 'SYN' },
      { title: 'Neuro-repair pathway', journal: 'Preclinical and clinical context', takeaway: 'Published work has evaluated neuro-repair and injury-response contexts; interpretation is study-specific.', metric: 'NEU' },
    ],
    biologyPoints: [
      { title: 'Neural network map', description: 'The model centers on neurotrophic signaling, synaptic plasticity, and neuronal resilience.' },
      { title: 'Growth-factor-like context', description: 'Research discussions often compare activity to neurotrophic factor pathways.' },
      { title: 'Neuroinflammation layer', description: 'Inflammatory markers may be relevant depending on study design.' },
    ],
    faqs: [
      { question: 'What is Cerebrolysin?', answer: 'Cerebrolysin is a peptide mixture studied for neurotrophic signaling, neuronal survival, and cognitive-research models.' },
      { question: 'Is this page making neurological treatment claims?', answer: 'No. The page is research-use-only and does not describe treatment, diagnosis, or guaranteed cognitive outcomes.' },
    ],
  },
  ss31: {
    overview:
      'SS-31, also known as elamipretide in research literature, is a mitochondria-targeted peptide studied for cardiolipin interaction, inner-membrane stability, oxidative stress, and cellular energy models.',
    identity: 'Mitochondria-targeted tetrapeptide',
    target: 'Mitochondrial inner membrane and cardiolipin-associated biology',
    pathway: 'Cardiolipin interaction, electron transport chain context, mitochondrial ROS and ATP-production models',
    markers: 'Mitochondrial membrane potential, ROS markers, ATP context, cardiolipin and oxidative-stress observations',
    benefits: [
      { title: 'Mitochondrial targeting', description: 'Frames research around inner-membrane and cardiolipin-associated biology.' },
      { title: 'Cardiolipin context', description: 'A key research theme is interaction with cardiolipin in mitochondrial membranes.' },
      { title: 'Oxidative stress', description: 'Supports study planning around ROS and mitochondrial stress markers.' },
      { title: 'ATP production models', description: 'Relevant to energy-output and electron transport chain research context.' },
      { title: 'Cellular resilience', description: 'Fits longevity and performance programs centered on mitochondrial function.' },
      { title: 'Disease-model caution', description: 'Published disease-model research should be presented as study-specific, not product outcome claims.' },
    ],
    researchHighlights: [
      { title: 'Cardiolipin-associated mechanism', journal: 'Mitochondrial biology literature', takeaway: 'SS-31 is studied for interaction with cardiolipin and mitochondrial inner-membrane function.', metric: 'CL' },
      { title: 'Oxidative-stress model', journal: 'Cellular energy summaries', takeaway: 'Research commonly reviews ROS and mitochondrial stress markers.', metric: 'ROS' },
      { title: 'Elamipretide research context', journal: 'Clinical and preclinical literature', takeaway: 'Elamipretide literature provides mitochondria-focused context; outcomes are study-specific.', metric: 'ELA' },
    ],
    biologyPoints: [
      { title: 'Mitochondrial membrane map', description: 'The visual model centers on inner-membrane stability, cardiolipin, and energy production.' },
      { title: 'Electron transport context', description: 'Researchers may review ATP and oxidative phosphorylation markers.' },
      { title: 'ROS response layer', description: 'Oxidative-stress observations can help frame cellular-resilience research.' },
    ],
    faqs: [
      { question: 'What is SS-31?', answer: 'SS-31 is a mitochondria-targeted tetrapeptide studied for cardiolipin-associated mitochondrial membrane biology.' },
      { question: 'Is SS-31 the same as elamipretide?', answer: 'SS-31 is commonly associated with elamipretide in research literature, but this catalog page is research-use-only and not a treatment page.' },
    ],
  },
  dsip: {
    overview:
      'DSIP, or delta sleep-inducing peptide, is a neuropeptide studied for sleep architecture models, neuroendocrine signaling, stress response, and recovery-related research context.',
    identity: 'Delta sleep-inducing peptide',
    target: 'Sleep architecture, neuroendocrine signaling, and stress-response models',
    pathway: 'Sleep-wake regulation context, hypothalamic-pituitary signaling, autonomic and recovery markers',
    markers: 'Sleep-stage observations, cortisol context, autonomic markers, recovery logs, and neuroendocrine panels',
    benefits: [
      { title: 'Sleep research', description: 'Frames review around sleep-stage and rest-recovery research models.' },
      { title: 'Neuroendocrine context', description: 'Connects to hypothalamic-pituitary signaling and stress-response markers.' },
      { title: 'Recovery models', description: 'Useful for studying rest, training load, and recovery observations.' },
      { title: 'Stress response', description: 'Can be reviewed alongside cortisol and autonomic marker context.' },
      { title: 'Cognitive overlap', description: 'Sleep research naturally intersects with focus, mood, and performance models.' },
      { title: 'Conservative framing', description: 'Avoids sleep treatment claims while providing real pathway context.' },
    ],
    researchHighlights: [
      { title: 'Delta sleep-inducing peptide identity', journal: 'Neuropeptide literature', takeaway: 'DSIP is studied as a neuropeptide associated with sleep and neuroendocrine research context.', metric: 'DSIP' },
      { title: 'Sleep architecture model', journal: 'Sleep research summaries', takeaway: 'Research may review sleep-stage observations and recovery markers.', metric: 'REM' },
      { title: 'Stress-response context', journal: 'Neuroendocrine biology', takeaway: 'Neuroendocrine and autonomic markers can inform study design.', metric: 'HPA' },
    ],
    biologyPoints: [
      { title: 'Sleep signaling wave', description: 'The visual model centers on sleep-wake signaling and recovery biology.' },
      { title: 'HPA-axis context', description: 'Stress-response markers can be reviewed as part of neuroendocrine study planning.' },
      { title: 'Recovery observation layer', description: 'Researchers may track rest quality, autonomic markers, and performance recovery.' },
    ],
    faqs: [
      { question: 'What does DSIP stand for?', answer: 'DSIP stands for delta sleep-inducing peptide, a neuropeptide studied in sleep and neuroendocrine research contexts.' },
      { question: 'Does this page provide sleep treatment advice?', answer: 'No. It provides research context only and does not provide treatment advice or dosing protocols.' },
    ],
  },
  kisspeptin: {
    overview:
      'Kisspeptin is a neuropeptide studied for reproductive-axis signaling, GnRH pulse regulation, LH/FSH response, puberty models, and endocrine research context.',
    identity: 'Reproductive-axis neuropeptide',
    target: 'Kisspeptin receptor and GnRH-axis signaling',
    pathway: 'Kisspeptin receptor activation, GnRH pulse regulation, LH and FSH marker response',
    markers: 'LH, FSH, testosterone or estradiol context, GnRH pulse models, fertility-research markers',
    benefits: [
      { title: 'GnRH-axis research', description: 'Frames review around upstream reproductive-axis signaling.' },
      { title: 'LH and FSH markers', description: 'Supports endocrine study planning around gonadotropin marker response.' },
      { title: 'Puberty model context', description: 'Kisspeptin is well known in research for reproductive maturation signaling.' },
      { title: 'Hormone pathway mapping', description: 'Useful for mapping upstream and downstream endocrine markers.' },
      { title: 'Wellness-adjacent review', description: 'Keeps sexual wellness language grounded in reproductive-axis biology.' },
      { title: 'Qualified oversight', description: 'Endocrine pathway research needs careful marker selection and compliance review.' },
    ],
    researchHighlights: [
      { title: 'Kisspeptin receptor signaling', journal: 'Reproductive endocrinology literature', takeaway: 'Kisspeptin is a key regulator of GnRH-axis signaling in research models.', metric: 'KISS1R' },
      { title: 'Gonadotropin marker context', journal: 'Endocrine research summaries', takeaway: 'LH and FSH are commonly reviewed downstream of GnRH-axis signaling.', metric: 'LH' },
      { title: 'Reproductive-axis mapping', journal: 'Hormone pathway context', takeaway: 'Research often maps kisspeptin, GnRH, gonadotropins, and sex-steroid marker relationships.', metric: 'GnRH' },
    ],
    biologyPoints: [
      { title: 'Reproductive-axis map', description: 'The visual model centers on kisspeptin receptor signaling and GnRH pulse regulation.' },
      { title: 'LH and FSH marker layer', description: 'Downstream gonadotropins help frame endocrine research interpretation.' },
      { title: 'Sex-steroid context', description: 'Qualified studies may review testosterone or estradiol context depending on design.' },
    ],
    faqs: [
      { question: 'What is Kisspeptin?', answer: 'Kisspeptin is a neuropeptide studied as a regulator of reproductive-axis and GnRH signaling.' },
      { question: 'What markers are commonly reviewed?', answer: 'Common research markers include LH, FSH, GnRH-axis context, and sex-steroid marker panels where appropriate.' },
    ],
  },
  hcg: {
    overview:
      'HCG is a glycoprotein hormone studied for LH-receptor signaling, gonadal steroidogenesis models, fertility research context, and endocrine marker review.',
    identity: 'Human chorionic gonadotropin',
    target: 'LH/CG receptor signaling',
    pathway: 'LH-receptor activation, steroidogenesis context, gonadal marker response, endocrine feedback models',
    markers: 'LH/CG receptor context, testosterone or estradiol markers, progesterone context, fertility-research markers',
    benefits: [
      { title: 'LH-receptor context', description: 'Frames research around LH/CG receptor signaling and endocrine response.' },
      { title: 'Steroidogenesis models', description: 'Relevant to gonadal steroid hormone marker research.' },
      { title: 'Fertility research', description: 'Often reviewed in reproductive biology and fertility marker contexts.' },
      { title: 'Hormone marker review', description: 'Supports study planning around testosterone, estradiol, and progesterone context.' },
      { title: 'Endocrine feedback', description: 'Helps organize upstream and downstream pathway interpretation.' },
      { title: 'Variant clarity', description: 'Multiple catalog formats remain grouped under one HCG product page.' },
    ],
    researchHighlights: [
      { title: 'LH/CG receptor biology', journal: 'Endocrinology literature', takeaway: 'HCG is studied through LH/CG receptor signaling and downstream endocrine response.', metric: 'LHCGR' },
      { title: 'Steroidogenesis marker context', journal: 'Hormone research summaries', takeaway: 'Research may review gonadal steroid markers depending on study model.', metric: 'STR' },
      { title: 'Reproductive biology model', journal: 'Fertility research context', takeaway: 'HCG is widely discussed in reproductive biology research, with interpretation dependent on design.', metric: 'REP' },
    ],
    biologyPoints: [
      { title: 'Hormone receptor field', description: 'The visual model centers on LH/CG receptor signaling and endocrine marker response.' },
      { title: 'Steroidogenesis pathway', description: 'Researchers may review testosterone, estradiol, or progesterone context in qualified studies.' },
      { title: 'Feedback-system layer', description: 'Endocrine feedback interpretation is important for responsible research planning.' },
    ],
    faqs: [
      { question: 'What is HCG?', answer: 'HCG is human chorionic gonadotropin, a glycoprotein hormone studied for LH/CG receptor signaling and reproductive biology.' },
      { question: 'Does this page provide fertility treatment instructions?', answer: 'No. It is research-use-only and does not provide treatment instructions or dosing protocols.' },
    ],
  },
  'hgh-191aa': {
    overview:
      'HGH 191AA refers to the 191-amino-acid human growth hormone sequence studied for GH receptor signaling, IGF-1 axis response, protein metabolism, recovery, and body-composition research context.',
    identity: '191-amino-acid human growth hormone sequence',
    target: 'Growth hormone receptor and IGF-1 axis',
    pathway: 'GH receptor signaling, JAK-STAT context, hepatic IGF-1 production, protein and lipid metabolism models',
    markers: 'IGF-1, glucose markers, lipid markers, body-composition context, recovery and protein-metabolism observations',
    benefits: [
      { title: 'GH receptor signaling', description: 'Frames research around growth hormone receptor and JAK-STAT pathway context.' },
      { title: 'IGF-1 axis response', description: 'IGF-1 is commonly reviewed as a downstream marker.' },
      { title: 'Protein metabolism', description: 'Relevant to anabolic signaling and nitrogen-balance research models.' },
      { title: 'Body composition', description: 'Can be reviewed in body-composition research with careful marker oversight.' },
      { title: 'Recovery context', description: 'Supports performance and recovery research themes without treatment claims.' },
      { title: 'Glucose caution', description: 'GH-axis research can intersect with glucose markers and should be qualified-review led.' },
    ],
    researchHighlights: [
      { title: '191AA sequence context', journal: 'Endocrine biology literature', takeaway: 'Somatropin research centers on the 191-amino-acid human growth hormone sequence.', metric: '191' },
      { title: 'GH receptor pathway', journal: 'Hormone signaling summaries', takeaway: 'Growth hormone receptor signaling includes JAK-STAT and IGF-1 axis context.', metric: 'GHR' },
      { title: 'Metabolic marker review', journal: 'Performance research context', takeaway: 'Study designs often review IGF-1, glucose, lipid, and composition markers.', metric: 'IGF' },
    ],
    biologyPoints: [
      { title: 'GH receptor cascade', description: 'The visual model centers on GH receptor signaling and downstream IGF-1 axis response.' },
      { title: 'JAK-STAT pathway context', description: 'JAK-STAT signaling helps frame endocrine pathway interpretation.' },
      { title: 'Metabolic marker layer', description: 'Researchers may review glucose, lipid, and composition markers under qualified oversight.' },
    ],
    faqs: [
      { question: 'What does 191AA mean?', answer: '191AA refers to the 191-amino-acid human growth hormone sequence commonly discussed in somatropin research.' },
      { question: 'What markers are relevant?', answer: 'IGF-1, glucose markers, lipid markers, and body-composition context are commonly reviewed in GH-axis research.' },
    ],
  },
  'thymosin-alpha-1': {
    overview:
      'Thymosin Alpha-1 is an immune-signaling peptide studied for T-cell function, innate and adaptive immune models, cytokine context, and cellular defense research.',
    identity: 'Thymic immune-signaling peptide',
    target: 'T-cell signaling, dendritic cell context, innate and adaptive immune response models',
    pathway: 'T-cell maturation context, TLR signaling literature, cytokine balance, immune-surveillance research',
    markers: 'T-cell markers, cytokine panels, inflammatory markers, innate immune response and immune balance observations',
    benefits: [
      { title: 'Immune signaling', description: 'Frames research around thymic peptide and immune communication pathways.' },
      { title: 'T-cell context', description: 'Relevant to T-cell function, maturation, and adaptive immune marker review.' },
      { title: 'Innate immunity', description: 'Can be reviewed alongside innate immune and TLR-related pathway context.' },
      { title: 'Cytokine balance', description: 'Supports study planning around cytokine and inflammatory marker panels.' },
      { title: 'Cellular defense', description: 'Fits longevity and resilience research without disease-treatment claims.' },
      { title: 'Qualified oversight', description: 'Immune research requires careful study design and compliance review.' },
    ],
    researchHighlights: [
      { title: 'Thymic peptide identity', journal: 'Immunology literature', takeaway: 'Thymosin Alpha-1 is studied as an immune-signaling peptide related to thymic function.', metric: 'Tα1' },
      { title: 'T-cell marker context', journal: 'Immune research summaries', takeaway: 'Research commonly reviews T-cell function and adaptive immune response markers.', metric: 'T-CELL' },
      { title: 'Cytokine pathway review', journal: 'Inflammation context', takeaway: 'Cytokine and inflammatory marker panels can inform study-specific interpretation.', metric: 'CYT' },
    ],
    biologyPoints: [
      { title: 'Immune signaling array', description: 'The visual model centers on T-cell, cytokine, and innate immune pathway context.' },
      { title: 'Adaptive response layer', description: 'Researchers may review T-cell and immune-surveillance markers.' },
      { title: 'Cytokine balance context', description: 'Inflammatory and cytokine panels help frame immune signaling studies.' },
    ],
    faqs: [
      { question: 'What is Thymosin Alpha-1?', answer: 'Thymosin Alpha-1 is a peptide studied for immune signaling, T-cell context, and innate/adaptive immune response models.' },
      { question: 'Does this page claim immune treatment effects?', answer: 'No. It presents research context only and does not claim to treat or prevent disease.' },
    ],
  },
  'pt-141': {
    overview:
      'PT-141, also known as bremelanotide in literature, is a melanocortin receptor agonist studied for central nervous system signaling, sexual wellness research models, and neural pathway context.',
    identity: 'Melanocortin receptor agonist',
    target: 'Melanocortin receptors, especially MC3R and MC4R research context',
    pathway: 'Central melanocortin signaling, autonomic and sexual-behavior research models',
    markers: 'Melanocortin receptor context, autonomic observations, behavioral-model endpoints, cardiovascular safety markers in qualified studies',
    benefits: [
      { title: 'Melanocortin signaling', description: 'Frames research around central melanocortin receptor pathway biology.' },
      { title: 'Neural pathway context', description: 'Relevant to CNS signaling and autonomic research models.' },
      { title: 'Sexual wellness research', description: 'Supports responsible wellness-adjacent research framing without treatment instructions.' },
      { title: 'Behavioral models', description: 'Can be reviewed in controlled behavioral and receptor-response research.' },
      { title: 'Safety marker review', description: 'Qualified studies may consider cardiovascular and tolerability markers.' },
      { title: 'Variant grouping', description: 'Available catalog formats remain inside one PT-141 product page.' },
    ],
    researchHighlights: [
      { title: 'Melanocortin receptor pathway', journal: 'Neuroendocrine literature', takeaway: 'PT-141 is studied as a melanocortin receptor agonist with central signaling interest.', metric: 'MC4R' },
      { title: 'Bremelanotide literature context', journal: 'Clinical research summaries', takeaway: 'Bremelanotide literature provides receptor and safety context; this catalog page remains RUO.', metric: 'BMT' },
      { title: 'Autonomic signaling model', journal: 'Wellness research context', takeaway: 'Research may review autonomic and behavioral-model endpoints under qualified oversight.', metric: 'CNS' },
    ],
    biologyPoints: [
      { title: 'Melanocortin receptor map', description: 'The visual model centers on central melanocortin receptor signaling.' },
      { title: 'Autonomic pathway context', description: 'Research may review autonomic and behavioral endpoint models.' },
      { title: 'Safety marker layer', description: 'Qualified oversight may include cardiovascular and tolerability marker context.' },
    ],
    faqs: [
      { question: 'What is PT-141?', answer: 'PT-141 is a melanocortin receptor agonist studied for central nervous system signaling and sexual wellness research models.' },
      { question: 'Is this a prescription or treatment page?', answer: 'No. This is a research-use-only catalog page and does not provide treatment claims or instructions.' },
    ],
  },
  semax: {
    overview:
      'Semax is a synthetic ACTH-fragment analog studied for neuropeptide signaling, BDNF-related expression, cognitive performance models, stress response, and neuroprotection research.',
    identity: 'Synthetic ACTH-fragment neuropeptide analog',
    target: 'Neuropeptide signaling, BDNF-associated expression, cognitive and stress-response models',
    pathway: 'ACTH-fragment context, neurotrophic marker expression, dopaminergic and stress-response research themes',
    markers: 'BDNF context, cognitive task models, stress markers, neuroinflammatory and attention-related observations',
    benefits: [
      { title: 'Neuropeptide research', description: 'Frames review around ACTH-fragment peptide signaling.' },
      { title: 'BDNF context', description: 'Often discussed in relation to neurotrophic marker expression.' },
      { title: 'Cognitive models', description: 'Relevant to focus, attention, and learning research designs.' },
      { title: 'Stress response', description: 'Can be reviewed alongside stress and neuroinflammatory marker context.' },
      { title: 'Performance research', description: 'Fits cognitive-performance programs while avoiding guaranteed outcome claims.' },
      { title: 'Format clarity', description: 'Keeps catalog and documentation review organized for this peptide entry.' },
    ],
    researchHighlights: [
      { title: 'ACTH-fragment analog', journal: 'Neuropeptide literature', takeaway: 'Semax is studied as a synthetic ACTH-fragment analog with neuropeptide signaling interest.', metric: 'ACTH' },
      { title: 'BDNF marker context', journal: 'Cognitive research summaries', takeaway: 'Research often reviews BDNF-related expression and neurotrophic marker context.', metric: 'BDNF' },
      { title: 'Attention model review', journal: 'Performance biology context', takeaway: 'Cognitive and attention-related models can inform study planning.', metric: 'FOC' },
    ],
    biologyPoints: [
      { title: 'Focus pathway lattice', description: 'The visual model centers on neuropeptide signaling and cognitive-performance markers.' },
      { title: 'BDNF marker layer', description: 'Neurotrophic expression context can guide research interpretation.' },
      { title: 'Stress response context', description: 'Stress and neuroinflammatory observations may be relevant depending on design.' },
    ],
    faqs: [
      { question: 'What is Semax?', answer: 'Semax is a synthetic ACTH-fragment analog studied for neuropeptide signaling, cognitive models, and neurotrophic marker context.' },
      { question: 'Does Semax guarantee focus benefits?', answer: 'No. The page presents research context only and does not guarantee cognitive outcomes.' },
    ],
  },
  selank: {
    overview:
      'Selank is a synthetic tuftsin analog studied for anxiolytic-like research models, immune-neuropeptide signaling, stress response, serotonin system context, and cognitive performance research.',
    identity: 'Synthetic tuftsin analog neuropeptide',
    target: 'Stress-response models, immune-neuropeptide signaling, serotonin-system context',
    pathway: 'Tuftsin analog biology, neuroimmune signaling, stress-response and mood-related research models',
    markers: 'Stress markers, behavioral-model observations, serotonin context, immune and inflammatory markers',
    benefits: [
      { title: 'Stress-response research', description: 'Frames review around stress, calm, and neuroendocrine marker models.' },
      { title: 'Neuroimmune context', description: 'Connects tuftsin analog biology to immune-neuropeptide signaling.' },
      { title: 'Serotonin system', description: 'Often discussed in relation to serotonin and mood-related research context.' },
      { title: 'Cognitive wellness', description: 'Relevant to focus, mood, and performance research models without outcome claims.' },
      { title: 'Inflammatory markers', description: 'Can be reviewed alongside immune and inflammatory marker panels.' },
      { title: 'Companion cognitive fit', description: 'Pairs naturally with Semax in cognitive-performance catalog review.' },
    ],
    researchHighlights: [
      { title: 'Tuftsin analog identity', journal: 'Neuropeptide literature', takeaway: 'Selank is studied as a synthetic analog related to tuftsin and neuroimmune signaling.', metric: 'TFT' },
      { title: 'Stress-response model', journal: 'Behavioral research summaries', takeaway: 'Research commonly reviews stress-response and anxiolytic-like behavioral models.', metric: 'STR' },
      { title: 'Serotonin context', journal: 'Mood pathway context', takeaway: 'Serotonin-system context is often discussed in Selank research literature.', metric: '5HT' },
    ],
    biologyPoints: [
      { title: 'Neural balance field', description: 'The visual model centers on stress-response, mood-related, and neuroimmune signaling context.' },
      { title: 'Tuftsin analog layer', description: 'Tuftsin-related biology provides the peptide identity and immune signaling frame.' },
      { title: 'Serotonin marker context', description: 'Researchers may review serotonin-related context and behavioral-model observations.' },
    ],
    faqs: [
      { question: 'What is Selank?', answer: 'Selank is a synthetic tuftsin analog studied for stress-response, neuroimmune, and cognitive wellness research models.' },
      { question: 'Does Selank treat anxiety?', answer: 'No. This page is research-use-only and does not claim to diagnose, treat, cure, or prevent anxiety or any condition.' },
    ],
  },
}

const catalogTaglines: Record<string, string> = {
  retatrutide: 'Triple-receptor incretin biology, in one research entry.',
  tesamorelin: 'GH-axis signaling research, in a single clean format.',
  'cjc1295-ipamorelin': 'Two GH-axis mechanisms, paired for combination research.',
  'mots-c': 'Mitochondrial energy signaling, studied at the AMPK level.',
  'aod-9604': 'GH-fragment metabolic research, organized for clean review.',
  'wolverine-stack': 'BPC-157 and TB-500, packaged for combined research review.',
  'bpc-157': 'The most-referenced repair peptide in preclinical literature.',
  'tb-500': 'Actin biology and cell-migration research, one peptide deep.',
  klow: 'Kit logistics and documentation, organized before it ships.',
  'ghk-cu': 'Copper-peptide matrix research, from collagen to wound response.',
  'ahk-cu': 'A follicle-focused copper peptide, distinct from GHK-Cu.',
  'igf1-lr3': 'Long-acting IGF-1 receptor research, built for duration studies.',
  cerebrolysin: 'A neurotrophic peptide mixture, studied for neuronal survival.',
  semax: 'ACTH-fragment biology behind BDNF-linked cognitive research.',
  selank: 'Tuftsin-analog research into stress response and neuroimmune signaling.',
  'nad-plus': 'The cofactor at the center of redox and aging research.',
  glutathione: "Research literature's most-cited intracellular antioxidant.",
  epithalon: 'Telomere-adjacent, circadian-linked peptide research.',
  ss31: 'Mitochondrial membrane research, one cardiolipin interaction at a time.',
  'thymosin-alpha-1': 'Immune-signaling research with a cellular-defense focus.',
  dsip: 'Sleep-architecture research from a neuroendocrine angle.',
  kisspeptin: 'The upstream signal in reproductive-axis research.',
  hcg: 'Downstream gonadotropin research, one receptor pathway at a time.',
  'hgh-191aa': 'The full-length GH sequence, studied for axis-level signaling.',
  'pt-141': 'Central melanocortin-receptor research, not a wellness promise.',
}

function getDosage(variants: ProductVariant[]) {
  return variants.map((variant) => variant.label).join(' / ')
}

// Confirmed, product-specific BAC water amounts only. Do not infer a value from
// strength/format — an unlisted slug intentionally falls back to the generic
// "Product-specific pre-measured BAC water" label until a real amount is confirmed.
const bacWaterAmountBySlug: Record<string, string> = {}

function createPageContent(product: CatalogProduct): ProductPageContent {
  const categoryCopy = categoryPositioning[product.category] ?? 'research may explore investigational pathway models'
  const profile = productPositioning[product.slug]
  const facts = productFacts[product.slug]
  const benefits = facts?.benefits ?? categoryBenefits[product.category] ?? categoryBenefits['Longevity & Cellular Health']
  const focus = profile?.focus ?? categoryCopy
  const mechanismSteps = profile?.mechanism ?? [
    'Product documentation review',
    'Pathway-level research model',
    'Controlled observation record',
    'Study-specific outcome review',
  ]

  return {
    dosage: getDosage(product.variants),
    shortDescription:
      facts?.overview ?? `${product.name} is presented as a premium research-use catalog entry for ${focus}.`,
    catalogTagline: catalogTaglines[product.slug] ?? `${product.name} research entry, grouped for catalog review.`,
    heroImage: product.image,
    badge: `${product.category} research`,
    headline: profile?.headline ?? categoryHeadlines[product.category] ?? 'Premium Research Review. Clear Documentation. Responsible Access.',
    keyHighlights: [
      facts?.identity ?? 'Documentation-first catalog review',
      facts?.target ?? 'Variants grouped under one product page',
      facts?.markers ?? 'Research-use positioning with compliant language',
      'Research-use positioning with no dosing protocols',
    ],
    benefits,
    mechanismSteps,
    scienceStats: [
      { value: facts ? 'ID' : '6', label: 'Product identity', note: facts?.identity ?? 'A structured way to frame mechanism, handling, storage, documentation, marker selection, and review.' },
      { value: facts ? 'PATH' : '3-5', label: 'Primary pathway', note: facts?.pathway ?? 'Study workflows are presented as staged research models, not dosing or treatment protocols.' },
      { value: 'RUO', label: 'Research framing', note: 'Every section is written for research-use context with no guaranteed outcomes.' },
    ],
    researchHighlights: facts?.researchHighlights ?? [
      {
        title: `${product.name} pathway review`,
        journal: 'Research context summary',
        takeaway: `Highlights investigational interest where ${categoryCopy}.`,
        metric: '92%',
      },
      {
        title: `${product.category} marker mapping`,
        journal: 'Study-specific literature signal',
        takeaway: 'Supports selecting qualified markers before any study plan is finalized.',
        metric: '87%',
      },
      {
        title: 'Documentation-led product evaluation',
        journal: 'Encore catalog standard',
        takeaway: 'Prioritizes product identity, format, storage context, and review-ready records.',
        metric: '100%',
      },
    ],
    statistics: [
      { value: 'ID', label: facts?.identity ?? 'Product identity', note: facts ? `Primary identity: ${facts.identity}.` : 'Illustrative internal catalog completeness signal, not a biological outcome.' },
      { value: 'PATH', label: 'Pathway map', note: facts?.pathway ?? 'Represents study-planning alignment in research summaries and varies by design.' },
      { value: 'MARK', label: 'Marker review', note: facts?.markers ?? 'Illustrative comparison of structured pathway review versus unstructured notes.' },
      { value: 'RUO', label: 'Use classification', note: 'Research use only. Not for human or animal consumption, dosing guidance, or promised outcomes.' },
    ],
    biologyPoints: facts?.biologyPoints ?? [
      { title: profile?.visual ?? 'molecular pathway map', description: 'Animated pathway visuals frame the product around cells, receptors, and signaling context.' },
      { title: 'Cellular response model', description: 'Slow biology motion keeps the page premium while staying grounded in research-use education.' },
      { title: 'Documentation layer', description: 'Every visual section ties back to storage, lot review, handling, and responsible inquiry routing.' },
    ],
    benefitAudiences: [
      { title: 'Metabolic research teams', description: 'For qualified review of output, adaptive demand, and pathway-level markers.' },
      { title: 'Performance model review', description: 'For research teams evaluating performance-context markers and recovery demand.' },
      { title: 'Cellular resilience research', description: 'For programs exploring resilience, cellular health, and aging-biology research questions.' },
      { title: 'Regeneration models', description: 'For review of repair signaling, restoration models, and structured observation records.' },
      { title: 'Body-composition research', description: 'For study designs centered on metabolic, performance, or composition-adjacent markers.' },
      { title: 'Documentation-led programs', description: 'For product review before qualified oversight and study-plan decisions.' },
    ],
    differentiators: [
      { standard: 'Generic catalog copy with broad promises', targeted: 'Research-use framing tied to pathway, marker, and documentation review' },
      { standard: 'Duplicate cards for each format', targeted: 'All variants grouped inside one product object and one clean product page' },
      { standard: 'Static product information', targeted: 'Animated biology, gallery, research highlights, and responsible FAQ depth' },
      { standard: 'Outcome-forward copy', targeted: 'Study-specific language with qualifiers and no guaranteed outcomes' },
    ],
    galleryCaptions: [
      `${product.name} research vial presentation`,
      `${profile?.visual ?? product.category} molecular backdrop`,
      'Cold-chain and documentation-ready handling context',
    ],
    specs: [
      { label: 'Research area', value: product.category },
      { label: 'Product identity', value: facts?.identity ?? 'Research catalog entry' },
      { label: 'Primary target', value: facts?.target ?? categoryCopy },
      { label: 'Research markers', value: facts?.markers ?? 'Study-specific markers vary by qualified research design' },
      { label: 'Available format', value: product.variants.map((variant) => variant.format).join(', ') },
      { label: 'Catalog options', value: getDosage(product.variants) },
      { label: 'Access pathway', value: 'Screening and documentation request' },
      { label: 'Use classification', value: 'Research use only' },
    ],
    protocol: {
      title: `${product.name} research planning notes`,
      steps: [
        `Define the research question and relevant markers before evaluating ${product.name}.`,
        `Review available catalog formats, storage expectations, and documentation before study planning.`,
        `Use controlled research records to track preparation, lot information, observations, and disposal.`,
        `Consult qualified oversight for study design, handling, storage, and compliance requirements.`,
      ],
      notes:
        facts
          ? `${product.name} is commonly reviewed for ${facts.pathway}. This page intentionally avoids treatment, diagnostic, dosing, use-instruction, or outcome claims.`
          : `${product.name} is commonly studied for investigational interest where ${categoryCopy}. The page intentionally avoids treatment, diagnostic, use-instruction, or outcome claims.`,
    },
    reconstitution: {
      overview:
        'Reconstitution details can vary by format, lot documentation, study design, and institutional requirements. This section is educational and does not replace qualified laboratory oversight.',
      steps: [
        'Review the product-specific documentation and confirm the exact vial format before preparation.',
        'Use sterile research handling practices, appropriate diluent selection, and validated labeling procedures.',
        'Record lot details, preparation date, storage conditions, and disposal notes in the study record.',
        'Request Encore Bio Labs documentation when additional format or handling context is needed.',
      ],
    },
    disclaimer: globalResearchDisclaimer,
    faqs: [
      {
        question: `Is ${product.name} intended for human or animal consumption?`,
        answer: `No. ${globalResearchDisclaimer}`,
      },
      {
        question: `What type of research is ${product.name} commonly reviewed for?`,
        answer:
          facts
            ? `${product.name} is commonly reviewed for ${facts.pathway}. Researchers may also review ${facts.markers}.`
            : `${product.name} is reviewed for investigational interest in ${product.category.toLowerCase()} contexts, where researchers may evaluate pathway-level questions and documentation requirements.`,
      },
      ...(facts?.faqs ?? []),
      ...getEncoreCompleteKitFaqItems({
        productName: product.name,
        bacWaterAmount: bacWaterAmountBySlug[product.slug],
      }),
      // Delivery/logistics FAQs are specific to the standard catalog template and are
      // intentionally excluded from Retatrutide, which keeps its own dedicated page.
      ...(product.slug !== 'retatrutide'
        ? [
            {
              question: 'Is local delivery available?',
              answer: 'Local delivery eligibility and timing are confirmed during order review.',
            },
            {
              question: 'Do you ship nationwide?',
              answer: 'Available destinations and shipping methods are confirmed during order review.',
            },
            {
              question: 'Can you ship to Mexico?',
              answer: 'International destination eligibility and shipping cost are confirmed during order review.',
            },
          ]
        : []),
      {
        question: 'Can Encore Bio Labs provide documentation?',
        answer: brandText.documentationPromise,
      },
      {
        question: `What storage context applies to ${product.name}?`,
        answer:
          'Storage expectations can vary by format, lot, and documentation. Review product-specific records and use qualified laboratory handling procedures.',
      },
      {
        question: 'Does this page provide use instructions?',
        answer:
          'No. Encore Bio Labs does not provide dosing guidance, treatment instructions, preparation protocols, or individual-specific recommendations on product pages.',
      },
      {
        question: 'How are variants organized?',
        answer:
          'Variants live inside one product object so researchers can review available catalog options without duplicate product cards.',
      },
      {
        question: 'Are the statistics guaranteed outcomes?',
        answer:
          'No. Statistics are illustrative research-planning summaries, internal catalog signals, or study-specific context. They are not guaranteed biological, clinical, or individual outcomes.',
      },
      {
        question: 'Is this a consumer health product?',
        answer: brandText.complianceDisclaimer,
      },
      {
        question: 'What information should be reviewed before inquiry?',
        answer:
          'Researchers should review product identity, format, intended research question, storage context, handling requirements, and documentation needs.',
      },
      {
        question: 'How does shipping work?',
        answer:
          'Shipping and handling details are provided through the approved inquiry process and may depend on product format, destination, and packaging requirements.',
      },
      {
        question: 'Who should evaluate research suitability?',
        answer:
          'Qualified professional or institutional oversight should evaluate study design, compliance requirements, handling, and records before use.',
      },
    ],
    relatedProducts: [],
    bacWaterAmount: bacWaterAmountBySlug[product.slug],
  }
}

const catalogProducts: CatalogProduct[] = [
  {
    slug: 'retatrutide',
    name: 'Retatrutide',
    category: 'Metabolic & Weight Management',
    image: 'retatrutide.png',
    description:
      'A research catalog entry organized for variant comparison, COA request routing, and documentation-first review.',
    featured: true,
    variants: [
      { label: '10 mg', format: 'Vial format', price: 99 },
      { label: '15 mg', format: 'Vial format', price: 124 },
      { label: '20 mg', format: 'Vial format', price: 149 },
      { label: '25 mg', format: 'Vial format', price: 174 },
      { label: '30 mg', format: 'Vial format', price: 199 },
    ],
  },
  {
    slug: 'tesamorelin',
    name: 'Tesamorelin',
    category: 'Metabolic & Weight Management',
    image: 'tesamorelin.png',
    description:
      'A metabolic research entry presented once with supporting documentation and format context.',
    featured: true,
    variants: [{ label: 'Catalog Format', format: 'Vial format', price: 229 }],
  },
  {
    slug: 'wolverine-stack',
    name: 'Wolverine Stack',
    category: 'Recovery & Regeneration',
    image: 'bpc-157-tb-500.png',
    description:
      'A recovery and repair research entry prepared for complete kit organization and record review.',
    featured: true,
    variants: [{ label: 'Catalog Format', format: 'Research kit format', price: 139 }],
  },
  {
    slug: 'bpc-157',
    name: 'BPC-157',
    category: 'Recovery & Regeneration',
    image: 'bpc-157-tb-500.png',
    description:
      'A recovery research entry organized for documentation review, study planning, and compliant inquiry routing.',
    featured: true,
    variants: [{ label: 'Catalog Format', format: 'Vial format', price: 119 }],
  },
  {
    slug: 'tb-500',
    name: 'TB-500',
    category: 'Recovery & Regeneration',
    image: 'bpc-157-tb-500.png',
    description:
      'A regenerative peptide research entry structured for format clarity and documentation-led review.',
    featured: true,
    variants: [{ label: 'Catalog Format', format: 'Vial format', price: 129 }],
  },
  {
    slug: 'klow',
    name: 'KLOW',
    category: 'Recovery & Regeneration',
    image: 'nad-plus.png',
    description:
      'A research supplies entry for catalog planning, kit context, and documentation-led follow-up.',
    featured: true,
    variants: [{ label: 'Catalog Format', format: 'Supply format', price: 89 }],
  },
  {
    slug: 'igf1-lr3',
    name: 'IGF-1 LR3',
    category: 'Cognitive & Performance',
    image: 'igf1-lr3.png',
    description:
      'A performance research entry structured for concise review, format clarity, and record requests.',
    featured: true,
    variants: [{ label: 'Catalog Format', format: 'Vial format', price: 149 }],
  },
  {
    slug: 'cjc1295-ipamorelin',
    name: 'CJC-1295 + Ipamorelin',
    category: 'Metabolic & Weight Management',
    image: 'cjc1295-ipamorelin.png',
    description:
      'A combination research entry presented once, with variants grouped for cleaner catalog comparison.',
    featured: true,
    variants: [
      { label: 'Core Format', format: 'Vial format', price: 179 },
      { label: 'Expanded Format', format: 'Vial format', price: 299 },
    ],
  },
  {
    slug: 'mots-c',
    name: 'MOTS-C',
    category: 'Metabolic & Weight Management',
    image: 'mots-c.png',
    description:
      'A mitochondrial peptide research entry structured for metabolic signaling review, cellular energy context, and documentation requests.',
    featured: true,
    variants: [{ label: 'Catalog Format', format: 'Vial format', price: 149 }],
  },
  {
    slug: 'aod-9604',
    name: 'AOD-9604',
    category: 'Metabolic & Weight Management',
    image: 'aod-9604.png',
    description:
      'A GH-fragment research entry structured for metabolic signaling review, body-composition research context, and documentation requests.',
    featured: true,
    variants: [{ label: 'Catalog Format', format: 'Vial format', price: 0 }],
  },
  {
    slug: 'nad-plus',
    name: 'NAD+',
    category: 'Longevity & Cellular Health',
    image: 'nad-plus.png',
    description:
      'A longevity research entry built for premium presentation, complete kit context, and documentation review.',
    featured: true,
    variants: [
      { label: 'Core Format', format: 'Vial format', price: 129 },
      { label: 'Expanded Format', format: 'Vial format', price: 219 },
    ],
  },
  {
    slug: 'glutathione',
    name: 'Glutathione',
    category: 'Longevity & Cellular Health',
    image: 'glutathione.png',
    description:
      'A research catalog entry with variant visibility and room for supporting documentation requests.',
    featured: true,
    variants: [
      { label: 'Core Format', format: 'Vial format', price: 89 },
      { label: 'Expanded Format', format: 'Vial format', price: 149 },
    ],
  },
  {
    slug: 'ghk-cu',
    name: 'GHK-Cu',
    category: 'Recovery & Regeneration',
    image: 'ghk-cu.png',
    description:
      'An aesthetic research entry with available options kept together for easier catalog review.',
    featured: true,
    variants: [{ label: 'Catalog Format', format: 'Vial format', price: 149 }],
  },
  {
    slug: 'ahk-cu',
    name: 'AHK-Cu',
    category: 'Recovery & Regeneration',
    image: 'ahk-cu.png',
    description:
      'An aesthetic research entry structured for clean display, kit review, and premium positioning.',
    featured: true,
    variants: [{ label: 'Catalog Format', format: 'Vial format', price: 149 }],
  },
  {
    slug: 'epithalon',
    name: 'Epithalon',
    category: 'Longevity & Cellular Health',
    image: 'epithalon.png',
    description:
      'A longevity research entry prepared for premium education, filtering, and record requests.',
    featured: true,
    variants: [{ label: 'Catalog Format', format: 'Vial format', price: 139 }],
  },
  {
    slug: 'cerebrolysin',
    name: 'Cerebrolysin',
    category: 'Cognitive & Performance',
    image: 'cerebrolysin.png',
    description:
      'A cognitive research entry prepared for premium presentation and documentation-led follow-up.',
    featured: true,
    variants: [{ label: 'Catalog Format', format: 'Ampoule format', price: 169 }],
  },
  {
    slug: 'ss31',
    name: 'SS-31',
    category: 'Longevity & Cellular Health',
    image: 'ss31.png',
    description:
      'A longevity research entry organized for program conversations and future record detail.',
    featured: true,
    variants: [{ label: 'Catalog Format', format: 'Vial format', price: 159 }],
  },
  {
    slug: 'dsip',
    name: 'DSIP',
    category: 'Hormone & Wellness',
    image: 'dsip.png',
    description:
      'A research entry designed for concise review and documentation-ready follow-up.',
    featured: true,
    variants: [{ label: 'Catalog Format', format: 'Vial format', price: 119 }],
  },
  {
    slug: 'kisspeptin',
    name: 'Kisspeptin',
    category: 'Hormone & Wellness',
    image: 'kisspeptin.png',
    description:
      'A sexual wellness research entry designed to keep product review concise, organized, and inquiry-ready.',
    featured: true,
    variants: [{ label: 'Catalog Format', format: 'Vial format', price: 129 }],
  },
  {
    slug: 'hcg',
    name: 'HCG',
    category: 'Hormone & Wellness',
    image: 'hcg.png',
    description:
      'A sexual wellness research entry structured for clear review, variant visibility, and documentation discussion.',
    featured: true,
    variants: [
      { label: 'Core Format', format: 'Vial format', price: 99 },
      { label: 'Expanded Format', format: 'Vial format', price: 169 },
    ],
  },
  {
    slug: 'hgh-191aa',
    name: 'HGH 191AA',
    category: 'Hormone & Wellness',
    image: 'somatropin.png',
    description:
      'A performance research entry organized for format review, availability discussion, and documentation routing.',
    featured: true,
    variants: [
      { label: 'Core Format', format: 'Vial format', price: 189 },
      { label: 'Expanded Format', format: 'Vial format', price: 429 },
    ],
  },
  {
    slug: 'thymosin-alpha-1',
    name: 'Thymosin Alpha-1',
    category: 'Longevity & Cellular Health',
    image: 'ss31.png',
    description:
      'A cellular health research entry organized for education-led review and responsible documentation requests.',
    featured: true,
    variants: [{ label: 'Catalog Format', format: 'Vial format', price: 149 }],
  },
  {
    slug: 'pt-141',
    name: 'PT-141',
    category: 'Hormone & Wellness',
    image: 'pt-141.png',
    description:
      'A sexual wellness research entry with available formats grouped for fast scanning and responsible catalog access.',
    featured: true,
    variants: [
      { label: 'Core Format', format: 'Vial format', price: 119 },
      { label: 'Expanded Format', format: 'Vial format', price: 199 },
    ],
  },
  {
    slug: 'semax',
    name: 'Semax',
    category: 'Cognitive & Performance',
    image: 'semax.png',
    description:
      'A cognitive research entry prepared for premium presentation and responsible documentation review.',
    featured: true,
    variants: [{ label: 'Catalog Format', format: 'Catalog format', price: 109 }],
  },
  {
    slug: 'selank',
    name: 'Selank',
    category: 'Cognitive & Performance',
    image: 'selank.png',
    description:
      'A cognitive research entry with product options grouped inside one clear, reusable card.',
    featured: true,
    variants: [{ label: 'Catalog Format', format: 'Catalog format', price: 109 }],
  },
]

const relatedProductsBySlug: Record<string, string[]> = {
  retatrutide: ['tesamorelin', 'cjc1295-ipamorelin', 'nad-plus'],
  tesamorelin: ['retatrutide', 'cjc1295-ipamorelin', 'hgh-191aa'],
  'hgh-191aa': ['cjc1295-ipamorelin', 'igf1-lr3', 'kisspeptin'],
  'cjc1295-ipamorelin': ['tesamorelin', 'hgh-191aa', 'igf1-lr3'],
  'mots-c': ['nad-plus', 'ss31', 'tesamorelin'],
  'aod-9604': ['retatrutide', 'tesamorelin', 'mots-c'],
  'igf1-lr3': ['hgh-191aa', 'cerebrolysin', 'cjc1295-ipamorelin'],
  'bpc-157': ['tb-500', 'wolverine-stack', 'ghk-cu'],
  'tb-500': ['bpc-157', 'wolverine-stack', 'ghk-cu'],
  'wolverine-stack': ['bpc-157', 'tb-500', 'ghk-cu'],
  klow: ['bpc-157', 'ghk-cu', 'glutathione'],
  'nad-plus': ['glutathione', 'ss31', 'epithalon'],
  glutathione: ['nad-plus', 'ss31', 'thymosin-alpha-1'],
  'ghk-cu': ['ahk-cu', 'bpc-157', 'wolverine-stack'],
  'ahk-cu': ['ghk-cu', 'bpc-157', 'tb-500'],
  epithalon: ['nad-plus', 'ss31', 'thymosin-alpha-1'],
  kisspeptin: ['hcg', 'hgh-191aa', 'dsip'],
  cerebrolysin: ['semax', 'selank', 'igf1-lr3'],
  ss31: ['nad-plus', 'glutathione', 'epithalon'],
  dsip: ['kisspeptin', 'hgh-191aa', 'selank'],
  'thymosin-alpha-1': ['glutathione', 'nad-plus', 'epithalon'],
}

const catalogMetadataBySlug: Record<string, ProductCatalogMetadata> = {
  retatrutide: { casNumber: '2381089-83-2', purityGrade: '>=98%', stockStatus: 'In Stock' },
  tesamorelin: { casNumber: '218949-48-5', purityGrade: 'Research Grade', stockStatus: 'Limited Stock' },
  'wolverine-stack': { casNumber: 'BPC-157 / TB-500', purityGrade: 'Research Grade', stockStatus: 'In Stock' },
  'bpc-157': { casNumber: '137525-51-0', purityGrade: '>=98%', stockStatus: 'In Stock' },
  'tb-500': { casNumber: '77591-33-4', purityGrade: '>=98%', stockStatus: 'Limited Stock' },
  klow: { casNumber: 'Kit-support entry', purityGrade: 'Analytical Grade', stockStatus: 'On Request' },
  'igf1-lr3': { casNumber: '946870-92-4', purityGrade: 'Research Grade', stockStatus: 'Limited Stock' },
  'cjc1295-ipamorelin': { casNumber: '863288-34-0 / 170851-70-4', purityGrade: '>=98%', stockStatus: 'In Stock' },
  'mots-c': { casNumber: '1627580-64-6', purityGrade: 'Research Grade', stockStatus: 'On Request' },
  'aod-9604': { casNumber: '221231-10-3', purityGrade: 'Research Grade', stockStatus: 'On Request' },
  'nad-plus': { casNumber: '53-84-9', purityGrade: 'Analytical Grade', stockStatus: 'In Stock' },
  glutathione: { casNumber: '70-18-8', purityGrade: 'Analytical Grade', stockStatus: 'In Stock' },
  'ghk-cu': { casNumber: '89030-95-5', purityGrade: '>=98%', stockStatus: 'In Stock' },
  'ahk-cu': { casNumber: '49557-75-7', purityGrade: '>=98%', stockStatus: 'Limited Stock' },
  epithalon: { casNumber: '307297-39-8', purityGrade: 'Research Grade', stockStatus: 'In Stock' },
  cerebrolysin: { casNumber: 'Peptide mixture', purityGrade: 'Analytical Grade', stockStatus: 'On Request' },
  ss31: { casNumber: '736992-21-5', purityGrade: 'Research Grade', stockStatus: 'Limited Stock' },
  dsip: { casNumber: '62568-57-4', purityGrade: 'Research Grade', stockStatus: 'In Stock' },
  kisspeptin: { casNumber: '374675-21-5', purityGrade: '>=98%', stockStatus: 'Limited Stock' },
  hcg: { casNumber: '9002-61-3', purityGrade: 'Analytical Grade', stockStatus: 'In Stock' },
  'hgh-191aa': { casNumber: '12629-01-5', purityGrade: 'Research Grade', stockStatus: 'On Request' },
  'thymosin-alpha-1': { casNumber: '62304-98-7', purityGrade: 'Research Grade', stockStatus: 'Limited Stock' },
  'pt-141': { casNumber: '189691-06-3', purityGrade: '>=98%', stockStatus: 'In Stock' },
  semax: { casNumber: '80714-61-0', purityGrade: 'Research Grade', stockStatus: 'In Stock' },
  selank: { casNumber: '129954-34-3', purityGrade: 'Research Grade', stockStatus: 'In Stock' },
}

export const products: Product[] = catalogProducts.map((product) => ({
  ...product,
  ...catalogMetadataBySlug[product.slug],
  purityGrade: 'Documentation by request',
  stockStatus: 'Availability by request',
  description: productFacts[product.slug]?.overview ?? product.description,
  ...createPageContent(product),
  relatedProducts:
    relatedProductsBySlug[product.slug] ??
    catalogProducts
      .filter((relatedProduct) => relatedProduct.category === product.category && relatedProduct.slug !== product.slug)
      .slice(0, 3)
      .map((relatedProduct) => relatedProduct.slug),
}))

function validateProductCatalog(entries: Product[]) {
  const slugs = new Set<string>()

  for (const product of entries) {
    if (!product.slug || slugs.has(product.slug)) throw new Error(`Invalid or duplicate product slug: ${product.slug || '(empty)'}`)
    slugs.add(product.slug)
    if (!categoryNames.includes(product.category)) throw new Error(`Invalid category for product: ${product.slug}`)
    if (!product.image || !product.casNumber || !product.purityGrade || !product.stockStatus) throw new Error(`Missing catalog metadata for product: ${product.slug}`)
    if (!product.variants.length) throw new Error(`Product has no variants: ${product.slug}`)
    for (const variant of product.variants) {
      if (!variant.label || !variant.format || !Number.isFinite(variant.price) || variant.price < 0) throw new Error(`Invalid variant for product: ${product.slug}`)
    }
  }

  for (const product of entries) {
    for (const relatedSlug of product.relatedProducts) {
      if (relatedSlug === product.slug || !slugs.has(relatedSlug)) throw new Error(`Invalid related product ${relatedSlug} for ${product.slug}`)
    }
  }
}

validateProductCatalog(products)

export const bestSellers = [
  { slug: 'retatrutide', featured: true },
  { slug: 'ghk-cu' },
  { slug: 'wolverine-stack' },
  { slug: 'nad-plus' },
]

export const productPageSlugs = products.map((product) => product.slug)

export const categories = categoryNames
