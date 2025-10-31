"use client";

import { Button } from "@/components/ui/button";
import { H3, H4, Muted } from "@/components/ui/typography";
import { Trash2 } from "lucide-react";
import ProductImage from "@/components/product-image";
import { OrderSummarySkeleton } from "@/components/checkout-skeleton";
import { useCart } from "@/lib/contexts/cart-context";
import { useCurrency } from "@/lib/contexts/currency-context";
import { calculatePricing } from "@/lib/utils/pricing";

interface OrderSummaryProps {
  onProceed: (data: any) => void;
}

export default function OrderSummary({ onProceed }: OrderSummaryProps) {
  const { items, removeItem, isHydrated } = useCart();
  const { currency, formatPrice } = useCurrency();

  if (!isHydrated) {
    return <OrderSummarySkeleton />;
  }

  // Calculate totals using shared utility
  const { subtotal, shipping, tax, total } = calculatePricing(items);

  const handleProceed = () => {
    if (items.length === 0) return;
    onProceed({
      items,
      subtotal,
      shipping,
      tax,
      total,
      orderId: `ORD-${Date.now()}`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Cart Items */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="p-6 border-border border-b">
          <H3 className="text-lg">Order Items</H3>
        </div>
        <div className="divide-y divide-border">
          {items.length === 0 ? (
            <div className="p-6 text-foreground/60 text-center">
              Your cart is empty
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex gap-4 p-6">
                <div className="rounded-lg w-20 h-20 overflow-hidden shrink-0">
                  <ProductImage category={item.category} image={item.image} />
                </div>
                <div className="flex-1">
                  <H4 className="mb-1 font-semibold">{item.name}</H4>
                  <Muted className="m-0 mb-2">Quantity: {item.quantity}</Muted>
                  <Muted className="m-0 font-semibold text-accent">
                    {formatPrice(item.priceUSD * item.quantity)} {currency}
                  </Muted>
                  <Muted className="m-0 text-xs">
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
      <div className="bg-card p-6 border border-border rounded-lg">
        <H3 className="mb-4 text-lg">Pricing Summary</H3>
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
            <span className="text-foreground/70">Tax (8%)</span>
            <span className="text-foreground">${tax.toFixed(2)} USD</span>
          </div>
        </div>
        <div className="flex justify-between items-center mb-6">
          <span className="font-semibold text-foreground">Total</span>
          <div className="text-right">
            <div className="font-bold text-accent text-2xl">
              {formatPrice(total)} {currency}
            </div>
            <div className="text-foreground/60 text-xs">
              ${total.toLocaleString()} USD
            </div>
          </div>
        </div>
        <Button
          onClick={handleProceed}
          disabled={items.length === 0}
          className="bg-primary hover:bg-primary/90 disabled:opacity-50 w-full font-semibold text-primary-foreground disabled:cursor-not-allowed"
        >
          Proceed to Payment
        </Button>
      </div>
    </div>
  );
}
