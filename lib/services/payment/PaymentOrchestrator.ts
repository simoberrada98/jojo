import { generateId } from '@/lib/utils/string';
import { resolveHoodpayConfig } from '@/lib/config/hoodpay.config';
import { resolveService, Services } from '@/lib/services/service-registry.server';
import { PaymentStateManager } from './PaymentStateManager';
import { PaymentHooksManager } from './PaymentHooksManager';
import { PaymentProcessor } from './PaymentProcessor';
import { PaymentRecoveryService } from './PaymentRecoveryService';
import {
  PaymentStatus,
  PaymentStep,
  PaymentEventType,
  type PaymentIntent,
  type PaymentResult,
  type PaymentMethod,
  type CheckoutData,
  type PaymentHooks,
} from '@/types/payment';
import type { PaymentStrategyInput } from '@/lib/services/payment-strategies';
import type { Json } from '@/types/supabase.types';

export class PaymentOrchestrator {
  private stateManager: PaymentStateManager;
  private hooksManager: PaymentHooksManager;
  private processor: PaymentProcessor;
  private recoveryService: PaymentRecoveryService;
  private businessId: string;

  constructor(config: { businessId?: string; hooks?: PaymentHooks } = {}) {
    const hoodpayConfig = resolveHoodpayConfig();
    const defaultBusinessId = hoodpayConfig?.businessId; // Safely access businessId
    const businessId = config.businessId ?? defaultBusinessId;

    if (!businessId) {
      throw new Error('HOODPAY_BUSINESS_ID is not configured.');
    }

    this.businessId = businessId;

    this.stateManager = resolveService<PaymentStateManager>(
      Services.PAYMENT_STATE_MANAGER
    );
    this.hooksManager = resolveService<PaymentHooksManager>(
      Services.PAYMENT_HOOKS_MANAGER
    );
    this.processor = resolveService<PaymentProcessor>(Services.PAYMENT_PROCESSOR);
    this.recoveryService = resolveService<PaymentRecoveryService>(
      Services.PAYMENT_RECOVERY
    );

    if (config.hooks) {
      this.hooksManager.registerHooks(config.hooks);
    }
  }

  async initializePayment(
    amount: number,
    currency: string,
    checkoutData?: CheckoutData,
    options?: { customerEmail?: string; description?: string; metadata?: Json }
  ): Promise<PaymentIntent> {
    const paymentIntent: PaymentIntent = {
      id: generateId('intent'),
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

    this.stateManager.initializeSession(paymentIntent, checkoutData);

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

    await this.hooksManager.triggerCreated({
      type: PaymentEventType.PAYMENT_CREATED,
      paymentId: paymentIntent.id,
      timestamp: new Date().toISOString(),
      data: paymentIntent,
    });

    return paymentIntent;
  }

  async processPayment(
    method: PaymentMethod,
    paymentData?: PaymentStrategyInput
  ): Promise<PaymentResult> {
    const state = this.stateManager.getCurrentState();

    if (!state) {
      return {
        success: false,
        paymentId: '',
        status: PaymentStatus.FAILED,
        error: { code: 'NO_SESSION', message: 'No active payment session', retryable: false },
      };
    }

    this.stateManager.updateStep(PaymentStep.PROCESSING);

    await this.hooksManager.triggerProcessing({
      type: PaymentEventType.PAYMENT_PROCESSING,
      paymentId: state.paymentIntent.id,
      timestamp: new Date().toISOString(),
      data: { method },
    });

    const result = await this.processor.process(method, state, paymentData);

    if (result.success) {
      this.stateManager.markCompleted(result.transactionId);
      await this.processor.updateDatabaseStatus(state.paymentIntent.id, PaymentStatus.COMPLETED);
      await this.hooksManager.triggerCompleted({
        type: PaymentEventType.PAYMENT_COMPLETED,
        paymentId: state.paymentIntent.id,
        timestamp: new Date().toISOString(),
        data: result,
      });
    } else {
      this.stateManager.markFailed(result.error!);
      await this.processor.updateDatabaseStatus(state.paymentIntent.id, PaymentStatus.FAILED, result.error);
      await this.hooksManager.triggerFailed({
        type: PaymentEventType.PAYMENT_FAILED,
        paymentId: state.paymentIntent.id,
        timestamp: new Date().toISOString(),
        data: result,
      });
    }

    return result;
  }

  async cancelPayment(reason?: string): Promise<void> {
    const state = this.stateManager.getCurrentState();
    if (!state) return;

    this.stateManager.updateStatus(PaymentStatus.CANCELLED);
    await this.processor.updateDatabaseStatus(state.paymentIntent.id, PaymentStatus.CANCELLED);

    await this.hooksManager.triggerCancelled({
      type: PaymentEventType.PAYMENT_CANCELLED,
      paymentId: state.paymentIntent.id,
      timestamp: new Date().toISOString(),
      data: { reason },
    });

    this.stateManager.clearState();
  }

  getCurrentState() {
    return this.stateManager.getCurrentState();
  }

  async recoverPayment(): Promise<PaymentIntent | null> {
    return this.recoveryService.recoverPayment();
  }

  canRecover() {
    return this.recoveryService.validateRecovery();
  }

  getRecoveryMetadata() {
    return this.recoveryService.getRecoveryMetadata();
  }
}

export function createPaymentOrchestrator(
  config: { businessId?: string; hooks?: PaymentHooks } = {}
): PaymentOrchestrator {
  return new PaymentOrchestrator(config);
}
