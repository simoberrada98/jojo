import { env } from '@/lib/config/env'

/**
 * Payment configuration
 * Centralized payment-related constants
 */
export const PAYMENT_CONFIG = {
  // HoodPay credentials
  hoodpay: {
    apiKey: env.HOODPAY_API_KEY,
    businessId: env.HOODPAY_BUSINESS_ID,
    webhookSecret: env.HOODPAY_WEBHOOK_SECRET
  },

  // Payment timeouts
  timeouts: {
    sessionMs: 30 * 60 * 1000, // 30 minutes
    processingMs: 5 * 60 * 1000 // 5 minutes
  },

  // Retry settings
  retry: {
    maxAttempts: 3,
    delayMs: 1000,
    backoffMultiplier: 2
  },

  // Supported payment methods
  methods: {
    hoodpay: 'HOODPAY',
    crypto: 'CRYPTO',
    webPaymentApi: 'WEB_PAYMENT_API'
  } as const
} as const

/**
 * Payment validation rules
 */
export const PAYMENT_VALIDATION = {
  minAmount: 0.01,
  maxAmount: 1000000,
  supportedCurrencies: ['BTC', 'ETH', 'BNB', 'USDC']
} as const
