import type { search as searchEn } from '../en/search'

export const search = {
  searchProducts: 'Buscar productos',
  dialogTitle: 'Buscar en el catálogo',
  searchAction: 'Buscar',
  closeSearch: 'Cerrar búsqueda de productos',
  placeholder: 'Buscar productos o categorías',
  resultsLabel: 'Resultados de búsqueda de productos',
  initialPrompt: 'Busca en el catálogo por producto, categoría o área de investigación.',
  browseCatalog: 'Explorar todo el catálogo',
  viewAll: 'Ver todos los productos coincidentes',
  noResults: 'No encontramos productos con esa búsqueda. Intenta con el nombre del producto, una categoría o un área de investigación.',
  clearSearch: 'Borrar búsqueda',
  resultCountOne: '{count} producto coincidente',
  resultCountOther: '{count} productos coincidentes',
  categoryLabel: 'Categoría',
  startingPriceLabel: 'Precio inicial',
  keyboardHint: 'Usa las flechas para moverte, Enter para abrir y Escape para cerrar.',
  keyboardNavigate: 'moverse',
  keyboardOpen: 'abrir',
  keyboardClose: 'cerrar',
} satisfies Record<keyof typeof searchEn, string>
