/**
 * Web Payment API Strategy
 * Handles payments through browser Web Payment API
 */

import { BasePaymentStrategy } from './payment-strategy.interface'
import { webPaymentService } from '@/lib/payment/webPaymentApi'
import type { PaymentResult, PaymentLocalState } from '@/types/payment'

export class WebPaymentStrategy extends BasePaymentStrategy {
  getName(): string {
    return 'Web Payment API'
  }

  isAvailable(): boolean {
    return webPaymentService.isAvailable()
  }

  validate(paymentData?: any): { valid: boolean; error?: string } {
    if (!this.isAvailable()) {
      return {
        valid: false,
        error: 'Web Payment API not available in this browser'
      }
    }
    return { valid: true }
  }

  async process(
    state: PaymentLocalState,
    paymentData?: any
  ): Promise<PaymentResult> {
    const validation = this.validate(paymentData)
    if (!validation.valid) {
      return this.createErrorResult(
        state.paymentIntent.id,
        'WEB_PAYMENT_NOT_AVAILABLE',
        validation.error!,
        false
      )
    }

    if (!state.checkoutData) {
      return this.createErrorResult(
        state.paymentIntent.id,
        'MISSING_CHECKOUT_DATA',
        'Checkout data is required for Web Payment API',
        false
      )
    }

    try {
      return await webPaymentService.processPayment(state.checkoutData)
    } catch (error: any) {
      return this.createErrorResult(
        state.paymentIntent.id,
        'WEB_PAYMENT_ERROR',
        error.message || 'Web Payment API failed',
        true
      )
    }
  }
}
