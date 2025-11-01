'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode
} from 'react'
import { PricingService } from '@/lib/services/pricing.service'
import {
  DEFAULT_CURRENCY,
  type Currency,
  CONVERSION_RATES as FALLBACK_RATES
} from '@/lib/config/currency.config'
import { CoinGeckoService } from '@/lib/services/coingecko.service'

export type { Currency }

interface CurrencyContextType {
  currency: Currency
  setCurrency: (currency: Currency) => void
  convertPrice: (usdPrice: number) => number
  formatPrice: (usdPrice: number) => string
  conversionRates: Record<Currency, number>
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(
  undefined
)

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useState<Currency>(DEFAULT_CURRENCY)
  const [conversionRates, setConversionRates] =
    useState<Record<Currency, number>>(FALLBACK_RATES)

  useEffect(() => {
    const fetchRates = async () => {
      const rates = await CoinGeckoService.fetchConversionRates()
      setConversionRates(rates)
    }
    fetchRates()
  }, [])

  const convertPrice = (usdPrice: number): number => {
    return PricingService.convertPrice(usdPrice, currency, conversionRates)
  }

  const formatPrice = (usdPrice: number): string => {
    return PricingService.formatPrice(usdPrice, currency, conversionRates)
  }

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        convertPrice,
        formatPrice,
        conversionRates
      }}
    >
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  const context = useContext(CurrencyContext)
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider')
  }
  return context
}
