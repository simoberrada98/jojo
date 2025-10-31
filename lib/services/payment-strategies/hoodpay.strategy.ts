/**
 * HoodPay Payment Strategy
 * Handles payments through HoodPay API
 */

import { BasePaymentStrategy } from "./payment-strategy.interface";
import { createPayment } from "@/lib/hoodpayModule";
import { PAYMENT_CONFIG } from "@/lib/config/payment.config";
import type { PaymentResult, PaymentLocalState } from "@/lib/payment/types";

export class HoodPayStrategy extends BasePaymentStrategy {
  private apiKey: string;
  private businessId: string;

  constructor(apiKey?: string, businessId?: string) {
    super();
    this.apiKey = apiKey || PAYMENT_CONFIG.hoodpay.apiKey;
    this.businessId = businessId || PAYMENT_CONFIG.hoodpay.businessId;
  }

  getName(): string {
    return "HoodPay";
  }

  isAvailable(): boolean {
    return !!(this.apiKey && this.businessId);
  }

  validate(paymentData?: any): { valid: boolean; error?: string } {
    if (!this.isAvailable()) {
      return {
        valid: false,
        error: "HoodPay credentials not configured",
      };
    }
    return { valid: true };
  }

  async process(
    state: PaymentLocalState,
    paymentData?: any
  ): Promise<PaymentResult> {
    const validation = this.validate(paymentData);
    if (!validation.valid) {
      return this.createErrorResult(
        state.paymentIntent.id,
        "HOODPAY_NOT_CONFIGURED",
        validation.error!,
        false
      );
    }

    try {
      const hoodpayResponse = await createPayment(
        this.apiKey, // Pass API key
        this.businessId, // Pass Business ID
        {
          currency: state.paymentIntent.currency,
          amount: state.paymentIntent.amount,
          description: state.paymentIntent.description,
          customerEmail: state.paymentIntent.customerEmail,
          ...paymentData,
        }
      );

      return this.createSuccessResult(
        state.paymentIntent.id,
        hoodpayResponse.id,
        hoodpayResponse
      );
    } catch (error: any) {
      return this.createErrorResult(
        state.paymentIntent.id,
        "HOODPAY_ERROR",
        error.message || "HoodPay payment failed",
        true
      );
    }
  }
}
