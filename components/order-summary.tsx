"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"

interface OrderSummaryProps {
  onProceed: (data: any) => void
}

const CART_ITEMS = [
  {
    id: 1,
    name: "ProMiner X1000",
    price: 2.5,
    quantity: 1,
    image: "/placeholder.svg?key=vofbb",
  },
]

export default function OrderSummary({ onProceed }: OrderSummaryProps) {
  const [items, setItems] = useState(CART_ITEMS)

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = 0.1
  const tax = (subtotal + shipping) * 0.08
  const total = subtotal + shipping + tax

  const handleRemoveItem = (id: number) => {
    setItems(items.filter((item) => item.id !== id))
  }

  const handleProceed = () => {
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
          <h3 className="text-lg font-bold text-foreground">Order Items</h3>
        </div>
        <div className="divide-y divide-border">
          {items.map((item) => (
            <div key={item.id} className="p-6 flex gap-4">
              <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="font-semibold text-foreground mb-1">{item.name}</h4>
                <p className="text-sm text-foreground/60 mb-2">Quantity: {item.quantity}</p>
                <p className="font-semibold text-accent">{item.price} BTC</p>
              </div>
              <button
                onClick={() => handleRemoveItem(item.id)}
                className="text-foreground/60 hover:text-destructive transition"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing Summary */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-bold text-foreground mb-4">Pricing Summary</h3>
        <div className="space-y-3 mb-6 pb-6 border-b border-border">
          <div className="flex justify-between text-sm">
            <span className="text-foreground/70">Subtotal</span>
            <span className="text-foreground">{subtotal.toFixed(2)} BTC</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-foreground/70">Shipping</span>
            <span className="text-foreground">{shipping.toFixed(2)} BTC</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-foreground/70">Tax (8%)</span>
            <span className="text-foreground">{tax.toFixed(2)} BTC</span>
          </div>
        </div>
        <div className="flex justify-between items-center mb-6">
          <span className="font-semibold text-foreground">Total</span>
          <div>
            <div className="text-2xl font-bold text-accent">{total.toFixed(2)} BTC</div>
            <div className="text-xs text-foreground/60">≈ ${(total * 34000).toLocaleString()}</div>
          </div>
        </div>
        <Button
          onClick={handleProceed}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
        >
          Proceed to Payment
        </Button>
      </div>
    </div>
  )
}
