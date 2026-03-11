import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import nl from './i18n/nl.json';
import en from './i18n/en.json';
import fr from './i18n/fr.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      nl: { translation: nl },
      en: { translation: en },
      fr: { translation: fr },
    },
    fallbackLng: 'nl',
    lng: 'nl',
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
    react: {
      useSuspense: false, // CRITICAL FIX!
    },
  });

export default i18n;
