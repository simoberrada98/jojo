/**
 * Payment Module - Unified exports for payment orchestration
 */

// Core types
export * from '@/types/payment'

// Browser payment helpers
export * from './webPaymentApi'

// Storage service (client-safe)
export {
  PaymentStorageService,
  type StorageAdapter,
  createPaymentStorage,
  paymentStorage
} from '../services/payment-storage.service'

// Database service (server usage)
export {
  PaymentDatabaseService,
  createPaymentDbService
} from '../services/payment-db.service'

// Orchestrator and related services
export {
  PaymentOrchestrator,
  createPaymentOrchestrator
} from '../services/payment'
export * from '../services/payment'

// Shared webhook verification
export { verifyHoodpaySignature } from '../services/payment/webhook'

// HoodPay API helpers
export {
  supabase,
  getPayments,
  createPayment,
  savePaymentsToSupabase,
  paymentsApiHandler,
  getWebhooks,
  createWebhook,
  deleteWebhook,
  resetWebhookSecret,
  webhooksApiHandler,
  webhookReceiverHandler,
  verifyWebhookSignature
} from '../hoodpayModule'
