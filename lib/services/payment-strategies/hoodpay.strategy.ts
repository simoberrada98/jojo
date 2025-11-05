/**
 * HoodPay Payment Strategy
 * Handles payments through HoodPay API
 */

import { BasePaymentStrategy } from './payment-strategy.interface';
import {
  createPayment,
  type PaymentCreationRequest,
} from '@/lib/hoodpay';
import { PAYMENT_CONFIG, paymentServerConfig } from '@/lib/config/hoodpay.config';
import type { PaymentResult, PaymentLocalState } from '@/types/payment';

type HoodPayPaymentData = Partial<PaymentCreationRequest>;

export class HoodPayStrategy extends BasePaymentStrategy {
  private apiKey: string | undefined;
  private businessId: string | undefined;

  constructor(apiKey?: string, businessId?: string) {
    super();
    const hoodpayConfig = paymentServerConfig.hoodpay;
    this.apiKey = apiKey ?? hoodpayConfig?.apiKey;
    this.businessId = businessId ?? hoodpayConfig?.businessId;
  }

  getName(): string {
    return 'HoodPay';
  }

  isAvailable(): boolean {
    return !!(this.apiKey && this.businessId);
  }

  validate(paymentData?: HoodPayPaymentData): {
    valid: boolean;
    error?: string;
  } {
    if (!this.isAvailable()) {
      return {
        valid: false,
        error: 'HoodPay credentials not configured',
      };
    }
    return { valid: true };
  }

  async process(
    state: PaymentLocalState,
    paymentData?: HoodPayPaymentData
  ): Promise<PaymentResult> {
    const validation = this.validate(paymentData);
    if (!validation.valid || !this.apiKey || !this.businessId) {
      return this.createErrorResult(
        state.paymentIntent.id,
        'HOODPAY_NOT_CONFIGURED',
        validation.error!,
        false
      );
    }

    try {
      const hoodpayResponse = await createPayment(this.businessId, {
        currency: state.paymentIntent.currency,
        amount: state.paymentIntent.amount,
        ...paymentData,
      });

      return this.createSuccessResult(
        state.paymentIntent.id,
        String(hoodpayResponse.id),
        hoodpayResponse
      );
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'HoodPay payment failed';
      return this.createErrorResult(
        state.paymentIntent.id,
        'HOODPAY_ERROR',
        message,
        true
      );
    }
  }
}
