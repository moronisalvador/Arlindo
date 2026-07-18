import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { common } from './locales/pt-BR/common'

export const LOCALE = 'pt-BR'
export const defaultNS = 'common'

void i18n.use(initReactI18next).init({
  lng: LOCALE,
  fallbackLng: LOCALE,
  ns: ['common'],
  defaultNS,
  resources: { [LOCALE]: { common } },
  interpolation: { escapeValue: false },
  returnNull: false,
})

/**
 * Each wave feature registers its OWN pt-BR namespace via this helper (no shared
 * dictionary the features fight over). Call once at the feature module's load,
 * then `useTranslation('<ns>')` inside the feature.
 */
export function registerNamespace(ns: string, resources: Record<string, unknown>): void {
  i18n.addResourceBundle(LOCALE, ns, resources, true, true)
}

export default i18n
