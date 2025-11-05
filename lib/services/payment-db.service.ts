/**
 * Payment Database Service (Refactored)
 * Simplified with generic operation wrapper - eliminates repetitive code
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { supabaseConfig } from '@/lib/supabase/config';
import { dbOperation } from './db-operation.wrapper';
import {
  PaymentStatus,
  paymentErrorToJson,
  type PaymentRecord,
  type PaymentRecordInsert,
  type PaymentRecordUpdate,
  type WebhookEvent,
  type WebhookEventInsert,
  type WebhookEventUpdate,
  type PaymentAttempt,
  type PaymentAttemptInsert,
  type PaymentMethod,
  type PaymentError,
} from '@/types/payment';
import { type PaginatedResponse, type ServiceResponse } from '@/types/service';
import { toJson } from '@/lib/utils/json';
import type { Json } from '@/types/supabase.types';

export interface PaymentOrderItemPayload {
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface PaymentOrderPayload {
  total_amount?: number;
  currency?: string;
  shipping_address?: Json;
  billing_address?: Json;
  payment_method?: string | null;
  order_items?: PaymentOrderItemPayload[];
}

export interface CompletePaymentResult {
  payment_id: string;
  order_id: string | null;
  status: string;
  already_processed: boolean;
}

/**
 * PaymentDatabaseService - Refactored with DRY principles
 */
export class PaymentDatabaseService {
  private client: SupabaseClient;

  constructor(supabaseUrl?: string, supabaseKey?: string) {
    const url = supabaseUrl || supabaseConfig.url;
    const key = supabaseKey || supabaseConfig.anonKey;

    if (!url || !key) {
      throw new Error('Supabase credentials are required');
    }

    this.client = createClient(url, key);
  }

  /**
   * Create a new payment record
   */
  async createPayment(
    payment: PaymentRecordInsert
  ): Promise<ServiceResponse<PaymentRecord>> {
    const now = new Date().toISOString();
    const payload: PaymentRecordInsert = {
      ...payment,
      created_at: payment.created_at ?? now,
      updated_at: payment.updated_at ?? now,
    };

    return dbOperation(
      () => this.client.from('payments').insert(payload).select().single(),
      'DB_CREATE_ERROR',
      'Failed to create payment record'
    );
  }

  /**
   * Update payment record
   */
  async updatePayment(
    paymentId: string,
    updates: PaymentRecordUpdate
  ): Promise<ServiceResponse<PaymentRecord>> {
    const now = new Date().toISOString();
    const payload: PaymentRecordUpdate = {
      ...updates,
      updated_at: updates.updated_at ?? now,
    };

    return dbOperation(
      () =>
        this.client
          .from('payments')
          .update(payload)
          .eq('id', paymentId)
          .select()
          .single(),
      'DB_UPDATE_ERROR',
      'Failed to update payment record'
    );
  }

  /**
   * Get payment by ID
   */
  async getPayment(paymentId: string): Promise<ServiceResponse<PaymentRecord>> {
    return dbOperation(
      () =>
        this.client.from('payments').select('*').eq('id', paymentId).single(),
      'DB_READ_ERROR',
      'Failed to fetch payment record'
    );
  }

