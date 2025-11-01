/**
 * Supabase payment service layer
 * Handles all database operations for payments with retry logic and error handling
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";
import {
  PaymentRecord,
  WebhookEvent,
  PaymentAttempt,
  PaymentStatus,
  PaymentMethod,
  PaymentError,
  ServiceResponse,
  PaginatedResponse,
  CheckoutData,
} from "./types";

/**
 * PaymentSupabaseService - Manages payment data in Supabase
 */
export class PaymentSupabaseService {
  private client: SupabaseClient;
  private maxRetries: number;
  private retryDelay: number;

  constructor(
    supabaseUrl: string,
    supabaseKey: string,
    maxRetries: number = 3,
    retryDelay: number = 1000
  ) {
    this.client = createClient(supabaseUrl, supabaseKey);
    this.maxRetries = maxRetries;
    this.retryDelay = retryDelay;
  }

  /**
   * Retry wrapper for database operations
   */
  private async withRetry<T>(
    operation: () => Promise<T>,
    retries: number = this.maxRetries
  ): Promise<T> {
    try {
      const result = await operation();
      return result;
    } catch (error) {
      if (retries > 0) {
        await new Promise((resolve) => setTimeout(resolve, this.retryDelay));
        return this.withRetry(operation, retries - 1);
      }
      throw error;
    }
  }

