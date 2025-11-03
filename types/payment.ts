/**
 * Payment domain types centralised for reuse across services.
 * Prefer importing from "@/types/payment" to keep consumers DRY.
 */

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
  metadata?: Record<string, unknown>;
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
  details?: unknown;
  retryable: boolean;
}

export interface PaymentResult {
  success: boolean;
  paymentId: string;
  status: PaymentStatus;
  transactionId?: string;
  receiptUrl?: string;
  error?: PaymentError;
  metadata?: Record<string, unknown>;
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
  metadata?: Record<string, unknown>;
}

export interface CustomerInfo {
  email: string;
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

export interface PaymentRecord {
  id: string;
  hoodpay_payment_id?: string;
  business_id: string;
  session_id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  method?: PaymentMethod;
  customer_email?: string;
  customer_ip?: string;
  metadata?: Record<string, unknown>;
  checkout_data?: CheckoutData;
  hoodpay_response?: unknown;
  web_payment_response?: unknown;
  error_log?: PaymentError[];
  created_at: string;
  updated_at: string;
  completed_at?: string;
  expires_at?: string;
}

export interface WebhookEvent {
  id: string;
  event_type: string;
  payment_id: string;
  business_id: string;
  payload: unknown;
  signature?: string;
  verified: boolean;
  processed: boolean;
  processing_error?: string;
  received_at: string;
  processed_at?: string;
  retry_count: number;
}

export interface PaymentAttempt {
  id: string;
  payment_id: string;
  attempt_number: number;
  method: PaymentMethod;
  status: PaymentStatus;
  error?: PaymentError;
  request_data?: unknown;
  response_data?: unknown;
  created_at: string;
}

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
  metadata?: Record<string, unknown>;
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
