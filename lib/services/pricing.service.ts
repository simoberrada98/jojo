import { PRICING_CONFIG } from '@/lib/config/pricing.config';
import {
  getCurrencyDecimals,
  type Currency,
} from '@/lib/config/currency.config';
import type { CartItem, CartSummary } from '@/types/cart';

/**
 * Pricing Service
 * Single source of truth for all pricing calculations
 */
export class PricingService {
  /**
   * Convert USD price to specified currency
   */
  static convertPrice(
    usdPrice: number,
    currency: Currency,
    conversionRates: Record<Currency, number>
  ): number {
    return usdPrice * conversionRates[currency];
  }

  /**
   * Format price with proper decimals and symbol
   */
  static formatPrice(
    usdPrice: number,
    currency: Currency,
    conversionRates: Record<Currency, number>
  ): string {
    const converted = this.convertPrice(usdPrice, currency, conversionRates);
    const decimals = getCurrencyDecimals(currency);

    if (currency === 'USDC') {
      return `$${converted.toFixed(decimals)}`;
    }

    return converted.toFixed(decimals);
  }

  /**
   * Calculate cart subtotal
   */
  static calculateSubtotal(items: CartItem[]): number {
    return items.reduce((sum, item) => sum + item.priceUSD * item.quantity, 0);
  }

  /**
   * Calculate shipping cost
   */
  static calculateShipping(items: CartItem[]): number {
    return items.length > 0 ? PRICING_CONFIG.shipping.standard : 0;
  }

  /**
   * Calculate tax
   */
  static calculateTax(subtotal: number, shipping: number): number {
    return (subtotal + shipping) * PRICING_CONFIG.tax.rate;
  }

  /**
   * Calculate total item count in cart
   */
  static calculateItemCount(items: CartItem[]): number {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }

  /**
   * Calculate complete cart summary with all totals
   */
  static calculateCartSummary(items: CartItem[]): CartSummary {
    const subtotal = this.calculateSubtotal(items);
    const shipping = this.calculateShipping(items);
    const tax = this.calculateTax(subtotal, shipping);
    const total = subtotal + shipping + tax;
    const itemCount = this.calculateItemCount(items);

    return {
      subtotal,
      shipping,
      tax,
      total,
      itemCount,
    };
  }

  /**
   * Calculate cart summary in specific currency
   */
  static calculateCartSummaryInCurrency(
    items: CartItem[],
    currency: Currency,
    conversionRates: Record<Currency, number>
  ): CartSummary & { currency: Currency } {
    const summary = this.calculateCartSummary(items);

    return {
      subtotal: this.convertPrice(summary.subtotal, currency, conversionRates),
      shipping: this.convertPrice(summary.shipping, currency, conversionRates),
      tax: this.convertPrice(summary.tax, currency, conversionRates),
      total: this.convertPrice(summary.total, currency, conversionRates),
      itemCount: summary.itemCount,
      currency,
    };
  }

  /**
   * Format cart total as string
   */
  static formatCartTotal(
    items: CartItem[],
    currency: Currency,
    conversionRates: Record<Currency, number>
  ): string {
    const summary = this.calculateCartSummary(items);
    return this.formatPrice(summary.total, currency, conversionRates);
  }
}
