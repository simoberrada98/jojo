/**
 * Payment Processor
 * Single Responsibility: Process payments using strategies
 */

import {
  paymentStrategyRegistry,
  type PaymentStrategyInput,
} from '@/lib/services/payment-strategies';
import type { PaymentDatabaseService } from '@/lib/services/payment-db.service';
import {
  PaymentStatus,
  paymentErrorToJson,
  type PaymentMethod,
  type PaymentResult,
  type PaymentLocalState,
  type PaymentError,
  type CheckoutData,
} from '@/types/payment';
import { logger } from '@/lib/utils/logger';
import type { Json } from '@/types/supabase.types';
import { toJson } from '@/lib/utils/json';

const serializeError = (error: unknown): Json =>
  toJson(
    error instanceof Error
      ? {
          name: error.name,
          message: error.message,
          stack: error.stack ?? null,
        }
      : error
  );

export class PaymentProcessor {
  constructor(private dbService?: PaymentDatabaseService) {}

  /**
   * Process payment using the appropriate strategy
   */
  async process(
    method: PaymentMethod,
    state: PaymentLocalState,
    paymentData?: PaymentStrategyInput
  ): Promise<PaymentResult> {
    // Get strategy for payment method
    const strategy = paymentStrategyRegistry.getStrategy(method);

    if (!strategy) {
      return {
        success: false,
        paymentId: state.paymentIntent.id,
        status: PaymentStatus.FAILED,
        error: {
          code: 'UNSUPPORTED_METHOD',
          message: `Payment method ${method} not supported`,
          retryable: false,
        },
      };
    }

    // Check if strategy is available
    if (!strategy.isAvailable()) {
      return {
        success: false,
        paymentId: state.paymentIntent.id,
        status: PaymentStatus.FAILED,
        error: {
          code: 'METHOD_UNAVAILABLE',
          message: `Payment method ${method} is not available`,
          retryable: false,
        },
      };
    }

    // Validate payment data
    const validation = strategy.validate(paymentData);
    if (!validation.valid) {
      return {
        success: false,
        paymentId: state.paymentIntent.id,
        status: PaymentStatus.FAILED,
        error: {
          code: 'VALIDATION_ERROR',
          message: validation.error || 'Invalid payment data',
          retryable: false,
        },
      };
    }

    // Process payment with strategy
    try {
      const result = await strategy.process(state, paymentData);

      // Record attempt in database if available
      if (this.dbService) {
        await this.recordAttempt(state, method, result, paymentData);
      }

      return result;
    } catch (error: unknown) {
      const normalizedError =
        error instanceof Error ? error : new Error('Payment processing failed');
      const errorResult: PaymentResult = {
        success: false,
        paymentId: state.paymentIntent.id,
        status: PaymentStatus.FAILED,
        error: {
          code: 'PROCESSING_ERROR',
          message: normalizedError.message || 'Payment processing failed',
          details: serializeError(error),
          retryable: true,
        },
      };

      // Record failed attempt
      if (this.dbService) {
        await this.recordAttempt(state, method, errorResult, paymentData);
      }

      return errorResult;
    }
  }

  /**
   * Record payment attempt in database
   */
  private async recordAttempt(
    state: PaymentLocalState,
    method: PaymentMethod,
    result: PaymentResult,
    paymentData?: PaymentStrategyInput
  ): Promise<void> {
    if (!this.dbService) return;

    try {
      await this.dbService.createPaymentAttempt({
        payment_id: state.paymentIntent.id,
        attempt_number: state.attemptCount + 1,
        method,
        status: result.status,
        error: result.error ? paymentErrorToJson(result.error) : null,
        request_data: paymentData ? toJson(paymentData) : null,
        response_data: result.metadata ? toJson(result.metadata) : null,
      });
    } catch (error) {
      logger.warn('Failed to record payment attempt', { error });
    }
  }

  /**
   * Update payment status in database
   */
  async updateDatabaseStatus(
    paymentId: string,
    status: PaymentStatus,
    error?: PaymentError
  ): Promise<void> {
    if (!this.dbService) return;

    try {
      await this.dbService.updatePaymentStatus(paymentId, status, error);
    } catch (err) {
      logger.warn('Failed to update payment status', { error: err });
    }
  }

  /**
   * Create payment record in database
   */
  async createDatabaseRecord(
    businessId: string,
    sessionId: string,
    amount: number,
    currency: string,
    options?: {
      customerEmail?: string;
      metadata?: Json;
      checkoutData?: CheckoutData;
    }
  ): Promise<void> {
    if (!this.dbService) return;

    try {
      await this.dbService.createPayment({
        business_id: businessId,
        session_id: sessionId,
        amount,
        currency,
        status: PaymentStatus.PENDING,
        customer_email: options?.customerEmail,
        metadata: options?.metadata ?? null,
        checkout_data: options?.checkoutData
          ? toJson(options.checkoutData)
          : null,
      });
    } catch (error) {
      logger.warn('Failed to save payment to database', { error });
    }
  }
}
