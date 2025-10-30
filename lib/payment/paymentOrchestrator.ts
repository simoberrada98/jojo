/**
 * Payment Orchestrator - Main integration layer
 * Combines HoodPay, Web Payment API, Supabase, and localStorage
 */

import { createPayment } from '../hoodpayModule';
import { paymentStorage } from './localStorage';
import { webPaymentService } from './webPaymentApi';
import { createPaymentService as createDbService } from './supabaseService';
import {
  PaymentIntent,
  PaymentResult,
  PaymentStatus,
  PaymentMethod,
  PaymentStep,
  CheckoutData,
  PaymentHooks,
  PaymentEventType,
  PaymentError,
} from './types';

export class PaymentOrchestrator {
  private dbService: ReturnType<typeof createDbService>;
  private apiKey: string;
  private businessId: string;
  private hooks?: PaymentHooks;

  constructor(config: {
    apiKey: string;
    businessId: string;
    supabaseUrl: string;
    supabaseKey: string;
    hooks?: PaymentHooks;
  }) {
    this.apiKey = config.apiKey;
    this.businessId = config.businessId;
    try {
      this.dbService = createDbService(config.supabaseUrl, config.supabaseKey);
    } catch (error) {
      console.warn('Failed to initialize Supabase service:', error);
      // Create a dummy service that logs warnings instead of throwing
      this.dbService = null as any;
    }
    this.hooks = config.hooks;
  }

