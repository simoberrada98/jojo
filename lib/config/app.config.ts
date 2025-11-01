import { env } from '@/lib/config/env';

/**
 * Application-wide configuration constants
 * Single source of truth for all app settings
 */
export const APP_CONFIG = {
  name: env.NEXT_PUBLIC_APP_NAME,
  baseUrl: env.NEXT_PUBLIC_BASE_URL,

  // Session and storage settings
  session: {
    timeoutMs: 30 * 60 * 1000, // 30 minutes
    storagePrefix: 'jhuangnyc_hp_payment_',
  },

  // Retry configuration
  retry: {
    maxAttempts: 3,
    delayMs: 1000,
    backoffMultiplier: 2,
  },

  // Pagination defaults
  pagination: {
    defaultPageSize: 20,
    maxPageSize: 100,
  },

  // Feature flags
  features: {
    enableHoodPay: env.NEXT_PUBLIC_ENABLE_HOODPAY,
    enableWebPaymentApi: env.NEXT_PUBLIC_ENABLE_WEB_PAYMENT_API,
  },
} as const;

/**
 * Storage keys
 */
export const STORAGE_KEYS = {
  cart: 'cart',
  paymentState: `${APP_CONFIG.session.storagePrefix}state`,
  paymentSession: `${APP_CONFIG.session.storagePrefix}session`,
  paymentRecovery: `${APP_CONFIG.session.storagePrefix}recovery`,
} as const;
