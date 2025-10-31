"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import PageLayout from "@/components/layout/PageLayout"
import OrderTracking from "@/components/order/OrderTracking"
import { Button } from "@/components/ui/button"
import { CheckCircle, Download, Mail, ArrowRight, Package } from "lucide-react"
import { useCart } from "@/lib/contexts/cart-context"
import { useCurrency } from "@/lib/contexts/currency-context"
import { calculatePricing } from "@/lib/utils/pricing"
import ProductImage from "@/components/product-image"
import { generateInvoicePDF } from "@/lib/utils/invoice"

function ThankYouContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { items, clearCart } = useCart()
  const { currency, formatPrice } = useCurrency()
  const [orderNumber, setOrderNumber] = useState<string>("")
  const [email, setEmail] = useState<string>("")
  
  // Get order details from URL or generate
  useEffect(() => {
    const orderId = searchParams.get("order") || `MH-${Date.now().toString(36).toUpperCase()}`
    const userEmail = searchParams.get("email") || localStorage.getItem("checkout_email") || ""
    
    setOrderNumber(orderId)
    setEmail(userEmail)
    
    // Clear cart after successful order
    if (items.length > 0 && searchParams.get("order")) {
      clearCart()
    }
  }, [searchParams, items, clearCart])
  
  const { subtotal, shipping, tax, total } = calculatePricing(items)
  const estimatedDelivery = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
  
  const handleDownloadInvoice = () => {
    if (items.length === 0) {
      alert('No items found. Please complete an order first.');
      return;
    }
    
    generateInvoicePDF({
      orderNumber,
      date: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      email: email || 'customer@example.com',
      items,
      subtotal,
      shipping,
      tax,
      total,
      currency,
      estimatedDelivery,
    });
  }

  return (
    <PageLayout>
      <main className="flex-1 pt-20">
        <section className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Success Icon */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-success/20 mb-6">
              <CheckCircle className="w-12 h-12 text-success" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Order Confirmed!</h1>
            <p className="text-lg text-muted-foreground">
              Thank you for your purchase. Your mining hardware is being prepared for shipment.
            </p>
          </div>

          {/* Order Details Card */}
          <div className="bg-card border border-border rounded-lg p-8 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Order Number</p>
                <p className="text-2xl font-bold text-foreground font-mono">{orderNumber}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Estimated Delivery</p>
                <p className="text-2xl font-bold text-foreground">{estimatedDelivery}</p>
              </div>
            </div>

            {/* Order Items */}
            {items.length > 0 && (
              <div className="border-t border-border pt-8 mb-8">
                <h3 className="text-lg font-semibold text-foreground mb-4">Order Items</h3>
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                        <ProductImage category={item.category} image={item.image} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground">{item.name}</h4>
                        <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                        <p className="text-sm font-medium text-accent">
                          ${(item.priceUSD * item.quantity).toLocaleString()} USD
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="border-t border-border pt-8">
              <h3 className="text-lg font-semibold text-foreground mb-4">Order Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-foreground">Subtotal</span>
                  <span className="text-foreground font-medium">${subtotal.toLocaleString()} USD</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-foreground">Shipping</span>
                  <span className="text-foreground font-medium">${shipping.toLocaleString()} USD</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-foreground">Tax</span>
                  <span className="text-foreground font-medium">${tax.toFixed(2)} USD</span>
                </div>
                <div className="border-t border-border pt-3 flex justify-between items-center">
                  <span className="text-lg font-bold text-foreground">Total</span>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-accent">{formatPrice(total)} {currency}</div>
                    <div className="text-sm text-muted-foreground">${total.toLocaleString()} USD</div>
                  </div>
                </div>
              </div>
              {email && (
                <div className="mt-6 p-4 rounded-lg bg-primary/10 border border-primary/20">
                  <p className="text-sm text-foreground">
                    <Mail className="w-4 h-4 inline mr-2" />
                    Confirmation sent to: <span className="font-semibold">{email}</span>
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Order Tracking */}
          <OrderTracking orderNumber={orderNumber} />

          {/* Next Steps */}
          <div className=" border border-border rounded-lg p-8 mb-8">
            <h3 className="text-lg font-semibold text-foreground mb-6">What's Next?</h3>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-accent text-accent-foreground font-semibold text-sm">
                    1
                  </div>
                </div>
                <div>
                  <p className="font-medium text-foreground">Confirmation Email</p>
                  <p className="text-sm text-muted-foreground">
                    Check your email for order confirmation and tracking details
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-accent text-accent-foreground font-semibold text-sm">
                    2
                  </div>
                </div>
                <div>
                  <p className="font-medium text-foreground">Preparation</p>
                  <p className="text-sm text-muted-foreground">
                    Your hardware will be tested and prepared for shipment within 24-48 hours
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-accent text-accent-foreground font-semibold text-sm">
                    3
                  </div>
                </div>
                <div>
                  <p className="font-medium text-foreground">Shipment</p>
                  <p className="text-sm text-muted-foreground">
                    Track your package in real-time with the provided tracking number
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <Button 
              onClick={handleDownloadInvoice}
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Invoice
            </Button>
            <Link href="/dashboard/orders" className="w-full">
              <Button variant="outline" className="w-full bg-transparent">
                <Package className="w-4 h-4 mr-2" />
                View All Orders
              </Button>
            </Link>
          </div>

          {/* Continue Shopping */}
          <div className="text-center">
            <p className="text-muted-foreground mb-4">Ready to expand your mining operation?</p>
            <Link href="/collection">
              <Button variant="ghost" className="text-accent hover:text-accent hover:bg-accent/10">
                Continue Shopping
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </section>
      </main>
    </PageLayout>
  )
}

export default function ThankYouPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    }>
      <ThankYouContent />
    </Suspense>
  )
}
