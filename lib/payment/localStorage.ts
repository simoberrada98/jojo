/**
 * Production-grade localStorage manager for payment state
 * Handles persistence, recovery, and expiration of payment sessions
 */

import {
  PaymentLocalState,
  PaymentIntent,
  PaymentStep,
  PaymentStatus,
  CheckoutData,
  PaymentError,
} from "./types";

const STORAGE_PREFIX = "jhuangnyc_hp_payment_";
const STATE_KEY = `${STORAGE_PREFIX}state`;
const SESSION_KEY = `${STORAGE_PREFIX}session`;
const RECOVERY_KEY = `${STORAGE_PREFIX}recovery`;

// Session expiration: 30 minutes
const SESSION_TIMEOUT_MS = 30 * 60 * 1000;

/**
 * PaymentStorage - Manages payment state in localStorage with recovery
 */
export class PaymentStorage {
  private static instance: PaymentStorage;

  private constructor() {
    this.cleanupExpiredSessions();
  }

  static getInstance(): PaymentStorage {
    if (!PaymentStorage.instance) {
      PaymentStorage.instance = new PaymentStorage();
    }
    return PaymentStorage.instance;
  }

  /**
   * Check if localStorage is available
   */
  private isAvailable(): boolean {
    try {
      const test = "__storage_test__";
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Generate a unique session ID
   */
  generateSessionId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Save payment state to localStorage
   */
  saveState(state: PaymentLocalState): boolean {
    if (!this.isAvailable()) {
      console.warn("localStorage not available");
      return false;
    }

    try {
      const stateWithTimestamp = {
        ...state,
        timestamp: new Date().toISOString(),
      };

      localStorage.setItem(STATE_KEY, JSON.stringify(stateWithTimestamp));

      // Save to recovery backup
      this.saveRecoveryPoint(stateWithTimestamp);

      return true;
    } catch (error) {
      console.error("Failed to save payment state:", error);
      return false;
    }
  }

  /**
   * Load payment state from localStorage
   */
  loadState(): PaymentLocalState | null {
    if (!this.isAvailable()) {
      return null;
    }

    try {
      const stored = localStorage.getItem(STATE_KEY);
      if (!stored) {
        return null;
      }

      const state: PaymentLocalState = JSON.parse(stored);

      // Check if session has expired
      if (this.isSessionExpired(state.timestamp)) {
        console.warn("Payment session expired");
        this.clearState();
        return null;
      }

      return state;
    } catch (error) {
      console.error("Failed to load payment state:", error);
      return this.loadRecoveryPoint();
    }
  }

  /**
   * Update specific fields in the payment state
   */
  updateState(updates: Partial<PaymentLocalState>): boolean {
    const currentState = this.loadState();
    if (!currentState) {
      return false;
    }

    const newState: PaymentLocalState = {
      ...currentState,
      ...updates,
      timestamp: new Date().toISOString(),
    };

    return this.saveState(newState);
  }

  /**
   * Update payment intent within the state
   */
  updatePaymentIntent(updates: Partial<PaymentIntent>): boolean {
    const currentState = this.loadState();
    if (!currentState) {
      return false;
    }

    const updatedIntent: PaymentIntent = {
      ...currentState.paymentIntent,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    return this.updateState({ paymentIntent: updatedIntent });
  }

  /**
   * Update current payment step
   */
  updateStep(step: PaymentStep): boolean {
    return this.updateState({ currentStep: step });
  }

  /**
   * Update checkout data
   */
  updateCheckoutData(data: CheckoutData): boolean {
    return this.updateState({ checkoutData: data });
  }

  /**
   * Record a payment error
   */
  recordError(error: PaymentError): boolean {
    const currentState = this.loadState();
    if (!currentState) {
      return false;
    }

    return this.updateState({
      lastError: error,
      attemptCount: currentState.attemptCount + 1,
    });
  }

  /**
   * Clear payment state
   */
  clearState(): void {
    if (!this.isAvailable()) {
      return;
    }

    try {
      localStorage.removeItem(STATE_KEY);
    } catch (error) {
      console.error("Failed to clear payment state:", error);
    }
  }

  /**
   * Check if session has expired
   */
  private isSessionExpired(timestamp: string): boolean {
    const sessionTime = new Date(timestamp).getTime();
    const now = Date.now();
    return now - sessionTime > SESSION_TIMEOUT_MS;
  }

  /**
   * Save recovery point for crash recovery
   */
  private saveRecoveryPoint(state: PaymentLocalState): void {
    try {
      const recoveryData = {
        state,
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem(RECOVERY_KEY, JSON.stringify(recoveryData));
    } catch (error) {
      console.error("Failed to save recovery point:", error);
    }
  }

  /**
   * Load recovery point
   */
  private loadRecoveryPoint(): PaymentLocalState | null {
    try {
      const stored = localStorage.getItem(RECOVERY_KEY);
      if (!stored) {
        return null;
      }

      const recoveryData = JSON.parse(stored);

      if (this.isSessionExpired(recoveryData.savedAt)) {
        localStorage.removeItem(RECOVERY_KEY);
        return null;
      }

      return recoveryData.state;
    } catch (error) {
      console.error("Failed to load recovery point:", error);
      return null;
    }
  }

  /**
   * Clean up expired sessions
   */
  private cleanupExpiredSessions(): void {
    if (!this.isAvailable()) {
      return;
    }

    try {
      const keys = Object.keys(localStorage);
      const now = Date.now();

      keys.forEach((key) => {
        if (key.startsWith(STORAGE_PREFIX)) {
          try {
            const data = JSON.parse(localStorage.getItem(key) || "{}");
            if (data.timestamp) {
              const timestamp = new Date(data.timestamp).getTime();
              if (now - timestamp > SESSION_TIMEOUT_MS) {
                localStorage.removeItem(key);
              }
            }
          } catch {
            // Invalid data, remove it
            localStorage.removeItem(key);
          }
        }
      });
    } catch (error) {
      console.error("Failed to cleanup expired sessions:", error);
    }
  }

  /**
   * Get session info
   */
  getSessionInfo(): {
    active: boolean;
    sessionId?: string;
    expiresAt?: string;
  } {
    const state = this.loadState();
    if (!state) {
      return { active: false };
    }

    const timestamp = new Date(state.timestamp).getTime();
    const expiresAt = new Date(timestamp + SESSION_TIMEOUT_MS).toISOString();

    return {
      active: true,
      sessionId: state.sessionId,
      expiresAt,
    };
  }

  /**
   * Initialize new payment session
   */
  initializeSession(
    paymentIntent: PaymentIntent,
    checkoutData?: CheckoutData
  ): PaymentLocalState {
    const sessionId = this.generateSessionId();

    const initialState: PaymentLocalState = {
      sessionId,
      paymentIntent,
      currentStep: PaymentStep.INIT,
      attemptCount: 0,
      checkoutData,
      timestamp: new Date().toISOString(),
    };

    this.saveState(initialState);
    return initialState;
  }

  /**
   * Resume existing session or create new one
   */
  resumeOrInitialize(
    paymentIntent: PaymentIntent,
    checkoutData?: CheckoutData
  ): PaymentLocalState {
    const existingState = this.loadState();

    // If existing session is valid and for the same payment, resume it
    if (existingState && existingState.paymentIntent.id === paymentIntent.id) {
      return existingState;
    }

    // Otherwise, start fresh
    return this.initializeSession(paymentIntent, checkoutData);
  }

  /**
   * Check if payment can be retried
   */
  canRetry(maxAttempts: number = 3): boolean {
    const state = this.loadState();
    if (!state) {
      return true;
    }

    return state.attemptCount < maxAttempts;
  }

  /**
   * Mark payment as completed
   */
  markCompleted(transactionId?: string): boolean {
    return this.updateState({
      currentStep: PaymentStep.COMPLETE,
      paymentIntent: {
        ...this.loadState()!.paymentIntent,
        status: PaymentStatus.COMPLETED,
        metadata: {
          ...this.loadState()!.paymentIntent.metadata,
          transactionId,
        },
      },
    });
  }

  /**
   * Mark payment as failed
   */
  markFailed(error: PaymentError): boolean {
    const currentState = this.loadState();
    if (!currentState) {
      return false;
    }

    return this.updateState({
      currentStep: PaymentStep.ERROR,
      lastError: error,
      paymentIntent: {
        ...currentState.paymentIntent,
        status: PaymentStatus.FAILED,
      },
    });
  }

  /**
   * Export state for debugging
   */
  exportState(): string {
    const state = this.loadState();
    return JSON.stringify(state, null, 2);
  }

  /**
   * Import state (for testing/recovery)
   */
  importState(stateJson: string): boolean {
    try {
      const state: PaymentLocalState = JSON.parse(stateJson);
      return this.saveState(state);
    } catch (error) {
      console.error("Failed to import state:", error);
      return false;
    }
  }
}

// Export singleton instance
export const paymentStorage = PaymentStorage.getInstance();

// Helper functions for common operations
export const initPaymentSession = (
  paymentIntent: PaymentIntent,
  checkoutData?: CheckoutData
): PaymentLocalState => {
  return paymentStorage.initializeSession(paymentIntent, checkoutData);
};

export const getPaymentState = (): PaymentLocalState | null => {
  return paymentStorage.loadState();
};

export const updatePaymentStep = (step: PaymentStep): boolean => {
  return paymentStorage.updateStep(step);
};

export const clearPaymentSession = (): void => {
  paymentStorage.clearState();
};

export const canRetryPayment = (maxAttempts?: number): boolean => {
  return paymentStorage.canRetry(maxAttempts);
};
