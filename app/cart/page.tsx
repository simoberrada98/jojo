"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { H1, H2, H3, Muted } from "@/components/ui/typography"
import { ArrowLeft, Trash2, Plus, Minus, ShoppingCart } from "lucide-react"
import ProductImage from "@/components/product-image"
import PriceDisplay from "@/components/ui/PriceDisplay"
import { useCart } from "@/lib/contexts/cart-context"
import { calculatePricing } from "@/lib/utils/pricing"
import PageLayout from "@/components/layout/PageLayout"

export default function CartPage() {
  const { items: cartItems, updateQuantity, removeItem } = useCart()
  const [isLoading, setIsLoading] = useState(false)

  // Calculate totals using shared utility
  const { subtotal, shipping, tax, total } = calculatePricing(cartItems)

  const handleCheckout = () => {
    setIsLoading(true)
    setTimeout(() => {
      window.location.href = "/checkout"
    }, 500)
  }

  return (
    <PageLayout>
      <main className="pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="flex items-center gap-2 text-accent hover:text-accent/80 transition mb-6">
            <ArrowLeft className="w-4 h-4" />
            Continue Shopping
          </Link>
          <H1>Shopping Cart</H1>
        </div>

        {cartItems.length === 0 ? (
          // Empty Cart State
          <div className="bg-card border border-border rounded-lg p-12 text-center">
            <ShoppingCart className="w-16 h-16 text-foreground/30 mx-auto mb-4" />
            <H2 className="mb-2">Your cart is empty</H2>
            <Muted className="mb-6 m-0">Add some mining hardware to get started!</Muted>
            <Link href="/">
              <Button className="bg-primary hover:bg-primary/90">Continue Shopping</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="bg-card border border-border rounded-lg p-6 flex gap-6">
                  {/* Product Image */}
                  <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                    <ProductImage category={item.category} image={item.image} />
                  </div>

                  {/* Product Details */}
                  <div className="flex-1">
                    <H3 className="text-lg mb-2">{item.name}</H3>
                    <Muted className="mb-4 m-0">
                      <PriceDisplay amountUSD={item.priceUSD} className="text-sm text-foreground/60" usdClassName="text-xs text-foreground/50" />
                    </Muted>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="border-border hover:border-accent"
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) =>
                          updateQuantity(item.id, Math.max(1, Number.parseInt(e.target.value) || 1))
                        }
                        className="w-12 text-center px-2 py-1"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="border-border hover:border-accent"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Price and Remove */}
                  <div className="text-right flex flex-col justify-between">
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-foreground/60 hover:text-destructive transition"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                    <PriceDisplay amountUSD={item.priceUSD * item.quantity} vertical />
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-card border border-border rounded-lg p-6 sticky top-24">
                <H3 className="text-lg mb-6">Order Summary</H3>

                {/* Pricing Breakdown */}
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

                {/* Total */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-foreground">Total</span>
                    <PriceDisplay amountUSD={total} className="text-2xl font-bold text-accent" vertical />
                  </div>
                </div>

                {/* Checkout Button */}
                <Button
                  onClick={handleCheckout}
                  disabled={isLoading}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                >
                  {isLoading ? "Processing..." : "Proceed to Checkout"}
                </Button>

                {/* Continue Shopping */}
                <Link href="/">
                  <Button
                    variant="outline"
                    className="w-full mt-3 border-accent text-accent hover:bg-accent/10 bg-transparent"
                  >
                    Continue Shopping
                  </Button>
                </Link>

                {/* Security Info */}
                <div className="mt-6 p-4 rounded-lg bg-primary/10 border border-primary/20">
                  <Muted className="text-xs text-foreground/70 m-0">
                    All transactions are secured with crypto payment verification. Your order is protected.
                  </Muted>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      </main>
    </PageLayout>
  )
}
