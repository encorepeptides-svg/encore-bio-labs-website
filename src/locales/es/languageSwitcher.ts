import type { languageSwitcher as languageSwitcherEn } from '../en/languageSwitcher'

export const languageSwitcher = {
  english: 'English',
  spanish: 'Español',
  switchToEnglish: 'Cambiar a inglés',
  switchToSpanish: 'Cambiar a español',
  currentLanguage: 'Idioma actual: español',
  latamQuestion: 'Parece que nos visitas desde Latinoamérica. ¿Prefieres ver el sitio en español?',
  latamSwitchButton: 'Sí, cambiar a español',
  latamContinueButton: 'Continuar en English',
  latamDismiss: 'Cerrar sugerencia de idioma',
} satisfies Record<keyof typeof languageSwitcherEn, string>
