import type { categories as categoriesEn } from '../en/categories'

export const categories = {
  sectionTitle: 'Elige tu enfoque de investigación',
  featuredBadge: 'Área de investigación destacada',
  exploreCategory: 'Explorar categoría',
  productCountOne: '{count} producto',
  productCountOther: '{count} productos',
  metabolicWeightManagementTitle: 'Metabolismo y control de peso',
  metabolicWeightManagementDescription: 'Explora compuestos relacionados con la señalización metabólica, la regulación de energía y la investigación de composición corporal.',
  recoveryRegenerationTitle: 'Recuperación y regeneración',
  recoveryRegenerationDescription: 'Compuestos estudiados en reparación de tejidos, señalización del tejido conectivo e investigación de recuperación.',
  longevityCellularHealthTitle: 'Longevidad y salud celular',
  longevityCellularHealthDescription: 'Investigación centrada en la resiliencia celular, la función mitocondrial y las vías del envejecimiento saludable.',
  cognitivePerformanceTitle: 'Investigación cognitiva',
  cognitivePerformanceDescription: 'Explora compuestos relacionados con el enfoque, la cognición, la señalización neurológica y el rendimiento.',
  hormoneWellnessTitle: 'Hormonas y bienestar',
  hormoneWellnessDescription: 'Investigación sobre señalización endocrina, compuestos relacionados con hormonas y vías de bienestar.',
  metabolicWeightManagementImageAlt: 'Pareja caminando fuera de un centro de bienestar junto a un vial de Encore Bio Labs',
  recoveryRegenerationImageAlt: 'Pareja estirándose en un espacio de recuperación junto a un vial de Encore Bio Labs',
  longevityCellularHealthImageAlt: 'Pareja descansando al aire libre con un vial de Encore Bio Labs sobre la mesa',
  cognitivePerformanceImageAlt: 'Pareja revisando notas en una computadora con un vial de Encore Bio Labs sobre la mesa',
  hormoneWellnessImageAlt: 'Pareja en una cocina de bienestar con un vial de Encore Bio Labs en primer plano',
} satisfies Record<keyof typeof categoriesEn, string>
