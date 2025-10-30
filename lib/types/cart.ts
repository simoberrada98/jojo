import type { DisplayProduct } from "./product";

/**
 * Cart item interface
 * Single source of truth for cart items across the application
 */
export interface CartItem extends DisplayProduct {
  quantity: number;
}

/**
 * Cart summary totals
 */
export interface CartSummary {
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  itemCount: number;
}
