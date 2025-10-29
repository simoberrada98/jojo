"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import CryptoPaymentForm from "@/components/crypto-payment-form"
import OrderSummary from "@/components/order-summary"
import { ArrowLeft, Check, Truck, Lock, AlertCircle } from "lucide-react"
import Link from "next/link"

export default function CheckoutPage() {
  const [paymentStep, setPaymentStep] = useState<"shipping" | "review" | "payment" | "confirmation">("shipping")
  const [orderData, setOrderData] = useState<any>(null)
  const [shippingData, setShippingData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "United States",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateShipping = () => {
    const newErrors: Record<string, string> = {}
    if (!shippingData.firstName.trim()) newErrors.firstName = "First name is required"
    if (!shippingData.lastName.trim()) newErrors.lastName = "Last name is required"
    if (!shippingData.email.trim()) newErrors.email = "Email is required"
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shippingData.email)) newErrors.email = "Invalid email"
    if (!shippingData.phone.trim()) newErrors.phone = "Phone is required"
    if (!shippingData.address.trim()) newErrors.address = "Address is required"
    if (!shippingData.city.trim()) newErrors.city = "City is required"
    if (!shippingData.state.trim()) newErrors.state = "State is required"
    if (!shippingData.zipCode.trim()) newErrors.zipCode = "ZIP code is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleShippingSubmit = () => {
    if (validateShipping()) {
      setPaymentStep("review")
    }
  }

  const handleProceedToPayment = (data: any) => {
    setOrderData({ ...data, shippingData })
    setPaymentStep("payment")
  }

  const handlePaymentComplete = () => {
    setPaymentStep("confirmation")
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setShippingData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  return (
    <main className="min-h-screen bg-background pt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link href="/cart" className="flex items-center gap-2 text-accent hover:text-accent/80 transition mb-6">
            <ArrowLeft className="w-4 h-4" />
            Back to Cart
          </Link>
          <h1 className="text-4xl font-bold text-foreground">Checkout</h1>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center gap-2 sm:gap-4 mb-12 overflow-x-auto pb-2">
          {[
            { step: "shipping", label: "Shipping", icon: Truck },
            { step: "review", label: "Review", icon: Check },
            { step: "payment", label: "Payment", icon: Lock },
            { step: "confirmation", label: "Confirmation", icon: Check },
          ].map((item, index) => {
            const Icon = item.icon
            const isActive = paymentStep === item.step
            const isCompleted =
              ["shipping", "review", "payment"].indexOf(paymentStep) >
              ["shipping", "review", "payment"].indexOf(item.step)

            return (
              <div key={item.step} className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold transition ${
                    isActive || isCompleted ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span
                  className={`text-sm font-medium whitespace-nowrap ${isActive ? "text-foreground" : "text-foreground/60"}`}
                >
                  {item.label}
                </span>
                {index < 3 && (
                  <div className={`w-8 sm:w-12 h-1 flex-shrink-0 ${isCompleted ? "bg-primary" : "bg-border"}`} />
                )}
              </div>
            )
          })}
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Shipping Address Form */}
            {paymentStep === "shipping" && (
              <div className="bg-card border border-border rounded-lg p-8 space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">Shipping Address</h2>
                  <p className="text-foreground/60">Enter your delivery address</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      value={shippingData.firstName}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 rounded-lg bg-background border ${
                        errors.firstName ? "border-destructive" : "border-border"
                      } text-foreground focus:outline-none focus:border-accent transition`}
                      placeholder="John"
                    />
                    {errors.firstName && <p className="text-destructive text-sm mt-1">{errors.firstName}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      value={shippingData.lastName}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 rounded-lg bg-background border ${
                        errors.lastName ? "border-destructive" : "border-border"
                      } text-foreground focus:outline-none focus:border-accent transition`}
                      placeholder="Doe"
                    />
                    {errors.lastName && <p className="text-destructive text-sm mt-1">{errors.lastName}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={shippingData.email}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-lg bg-background border ${
                      errors.email ? "border-destructive" : "border-border"
                    } text-foreground focus:outline-none focus:border-accent transition`}
                    placeholder="john@example.com"
                  />
                  {errors.email && <p className="text-destructive text-sm mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={shippingData.phone}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-lg bg-background border ${
                      errors.phone ? "border-destructive" : "border-border"
                    } text-foreground focus:outline-none focus:border-accent transition`}
                    placeholder="+1 (555) 000-0000"
                  />
                  {errors.phone && <p className="text-destructive text-sm mt-1">{errors.phone}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Address</label>
                  <input
                    type="text"
                    name="address"
                    value={shippingData.address}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-lg bg-background border ${
                      errors.address ? "border-destructive" : "border-border"
                    } text-foreground focus:outline-none focus:border-accent transition`}
                    placeholder="123 Main Street"
                  />
                  {errors.address && <p className="text-destructive text-sm mt-1">{errors.address}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">City</label>
                    <input
                      type="text"
                      name="city"
                      value={shippingData.city}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 rounded-lg bg-background border ${
                        errors.city ? "border-destructive" : "border-border"
                      } text-foreground focus:outline-none focus:border-accent transition`}
                      placeholder="New York"
                    />
                    {errors.city && <p className="text-destructive text-sm mt-1">{errors.city}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">State</label>
                    <input
                      type="text"
                      name="state"
                      value={shippingData.state}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 rounded-lg bg-background border ${
                        errors.state ? "border-destructive" : "border-border"
                      } text-foreground focus:outline-none focus:border-accent transition`}
                      placeholder="NY"
                    />
                    {errors.state && <p className="text-destructive text-sm mt-1">{errors.state}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">ZIP Code</label>
                    <input
                      type="text"
                      name="zipCode"
                      value={shippingData.zipCode}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 rounded-lg bg-background border ${
                        errors.zipCode ? "border-destructive" : "border-border"
                      } text-foreground focus:outline-none focus:border-accent transition`}
                      placeholder="10001"
                    />
                    {errors.zipCode && <p className="text-destructive text-sm mt-1">{errors.zipCode}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Country</label>
                  <select
                    name="country"
                    value={shippingData.country}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:border-accent transition"
                  >
                    <option>United States</option>
                    <option>Canada</option>
                    <option>United Kingdom</option>
                    <option>Australia</option>
                    <option>Germany</option>
                    <option>France</option>
                  </select>
                </div>

                <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 flex gap-3">
                  <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-foreground/80">
                    We'll use this address to ship your mining hardware. Ensure all details are correct.
                  </p>
                </div>

                <Button
                  onClick={handleShippingSubmit}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3"
                >
                  Continue to Review
                </Button>
              </div>
            )}

            {/* Order Review */}
            {paymentStep === "review" && (
              <div className="space-y-6">
                {/* Shipping Summary */}
                <div className="bg-card border border-border rounded-lg p-6">
                  <h3 className="text-lg font-bold text-foreground mb-4">Shipping Address</h3>
                  <div className="text-foreground/80 space-y-1">
                    <p>
                      {shippingData.firstName} {shippingData.lastName}
                    </p>
                    <p>{shippingData.address}</p>
                    <p>
                      {shippingData.city}, {shippingData.state} {shippingData.zipCode}
                    </p>
                    <p>{shippingData.country}</p>
                    <p className="text-sm text-foreground/60 mt-3">{shippingData.email}</p>
                    <p className="text-sm text-foreground/60">{shippingData.phone}</p>
                  </div>
                  <Button
                    onClick={() => setPaymentStep("shipping")}
                    variant="outline"
                    className="w-full mt-4 border-accent text-accent hover:bg-accent/10 bg-transparent"
                  >
                    Edit Address
                  </Button>
                </div>

                {/* Order Items */}
                <OrderSummary onProceed={handleProceedToPayment} />
              </div>
            )}

            {/* Payment */}
            {paymentStep === "payment" && (
              <CryptoPaymentForm orderData={orderData} onComplete={handlePaymentComplete} />
            )}

            {/* Confirmation */}
            {paymentStep === "confirmation" && (
              <div className="bg-card border border-border rounded-lg p-8 text-center space-y-6">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                  <Check className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-foreground mb-2">Payment Received!</h2>
                  <p className="text-foreground/70">Your order has been confirmed and will be processed shortly.</p>
                </div>

                <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 text-left space-y-3">
                  <div>
                    <p className="text-sm text-foreground/60 mb-1">Order ID</p>
                    <p className="font-mono text-lg text-accent">{orderData?.orderId || "ORD-2025-001"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-foreground/60 mb-1">Estimated Delivery</p>
                    <p className="text-foreground">5-7 business days</p>
                  </div>
                </div>

                <div className="bg-background border border-border rounded-lg p-4">
                  <p className="text-sm text-foreground/70 mb-3">Confirmation email sent to:</p>
                  <p className="font-semibold text-foreground">{shippingData.email}</p>
                </div>

                <div className="flex gap-3">
                  <Link href="/thank-you" className="flex-1">
                    <Button className="w-full bg-primary hover:bg-primary/90">View Order Details</Button>
                  </Link>
                  <Link href="/" className="flex-1">
                    <Button
                      variant="outline"
                      className="w-full border-accent text-accent hover:bg-accent/10 bg-transparent"
                    >
                      Continue Shopping
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          {paymentStep !== "confirmation" && (
            <div className="lg:col-span-1">
              <div className="bg-card border border-border rounded-lg p-6 sticky top-24 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-4">Order Summary</h3>
                  <div className="space-y-3 mb-6 pb-6 border-b border-border">
                    <div className="flex justify-between text-sm">
                      <span className="text-foreground/70">Subtotal</span>
                      <span className="text-foreground">2.5 BTC</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-foreground/70">Shipping</span>
                      <span className="text-foreground">0.1 BTC</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-foreground/70">Tax</span>
                      <span className="text-foreground">0.2 BTC</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-foreground">Total</span>
                    <div>
                      <div className="text-2xl font-bold text-accent">2.8 BTC</div>
                      <div className="text-xs text-foreground/60">≈ $95,200</div>
                    </div>
                  </div>
                </div>

                {/* Security Badge */}
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 flex gap-3">
                  <Lock className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-foreground mb-1">Secure Checkout</p>
                    <p className="text-xs text-foreground/70">Crypto payments verified on blockchain</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
