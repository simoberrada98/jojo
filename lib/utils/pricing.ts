/**
 * @deprecated Use PricingService from @/lib/services/pricing.service instead
 * This file is kept for backward compatibility
 */

import { PRICING_CONFIG } from "@/lib/config/pricing.config"
import { PricingService } from "@/lib/services/pricing.service"

// Re-export from centralized config
export const SHIPPING_COST = PRICING_CONFIG.shipping.standard
export const TAX_RATE = PRICING_CONFIG.tax.rate

// Re-export types from centralized location
export type { CartItem, CartSummary as PricingSummary } from "@/lib/types/cart"

/**
 * @deprecated Use PricingService.calculateCartSummary instead
 */
export function calculatePricing(items: any[]) {
  return PricingService.calculateCartSummary(items)
}
