"use client"

import { Button } from "@/components/ui/button"
import { H3, H4, Muted } from "@/components/ui/typography"
import { Trash2 } from "lucide-react"
import ProductImage from "@/components/product-image"
import { useCart } from "@/lib/contexts/cart-context"
import { useCurrency } from "@/lib/contexts/currency-context"
import { calculatePricing } from "@/lib/utils/pricing"

interface OrderSummaryProps {
  onProceed: (data: any) => void
}

export default function OrderSummary({ onProceed }: OrderSummaryProps) {
  const { items, removeItem } = useCart()
  const { currency, formatPrice } = useCurrency()

  // Calculate totals using shared utility
  const { subtotal, shipping, tax, total } = calculatePricing(items)

  const handleProceed = () => {
    if (items.length === 0) return
    onProceed({
      items,
      subtotal,
      shipping,
      tax,
      total,
      orderId: `ORD-${Date.now()}`,
    })
  }

  return (
    <div className="space-y-6">
      {/* Cart Items */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="p-6 border-b border-border">
          <H3 className="text-lg">Order Items</H3>
        </div>
        <div className="divide-y divide-border">
          {items.length === 0 ? (
            <div className="p-6 text-center text-foreground/60">
              Your cart is empty
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="p-6 flex gap-4">
                <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                  <ProductImage category={item.category} image={item.image} />
                </div>
                <div className="flex-1">
                  <H4 className="font-semibold mb-1">{item.name}</H4>
                  <Muted className="mb-2 m-0">Quantity: {item.quantity}</Muted>
                  <Muted className="font-semibold text-accent m-0">
                    {formatPrice(item.priceUSD * item.quantity)} {currency}
                  </Muted>
                  <Muted className="text-xs m-0">
                    ${(item.priceUSD * item.quantity).toLocaleString()} USD
                  </Muted>
                </div>
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-foreground/60 hover:text-destructive transition"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Pricing Summary */}
      <div className="bg-card border border-border rounded-lg p-6">
        <H3 className="text-lg mb-4">Pricing Summary</H3>
        <div className="space-y-3 mb-6 pb-6 border-b border-border">
          <div className="flex justify-between text-sm">
            <span className="text-foreground/70">Subtotal</span>
            <span className="text-foreground">${subtotal.toLocaleString()} USD</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-foreground/70">Shipping</span>
            <span className="text-foreground">${shipping.toLocaleString()} USD</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-foreground/70">Tax (8%)</span>
            <span className="text-foreground">${tax.toFixed(2)} USD</span>
          </div>
        </div>
        <div className="flex justify-between items-center mb-6">
          <span className="font-semibold text-foreground">Total</span>
          <div className="text-right">
            <div className="text-2xl font-bold text-accent">{formatPrice(total)} {currency}</div>
            <div className="text-xs text-foreground/60">${total.toLocaleString()} USD</div>
          </div>
        </div>
        <Button
          onClick={handleProceed}
          disabled={items.length === 0}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Proceed to Payment
        </Button>
      </div>
    </div>
  )
}
