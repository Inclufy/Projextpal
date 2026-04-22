import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

import nl from './nl.json';
import en from './en.json';

const LANGUAGE_KEY = '@language';

const languageDetector = {
  type: 'languageDetector' as const,
  async: true,
  detect: async (callback: (lng: string) => void) => {
    try {
      const savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
      if (savedLanguage) {
        callback(savedLanguage);
        return;
      }
      const locales = Localization.getLocales();
      const deviceLanguage = (locales?.[0]?.languageCode) || 'nl';
      callback(deviceLanguage);
    } catch (error) {
      callback('nl');
    }
  },
  init: () => {},
  cacheUserLanguage: async (language: string) => {
    try {
      await AsyncStorage.setItem(LANGUAGE_KEY, language);
    } catch (error) {
      console.error('Error saving language:', error);
    }
  },
};

i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v4',
    resources: {
      nl: { translation: nl },
      en: { translation: en },
    },
    fallbackLng: 'nl',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
