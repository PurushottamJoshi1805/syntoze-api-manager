export type SupportedCurrency =
  | 'INR'
  | 'USD'
  | 'EUR'
  | 'GBP'
  | 'CAD'
  | 'AUD'
  | 'JPY'
  | 'AED'
  | 'SGD';

export interface CurrencyConfig {
  code: SupportedCurrency;
  symbol: string;
  label: string;
  flag: string;
  monthlyPrice: number;
  monthlyFormatted: string;
  lifetimePrice: number;
  lifetimeFormatted: string;
  inrEquivalentMonthly: number;
  inrEquivalentLifetime: number;
}

export const CURRENCIES: Record<SupportedCurrency, CurrencyConfig> = {
  INR: {
    code: 'INR',
    symbol: '₹',
    label: 'INR - Indian Rupee',
    flag: '🇮🇳',
    monthlyPrice: 99,
    monthlyFormatted: '₹99',
    lifetimePrice: 999,
    lifetimeFormatted: '₹999',
    inrEquivalentMonthly: 99,
    inrEquivalentLifetime: 999,
  },
  USD: {
    code: 'USD',
    symbol: '$',
    label: 'USD - US Dollar',
    flag: '🇺🇸',
    monthlyPrice: 1.49,
    monthlyFormatted: '$1.49',
    lifetimePrice: 12.99,
    lifetimeFormatted: '$12.99',
    inrEquivalentMonthly: 99,
    inrEquivalentLifetime: 999,
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    label: 'EUR - Euro',
    flag: '🇪🇺',
    monthlyPrice: 1.39,
    monthlyFormatted: '€1.39',
    lifetimePrice: 11.99,
    lifetimeFormatted: '€11.99',
    inrEquivalentMonthly: 99,
    inrEquivalentLifetime: 999,
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    label: 'GBP - British Pound',
    flag: '🇬🇧',
    monthlyPrice: 1.19,
    monthlyFormatted: '£1.19',
    lifetimePrice: 9.99,
    lifetimeFormatted: '£9.99',
    inrEquivalentMonthly: 99,
    inrEquivalentLifetime: 999,
  },
  CAD: {
    code: 'CAD',
    symbol: 'C$',
    label: 'CAD - Canadian Dollar',
    flag: '🇨🇦',
    monthlyPrice: 1.99,
    monthlyFormatted: 'C$1.99',
    lifetimePrice: 17.99,
    lifetimeFormatted: 'C$17.99',
    inrEquivalentMonthly: 99,
    inrEquivalentLifetime: 999,
  },
  AUD: {
    code: 'AUD',
    symbol: 'A$',
    label: 'AUD - Australian Dollar',
    flag: '🇦🇺',
    monthlyPrice: 2.29,
    monthlyFormatted: 'A$2.29',
    lifetimePrice: 19.99,
    lifetimeFormatted: 'A$19.99',
    inrEquivalentMonthly: 99,
    inrEquivalentLifetime: 999,
  },
  JPY: {
    code: 'JPY',
    symbol: '¥',
    label: 'JPY - Japanese Yen',
    flag: '🇯🇵',
    monthlyPrice: 220,
    monthlyFormatted: '¥220',
    lifetimePrice: 1950,
    lifetimeFormatted: '¥1,950',
    inrEquivalentMonthly: 99,
    inrEquivalentLifetime: 999,
  },
  AED: {
    code: 'AED',
    symbol: 'AED ',
    label: 'AED - UAE Dirham',
    flag: '🇦🇪',
    monthlyPrice: 5.5,
    monthlyFormatted: 'AED 5.50',
    lifetimePrice: 49.0,
    lifetimeFormatted: 'AED 49',
    inrEquivalentMonthly: 99,
    inrEquivalentLifetime: 999,
  },
  SGD: {
    code: 'SGD',
    symbol: 'S$',
    label: 'SGD - Singapore Dollar',
    flag: '🇸🇬',
    monthlyPrice: 1.99,
    monthlyFormatted: 'S$1.99',
    lifetimePrice: 17.99,
    lifetimeFormatted: 'S$17.99',
    inrEquivalentMonthly: 99,
    inrEquivalentLifetime: 999,
  },
};