  /**
   * Create a new payment record
   */
  async createPayment(
    payment: Omit<PaymentRecord, "id" | "created_at" | "updated_at">
  ): Promise<ServiceResponse<PaymentRecord>> {
    const startTime = Date.now();

    try {
      const { data, error } = await this.withRetry(async () => {
        return await this.client
          .from("payments")
          .insert({
            ...payment,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();
      });

      if (error) throw error;

      return {
        success: true,
        data,
        metadata: {
          timestamp: new Date().toISOString(),
          duration: Date.now() - startTime,
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: "DB_CREATE_ERROR",
          message: error.message || "Failed to create payment record",
          details: error,
          retryable: true,
        },
        metadata: {
          timestamp: new Date().toISOString(),
          duration: Date.now() - startTime,
        },
      };
    }
  }

  /**
   * Update payment record
   */
  async updatePayment(
    paymentId: string,
    updates: Partial<PaymentRecord>
  ): Promise<ServiceResponse<PaymentRecord>> {
    const startTime = Date.now();

    try {
      const { data, error } = await this.withRetry(async () => {
        return await this.client
          .from("payments")
          .update({
            ...updates,
            updated_at: new Date().toISOString(),
          })
          .eq("id", paymentId)
          .select()
          .single();
      });

      if (error) throw error;

      return {
        success: true,
        data,
        metadata: {
          timestamp: new Date().toISOString(),
          duration: Date.now() - startTime,
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: "DB_UPDATE_ERROR",
          message: error.message || "Failed to update payment record",
          details: error,
          retryable: true,
        },
        metadata: {
          timestamp: new Date().toISOString(),
          duration: Date.now() - startTime,
        },
      };
    }
  }

  /**
   * Get payment by ID
   */
  async getPayment(paymentId: string): Promise<ServiceResponse<PaymentRecord>> {
    const startTime = Date.now();

    try {
      const { data, error } = await this.withRetry(async () => {
        return await this.client
          .from("payments")
          .select("*")
          .eq("id", paymentId)
          .single();
      });

      if (error) throw error;

      return {
        success: true,
        data,
        metadata: {
          timestamp: new Date().toISOString(),
          duration: Date.now() - startTime,
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: "DB_READ_ERROR",
          message: error.message || "Failed to fetch payment record",
          details: error,
          retryable: true,
        },
        metadata: {
          timestamp: new Date().toISOString(),
          duration: Date.now() - startTime,
        },
      };
    }
  }

  /**
   * Get payment by HoodPay payment ID
   */
  async getPaymentByHoodPayId(
    hpPaymentId: string
  ): Promise<ServiceResponse<PaymentRecord>> {
    const startTime = Date.now();

    try {
      const { data, error } = await this.withRetry(async () => {
        return await this.client
          .from("payments")
          .select("*")
          .eq("hp_payment_id", hpPaymentId)
          .single();
      });

      if (error) throw error;

      return {
        success: true,
        data,
        metadata: {
          timestamp: new Date().toISOString(),
          duration: Date.now() - startTime,
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: "DB_READ_ERROR",
          message: error.message || "Failed to fetch payment by HoodPay ID",
          details: error,
          retryable: true,
        },
        metadata: {
          timestamp: new Date().toISOString(),
          duration: Date.now() - startTime,
        },
      };
    }
  }

  /**
   * Get payments with pagination
   */
  async getPayments(
    filters: {
      businessId?: string;
      status?: PaymentStatus;
      method?: PaymentMethod;
      startDate?: string;
      endDate?: string;
    } = {},
    page: number = 1,
    pageSize: number = 20
  ): Promise<ServiceResponse<PaginatedResponse<PaymentRecord>>> {
    const startTime = Date.now();

    try {
      let query = this.client.from("payments").select("*", { count: "exact" });

      // Apply filters
      if (filters.businessId) {
        query = query.eq("business_id", filters.businessId);
      }
      if (filters.status) {
        query = query.eq("status", filters.status);
      }
      if (filters.method) {
        query = query.eq("method", filters.method);
      }
      if (filters.startDate) {
        query = query.gte("created_at", filters.startDate);
      }
      if (filters.endDate) {
        query = query.lte("created_at", filters.endDate);
      }

      // Apply pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to).order("created_at", { ascending: false });

      const { data, error, count } = await this.withRetry(async () => {
        return await query;
      });

      if (error) throw error;

      const totalPages = count ? Math.ceil(count / pageSize) : 0;

      return {
        success: true,
        data: {
          data: data || [],
          pagination: {
            page,
            pageSize,
            totalPages,
            totalItems: count || 0,
          },
        },
        metadata: {
          timestamp: new Date().toISOString(),
          duration: Date.now() - startTime,
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: "DB_QUERY_ERROR",
          message: error.message || "Failed to fetch payments",
          details: error,
          retryable: true,
        },
        metadata: {
          timestamp: new Date().toISOString(),
          duration: Date.now() - startTime,
        },
      };
    }
  }

  /**
   * Record webhook event
   */
  async createWebhookEvent(
    event: Omit<WebhookEvent, "id" | "received_at">
  ): Promise<ServiceResponse<WebhookEvent>> {
    const startTime = Date.now();

    try {
      const { data, error } = await this.withRetry(async () => {
        return await this.client
          .from("webhook_events")
          .insert({
            ...event,
            received_at: new Date().toISOString(),
          })
          .select()
          .single();
      });

      if (error) throw error;

      return {
        success: true,
        data,
        metadata: {
          timestamp: new Date().toISOString(),
          duration: Date.now() - startTime,
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: "DB_CREATE_ERROR",
          message: error.message || "Failed to create webhook event",
          details: error,
          retryable: true,
        },
        metadata: {
          timestamp: new Date().toISOString(),
          duration: Date.now() - startTime,
        },
      };
    }
  }

  /**
   * Update webhook event
   */
  async updateWebhookEvent(
    eventId: string,
    updates: Partial<WebhookEvent>
  ): Promise<ServiceResponse<WebhookEvent>> {
    const startTime = Date.now();

    try {
      const { data, error } = await this.withRetry(async () => {
        return await this.client
          .from("webhook_events")
          .update(updates)
          .eq("id", eventId)
          .select()
          .single();
      });

      if (error) throw error;

      return {
        success: true,
        data,
        metadata: {
          timestamp: new Date().toISOString(),
          duration: Date.now() - startTime,
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: "DB_UPDATE_ERROR",
          message: error.message || "Failed to update webhook event",
          details: error,
          retryable: true,
        },
        metadata: {
          timestamp: new Date().toISOString(),
          duration: Date.now() - startTime,
        },
      };
    }
  }

  /**
   * Record payment attempt
   */
  async createPaymentAttempt(
    attempt: Omit<PaymentAttempt, "id" | "created_at">
  ): Promise<ServiceResponse<PaymentAttempt>> {
    const startTime = Date.now();

    try {
      const { data, error } = await this.withRetry(async () => {
        return await this.client
          .from("payment_attempts")
          .insert({
            ...attempt,
            created_at: new Date().toISOString(),
          })
          .select()
          .single();
      });

      if (error) throw error;

      return {
        success: true,
        data,
        metadata: {
          timestamp: new Date().toISOString(),
          duration: Date.now() - startTime,
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: "DB_CREATE_ERROR",
          message: error.message || "Failed to create payment attempt",
          details: error,
          retryable: true,
        },
        metadata: {
          timestamp: new Date().toISOString(),
          duration: Date.now() - startTime,
        },
      };
    }
  }

  /**
   * Get payment attempts for a payment
   */
  async getPaymentAttempts(
    paymentId: string
  ): Promise<ServiceResponse<PaymentAttempt[]>> {
    const startTime = Date.now();

    try {
      const { data, error } = await this.withRetry(async () => {
        return await this.client
          .from("payment_attempts")
          .select("*")
          .eq("payment_id", paymentId)
          .order("attempt_number", { ascending: true });
      });

      if (error) throw error;

      return {
        success: true,
        data: data || [],
        metadata: {
          timestamp: new Date().toISOString(),
          duration: Date.now() - startTime,
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: "DB_QUERY_ERROR",
          message: error.message || "Failed to fetch payment attempts",
          details: error,
          retryable: true,
        },
        metadata: {
          timestamp: new Date().toISOString(),
          duration: Date.now() - startTime,
        },
      };
    }
  }

  /**
   * Update payment status
   */
  async updatePaymentStatus(
    paymentId: string,
    status: PaymentStatus,
    error?: PaymentError
  ): Promise<ServiceResponse<PaymentRecord>> {
    const updates: Partial<PaymentRecord> = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (status === PaymentStatus.COMPLETED) {
      updates.completed_at = new Date().toISOString();
    }

    if (error) {
      updates.error_log = updates.error_log || [];
      updates.error_log.push(error);
    }

    return this.updatePayment(paymentId, updates);
  }

  /**
   * Upsert payment by HoodPay ID
   */
  async upsertPaymentByHoodPayId(
    hpPaymentId: string,
    paymentData: Partial<PaymentRecord>
  ): Promise<ServiceResponse<PaymentRecord>> {
    const startTime = Date.now();

    try {
      const { data, error } = await this.withRetry(async () => {
        return await this.client
          .from("payments")
          .upsert(
            {
              hp_payment_id: hpPaymentId,
              ...paymentData,
              updated_at: new Date().toISOString(),
            },
            {
              onConflict: "hp_payment_id",
            }
          )
          .select()
          .single();
      });

      if (error) throw error;

      return {
        success: true,
        data,
        metadata: {
          timestamp: new Date().toISOString(),
          duration: Date.now() - startTime,
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: "DB_UPSERT_ERROR",
          message: error.message || "Failed to upsert payment",
          details: error,
          retryable: true,
        },
        metadata: {
          timestamp: new Date().toISOString(),
          duration: Date.now() - startTime,
        },
      };
    }
  }

  /**
   * Get client for direct access
   */
  getClient(): SupabaseClient {
    return this.client;
  }
}

/**
 * Create payment service instance
 */
type PaymentServiceCache = {
  service: PaymentSupabaseService;
  supabaseUrl: string;
  supabaseKey: string;
};

const globalForPaymentService = globalThis as typeof globalThis & {
  __paymentServiceCache?: PaymentServiceCache;
};

export function createPaymentService(
  supabaseUrl?: string,
  supabaseKey?: string
): PaymentSupabaseService {
  const url = supabaseUrl || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = supabaseKey || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("Supabase credentials are required");
  }

  const cache = globalForPaymentService.__paymentServiceCache;
  if (cache && cache.supabaseUrl === url && cache.supabaseKey === key) {
    return cache.service;
  }

  const service = new PaymentSupabaseService(url, key);

  // Cache the singleton instance outside of tests to avoid cross-test state bleed
  if (process.env.NODE_ENV !== "test") {
    globalForPaymentService.__paymentServiceCache = {
      service,
      supabaseUrl: url,
      supabaseKey: key,
    };
  }

  return service;
}
