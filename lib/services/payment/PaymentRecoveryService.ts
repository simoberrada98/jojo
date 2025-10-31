/**
 * Payment Recovery Service
 * Single Responsibility: Handle payment recovery from interruptions
 */

import { PaymentStorageService } from "@/lib/services/payment-storage.service";
import { PaymentStatus, type PaymentIntent } from "@/lib/payment/types";

export class PaymentRecoveryService {
  constructor(private storage: PaymentStorageService) {}

  /**
   * Attempt to recover an interrupted payment
   */
  async recoverPayment(): Promise<PaymentIntent | null> {
    const state = this.storage.loadState();
    if (!state) return null;

    // Check if payment is still valid
    if (this.isPaymentExpired(state.paymentIntent)) {
      this.storage.clearState();
      return null;
    }

    // Check if payment is in a recoverable state
    if (!this.isRecoverable(state.paymentIntent.status)) {
      return null;
    }

    return state.paymentIntent;
  }

  /**
   * Check if payment is expired
   */
  private isPaymentExpired(paymentIntent: PaymentIntent): boolean {
    if (!paymentIntent.expiresAt) return false;

    const expiryTime = new Date(paymentIntent.expiresAt).getTime();
    const now = Date.now();

    return now > expiryTime;
  }

  /**
   * Check if payment status is recoverable
   */
  private isRecoverable(status: PaymentStatus): boolean {
    const recoverableStatuses: PaymentStatus[] = [
      PaymentStatus.PENDING,
      PaymentStatus.PROCESSING,
    ];

    return recoverableStatuses.includes(status);
  }

  /**
   * Check if a session can be resumed
   */
  canResumeSession(): boolean {
    const sessionInfo = this.storage.getSessionInfo();
    return sessionInfo.active;
  }

  /**
   * Get recovery metadata
   */
  getRecoveryMetadata() {
    const state = this.storage.loadState();
    if (!state) return null;

    return {
      sessionId: state.sessionId,
      paymentId: state.paymentIntent.id,
      currentStep: state.currentStep,
      attemptCount: state.attemptCount,
      lastError: state.lastError,
      timestamp: state.timestamp,
    };
  }

  /**
   * Validate recovery eligibility
   */
  validateRecovery(): {
    canRecover: boolean;
    reason?: string;
  } {
    const state = this.storage.loadState();

    if (!state) {
      return {
        canRecover: false,
        reason: "No active payment session found",
      };
    }

    if (this.isPaymentExpired(state.paymentIntent)) {
      return {
        canRecover: false,
        reason: "Payment session has expired",
      };
    }

    if (!this.isRecoverable(state.paymentIntent.status)) {
      return {
        canRecover: false,
        reason: `Payment status ${state.paymentIntent.status} is not recoverable`,
      };
    }

    if (!this.storage.canRetry()) {
      return {
        canRecover: false,
        reason: "Maximum retry attempts exceeded",
      };
    }

    return {
      canRecover: true,
    };
  }

  /**
   * Export state for debugging/support
   */
  exportStateForSupport(): string {
    return this.storage.exportState();
  }
}
