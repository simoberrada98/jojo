/**
 * Currency configuration
 * Centralized conversion rates and currency settings
 */

export type Currency = "BTC" | "ETH" | "BNB" | "USDC";

/**
 * Conversion rates from USD to crypto
 * In production, these should be fetched from an API
 * These are approximate values for demonstration
 */
export const CONVERSION_RATES: Record<Currency, number> = {
  BTC: 0.000029, // ~$34,000 per BTC
  ETH: 0.00042,  // ~$2,400 per ETH
  BNB: 0.00165,  // ~$606 per BNB
  USDC: 1.0,     // 1:1 with USD
} as const;

/**
 * Currency display configuration
 */
export const CURRENCY_CONFIG: Record<Currency, { 
  symbol: string;
  decimals: number;
  name: string;
}> = {
  BTC: {
    symbol: "₿",
    decimals: 8,
    name: "Bitcoin",
  },
  ETH: {
    symbol: "Ξ",
    decimals: 6,
    name: "Ethereum",
  },
  BNB: {
    symbol: "BNB",
    decimals: 4,
    name: "Binance Coin",
  },
  USDC: {
    symbol: "$",
    decimals: 2,
    name: "USD Coin",
  },
} as const;

/**
 * Default currency
 */
export const DEFAULT_CURRENCY: Currency = "BTC";

/**
 * Get decimal places for a currency
 */
export function getCurrencyDecimals(currency: Currency): number {
  switch (currency) {
    case "USDC":
      return 2;
    case "BTC":
      return 4;
    case "ETH":
      return 3;
    case "BNB":
      return 2;
    default:
      return 2;
  }
}
