/**
 * Services Context
 * Provides React context wrapper for service container
 * Allows dependency injection in React components
 */

"use client"

import { createContext, useContext, ReactNode } from "react"
import { container, Services } from "@/lib/services/ServiceContainer"
import type { PricingService } from "@/lib/services/pricing.service"
import type { PaymentStorageService } from "@/lib/services/payment-storage.service"
import type { PaymentDatabaseService } from "@/lib/services/payment-db.service"

interface ServicesContextType {
  getPricingService: () => typeof PricingService
  getPaymentStorage: () => PaymentStorageService
  getPaymentDb: () => PaymentDatabaseService | null
}

const ServicesContext = createContext<ServicesContextType | undefined>(undefined)

export function ServicesProvider({ children }: { children: ReactNode }) {
  const getPricingService = () => {
    return container.resolve<typeof PricingService>(Services.PRICING)
  }

  const getPaymentStorage = () => {
    return container.resolve<PaymentStorageService>(Services.PAYMENT_STORAGE)
  }

  const getPaymentDb = () => {
    try {
      return container.resolve<PaymentDatabaseService>(Services.PAYMENT_DB)
    } catch {
      return null
    }
  }

  return (
    <ServicesContext.Provider
      value={{
        getPricingService,
        getPaymentStorage,
        getPaymentDb,
      }}
    >
      {children}
    </ServicesContext.Provider>
  )
}

/**
 * Hook to access services
 */
export function useServices() {
  const context = useContext(ServicesContext)
  if (context === undefined) {
    throw new Error("useServices must be used within ServicesProvider")
  }
  return context
}

/**
 * Convenience hooks for specific services
 */
export function usePricingService() {
  const { getPricingService } = useServices()
  return getPricingService()
}

export function usePaymentStorage() {
  const { getPaymentStorage } = useServices()
  return getPaymentStorage()
}

export function usePaymentDb() {
  const { getPaymentDb } = useServices()
  return getPaymentDb()
}
