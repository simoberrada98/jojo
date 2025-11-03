/**
 * Pricing configuration
 * Centralized pricing rules and constants
 */
export const PRICING_CONFIG = {
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