  /**
   * Initialize a new payment session
   */
  async initializePayment(
    amount: number,
    currency: string,
    checkoutData?: CheckoutData,
    options?: {
      customerEmail?: string;
      description?: string;
      metadata?: Record<string, any>;
    }
  ): Promise<PaymentIntent> {
    const paymentIntent: PaymentIntent = {
      id: `intent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      businessId: this.businessId,
      amount,
      currency,
      description: options?.description,
      customerEmail: options?.customerEmail,
      metadata: options?.metadata,
      status: PaymentStatus.PENDING,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Initialize localStorage state
    paymentStorage.initializeSession(paymentIntent, checkoutData);

    // Create payment record in Supabase (if available)
    if (this.dbService) {
      try {
        await this.dbService.createPayment({
          business_id: this.businessId,
          session_id: paymentStorage.generateSessionId(),
          amount,
          currency,
          status: PaymentStatus.PENDING,
          customer_email: options?.customerEmail,
          metadata: options?.metadata,
          checkout_data: checkoutData,
        });
      } catch (error) {
        console.warn('Failed to save payment to database:', error);
      }
    }

    // Trigger onCreate hook
    await this.triggerHook('onCreated', {
      type: PaymentEventType.PAYMENT_CREATED,
      paymentId: paymentIntent.id,
      timestamp: new Date().toISOString(),
      data: paymentIntent,
    });

    return paymentIntent;
  }

  /**
   * Process payment with selected method
   */
  async processPayment(
    method: PaymentMethod,
    paymentData?: any
  ): Promise<PaymentResult> {
    const state = paymentStorage.loadState();
    if (!state) {
      return {
        success: false,
        paymentId: '',
        status: PaymentStatus.FAILED,
        error: {
          code: 'NO_SESSION',
          message: 'No active payment session',
          retryable: false,
        },
      };
    }

    // Update step to processing
    paymentStorage.updateStep(PaymentStep.PROCESSING);

    // Trigger processing hook
    await this.triggerHook('onProcessing', {
      type: PaymentEventType.PAYMENT_PROCESSING,
      paymentId: state.paymentIntent.id,
      timestamp: new Date().toISOString(),
      data: { method },
    });

    let result: PaymentResult;

    try {
      switch (method) {
        case PaymentMethod.WEB_PAYMENT_API:
          result = await this.processWebPayment(state.checkoutData!);
          break;
        case PaymentMethod.HOODPAY:
        case PaymentMethod.CRYPTO:
          result = await this.processHoodPayPayment(state, paymentData);
          break;
        default:
          result = {
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

      // Record attempt
      if (this.dbService) {
        try {
          await this.dbService.createPaymentAttempt({
            payment_id: state.paymentIntent.id,
            attempt_number: state.attemptCount + 1,
            method,
            status: result.status,
            error: result.error,
            request_data: paymentData,
            response_data: result.metadata,
          });
        } catch (error) {
          console.warn('Failed to record payment attempt:', error);
        }
      }

      // Update payment status
      if (result.success) {
        paymentStorage.markCompleted(result.transactionId);
        if (this.dbService) {
          try {
            await this.dbService.updatePaymentStatus(
              state.paymentIntent.id,
              PaymentStatus.COMPLETED
            );
          } catch (error) {
            console.warn('Failed to update payment status:', error);
          }
        }

        await this.triggerHook('onCompleted', {
          type: PaymentEventType.PAYMENT_COMPLETED,
          paymentId: state.paymentIntent.id,
          timestamp: new Date().toISOString(),
          data: result,
        });
      } else {
        paymentStorage.markFailed(result.error!);
        if (this.dbService) {
          try {
            await this.dbService.updatePaymentStatus(
              state.paymentIntent.id,
              PaymentStatus.FAILED,
              result.error
            );
          } catch (error) {
            console.warn('Failed to update payment status:', error);
          }
        }

        await this.triggerHook('onFailed', {
          type: PaymentEventType.PAYMENT_FAILED,
          paymentId: state.paymentIntent.id,
          timestamp: new Date().toISOString(),
          data: result,
        });
      }

      return result;
    } catch (error: any) {
      const paymentError: PaymentError = {
        code: 'PROCESSING_ERROR',
        message: error.message || 'Payment processing failed',
        details: error,
        retryable: true,
      };

      paymentStorage.recordError(paymentError);

      return {
        success: false,
        paymentId: state.paymentIntent.id,
        status: PaymentStatus.FAILED,
        error: paymentError,
      };
    }
  }

  /**
   * Process payment via Web Payment API
   */
  private async processWebPayment(
    checkoutData: CheckoutData
  ): Promise<PaymentResult> {
    if (!webPaymentService.isAvailable()) {
      return {
        success: false,
        paymentId: '',
        status: PaymentStatus.FAILED,
        error: {
          code: 'WEB_PAYMENT_NOT_AVAILABLE',
          message: 'Web Payment API not available',
          retryable: false,
        },
      };
    }

    return await webPaymentService.processPayment(checkoutData);
  }

  /**
   * Process payment via HoodPay
   */
  private async processHoodPayPayment(
    state: any,
    paymentData: any
  ): Promise<PaymentResult> {
    try {
      const hoodpayResponse = await createPayment(
        this.apiKey,
        this.businessId,
        {
          currency: state.paymentIntent.currency,
          amount: state.paymentIntent.amount,
          description: state.paymentIntent.description,
          customerEmail: state.paymentIntent.customerEmail,
          ...paymentData,
        }
      );

      // Update database with HoodPay response
      if (this.dbService) {
        try {
          await this.dbService.updatePayment(state.paymentIntent.id, {
            hp_payment_id: hoodpayResponse.id,
            hoodpay_response: hoodpayResponse,
          });
        } catch (error) {
          console.warn('Failed to update payment in database:', error);
        }
      }

      return {
        success: true,
        paymentId: state.paymentIntent.id,
        status: PaymentStatus.COMPLETED,
        transactionId: hoodpayResponse.id,
        metadata: hoodpayResponse,
      };
    } catch (error: any) {
      return {
        success: false,
        paymentId: state.paymentIntent.id,
        status: PaymentStatus.FAILED,
        error: {
          code: 'HOODPAY_ERROR',
          message: error.message || 'HoodPay payment failed',
          details: error,
          retryable: true,
        },
      };
    }
  }

  /**
   * Cancel payment
   */
  async cancelPayment(reason?: string): Promise<void> {
    const state = paymentStorage.loadState();
    if (!state) return;

    paymentStorage.updateState({
      currentStep: PaymentStep.ERROR,
      paymentIntent: {
        ...state.paymentIntent,
        status: PaymentStatus.CANCELLED,
      },
    });

    if (this.dbService) {
      try {
        await this.dbService.updatePaymentStatus(
          state.paymentIntent.id,
          PaymentStatus.CANCELLED
        );
      } catch (error) {
        console.warn('Failed to update payment status:', error);
      }
    }

    await this.triggerHook('onCancelled', {
      type: PaymentEventType.PAYMENT_CANCELLED,
      paymentId: state.paymentIntent.id,
      timestamp: new Date().toISOString(),
      data: { reason },
    });

    paymentStorage.clearState();
  }

  /**
   * Get current payment state
   */
  getCurrentState() {
    return paymentStorage.loadState();
  }

  /**
   * Trigger event hook
   */
  private async triggerHook(
    hookName: keyof PaymentHooks,
    event: any
  ): Promise<void> {
    const hook = this.hooks?.[hookName];
    if (hook) {
      try {
        await hook(event);
      } catch (error) {
        console.error(`Hook ${hookName} failed:`, error);
      }
    }
  }

  /**
   * Recover from interrupted payment
   */
  async recoverPayment(): Promise<PaymentIntent | null> {
    const state = paymentStorage.loadState();
    if (!state) return null;

    // Check if payment is still valid
    if (
      state.paymentIntent.expiresAt &&
      new Date(state.paymentIntent.expiresAt) < new Date()
    ) {
      paymentStorage.clearState();
      return null;
    }

    return state.paymentIntent;
  }
}

/**
 * Create payment orchestrator instance
 */
export function createPaymentOrchestrator(config: {
  apiKey?: string;
  businessId?: string;
  supabaseUrl?: string;
  supabaseKey?: string;
  hooks?: PaymentHooks;
}): PaymentOrchestrator {
  const apiKey = config.apiKey || process.env.HOODPAY_API_KEY || '';
  const businessId = config.businessId || process.env.HOODPAY_BUSINESS_ID || '';
  const supabaseUrl =
    config.supabaseUrl || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey =
    config.supabaseKey || process.env.SUPABASE_SERVICE_ROLE_KEY || '';

  if (!apiKey || !businessId) {
    console.warn('HoodPay credentials not configured. Payment processing will not work.');
  }
  
  if (!supabaseUrl || !supabaseKey) {
    console.warn('Supabase credentials not configured. Payment tracking will not work.');
  }

  return new PaymentOrchestrator({
    apiKey,
    businessId,
    supabaseUrl,
    supabaseKey,
    hooks: config.hooks,
  });
}
