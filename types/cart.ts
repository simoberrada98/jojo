import type { DisplayProduct } from './product';

/**
 * Cart item with quantity. Shared between hooks, contexts, and services.
 */
export interface CartItem extends DisplayProduct {
  quantity: number;
}

/**
 * Summary totals for cart/order calculations.
 */
export interface CartSummary {
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  itemCount: number;
}
