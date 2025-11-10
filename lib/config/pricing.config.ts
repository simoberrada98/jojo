/**
 * Pricing configuration
 * Centralized pricing rules and constants
 */

// Default supported currencies with their display properties
export const SUPPORTED_CURRENCIES = {
  USD: {
    symbol: '$',
    name: 'US Dollar',
    decimalDigits: 2,
    rounding: 0,
    code: 'USD',
  },
  USDC: {
    symbol: 'USDC',
    name: 'USD Coin',
    decimalDigits: 2,
    rounding: 0,
    code: 'USDC',
  },
  // Add more currencies as needed
} as const;

export type CurrencyCode = keyof typeof SUPPORTED_CURRENCIES;

// Default price ranges for filters
export const PRICE_RANGES = {
  MIN: 0,
  MAX: 200000, // $200,000
  STEP: 100, // $100 increments
} as const;

// Power cost settings
export const POWER_COSTS = {
  DEFAULT_RATE: 0.07, // $0.07/kWh
  DEFAULT_THRESHOLD: 0.07, // $/kWh
} as const;

export const PRICING_CONFIG = {
  // Default currency settings
  defaultCurrency: 'USD' as CurrencyCode,
  defaultLocale: 'en-US',
  
  // Price display settings
  priceDisplay: {
    showNativeCurrency: true,
    showUSDEstimate: true,
  },

  // Shipping costs
  shipping: {
    standard: 0, // USD
    express: 100, // USD
    free: true,
  },

  // Tax rates
  tax: {
    rate: 0,
    includedInPrice: false,
  },

  // Discounts
  discounts: {
    bulkThreshold: 5, // items
    bulkRate: 0.1, // 10% off
  },
} as const;
