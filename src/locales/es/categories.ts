import type { categories as categoriesEn } from '../en/categories'

export const categories = {
  sectionEyebrow: 'Explora por área de investigación',
  sectionTitle: 'Encuentra la categoría de investigación que se ajusta a lo que buscas.',
  sectionSubtitle: 'Explora Encore Bio Labs en áreas de investigación metabólica, de recuperación, longevidad, cognición y hormonas.',
  viewFullCatalog: 'Ver catálogo completo',
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
  cognitivePerformanceTitle: 'Rendimiento cognitivo',
  cognitivePerformanceDescription: 'Explora compuestos relacionados con el enfoque, la cognición, la señalización neurológica y el rendimiento.',
  hormoneWellnessTitle: 'Hormonas y bienestar',
  hormoneWellnessDescription: 'Investigación sobre señalización endocrina, compuestos relacionados con hormonas y vías de bienestar.',
} satisfies Record<keyof typeof categoriesEn, string>
