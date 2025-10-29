import type { DisplayProduct } from "@/lib/types/product"

export const SHIPPING_COST = 50 // USD
export const TAX_RATE = 0.08 // 8%

export interface CartItem extends DisplayProduct {
  quantity: number
}

export interface PricingSummary {
  subtotal: number
  shipping: number
  tax: number
  total: number
}

export function calculatePricing(items: CartItem[]): PricingSummary {
  const subtotal = items.reduce((sum, item) => sum + item.priceUSD * item.quantity, 0)
  const shipping = items.length > 0 ? SHIPPING_COST : 0
  const tax = (subtotal + shipping) * TAX_RATE
  const total = subtotal + shipping + tax

  return {
    subtotal,
    shipping,
    tax,
    total,
  }
}
