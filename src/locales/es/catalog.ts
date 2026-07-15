import type { catalog as catalogEn } from '../en/catalog'

export const catalog = {
  // Compact image-led hero
  heroEyebrow: 'EL CATÁLOGO ENCORE',
  heroTitle: 'Elige tu compuesto.\nRecibe el kit completo.',
  heroSupporting: 'Explora nuestro catálogo por categoría, compara opciones y encuentra rápidamente el compuesto adecuado para tu investigación. Los productos elegibles incluyen suministros esenciales seleccionados para cada presentación.',
  heroPrimaryCta: 'Ver todos los productos',
  heroSecondaryCta: 'Comprar por categoría',
  heroReassurance: 'Envío nacional · Entrega local disponible · Kits completos en productos elegibles',
  heroVisualAlt: 'Kit completo Encore con vial de investigación y suministros esenciales',

  // Compact category selector
  selectorLabel: 'Compra por categoría de investigación',
  areaProductCountOne: '{count} compuesto',
  areaProductCountOther: '{count} compuestos',
  researchHighlightsLabel: 'Puntos clave de investigación',

  // KLOW signature feature
  klowEyebrow: 'Mezcla de investigación insignia',
  klowTitle: 'KLOW',
  klowTagline: 'Cuatro compuestos premium. Una mezcla regenerativa insignia.',
  klowCompositionLabel: 'Composición',
  klowCta: 'Ver KLOW',
  klowCompliance: 'Uso exclusivo para investigación. No destinado a uso humano ni veterinario.',
  klowVisualAlt: 'Mezcla de investigación insignia KLOW: vial de investigación del péptido de cobre (GHK-Cu)',

  // Retatrutide feature
  retaEyebrow: 'Compuesto metabólico destacado',
  retaTitle: 'Retatrutide',
  retaPullQuote: 'Una molécula. Tres vías receptoras. Una frontera decisiva en la investigación metabólica.',
  retaBody:
    'Retatrutide es un agonista triple en investigación que se estudia en la señalización de los receptores GIP, GLP-1 y glucagón. Su diseño multivía lo sitúa en la intersección de la señalización de nutrientes, el balance energético y la investigación de composición corporal.',
  retaReceptorsLabel: 'Vías de receptor estudiadas',
  retaReceptorGip: 'GIP',
  retaReceptorGlp1: 'GLP-1',
  retaReceptorGlucagon: 'Glucagón',
  retaStrengthsLabel: 'Concentraciones disponibles',
  retaPrimaryCta: 'Ver Retatrutide',
  retaSecondaryCta: 'Comparar concentraciones',
  retaCompliance: 'Compuesto en investigación. Uso exclusivo para investigación; no destinado a uso humano ni veterinario.',
  retaVisualAlt: 'Vial del compuesto de investigación en fase experimental Retatrutide',

  // Closing research-use notice
  closingTitle: 'Solo investigación de laboratorio',
  closingBody:
    'Encore Bio Labs suministra cada artículo del catálogo para investigación controlada de laboratorio. Estos materiales no se presentan para uso humano o veterinario ni para diagnóstico, tratamiento o administración.',

  // Legacy best-sellers keys (retained for the standalone bestsellers module)
  bestSellersEyebrow: 'Más vendidos',
  bestSellersTitle: 'Los compuestos que más ordenan los investigadores.',
  featuredBestseller: 'Más vendido destacado',
  viewOptions: 'Ver opciones',
  view: 'Ver',
  browseProducts: 'Ver productos',

  searchPlaceholder: 'Buscar productos...',
  searchAriaLabel: 'Buscar productos o categorías',
  jumpToCategory: 'Ir a una colección del catálogo',
  categoryAll: 'Todos',
  categoryWeightManagement: 'Investigación metabólica',
  categoryRecoveryRegeneration: 'Recuperación y regeneración',
  categoryCognitivePerformance: 'Investigación cognitiva',
  categoryCellularEnergyLongevity: 'Energía celular y longevidad',
  categoryHormoneWellness: 'Hormonas y bienestar',
  categoryEssentials: 'Esenciales',

  categoryDescWeightManagement:
    'Los compuestos detrás de la investigación metabólica y de composición corporal de hoy: señalización de receptores, respuesta a nutrientes y balance energético, todo en un solo lugar.',
  categoryDescRecoveryRegeneration:
    'Investigación de reparación tisular, migración celular y biología de la piel, además de mezclas de recuperación insignia para estudios serios.',
  categoryDescCellularEnergyLongevity:
    'La frontera de la energía celular y la longevidad: función mitocondrial, equilibrio redox y vías del envejecimiento saludable.',
  categoryDescCognitivePerformance:
    'Compuestos de investigación para concentración, cognición y neuroseñalización, organizados para que elijas rápido.',
  categoryDescHormoneWellness:
    'Compuestos de investigación endocrina, del eje reproductivo y de respuesta hormonal, listos para enviar.',
  categoryDescEssentials: 'Los suministros que todo flujo de investigación necesita: accesorios de manejo y preparación, presentados por separado.',

  onFileCoa: 'COA disponible',
  docsOnRequest: 'Documentación a solicitud',
  order: 'Ver producto',
  noResultsTitle: 'No encontramos productos que coincidan con tu búsqueda.',
  noResultsBody: 'Prueba otra forma de escribirlo, una categoría o un término de investigación, o borra los filtros para ver todo el catálogo.',
  clearSearch: 'Borrar búsqueda',
  clearFilters: 'Borrar todos los filtros',
  activeSearchSummary: 'Mostrando resultados para “{query}”',
  activeCategorySummary: 'Categoría: {category}',
  productCountOne: '{count} producto',
  productCountOther: '{count} productos',
  sortLabel: 'Ordenar productos',
  sortFeatured: 'Destacados',
  sortPriceLow: 'Precio: menor a mayor',
  sortPriceHigh: 'Precio: mayor a menor',
  sortName: 'Nombre: A–Z',
  trustThirdPartyTested: 'Documentación a solicitud',
  trustJanoshikCoas: 'Registros COA disponibles',
  trustShipsFromUsa: 'Envíos desde Estados Unidos',
  trustResearchUseOnly: 'Uso exclusivo para investigación',
  helpTitle: '¿No sabes qué kit ordenar?',
  helpBody: 'Cuéntanos las vías, formatos o documentación que necesita tu proyecto y nuestro equipo te indicará directamente los compuestos y kits correctos, sin hacer recomendaciones de tratamiento o uso.',
  startResearchIntake: 'Recibir mi recomendación',
  quote: 'Cotización',
  from: 'Desde',
  optionsCount: '{count} opciones',
  productVisualAlt: 'Empaque del compuesto de investigación {product}',
} satisfies Record<keyof typeof catalogEn, string>
