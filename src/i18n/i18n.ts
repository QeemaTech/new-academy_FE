import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enTranslation from './locales/en.json';
import arTranslation from './locales/ar.json';

// Retrieve saved language from localStorage, or default to Arabic (since it's MENA EdTech)
const storedLang = localStorage.getItem('appLang') || 'ar';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enTranslation },
      ar: { translation: arTranslation },
    },
    lng: storedLang,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already safeguards from XSS
    },
  });

export default i18n;
