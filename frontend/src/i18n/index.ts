import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

// Import language resources
import enCommon from '../locales/en/common.json'
import thCommon from '../locales/th/common.json'

const resources = {
  en: {
    common: enCommon,
  },
  th: {
    common: thCommon,
  },
}

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'th', // Default to Thai
    fallbackLng: 'th',
    defaultNS: 'common',

    interpolation: {
      escapeValue: false,
    },
  })

export default i18n