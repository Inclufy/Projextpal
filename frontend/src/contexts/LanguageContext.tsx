import { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'nl';

// Use relative imports
import nlTranslations from '../i18n/nl.json';
import enTranslations from '../i18n/en.json';

const translations = {
  en: enTranslations,
  nl: nlTranslations,
};

export const languages = [
  { code: 'nl', name: 'Nederlands', flag: '🇳🇱' },
  { code: 'en', name: 'English', flag: '🇬🇧' }
] as const;

export type LanguageType = typeof languages[number]['code'];

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: any;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('language') as Language) || 'nl';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  const t = translations[language];

  console.log('✅ LanguageProvider loaded');
  console.log('Language:', language);
  console.log('t:', t);
  console.log('t.nav:', t?.nav);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}
