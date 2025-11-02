/**
 * Payment Storage Service (Refactored)
 * Removed Singleton pattern, uses factory function for dependency injection
 * Testable and follows SOLID principles
 */

import { APP_CONFIG, STORAGE_KEYS } from '@/lib/config/app.config';
import {
  PaymentStep,
  PaymentStatus,
  type PaymentLocalState,
  type PaymentIntent,
  type CheckoutData,
  type PaymentError,
} from '@/types/payment';
import { generateId } from '@/lib/utils/string';
import { logger } from '@/lib/utils/logger';

/**
 * Storage interface for dependency injection
 */
export interface StorageAdapter {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  keys(): string[];
}

/**
 * Browser localStorage adapter
 */
class BrowserStorageAdapter implements StorageAdapter {
  private get storage(): Storage | null {
    if (typeof window === 'undefined' || !window.localStorage) {
      return null;
    }
    return window.localStorage;
  }

  getItem(key: string): string | null {
    const storage = this.storage;
    if (!storage) return null;

    try {
      return storage.getItem(key);
    } catch {
      return null;
    }
  }

  setItem(key: string, value: string): void {
    const storage = this.storage;
    if (!storage) return;

    try {
      storage.setItem(key, value);
    } catch (error) {
      logger.error('Failed to save to storage', error as Error);
    }
  }

  removeItem(key: string): void {
    const storage = this.storage;
    if (!storage) return;

    try {
      storage.removeItem(key);
    } catch (error) {
      logger.error('Failed to remove from storage', error as Error);
    }
  }

  keys(): string[] {
    const storage = this.storage;
    if (!storage) return [];

    try {
      return Object.keys(storage);
    } catch {
      return [];
    }
  }
}

/**
 * PaymentStorageService - Refactored without singleton
 * Accepts storage adapter for testability
 */
export class PaymentStorageService {
  private storage: StorageAdapter;
  private sessionTimeout: number;

  constructor(
    storage: StorageAdapter = new BrowserStorageAdapter(),
    sessionTimeout: number = APP_CONFIG.session.timeoutMs
  ) {
    this.storage = storage;
    this.sessionTimeout = sessionTimeout;
    if (this.hasStorage()) {
      this.cleanupExpiredSessions();
    }
  }

  private hasStorage(): boolean {
    return (
      typeof window !== 'undefined' &&
      typeof window.localStorage !== 'undefined'
    );
  }

  /**
   * Check if storage is available
   */
  isAvailable(): boolean {
    if (!this.hasStorage()) {
      return false;
    }

    try {
      const test = '__storage_test__';
      this.storage.setItem(test, test);
      this.storage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Generate a unique session ID
   */
  generateSessionId(): string {
    return generateId('session');
  }

  /**
   * Save payment state to storage
   */
  saveState(state: PaymentLocalState): boolean {
    if (!this.isAvailable()) {
      logger.warn('Storage not available');
      return false;
    }

    try {
      const stateWithTimestamp = {
        ...state,
        timestamp: new Date().toISOString(),
      };

      this.storage.setItem(
        STORAGE_KEYS.paymentState,
        JSON.stringify(stateWithTimestamp)
      );

      // Save to recovery backup
      this.saveRecoveryPoint(stateWithTimestamp);

      return true;
    } catch (error) {
      logger.error('Failed to save payment state', error as Error);
      return false;
    }
  }

  /**
   * Load payment state from storage
   */
  loadState(): PaymentLocalState | null {
    if (!this.isAvailable()) {
      return null;
    }

    try {
      const stored = this.storage.getItem(STORAGE_KEYS.paymentState);
      if (!stored) {
        return null;
      }

      const state: PaymentLocalState = JSON.parse(stored);

      // Check if session has expired
      if (this.isSessionExpired(state.timestamp)) {
        logger.warn('Payment session expired');
        this.clearState();
        return null;
      }

      return state;
    } catch (error) {
      logger.error('Failed to load payment state', error as Error);
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
      this.storage.removeItem(STORAGE_KEYS.paymentState);
      this.storage.removeItem(STORAGE_KEYS.paymentRecovery);
    } catch (error) {
      logger.error('Failed to clear payment state', error as Error);
    }
  }

  /**
   * Check if session has expired
   */
  private isSessionExpired(timestamp: string): boolean {
    const sessionTime = new Date(timestamp).getTime();
    const now = Date.now();
    return now - sessionTime > this.sessionTimeout;
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
      this.storage.setItem(
        STORAGE_KEYS.paymentRecovery,
        JSON.stringify(recoveryData)
      );
    } catch (error) {
      logger.error('Failed to save recovery point', error as Error);
    }
  }

  /**
   * Load recovery point
   */
  private loadRecoveryPoint(): PaymentLocalState | null {
    try {
      const stored = this.storage.getItem(STORAGE_KEYS.paymentRecovery);
      if (!stored) {
        return null;
      }

      const recoveryData = JSON.parse(stored);

      if (this.isSessionExpired(recoveryData.savedAt)) {
        this.storage.removeItem(STORAGE_KEYS.paymentRecovery);
        return null;
      }

      return recoveryData.state;
    } catch (error) {
      logger.error('Failed to load recovery point', error as Error);
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
      const keys = this.storage.keys();
      const now = Date.now();
      const prefix = APP_CONFIG.session.storagePrefix;

      keys.forEach((key) => {
        if (key.startsWith(prefix)) {
          try {
            const data = JSON.parse(this.storage.getItem(key) || '{}');
            if (data.timestamp) {
              const timestamp = new Date(data.timestamp).getTime();
              if (now - timestamp > this.sessionTimeout) {
                this.storage.removeItem(key);
              }
            }
          } catch {
            // Invalid data, remove it
            this.storage.removeItem(key);
          }
        }
      });
    } catch (error) {
      logger.error('Failed to cleanup expired sessions', error as Error);
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
    const expiresAt = new Date(timestamp + this.sessionTimeout).toISOString();

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
  canRetry(maxAttempts: number = APP_CONFIG.retry.maxAttempts): boolean {
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
    const state = this.loadState();
    if (!state) return false;

    return this.updateState({
      currentStep: PaymentStep.COMPLETE,
      paymentIntent: {
        ...state.paymentIntent,
        status: PaymentStatus.COMPLETED,
        metadata: {
          ...state.paymentIntent.metadata,
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
      logger.error('Failed to import state', error as Error);
      return false;
    }
  }
}

/**
 * Factory function to create PaymentStorageService
 * Allows dependency injection for testing
 */
export function createPaymentStorage(
  storage?: StorageAdapter,
  sessionTimeout?: number
): PaymentStorageService {
  return new PaymentStorageService(storage, sessionTimeout);
}

/**
 * Default instance for convenience (can still be tested by passing mock storage)
 */
export const paymentStorage = createPaymentStorage();
