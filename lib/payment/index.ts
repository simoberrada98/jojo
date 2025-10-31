/**
 * Payment Module - Production-ready payment integration
 * Exports all payment functionality for HoodPay, Web Payment API, Supabase, and localStorage
 */

// Core types
export * from "./types";

// Storage management
export * from "./localStorage";

// Web Payment API
export * from "./webPaymentApi";

// Supabase service
export * from "./supabaseService";

// Main orchestrator
export * from "./paymentOrchestrator";

// Re-export HoodPay module functions
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
  verifyWebhookSignature,
} from "../hoodpayModule";
