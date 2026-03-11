import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

export const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => setLanguage('en')}
        className={`px-3 py-1 rounded transition-colors ${
          language === 'en'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
        aria-label="Switch to English"
      >
        EN
      </button>
      <button
        onClick={() => setLanguage('nl')}
        className={`px-3 py-1 rounded transition-colors ${
          language === 'nl'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
        aria-label="Schakel naar Nederlands"
      >
        NL
      </button>
      <button
        onClick={() => setLanguage('fr')}
        className={`px-3 py-1 rounded transition-colors ${
          language === 'fr'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
        aria-label="Passer en Français"
      >
        FR
      </button>
    </div>
  );
};
