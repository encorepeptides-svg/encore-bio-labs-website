import type { navigation as navigationEn } from '../en/navigation'

export const navigation = {
  home: 'Inicio',
  catalog: 'Catálogo',
  about: 'Nosotros',
  faq: 'Preguntas frecuentes',
  contact: 'Contacto',
  howItWorks: 'Cómo funciona',
  startYourResearch: 'Inicia tu proceso',
  openMenu: 'Abrir menú',
  closeMenu: 'Cerrar menú',
  mainNavigation: 'Navegación principal',
  cartWithItems: 'Abrir carrito con {count} productos',
  homeAriaLabel: 'Ir al inicio de Encore Bio Labs',
  searchProducts: 'Buscar productos',
  closeSearch: 'Cerrar búsqueda de productos',
  clientLogin: 'Acceso de clientes',
} satisfies Record<keyof typeof navigationEn, string>
