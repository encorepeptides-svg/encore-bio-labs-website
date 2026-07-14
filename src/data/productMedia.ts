export type ProductImageRole = 'hero' | 'gallery' | 'thumbnail' | 'lifestyle'
export type ProductImageFit = 'contain' | 'cover'

export type ProductImage = {
  src: string
  alt: string
  role: ProductImageRole
  fit: ProductImageFit
  width: number
  height: number
  sourcePath: string
}

export type ProductMedia = {
  productId: string
  hero: ProductImage
  gallery: ProductImage[]
  fallback: ProductImage
}

const productImage = (
  productId: string,
  src: string,
  alt: string,
  sourcePath: string,
  fallbackSrc = 'category-recovery-regeneration.png',
): ProductMedia => ({
  productId,
  hero: { src, alt, role: 'hero', fit: 'contain', width: 1254, height: 1254, sourcePath },
  gallery: [],
  fallback: {
    src: fallbackSrc,
    alt: `${productId} research product placeholder`,
    role: 'thumbnail',
    fit: 'contain',
    width: 1254,
    height: 1254,
    sourcePath: 'src/assets/images/products/category-recovery-regeneration.png',
  },
})

/**
 * Canonical product media manifest. Product slugs are the stable identifiers;
 * image filenames are never inferred from array order or route conditionals.
 * Source paths document the imported Desktop/products file for auditability.
 */
export const productMediaBySlug: Record<string, ProductMedia> = {
  retatrutide: productImage('retatrutide', 'retatrutide.png', 'Retatrutide research compound packaging.', '~/Desktop/products/Retatrutide.png', 'category-metabolic-weight-management.png'),
  tesamorelin: productImage('tesamorelin', 'tesamorelin.png', 'Tesamorelin research compound packaging.', '~/Desktop/products/tesamorelin.png', 'category-metabolic-weight-management.png'),
  'wolverine-stack': productImage('wolverine-stack', 'bpc-157-tb-500.png', 'Wolverine Stack BPC-157 and TB-500 research packaging.', '~/Desktop/products/bpc 157 tb500.png'),
  // No dedicated KLOW artwork exists in the supplied source folder. The approved existing GHK-Cu vial is used as a documented signature fallback.
  klow: productImage('klow', 'ghk-cu.png', 'KLOW research blend visual using its GHK-Cu signature vial.', '~/Desktop/products/ghk-cu.png'),
  'igf1-lr3': productImage('igf1-lr3', 'igf1-lr3.png', 'IGF1-LR3 research compound packaging.', '~/Desktop/products/igf1-lr3.png', 'category-hormone-wellness.png'),
  'cjc1295-ipamorelin': productImage('cjc1295-ipamorelin', 'cjc1295-ipamorelin.png', 'CJC-1295 and Ipamorelin research compound packaging.', '~/Desktop/products/cjc1295-ipamorelin.png', 'category-metabolic-weight-management.png'),
  'mots-c': productImage('mots-c', 'mots-c.png', 'MOTS-C research compound packaging.', '~/Desktop/products/motsc.png', 'category-metabolic-weight-management.png'),
  'aod-9604': productImage('aod-9604', 'aod-9604.png', 'AOD-9604 research compound packaging.', '~/Desktop/products/aod.png', 'category-metabolic-weight-management.png'),
  'nad-plus': productImage('nad-plus', 'nad-plus.png', 'NAD+ research product packaging.', '~/Desktop/products/nad+.png', 'category-longevity-cellular-health.png'),
  glutathione: productImage('glutathione', 'glutathione.png', 'Glutathione research compound packaging.', '~/Desktop/products/glutathione.png', 'category-longevity-cellular-health.png'),
  'ghk-cu': productImage('ghk-cu', 'ghk-cu.png', 'GHK-Cu copper-peptide research packaging.', '~/Desktop/products/ghk-cu.png'),
  'ahk-cu': productImage('ahk-cu', 'ahk-cu.png', 'AHK-Cu copper-peptide research packaging.', '~/Desktop/products/ahk-cu.png'),
  epithalon: productImage('epithalon', 'epithalon.png', 'Epithalon research compound packaging.', '~/Desktop/products/epithalon.png', 'category-longevity-cellular-health.png'),
  cerebrolysin: productImage('cerebrolysin', 'cerebrolysin.png', 'Cerebrolysin research ampoule packaging.', '~/Desktop/products/cerebrolysin.png', 'category-cognitive-performance.png'),
  ss31: productImage('ss31', 'ss31.png', 'SS-31 research compound packaging.', '~/Desktop/products/ss-31.png', 'category-longevity-cellular-health.png'),
  dsip: productImage('dsip', 'dsip.png', 'DSIP research compound packaging.', '~/Desktop/products/dsip.png', 'category-hormone-wellness.png'),
  kisspeptin: productImage('kisspeptin', 'kisspeptin.png', 'Kisspeptin research compound packaging.', '~/Desktop/products/kisspeptin.png', 'category-hormone-wellness.png'),
  hcg: productImage('hcg', 'hcg.png', 'HCG research compound packaging.', '~/Desktop/products/HCG.png', 'category-hormone-wellness.png'),
  'hgh-191aa': productImage('hgh-191aa', 'somatropin.png', 'HGH 191AA research compound packaging.', '~/Desktop/products/somatropin.png', 'category-hormone-wellness.png'),
  'thymosin-alpha-1': productImage('thymosin-alpha-1', 'thymosin-alpha-1.png', 'Thymosin Alpha-1 research compound packaging.', '~/Desktop/products/thymosin alpha-1.png', 'category-longevity-cellular-health.png'),
  'pt-141': productImage('pt-141', 'pt-141.png', 'PT-141 research compound packaging.', '~/Desktop/products/pt-141.png', 'category-hormone-wellness.png'),
  semax: productImage('semax', 'semax.png', 'Semax research compound packaging.', '~/Desktop/products/semax.png', 'category-cognitive-performance.png'),
  selank: productImage('selank', 'selank.png', 'Selank research compound packaging.', '~/Desktop/products/selank.png', 'category-cognitive-performance.png'),
  'bac-water': productImage('bac-water', 'bac-water.png', 'BAC Water 10 mL research accessory bottle.', '~/Desktop/products/bac 10ml.png', 'category-longevity-cellular-health.png'),
}

export function getProductMedia(productId: string) {
  return productMediaBySlug[productId]
}

export function getProductHeroImage(productId: string, fallback?: string) {
  return productMediaBySlug[productId]?.hero.src ?? fallback ?? productMediaBySlug[productId]?.fallback.src
}
