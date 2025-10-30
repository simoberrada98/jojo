"use client"

import { createContext, useContext, useState, ReactNode } from "react"
import { PricingService } from "@/lib/services/pricing.service"
import { DEFAULT_CURRENCY, type Currency } from "@/lib/config/currency.config"

interface CurrencyContextType {
  currency: Currency
  setCurrency: (currency: Currency) => void
  convertPrice: (usdPrice: number) => number
  formatPrice: (usdPrice: number) => string
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined)

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useState<Currency>(DEFAULT_CURRENCY)

  const convertPrice = (usdPrice: number): number => {
    return PricingService.convertPrice(usdPrice, currency)
  }

  const formatPrice = (usdPrice: number): string => {
    return PricingService.formatPrice(usdPrice, currency)
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
