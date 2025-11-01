/**
 * Currency configuration
 * Centralized conversion rates and currency settings
 */

export type Currency = 'BTC' | 'ETH' | 'BNB' | 'USDC'

/**
 * Conversion rates from USD to crypto
 * In production, these should be fetched from an API
 * These are approximate values for demonstration
 */
export const CONVERSION_RATES: Record<Currency, number> = {
  BTC: 0.000029, // ~$34,000 per BTC
  ETH: 0.00042, // ~$2,400 per ETH
  BNB: 0.00165, // ~$606 per BNB
  USDC: 1.0 // 1:1 with USD
} as const

/**
 * Currency display configuration
 */
export const CURRENCY_CONFIG: Record<
  Currency,
  {
    symbol: string
    decimals: number
    name: string
  }
> = {
  BTC: {
    symbol: 'BTC',
    decimals: 4,
    name: 'Bitcoin'
  },
  ETH: {
    symbol: 'ETH',
    decimals: 3,
    name: 'Ethereum'
  },
  BNB: {
    symbol: 'BNB',
    decimals: 2,
    name: 'Binance Coin'
  },
  USDC: {
    symbol: 'USD',
    decimals: 2,
    name: 'USD Coin'
  }
} as const

/**
 * Default currency
 */
export const DEFAULT_CURRENCY: Currency = 'BTC'

/**
 * Get decimal places for a currency
 */
export function getCurrencyDecimals(currency: Currency): number {
  return CURRENCY_CONFIG[currency]?.decimals ?? 2
}
