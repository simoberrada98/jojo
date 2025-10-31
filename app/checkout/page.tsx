"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { H1, H2, H3, Muted } from "@/components/ui/typography";
import CryptoPaymentForm from "@/components/crypto-payment-form";
import HoodPayCheckoutForm from "@/components/hoodpay-checkout-form";
import OrderSummary from "@/components/order-summary";
import { ArrowLeft, Check, Truck, Lock, AlertCircle } from "lucide-react";
import Link from "next/link";
import PageLayout from "@/components/layout/PageLayout";
import { useCart } from "@/lib/contexts/cart-context";
import { useCurrency } from "@/lib/contexts/currency-context";
import { PricingService } from "@/lib/services/pricing.service";
import {
  loadCheckoutState,
  saveCheckoutState,
  clearCheckoutState,
} from "@/lib/utils/checkout-storage";

export default function CheckoutPage() {
  const { items } = useCart();
  const { currency, formatPrice } = useCurrency();
  const [paymentStep, setPaymentStep] = useState<
    "shipping" | "review" | "payment" | "confirmation"
  >("shipping");
  const [orderData, setOrderData] = useState<any>(null);
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
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasRestoredData, setHasRestoredData] = useState(false);

  // Load saved checkout state on mount
  useEffect(() => {
    const savedState = loadCheckoutState();
    if (savedState) {
      setShippingData(savedState.shippingData);
      if (savedState.paymentStep && savedState.paymentStep !== "confirmation") {
        setPaymentStep(savedState.paymentStep);
      }
      if (savedState.orderData) {
        setOrderData(savedState.orderData);
      }
      setHasRestoredData(true);
      // Hide the notification after 5 seconds
      setTimeout(() => setHasRestoredData(false), 5000);
    }
    setIsLoaded(true);
  }, []);

  // Save checkout state whenever it changes
  useEffect(() => {
    if (isLoaded && paymentStep !== "confirmation") {
      saveCheckoutState({
        shippingData,
        paymentStep,
        orderData,
      });
    }
  }, [shippingData, paymentStep, orderData, isLoaded]);

  const validateShipping = () => {
    const newErrors: Record<string, string> = {};
    if (!shippingData.firstName.trim())
      newErrors.firstName = "First name is required";
    if (!shippingData.lastName.trim())
      newErrors.lastName = "Last name is required";
    if (!shippingData.email.trim()) newErrors.email = "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shippingData.email))
      newErrors.email = "Invalid email";
    if (!shippingData.phone.trim()) newErrors.phone = "Phone is required";
    if (!shippingData.address.trim()) newErrors.address = "Address is required";
    if (!shippingData.city.trim()) newErrors.city = "City is required";
    if (!shippingData.state.trim()) newErrors.state = "State is required";
    if (!shippingData.zipCode.trim())
      newErrors.zipCode = "ZIP code is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleShippingSubmit = () => {
    if (validateShipping()) {
      setPaymentStep("review");
    }
  };

  const handleProceedToPayment = (data: any) => {
    setOrderData({ ...data, shippingData });
    setPaymentStep("payment");
  };

  const handlePaymentComplete = () => {
    setPaymentStep("confirmation");
    // Clear saved checkout data after successful payment
    clearCheckoutState();
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setShippingData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Calculate totals using shared utility
  const {
    subtotal,
    shipping,
    tax,
    total: totalAmount,
  } = PricingService.calculateCartSummary(items);

  return (
    <PageLayout>
      <main className="pt-20">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-6xl">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/cart"
              className="flex items-center gap-2 mb-6 text-accent hover:text-accent/80 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Cart
            </Link>
            <H1>Checkout</H1>

            {/* Restored data notification */}
            {hasRestoredData && (
              <div className="flex gap-3 bg-primary/10 slide-in-from-top-2 mt-4 p-4 border border-primary/20 rounded-lg animate-in duration-500 fade-in">
                <Check className="flex-shrink-0 mt-0.5 w-5 h-5 text-primary" />
                <div>
                  <Muted className="mb-1 font-semibold text-foreground text-sm">
                    Your progress has been restored
                  </Muted>
                  <Muted className="m-0 text-foreground/70 text-xs">
                    We've saved your information from your previous session
                  </Muted>
                </div>
              </div>
            )}
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center gap-2 sm:gap-4 mb-12 pb-2 overflow-x-auto">
            {[
              { step: "shipping", label: "Shipping", icon: Truck },
              { step: "review", label: "Review", icon: Check },
              { step: "payment", label: "Payment", icon: Lock },
              { step: "confirmation", label: "Confirmation", icon: Check },
            ].map((item, index) => {
              const Icon = item.icon;
              const isActive = paymentStep === item.step;
              const isCompleted =
                ["shipping", "review", "payment"].indexOf(paymentStep) >
                ["shipping", "review", "payment"].indexOf(item.step);

              return (
                <div
                  key={item.step}
                  className="flex flex-shrink-0 items-center gap-2 sm:gap-4"
                >
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold transition ${
                      isActive || isCompleted
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span
                    className={`text-sm font-medium whitespace-nowrap ${
                      isActive ? "text-foreground" : "text-foreground/60"
                    }`}
                  >
                    {item.label}
                  </span>
                  {index < 3 && (
                    <div
                      className={`w-8 sm:w-12 h-1 flex-shrink-0 ${
                        isCompleted ? "bg-primary" : "bg-border"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Content */}
          <div className="gap-8 grid grid-cols-1 lg:grid-cols-3">
            <div className="lg:col-span-2">
              {/* Shipping Address Form */}
              {paymentStep === "shipping" && (
                <div className="space-y-6 bg-card p-8 border border-border rounded-lg">
                  <div>
                    <H2 className="mb-2">Shipping Address</H2>
                    <Muted className="m-0">Enter your delivery address</Muted>
                  </div>

                  <div className="gap-4 grid grid-cols-1 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        type="text"
                        name="firstName"
                        value={shippingData.firstName}
                        onChange={handleInputChange}
                        aria-invalid={!!errors.firstName}
                        placeholder="John"
                      />
                      {errors.firstName && (
                        <Muted className="m-0 text-destructive">
                          {errors.firstName}
                        </Muted>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        type="text"
                        name="lastName"
                        value={shippingData.lastName}
                        onChange={handleInputChange}
                        aria-invalid={!!errors.lastName}
                        placeholder="Doe"
                      />
                      {errors.lastName && (
                        <Muted className="m-0 text-destructive">
                          {errors.lastName}
                        </Muted>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      name="email"
                      value={shippingData.email}
                      onChange={handleInputChange}
                      aria-invalid={!!errors.email}
                      placeholder="john@example.com"
                    />
                    {errors.email && (
                      <Muted className="m-0 text-destructive">
                        {errors.email}
                      </Muted>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      name="phone"
                      value={shippingData.phone}
                      onChange={handleInputChange}
                      aria-invalid={!!errors.phone}
                      placeholder="+1 (555) 000-0000"
                    />
                    {errors.phone && (
                      <Muted className="m-0 text-destructive">
                        {errors.phone}
                      </Muted>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      type="text"
                      name="address"
                      value={shippingData.address}
                      onChange={handleInputChange}
                      aria-invalid={!!errors.address}
                      placeholder="123 Main Street"
                    />
                    {errors.address && (
                      <Muted className="m-0 text-destructive">
                        {errors.address}
                      </Muted>
                    )}
                  </div>

                  <div className="gap-4 grid grid-cols-1 sm:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        type="text"
                        name="city"
                        value={shippingData.city}
                        onChange={handleInputChange}
                        aria-invalid={!!errors.city}
                        placeholder="New York"
                      />
                      {errors.city && (
                        <Muted className="m-0 text-destructive">
                          {errors.city}
                        </Muted>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        type="text"
                        name="state"
                        value={shippingData.state}
                        onChange={handleInputChange}
                        aria-invalid={!!errors.state}
                        placeholder="NY"
                      />
                      {errors.state && (
                        <Muted className="m-0 text-destructive">
                          {errors.state}
                        </Muted>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="zipCode">ZIP Code</Label>
                      <Input
                        id="zipCode"
                        type="text"
                        name="zipCode"
                        value={shippingData.zipCode}
                        onChange={handleInputChange}
                        aria-invalid={!!errors.zipCode}
                        placeholder="10001"
                      />
                      {errors.zipCode && (
                        <Muted className="m-0 text-destructive">
                          {errors.zipCode}
                        </Muted>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Select
                      name="country"
                      value={shippingData.country}
                      onValueChange={(value) =>
                        handleInputChange({
                          target: { name: "country", value },
                        } as any)
                      }
                    >
                      <SelectTrigger id="country">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="United States">
                          United States
                        </SelectItem>
                        <SelectItem value="Canada">Canada</SelectItem>
                        <SelectItem value="United Kingdom">
                          United Kingdom
                        </SelectItem>
                        <SelectItem value="Australia">Australia</SelectItem>
                        <SelectItem value="Germany">Germany</SelectItem>
                        <SelectItem value="France">France</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex gap-3 bg-primary/10 p-4 border border-primary/20 rounded-lg">
                    <AlertCircle className="flex-shrink-0 mt-0.5 w-5 h-5 text-primary" />
                    <Muted className="m-0 text-foreground/80">
                      We'll use this address to ship your mining hardware.
                      Ensure all details are correct.
                    </Muted>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={() => {
                        setShippingData({
                          firstName: "",
                          lastName: "",
                          email: "",
                          phone: "",
                          address: "",
                          city: "",
                          state: "",
                          zipCode: "",
                          country: "United States",
                        });
                        setErrors({});
                        clearCheckoutState();
                      }}
                      variant="outline"
                      className="bg-transparent hover:bg-accent/10 border-border text-foreground/70"
                    >
                      Clear Form
                    </Button>
                    <Button
                      onClick={handleShippingSubmit}
                      className="flex-1 bg-primary hover:bg-primary/90 py-3 font-semibold text-primary-foreground"
                    >
                      Continue to Review
                    </Button>
                  </div>
                </div>
              )}

              {/* Order Review */}
              {paymentStep === "review" && (
                <div className="space-y-6">
                  {/* Shipping Summary */}
                  <div className="bg-card p-6 border border-border rounded-lg">
                    <H3 className="mb-4 text-lg">Shipping Address</H3>
                    <div className="space-y-1 text-foreground/80">
                      <Muted className="m-0 text-foreground/80 text-base">
                        {shippingData.firstName} {shippingData.lastName}
                      </Muted>
                      <Muted className="m-0 text-foreground/80 text-base">
                        {shippingData.address}
                      </Muted>
                      <Muted className="m-0 text-foreground/80 text-base">
                        {shippingData.city}, {shippingData.state}{" "}
                        {shippingData.zipCode}
                      </Muted>
                      <Muted className="m-0 text-foreground/80 text-base">
                        {shippingData.country}
                      </Muted>
                      <Muted className="mt-3">{shippingData.email}</Muted>
                      <Muted className="m-0">{shippingData.phone}</Muted>
                    </div>
                    <Button
                      onClick={() => setPaymentStep("shipping")}
                      variant="outline"
                      className="bg-transparent hover:bg-accent/10 mt-4 border-accent w-full text-accent"
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
                <HoodPayCheckoutForm
                  orderData={{
                    ...orderData,
                    items: items,
                    subtotal,
                    shipping,
                    tax,
                    total: totalAmount,
                  }}
                  onComplete={handlePaymentComplete}
                />
              )}

              {/* Confirmation */}
              {paymentStep === "confirmation" && (
                <div className="space-y-6 bg-card p-8 border border-border rounded-lg text-center">
                  <div className="flex justify-center items-center bg-primary/20 mx-auto rounded-full w-16 h-16">
                    <Check className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <H2 className="mb-2">Payment Received!</H2>
                    <Muted className="m-0 text-foreground/70">
                      Your order has been confirmed and will be processed
                      shortly.
                    </Muted>
                  </div>

                  <div className="space-y-3 bg-primary/10 p-4 border border-primary/20 rounded-lg text-left">
                    <div>
                      <Muted className="mb-1">Order ID</Muted>
                      <Muted className="m-0 font-mono text-accent text-lg">
                        {orderData?.orderId || "ORD-2025-001"}
                      </Muted>
                    </div>
                    <div>
                      <Muted className="mb-1">Estimated Delivery</Muted>
                      <Muted className="m-0 text-foreground">
                        5-7 business days
                      </Muted>
                    </div>
                  </div>

                  <div className="bg-background p-4 border border-border rounded-lg">
                    <Muted className="mb-3">Confirmation email sent to:</Muted>
                    <Muted className="m-0 font-semibold text-foreground">
                      {shippingData.email}
                    </Muted>
                  </div>

                  <div className="flex gap-3">
                    <Link href="/thank-you" className="flex-1">
                      <Button className="bg-primary hover:bg-primary/90 w-full">
                        View Order Details
                      </Button>
                    </Link>
                    <Link href="/" className="flex-1">
                      <Button
                        variant="outline"
                        className="bg-transparent hover:bg-accent/10 border-accent w-full text-accent"
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
                <div className="top-24 sticky space-y-6 bg-card p-6 border border-border rounded-lg">
                  <div>
                    <H3 className="mb-4 text-lg">Order Summary</H3>
                    <div className="space-y-3 mb-6 pb-6 border-border border-b">
                      <div className="flex justify-between text-sm">
                        <span className="text-foreground/70">Subtotal</span>
                        <span className="text-foreground">
                          ${subtotal.toLocaleString()} USD
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-foreground/70">Shipping</span>
                        <span className="text-foreground">
                          ${shipping.toLocaleString()} USD
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-foreground/70">Tax</span>
                        <span className="text-foreground">
                          ${tax.toFixed(2)} USD
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-foreground">
                        Total
                      </span>
                      <div className="text-right">
                        <div className="font-bold text-accent text-2xl">
                          {formatPrice(totalAmount)} {currency}
                        </div>
                        <div className="text-foreground/60 text-xs">
                          ${totalAmount.toLocaleString()} USD
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Security Badge */}
                  <div className="flex gap-3 bg-primary/10 p-4 border border-primary/20 rounded-lg">
                    <Lock className="flex-shrink-0 mt-0.5 w-5 h-5 text-primary" />
                    <div>
                      <Muted className="mb-1 font-semibold text-foreground text-xs">
                        Secure Checkout
                      </Muted>
                      <Muted className="m-0 text-foreground/70 text-xs">
                        Crypto payments verified on blockchain
                      </Muted>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </PageLayout>
  );
}
