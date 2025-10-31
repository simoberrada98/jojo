/**
 * Production-grade payment types for HoodPay integration
 * Includes localStorage state, Supabase models, and Web Payment API types
 */

// ============================================================================
// Payment Status & States
// ============================================================================

export enum PaymentStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  COMPLETED = "completed",
  FAILED = "failed",
  CANCELLED = "cancelled",
  EXPIRED = "expired",
  REFUNDED = "refunded",
}

export enum PaymentMethod {
  CARD = "card",
  CRYPTO = "crypto",
  BANK_TRANSFER = "bank_transfer",
  HOODPAY = "hoodpay",
  WEB_PAYMENT_API = "web_payment_api",
}

// ============================================================================
// Core Payment Models
// ============================================================================

export interface PaymentIntent {
  id: string;
  businessId: string;
  amount: number;
  currency: string;
  description?: string;
  metadata?: Record<string, any>;
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

export interface PaymentResult {
  success: boolean;
  paymentId: string;
  status: PaymentStatus;
  transactionId?: string;
  receiptUrl?: string;
  error?: PaymentError;
  metadata?: Record<string, any>;
}

export interface PaymentError {
  code: string;
  message: string;
  details?: any;
  retryable: boolean;
}

// ============================================================================
// LocalStorage State Management
// ============================================================================

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
  INIT = "init",
  METHOD_SELECTION = "method_selection",
  DETAILS_ENTRY = "details_entry",
  PROCESSING = "processing",
  VERIFICATION = "verification",
  COMPLETE = "complete",
  ERROR = "error",
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
  metadata?: Record<string, any>;
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

// ============================================================================
// Supabase Database Models
// ============================================================================

export interface PaymentRecord {
  id: string;
  hp_payment_id?: string;
  business_id: string;
  session_id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  method?: PaymentMethod;
  customer_email?: string;
  customer_ip?: string;
  metadata?: Record<string, any>;
  checkout_data?: CheckoutData;
  hoodpay_response?: any;
  web_payment_response?: any;
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
  payload: any;
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
  request_data?: any;
  response_data?: any;
  created_at: string;
}

// ============================================================================
// Web Payment API Types
// ============================================================================

export interface WebPaymentRequest {
  methodData: PaymentMethodData[];
  details: PaymentDetailsInit;
  options?: PaymentOptions;
}

export interface PaymentMethodData {
  supportedMethods: string;
  data?: any;
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
  data?: any;
}

export interface PaymentOptions {
  requestPayerName?: boolean;
  requestPayerEmail?: boolean;
  requestPayerPhone?: boolean;
  requestShipping?: boolean;
  shippingType?: "shipping" | "delivery" | "pickup";
}

// ============================================================================
// HoodPay Extended Types
// ============================================================================

export interface HoodPayPaymentResponse {
  id: string;
  status: string;
  amount: number;
  currency: string;
  paymentUrl: string;
  expiresAt: string;
  createdAt: string;
  metadata?: Record<string, any>;
}

export interface HoodPayWebhookPayload {
  event: string;
  paymentId: string;
  businessId: string;
  status: string;
  amount: number;
  currency: string;
  timestamp: string;
  data: any;
}

// ============================================================================
// Configuration Types
// ============================================================================

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
    sessionTimeout: number; // milliseconds
    maxRetryAttempts: number;
    retryDelayMs: number;
  };
  webPaymentApi: {
    enabled: boolean;
    supportedNetworks: string[];
    merchantName: string;
  };
}

// ============================================================================
// Service Response Types
// ============================================================================

export interface ServiceResponse<T = any> {
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

// ============================================================================
// Event Types
// ============================================================================

export enum PaymentEventType {
  PAYMENT_CREATED = "payment:created",
  PAYMENT_METHOD_SELECTED = "payment:method_selected",
  PAYMENT_PROCESSING = "payment:processing",
  PAYMENT_COMPLETED = "payment:completed",
  PAYMENT_FAILED = "payment:failed",
  PAYMENT_CANCELLED = "payment:cancelled",
  PAYMENT_EXPIRED = "payment:expired",
  PAYMENT_REFUNDED = "payment:refunded",
}

export interface PaymentEvent {
  type: PaymentEventType;
  paymentId: string;
  timestamp: string;
  data: any;
}

// ============================================================================
// Utility Types
// ============================================================================

export type PaymentCallback = (event: PaymentEvent) => void | Promise<void>;

export interface PaymentHooks {
  onCreated?: PaymentCallback;
  onMethodSelected?: PaymentCallback;
  onProcessing?: PaymentCallback;
  onCompleted?: PaymentCallback;
  onFailed?: PaymentCallback;
  onCancelled?: PaymentCallback;
}
