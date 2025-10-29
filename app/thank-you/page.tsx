"use client"

import Link from "next/link"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Button } from "@/components/ui/button"
import { CheckCircle, Download, Mail, ArrowRight } from "lucide-react"

export default function ThankYouPage() {
  const orderNumber = "MH-" + Math.random().toString(36).substr(2, 9).toUpperCase()
  const estimatedDelivery = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

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

            <div className="border-t border-border pt-8">
              <h3 className="text-lg font-semibold text-foreground mb-4">Order Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-foreground">Subtotal</span>
                  <span className="text-foreground font-medium">$4,299.00</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-foreground">Shipping</span>
                  <span className="text-foreground font-medium">$49.99</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-foreground">Tax</span>
                  <span className="text-foreground font-medium">$344.00</span>
                </div>
                <div className="border-t border-border pt-3 flex justify-between items-center">
                  <span className="text-lg font-bold text-foreground">Total</span>
                  <span className="text-2xl font-bold text-accent">$4,692.99</span>
                </div>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-card/50 border border-border rounded-lg p-8 mb-8">
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
              <Download className="w-4 h-4 mr-2" />
              Download Invoice
            </Button>
            <Button variant="outline" className="w-full bg-transparent">
              <Mail className="w-4 h-4 mr-2" />
              Resend Confirmation
            </Button>
            <Button variant="outline" className="w-full bg-transparent">
              Track Order
            </Button>
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

      <Footer />
    </div>
  )
}