  /**
   * Get payment by HoodPay payment ID
   */
  async getPaymentByHoodPayId(
    hpPaymentId: string
  ): Promise<ServiceResponse<PaymentRecord>> {
    return dbOperation(
      () =>
        this.client
          .from('payments')
          .select('*')
          .eq('hp_payment_id', hpPaymentId)
          .single(),
      'DB_READ_ERROR',
      'Failed to fetch payment by HoodPay ID'
    );
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
      let query = this.client.from('payments').select('*', { count: 'exact' });

      // Apply filters
      if (filters.businessId)
        query = query.eq('business_id', filters.businessId);
      if (filters.status) query = query.eq('status', filters.status);
      if (filters.method) query = query.eq('method', filters.method);
      if (filters.startDate) query = query.gte('created_at', filters.startDate);
      if (filters.endDate) query = query.lte('created_at', filters.endDate);

      // Apply pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to).order('created_at', { ascending: false });

      const { data, error, count } = await query;

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
    } catch (error: unknown) {
      const normalizedError =
        error instanceof Error ? error : new Error('Failed to fetch payments');
      return {
        success: false,
        error: {
          code: 'DB_QUERY_ERROR',
          message: normalizedError.message || 'Failed to fetch payments',
          details: toJson(error),
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
    event: WebhookEventInsert
  ): Promise<ServiceResponse<WebhookEvent>> {
    const now = new Date().toISOString();
    const payload: WebhookEventInsert = {
      ...event,
      processed: event.processed ?? false,
      verified: event.verified ?? false,
      retry_count: event.retry_count ?? 0,
      received_at: event.received_at ?? now,
    };

    return dbOperation(
      () =>
        this.client.from('webhook_events').insert(payload).select().single(),
      'DB_CREATE_ERROR',
      'Failed to create webhook event'
    );
  }

  /**
   * Update webhook event
   */
  async updateWebhookEvent(
    eventId: string,
    updates: WebhookEventUpdate
  ): Promise<ServiceResponse<WebhookEvent>> {
    return dbOperation(
      () =>
        this.client
          .from('webhook_events')
          .update(updates)
          .eq('id', eventId)
          .select()
          .single(),
      'DB_UPDATE_ERROR',
      'Failed to update webhook event'
    );
  }

  /**
   * Record payment attempt
   */
  async createPaymentAttempt(
    attempt: PaymentAttemptInsert
  ): Promise<ServiceResponse<PaymentAttempt>> {
    const now = new Date().toISOString();
    const payload: PaymentAttemptInsert = {
      ...attempt,
      created_at: attempt.created_at ?? now,
    };

    return dbOperation(
      () =>
        this.client.from('payment_attempts').insert(payload).select().single(),
      'DB_CREATE_ERROR',
      'Failed to create payment attempt'
    );
  }

  /**
   * Get payment attempts for a payment
   */
  async getPaymentAttempts(
    paymentId: string
  ): Promise<ServiceResponse<PaymentAttempt[]>> {
    return dbOperation(
      () =>
        this.client
          .from('payment_attempts')
          .select('*')
          .eq('payment_id', paymentId)
          .order('attempt_number', { ascending: true }),
      'DB_QUERY_ERROR',
      'Failed to fetch payment attempts'
    );
  }

  /**
   * Update payment status
   */
  async updatePaymentStatus(
    paymentId: string,
    status: PaymentStatus,
    error?: PaymentError
  ): Promise<ServiceResponse<PaymentRecord>> {
    const now = new Date().toISOString();
    const updates: PaymentRecordUpdate = {
      status,
      updated_at: now,
    };

    if (status === PaymentStatus.COMPLETED) {
      updates.completed_at = now;
    }

    if (error) {
      updates.error_log = [paymentErrorToJson(error)];
    }

    return this.updatePayment(paymentId, updates);
  }

  /**
   * Upsert payment by HoodPay ID
   */
  async upsertPaymentByHoodPayId(
    hpPaymentId: string,
    paymentData: PaymentRecordInsert
  ): Promise<ServiceResponse<PaymentRecord>> {
    const now = new Date().toISOString();
    const payload: PaymentRecordInsert = {
      ...paymentData,
      hp_payment_id: hpPaymentId,
      created_at: paymentData.created_at ?? now,
      updated_at: paymentData.updated_at ?? now,
    };

    return dbOperation(
      () =>
        this.client
          .from('payments')
          .upsert(payload, {
            onConflict: 'hp_payment_id',
          })
          .select()
          .single(),
      'DB_UPSERT_ERROR',
      'Failed to upsert payment'
    );
  }

  /**
   * Complete payment and optionally create order within a single transaction
   */
  async completePaymentWithOrder(params: {
    paymentId: string;
    userId?: string;
    orderPayload?: PaymentOrderPayload;
    metadataPatch?: Record<string, Json>;
  }): Promise<ServiceResponse<CompletePaymentResult>> {
    const { paymentId, userId, orderPayload, metadataPatch } = params;
    const startTime = Date.now();

    try {
      const { data, error } = await this.client.rpc(
        'complete_payment_with_order',
        {
          p_payment_id: paymentId,
          p_user_id: userId ?? null,
          p_order_payload: toJson(orderPayload ?? {}),
          p_metadata_patch: toJson(metadataPatch ?? {}),
        }
      );

      if (error) throw error;

      const payload = (data ?? {}) as Partial<CompletePaymentResult>;

      if (!payload.payment_id) {
        throw new Error('Transaction did not return a payment_id');
      }

      return {
        success: true,
        data: {
          payment_id: payload.payment_id,
          order_id: payload.order_id ?? null,
          status: payload.status ?? PaymentStatus.COMPLETED,
          already_processed: payload.already_processed ?? false,
        },
        metadata: {
          timestamp: new Date().toISOString(),
          duration: Date.now() - startTime,
        },
      };
    } catch (error: unknown) {
      const normalizedError =
        error instanceof Error ? error : new Error('Failed to finalize payment');

      return {
        success: false,
        error: {
          code: 'DB_TRANSACTION_ERROR',
          message: normalizedError.message,
          details: toJson(error),
          retryable: false,
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
 * Create payment database service instance
 */
export function createPaymentDbService(
  supabaseUrl?: string,
  supabaseKey?: string
): PaymentDatabaseService {
  return new PaymentDatabaseService(supabaseUrl, supabaseKey);
}
