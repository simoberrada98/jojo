/**
 * Payment Strategy Registry
 * Manages registration and selection of payment strategies
 */

import type { PaymentStrategy } from './payment-strategy.interface';
import { HoodPayStrategy } from './hoodpay.strategy';
import { WebPaymentStrategy } from './web-payment.strategy';
import { PaymentMethod } from '@/types/payment';

/**
 * Registry for payment strategies
 * Follows Open/Closed Principle - easy to add new strategies
 */
export class PaymentStrategyRegistry {
  private strategies = new Map<PaymentMethod, PaymentStrategy>();

  constructor() {
    // Register default strategies
    this.registerDefaults();
  }

  /**
   * Register default payment strategies
   */
  private registerDefaults(): void {
    this.register(PaymentMethod.HOODPAY, new HoodPayStrategy());
    this.register(PaymentMethod.CRYPTO, new HoodPayStrategy()); // Same as HoodPay
    this.register(PaymentMethod.WEB_PAYMENT_API, new WebPaymentStrategy());
  }

  /**
   * Register a payment strategy
   */
  register(method: PaymentMethod, strategy: PaymentStrategy): void {
    this.strategies.set(method, strategy);
  }

  /**
   * Get strategy for payment method
   */
  getStrategy(method: PaymentMethod): PaymentStrategy | undefined {
    return this.strategies.get(method);
  }

  /**
   * Get all available strategies
   */
  getAvailableStrategies(): Array<{
    method: PaymentMethod;
    strategy: PaymentStrategy;
  }> {
    return Array.from(this.strategies.entries())
      .filter(([_, strategy]) => strategy.isAvailable())
      .map(([method, strategy]) => ({ method, strategy }));
  }

  /**
   * Check if a payment method is available
   */
  isMethodAvailable(method: PaymentMethod): boolean {
    const strategy = this.strategies.get(method);
    return strategy ? strategy.isAvailable() : false;
  }

  /**
   * Unregister a strategy
   */
  unregister(method: PaymentMethod): void {
    this.strategies.delete(method);
  }

  /**
   * Clear all strategies
   */
  clear(): void {
    this.strategies.clear();
  }
}

/**
 * Default registry instance
 */
export const paymentStrategyRegistry = new PaymentStrategyRegistry();

/**
 * Factory function to create custom registry
 */
export function createPaymentStrategyRegistry(): PaymentStrategyRegistry {
  return new PaymentStrategyRegistry();
}
