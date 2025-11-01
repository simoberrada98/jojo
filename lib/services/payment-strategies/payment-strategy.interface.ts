/**
 * Payment Strategy Pattern
 * Replaces switch statement with extensible strategy pattern
 */

import type {
  PaymentResult,
  PaymentLocalState,
  CheckoutData,
} from '@/types/payment';
import { PaymentStatus } from '@/types/payment';

/**
 * Payment Strategy Interface
 * Each payment method implements this interface
 */
export interface PaymentStrategy {
  /**
   * Process payment using this strategy
   */
  process(state: PaymentLocalState, paymentData?: any): Promise<PaymentResult>;

  /**
   * Check if this strategy is available
   */
  isAvailable(): boolean;

  /**
   * Get strategy name
   */
  getName(): string;

  /**
   * Validate payment data for this strategy
   */
  validate(paymentData?: any): { valid: boolean; error?: string };
}

/**
 * Abstract base class for payment strategies
 * Provides common functionality
 */
export abstract class BasePaymentStrategy implements PaymentStrategy {
  abstract process(
    state: PaymentLocalState,
    paymentData?: any
  ): Promise<PaymentResult>;

  abstract getName(): string;

  /**
   * Default implementation - can be overridden
   */
  isAvailable(): boolean {
    return true;
  }

  /**
   * Default implementation - can be overridden
   */
  validate(paymentData?: any): { valid: boolean; error?: string } {
    return { valid: true };
  }

  /**
   * Helper to create error result
   */
  protected createErrorResult(
    paymentId: string,
    code: string,
    message: string,
    retryable: boolean = true
  ): PaymentResult {
    return {
      success: false,
      paymentId,
      status: PaymentStatus.FAILED,
      error: {
        code,
        message,
        retryable,
      },
    };
  }

  /**
   * Helper to create success result
   */
  protected createSuccessResult(
    paymentId: string,
    transactionId: string,
    metadata?: any
  ): PaymentResult {
    return {
      success: true,
      paymentId,
      status: PaymentStatus.COMPLETED,
      transactionId,
      metadata,
    };
  }
}
