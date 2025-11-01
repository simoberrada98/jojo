/**
 * Payment State Manager
 * Single Responsibility: Manage payment state lifecycle
 */

import { PaymentStorageService } from '@/lib/services/payment-storage.service'
import type {
  PaymentIntent,
  PaymentStep,
  PaymentStatus,
  CheckoutData,
  PaymentError
} from '@/types/payment'

export class PaymentStateManager {
  constructor(private storage: PaymentStorageService) {}

  /**
   * Initialize a new payment session
   */
  initializeSession(paymentIntent: PaymentIntent, checkoutData?: CheckoutData) {
    return this.storage.initializeSession(paymentIntent, checkoutData)
  }

  /**
   * Update payment step
   */
  updateStep(step: PaymentStep): boolean {
    return this.storage.updateStep(step)
  }

  /**
   * Mark payment as completed
   */
  markCompleted(transactionId?: string): boolean {
    return this.storage.markCompleted(transactionId)
  }

  /**
   * Mark payment as failed
   */
  markFailed(error: PaymentError): boolean {
    return this.storage.markFailed(error)
  }

  /**
   * Record payment error
   */
  recordError(error: PaymentError): boolean {
    return this.storage.recordError(error)
  }

  /**
   * Get current payment state
   */
  getCurrentState() {
    return this.storage.loadState()
  }

  /**
   * Check if payment can be retried
   */
  canRetry(maxAttempts?: number): boolean {
    return this.storage.canRetry(maxAttempts)
  }

  /**
   * Clear payment state
   */
  clearState(): void {
    this.storage.clearState()
  }

  /**
   * Update payment status
   */
  updateStatus(status: PaymentStatus): boolean {
    const state = this.storage.loadState()
    if (!state) return false

    return this.storage.updatePaymentIntent({ status })
  }

  /**
   * Get session info
   */
  getSessionInfo() {
    return this.storage.getSessionInfo()
  }
}
