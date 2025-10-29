"use client"

import { createContext, useContext, useState, ReactNode } from "react"

export type Currency = "BTC" | "ETH" | "BNB" | "USDC"

interface CurrencyContextType {
  currency: Currency
  setCurrency: (currency: Currency) => void
  convertPrice: (usdPrice: number) => number
  formatPrice: (usdPrice: number) => string
}

// Approximate conversion rates (in practice, these would come from an API)
const CONVERSION_RATES: Record<Currency, number> = {
  BTC: 0.000029, // $34,000 per BTC
  ETH: 0.00042, // $2,400 per ETH
  BNB: 0.00165, // $606 per BNB
  USDC: 1.0, // 1:1 with USD
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined)

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useState<Currency>("BTC")

  const convertPrice = (usdPrice: number): number => {
    return usdPrice * CONVERSION_RATES[currency]
  }

  const formatPrice = (usdPrice: number): string => {
    const converted = convertPrice(usdPrice)
    
    switch (currency) {
      case "USDC":
        return `$${converted.toFixed(2)}`
      case "BTC":
        return converted.toFixed(4)
      case "ETH":
        return converted.toFixed(3)
      case "BNB":
        return converted.toFixed(2)
      default:
        return converted.toFixed(2)
    }
  }

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, convertPrice, formatPrice }}>
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  const context = useContext(CurrencyContext)
  if (context === undefined) {
    throw new Error("useCurrency must be used within a CurrencyProvider")
  }
  return context
}
