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

// Format with proper locale number formatting
export const formatBudgetDetailed = (
  amount: number,
  currencyCode: CurrencyCode = 'EUR'
): string => {
  const currency = CURRENCIES[currencyCode];
  return new Intl.NumberFormat(currency.locale, {
    style: 'currency',
    currency: currency.code,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};
