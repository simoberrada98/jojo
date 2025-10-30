/**
 * Payment Hooks Manager
 * Single Responsibility: Manage payment event hooks and callbacks
 */

import type { PaymentHooks, PaymentEvent } from "@/lib/payment/types";

export class PaymentHooksManager {
  constructor(private hooks?: PaymentHooks) {}

  /**
   * Trigger a specific hook
   */
  async trigger(hookName: keyof PaymentHooks, event: PaymentEvent): Promise<void> {
    const hook = this.hooks?.[hookName];
    if (!hook) return;

    try {
      await hook(event);
    } catch (error) {
      console.error(`Hook ${hookName} failed:`, error);
      // Don't throw - hooks should not break the payment flow
    }
  }

  /**
   * Trigger onCreated hook
   */
  async triggerCreated(event: PaymentEvent): Promise<void> {
    return this.trigger("onCreated", event);
  }

  /**
   * Trigger onProcessing hook
   */
  async triggerProcessing(event: PaymentEvent): Promise<void> {
    return this.trigger("onProcessing", event);
  }

  /**
   * Trigger onCompleted hook
   */
  async triggerCompleted(event: PaymentEvent): Promise<void> {
    return this.trigger("onCompleted", event);
  }

  /**
   * Trigger onFailed hook
   */
  async triggerFailed(event: PaymentEvent): Promise<void> {
    return this.trigger("onFailed", event);
  }

  /**
   * Trigger onCancelled hook
   */
  async triggerCancelled(event: PaymentEvent): Promise<void> {
    return this.trigger("onCancelled", event);
  }

  /**
   * Register new hooks
   */
  registerHooks(hooks: PaymentHooks): void {
    this.hooks = { ...this.hooks, ...hooks };
  }

  /**
   * Check if a hook is registered
   */
  hasHook(hookName: keyof PaymentHooks): boolean {
    return !!this.hooks?.[hookName];
  }
}
