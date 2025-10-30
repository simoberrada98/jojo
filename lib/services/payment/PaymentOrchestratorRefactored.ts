/**
 * Payment Orchestrator (Refactored)
 * Coordinates payment services following Single Responsibility Principle
 * Each concern delegated to a specialized service
 */

import { generateId } from "@/lib/utils/string";
import { PAYMENT_CONFIG } from "@/lib/config/payment.config";
import { createPaymentStorage } from "@/lib/services/payment-storage.service";
import { createPaymentDbService } from "@/lib/services/payment-db.service";
import { PaymentStateManager } from "./PaymentStateManager";
import { PaymentHooksManager } from "./PaymentHooksManager";
import { PaymentProcessor } from "./PaymentProcessor";
import { PaymentRecoveryService } from "./PaymentRecoveryService";
import type {
  PaymentIntent,
  PaymentResult,
  PaymentMethod,
  PaymentStatus,
  PaymentStep,
  CheckoutData,
  PaymentHooks,
  PaymentEventType,
} from "@/lib/payment/types";

export class PaymentOrchestratorRefactored {
  private stateManager: PaymentStateManager;
  private hooksManager: PaymentHooksManager;
  private processor: PaymentProcessor;
  private recoveryService: PaymentRecoveryService;
  private businessId: string;

  constructor(config: {
    businessId?: string;
    supabaseUrl?: string;
    supabaseKey?: string;
    hooks?: PaymentHooks;
  }) {
    this.businessId = config.businessId || PAYMENT_CONFIG.hoodpay.businessId;

    // Initialize storage
    const storage = createPaymentStorage();

    // Initialize database service (optional)
    const dbService = config.supabaseUrl && config.supabaseKey
      ? createPaymentDbService(config.supabaseUrl, config.supabaseKey)
      : undefined;

    // Initialize specialized services
    this.stateManager = new PaymentStateManager(storage);
    this.hooksManager = new PaymentHooksManager(config.hooks);
    this.processor = new PaymentProcessor(dbService);
    this.recoveryService = new PaymentRecoveryService(storage);
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
      id: generateId("intent"),
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

    // Initialize state
    this.stateManager.initializeSession(paymentIntent, checkoutData);

    // Create database record
    await this.processor.createDatabaseRecord(
      this.businessId,
      paymentIntent.id,
      amount,
      currency,
      {
        customerEmail: options?.customerEmail,
        metadata: options?.metadata,
        checkoutData,
      }
    );

    // Trigger created hook
    await this.hooksManager.triggerCreated({
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
    const state = this.stateManager.getCurrentState();

    if (!state) {
      return {
        success: false,
        paymentId: "",
        status: PaymentStatus.FAILED,
        error: {
          code: "NO_SESSION",
          message: "No active payment session",
          retryable: false,
        },
      };
    }

    // Update step to processing
    this.stateManager.updateStep(PaymentStep.PROCESSING);

    // Trigger processing hook
    await this.hooksManager.triggerProcessing({
      type: PaymentEventType.PAYMENT_PROCESSING,
      paymentId: state.paymentIntent.id,
      timestamp: new Date().toISOString(),
      data: { method },
    });

    // Process payment
    const result = await this.processor.process(method, state, paymentData);

    // Update state based on result
    if (result.success) {
      this.stateManager.markCompleted(result.transactionId);
      await this.processor.updateDatabaseStatus(
        state.paymentIntent.id,
        PaymentStatus.COMPLETED
      );

      await this.hooksManager.triggerCompleted({
        type: PaymentEventType.PAYMENT_COMPLETED,
        paymentId: state.paymentIntent.id,
        timestamp: new Date().toISOString(),
        data: result,
      });
    } else {
      this.stateManager.markFailed(result.error!);
      await this.processor.updateDatabaseStatus(
        state.paymentIntent.id,
        PaymentStatus.FAILED,
        result.error
      );

      await this.hooksManager.triggerFailed({
        type: PaymentEventType.PAYMENT_FAILED,
        paymentId: state.paymentIntent.id,
        timestamp: new Date().toISOString(),
        data: result,
      });
    }

    return result;
  }

  /**
   * Cancel payment
   */
  async cancelPayment(reason?: string): Promise<void> {
    const state = this.stateManager.getCurrentState();
    if (!state) return;

    this.stateManager.updateStatus(PaymentStatus.CANCELLED);
    await this.processor.updateDatabaseStatus(
      state.paymentIntent.id,
      PaymentStatus.CANCELLED
    );

    await this.hooksManager.triggerCancelled({
      type: PaymentEventType.PAYMENT_CANCELLED,
      paymentId: state.paymentIntent.id,
      timestamp: new Date().toISOString(),
      data: { reason },
    });

    this.stateManager.clearState();
  }

  /**
   * Get current payment state
   */
  getCurrentState() {
    return this.stateManager.getCurrentState();
  }

  /**
   * Recover from interrupted payment
   */
  async recoverPayment(): Promise<PaymentIntent | null> {
    return this.recoveryService.recoverPayment();
  }

  /**
   * Check if payment can be recovered
   */
  canRecover() {
    return this.recoveryService.validateRecovery();
  }

  /**
   * Get recovery metadata
   */
  getRecoveryMetadata() {
    return this.recoveryService.getRecoveryMetadata();
  }
}

/**
 * Factory function to create orchestrator
 */
export function createPaymentOrchestrator(config: {
  businessId?: string;
  supabaseUrl?: string;
  supabaseKey?: string;
  hooks?: PaymentHooks;
}): PaymentOrchestratorRefactored {
  return new PaymentOrchestratorRefactored(config);
}
