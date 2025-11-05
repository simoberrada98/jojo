/**
 * Payment domain types centralised for reuse across services.
 * Prefer importing from "@/types/payment" to keep consumers DRY.
 */

import type {
  Json,
  Tables,
  TablesInsert,
  TablesUpdate,
} from './supabase.types';

// -----------------------------------------------------------------------------
// Status and method enums
// -----------------------------------------------------------------------------

export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
  REFUNDED = 'refunded',
}

export enum PaymentMethod {
  CARD = 'card',
  CRYPTO = 'crypto',
  BANK_TRANSFER = 'bank_transfer',
  HOODPAY = 'hoodpay',
  WEB_PAYMENT_API = 'web_payment_api',
}

// -----------------------------------------------------------------------------
// Core entities
// -----------------------------------------------------------------------------

export interface PaymentIntent {
  id: string;
  businessId: string;
  amount: number;
  currency: string;
  description?: string;
  metadata?: Json;
  customerEmail?: string;
  customerIp?: string;
  customerUserAgent?: string;
  redirectUrl?: string;
  notifyUrl?: string;
  status: PaymentStatus;
  method?: PaymentMethod;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
}

export interface PaymentError {
  code: string;
  message: string;
  details?: Json;
  retryable: boolean;
}

export interface PaymentResult {
  success: boolean;
  paymentId: string;
  status: PaymentStatus;
  transactionId?: string;
  receiptUrl?: string;
  error?: PaymentError;
  metadata?: Json;
}

// -----------------------------------------------------------------------------
// Local storage state
// -----------------------------------------------------------------------------

export interface PaymentLocalState {
  sessionId: string;
  paymentIntent: PaymentIntent;
  currentStep: PaymentStep;
  attemptCount: number;
  lastError?: PaymentError;
  checkoutData?: CheckoutData;
  timestamp: string;
}

export enum PaymentStep {
  INIT = 'init',
  METHOD_SELECTION = 'method_selection',
  DETAILS_ENTRY = 'details_entry',
  PROCESSING = 'processing',
  VERIFICATION = 'verification',
  COMPLETE = 'complete',
  ERROR = 'error',
}

export interface CheckoutData {
  items: CheckoutItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  currency: string;
  customerInfo?: CustomerInfo;
}

export interface CheckoutItem {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  total: number;
  metadata?: Json;
}

export interface CustomerInfo {
  email?: string;
  name?: string;
  phone?: string;
  address?: Address;
}

export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
}

// -----------------------------------------------------------------------------
// Persistence layer types
// -----------------------------------------------------------------------------

export type PaymentRecord = Tables<'payments'>;
export type PaymentRecordInsert = TablesInsert<'payments'>;
export type PaymentRecordUpdate = TablesUpdate<'payments'>;

export type WebhookEvent = Tables<'webhook_events'>;
export type WebhookEventInsert = TablesInsert<'webhook_events'>;
export type WebhookEventUpdate = TablesUpdate<'webhook_events'>;

export type PaymentAttempt = Tables<'payment_attempts'>;
export type PaymentAttemptInsert = TablesInsert<'payment_attempts'>;
export type PaymentAttemptUpdate = TablesUpdate<'payment_attempts'>;

// -----------------------------------------------------------------------------
// Web payment API shapes
// -----------------------------------------------------------------------------

export interface WebPaymentRequest {
  methodData: PaymentMethodData[];
  details: PaymentDetailsInit;
  options?: PaymentOptions;
}

export interface PaymentMethodData {
  supportedMethods: string;
  data?: unknown;
}

export interface PaymentDetailsInit {
  total: PaymentItem;
  displayItems?: PaymentItem[];
  shippingOptions?: PaymentShippingOption[];
  modifiers?: PaymentDetailsModifier[];
}

export interface PaymentItem {
  label: string;
  amount: PaymentCurrencyAmount;
  pending?: boolean;
}

export interface PaymentCurrencyAmount {
  currency: string;
  value: string;
}

export interface PaymentShippingOption {
  id: string;
  label: string;
  amount: PaymentCurrencyAmount;
  selected?: boolean;
}

export interface PaymentDetailsModifier {
  supportedMethods: string;
  total?: PaymentItem;
  additionalDisplayItems?: PaymentItem[];
  data?: unknown;
}

export interface PaymentOptions {
  requestPayerName?: boolean;
  requestPayerEmail?: boolean;
  requestPayerPhone?: boolean;
  requestShipping?: boolean;
  shippingType?: 'shipping' | 'delivery' | 'pickup';
}

// -----------------------------------------------------------------------------
// External API types
// -----------------------------------------------------------------------------

export interface HoodPayPaymentResponse {
  id: string;
  status: string;
  amount: number;
  currency: string;
  paymentUrl: string;
  expiresAt: string;
  createdAt: string;
  metadata?: Json;
}

export interface HoodPayWebhookData {
  id: string;
  businessId?: string;
  amount?: number;
  currency?: string;
  status?: string;
  method?: string;
  customerEmail?: string;
  [key: string]: unknown;
}

export interface HoodPayWebhookPayload {
  event: string;
  paymentId: string;
  businessId: string;
  status: string;
  amount: number;
  currency: string;
  timestamp: string;
  data: HoodPayWebhookData;
}

// -----------------------------------------------------------------------------
// Configuration shapes
// -----------------------------------------------------------------------------

export interface PaymentConfig {
  hoodpay: {
    apiKey: string;
    businessId: string;
    webhookSecret: string;
    baseUrl?: string;
  };
  supabase: {
    url: string;
    key: string;
  };
  payment: {
    supportedMethods: PaymentMethod[];
    defaultCurrency: string;
    allowedCurrencies: string[];
    sessionTimeout: number;
    maxRetryAttempts: number;
    retryDelayMs: number;
  };
  webPaymentApi: {
    enabled: boolean;
    supportedNetworks: string[];
    merchantName: string;
  };
}

// -----------------------------------------------------------------------------
// Service and event helpers
// -----------------------------------------------------------------------------

export interface ServiceResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: PaymentError;
  metadata?: {
    requestId?: string;
    timestamp: string;
    duration?: number;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalPages: number;
    totalItems: number;
  };
}

export enum PaymentEventType {
  PAYMENT_CREATED = 'payment:created',
  PAYMENT_METHOD_SELECTED = 'payment:method_selected',
  PAYMENT_PROCESSING = 'payment:processing',
  PAYMENT_COMPLETED = 'payment:completed',
  PAYMENT_FAILED = 'payment:failed',
  PAYMENT_CANCELLED = 'payment:cancelled',
  PAYMENT_EXPIRED = 'payment:expired',
  PAYMENT_REFUNDED = 'payment:refunded',
}

export interface PaymentEvent {
  type: PaymentEventType;
  paymentId: string;
  timestamp: string;
  data: unknown;
}

export type PaymentCallback = (event: PaymentEvent) => void | Promise<void>;

export interface PaymentHooks {
  onCreated?: PaymentCallback;
  onMethodSelected?: PaymentCallback;
  onProcessing?: PaymentCallback;
  onCompleted?: PaymentCallback;
  onFailed?: PaymentCallback;
  onCancelled?: PaymentCallback;
}

export const paymentErrorToJson = (error: PaymentError): Json =>
  ({
    code: error.code,
    message: error.message,
    details: error.details ?? null,
    retryable: error.retryable,
  }) as Json;
