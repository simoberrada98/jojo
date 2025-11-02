import { Currency } from '@/lib/config/currency.config';
import { logger } from '@/lib/utils/logger';

interface CoinGeckoPriceResponse {
  [key: string]: {
    usd: number;
  };
}

const COINGECKO_IDS: Record<Currency, string> = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  BNB: 'binancecoin',
  USDC: 'usd-coin',
  USDT: 'tether',
};

export class CoinGeckoService {
  static async fetchConversionRates(): Promise<Record<Currency, number>> {
    const ids = Object.values(COINGECKO_IDS).join(',');
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.statusText}`);
      }
      const data: CoinGeckoPriceResponse = await response.json();

      const rates: Record<Currency, number> = {
        BTC: 0,
        ETH: 0,
        BNB: 0,
        USDC: 0,
        USDT: 0,
      };

      for (const currencyKey in COINGECKO_IDS) {
        const currency = currencyKey as Currency;
        const coingeckoId = COINGECKO_IDS[currency];
        if (data[coingeckoId] && data[coingeckoId].usd) {
          // CoinGecko returns price in USD, we need rate from USD to crypto
          // So, 1 / price_in_usd
          rates[currency] = 1 / data[coingeckoId].usd;
        } else {
          logger.warn(`Could not fetch rate for ${currency} from CoinGecko.`);
          // Fallback to a default or handle error appropriately
          rates[currency] = currency === 'USDC' ? 1.0 : 0; // Default to 1 for USDC, 0 for others if not found
        }
      }
      return rates;
    } catch (error) {
      logger.error(
        'Error fetching conversion rates from CoinGecko',
        error as Error
      );
      // Return a fallback or throw the error
      return {
        BTC: 0.000029, // Fallback values
        ETH: 0.00042,
        BNB: 0.00165,
        USDC: 1.0,
        USDT: 1.0,
      };
    }
  }
}
