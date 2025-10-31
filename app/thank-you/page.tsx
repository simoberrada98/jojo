"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import PageLayout from "@/components/layout/PageLayout";
import OrderTracking from "@/components/order/OrderTracking";
import { Button } from "@/components/ui/button";
import { CheckCircle, Download, Mail, ArrowRight, Package } from "lucide-react";
import { useCart } from "@/lib/contexts/cart-context";
import { useCurrency } from "@/lib/contexts/currency-context";
import { calculatePricing } from "@/lib/utils/pricing";
import ProductImage from "@/components/product-image";
import { generateInvoicePDF } from "@/lib/utils/invoice";

function ThankYouContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { items, clearCart } = useCart();
  const { currency, formatPrice } = useCurrency();
  const [orderNumber, setOrderNumber] = useState<string>("");
  const [email, setEmail] = useState<string>("");

  // Get order details from URL or generate
  useEffect(() => {
    const orderId =
      searchParams.get("order") ||
      `MH-${Date.now().toString(36).toUpperCase()}`;
    const userEmail =
      searchParams.get("email") || localStorage.getItem("checkout_email") || "";

    setOrderNumber(orderId);
    setEmail(userEmail);

    // Clear cart after successful order
    if (items.length > 0 && searchParams.get("order")) {
      clearCart();
    }
  }, [searchParams, items, clearCart]);

  const { subtotal, shipping, tax, total } = calculatePricing(items);
  const estimatedDelivery = new Date(
    Date.now() + 7 * 24 * 60 * 60 * 1000
  ).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const handleDownloadInvoice = () => {
    if (items.length === 0) {
      alert("No items found. Please complete an order first.");
      return;
    }

    generateInvoicePDF({
      orderNumber,
      date: new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      email: email || "customer@example.com",
      items,
      subtotal,
      shipping,
      tax,
      total,
      currency,
      estimatedDelivery,
    });
  };

  return (
    <PageLayout>
      <main className="flex-1 pt-20">
        <section className="mx-auto px-4 sm:px-6 lg:px-8 py-16 max-w-2xl">
          {/* Success Icon */}
          <div className="mb-8 text-center">
            <div className="inline-flex justify-center items-center bg-success/20 mb-6 rounded-full w-20 h-20">
              <CheckCircle className="w-12 h-12 text-success" />
            </div>
            <h1 className="mb-4 font-bold text-foreground text-4xl md:text-5xl">
              Order Confirmed!
            </h1>
            <p className="text-muted-foreground text-lg">
              Thank you for your purchase. Your mining hardware is being
              prepared for shipment.
            </p>
          </div>

          {/* Order Details Card */}
          <div className="bg-card mb-8 p-8 border border-border rounded-lg">
            <div className="gap-8 grid grid-cols-1 md:grid-cols-2 mb-8">
              <div>
                <p className="mb-2 text-muted-foreground text-sm">
                  Order Number
                </p>
                <p className="font-mono font-bold text-foreground text-2xl">
                  {orderNumber}
                </p>
              </div>
              <div>
                <p className="mb-2 text-muted-foreground text-sm">
                  Estimated Delivery
                </p>
                <p className="font-bold text-foreground text-2xl">
                  {estimatedDelivery}
                </p>
              </div>
            </div>

            {/* Order Items */}
            {items.length > 0 && (
              <div className="mb-8 pt-8 border-border border-t">
                <h3 className="mb-4 font-semibold text-foreground text-lg">
                  Order Items
                </h3>
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      <div className="flex-shrink-0 rounded-lg w-20 h-20 overflow-hidden">
                        <ProductImage
                          category={item.category}
                          image={item.image}
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground">
                          {item.name}
                        </h4>
                        <p className="text-muted-foreground text-sm">
                          Quantity: {item.quantity}
                        </p>
                        <p className="font-medium text-accent text-sm">
                          ${(item.priceUSD * item.quantity).toLocaleString()}{" "}
                          USD
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-8 border-border border-t">
              <h3 className="mb-4 font-semibold text-foreground text-lg">
                Order Summary
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-foreground">Subtotal</span>
                  <span className="font-medium text-foreground">
                    ${subtotal.toLocaleString()} USD
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-foreground">Shipping</span>
                  <span className="font-medium text-foreground">
                    ${shipping.toLocaleString()} USD
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-foreground">Tax</span>
                  <span className="font-medium text-foreground">
                    ${tax.toFixed(2)} USD
                  </span>
                </div>
                <div className="flex justify-between items-center pt-3 border-border border-t">
                  <span className="font-bold text-foreground text-lg">
                    Total
                  </span>
                  <div className="text-right">
                    <div className="font-bold text-accent text-2xl">
                      {formatPrice(total)} {currency}
                    </div>
                    <div className="text-muted-foreground text-sm">
                      ${total.toLocaleString()} USD
                    </div>
                  </div>
                </div>
              </div>
              {email && (
                <div className="bg-primary/10 mt-6 p-4 border border-primary/20 rounded-lg">
                  <p className="text-foreground text-sm">
                    <Mail className="inline mr-2 w-4 h-4" />
                    Confirmation sent to:{" "}
                    <span className="font-semibold">{email}</span>
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Order Tracking */}
          <OrderTracking orderNumber={orderNumber} />

          {/* Next Steps */}
          <div className="mb-8 p-8 border border-border rounded-lg">
            <h3 className="mb-6 font-semibold text-foreground text-lg">
              What's Next?
            </h3>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex justify-center items-center bg-accent rounded-full w-8 h-8 font-semibold text-sm text-accent-foreground">
                    1
                  </div>
                </div>
                <div>
                  <p className="font-medium text-foreground">
                    Confirmation Email
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Check your email for order confirmation and tracking details
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex justify-center items-center bg-accent rounded-full w-8 h-8 font-semibold text-sm text-accent-foreground">
                    2
                  </div>
                </div>
                <div>
                  <p className="font-medium text-foreground">Preparation</p>
                  <p className="text-muted-foreground text-sm">
                    Your hardware will be tested and prepared for shipment
                    within 24-48 hours
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex justify-center items-center bg-accent rounded-full w-8 h-8 font-semibold text-sm text-accent-foreground">
                    3
                  </div>
                </div>
                <div>
                  <p className="font-medium text-foreground">Shipment</p>
                  <p className="text-muted-foreground text-sm">
                    Track your package in real-time with the provided tracking
                    number
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="gap-4 grid grid-cols-1 sm:grid-cols-2 mb-8">
            <Button
              onClick={handleDownloadInvoice}
              className="bg-accent hover:bg-accent/90 w-full text-accent-foreground"
            >
              <Download className="mr-2 w-4 h-4" />
              Download Invoice
            </Button>
            <Link href="/dashboard/orders" className="w-full">
              <Button variant="outline" className="bg-transparent w-full">
                <Package className="mr-2 w-4 h-4" />
                View All Orders
              </Button>
            </Link>
          </div>

          {/* Continue Shopping */}
          <div className="text-center">
            <p className="mb-4 text-muted-foreground">
              Ready to expand your mining operation?
            </p>
            <Link href="/collection">
              <Button
                variant="ghost"
                className="hover:bg-accent/10 text-accent hover:text-accent"
              >
                Continue Shopping
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </section>
      </main>
    </PageLayout>
  );
}

export default function ThankYouPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center bg-background min-h-screen">
          <div className="border-accent border-b-2 rounded-full w-12 h-12 animate-spin"></div>
        </div>
      }
    >
      <ThankYouContent />
    </Suspense>
  );
}
