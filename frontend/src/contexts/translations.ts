import enJSON from '../i18n/en.json';
import nlJSON from '../i18n/nl.json';
import frJSON from '../i18n/fr.json';

export const translations = {
  en: enJSON,
  nl: nlJSON,
  fr: frJSON,
} as const;

export type TranslationsType = typeof enJSON;
