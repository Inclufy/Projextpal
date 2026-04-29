// Currency Configuration for Multi-Region Support
export type CurrencyCode = 'EUR' | 'GBP' | 'USD' | 'AED' | 'SAR' | 'MAD';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  name: string;
  locale: string;
}

export const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', locale: 'nl-NL' },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', locale: 'en-GB' },
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', locale: 'en-US' },
  AED: { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham', locale: 'ar-AE' },
  SAR: { code: 'SAR', symbol: 'ر.س', name: 'Saudi Riyal', locale: 'ar-SA' },
  MAD: { code: 'MAD', symbol: 'د.م.', name: 'Moroccan Dirham', locale: 'ar-MA' },
};

// Auto-detect currency based on language/locale
export const getCurrencyFromLanguage = (language: string): CurrencyCode => {
  switch (language.toLowerCase()) {
    case 'nl':
    case 'nl-nl':
    case 'en':
      return 'EUR';
    case 'en-gb':
    case 'gb':
      return 'GBP';
    case 'en-us':
      return 'USD';
    case 'ar':
    case 'ar-ae':
      return 'AED';
    case 'ar-sa':
      return 'SAR';
    case 'ar-ma':
      return 'MAD';
    default:
      return 'EUR';
  }
};

// Format budget with proper currency
export const formatBudget = (
  amount: number,
  currencyCode: CurrencyCode = 'EUR'
): string => {
  const currency = CURRENCIES[currencyCode];
  
  if (amount >= 1000000) {
    return `${currency.symbol}${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `${currency.symbol}${(amount / 1000).toFixed(1)}K`;
  }
  return `${currency.symbol}${amount.toFixed(2)}`;
};

// Map app UI language to a BCP-47 locale for number/date formatting
const languageToLocale = (language?: string): string | undefined => {
  if (!language) return undefined;
  const lc = language.toLowerCase();
  if (lc === 'nl' || lc === 'nl-nl') return 'nl-NL';
  if (lc === 'en') return 'en-US';
  if (lc === 'en-gb' || lc === 'gb') return 'en-GB';
  if (lc === 'ar' || lc.startsWith('ar-')) return lc === 'ar' ? 'ar-AE' : lc;
  return language;
};

// Format with proper locale number formatting.
// `language` overrides the currency's default locale so a NL user sees `€ 8.500.000,00`
// and an EN user sees `€8,500,000.00` for the same EUR amount.
export const formatBudgetDetailed = (
  amount: number,
  currencyCode: CurrencyCode = 'EUR',
  language?: string
): string => {
  const currency = CURRENCIES[currencyCode];
  const locale = languageToLocale(language) ?? currency.locale;
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency.code,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};
