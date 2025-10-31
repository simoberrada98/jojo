"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { H3, Muted } from "@/components/ui/typography";
import {
  CreditCard,
  Wallet,
  Loader2,
  CheckCircle,
  XCircle,
} from "lucide-react";
import {
  createPaymentOrchestrator,
  PaymentMethod,
  PaymentStatus,
  type CheckoutData,
} from "@/lib/payment";
import { useCurrency } from "@/lib/contexts/currency-context";
import { APP_CONFIG } from "@/lib/config/app.config";

interface HoodPayCheckoutFormProps {
  orderData: {
    items: any[];
    subtotal: number;
    shipping: number;
    tax: number;
    total: number;
    shippingData: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      address: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
  };
  onComplete: () => void;
}

type PaymentMethodOption = "hoodpay" | "web-payment" | "crypto-manual";

export default function HoodPayCheckoutForm({
  orderData,
  onComplete,
}: HoodPayCheckoutFormProps) {
  const { currency } = useCurrency();
  const hoodPayEnabled = APP_CONFIG.features.enableHoodPay;
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodOption>(
    hoodPayEnabled ? "hoodpay" : "web-payment"
  );
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<
    "idle" | "processing" | "success" | "failed"
  >("idle");
  const [webPaymentSupported, setWebPaymentSupported] = useState(false);

  useEffect(() => {
    // Check if Web Payment API is available
    if (typeof window !== "undefined" && "PaymentRequest" in window) {
      setWebPaymentSupported(true);
    }
  }, []);

  const paymentMethods = useMemo(
    () =>
      [
        {
          id: "hoodpay" as const,
          name: "Crypto Payment",
          description: "Pay with crypto",
          icon: Wallet,
          available: hoodPayEnabled,
        },
        {
          id: "web-payment" as const,
          name: "Card / Digital Wallet",
          description: "Apple Pay, Google Pay, or Card",
          icon: CreditCard,
          available: webPaymentSupported,
        },
      ] satisfies Array<{
        id: PaymentMethodOption;
        name: string;
        description: string;
        icon: typeof Wallet | typeof CreditCard;
        available: boolean;
      }>,
    [hoodPayEnabled, webPaymentSupported]
  );

  const activeMethod = useMemo(
    () => paymentMethods.find((method) => method.id === selectedMethod),
    [paymentMethods, selectedMethod]
  );

  const hasAvailableMethod = paymentMethods.some((method) => method.available);

  useEffect(() => {
    const firstAvailable = paymentMethods.find((method) => method.available);
    if (
      firstAvailable &&
      !paymentMethods.some(
        (method) => method.id === selectedMethod && method.available
      )
    ) {
      setSelectedMethod(firstAvailable.id);
    }
  }, [paymentMethods, selectedMethod]);

  const handleHoodPayPayment = async () => {
    setProcessing(true);
    setError(null);
    setPaymentStatus("processing");

    try {
      // Convert order data to CheckoutData format
      const checkoutData: CheckoutData = {
        items: orderData.items.map((item) => ({
          id: item.id || `item-${Math.random()}`,
          name: item.name || "Product",
          description: item.description,
          quantity: item.quantity || 1,
          unitPrice: item.price || 0,
          total: (item.price || 0) * (item.quantity || 1),
        })),
        subtotal: orderData.subtotal,
        tax: orderData.tax,
        shipping: orderData.shipping,
        total: orderData.total,
        currency: currency,
        customerInfo: {
          email: orderData.shippingData.email,
          name: `${orderData.shippingData.firstName} ${orderData.shippingData.lastName}`,
          phone: orderData.shippingData.phone,
          address: {
            line1: orderData.shippingData.address,
            city: orderData.shippingData.city,
            state: orderData.shippingData.state,
            postalCode: orderData.shippingData.zipCode,
            country: orderData.shippingData.country,
          },
        },
      };

      // Initialize payment orchestrator
      const orchestrator = createPaymentOrchestrator({
        hooks: {
          onCompleted: async (event) => {
            console.log("Payment completed:", event);
            setPaymentStatus("success");
            setTimeout(() => onComplete(), 2000);
          },
          onFailed: async (event) => {
            console.error("Payment failed:", event);
            setPaymentStatus("failed");
            setError(event.data?.error?.message || "Payment failed");
          },
        },
      });

      // Initialize payment
      const paymentIntent = await orchestrator.initializePayment(
        orderData.total,
        currency,
        checkoutData,
        {
          customerEmail: orderData.shippingData.email,
          description: `Order for ${orderData.items.length} item(s)`,
        }
      );

      console.log("Payment intent created:", paymentIntent.id);

      // Process payment with HoodPay
      const result = await orchestrator.processPayment(PaymentMethod.HOODPAY, {
        redirectUrl: `${window.location.origin}/checkout/success`,
        notifyUrl: `${window.location.origin}/api/hoodpay/webhook`,
      });

      if (result.success && result.metadata?.paymentUrl) {
        // Redirect to HoodPay payment page
        window.location.href = result.metadata.paymentUrl;
      } else {
        throw new Error(result.error?.message || "Failed to create payment");
      }
    } catch (err: any) {
      console.error("Payment error:", err);
      setError(err.message || "Payment failed. Please try again.");
      setPaymentStatus("failed");
      setProcessing(false);
    }
  };

  const handleWebPayment = async () => {
    setProcessing(true);
    setError(null);
    setPaymentStatus("processing");

    try {
      const checkoutData: CheckoutData = {
        items: orderData.items.map((item) => ({
          id: item.id || `item-${Math.random()}`,
          name: item.name || "Product",
          quantity: item.quantity || 1,
          unitPrice: item.price || 0,
          total: (item.price || 0) * (item.quantity || 1),
        })),
        subtotal: orderData.subtotal,
        tax: orderData.tax,
        shipping: orderData.shipping,
        total: orderData.total,
        currency: currency,
      };

      const orchestrator = createPaymentOrchestrator({
        hooks: {
          onCompleted: async () => {
            setPaymentStatus("success");
            setTimeout(() => onComplete(), 2000);
          },
          onFailed: async (event) => {
            setPaymentStatus("failed");
            setError(event.data?.error?.message || "Payment failed");
          },
        },
      });

      await orchestrator.initializePayment(
        orderData.total,
        currency,
        checkoutData
      );
      const result = await orchestrator.processPayment(
        PaymentMethod.WEB_PAYMENT_API
      );

      if (result.success) {
        setPaymentStatus("success");
        setTimeout(() => onComplete(), 2000);
      } else {
        throw new Error(result.error?.message || "Payment failed");
      }
    } catch (err: any) {
      console.error("Web payment error:", err);
      setError(err.message || "Payment cancelled or failed");
      setPaymentStatus("failed");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Payment Method Selection */}
      <div className="bg-card p-6 border border-border rounded-lg">
        <H3 className="mb-4 text-lg">Select Payment Method</H3>
        <div className="gap-4 grid grid-cols-1">
          {paymentMethods.map((method) => {
            const Icon = method.icon;
            return (
              <button
                key={method.id}
                onClick={() => setSelectedMethod(method.id)}
                disabled={!method.available || processing}
                className={`p-4 rounded-lg border-2 transition text-left ${
                  selectedMethod === method.id
                    ? "border-accent bg-accent/10"
                    : "border-border hover:border-accent/50"
                } ${!method.available ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <div className="flex items-start gap-3">
                  <Icon className="mt-1 w-6 h-6 text-accent" />
                  <div className="flex-1">
                    <div className="font-semibold text-foreground">
                      {method.name}
                    </div>
                    <div className="text-foreground/60 text-sm">
                      {method.description}
                    </div>
                  </div>
                  {selectedMethod === method.id && (
                    <CheckCircle className="w-5 h-5 text-accent" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
        {!hoodPayEnabled && (
          <Muted className="mt-3 text-xs text-foreground/60">
            Crypto payments are currently unavailable. Choose another method or
            contact support to enable HoodPay.
          </Muted>
        )}
        {!hasAvailableMethod && (
          <Muted className="mt-3 text-xs text-destructive">
            No payment methods are currently available. Please reach out to
            support for assistance.
          </Muted>
        )}
      </div>

      {/* Payment Summary */}
      <div className="bg-card p-6 border border-border rounded-lg">
        <H3 className="mb-4 text-lg">Payment Summary</H3>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-foreground/70">Subtotal</span>
            <span className="text-foreground">
              ${orderData.subtotal.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-foreground/70">Shipping</span>
            <span className="text-foreground">
              ${orderData.shipping.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-foreground/70">Tax</span>
            <span className="text-foreground">${orderData.tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between pt-3 border-border border-t">
            <span className="font-semibold text-foreground">Total</span>
            <span className="font-bold text-accent text-xl">
              ${orderData.total.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex gap-3 bg-destructive/10 p-4 border border-destructive/20 rounded-lg">
          <XCircle className="mt-0.5 w-5 h-5 text-destructive shrink-0" />
          <div>
            <Muted className="mb-1 font-semibold text-destructive">
              Payment Error
            </Muted>
            <Muted className="m-0 text-destructive/80">{error}</Muted>
          </div>
        </div>
      )}

      {/* Status Messages */}
      {paymentStatus === "processing" && (
        <div className="flex gap-3 bg-primary/10 p-4 border border-primary/20 rounded-lg">
          <Loader2 className="mt-0.5 w-5 h-5 text-primary animate-spin shrink-0" />
          <div>
            <Muted className="mb-1 font-semibold text-foreground/80">
              Processing Payment
            </Muted>
            <Muted className="m-0 text-foreground/60">
              Please wait while we process your payment...
            </Muted>
          </div>
        </div>
      )}

      {paymentStatus === "success" && (
        <div className="flex gap-3 bg-green-500/10 p-4 border border-green-500/20 rounded-lg">
          <CheckCircle className="mt-0.5 w-5 h-5 text-green-500 shrink-0" />
          <div>
            <Muted className="mb-1 font-semibold text-green-500">
              Payment Successful!
            </Muted>
            <Muted className="m-0 text-green-500/80">
              Redirecting to confirmation...
            </Muted>
          </div>
        </div>
      )}

      {/* Payment Button */}
      <Button
        onClick={
          selectedMethod === "hoodpay" ? handleHoodPayPayment : handleWebPayment
        }
        disabled={
          processing || paymentStatus === "success" || !activeMethod?.available
        }
        className="bg-primary hover:bg-primary/90 py-6 w-full font-semibold text-primary-foreground text-lg"
      >
        {processing ? (
          <>
            <Loader2 className="mr-2 w-5 h-5 animate-spin" />
            Processing...
          </>
        ) : paymentStatus === "success" ? (
          <>
            <CheckCircle className="mr-2 w-5 h-5" />
            Payment Complete
          </>
        ) : (
          `Pay $${orderData.total.toFixed(2)}`
        )}
      </Button>

      {/* Security Notice */}
      <div className="bg-primary/10 p-4 border border-primary/20 rounded-lg">
        <Muted className="m-0 text-foreground/80 text-xs text-center">
          🔒 Secure payment processing powered by HoodPay. Your payment
          information is encrypted and secure.
        </Muted>
      </div>
    </div>
  );
}
