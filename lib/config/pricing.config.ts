/**
 * Pricing configuration
 * Centralized pricing rules and constants
 */
export const PRICING_CONFIG = {
  // Shipping costs
  shipping: {
    standard: 50, // USD
    express: 100, // USD
    free: false,
  },

  // Tax rates
  tax: {
    rate: 0.08, // 8%
    includedInPrice: false,
  },

  // Discounts
  discounts: {
    bulkThreshold: 5, // items
    bulkRate: 0.1, // 10% off
  },
} as const;
