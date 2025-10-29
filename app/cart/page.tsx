"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Trash2, Plus, Minus, ShoppingCart } from "lucide-react"
import ProductImage from "@/components/product-image"
import { useCart } from "@/lib/contexts/cart-context"
import { useCurrency } from "@/lib/contexts/currency-context"
import Header from "@/components/header"
import Footer from "@/components/footer"

export default function CartPage() {
  const { items: cartItems, updateQuantity, removeItem, itemCount, total: cartTotal } = useCart()
  const { currency, formatPrice } = useCurrency()
  const [isLoading, setIsLoading] = useState(false)

  // Calculate totals in USD
  const subtotal = cartItems.reduce((sum, item) => sum + item.priceUSD * item.quantity, 0)
  const shipping = cartItems.length > 0 ? 50 : 0
  const tax = (subtotal + shipping) * 0.08
  const total = subtotal + shipping + tax

  const handleCheckout = () => {
    setIsLoading(true)
    setTimeout(() => {
      window.location.href = "/checkout"
    }, 500)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header cartCount={itemCount} />
      <main className="pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="flex items-center gap-2 text-accent hover:text-accent/80 transition mb-6">
            <ArrowLeft className="w-4 h-4" />
            Continue Shopping
          </Link>
          <h1 className="text-4xl font-bold text-foreground">Shopping Cart</h1>
        </div>

        {cartItems.length === 0 ? (
          // Empty Cart State
          <div className="bg-card border border-border rounded-lg p-12 text-center">
            <ShoppingCart className="w-16 h-16 text-foreground/30 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">Your cart is empty</h2>
            <p className="text-foreground/70 mb-6">Add some mining hardware to get started!</p>
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
                    <h3 className="text-lg font-bold text-foreground mb-2">{item.name}</h3>
                    <p className="text-sm text-foreground/60 mb-4">
                      {formatPrice(item.priceUSD)} {currency} (${item.priceUSD.toLocaleString()} USD)
                    </p>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-2 rounded-lg bg-background border border-border hover:border-accent transition"
                      >
                        <Minus className="w-4 h-4 text-foreground" />
                      </button>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) =>
                          updateQuantity(item.id, Math.max(1, Number.parseInt(e.target.value) || 1))
                        }
                        className="w-12 text-center px-2 py-1 rounded-lg bg-background border border-border text-foreground"
                      />
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-2 rounded-lg bg-background border border-border hover:border-accent transition"
                      >
                        <Plus className="w-4 h-4 text-foreground" />
                      </button>
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
                    <div>
                      <div className="text-xl font-bold text-accent">
                        {formatPrice(item.priceUSD * item.quantity)} {currency}
                      </div>
                      <div className="text-xs text-foreground/60">
                        ${(item.priceUSD * item.quantity).toLocaleString()} USD
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-card border border-border rounded-lg p-6 sticky top-24">
                <h3 className="text-lg font-bold text-foreground mb-6">Order Summary</h3>

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
                    <div className="text-right">
                      <div className="text-2xl font-bold text-accent">{formatPrice(total)} {currency}</div>
                      <div className="text-xs text-foreground/60">${total.toLocaleString()} USD</div>
                    </div>
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
                  <p className="text-xs text-foreground/70">
                    All transactions are secured with crypto payment verification. Your order is protected.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      </main>
      <Footer />
    </div>
  )
}
