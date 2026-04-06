import { useTranslation } from 'react-i18next';

export const useLanguage = () => {
  const { t, i18n } = useTranslation();
  
  const changeLanguage = async (lang: string) => {
    await i18n.changeLanguage(lang);
  };
  
  const isNL = i18n.language === 'nl';
  
  return {
    t,
    language: i18n.language,
    changeLanguage,
    isNL,
  };
};