import { additionalProductResearchContent } from './productResearchContentAdditional'

export type EvidenceLevel = 'human-clinical' | 'human-observational' | 'animal' | 'in-vitro' | 'mechanistic' | 'limited'

export type ProductStudy = {
  title: string
  authors?: string
  journal: string
  year: number
  studyType: EvidenceLevel
  summary: string
  keyFinding: string
  limitation: string
  url: string
  doi?: string
  pubmedId?: string
}

export type ResearchArea = {
  title: string
  summary: string
  evidenceLevel: EvidenceLevel
}

export type MechanismStep = {
  label: string
  description: string
}

export type ProductResearchContent = {
  compoundClass: string
  primaryFocus: string
  biologicalPathway: string
  evidenceProfile: string
  overview: string
  scientificIdentity: string
  howStudied: string
  mechanismSummary: string
  mechanismSteps: MechanismStep[]
  researchAreas: ResearchArea[]
  studies: ProductStudy[]
  limitations: string[]
  faq: Array<{ question: string; answer: string }>
}

export const productResearchContent: Record<string, ProductResearchContent> = {
  tesamorelin: {
    compoundClass: 'Synthetic GHRH analog',
    primaryFocus: 'GH-axis and visceral-adiposity research',
    biologicalPathway: 'GHRH receptor → GH → IGF-1',
    evidenceProfile: 'Randomized human clinical studies',
    overview: 'Tesamorelin is a synthetic analog of growth-hormone-releasing hormone. It has been examined in controlled human studies as a way to stimulate endogenous pituitary growth-hormone signaling and measure downstream changes in IGF-1, visceral adipose tissue, liver fat, lipids, and glucose-related markers.',
    scientificIdentity: 'A stabilized peptide analog based on the 44-amino-acid human GHRH sequence. Unlike exogenous growth hormone, tesamorelin is studied upstream at the GHRH receptor, where signaling depends on an intact pituitary GH axis.',
    howStudied: 'The strongest evidence comes from randomized, placebo-controlled studies in narrowly defined populations, especially adults living with HIV and excess abdominal fat. Researchers used CT or MRI-based body-composition measures, magnetic-resonance spectroscopy, IGF-1, lipid panels, and glucose markers. Those populations and endpoints limit generalization to other settings.',
    mechanismSummary: 'Tesamorelin is investigated as a GHRH-receptor agonist that increases pulsatile pituitary GH release and downstream IGF-1 signaling. Measured metabolic outcomes remain population- and study-specific.',
    mechanismSteps: [
      { label: 'Tesamorelin', description: 'Synthetic GHRH analog introduced into a controlled research model.' },
      { label: 'GHRH receptor', description: 'Engages receptors on pituitary somatotroph cells.' },
      { label: 'Pulsatile GH signaling', description: 'Investigated for changes in endogenous growth-hormone release.' },
      { label: 'IGF-1 axis', description: 'IGF-1 is measured as a downstream endocrine marker.' },
      { label: 'Research endpoints', description: 'Imaging and laboratory markers assess tissue distribution and metabolic response.' },
    ],
    researchAreas: [
      { title: 'Visceral adipose tissue', summary: 'CT-based VAT was a primary endpoint in multiple randomized studies involving people with HIV-associated abdominal fat accumulation.', evidenceLevel: 'human-clinical' },
      { title: 'Liver-fat imaging', summary: 'Smaller randomized studies used spectroscopy to examine hepatic-fat changes in specific HIV study populations.', evidenceLevel: 'human-clinical' },
      { title: 'GH and IGF-1 signaling', summary: 'Endocrine-response studies track IGF-1 as a downstream marker of GHRH-axis activity.', evidenceLevel: 'human-clinical' },
      { title: 'Lipid and glucose markers', summary: 'Trials monitored triglycerides and glucose-related markers, with findings dependent on population and study duration.', evidenceLevel: 'human-clinical' },
    ],
    studies: [
      { title: 'Effects of tesamorelin in HIV-infected patients with abdominal fat accumulation', authors: 'Falutz et al.', journal: 'Journal of Acquired Immune Deficiency Syndromes', year: 2010, studyType: 'human-clinical', summary: 'A 12-month randomized, placebo-controlled study enrolled 404 adults with HIV-associated abdominal fat accumulation and used visceral adipose tissue as the primary endpoint.', keyFinding: 'The trial reported a between-group reduction in visceral adipose tissue during the initial randomized period, with IGF-1 and other body-composition measures tracked concurrently.', limitation: 'The population had HIV-associated abdominal adiposity during antiretroviral therapy; the findings do not establish outcomes in other populations or for research materials sold by Encore.', url: 'https://pubmed.ncbi.nlm.nih.gov/20101189/', doi: '10.1097/QAI.0b013e3181cbdaff', pubmedId: '20101189' },
      { title: 'Effect of tesamorelin on visceral fat and liver fat', authors: 'Stanley et al.', journal: 'JAMA', year: 2014, studyType: 'human-clinical', summary: 'A double-blind randomized trial of 50 antiretroviral-treated adults examined visceral and liver fat using imaging over six months.', keyFinding: 'The study reported reductions in visceral and liver-fat measures relative to placebo and monitored short- and longer-term glucose endpoints.', limitation: 'This was a small preliminary trial in a specific HIV population; clinical importance and long-term consequences were not established.', url: 'https://pubmed.ncbi.nlm.nih.gov/25038357/', doi: '10.1001/jama.2014.8334', pubmedId: '25038357' },
      { title: 'Pooled analysis of two multicenter Phase 3 tesamorelin trials', authors: 'Falutz et al.', journal: 'Journal of Clinical Endocrinology & Metabolism', year: 2010, studyType: 'human-clinical', summary: 'A pooled analysis evaluated 806 antiretroviral-treated adults randomized in two placebo-controlled Phase 3 studies with safety extensions.', keyFinding: 'Visceral adipose tissue, lipid markers, IGF-1, and glucose parameters were evaluated across 26- and 52-week periods.', limitation: 'Pooled analyses inherit the eligibility criteria and treatment context of the original HIV-associated lipodystrophy trials.', url: 'https://pubmed.ncbi.nlm.nih.gov/20554713/', doi: '10.1210/jc.2009-2701', pubmedId: '20554713' },
    ],
    limitations: ['Human evidence is concentrated in specific HIV-associated abdominal-adiposity populations.', 'Imaging and laboratory endpoints do not establish broadly generalizable outcomes.', 'IGF-1 and glucose-related findings require careful interpretation within each study design.', 'Published pharmaceutical trials do not verify the identity, purity, or performance of third-party research materials.'],
    faq: [
      { question: 'What type of compound is Tesamorelin?', answer: 'Tesamorelin is a synthetic peptide analog of growth-hormone-releasing hormone studied at the GHRH receptor and downstream GH/IGF-1 axis.' },
      { question: 'What is the strongest evidence category?', answer: 'The strongest published evidence is randomized human clinical research in narrowly defined populations, particularly adults with HIV-associated abdominal fat accumulation.' },
      { question: 'Does this page establish outcomes for other populations?', answer: 'No. Results from specific clinical populations and pharmaceutical study materials cannot be generalized to other settings or to Encore research materials.' },
      { question: 'Is this page providing treatment or administration guidance?', answer: 'No. Encore presents Tesamorelin strictly as a Research Use Only catalog material and provides no dosing, administration, or treatment guidance.' },
    ],
  },
  'mots-c': {
    compoundClass: 'Mitochondria-derived peptide',
    primaryFocus: 'Cellular energy and metabolic-stress signaling',
    biologicalPathway: 'Purine metabolism → AMPK-associated signaling',
    evidenceProfile: 'Mechanistic, cell, and animal research',
    overview: 'MOTS-C is a 16-amino-acid peptide encoded within the mitochondrial 12S rRNA region. Researchers study it as a mitochondria-to-nucleus signaling molecule connected to cellular energy sensing, metabolic stress, skeletal-muscle biology, and AMPK-associated pathways.',
    scientificIdentity: 'A mitochondrial-derived peptide rather than a conventional nuclear-encoded signaling peptide. Its discovery expanded the study of mitochondrial DNA from energy-production genetics into peptide-mediated cellular communication.',
    howStudied: 'Evidence includes cultured-cell metabolomics, diet-induced and age-related mouse models, small observational or acute-exercise experiments in humans, and mechanistic pathway work. Human experiments have mainly measured endogenous circulating or muscle MOTS-C—not clinical outcomes from administered MOTS-C.',
    mechanismSummary: 'A proposed model links MOTS-C to folate and purine metabolism, AICAR accumulation, and AMPK-associated energy signaling. The relative importance of these pathways in humans remains under investigation.',
    mechanismSteps: [
      { label: 'Mitochondrial encoding', description: 'A short open reading frame within mitochondrial 12S rRNA encodes MOTS-C.' },
      { label: 'Metabolic stress response', description: 'Cell and animal models examine changes during nutrient or energetic stress.' },
      { label: 'Purine-pathway interaction', description: 'Mechanistic work proposes inhibition of de novo purine biosynthesis.' },
      { label: 'AMPK-associated signaling', description: 'AICAR accumulation is proposed to connect the peptide to cellular energy sensing.' },
      { label: 'Measured outcomes', description: 'Studies examine metabolites, insulin sensitivity, muscle homeostasis, and exercise response.' },
    ],
    researchAreas: [
      { title: 'Metabolic homeostasis', summary: 'Discovery research examined glucose, fatty-acid metabolism, and insulin sensitivity in cells and mouse models.', evidenceLevel: 'animal' },
      { title: 'AMPK-associated signaling', summary: 'Cellular metabolomics and pathway experiments support a proposed relationship with energy sensing.', evidenceLevel: 'mechanistic' },
      { title: 'Muscle homeostasis', summary: 'Mouse and cell experiments examined age-related physical decline and skeletal-muscle stress responses.', evidenceLevel: 'animal' },
      { title: 'Exercise-associated biology', summary: 'Small human experiments measured endogenous MOTS-C after acute exercise but did not test administered peptide outcomes.', evidenceLevel: 'human-observational' },
    ],
    studies: [
      { title: 'The mitochondrial-derived peptide MOTS-c promotes metabolic homeostasis and reduces obesity and insulin resistance', authors: 'Lee et al.', journal: 'Cell Metabolism', year: 2015, studyType: 'animal', summary: 'Discovery experiments combined cultured-cell metabolomics with high-fat-diet and age-related mouse models to characterize a mitochondrial-encoded peptide.', keyFinding: 'The work linked MOTS-C to purine metabolism, AMPK activation, skeletal muscle, and metabolic-homeostasis measures in experimental models.', limitation: 'The reported intervention findings were primarily cellular and murine and do not establish human clinical effects.', url: 'https://pubmed.ncbi.nlm.nih.gov/25738459/', doi: '10.1016/j.cmet.2015.02.009', pubmedId: '25738459' },
      { title: 'MOTS-c is an exercise-induced mitochondrial-encoded regulator of age-dependent physical decline and muscle homeostasis', authors: 'Reynolds et al.', journal: 'Nature Communications', year: 2021, studyType: 'animal', summary: 'The study combined aged-mouse intervention experiments, cultured muscle-cell work, and measurements from a small acute-exercise cohort of young men.', keyFinding: 'Experimental findings connected MOTS-C with muscle stress adaptation and age-related physical-performance measures in mice; endogenous levels also changed with exercise in the small human sample.', limitation: 'The intervention evidence was not a human clinical trial, and the human component measured endogenous peptide responses in ten participants.', url: 'https://pubmed.ncbi.nlm.nih.gov/33473109/', doi: '10.1038/s41467-020-20790-0', pubmedId: '33473109' },
      { title: 'Acute endurance exercise stimulates circulating levels of mitochondrial-derived peptides in humans', authors: 'Woodhead et al.', journal: 'Journal of Applied Physiology', year: 2021, studyType: 'human-observational', summary: 'Thirty participants were randomized to endurance exercise, resistance exercise, or control conditions while researchers measured endogenous mitochondrial-derived peptides and muscle gene expression.', keyFinding: 'The study assessed whether acute exercise modulates circulating humanin and MOTS-C in humans.', limitation: 'This was an acute physiology study of endogenous peptide levels, not a trial of administered MOTS-C or long-term outcomes.', url: 'https://pubmed.ncbi.nlm.nih.gov/34351816/', doi: '10.1152/japplphysiol.00300.2021', pubmedId: '34351816' },
    ],
    limitations: ['Most intervention evidence comes from cells or animal models.', 'Small human studies measure endogenous MOTS-C and do not establish effects of administered peptide.', 'Proposed pathways may vary by tissue, metabolic state, and experimental conditions.', 'Long-term controlled human outcome evidence is not established.'],
    faq: [
      { question: 'What makes MOTS-C scientifically distinct?', answer: 'MOTS-C is encoded within mitochondrial DNA and is studied as a mitochondria-derived signaling peptide.' },
      { question: 'Is the evidence primarily human or preclinical?', answer: 'The intervention evidence is primarily cellular and animal. Human studies are small and have largely measured endogenous MOTS-C during physiological challenges such as exercise.' },
      { question: 'What pathway is most often proposed?', answer: 'Mechanistic studies commonly discuss purine metabolism, AICAR accumulation, and AMPK-associated cellular energy signaling.' },
      { question: 'Is MOTS-C FDA-approved for therapeutic use?', answer: 'No therapeutic approval is represented here. Encore supplies the catalog material strictly for research use.' },
    ],
  },
  'wolverine-stack': {
    compoundClass: 'Combination research product',
    primaryFocus: 'BPC-157 and thymosin beta-4 pathway research',
    biologicalPathway: 'Repair signaling + actin/cell-migration biology',
    evidenceProfile: 'Separate preclinical evidence streams',
    overview: 'Wolverine Stack is Encore’s combination catalog entry for BPC-157 and TB-500 research themes. The two components have distinct preclinical literatures: BPC-157 has been examined in animal injury models, while thymosin beta-4 research includes actin binding, endothelial-cell migration, angiogenesis, and tissue-response models.',
    scientificIdentity: 'A combination product rather than a single molecular entity. TB-500 is discussed in relation to thymosin beta-4 research, while BPC-157 is a synthetic 15-amino-acid peptide investigated mainly in animal models.',
    howStudied: 'The evidence streams must be interpreted separately. BPC-157 studies cited here use rat tendon or ligament injury models. Thymosin beta-4 studies use cultured endothelial cells and other preclinical systems. These studies do not test the Encore combination product and do not establish human clinical outcomes.',
    mechanismSummary: 'The combination is organized around complementary research hypotheses, not a proven combined mechanism. BPC-157 work examines injury-response signaling; thymosin beta-4 work examines actin-associated cell migration and vascular-response pathways.',
    mechanismSteps: [
      { label: 'Separate components', description: 'BPC-157 and TB-500 retain distinct molecular identities and evidence records.' },
      { label: 'BPC-157 models', description: 'Animal studies examine tendon, ligament, vascular, and tissue-response endpoints.' },
      { label: 'Thymosin beta-4 context', description: 'Cell and animal work examines actin binding, migration, and angiogenesis.' },
      { label: 'Complementary hypotheses', description: 'The catalog groups related repair-research questions without claiming synergy.' },
      { label: 'Independent measurement', description: 'Each component and outcome requires separate controls and interpretation.' },
    ],
    researchAreas: [
      { title: 'Tendon and ligament models', summary: 'BPC-157 has been examined in transection and injury models in rats.', evidenceLevel: 'animal' },
      { title: 'Endothelial-cell migration', summary: 'Thymosin beta-4 studies report actin-associated migration responses in cultured endothelial cells.', evidenceLevel: 'in-vitro' },
      { title: 'Angiogenesis-related assays', summary: 'Preclinical thymosin beta-4 work includes tube formation, vessel sprouting, and matrix experiments.', evidenceLevel: 'in-vitro' },
      { title: 'Combination evidence', summary: 'Direct peer-reviewed evidence for the marketed BPC-157/TB-500 combination is not established.', evidenceLevel: 'limited' },
    ],
    studies: [
      { title: 'Gastric pentadecapeptide BPC 157 accelerates healing of transected rat Achilles tendon and in vitro stimulates tendocytes growth', authors: 'Staresinic et al.', journal: 'Journal of Orthopaedic Research', year: 2003, studyType: 'animal', summary: 'Researchers evaluated BPC-157 in a rat Achilles-tendon transection model and included biomechanical, functional, histological, and cultured-tendocyte assessments.', keyFinding: 'The study reported differences in tendon-healing measures in treated rats and tendocyte-growth observations in vitro.', limitation: 'This was a rat injury model with an in-vitro component; it does not establish efficacy or safety in humans.', url: 'https://pubmed.ncbi.nlm.nih.gov/14554208/', doi: '10.1016/S0736-0266(03)00110-4', pubmedId: '14554208' },
      { title: 'BPC 157 improves ligament healing in the rat', authors: 'Cerovecki et al.', journal: 'Journal of Physiology and Pharmacology', year: 2010, studyType: 'animal', summary: 'This preclinical study examined BPC-157 in a surgically injured rat ligament model using functional, biomechanical, and histological measures.', keyFinding: 'The investigators reported improved healing-related measures in the treated animal groups.', limitation: 'Animal injury-model findings cannot be assumed to translate to human outcomes or to a combination product.', url: 'https://pubmed.ncbi.nlm.nih.gov/20225319/', pubmedId: '20225319' },
      { title: 'Thymosin beta 4 stimulates directional migration of human umbilical vein endothelial cells', authors: 'Malinda et al.', journal: 'FASEB Journal', year: 1997, studyType: 'in-vitro', summary: 'The study used endothelial-cell migration assays, scratch-wound experiments, and a Matrigel model to investigate thymosin beta-4.', keyFinding: 'Thymosin beta-4 was associated with directional endothelial-cell migration and angiogenesis-related experimental signals.', limitation: 'These cell and matrix assays do not demonstrate clinical tissue repair, and they did not evaluate BPC-157 or the marketed combination.', url: 'https://pubmed.ncbi.nlm.nih.gov/9194528/', doi: '10.1096/fasebj.11.6.9194528', pubmedId: '9194528' },
    ],
    limitations: ['No cited study evaluates the Encore combination product as a combined intervention.', 'BPC-157 evidence shown is animal-model evidence, not controlled human evidence.', 'Thymosin beta-4 findings shown include in-vitro and other preclinical models.', 'Component findings cannot establish synergy, clinical benefit, safety, or expected individual outcomes.'],
    faq: [
      { question: 'Is Wolverine Stack one molecular compound?', answer: 'No. It is a combination catalog entry organized around BPC-157 and TB-500 research themes.' },
      { question: 'Has the combination been established in human clinical trials?', answer: 'No direct human clinical evidence for the marketed combination is represented here. The cited component evidence is preclinical.' },
      { question: 'Why are the evidence streams separated?', answer: 'The two components have different mechanisms, study models, and evidence limitations. Combining their claims would overstate the literature.' },
      { question: 'Does this page provide a recovery protocol?', answer: 'No. It provides research context only and contains no dosing, administration, treatment, or personalized-use guidance.' },
    ],
  },
  ...additionalProductResearchContent,
}

export function getProductResearchContent(slug: string) {
  return productResearchContent[slug]
}
