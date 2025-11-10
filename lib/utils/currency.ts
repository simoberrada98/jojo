import { SUPPORTED_CURRENCIES, PRICING_CONFIG, type CurrencyCode } from '@/lib/config/pricing.config';

type CurrencyFormatOptions = {
  locale?: string;
  currency?: CurrencyCode;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  showSymbol?: boolean;
  showUSDEstimate?: boolean;
  usdAmount?: number; // Optional USD amount for conversion
};

/**
 * Format a currency amount with proper localization and symbol handling
 */
export function formatCurrency(
  amount: number,
  options: CurrencyFormatOptions = {}
): string {
  const {
    locale = PRICING_CONFIG.defaultLocale,
    currency = PRICING_CONFIG.defaultCurrency,
    minimumFractionDigits = SUPPORTED_CURRENCIES[currency as CurrencyCode]?.decimalDigits ?? 2,
    maximumFractionDigits = SUPPORTED_CURRENCIES[currency as CurrencyCode]?.decimalDigits ?? 2,
    showSymbol = true,
    showUSDEstimate = PRICING_CONFIG.priceDisplay.showUSDEstimate,
    usdAmount,
  } = {
    ...options,
    currency: (options.currency || PRICING_CONFIG.defaultCurrency) as CurrencyCode,
  };

  // Get currency info
  const currencyInfo = SUPPORTED_CURRENCIES[currency] || SUPPORTED_CURRENCIES.USD;
  const formattedAmount = new Intl.NumberFormat(locale, {
    style: 'decimal',
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(Number.isFinite(amount) ? amount : 0);

  // Handle symbol display
  let result = '';
  if (showSymbol) {
    if (currencyInfo.symbol === currency) {
      // For symbols like $, €, £
      result = `${currencyInfo.symbol}${formattedAmount}`;
    } else {
      // For currency codes like USDC, BTC
      result = `${formattedAmount} ${currencyInfo.symbol}`;
    }
  } else {
    result = formattedAmount;
  }

  // Add USD estimate if needed and different from the main currency
  if (showUSDEstimate && currency !== 'USD' && usdAmount) {
    const usdFormatted = formatCurrency(usdAmount, {
      ...options,
      currency: 'USD', 
      showSymbol: true,
      showUSDEstimate: false,
    });
    result += ` (${usdFormatted})`;
  }

  return result;
}

/**
 * Format a price range with proper currency formatting
 */
export function formatPriceRange(
  min: number,
  max: number,
  options: Omit<CurrencyFormatOptions, 'showUSDEstimate'> = {}
): string {
  if (min === max) {
    return formatCurrency(min, options);
  }
  return `${formatCurrency(min, { ...options, showUSDEstimate: false })} - ${formatCurrency(
    max,
    options
  )}`;
}

/**
 * Convert amount from one currency to another using a simple rate
 * In a real app, this would use an exchange rate service
 */
export function convertCurrency(
  amount: number,
  fromCurrency: CurrencyCode,
  toCurrency: CurrencyCode,
  rate?: number
): number {
  if (fromCurrency === toCurrency) return amount;
  
  // In a real app, you would fetch this from an exchange rate API
  const exchangeRate = rate || 1; // Default to 1:1 for same currency
  
  return amount * exchangeRate;
}
